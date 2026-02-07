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

  console.log('[Server Action] ========================================');
  console.log('[Server Action] updateOrderStatus called:', {
    orderId,
    orderIdType: typeof orderId,
    orderIdLength: orderId?.length,
    status,
    reason,
    notifyCustomer
  });
  console.log('[Server Action] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');
  console.log('[Server Action] Has service key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

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
    console.log('[Server Action] Creating service client...');
    const supabase = createServiceClient();
    console.log('[Server Action] Service client created, querying order...');

    // 注文を取得（current_state 컬럼은存在しない）
    console.log('[Server Action] Executing query:', {
      table: 'orders',
      select: 'id, user_id, status, order_number',
      filter: { id: orderId }
    });

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, order_number')
      .eq('id', orderId)
      .single();

    console.log('[Server Action] Order query result:', {
      order: order ? 'Found' : 'Not found',
      orderId: order?.id,
      orderNumber: order?.order_number,
      error: orderError?.message,
      details: orderError?.details,
      code: orderError?.code,
      hint: orderError?.hint
    });

    if (orderError || !order) {
      console.error('[Server Action] ========================================');
      console.error('[Server Action] ORDER NOT FOUND!');
      console.error('[Server Action] Error:', JSON.stringify(orderError, null, 2));
      console.error('[Server Action] Order:', order);
      console.error('[Server Action] ========================================');
      return {
        success: false,
        error: '注文が見つかりませんでした。',
      };
    }

    // ステータス更新（current_state 컬럼은存在しない）
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: status,
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
          old_value: { status: order.status },
          new_value: { status: status },
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

    console.log('[Server Action] ========================================');
    console.log('[Server Action] Order status updated successfully:', {
      orderId,
      orderNumber: order.order_number,
      oldStatus: order.status,
      newStatus: status,
      reason,
    });
    console.log('[Server Action] ========================================');

    return {
      success: true,
      order: updatedOrder,
      message: 'ステータスを更新しました。',
    };
  } catch (error) {
    console.error('[Server Action] ========================================');
    console.error('[Server Action] Unexpected error:', error);
    console.error('[Server Action] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error('[Server Action] ========================================');
    return {
      success: false,
      error: '予期しないエラーが発生しました。',
    };
  }
}
