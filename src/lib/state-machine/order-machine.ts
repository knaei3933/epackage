/**
 * B2B Order State Machine (XState-based)
 *
 * B2B 주문 상태 머신 구현
 * 10단계 주문 워크플로우 상태 전환 관리
 */

import {
  OrderContext,
  OrderEvent,
  OrderState,
  StateTransition,
  STATE_TRANSITIONS,
  ROLLBACK_ALLOWED,
  TERMINAL_STATES,
  SideEffect,
  STATE_METADATA,
  AutoTransition,
  AUTO_TRANSITIONS,
} from '@/types/state-machine';
import { OrderStatus } from '@/types/order-status';

// ============================================================
// State Transition Validator
// ============================================================

/**
 * Check if a state transition is allowed
 * 상태 전환이 허용되는지 확인
 */
export function canTransition(
  from: OrderState,
  to: OrderState
): boolean {
  // Check if transition is explicitly allowed
  const allowedStates = STATE_TRANSITIONS[from];
  if (!allowedStates.includes(to)) {
    return false;
  }

  // Check if source is a terminal state
  if (TERMINAL_STATES.includes(from)) {
    return false;
  }

  return true;
}

/**
 * Check if rollback is allowed
 * 되돌아가기 허용 여부 확인
 */
export function canRollback(
  from: OrderState,
  to: OrderState
): boolean {
  const allowedStates = ROLLBACK_ALLOWED[from];
  return allowedStates.includes(to);
}

/**
 * Get all possible next states
 * 가능한 다음 상태 목록 반환
 */
export function getNextStates(current: OrderState): OrderState[] {
  return STATE_TRANSITIONS[current] || [];
}

/**
 * Check if state is terminal
 * 최종 상태 여부 확인
 */
export function isTerminalState(state: OrderState): boolean {
  return TERMINAL_STATES.includes(state);
}

// ============================================================
// State Transition Executor
// ============================================================

/**
 * Execute state transition
 * 상태 전환 실행 (with side effects)
 */
export async function executeTransition(
  context: OrderContext,
  event: OrderEvent,
  executor: StateMachineExecutor
): Promise<StateTransition> {
  const from = mapOrderStatusToState(context.currentStatus);
  const to = determineTargetState(from, event);

  // Check if transition is allowed
  const allowed = canTransition(from, to);

  if (!allowed) {
    return {
      from,
      to,
      event: event.type,
      allowed: false,
      reason: `Cannot transition from ${from} to ${to}`,
      requiresApproval: false,
      sideEffects: [],
    };
  }

  // Check if approval is required
  const requiresApproval = checkApprovalRequired(from, event);

  if (requiresApproval) {
    return {
      from,
      to,
      event: event.type,
      allowed: true,
      requiresApproval: true,
      sideEffects: [
        {
          type: 'NOTIFY_PARTY',
          party: 'admin',
          message: `Approval required for transition from ${from} to ${to}`,
        },
      ],
    };
  }

  // Generate side effects
  const sideEffects = generateSideEffects(from, to, context, event);

  // Execute the transition
  try {
    await executor.executeSideEffects(sideEffects);

    return {
      from,
      to,
      event: event.type,
      allowed: true,
      requiresApproval: false,
      sideEffects,
    };
  } catch (error) {
    return {
      from,
      to,
      event: event.type,
      allowed: false,
      reason: `Failed to execute transition: ${error}`,
      requiresApproval: false,
      sideEffects: [],
    };
  }
}

/**
 * Determine target state from event
 * 이벤트에서 대상 상태 결정
 */
function determineTargetState(from: OrderState, event: OrderEvent): OrderState {
  switch (event.type) {
    case 'SUBMIT_QUOTATION':
      return 'quotation';
    case 'SUBMIT_DATA':
      return 'data_received';
    case 'CREATE_WORK_ORDER':
      return 'work_order';
    case 'SEND_CONTRACT':
      return 'contract_sent';
    case 'SIGN_CONTRACT':
      return 'contract_signed';
    case 'START_PRODUCTION':
      return 'production';
    case 'COMPLETE_PRODUCTION':
      return 'stock_in';
    case 'STOCK_IN':
      return 'stock_in';
    case 'SHIP':
      return 'shipped';
    case 'DELIVER':
      return 'delivered';
    case 'CANCEL':
      return 'cancelled';
    case 'ROLLBACK':
      return (event as any).toState || from;
    default:
      return from;
  }
}

