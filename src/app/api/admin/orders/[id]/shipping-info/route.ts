/**
 * Admin Shipping Info API
 *
 * 管理者配送情報入力API
 * - shipments テーブルに配送情報を記録
 * - orders.status を SHIPPED に遷移
 * - order_status_history に履歴を記録
 *
 * @route /api/admin/orders/[id]/shipping-info
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

interface ShippingInfoResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const params = await context.params;
    const { id: orderId } = params;

    const body = await request.json();
    const { trackingNumber, shippingMethod, estimatedDelivery, carrierName } = body;

    if (!trackingNumber || !shippingMethod || !estimatedDelivery) {
      return NextResponse.json(
        {
          error: '送付状番号、配送業者、到着予定日は必須です。',
          errorEn: 'Tracking number, shipping method, and estimated delivery are required'
        },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Get current order status for history
    const { data: order } = await serviceClient
      .from('orders')
      .select('id, order_number, status')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json(
        { error: '注文が見つかりません。', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    // Create or update shipment record
    const shipmentNumber = `SHP-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

    const { error: shipmentError } = await serviceClient
      .from('shipments')
      .insert({
        order_id: orderId,
        shipment_number: shipmentNumber,
        tracking_number: trackingNumber,
        carrier_name: carrierName || shippingMethod,
        shipping_method: shippingMethod,
        estimated_delivery_date: estimatedDelivery,
        shipped_at: new Date().toISOString(),
        status: 'shipped',
      });

    if (shipmentError) {
      console.error('[Shipping Info] Shipment insert error:', shipmentError);
      return NextResponse.json(
        { error: '配送情報の登録に失敗しました。', errorEn: 'Failed to register shipment' },
        { status: 500 }
      );
    }

    // Update order status to SHIPPED
    const { error: updateError } = await serviceClient
      .from('orders')
      .update({
        status: 'SHIPPED',
        current_stage: 'SHIPPED',
        shipped_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Log to status history
    await serviceClient
      .from('order_status_history')
      .insert({
        order_id: orderId,
        from_status: order.status,
        to_status: 'SHIPPED',
        changed_by: auth.userId,
        changed_at: new Date().toISOString(),
        reason: '配送情報入力（管理者操作）',
      });

    const response: ShippingInfoResponse = {
      success: true,
      message: '配送情報を更新しました。',
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Shipping Info] Error:', error);
    return NextResponse.json(
      {
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
