/**
 * API Route: Customer Approval for Spec Sheet
 *
 * 사양서 고객 승인 API
 * - 고객이 사양서 승인
 * - 상태를 active로 변경
 * - 승인 정보 기록
 *
 * /api/b2b/spec-sheets/[id]/approve
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { sendSpecSheetApprovalEmail } from '@/lib/email';

// ============================================================
// Types
// ============================================================

interface ApproveSpecSheetRequest {
  comments?: string;
}

// ============================================================
// POST: Approve Spec Sheet
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: specSheetId } = await params;
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: ApproveSpecSheetRequest = await request.json();
    const { comments } = body;

    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'approve_spec_sheet',
      userId: user.id,
      route: '/api/b2b/spec-sheets/[id]/approve',
    });

    // Get spec sheet with order info
    const { data: specSheet, error: specError } = await supabaseAdmin
      .from('spec_sheets')
      .select(`
        *,
        work_orders (
          order_number,
          customer_name,
          customer_email,
          customer_company
        )
      `)
      .eq('id', specSheetId)
      .single();

    if (specError || !specSheet) {
      return NextResponse.json(
        { success: false, error: 'Spec sheet not found' },
        { status: 404 }
      );
    }

    // Check if already approved
    if (specSheet.status === 'active') {
      return NextResponse.json(
        { success: false, error: 'Spec sheet is already approved' },
        { status: 400 }
      );
    }

    // Update spec sheet status to active
    const { data: updatedSpec, error: updateError } = await supabaseAdmin
      .from('spec_sheets')
      .update({
        status: 'active',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        approval_notes: comments,
        effective_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', specSheetId)
      .select()
      .single();

    if (updateError || !updatedSpec) {
      console.error('[Spec Sheet Approval] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: updateError?.message || 'Failed to approve spec sheet' },
        { status: 500 }
      );
    }

    // Send notification email
    const workOrder = (specSheet as any).work_orders;
    if (workOrder?.customer_email) {
      try {
        await sendSpecSheetApprovalEmail(
          {
            specNumber: specSheet.spec_number,
            orderNumber: workOrder.order_number,
            customerName: workOrder.customer_name,
            approvedAt: new Date().toLocaleDateString('ja-JP'),
            comments,
          },
          workOrder.customer_email
        );
      } catch (emailError: any) {
        console.error('[Spec Sheet Approval] Email error:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        specSheetId: updatedSpec.id,
        specNumber: updatedSpec.spec_number,
        status: updatedSpec.status,
        approvedAt: updatedSpec.approved_at,
        message: '사양서가 승인되었습니다. 생산을 진행합니다.',
      },
    });
  } catch (error: any) {
    console.error('[Spec Sheet Approval] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
