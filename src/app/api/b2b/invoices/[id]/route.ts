/**
 * Single Invoice API
 *
 * 請求書詳細API
 *
 * GET /api/b2b/invoices/[id] - Get invoice details
 * PATCH /api/b2b/invoices/[id] - Update invoice status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

// ============================================================
// GET: Get Invoice Details
// ============================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const invoiceId = params.id;

    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証されませんでした。' },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'get_invoice_details',
      userId: user.id,
      route: '/api/b2b/invoices/[id]',
    });

    // Get invoice data with related information
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        companies (
          id,
          name,
          name_kana,
          postal_code,
          prefecture,
          city,
          address,
          building
        ),
        orders (
          id,
          order_number,
          created_at
        ),
        invoice_items (*),
        invoice_payments (*)
      `)
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません。' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (invoice.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Calculate payment status
    const totalPaid = invoice.invoice_payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
    const remainingAmount = invoice.total_amount - totalPaid;
    const isFullyPaid = remainingAmount <= 0;

    // Check if overdue
    const isOverdue = new Date(invoice.due_date) < new Date() && !isFullyPaid;
    const daysOverdue = isOverdue
      ? Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...invoice,
        paymentStatus: {
          totalPaid,
          remainingAmount,
          isFullyPaid,
          isOverdue,
          daysOverdue,
        },
      },
    });
  } catch (error: any) {
    console.error('[Invoice Detail API] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH: Update Invoice Status
// ============================================================

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const invoiceId = params.id;

    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証されませんでした。' },
        { status: 401 }
      );
    }

    // Get current invoice to verify ownership
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'update_invoice_status',
      userId: user.id,
      route: '/api/b2b/invoices/[id]',
    });

    const { data: currentInvoice, error: fetchError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchError || !currentInvoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません。' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (currentInvoice.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'ステータスが必要です。' },
        { status: 400 }
      );
    }

    // Validate status transition
    const validStatuses = ['DRAFT', 'SENT', 'VIEWED', 'PAID', 'PARTIAL', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: '無効なステータスです。' },
        { status: 400 }
      );
    }

    // Update invoice status
    const { data: updatedInvoice, error: updateError } = await supabaseAdmin
      .from('invoices')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .select()
      .single();

    if (updateError) {
      console.error('[Invoice Detail API] PATCH error:', updateError);
      return NextResponse.json(
        { success: false, error: '請求書更新中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: '請求書を更新しました。',
    });
  } catch (error: any) {
    console.error('[Invoice Detail API] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
