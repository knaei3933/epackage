/**
 * API Route: Customer Rejection for Spec Sheet
 *
 * 仕様書顧客差戻し/修正要求API
 * - 顧客による仕様書の差戻し
 * - 修正要求理由の記録
 * - 管理者への通知
 *
 * /api/member/spec-sheets/[id]/reject
 *
 * Migrated from /api/b2b/spec-sheets/[id]/reject
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
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
// Helper: Get authenticated user ID
// ============================================================

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  // Try to get user from middleware header first (more reliable)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && isFromMiddleware) {
    console.log('[Spec Sheet Rejection] Using user ID from middleware:', userIdFromMiddleware);
    return userIdFromMiddleware;
  }

  // Fallback to SSR client auth
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const response = NextResponse.json({ success: false });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('[Spec Sheet Rejection] Auth error:', authError);
    return null;
  }

  return user.id;
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
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
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
      userId: userId,
      route: '/api/member/spec-sheets/[id]/reject',
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
        requested_by: userId,
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
        approval_notes: `差戻し理由: ${reason}`,
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
        message: '修正要求を受け付けました。至急確認いたします。',
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
