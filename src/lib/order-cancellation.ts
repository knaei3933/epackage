/**
 * Order Cancellation Helper
 * ============================================================
 * 注文キャンセル連動ヘルパ。
 *
 * orders.status が CANCELLED になった際、その注文に紐づく
 * designer_task_assignments（pending / in_progress）を一括で
 * キャンセルする共通処理を提供する。
 *
 * cancelDesignerTask（src/lib/designer-task-tokens.ts）を再利用し、
 * 3つのキャンセル経路（admin 承認 / member 直接 / admin 一括）から呼ばれる。
 *
 * 整合性方針: 緩い整合性。designer 側のキャンセル失敗は戻り値の errors に
 * 集約し、例外を投げない。注文キャンセル自体は維持する。
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { createClient } from '@/lib/supabase/server';
import { cancelDesignerTask } from '@/lib/designer-task-tokens';
import { logger } from '@/lib/logger';

/**
 * 注文キャンセル連動の実行主体（監査ログ用）
 *
 * source はキャンセル経路を識別する文字列:
 * - 'order_cancel_admin': 管理者によるキャンセル承認
 * - 'order_cancel_member': 会員による直接キャンセル
 * - 'order_bulk_status': 管理者による一括ステータス更新
 */
export interface OrderCancellationActor {
  source: string;
  adminUserId?: string;
  memberUserId?: string;
}

/**
 * 注文キャンセルに連動して designer_task_assignments をキャンセル
 *
 * 指定 orderId に紐づく pending / in_progress の割当をすべて取得し、
 * 各々 cancelDesignerTask でキャンセルする。1注文に複数デザイナーの
 * 割当が存在しうるため全件ループで処理する。
 *
 * @param orderId 注文ID
 * @param actor キャンセル実行主体（監査ログ用）
 * @returns cancelledCount: 成功した割当数 / errors: 個別失敗のエラー文字列
 */
export async function cancelDesignerTasksForOrder(
  orderId: string,
  actor: OrderCancellationActor,
  supabaseClient?: SupabaseClient<Database>
): Promise<{ cancelledCount: number; errors: string[] }> {
  const errors: string[] = [];

  // DI: 省略時は cookie ベースSSRクライアント（経路2 admin 向け・staff ポリシーで動作）。
  // 経路1（member）では createServiceClient（service role）を注入し RLS を回避すること。
  const supabase = supabaseClient ?? (await createClient());

  // 該当注文の pending / in_progress 割当を取得
  // （cancelDesignerTask 側でも status プレフィルタされるが、
  //   ここで対象を絞ることで無駄な UPDATE を回避する）
  const { data: assignments, error: fetchError } = await supabase
    .from('designer_task_assignments')
    .select('id')
    .eq('order_id', orderId)
    .in('status', ['pending', 'in_progress']);

  if (fetchError) {
    logger.error('order_cancellation.fetch_designer_tasks_failed', {
      orderId,
      actor,
      error: fetchError,
    });
    return { cancelledCount: 0, errors: [fetchError.message] };
  }

  const total = Array.isArray(assignments) ? assignments.length : 0;

  // 割当が無い場合はinfoログだけ出して終了
  if (total === 0) {
    logger.info('order_cancellation.no_designer_tasks', {
      orderId,
      actor,
      total: 0,
    });
    return { cancelledCount: 0, errors };
  }

  let cancelledCount = 0;
  for (const assignment of assignments ?? []) {
    // DI: 受け取った supabaseClient（省略時は cookie ベースSSR）をそのまま注入。
    // 経路1（member）では createServiceClient が伝播し RLS bypass で UPDATE 成功。
    // 経路2（admin）では cookie client が staff ポリシーで動作。
    // actor はそのまま渡す（memberUserId/adminUserId は監査ログに記録される）。
    const result = await cancelDesignerTask(assignment.id, actor, supabase);
    if (result.success) {
      cancelledCount += result.affectedRows > 0 ? result.affectedRows : 1;
    } else {
      errors.push(
        `assignment ${assignment.id}: cancel failed (affected=${result.affectedRows})`
      );
    }
  }

  logger.info('order_cancellation.designer_tasks_cancelled', {
    orderId,
    actor,
    cancelledCount,
    total,
  });

  return { cancelledCount, errors };
}
