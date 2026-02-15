/**
 * Apply Coupon API
 * クーポン適用API
 *
 * POST /api/member/orders/[id]/apply-coupon
 * - Validate and apply coupon to order
 * - Record coupon usage
 * - Update order totals
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// =====================================================
// Types
// =====================================================

interface ApplyCouponRequest {
  couponCode: string;
}

interface CouponValidationResult {
  valid: boolean;
  coupon?: {
    id: string;
    code: string;
    name: string;
    name_ja: string | null;
    type: 'percentage' | 'fixed_amount' | 'free_shipping';
    value: number;
    maximum_discount_amount: number | null;
    current_uses: number;
  };
  error?: string;
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Validate coupon code and return coupon data
 */
async function validateCoupon(
  supabase: any,
  code: string,
  userId: string,
  orderAmount: number
): Promise<CouponValidationResult> {
  // Find coupon by code
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error || !coupon) {
    return { valid: false, error: '存在しないクーポンコードです' };
  }

  // Check if coupon is active
  if (coupon.status !== 'active') {
    return { valid: false, error: 'このクーポンは無効です' };
  }

  // Check validity dates
  const now = new Date();
  const validFrom = new Date(coupon.valid_from);
  if (validFrom > now) {
    return { valid: false, error: 'このクーポンはまだ使用できません' };
  }

  if (coupon.valid_until) {
    const validUntil = new Date(coupon.valid_until);
    if (validUntil < now) {
      return { valid: false, error: 'このクーポンの有効期限が切れています' };
    }
  }

  // Check max uses
  if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
    return { valid: false, error: 'このクーポンの使用回数上限に達しました' };
  }

  // Check minimum order amount
  if (coupon.minimum_order_amount > 0 && orderAmount < coupon.minimum_order_amount) {
    return {
      valid: false,
      error: `最小注文金額 ${coupon.minimum_order_amount.toLocaleString()}円以上が必要です`
    };
  }

  // Check if user has exceeded per-customer limit
  if (coupon.max_uses_per_customer > 0) {
    const { data: usage, error: usageError } = await supabase
      .from('coupon_usage')
      .select('id')
      .eq('coupon_id', coupon.id)
      .eq('user_id', userId);

    if (!usageError && usage && usage.length >= coupon.max_uses_per_customer) {
      return { valid: false, error: 'このクーポンは既に使用済みです' };
    }
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      name_ja: coupon.name_ja,
      type: coupon.type,
      value: coupon.value,
      maximum_discount_amount: coupon.maximum_discount_amount,
      current_uses: coupon.current_uses,
    }
  };
}

/**
 * Calculate discount amount based on coupon type
 */
function calculateDiscount(
  coupon: CouponValidationResult['coupon'],
  orderAmount: number
): number {
  if (!coupon) return 0;

  let discountAmount = 0;

  switch (coupon.type) {
    case 'percentage':
      discountAmount = orderAmount * (coupon.value / 100);
      break;
    case 'fixed_amount':
      discountAmount = coupon.value;
      break;
    case 'free_shipping':
      // For free shipping, delivery cost is handled separately
      // Return 0 here - the caller will handle free shipping logic
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

  return discountAmount;
}

// =====================================================
// POST Handler
// =====================================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証されていません' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const { id: orderId } = await context.params;

    // Parse request body
    const body: ApplyCouponRequest = await request.json();
    const { couponCode } = body;

    if (!couponCode || couponCode.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'クーポンコードを入力してください' },
        { status: 400 }
      );
    }

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません' },
        { status: 404 }
      );
    }

    // Check if order already has a coupon applied
    if (order.coupon_id) {
      return NextResponse.json(
        { success: false, error: '既にクーポンが適用されています' },
        { status: 400 }
      );
    }

    // Check if order can be modified (only allow coupon for certain statuses)
    const allowedStatuses = ['PENDING', 'QUOTATION', 'DATA_RECEIVED'];
    if (!allowedStatuses.includes(order.status)) {
      return NextResponse.json(
        { success: false, error: 'この注文にはクーポンを適用できません' },
        { status: 400 }
      );
    }

    // Get original amount (subtotal or total_amount)
    const originalAmount = order.subtotal || order.total_amount || 0;

    // Validate coupon
    const validationResult = await validateCoupon(
      supabase,
      couponCode.trim(),
      userId,
      originalAmount
    );

    if (!validationResult.valid || !validationResult.coupon) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error || 'クーポンの検証に失敗しました'
        },
        { status: 400 }
      );
    }

    // Calculate discount
    const discountAmount = calculateDiscount(validationResult.coupon, originalAmount);
    const discountedTotal = originalAmount - discountAmount;

    // Update order with coupon information
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        coupon_id: validationResult.coupon.id,
        discount_amount: discountAmount,
        discount_type: validationResult.coupon.type,
        total_amount: discountedTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Order update error:', updateError);
      return NextResponse.json(
        { success: false, error: '注文の更新に失敗しました' },
        { status: 500 }
      );
    }

    // Record coupon usage
    const { error: usageError } = await supabase
      .from('coupon_usage')
      .insert({
        coupon_id: validationResult.coupon.id,
        user_id: userId,
        order_id: orderId,
        discount_amount: discountAmount,
        original_amount: originalAmount,
        final_amount: discountedTotal,
        used_at: new Date().toISOString(),
      });

    if (usageError) {
      console.error('Coupon usage recording error:', usageError);
      // Don't fail the request if usage recording fails, but log it
    }

    // Increment coupon current_uses
    const { error: incrementError } = await supabase
      .from('coupons')
      .update({
        current_uses: (validationResult.coupon.current_uses || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validationResult.coupon.id);

    if (incrementError) {
      console.error('Coupon increment error:', incrementError);
      // Don't fail the request if increment fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      discountAmount,
      discountedTotal,
      originalAmount,
      coupon: {
        id: validationResult.coupon.id,
        code: validationResult.coupon.code,
        name: validationResult.coupon.name_ja || validationResult.coupon.name,
        type: validationResult.coupon.type,
        value: validationResult.coupon.value,
      }
    });

  } catch (error) {
    console.error('Apply coupon API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'サーバーエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
