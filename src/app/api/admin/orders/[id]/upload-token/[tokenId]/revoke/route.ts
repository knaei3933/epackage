/**
 * Admin Order Upload Token Revoke API
 * ============================================================
 * POST /api/admin/orders/[id]/upload-token/[tokenId]/revoke
 *
 * 管理者が注文に紐づくデザイナーアップロードトークンを即時無効化する。
 * task 側の cancel API (designer-task-assignments/[id]/cancel) と対称で、
 * 期限切れ (30 日) を待たずに status を revoked にする。
 * withAdminAuth が未認証 (401) / 非管理者 (403) を処理する。
 * 監査ログは revokeUploadToken 内で出力される。
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-auth';
import { revokeUploadToken } from '@/lib/designer-upload-tokens';

// UUID v1-v5 形式（大文字小文字区別なし）
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const POST = (withAdminAuth as any)(async (
  request: NextRequest,
  auth: unknown,
  context: { params: Promise<{ id: string; tokenId: string }> }
) => {
  try {
    const { id: orderId, tokenId } = await context.params;

    // UUID 形式検証（orderId / tokenId 両方）
    if (!orderId || !UUID_REGEX.test(orderId) || !tokenId || !UUID_REGEX.test(tokenId)) {
      return NextResponse.json(
        { error: '無効な ID 形式です。', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const result = await revokeUploadToken(tokenId, {
      source: 'admin_manual',
      adminUserId: (auth as any)?.userId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: '対象のアップロードトークンが見つかりません。', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, tokenId, status: 'revoked' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[orders/upload-token/revoke] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
