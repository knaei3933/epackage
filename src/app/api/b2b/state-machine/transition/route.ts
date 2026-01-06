/**
 * Order State Machine API
 *
 * 주문 상태 머신 API
 * - POST: Request state transition
 * - GET: Get current state and history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import {
  executeTransition,
  canTransition,
  mapOrderStatusToState,
  mapStateToOrderStatus,
  DefaultStateMachineExecutor,
  OrderContext,
  OrderEvent,
  OrderState,
} from '@/lib/state-machine/order-machine';
import {
  detectEdgeCases,
  executeRecoveryActions,
  DefaultEdgeCaseExecutor,
} from '@/lib/state-machine/edge-case-handler';
import {
  recordStateChange,
  getStateHistory,
  getStateTimeline,
  generateStateChangeReport,
} from '@/lib/state-machine/history-service';
import {
  createApprovalRequest,
  approveRequest,
  rejectRequest,
  getPendingApprovals,
  formatApprovalRequest,
} from '@/lib/state-machine/approval-workflow';

// ============================================================
// Types
// ============================================================

interface StateTransitionRequestBody {
  orderId: string;
  event: OrderEvent['type'];
  eventData?: any;
  reason?: string;
}

interface StateTransitionResponseBody {
  success: boolean;
  message?: string;
  transition?: {
    from: OrderState;
    to: OrderState;
    allowed: boolean;
    requiresApproval: boolean;
    approvalRequestId?: string;
  };
  error?: string;
}

// ============================================================
// POST Handler - Request State Transition
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        } as StateTransitionResponseBody,
        { status: 401 }
      );
    }

    // Parse request body
    const body: StateTransitionRequestBody = await request.json();

    if (!body.orderId || !body.event) {
      return NextResponse.json(
        {
          success: false,
          error: 'orderId and event are required',
        } as StateTransitionResponseBody,
        { status: 400 }
      );
    }

    // Get order data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        profiles!orders_customer_id_fkey (
          id,
          email,
          kanji_last_name,
          kanji_first_name
        ),
        companies (
          name
        )
      `)
      .eq('id', body.orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        } as StateTransitionResponseBody,
        { status: 404 }
      );
    }

    // Build order context
    const context: OrderContext = {
      orderId: order.id,
      orderNumber: order.order_number,
      currentStatus: order.status,
      metadata: order.state_metadata || {},
      timestamps: {
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        quotedAt: order.state_metadata?.quotedAt,
        dataReceivedAt: order.state_metadata?.dataReceivedAt,
        workOrderCreatedAt: order.state_metadata?.workOrderCreatedAt,
        contractSentAt: order.state_metadata?.contractSentAt,
        contractSignedAt: order.state_metadata?.contractSignedAt,
        productionStartedAt: order.state_metadata?.productionStartedAt,
        stockInAt: order.state_metadata?.stockInAt,
        shippedAt: order.shipped_at || undefined,
        deliveredAt: order.delivered_at || undefined,
      },
      participants: {
        customerId: order.user_id,
        customerName: `${(order as any).profiles?.kanji_last_name || ''} ${(order as any).profiles?.kanji_first_name || ''}`.trim(),
        adminId: order.state_metadata?.adminId,
        adminName: order.state_metadata?.adminName,
        companyId: order.company_id || undefined,
        companyName: (order as any).companies?.name,
      },
      financial: {
        totalAmount: order.total_amount,
        currency: 'JPY',
      },
    };

    // Build event object
    const event: OrderEvent = {
      type: body.event,
      ...body.eventData,
    } as OrderEvent;

    // Get current state
    const currentState = mapOrderStatusToState(order.status);

    // Determine target state
    const targetState = determineTargetState(currentState, event);

    // Check edge cases
    const edgeCases = await detectEdgeCases(context, event, targetState);

    if (edgeCases.length > 0) {
      // Handle edge cases
      const executor = new DefaultEdgeCaseExecutor();
      const recovered = await executeRecoveryActions(edgeCases, executor);

      if (!recovered) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to recover from edge case',
          } as StateTransitionResponseBody,
          { status: 500 }
        );
      }
    }

    // Check if transition requires approval
    const requiresApproval = checkApprovalRequired(currentState, event);

    if (requiresApproval) {
      // Create approval request
      const approvalRequest = await createApprovalRequest({
        orderId: body.orderId,
        requestedBy: user.id,
        approvers: await buildApprovalChain(context, event),
        changeType: getChangeType(event),
        requestedChange: {
          fromState: currentState,
          toState: targetState,
          description: body.reason || `Transition from ${currentState} to ${targetState}`,
        },
      });

      // Return with approval required flag
      return NextResponse.json({
        success: true,
        message: 'Approval required for this transition',
        transition: {
          from: currentState,
          to: targetState,
          allowed: true,
          requiresApproval: true,
          approvalRequestId: approvalRequest.id,
        },
      } as StateTransitionResponseBody);
    }

    // Execute transition
    const executor = new DefaultStateMachineExecutor();
    const transition = await executeTransition(context, event, executor);

    if (!transition.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: transition.reason || 'Transition not allowed',
        } as StateTransitionResponseBody,
        { status: 400 }
      );
    }

    // Update order in database
    const newStatus = mapStateToOrderStatus(transition.to);
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        current_state: transition.to,
        state_metadata: {
          ...context.metadata,
          ...body.eventData,
        },
        updated_at: new Date().toISOString(),
        // Update specific timestamps based on state
        ...(transition.to === 'shipped' && { shipped_at: new Date().toISOString() }),
        ...(transition.to === 'delivered' && { delivered_at: new Date().toISOString() }),
      })
      .eq('id', body.orderId);

    if (updateError) {
      throw updateError;
    }

    // Record state change in history
    await recordStateChange({
      orderId: body.orderId,
      fromState: transition.from,
      toState: transition.to,
      event: event.type,
      eventData: body.eventData,
      changedBy: user.id,
      reason: body.reason,
      sideEffects: transition.sideEffects || [],
    });

    return NextResponse.json({
      success: true,
      message: `State transitioned from ${transition.from} to ${transition.to}`,
      transition,
    } as StateTransitionResponseBody);

  } catch (error) {
    console.error('State transition error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as StateTransitionResponseBody,
      { status: 500 }
    );
  }
}

// ============================================================
// GET Handler - Get State and History
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const format = searchParams.get('format') || 'json'; // json, timeline, report

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: 'orderId is required',
        },
        { status: 400 }
      );
    }

    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Get order data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Get current state
    const currentState = mapOrderStatusToState(order.status);

    // Return different formats based on query
    switch (format) {
      case 'timeline':
        const timeline = await getStateTimeline(orderId);
        return NextResponse.json({
          success: true,
          orderId,
          currentState,
          timeline,
        });

      case 'report':
        const report = await generateStateChangeReport(orderId);
        return NextResponse.json({
          success: true,
          report,
        });

      case 'json':
      default:
        const history = await getStateHistory(orderId);
        return NextResponse.json({
          success: true,
          orderId,
          orderNumber: order.order_number,
          currentState,
          currentStatus: order.status,
          history,
        });
    }

  } catch (error) {
    console.error('Get state error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// Helper Functions
// ============================================================

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

function getChangeType(event: OrderEvent): 'status_change' | 'modification' | 'cancellation' {
  if (event.type === 'CANCEL') {
    return 'cancellation';
  } else if (event.type === 'ROLLBACK') {
    return 'modification';
  }
  return 'status_change';
}

async function buildApprovalChain(
  context: OrderContext,
  event: OrderEvent
): Promise<string[]> {
  // In production, build approval chain based on amount and change type
  // For now, return admin approvers
  // Next.js 16: cookies() now returns a Promise and must be awaited
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'ADMIN');

  return (admins || []).map(a => a.id);
}
