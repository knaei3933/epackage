/**
 * Edge Case Handler for State Machine
 *
 * 상태 머신 에지 케이스 핸들러
 * Handle exceptional cases and edge scenarios in state transitions
 */

import { OrderContext, OrderEvent, OrderState, SideEffect } from '@/types/state-machine';

// ============================================================
// Edge Case Types
// ============================================================

export type EdgeCase =
  | 'concurrent_modification'
  | 'stale_state'
  | 'approval_expired'
  | 'rollback_limit_exceeded'
  | 'invalid_transition'
  | 'missing_context'
  | 'unauthorized_action'
  | 'system_failure'
  | 'timeout';

export interface EdgeCaseError {
  type: EdgeCase;
  message: string;
  details?: any;
  recovery?: RecoveryAction[];
}

export type RecoveryAction =
  | { type: 'retry'; delay?: number }
  | { type: 'rollback'; toState: OrderState }
  | { type: 'escalate'; to: string }
  | { type: 'notify'; recipients: string[]; message: string }
  | { type: 'manual_intervention'; reason: string };

// ============================================================
// Edge Case Detection
// ============================================================

/**
 * Detect edge cases in state transition
 * 상태 전환의 에지 케이스 감지
 */
export async function detectEdgeCases(
  context: OrderContext,
  event: OrderEvent,
  targetState: OrderState
): Promise<EdgeCaseError[]> {
  const errors: EdgeCaseError[] = [];

  // 1. Concurrent modification check
  if (await isConcurrentlyModified(context)) {
    errors.push({
      type: 'concurrent_modification',
      message: 'Order state has been modified by another process',
      details: { orderId: context.orderId, currentVersion: context.timestamps.updatedAt },
      recovery: [
        { type: 'retry', delay: 1000 },
        { type: 'notify', recipients: [context.participants.customerId], message: 'State conflict detected' },
      ],
    });
  }

  // 2. Stale state check
  if (await isStaleState(context)) {
    errors.push({
      type: 'stale_state',
      message: 'Order state is stale or outdated',
      details: { lastUpdate: context.timestamps.updatedAt },
      recovery: [{ type: 'retry' }],
    });
  }

  // 3. Approval expiry check
  if (await isApprovalExpired(context)) {
    errors.push({
      type: 'approval_expired',
      message: 'Required approval has expired',
      details: { approvalExpiresAt: context.validation?.approvedAt },
      recovery: [
        { type: 'escalate', to: 'admin' },
        { type: 'notify', recipients: [context.participants.adminId || 'admin'].filter(Boolean), message: 'Approval expired' },
      ],
    });
  }

  // 4. Rollback limit check
  if (await exceedsRollbackLimit(context, targetState)) {
    errors.push({
      type: 'rollback_limit_exceeded',
      message: 'Maximum rollback attempts exceeded',
      details: { maxRollbacks: 3 },
      recovery: [
        { type: 'manual_intervention', reason: 'Requires admin review' },
        { type: 'escalate', to: 'president' },
      ],
    });
  }

  // 5. Invalid transition check
  if (await isInvalidTransition(context, targetState)) {
    errors.push({
      type: 'invalid_transition',
      message: 'Requested state transition is not allowed',
      details: { currentState: context.currentStatus, targetState },
      recovery: [
        { type: 'notify', recipients: [context.participants.customerId], message: 'Invalid transition requested' },
      ],
    });
  }

  // 6. Missing context check
  if (await isMissingContext(context, targetState)) {
    errors.push({
      type: 'missing_context',
      message: 'Required context data is missing',
      details: { requiredFields: getRequiredContextFields(targetState) },
      recovery: [
        { type: 'escalate', to: 'admin' },
        { type: 'notify', recipients: [context.participants.customerId], message: 'Missing required data' },
      ],
    });
  }

  // 7. Unauthorized action check
  if (await isUnauthorizedAction(context, event)) {
    errors.push({
      type: 'unauthorized_action',
      message: 'User is not authorized to perform this action',
      details: { userId: (event as any).userId, requiredRole: getRequiredRoleForEvent(event) },
      recovery: [],
    });
  }

  return errors;
}

