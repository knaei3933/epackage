export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/supabase-ssr';

/**
 * Coupon Validation API
 * 쿠폰 검증 API (공개)
 *
 * POST /api/coupons/validate - Validate coupon code and calculate discount
 */

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { code, orderAmount } = body;

    // Validation
    if (!code) {
      return NextResponse.json(
        { error: '쿠폰 코드가 필요합니다' },
        { status: 400 }
      );
    }

    if (orderAmount === undefined || orderAmount < 0) {
      return NextResponse.json(
        { error: '유효하지 않은 주문 금액' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Find coupon by code
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !coupon) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: '존재하지 않는 쿠폰입니다'
      });
    }

    // Check if coupon is active
    if (coupon.status !== 'active') {
      return NextResponse.json({
        success: false,
        valid: false,
        error: '유효하지 않은 쿠폰입니다'
      });
    }

    // Check validity dates
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    if (validFrom > now) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: '아직 사용할 수 없는 쿠폰입니다'
      });
    }

    if (coupon.valid_until) {
      const validUntil = new Date(coupon.valid_until);
      if (validUntil < now) {
        return NextResponse.json({
          success: false,
          valid: false,
          error: '만료된 쿠폰입니다'
        });
      }
    }

    // Check max uses
    if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: '사용 가능한 횟수를 초과했습니다'
      });
    }

    // Check minimum order amount
    if (coupon.minimum_order_amount > 0 && orderAmount < coupon.minimum_order_amount) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: `최소 주문 금액 ${coupon.minimum_order_amount}엔 이상 필요합니다`,
        minimumOrderAmount: coupon.minimum_order_amount
      });
    }

    // Check if user has exceeded per-customer limit
    const user = await getAuthenticatedUser(request);
    if (user && coupon.max_uses_per_customer > 0) {
      const { data: usage, error: usageError } = await supabase
        .from('coupon_usage')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('user_id', user.id);

      if (!usageError && usage && usage.length >= coupon.max_uses_per_customer) {
        return NextResponse.json({
          success: false,
          valid: false,
          error: '이미 사용한 쿠폰입니다'
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;

    switch (coupon.type) {
      case 'percentage':
        discountAmount = orderAmount * (coupon.value / 100);
        break;
      case 'fixed_amount':
        discountAmount = coupon.value;
        break;
      case 'free_shipping':
        // For free shipping, delivery cost is calculated separately
        // Return 0 here, caller will handle free shipping
        discountAmount = 0;
        break;
    }

    // Apply maximum discount limit
    if (coupon.maximum_discount_amount && discountAmount > coupon.maximum_discount_amount) {
      discountAmount = coupon.maximum_discount_amount;
    }

    // Ensure discount doesn't exceed order amount
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }

    const finalAmount = orderAmount - discountAmount;

    return NextResponse.json({
      success: true,
      valid: true,
      data: {
        couponId: coupon.id,
        code: coupon.code,
        name: coupon.name,
        nameJa: coupon.name_ja,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
        originalAmount: orderAmount,
        finalAmount,
        isFreeShipping: coupon.type === 'free_shipping'
      }
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        error: '쿠폰 검증 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
