/**
 * Admin Chat Leads API
 *
 * 管理者用チャットリード一覧API
 * Safe fields only — no contact PII in list responses.
 * Auth: active ADMIN/OPERATOR/SALES via createAuthMiddleware.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAuthMiddleware } from '@/lib/api-auth';
import { UserRole } from '@/types/auth';
import { listChatLeadsForStaff } from '@/lib/chat/lead-admin';

const NO_STORE = { 'Cache-Control': 'private, no-store' } as const;

const authMiddleware = createAuthMiddleware({
  useMemberAuth: true,
  requireActive: true,
  allowedRoles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SALES],
});

export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) return auth;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '20', 10) || 20;
    const status = searchParams.get('status') || undefined;
    const intent = searchParams.get('intent') || undefined;

    const result = await listChatLeadsForStaff({
      actorUserId: auth.userId,
      page,
      limit,
      status,
      intent,
    });
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'リード一覧を取得できませんでした。' },
        { status: 503, headers: NO_STORE },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.leads,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
      { headers: NO_STORE },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500, headers: NO_STORE },
    );
  }
}