// ============================================================
// Edge Case Handlers
// ============================================================

/**
 * Handle concurrent modification
 * 동시 수정 처리
 */
async function isConcurrentlyModified(context: OrderContext): Promise<boolean> {
  // In production, check if state has been modified since last read
  // This would involve comparing the updatedAt timestamp with the current database state
  const now = new Date();
  const lastUpdate = new Date(context.timestamps.updatedAt);
  const staleThreshold = 5 * 60 * 1000; // 5 minutes

  return (now.getTime() - lastUpdate.getTime()) > staleThreshold;
}

/**
 * Handle stale state
 * 오래된 상태 처리
 */
async function isStaleState(context: OrderContext): Promise<boolean> {
  const now = new Date();
  const lastUpdate = new Date(context.timestamps.updatedAt);

  // Consider state stale if not updated in 24 hours
  const staleThreshold = 24 * 60 * 60 * 1000;
  return (now.getTime() - lastUpdate.getTime()) > staleThreshold;
}

/**
 * Handle expired approval
 * 만료된 승인 처리
 */
async function isApprovalExpired(context: OrderContext): Promise<boolean> {
  if (!context.validation?.approvedAt) {
    return false;
  }

  const now = new Date();
  const approvedAt = new Date(context.validation.approvedAt);
  const expiryThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days

  return (now.getTime() - approvedAt.getTime()) > expiryThreshold;
}

/**
 * Check rollback limit
 * 되돌아가기 제한 확인
 */
async function exceedsRollbackLimit(
  context: OrderContext,
  targetState: OrderState
): Promise<boolean> {
  // In production, count rollback attempts in history
  // For now, return false
  return false;
}

/**
 * Check if transition is invalid
 * 유효하지 않은 전환 확인
 */
async function isInvalidTransition(
  context: OrderContext,
  targetState: OrderState
): Promise<boolean> {
  const allowedTransitions: Record<string, OrderState[]> = {
    pending: ['quotation', 'cancelled'],
    quotation: ['data_received', 'cancelled'],
    data_received: ['work_order', 'quotation', 'cancelled'],
    work_order: ['contract_sent', 'data_received', 'cancelled'],
    contract_sent: ['contract_signed', 'work_order', 'cancelled'],
    contract_signed: ['production', 'contract_sent', 'cancelled'],
    production: ['stock_in', 'contract_signed', 'cancelled'],
    stock_in: ['shipped', 'production'],
    shipped: ['delivered', 'stock_in'],
    delivered: [],
    cancelled: [],
  };

  const currentState = mapStatusToState(context.currentStatus);
  const allowed = allowedTransitions[currentState] || [];

  return !allowed.includes(targetState);
}

/**
 * Check for missing context
 * 필수 컨텍스트 누락 확인
 */
async function isMissingContext(
  context: OrderContext,
  targetState: OrderState
): Promise<boolean> {
  const requiredFields = getRequiredContextFields(targetState);

  for (const field of requiredFields) {
    if (!(field in context) || context[field as keyof OrderContext] === undefined) {
      return true;
    }
  }

  return false;
}

/**
 * Check if action is unauthorized
 * 권한 없는 작업 확인
 */
