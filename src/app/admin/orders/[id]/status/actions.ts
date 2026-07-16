/**
 * Admin Order Status Update Server Action
 *
 * 管理者用注文ステータス更新 Server Action
 * - 認証: authenticateAdminAction（cookie ベース・order:update 権限必須・ACTIVE のみ）
 * - 状態遷移検証: isValidStatusTransition（14状態・正順）
 * - 監査ログ: order_status_history（本番存在テーブル）
 * - Server Componentから直接呼び出し可能
 *
 * 修正履歴:
 * - C-7: Server Action 本体で認証（「Server Component 側で認証済み」は誤前提）
 * - H-10: 旧 order-machine.ts（意味逆転）→ types/order-status.ts の isValidStatusTransition に統一
 * - C-5: audit_logs（本番未存在・サイレント失敗）→ order_status_history に統一
 * - H-13: changed_by 'ADMIN' ハードコード → 実行者 userId
 * - M-9: 機密情報を含む console.log を削減
 */

'use server';

import { createServiceClient } from '@/lib/supabase';
import { authenticateAdminAction } from '@/lib/auth-helpers';
import type { OrderStatus } from '@/types/order-status';
import { mapStatusToCurrentStage, isValidStatusTransition } from '@/types/order-status';
import { revalidatePath } from 'next/cache';
import { invalidateAdminDashboardCache } from '@/lib/cache-helpers';

interface UpdateStatusParams {
  orderId: string;
  status: OrderStatus;
  reason?: string;
  notifyCustomer?: boolean;
}

interface UpdateStatusResult {
  success: boolean;
  order?: any;
  message?: string;
  error?: string;
}

export async function updateOrderStatus(params: UpdateStatusParams): Promise<UpdateStatusResult> {
  const { orderId, status, reason, notifyCustomer = true } = params;

  // C-7: Server Action 用認証（cookie ベース・order:update 権限必須・ACTIVE のみ）
  // Server Action はフォーム経由でクライアントから直接起票可能なため、
  // 「Server Component 側で認証済み」という前提は成り立たない。本体で必ず認証する。
  const auth = await authenticateAdminAction(['order:update']);
  if (!auth) {
    return {
      success: false,
      error: '認証が必要です。',
    };
  }

  // 入力バリデーション
  if (!orderId || !status) {
    return {
      success: false,
      error: '注文IDとステータスは必須です。',
    };
  }

  try {
    // Service clientを使用（RLS回避・管理者権限）
    const supabase = createServiceClient();

    // 注文を取得
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, order_number, current_stage')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return {
        success: false,
        error: '注文が見つかりませんでした。',
      };
    }

    // H-10: 状態遷移検証（types/order-status.ts・14状態・正順）
    // 旧 order-machine.ts（mapOrderStatusToState/canTransition）は DATA_UPLOAD_PENDING→data_received
    // のように意味逆転があったため廃止。正当な遷移のみ許可する。
    const currentStatus = order.status as OrderStatus;
    if (!isValidStatusTransition(currentStatus, status)) {
      return {
        success: false,
        error: `ステータスを「${order.status}」から「${status}」に変更できません。無効なステータス遷移です。`,
      };
    }

    // ステータス更新
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: status,
        current_stage: mapStatusToCurrentStage(status),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      console.error('[updateOrderStatus] Failed to update status:', updateError);
      return {
        success: false,
        error: 'ステータスの更新に失敗しました。',
      };
    }

    // C-5 + H-13: 監査ログを order_status_history（本番存在テーブル）に記録
    // 旧 audit_logs は本番DBに未存在でサイレント失敗していた。changed_by は実行者 userId。
    try {
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        from_status: order.status,
        to_status: status,
        changed_by: auth.userId,
        reason: reason || 'Admin status update via Server Action',
      });
    } catch (auditError) {
      // 監査ログ失敗は業務更新の成功を崩さないが、警告として残す
      console.warn('[updateOrderStatus] Failed to record status history:', auditError);
    }

    // メール通知（TODO: 実装）
    void notifyCustomer;

    // キャッシュを再検証
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    // C2: ダッシュボードの unstable_cache（tags: admin-dashboard）無効化
    // orders.status UPDATE が ordersByStatus KPI に直結するため即時反映が必要
    invalidateAdminDashboardCache();

    return {
      success: true,
      order: updatedOrder,
      message: 'ステータスを更新しました。',
    };
  } catch (error) {
    console.error('[updateOrderStatus] Unexpected error:', error);
    return {
      success: false,
      error: '予期しないエラーが発生しました。',
    };
  }
}
