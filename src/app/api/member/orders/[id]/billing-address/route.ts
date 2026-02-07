/**
 * Order Billing Address Update API
 *
 * 注文の請求先住所を更新するAPI
 * PUT /api/member/orders/[id]/billing-address
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

// ============================================================
// Types
// ============================================================

interface UpdateBillingAddressRequest {
  billingAddressId: string;
}

// ============================================================
// PUT Handler - Update Order Billing Address
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
    const body: UpdateBillingAddressRequest = await request.json();
    const { billingAddressId } = body;

    if (!billingAddressId) {
      return NextResponse.json(
        { error: '請求先IDが必要です', errorEn: 'Billing address ID is required' },
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

    // 請求先住所が存在するか確認
    const { data: billingAddress, error: addressError } = await supabase
      .from('billing_addresses')
      .select('*')
      .eq('id', billingAddressId)
      .eq('user_id', userId)
      .single();

    if (addressError || !billingAddress) {
      return NextResponse.json(
        { error: '請求先住所が見つかりません', errorEn: 'Billing address not found' },
        { status: 404 }
      );
    }

    // 注文の請求先住所を更新
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        billing_address_id: billingAddressId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select(`
        *,
        billing_addresses (
          id,
          company_name,
          postal_code,
          prefecture,
          city,
          address,
          building,
          tax_number,
          email,
          phone
        )
      `)
      .single();

    if (updateError) {
      console.error('[Billing Address Update] Error:', updateError);
      return NextResponse.json(
        { error: '住所の更新に失敗しました', errorEn: 'Failed to update address' },
        { status: 500 }
      );
    }

    // レスポンス用にデータを整形
    const responseData = {
      ...updatedOrder,
      billingAddress: updatedOrder.billing_addresses
        ? {
            id: updatedOrder.billing_addresses.id,
            companyName: updatedOrder.billing_addresses.company_name,
            postalCode: updatedOrder.billing_addresses.postal_code,
            prefecture: updatedOrder.billing_addresses.prefecture,
            city: updatedOrder.billing_addresses.city,
            address: updatedOrder.billing_addresses.address,
            building: updatedOrder.billing_addresses.building,
            taxNumber: updatedOrder.billing_addresses.tax_number,
            email: updatedOrder.billing_addresses.email,
            phone: updatedOrder.billing_addresses.phone,
          }
        : null,
    };

    // billing_addresses プロパティを削除
    delete (responseData as any).billing_addresses;

    return NextResponse.json({
      success: true,
      message: '請求先住所を更新しました',
      data: responseData,
    });
  } catch (error) {
    console.error('[Billing Address Update] Unexpected error:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました', errorEn: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
