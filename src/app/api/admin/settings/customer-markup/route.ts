export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * Customer Markup Rate API
 * 고객별 마크업율 관리 API
 *
 * GET /api/admin/settings/customer-markup - Get all customers with markup rates
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

    // Simple query without order for debugging
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Customer markup fetch error:', error);
      return NextResponse.json(
        { error: '고객 마크업율 조회 실패', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data?.map(customer => ({
        id: customer.id,
        email: customer.email,
        fullName: customer.full_name,
        companyName: customer.company_name,
        role: customer.role,
        markupRate: customer.markup_rate || 0.5,
        markupRateNote: customer.markup_rate_note,
        createdAt: customer.created_at
      })) || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Customer markup API error:', error);
    return NextResponse.json(
      {
        error: '고객 마크업율 조회 실패',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