/**
 * Check if transition requires approval
 * 승인 필요 여부 확인
 */
function checkApprovalRequired(from: OrderState, event: OrderEvent): boolean {
  // Rollback always requires approval
  if (event.type === 'ROLLBACK') {
    return true;
  }

  // Cancellation requires approval if not in early stages
  if (event.type === 'CANCEL' && !['pending', 'quotation'].includes(from)) {
    return true;
  }

  return false;
}

/**
 * Generate side effects for state transition
 * 상태 전환에 대한 부작용 생성
 */
function generateSideEffects(
  from: OrderState,
  to: OrderState,
  context: OrderContext,
  event: OrderEvent
): SideEffect[] {
  const effects: SideEffect[] = [];

  // Always create audit log
  effects.push({
    type: 'CREATE_AUDIT_LOG',
    action: `STATE_CHANGE: ${from} -> ${to}`,
    details: {
      orderId: context.orderId,
      event: event.type,
      eventData: event,
    },
  });

  // Always update database
  effects.push({
    type: 'UPDATE_DATABASE',
    table: 'orders',
    data: {
      id: context.orderId,
      status: mapStateToOrderStatus(to),
      current_state: to,
      updated_at: new Date().toISOString(),
    },
  });

  // Email notifications based on state
  switch (to) {
    case 'quotation':
      effects.push({
        type: 'SEND_EMAIL',
        to: [context.participants.customerId],
        template: 'quotation_ready',
        data: {
          orderId: context.orderId,
          orderNumber: context.orderNumber,
          amount: (event as any).amount || context.financial.totalAmount,
        },
      });
      break;

    case 'contract_sent':
      effects.push({
        type: 'SEND_EMAIL',
        to: [context.participants.customerId],
        template: 'contract_ready',
        data: {
          orderId: context.orderId,
          contractId: (event as any).contractId,
        },
      });
      break;

    case 'contract_signed':
      effects.push({
        type: 'SEND_EMAIL',
        to: [context.participants.adminId || 'admin'].filter(Boolean),
        template: 'contract_signed',
        data: {
          orderId: context.orderId,
          signedBy: (event as any).signedBy,
        },
      });
      break;

    case 'shipped':
      effects.push({
        type: 'SEND_EMAIL',
        to: [context.participants.customerId],
        template: 'order_shipped',
        data: {
          orderId: context.orderId,
          trackingNumber: (event as any).trackingNumber,
        },
      });
      break;

    case 'delivered':
      effects.push({
        type: 'SEND_EMAIL',
        to: [context.participants.customerId],
        template: 'order_delivered',
        data: {
          orderId: context.orderId,
          proofOfDelivery: (event as any).proofOfDelivery,
        },
      });
      break;

    case 'cancelled':
      effects.push({
        type: 'SEND_EMAIL',
        to: [context.participants.customerId, context.participants.adminId || 'admin'].filter(Boolean),
        template: 'order_cancelled',
        data: {
          orderId: context.orderId,
          reason: (event as any).reason,
        },
      });
      break;
  }

  // Webhook for external integrations
  effects.push({
    type: 'TRIGGER_WEBHOOK',
    url: `${process.env.WEBHOOK_URL || '/api/webhooks'}/order-status`,
    payload: {
      orderId: context.orderId,
      fromState: from,
      toState: to,
      timestamp: new Date().toISOString(),
    },
  });

  return effects;
}

// ============================================================
// State Machine Executor Interface
// ============================================================

/**
 * State machine executor interface
 */
export interface StateMachineExecutor {
  executeSideEffects(effects: SideEffect[]): Promise<void>;
  getStateHistory(orderId: string): Promise<any[]>;
  saveStateChange(change: any): Promise<void>;
}

/**
 * Default executor implementation
 */
