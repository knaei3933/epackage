/**
 * Admin Designer Task Assignment Cancel API
 * ============================================================
 * POST /api/admin/designer-task-assignments/[id]/cancel
 *
 * 管理者がデザインタスク割当をキャンセルし、アクセストークンを無効化する。
 * withAdminAuth が未認証 (401) / 非管理者 (403) を処理する。
 * 監査ログは cancelDesignerTask 内で出力される。
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-auth';
import { cancelDesignerTask } from '@/lib/designer-task-tokens';

// UUID v1-v5 形式（大文字小文字区別なし）
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const POST = (withAdminAuth as any)(async (
  request: NextRequest,
  auth: unknown,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: assignmentId } = await context.params;

    // UUID 形式検証
    if (!assignmentId || !UUID_REGEX.test(assignmentId)) {
      return NextResponse.json(
        { error: '無効な ID 形式です。', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const adminUserId = (auth as any)?.userId;
    const result = await cancelDesignerTask(assignmentId, {
      source: 'admin_manual',
      adminUserId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: '対象のタスク割当が見つかりません。', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, assignmentId, status: 'cancelled' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[designer-task-assignments/cancel] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
