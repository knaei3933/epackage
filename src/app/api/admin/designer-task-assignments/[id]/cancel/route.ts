/**
 * Admin Designer Task Assignment Cancel API
 * ============================================================
 * POST /api/admin/designer-task-assignments/[id]/cancel
 *
 * 管理者がデザインタスク割当をキャンセルし、アクセストークンを無効化する。
 * withAdminAuth が未認証 (401) / 非管理者 (403) を処理する。
 * 監査ログは cancelDesignerTask 内で出力される。
 *
 * 冪等性（OQ-3・AC-4）:
 * - 新規キャンセル（affected>=1）→ 200
 * - 既に cancelled（affected=0・status='cancelled'）→ 200（idempotent）
 * - 対象が存在しない / completed 等 → 404
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-auth';
import { cancelDesignerTask } from '@/lib/designer-task-tokens';
import { createClient } from '@/lib/supabase/server';

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

    // 新規キャンセル成功
    if (result.success) {
      return NextResponse.json(
        { success: true, assignmentId, status: 'cancelled' },
        { status: 200 }
      );
    }

    // affected===0: 既に cancelled か、対象が存在しないか。
    // SELECT で現在の status を確認して冪等性を判定する（OQ-3・AC-4）。
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from('designer_task_assignments')
      .select('status')
      .eq('id', assignmentId)
      .maybeSingle();

    if (existing?.status === 'cancelled') {
      // 既にキャンセル済み: 2回目以降のリクエストは成功扱い（idempotent）
      return NextResponse.json(
        {
          success: true,
          assignmentId,
          status: 'cancelled',
          message: 'このタスク割当は既にキャンセル済みです。',
          idempotent: true,
        },
        { status: 200 }
      );
    }

    // 存在しない、または completed 等のキャンセル不可状態
    return NextResponse.json(
      { error: '対象のタスク割当が見つかりません。', code: 'NOT_FOUND' },
      { status: 404 }
    );
  } catch (error) {
    console.error('[designer-task-assignments/cancel] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