async function isUnauthorizedAction(
  context: OrderContext,
  event: OrderEvent
): Promise<boolean> {
  // In production, check user permissions
  return false;
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Map OrderStatus to OrderState
 */
function mapStatusToState(status: string): OrderState {
  const mapping: Record<string, OrderState> = {
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
  return mapping[status] || 'pending';
}

/**
 * Get required context fields for a state
 */
function getRequiredContextFields(state: OrderState): string[] {
  const requiredFields: Record<OrderState, string[]> = {
    pending: ['orderId', 'participants'],
    quotation: ['orderId', 'participants', 'financial'],
    data_received: ['orderId', 'participants'],
    work_order: ['orderId', 'participants'],
    contract_sent: ['orderId', 'participants', 'metadata'],
    contract_signed: ['orderId', 'participants', 'metadata'],
    production: ['orderId', 'participants'],
    stock_in: ['orderId', 'participants'],
    shipped: ['orderId', 'participants', 'metadata'],
    delivered: ['orderId', 'participants'],
    cancelled: ['orderId', 'participants'],
  };

  return requiredFields[state] || [];
}

/**
 * Get required role for an event
 */
function getRequiredRoleForEvent(event: OrderEvent): string {
  // In production, map events to required roles
  return 'MEMBER';
}

// ============================================================
// Recovery Execution
// ============================================================

/**
 * Execute recovery actions
 * 복구 작업 실행
 */
export async function executeRecoveryActions(
  errors: EdgeCaseError[],
  executor: EdgeCaseExecutor
): Promise<boolean> {
  for (const error of errors) {
    if (!error.recovery) {
      continue;
    }

    for (const action of error.recovery) {
      const success = await executor.execute(action);
      if (!success) {
        console.error(`Failed to execute recovery action:`, action);
        return false;
      }
    }
  }

  return true;
}

/**
 * Edge case executor interface
 */
export interface EdgeCaseExecutor {
  execute(action: RecoveryAction): Promise<boolean>;
}

/**
 * Default edge case executor
 */
export class DefaultEdgeCaseExecutor implements EdgeCaseExecutor {
  async execute(action: RecoveryAction): Promise<boolean> {
    switch (action.type) {
      case 'retry':
        if (action.delay) {
          await new Promise(resolve => setTimeout(resolve, action.delay));
        }
        return true;

      case 'rollback':
        console.log('[ROLLBACK]', action.toState);
        return true;

      case 'escalate':
        console.log('[ESCALATE]', action.to);
        return true;

      case 'notify':
        console.log('[NOTIFY]', action.recipients, action.message);
        return true;

      case 'manual_intervention':
        console.log('[MANUAL INTERVENTION]', action.reason);
        return true;

      default:
        return false;
    }
  }
}

// ============================================================
// Timeout Handling
// ============================================================

/**
 * Set timeout for state transition
 * 상태 전환 타임아웃 설정
 */
export function setTimeoutForTransition(
  state: OrderState,
  callback: () => void
): NodeJS.Timeout {
  const timeouts: Record<OrderState, number> = {
    pending: 7 * 24 * 60 * 60 * 1000, // 7 days for registration
    quotation: 30 * 24 * 60 * 60 * 1000, // 30 days for quotation
    data_received: 14 * 24 * 60 * 60 * 1000, // 14 days for data
    work_order: 7 * 24 * 60 * 60 * 1000, // 7 days for work order
    contract_sent: 14 * 24 * 60 * 60 * 1000, // 14 days for contract
    contract_signed: 3 * 24 * 60 * 60 * 1000, // 3 days to start production
    production: 90 * 24 * 60 * 60 * 1000, // 90 days for production
    stock_in: 7 * 24 * 60 * 60 * 1000, // 7 days in stock
    shipped: 30 * 24 * 60 * 60 * 1000, // 30 days for delivery
    delivered: 0,
    cancelled: 0,
  };

  const timeout = timeouts[state];
  if (timeout > 0) {
    return setTimeout(callback, timeout);
  }

  return setTimeout(() => {}, 0); // Immediate
}

/**
 * Get timeout duration for a state
 */
export function getTimeoutDuration(state: OrderState): number {
  const timeouts: Record<OrderState, number> = {
    pending: 7 * 24 * 60 * 60 * 1000,
    quotation: 30 * 24 * 60 * 60 * 1000,
    data_received: 14 * 24 * 60 * 60 * 1000,
    work_order: 7 * 24 * 60 * 60 * 1000,
    contract_sent: 14 * 24 * 60 * 60 * 1000,
    contract_signed: 3 * 24 * 60 * 60 * 1000,
    production: 90 * 24 * 60 * 60 * 1000,
    stock_in: 7 * 24 * 60 * 60 * 1000,
    shipped: 30 * 24 * 60 * 60 * 1000,
    delivered: 0,
    cancelled: 0,
  };

  return timeouts[state];
}
