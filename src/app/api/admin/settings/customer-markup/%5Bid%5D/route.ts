import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Individual Customer Markup Rate API
 * 개별 고객 마크업율 관리 API
 *
 * PUT /api/admin/settings/customer-markup/{id} - Update customer markup rate
 */

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PUT - 고객 마크업율 업데이트
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
    const customerId = params.id;

    const body = await request.json();
    const { markupRate, markupRateNote } = body;

    // Validation
    if (markupRate === undefined || typeof markupRate !== 'number') {
      return NextResponse.json(
        { error: 'markupRate는 숫자여야 합니다 (0.0 - 2.0)' },
        { status: 400 }
      );
    }

    if (markupRate < 0 || markupRate > 2) {
      return NextResponse.json(
        { error: 'markupRate는 0부터 2 사이여야 합니다 (0% - 200%)' },
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
      console.error('Customer markup update DB error:', error);
      return NextResponse.json(
        { error: '마크업율 업데이트 실패' },
        { status: 500 }
      );
    }

    // ダッシュボード統計の即時反映（C2・Phase 4-3・profiles UPDATE → activeCustomers KPI 即時反映）
    revalidatePath('/admin/dashboard');
    revalidateTag('admin-dashboard', 'max');

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
        error: '마크업율 업데이트 실패'
      },
      { status: 500 }
    );
  }
}
