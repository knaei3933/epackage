/**
 * API Route: Customer Approval for Spec Sheet
 *
 * 仕様書顧客承認API
 * - 顧客による仕様書の承認
 * - ステータスをactiveに変更
 * - 承認情報の記録
 *
 * /api/member/spec-sheets/[id]/approve
 *
 * Migrated from /api/b2b/spec-sheets/[id]/approve
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { sendSpecSheetApprovalEmail } from '@/lib/email';

// ============================================================
// Types
// ============================================================

interface ApproveSpecSheetRequest {
  comments?: string;
}

// ============================================================
// Helper: Get authenticated user ID
// ============================================================

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  // Try to get user from middleware header first (more reliable)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && isFromMiddleware) {
    console.log('[Spec Sheet Approval] Using user ID from middleware:', userIdFromMiddleware);
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
    console.error('[Spec Sheet Approval] Auth error:', authError);
    return null;
  }

  return user.id;
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
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
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
      userId: userId,
      route: '/api/member/spec-sheets/[id]/approve',
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
        approved_by: userId,
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
        message: '仕様書が承認されました。生産を進めます。',
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
