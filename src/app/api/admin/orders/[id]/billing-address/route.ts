/**
 * Admin Order Billing Address Update API
 *
 * 管理者が注文の請求先住所を変更するAPI
 * - 会員が登録した請求先住所から選択
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { invalidateAdminDashboardCache } from '@/lib/cache-helpers';

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
    const { billingAddressId } = body;

    if (!billingAddressId) {
      return NextResponse.json(
        { success: false, error: '請求先住所IDは必須です' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // 청구지 주소 확인
    const { data: billingAddress, error: addressError } = await supabase
      .from('billing_addresses')
      .select('*')
      .eq('id', billingAddressId)
      .single();

    if (addressError || !billingAddress) {
      return NextResponse.json(
        { success: false, error: '請求先住所が見つかりません' },
        { status: 404 }
      );
    }

    // 주문의 청구지 변경
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({
        billing_address_id: billingAddressId,
        billing_address: billingAddress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select('*')
      .single();

    if (orderError) {
      console.error('[AdminOrderBillingAddress] Order update error:', orderError);
      return NextResponse.json(
        { success: false, error: '請求先住所の更新に失敗しました' },
        { status: 500 }
      );
    }

    // ダッシュボード統計の即時反映（C2・Phase 4-3・orders 請求先 UPDATE → orders KPI 直結）
    invalidateAdminDashboardCache();

    return NextResponse.json({
      success: true,
      data: {
        billingAddress: billingAddress,
        order: order,
      },
    });
  } catch (error) {
    console.error('[AdminOrderBillingAddress] Error:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
