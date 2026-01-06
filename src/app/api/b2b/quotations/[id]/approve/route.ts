/**
 * Quotation Approval API
 *
 * 견적 승인 API
 *
 * Allows customers to approve quotations
 * POST /api/b2b/quotations/[id]/approve - Approve a quotation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

// ============================================================
// Types
// ============================================================

interface ApprovalRequest {
  quotationId: string;
  notes?: string;
}

// ============================================================
// POST: Approve Quotation
// ============================================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quotationId = params.id;

    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // Get quotation data
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', quotationId)
      .single();

    if (quotationError || !quotation) {
      return NextResponse.json(
        { success: false, error: '견적을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (quotation.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // Check current status
    if (quotation.status !== 'SENT' && quotation.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: '승인할 수 없는 견적 상태입니다.' },
        { status: 400 }
      );
    }

    // Check if expired
    if (quotation.valid_until && new Date(quotation.valid_until) < new Date()) {
      return NextResponse.json(
        { success: false, error: '유효기간이 만료된 견적입니다.' },
        { status: 400 }
      );
    }

    // Parse request body for optional notes
    const body: ApprovalRequest = await request.json().catch(() => ({}));
    const { notes } = body;

    // Update quotation status to APPROVED
    const updateData: any = {
      status: 'APPROVED',
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data: updatedQuotation, error: updateError } = await supabase
      .from('quotations')
      .update(updateData)
      .eq('id', quotationId)
      .select()
      .single();

    if (updateError) {
      console.error('[Quotation Approval] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: '견적 승인 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // Notify admins via email (if email service is configured)
    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'get_admin_emails_for_approval_notification',
      userId: user.id,
      route: '/api/b2b/quotations/[id]/approve',
    });

    // Get admin emails
    const { data: admins } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('role', 'ADMIN');

    // Here you would send email notification to admins
    // For now, we'll just log it
    console.log('[Quotation Approval] Approved by customer:', {
      quotationId,
      quotationNumber: quotation.quotation_number,
      customerEmail: user.email,
      adminEmails: admins?.map((a: any) => a.email) || [],
    });

    return NextResponse.json({
      success: true,
      data: updatedQuotation,
      message: '견적이 승인되었습니다.',
    });
  } catch (error: any) {
    console.error('[Quotation Approval] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// ============================================================
// GET: Get Quotation Approval Status
// ============================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quotationId = params.id;

    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // Get quotation with items
    const { data: quotation, error } = await supabase
      .from('quotations')
      .select(`
        *,
        quotation_items (*),
        companies (
          id,
          name,
          name_kana
        )
      `)
      .eq('id', quotationId)
      .single();

    if (error || !quotation) {
      return NextResponse.json(
        { success: false, error: '견적을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (quotation.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // Check if can be approved
    const canApprove =
      quotation.status === 'SENT' || quotation.status === 'DRAFT';
    const isExpired =
      quotation.valid_until && new Date(quotation.valid_until) < new Date();

    return NextResponse.json({
      success: true,
      data: {
        quotation,
        approvalStatus: {
          canApprove,
          isExpired,
          currentStatus: quotation.status,
          validUntil: quotation.valid_until,
        },
      },
    });
  } catch (error: any) {
    console.error('[Quotation Approval] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
