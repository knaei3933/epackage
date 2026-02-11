/**
 * Admin Order Status Update API Route
 *
 * 管理者用注文ステータス更新 API
 * - PUT: ステータス変更 (管理者専用)
 * - Service Role Keyを使用してRLSを回避
 *
 * Features:
 * - Direct database update with service role
 * - Type-safe status transitions
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import type { OrderStatus } from '@/types/order-status';

// ============================================================
// Types
// ============================================================

interface UpdateStatusRequest {
  status: OrderStatus;
  reason?: string;
  notifyCustomer?: boolean;
}

// ============================================================
// PUT: 注文ステータス更新（管理者専用）
// ============================================================

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: orderId } = params;

    console.log('[Admin Order Status] ========================================');
    console.log('[Admin Order Status] PUT request received');
    console.log('[Admin Order Status] Order ID:', orderId);

    const body = await request.json() as UpdateStatusRequest;
    const { status, reason, notifyCustomer = true } = body;

    // Validate new status
    if (!status) {
      return NextResponse.json(
        { error: 'ステータスは必須です。' },
        { status: 400 }
      );
    }

    // Service clientを使用（RLS回避）
    const supabase = createServiceClient();
    console.log('[Admin Order Status] Service client created');

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, order_number')
      .eq('id', orderId)
      .single();

    console.log('[Admin Order Status] Order query result:', {
      found: !!order,
      orderNumber: order?.order_number,
      currentStatus: order?.status,
      error: orderError?.message
    });

    if (orderError || !order) {
      console.error('[Admin Order Status] Order not found:', orderError);
      return NextResponse.json(
        { error: '注文が見つかりませんでした。' },
        { status: 404 }
      );
    }

    // Update order status
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
      console.error('[Admin Order Status] Failed to update status:', updateError);
      return NextResponse.json(
        { error: 'ステータスの更新に失敗しました。' },
        { status: 500 }
      );
    }

    // Create audit log entry
    try {
      await supabase
        .from('audit_logs')
        .insert({
          table_name: 'orders',
          record_id: orderId,
          action: 'UPDATE',
          old_value: { status: order.status },
          new_value: { status: status },
          changed_by: 'ADMIN',
          reason: reason || 'Admin status update',
        });
    } catch (auditError) {
      console.warn('[Admin Order Status] Failed to create audit log:', auditError);
    }

    console.log('[Admin Order Status] Order status updated:', {
      orderId,
      orderNumber: order.order_number,
      oldStatus: order.status,
      newStatus: status,
      reason,
    });

    return NextResponse.json({
      order: updatedOrder,
      message: 'ステータスを更新しました。',
    });
  } catch (error) {
    console.error('[Admin Order Status] PUT error:', error);

    return NextResponse.json(
      {
        error: 'ステータスの更新に失敗しました。',
      },
      { status: 500 }
    );
  }
}

// OPTIONSメソッド - CORS preflightリクエスト処理
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
