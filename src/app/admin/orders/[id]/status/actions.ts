/**
 * Admin Order Status Update Server Action
 *
 * 管理者用注文ステータス更新 Server Action
 * - Server Componentから直接呼び出し可能
 * - 認証はServer Component側で処理済み
 * - State machine validation
 */

'use server';

import { createServiceClient } from '@/lib/supabase';
import {
  canTransition,
  mapOrderStatusToState,
} from '@/lib/state-machine/order-machine';
import type { OrderStatus } from '@/types/order-status';
import { revalidatePath } from 'next/cache';

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

  console.log('[Server Action] updateOrderStatus called:', { orderId, status, reason, notifyCustomer });

  // Validate input
  if (!orderId || !status) {
    console.error('[Server Action] Missing required params:', { orderId, status });
    return {
      success: false,
      error: '注文IDとステータスは必須です。',
    };
  }

  try {
    // Service clientを使用（RLS回避、管理者権限）
    const supabase = createServiceClient();
    console.log('[Server Action] Service client created, querying order...');

    // 注文を取得
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, order_number, current_state, state_metadata')
      .eq('id', orderId)
      .single();

    console.log('[Server Action] Order query result:', {
      order: order ? 'Found' : 'Not found',
      orderId: order?.id,
      orderNumber: order?.order_number,
      error: orderError?.message,
      details: orderError?.details
    });

    if (orderError || !order) {
      console.error('[Server Action] Order not found:', orderError);
      return {
        success: false,
        error: '注文が見つかりませんでした。',
      };
    }

    // State machineによる遷移検証
    const currentState = mapOrderStatusToState(order.status as OrderStatus);
    const targetState = mapOrderStatusToState(status);

    if (!canTransition(currentState, targetState)) {
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
        current_state: targetState,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      console.error('[Server Action] Failed to update status:', updateError);
      return {
        success: false,
        error: 'ステータスの更新に失敗しました。',
      };
    }

    // 監査ログ記録
    try {
      await supabase
        .from('audit_logs')
        .insert({
          table_name: 'orders',
          record_id: orderId,
          action: 'UPDATE',
          old_value: { status: order.status, current_state: order.current_state },
          new_value: { status: status, current_state: targetState },
          changed_by: 'ADMIN', // Server ActionなのでユーザーIDを取得せず
          reason: reason || 'Admin status update via Server Action',
        });
    } catch (auditError) {
      console.warn('[Server Action] Failed to create audit log:', auditError);
    }

    // メール通知（TODO: 実装）
    if (notifyCustomer) {
      console.log('[Server Action] Email notification would be sent to customer');
    }

    // キャッシュを再検証
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);

    console.log('[Server Action] Order status updated:', {
      orderId,
      orderNumber: order.order_number,
      oldStatus: order.status,
      newStatus: status,
      reason,
    });

    return {
      success: true,
      order: updatedOrder,
      message: 'ステータスを更新しました。',
    };
  } catch (error) {
    console.error('[Server Action] Unexpected error:', error);
    return {
      success: false,
      error: '予期しないエラーが発生しました。',
    };
  }
}
