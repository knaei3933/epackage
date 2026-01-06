/**
 * Invoice API
 *
 * 請求書API
 *
 * Handles invoice generation and management
 * POST /api/b2b/invoices - Create invoice from order
 * GET /api/b2b/invoices - List invoices
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { sendTemplatedEmail } from '@/lib/email';
import type { InvoiceEmailData } from '@/lib/email-templates';

// ============================================================
// Types
// ============================================================

interface CreateInvoiceRequest {
  orderId: string;
  issueDate?: string; // YYYY-MM-DD format
  paymentTermsDays?: number; // Default: 30
  notes?: string;
}

interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount?: number;
}

// ============================================================
// POST: Create Invoice from Order
// ============================================================

export async function POST(request: NextRequest) {
  try {
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

    // Parse request body
    const body: CreateInvoiceRequest = await request.json();
    const { orderId, issueDate, paymentTermsDays = 30, notes } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: '注文IDが必要です。' },
        { status: 400 }
      );
    }

    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'invoice_operations',
      userId: user.id,
      route: '/api/b2b/invoices',
    });

    // Get order data with items and company info
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
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
        order_items (*),
        quotations (
          id,
          quotation_number
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Check if invoice already exists for this order
    const { data: existingInvoice } = await supabaseAdmin
      .from('invoices')
      .select('id, invoice_number')
      .eq('order_id', orderId)
      .maybeSingle();

    if (existingInvoice) {
      return NextResponse.json(
        {
          success: true,
          data: existingInvoice,
          message: '請求書は既に作成されています。',
          alreadyExists: true,
        },
        { status: 200 }
      );
    }

    // Calculate dates
    const invoiceIssueDate = issueDate ? new Date(issueDate) : new Date();
    const dueDate = new Date(invoiceIssueDate);
    dueDate.setDate(dueDate.getDate() + paymentTermsDays);

    // Calculate totals
    const subtotal = order.order_items.reduce((sum: number, item: any) => {
      return sum + (item.unit_price * item.quantity);
    }, 0);
    const tax = Math.round(subtotal * 0.1); // 10% consumption tax
    const total = subtotal + tax;

    // Generate invoice number
    const year = invoiceIssueDate.getFullYear();
    const { data: invoiceCount } = await supabaseAdmin
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .like('invoice_number', `INV-${year}-%`);

    const sequenceNumber = String((invoiceCount?.length || 0) + 1).padStart(4, '0');
    const invoiceNumber = `INV-${year}-${sequenceNumber}`;

    // Create invoice record
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        order_id: orderId,
        user_id: user.id,
        company_id: order.company_id,
        issue_date: invoiceIssueDate.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        subtotal,
        tax,
        total_amount: total,
        status: 'SENT',
        notes,
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      console.error('[Invoice API] Create error:', invoiceError);
      return NextResponse.json(
        { success: false, error: '請求書作成中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    // Create invoice items
    const invoiceItems = order.order_items.map((item: any) => ({
      invoice_id: invoice.id,
      item_name: item.product_name || item.name || '商品',
      description: item.description,
      quantity: item.quantity,
      unit: item.unit || '個',
      unit_price: item.unit_price,
      amount: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('invoice_items')
      .insert(invoiceItems);

    if (itemsError) {
      console.error('[Invoice API] Items error:', itemsError);
    }

    // Generate PDF
    try {
      const pdfData = {
        invoiceNumber,
        issueDate: invoiceIssueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        billingName: order.companies.name,
        billingNameKana: order.companies.name_kana,
        postalCode: order.companies.postal_code,
        address: `${order.companies.prefecture}${order.companies.city}${order.companies.address}${order.companies.building || ''}`,
        items: order.order_items.map((item: any) => ({
          id: item.id,
          name: item.product_name || item.name || '商品',
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || '個',
          unitPrice: item.unit_price,
          amount: item.unit_price * item.quantity,
        })),
        paymentMethod: '銀行振込',
        paymentTerms: `${paymentTermsDays}日`,
        bankInfo: {
          bankName: '三菱UFJ銀行',
          branchName: '本店営業部',
          accountType: '普通',
          accountNumber: '1234567',
          accountHolder: '株式会社Epackage Lab',
        },
      };

      const pdfResult = await generateInvoicePDF(pdfData, { returnBase64: 'true' });

      if (pdfResult.success && pdfResult.base64) {
        // Store PDF in Supabase Storage
        const fileName = `invoices/${invoice.id}.pdf`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from('documents')
          .upload(fileName, Buffer.from(pdfResult.base64, 'base64'), {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (!uploadError) {
          // Get public URL
          const { data: { publicUrl } } = supabaseAdmin.storage
            .from('documents')
            .getPublicUrl(fileName);

          // Update invoice with PDF URL
          await supabaseAdmin
            .from('invoices')
            .update({ pdf_url: publicUrl })
            .eq('id', invoice.id);

          // Send invoice email
          const emailData = {
            invoiceNumber,
            orderNumber: order.order_number,
            issueDate: invoiceIssueDate.toISOString(),
            dueDate: dueDate.toISOString(),
            amount: total,
            companyName: order.companies.name,
            invoicePdfUrl: publicUrl,
            paymentMethod: '銀行振込',
            remarks: notes,
          };

          try {
            await sendTemplatedEmail(
              'invoice_created',
              emailData as InvoiceEmailData,
              {
                email: user.email || '',
                name: order.companies.name,
                company: order.companies.name,
              }
            );
          } catch (emailError) {
            console.error('[Invoice API] Email error:', emailError);
          }
        }
      }
    } catch (pdfError) {
      console.error('[Invoice API] PDF generation error:', pdfError);
    }

    // Fetch complete invoice data
    const { data: completeInvoice } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        companies (*),
        invoice_items (*)
      `)
      .eq('id', invoice.id)
      .single();

    return NextResponse.json({
      success: true,
      data: completeInvoice,
      message: '請求書を作成しました。',
    });
  } catch (error: any) {
    console.error('[Invoice API] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// GET: List Invoices
// ============================================================

export async function GET(request: NextRequest) {
  try {
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

    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'invoice_operations',
      userId: user.id,
      route: '/api/b2b/invoices',
    });

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabaseAdmin
      .from('invoices')
      .select(`
        *,
        companies (
          id,
          name
        ),
        orders (
          id,
          order_number
        ),
        invoice_items (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error('[Invoice API] GET error:', error);
      return NextResponse.json(
        { success: false, error: '請求書データの取得中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        limit,
        offset,
        count: invoices?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('[Invoice API] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
