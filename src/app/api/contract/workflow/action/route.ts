/**
 * Contract Workflow Action API
 *
 * 契約書ワークフローアクションAPI
 * - POST: ワークフローアクション実行（承認、拒否、送信等）
 * - ステータス変更、メール通知、履歴記録
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ContractWorkflowStatus, WorkflowAction } from '@/components/b2b/ContractApproval';

// ============================================================
// Types
// ============================================================

interface ActionRequestBody {
  contractId: string;
  action: WorkflowAction;
  userId: string;
  message?: string;
  timestamp?: string;
}

interface ActionResponseBody {
  success: boolean;
  status?: ContractWorkflowStatus;
  error?: string;
}

// ============================================================
// Workflow State Machine
// ============================================================

// @ts-ignore - Workflow transitions don't need all actions for each status
const WORKFLOW_TRANSITIONS: Record<
  ContractWorkflowStatus,
  Partial<Record<WorkflowAction, ContractWorkflowStatus | null>>
> = {
  draft: {
    send_to_buyer: 'pending_buyer_review',
    cancel: 'cancelled',
  },
  pending_seller_review: {
    approve: 'pending_seller_signature',
    reject: 'rejected',
    request_changes: 'draft',
    cancel: 'cancelled',
  },
  pending_buyer_review: {
    approve: 'pending_buyer_signature',
    reject: 'rejected',
    request_changes: 'draft',
    cancel: 'cancelled',
  },
  pending_seller_signature: {
    sign: 'pending_buyer_signature',
    cancel: 'cancelled',
  },
  pending_buyer_signature: {
    sign: 'pending_timestamp',
    cancel: 'cancelled',
  },
  pending_timestamp: {
    request_timestamp: 'active',
    cancel: 'cancelled',
  },
  active: {
    complete: 'completed',
  },
  completed: {},
  cancelled: {},
  rejected: {},
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * Validate workflow transition
 */
function validateTransition(
  currentStatus: ContractWorkflowStatus,
  action: WorkflowAction
): { valid: boolean; newStatus?: ContractWorkflowStatus; error?: string } {
  const transitions = WORKFLOW_TRANSITIONS[currentStatus];

  if (!transitions) {
    return {
      valid: false,
      error: `現在のステータス ${currentStatus} からの遷移は定義されていません`,
    };
  }

  const newStatus = transitions[action];

  if (newStatus === null || newStatus === undefined) {
    return {
      valid: false,
      error: `アクション ${action} は現在のステータス ${currentStatus} からは実行できません`,
    };
  }

  return { valid: true, newStatus };
}

/**
 * Record workflow history
 */
async function recordWorkflowHistory(
  contractId: string,
  action: WorkflowAction,
  fromStatus: ContractWorkflowStatus,
  toStatus: ContractWorkflowStatus,
  userId: string,
  message?: string
): Promise<void> {
  // In production, store in database
  // await db.workflowHistory.create({
  //   contractId,
  //   action,
  //   fromStatus,
  //   toStatus,
  //   userId,
  //   message,
  //   performedAt: new Date().toISOString(),
  // });

  console.log('Workflow history recorded:', {
    contractId,
    action,
    fromStatus,
    toStatus,
    userId,
    message,
  });
}

/**
 * Update contract status
 */
async function updateContractStatus(
  contractId: string,
  newStatus: ContractWorkflowStatus
): Promise<void> {
  // In production, update in database
  // await db.contracts.update({
  //   where: { id: contractId },
  //   data: { status: newStatus },
  // });

  console.log('Contract status updated:', { contractId, newStatus });
}

/**
 * Send notification email
 */
async function sendNotificationEmail(
  contractId: string,
  action: WorkflowAction,
  newStatus: ContractWorkflowStatus,
  message?: string
): Promise<void> {
  // In production, integrate with email service (SendGrid, etc.)
  // await emailService.send({
  //   to: getRecipientsForAction(action, contractId),
  //   subject: getSubjectForAction(action),
  //   template: 'contract-workflow-notification',
  //   data: { contractId, action, newStatus, message },
  // });

  console.log('Notification email sent:', { contractId, action, newStatus, message });
}

// ============================================================
// POST Handler - Execute Workflow Action
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ActionRequestBody;

    // Validate request
    if (!body.contractId || !body.action || !body.userId) {
      return NextResponse.json(
        {
          success: false,
          error: '必須パラメータが不足しています',
        } as ActionResponseBody,
        { status: 400 }
      );
    }

    // Get current contract status
    // In production, fetch from database
    const currentStatus: ContractWorkflowStatus = 'draft'; // Mock - fetch from DB

    // Validate transition
    const validation = validateTransition(currentStatus, body.action);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        } as ActionResponseBody,
        { status: 400 }
      );
    }

    const newStatus = validation.newStatus!;

    // Record history
    await recordWorkflowHistory(
      body.contractId,
      body.action,
      currentStatus,
      newStatus,
      body.userId,
      body.message
    );

    // Update contract status
    await updateContractStatus(body.contractId, newStatus);

    // Send notification
    await sendNotificationEmail(
      body.contractId,
      body.action,
      newStatus,
      body.message
    );

    return NextResponse.json({
      success: true,
      status: newStatus,
    } as ActionResponseBody);
  } catch (error) {
    console.error('Workflow action error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'アクションの実行に失敗しました',
      } as ActionResponseBody,
      { status: 500 }
    );
  }
}

// ============================================================
// OPTIONS Handler - CORS preflight
// ============================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
