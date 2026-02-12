/**
 * Quotation Approval API (Member Portal - Migrated from B2B)
 *
 * 見積承認API
 *
 * Allows customers to approve quotations
 * POST /api/member/quotations/[id]/approve - Approve a quotation
 * GET /api/member/quotations/[id]/approve - Get approval status
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { sendApprovalEmail, createRecipient } from '@/lib/email';

// ============================================================
// Types
// ============================================================

interface ApprovalRequest {
  quotationId: string;
  notes?: string;
}

/**
 * Helper: Get authenticated user
 */
async function getAuthenticatedUser(request: NextRequest) {
  // Normal auth: Use cookie-based auth with createSupabaseSSRClient
  const { client: supabase } = await createSupabaseSSRClient($$$ARGS);
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const userId = authUser.id;
  const user = authUser;
  console.log('[Quotation Approval] Authenticated user:', userId);

  return { userId, user };
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
    const { id: quotationId } = params;

    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const { userId, user } = authResult;
    const { client: supabase } = await createSupabaseSSRClient($$$ARGS);

    // Get quotation data
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', quotationId)
      .single();

    if (quotationError || !quotation) {
      return NextResponse.json(
        { success: false, error: '見積が見つかりません。' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (quotation.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Check current status
    if (quotation.status !== 'SENT' && quotation.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: '承認できない見積ステータスです。' },
        { status: 400 }
      );
    }

    // Check if expired
    if (quotation.valid_until && new Date(quotation.valid_until) < new Date()) {
      return NextResponse.json(
        { success: false, error: '有効期限切れの見積です。' },
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
        { success: false, error: '見積承認中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    // Notify admins via email (if email service is configured)
    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'get_admin_emails_for_approval_notification',
      userId,
      route: '/api/member/quotations/[id]/approve',
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

    // ============================================================
    // Email Notification: Quotation Approval
    // ============================================================

    try {
      // Send approval email to customer
      if (user.email) {
        const customerRecipient = createRecipient(
          user.user_metadata?.full_name || user.email?.split('@')[0] || 'お客様',
          user.email
        );

        await sendApprovalEmail(
          customerRecipient,
          '見積承認',
          `見積番号: ${quotation.quotation_number}\n合計金額: ¥${quotation.total_amount?.toLocaleString() || '0'}`,
          'システム',
          {
            approvalDate: new Date().toISOString(),
            nextSteps: 'まもなく製造を開始いたします。完了次第、ご連絡いたします。',
          }
        );

        console.log('[Quotation Approval] Customer approval email sent:', {
          quotationId,
          customerEmail: user.email,
        });
      }

      // Send notification to admins
      if (admins && admins.length > 0) {
        for (const admin of admins) {
          const adminRecipient = createRecipient(
            '管理者',
            admin.email
          );

          await sendApprovalEmail(
            adminRecipient,
            '新規見積承認通知',
            `顧客: ${quotation.customer_name}\n見積番号: ${quotation.quotation_number}\n金額: ¥${quotation.total_amount?.toLocaleString() || '0'}`,
            user.email || '顧客',
            {
              approvalDate: new Date().toISOString(),
              nextSteps: '注文変換の準備ができました。',
            }
          );
        }

        console.log('[Quotation Approval] Admin notification emails sent:', {
          adminCount: admins.length,
        });
      }
    } catch (emailError) {
      console.error('[Quotation Approval] Email error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      data: updatedQuotation,
      message: '見積が承認されました。',
    });
  } catch (error: any) {
    console.error('[Quotation Approval] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'サーバーエラーが発生しました。' },
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
    const { id: quotationId } = params;

    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const { userId } = authResult;
    const { client: supabase } = await createSupabaseSSRClient($$$ARGS);

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
        { success: false, error: '見積が見つかりません。' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (quotation.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
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
      { success: false, error: error.message || 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
