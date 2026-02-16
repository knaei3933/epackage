export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * Customer Markup Rate API
 * 고객별 마크업율 관리 API
 *
 * GET /api/admin/settings/customer-markup - Get all customers with markup rates
 * PUT /api/admin/settings/customer-markup?id={customerId} - Update customer markup rate
 */

/**
 * GET - 고객별 마크업율 목록 조회
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const supabase = createServiceClient();

    // Fetch all customers (simple query for debugging)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Customer markup fetch error:', error);
      return NextResponse.json(
        { error: '고객 할인율 조회 실패', details: error.message },
        { status: 500 }
      );
    }

    // Return raw data for debugging
    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Customer markup API error:', error);
    return NextResponse.json(
      {
        error: '고객 할인율 조회 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - 고객별 마크업율 업데이트
 * Query param: id (customerId)
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    // Get customer ID from query parameter
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId 파라미터가 필요합니다' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { markupRate, markupRateNote } = body;

    // Validation
    if (markupRate === undefined || typeof markupRate !== 'number') {
      return NextResponse.json(
        { error: 'markupRate는 숫자여야 합니다 (-0.5 - 0.0)' },
        { status: 400 }
      );
    }

    if (markupRate < -0.5 || markupRate > 0) {
      return NextResponse.json(
        { error: 'markupRate는 -0.5부터 0 사이여야 합니다 (-50% - 0%)' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const updateData: any = {
      markup_rate: markupRate
    };

    if (markupRateNote !== undefined) {
      updateData.markup_rate_note = markupRateNote;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', customerId)
      .select('id, email, company_name, markup_rate, markup_rate_note')
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: '할인율 업데이트 실패', details: error?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        email: data.email,
        companyName: data.company_name,
        markupRate: data.markup_rate,
        markupRateNote: data.markup_rate_note
      }
    });
  } catch (error) {
    console.error('Customer markup update error:', error);
    return NextResponse.json(
      {
        error: '할인율 업데이트 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
