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

    // Fetch all customers (excluding admin users)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, company_name, role, markup_rate, markup_rate_note, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Customer markup fetch error:', error);
      return NextResponse.json(
        { error: '고객 할인율 조회 실패', details: error.message },
        { status: 500 }
      );
    }

    // Transform data to match frontend interface
    const transformedData = (data || []).map(profile => ({
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      companyName: profile.company_name,
      role: profile.role,
      markupRate: profile.markup_rate ?? 0.0, // Default to 0.0 (no discount)
      markupRateNote: profile.markup_rate_note,
      createdAt: profile.created_at
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      count: transformedData.length
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
