/**
 * Admin Order Delivery Address Update API
 *
 * 管理者が注文の配送先住所を変更するAPI
 * - 会員が登録した配送先住所から選択
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 인증
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id: orderId } = await params;
    const body = await request.json();
    const { deliveryAddressId, customAddress } = body;

    console.log('[AdminOrderDeliveryAddress] Request:', {
      orderId,
      deliveryAddressId,
      customAddress,
      bodyKeys: Object.keys(body),
    });

    const supabase = createServiceClient();

    // UUID形式か注文番号かを判定して適切に注文を取得
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

    // 注文IDを取得（UUIDに変換）
    let actualOrderId = orderId;
    if (!isUuid) {
      // 注文番号からUUIDを取得
      const { data: orderData } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', orderId)
        .single();

      if (!orderData) {
        return NextResponse.json(
          { success: false, error: '注文が見つかりません' },
          { status: 404 }
        );
      }
      actualOrderId = orderData.id;
    }

    let deliveryAddress;

    // 기존 배송지 선택
    if (deliveryAddressId && !customAddress) {
      const { data: existingAddress, error: addressError } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('id', deliveryAddressId)
        .single();

      if (addressError || !existingAddress) {
        return NextResponse.json(
          { success: false, error: '配送先住所が見つかりません' },
          { status: 404 }
        );
      }
      deliveryAddress = existingAddress;
    }
    // 직접 입력한 배송지
    else if (customAddress) {
      deliveryAddress = customAddress;
    }
    else {
      return NextResponse.json(
        { success: false, error: '配送先住所IDまたはカスタム住所が必要です' },
        { status: 400 }
      );
    }

    // 주문의 배송지 변경
    const updateData: any = {
      delivery_address: deliveryAddress,
      updated_at: new Date().toISOString(),
    };

    // 기존 배송지 ID를 사용하는 경우에만 ID 업데이트
    if (deliveryAddressId) {
      updateData.delivery_address_id = deliveryAddressId;
    } else {
      updateData.delivery_address_id = null;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', actualOrderId)
      .select('*')
      .single();

    if (orderError) {
      console.error('[AdminOrderDeliveryAddress] Order update error:', orderError);
      return NextResponse.json(
        { success: false, error: '配送先住所の更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        deliveryAddress: deliveryAddress,
        order: order,
      },
    });
  } catch (error) {
    console.error('[AdminOrderDeliveryAddress] Error:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
