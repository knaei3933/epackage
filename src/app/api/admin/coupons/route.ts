export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * Admin Coupons API
 * 관리자 쿠폰 관리 API
 *
 * GET /api/admin/coupons - Get all coupons
 * POST /api/admin/coupons - Create new coupon
 */

/**
 * GET - 쿠폰 목록 조회
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const supabase = createServiceClient();

    let query = supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Coupons fetch error:', error);
      return NextResponse.json(
        { error: '쿠폰 조회 실패', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data?.map(coupon => ({
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        nameJa: coupon.name_ja,
        description: coupon.description,
        descriptionJa: coupon.description_ja,
        type: coupon.type,
        value: coupon.value,
        minimumOrderAmount: coupon.minimum_order_amount,
        maximumDiscountAmount: coupon.maximum_discount_amount,
        maxUses: coupon.max_uses,
        currentUses: coupon.current_uses,
        maxUsesPerCustomer: coupon.max_uses_per_customer,
        status: coupon.status,
        validFrom: coupon.valid_from,
        validUntil: coupon.valid_until,
        applicableCustomers: coupon.applicable_customers,
        applicableCustomerTypes: coupon.applicable_customer_types,
        notes: coupon.notes,
        createdAt: coupon.created_at,
        updatedAt: coupon.updated_at
      })) || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Coupons API error:', error);
    return NextResponse.json(
      {
        error: '쿠폰 조회 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST - 새 쿠폰 생성
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const {
      code,
      name,
      nameJa,
      description,
      descriptionJa,
      type = 'percentage',
      value,
      minimumOrderAmount = 0,
      maximumDiscountAmount,
      maxUses,
      maxUsesPerCustomer = 1,
      status = 'active',
      validFrom,
      validUntil,
      applicableCustomers,
      applicableCustomerTypes,
      notes
    } = body;

    // Validation
    if (!code || !name || type === undefined || value === undefined) {
      return NextResponse.json(
        { error: '필수 필드 누락: code, name, type, value' },
        { status: 400 }
      );
    }

    if (!['percentage', 'fixed_amount', 'free_shipping'].includes(type)) {
      return NextResponse.json(
        { error: '유효하지 않은 쿠폰 타입' },
        { status: 400 }
      );
    }

    if (type === 'percentage' && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: 'percentage 타입은 0-100 사이여야 합니다' },
        { status: 400 }
      );
    }

    if (type === 'fixed_amount' && value < 0) {
      return NextResponse.json(
        { error: 'fixed_amount는 0 이상이어야 합니다' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        name,
        name_ja: nameJa,
        description,
        description_ja: descriptionJa,
        type,
        value,
        minimum_order_amount: minimumOrderAmount,
        maximum_discount_amount: maximumDiscountAmount,
        max_uses: maxUses,
        max_uses_per_customer: maxUsesPerCustomer,
        status,
        valid_from: validFrom || new Date().toISOString(),
        valid_until: validUntil,
        applicable_customers: applicableCustomers,
        applicable_customer_types: applicableCustomerTypes,
        created_by: auth.userId,
        notes
      })
      .select()
      .single();

    if (error) {
      console.error('Coupon creation error:', error);
      return NextResponse.json(
        { error: '쿠폰 생성 실패', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        code: data.code,
        name: data.name,
        type: data.type,
        value: data.value,
        status: data.status
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Coupons API error:', error);
    return NextResponse.json(
      {
        error: '쿠폰 생성 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
