/**
 * API Route: Customer Rejection for Spec Sheet
 *
 * 사양서 고객 반려/수정요청 API
 * - 고객이 사양서 반려
 * - 수정 요청 사유 기록
 * - 관리자에게 알림
 *
 * /api/b2b/spec-sheets/[id]/reject
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { sendSpecSheetRejectionEmail } from '@/lib/email';

// ============================================================
// Types
// ============================================================

interface RejectSpecSheetRequest {
  reason: string;
  requestedChanges?: string[];
}

// ============================================================
// POST: Reject Spec Sheet
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

    const body: RejectSpecSheetRequest = await request.json();
    const { reason, requestedChanges } = body;

    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'Reason is required' },
        { status: 400 }
      );
    }

    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'reject_spec_sheet',
      userId: user.id,
      route: '/api/b2b/spec-sheets/[id]/reject',
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

    // Create revision request record
    const { data: revisionRequest, error: revisionError } = await supabaseAdmin
      .from('spec_sheet_revisions')
      .insert({
        spec_sheet_id: specSheetId,
        requested_by: user.id,
        reason,
        requested_changes: requestedChanges || [],
        status: 'pending',
      })
      .select()
      .single();

    if (revisionError || !revisionRequest) {
      console.error('[Spec Sheet Rejection] Revision creation error:', revisionError);
      return NextResponse.json(
        { success: false, error: revisionError?.message || 'Failed to create revision request' },
        { status: 500 }
      );
    }

    // Update spec sheet status back to draft
    const { data: updatedSpec, error: updateError } = await supabaseAdmin
      .from('spec_sheets')
      .update({
        status: 'draft',
        approval_notes: `반려 사유: ${reason}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', specSheetId)
      .select()
      .single();

    if (updateError || !updatedSpec) {
      console.error('[Spec Sheet Rejection] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: updateError?.message || 'Failed to update spec sheet' },
        { status: 500 }
      );
    }

    // Send notification email to admin
    const workOrder = (specSheet as any).work_orders;
    if (workOrder?.customer_email) {
      try {
        await sendSpecSheetRejectionEmail(
          {
            specNumber: specSheet.spec_number,
            orderNumber: workOrder.order_number,
            customerName: workOrder.customer_name,
            reason,
            requestedChanges,
            rejectedAt: new Date().toLocaleDateString('ja-JP'),
          },
          process.env.ADMIN_EMAIL || 'admin@epackage-lab.com'
        );
      } catch (emailError: any) {
        console.error('[Spec Sheet Rejection] Email error:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        specSheetId: updatedSpec.id,
        specNumber: updatedSpec.spec_number,
        status: updatedSpec.status,
        revisionRequestId: revisionRequest.id,
        message: '수정 요청이 접수되었습니다. 빠른 시일 내에 검토하겠습니다.',
      },
    });
  } catch (error: any) {
    console.error('[Spec Sheet Rejection] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
