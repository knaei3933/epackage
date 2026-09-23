/**
 * Member Chat Lead Status API
 *
 * 会員用リードステータス照会API
 * Returns only safe fields (id/status/outcome/handoff_state/updated_at).
 * Uses get_chat_lead_member_status RPC (enforces ownership).
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { resolveChatParticipantStrict } from '@/lib/chat/participant-context';
import { getChatLeadMemberStatus } from '@/lib/chat/lead-member';
import { isValidLeadUUID } from '@/lib/chat/lead-admin';

const NO_STORE = { 'Cache-Control': 'private, no-store' } as const;

export async function POST(request: NextRequest) {
  try {
    const participant = await resolveChatParticipantStrict(request);
    if (participant.status === 'infrastructure-error') {
      return NextResponse.json(
        { success: false, error: 'ただいま確認できません。' },
        { status: 503, headers: NO_STORE },
      );
    }

    if (
      participant.status !== 'active' ||
      participant.role !== 'MEMBER'
    ) {
      return NextResponse.json(
        { success: false, error: '会員のみ利用できます。' },
        { status: 403, headers: NO_STORE },
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

    const leadId = typeof body === 'object' && body !== null
      ? (body as Record<string, unknown>).leadId
      : undefined;

    if (typeof leadId !== 'string' || !isValidLeadUUID(leadId)) {
      return NextResponse.json(
        { success: false, error: '無効なリードIDです。' },
        { status: 400, headers: NO_STORE },
      );
    }

    const result = await getChatLeadMemberStatus({
      leadId,
      memberUserId: participant.userId,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'リードが見つかりません。' },
        { status: 404, headers: NO_STORE },
      );
    }

    return NextResponse.json(
      { success: true, data: result },
      { headers: NO_STORE },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500, headers: NO_STORE },
    );
  }
}