export class DefaultStateMachineExecutor implements StateMachineExecutor {
  async executeSideEffects(effects: SideEffect[]): Promise<void> {
    for (const effect of effects) {
      await this.executeSideEffect(effect);
    }
  }

  private async executeSideEffect(effect: SideEffect): Promise<void> {
    switch (effect.type) {
      case 'SEND_EMAIL':
        // Email sending logic
        console.log('[EMAIL]', effect);
        break;

      case 'UPDATE_DATABASE':
        // Database update logic
        console.log('[DB UPDATE]', effect);
        break;

      case 'CREATE_AUDIT_LOG':
        // Audit log creation
        console.log('[AUDIT]', effect);
        break;

      case 'TRIGGER_WEBHOOK':
        // Webhook trigger
        try {
          await fetch(effect.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(effect.payload),
          });
        } catch (error) {
          console.error('Webhook error:', error);
        }
        break;

      case 'SCHEDULE_JOB':
        // Job scheduling
        console.log('[SCHEDULE]', effect);
        break;

      case 'NOTIFY_PARTY':
        // Party notification
        console.log('[NOTIFY]', effect);
        break;
    }
  }

  async getStateHistory(orderId: string): Promise<any[]> {
    // Implementation would fetch from database
    return [];
  }

  async saveStateChange(change: any): Promise<void> {
    // Implementation would save to database
    console.log('[SAVE STATE CHANGE]', change);
  }
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Map OrderStatus to OrderState
 */
export function mapOrderStatusToState(status: OrderStatus): OrderState {
  const mapping: Record<OrderStatus, OrderState> = {
    PENDING: 'pending',
    QUOTATION: 'quotation',
    DATA_RECEIVED: 'data_received',
    WORK_ORDER: 'work_order',
    CONTRACT_SENT: 'contract_sent',
    CONTRACT_SIGNED: 'contract_signed',
    PRODUCTION: 'production',
    STOCK_IN: 'stock_in',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  };
  return mapping[status];
}

/**
 * Map OrderState to OrderStatus
 */
export function mapStateToOrderStatus(state: OrderState): OrderStatus {
  const mapping: Record<OrderState, OrderStatus> = {
    pending: 'PENDING',
    quotation: 'QUOTATION',
    data_received: 'DATA_RECEIVED',
    work_order: 'WORK_ORDER',
    contract_sent: 'CONTRACT_SENT',
    contract_signed: 'CONTRACT_SIGNED',
    production: 'PRODUCTION',
    stock_in: 'STOCK_IN',
    shipped: 'SHIPPED',
    delivered: 'DELIVERED',
    cancelled: 'CANCELLED',
  };
  return mapping[state];
}

/**
 * Get state metadata
 */
export function getStateMetadata(state: OrderState) {
  return STATE_METADATA[state];
}

/**
 * Calculate state transition progress
 */
export function calculateProgress(currentState: OrderState): number {
  const states: OrderState[] = [
    'pending',
    'quotation',
    'data_received',
    'work_order',
    'contract_sent',
    'contract_signed',
    'production',
    'stock_in',
    'shipped',
    'delivered',
  ];

  const currentIndex = states.indexOf(currentState);
  if (currentIndex === -1) return 0; // cancelled or unknown

  return ((currentIndex + 1) / states.length) * 100;
}

/**
 * Get state flow for display
 */
export function getStateFlow(): Array<{ state: OrderState } & typeof STATE_METADATA[OrderState]> {
  const states: OrderState[] = [
    'pending',
    'quotation',
    'data_received',
    'work_order',
    'contract_sent',
    'contract_signed',
    'production',
    'stock_in',
    'shipped',
    'delivered',
  ];

  return states.map(state => ({
    state,
    ...STATE_METADATA[state],
  }));
}

/**
 * Check auto-transitions
 */
export function checkAutoTransitions(context: OrderContext): AutoTransition[] {
  const currentState = mapOrderStatusToState(context.currentStatus);
  return AUTO_TRANSITIONS.filter(
    transition => transition.from === currentState && transition.condition(context)
  );
}

// Re-export types for convenience
export type { OrderContext, OrderEvent, OrderState } from '@/types/state-machine';
