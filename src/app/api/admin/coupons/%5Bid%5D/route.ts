export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * Individual Coupon API
 * 개별 쿠폰 관리 API
 *
 * GET /api/admin/coupons/{id} - Get specific coupon
 * PUT /api/admin/coupons/{id} - Update coupon
 * DELETE /api/admin/coupons/{id} - Delete coupon
 */

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET - 특정 쿠폰 조회
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const params = await context.params;
    const couponId = params.id;

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', couponId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: '쿠폰을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        code: data.code,
        name: data.name,
        nameJa: data.name_ja,
        description: data.description,
        descriptionJa: data.description_ja,
        type: data.type,
        value: data.value,
        minimumOrderAmount: data.minimum_order_amount,
        maximumDiscountAmount: data.maximum_discount_amount,
        maxUses: data.max_uses,
        currentUses: data.current_uses,
        maxUsesPerCustomer: data.max_uses_per_customer,
        status: data.status,
        validFrom: data.valid_from,
        validUntil: data.valid_until,
        applicableCustomers: data.applicable_customers,
        applicableCustomerTypes: data.applicable_customer_types,
        createdBy: data.created_by,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    });
  } catch (error) {
    console.error('Coupon API error:', error);
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
 * PUT - 쿠폰 업데이트
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const params = await context.params;
    const couponId = params.id;

    const body = await request.json();
    const {
      name,
      nameJa,
      description,
      descriptionJa,
      type,
      value,
      minimumOrderAmount,
      maximumDiscountAmount,
      maxUses,
      maxUsesPerCustomer,
      status,
      validFrom,
      validUntil,
      applicableCustomers,
      applicableCustomerTypes,
      notes
    } = body;

    const supabase = createServiceClient();

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (nameJa !== undefined) updateData.name_ja = nameJa;
    if (description !== undefined) updateData.description = description;
    if (descriptionJa !== undefined) updateData.description_ja = descriptionJa;
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = value;
    if (minimumOrderAmount !== undefined) updateData.minimum_order_amount = minimumOrderAmount;
    if (maximumDiscountAmount !== undefined) updateData.maximum_discount_amount = maximumDiscountAmount;
    if (maxUses !== undefined) updateData.max_uses = maxUses;
    if (maxUsesPerCustomer !== undefined) updateData.max_uses_per_customer = maxUsesPerCustomer;
    if (status !== undefined) updateData.status = status;
    if (validFrom !== undefined) updateData.valid_from = validFrom;
    if (validUntil !== undefined) updateData.valid_until = validUntil;
    if (applicableCustomers !== undefined) updateData.applicable_customers = applicableCustomers;
    if (applicableCustomerTypes !== undefined) updateData.applicable_customer_types = applicableCustomerTypes;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', couponId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: '쿠폰 업데이트 실패', details: error?.message },
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
    });
  } catch (error) {
    console.error('Coupon update error:', error);
    return NextResponse.json(
      {
        error: '쿠폰 업데이트 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - 쿠폰 삭제
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const params = await context.params;
    const couponId = params.id;

    const supabase = createServiceClient();

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', couponId);

    if (error) {
      return NextResponse.json(
        { error: '쿠폰 삭제 실패', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '쿠폰이 삭제되었습니다'
    });
  } catch (error) {
    console.error('Coupon delete error:', error);
    return NextResponse.json(
      {
        error: '쿠폰 삭제 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
