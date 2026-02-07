/**
 * Order Delivery Address Update API
 *
 * 注文の納品先住所を更新するAPI
 * PUT /api/member/orders/[id]/delivery-address
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

// ============================================================
// Types
// ============================================================

interface UpdateDeliveryAddressRequest {
  deliveryAddressId: string;
}

// ============================================================
// PUT Handler - Update Order Delivery Address
// ============================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // ユーザーIDを取得（ミドルウェア経由）
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const userId = headersList.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません', errorEn: 'Not authenticated' },
        { status: 401 }
      );
    }

    // リクエストボディをパース
    const body: UpdateDeliveryAddressRequest = await request.json();
    const { deliveryAddressId } = body;

    if (!deliveryAddressId) {
      return NextResponse.json(
        { error: '納品先IDが必要です', errorEn: 'Delivery address ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // 注文の所有権を確認
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりません', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.user_id !== userId) {
      return NextResponse.json(
        { error: 'アクセス権限がありません', errorEn: 'Access denied' },
        { status: 403 }
      );
    }

    // 納品先住所が存在するか確認
    const { data: deliveryAddress, error: addressError } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('id', deliveryAddressId)
      .eq('user_id', userId)
      .single();

    if (addressError || !deliveryAddress) {
      return NextResponse.json(
        { error: '納品先住所が見つかりません', errorEn: 'Delivery address not found' },
        { status: 404 }
      );
    }

    // 注文の納品先住所を更新
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        delivery_address_id: deliveryAddressId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select(`
        *,
        delivery_addresses (
          id,
          name,
          postal_code,
          prefecture,
          city,
          address,
          building,
          phone,
          contact_person
        )
      `)
      .single();

    if (updateError) {
      console.error('[Delivery Address Update] Error:', updateError);
      return NextResponse.json(
        { error: '住所の更新に失敗しました', errorEn: 'Failed to update address' },
        { status: 500 }
      );
    }

    // レスポンス用にデータを整形
    const responseData = {
      ...updatedOrder,
      deliveryAddress: updatedOrder.delivery_addresses
        ? {
            id: updatedOrder.delivery_addresses.id,
            name: updatedOrder.delivery_addresses.name,
            postalCode: updatedOrder.delivery_addresses.postal_code,
            prefecture: updatedOrder.delivery_addresses.prefecture,
            city: updatedOrder.delivery_addresses.city,
            address: updatedOrder.delivery_addresses.address,
            building: updatedOrder.delivery_addresses.building,
            phone: updatedOrder.delivery_addresses.phone,
            contactPerson: updatedOrder.delivery_addresses.contact_person,
          }
        : null,
    };

    // delivery_addresses プロパティを削除
    delete (responseData as any).delivery_addresses;

    return NextResponse.json({
      success: true,
      message: '納品先住所を更新しました',
      data: responseData,
    });
  } catch (error) {
    console.error('[Delivery Address Update] Unexpected error:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました', errorEn: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
