/**
 * Admin Chat Lead Contact Reveal API
 *
 * 管理者用リード連絡先開示API
 * Returns contact PII via audited RPC (writes audit event before returning).
 * Auth: active ADMIN/OPERATOR/SALES.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAuthMiddleware } from '@/lib/api-auth';
import { UserRole } from '@/types/auth';
import { revealChatLeadContact, isValidLeadUUID } from '@/lib/chat/lead-admin';

const NO_STORE = { 'Cache-Control': 'private, no-store' } as const;

const authMiddleware = createAuthMiddleware({
  useMemberAuth: true,
  requireActive: true,
  allowedRoles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SALES],
});

export async function POST(
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

    const result = await revealChatLeadContact({
      leadId,
      actorUserId: auth.userId,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: '連絡先を取得できませんでした。' },
        { status: 503, headers: NO_STORE },
      );
    }

    return NextResponse.json(
      { success: true, redacted: result.redacted, contact: result.contact ?? null },
      { headers: NO_STORE },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500, headers: NO_STORE },
    );
  }
}
