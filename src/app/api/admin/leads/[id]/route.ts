/**
 * Admin Chat Lead Update API
 *
 * 管理者用リードステータス更新API
 * Uses audited update_chat_lead_workflow RPC.
 * Auth: active ADMIN/OPERATOR/SALES.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAuthMiddleware } from '@/lib/api-auth';
import { UserRole } from '@/types/auth';
import { updateChatLeadWorkflow, isValidLeadUUID } from '@/lib/chat/lead-admin';

const NO_STORE = { 'Cache-Control': 'private, no-store' } as const;

const authMiddleware = createAuthMiddleware({
  useMemberAuth: true,
  requireActive: true,
  allowedRoles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SALES],
});

const VALID_STATUSES = ['new', 'contacted', 'qualified', 'in_progress', 'closed_won', 'closed_lost', 'invalid'];
const VALID_OUTCOMES = ['pending', 'self_resolved', 'human_followup', 'converted', 'abandoned'];
const VALID_HANDOFF_STATES = ['none', 'requested', 'completed'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) return auth;

    const { id: leadId } = await params;
    if (!isValidLeadUUID(leadId)) {
      return NextResponse.json(
        { success: false, error: '無効なリードIDです。' },
        { status: 400, headers: NO_STORE },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'リクエスト形式が正しくありません。' },
        { status: 400, headers: NO_STORE },
      );
    }

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { success: false, error: 'リクエスト形式が正しくありません。' },
        { status: 400, headers: NO_STORE },
      );
    }

    const { status, outcome, handoffState } = body as Record<string, unknown>;
    if (
      typeof status !== 'string' || !VALID_STATUSES.includes(status) ||
      typeof outcome !== 'string' || !VALID_OUTCOMES.includes(outcome) ||
      typeof handoffState !== 'string' || !VALID_HANDOFF_STATES.includes(handoffState)
    ) {
      return NextResponse.json(
        { success: false, error: '無効なステータス値です。' },
        { status: 400, headers: NO_STORE },
      );
    }

    const result = await updateChatLeadWorkflow({
      leadId,
      actorUserId: auth.userId,
      status,
      outcome,
      handoffState,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: '更新できませんでした。' },
        { status: 503, headers: NO_STORE },
      );
    }

    if (!result.accepted || !result.lead) {
      return NextResponse.json(
        { success: false, error: 'リードが見つかりません。' },
        { status: 404, headers: NO_STORE },
      );
    }

    return NextResponse.json(
      { success: true, data: result.lead },
      { headers: NO_STORE },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500, headers: NO_STORE },
    );
  }
}
