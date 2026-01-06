/**
 * GET /api/quotations/[id]/invoice
 *
 * Invoice PDF generation endpoint
 * Generates and downloads invoice PDF based on quotation data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createSupabaseWithCookies } from '@/lib/supabase';
import type { Database } from '@/types/database';
import type { InvoiceData, InvoiceItem } from '@/lib/pdf-generator';

// ============================================================
// GET: Generate and download invoice PDF
// ============================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quotationId = params.id;

    // ============================================================
    // 1. Authentication Check
    // ============================================================

    const cookieStore = await cookies();
    const supabase = await createSupabaseWithCookies(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。ログインしてください。' },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. Fetch Quotation Data
    // ============================================================

    const serviceClient = createServiceClient();

    const { data: quotation, error: quotationError } = await serviceClient
      .from('quotations')
      .select(`
        id,
        quotation_number,
        customer_name,
        customer_email,
        customer_phone,
        subtotal_amount,
        tax_amount,
        total_amount,
        created_at,
        valid_until,
        status,
        quotation_items (
          id,
          product_name,
          quantity,
          unit_price,
          total_price,
          specifications,
          notes,
          display_order
        )
      `)
      .eq('id', quotationId)
      .single();

    if (quotationError || !quotation) {
      console.error('Error fetching quotation:', quotationError);
      return NextResponse.json(
        { error: '見積が見つかりませんでした。' },
        { status: 404 }
      );
    }

    // ============================================================
    // 3. Authorization Check
    // ============================================================

    // Only allow the quotation owner or admins to download invoice
    if (quotation.user_id !== user.id) {
      // Check if user is admin
      const { data: profile } = await serviceClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'この請求書にアクセスする権限がありません。' },
          { status: 403 }
        );
      }
    }

    // ============================================================
    // 4. Prepare Invoice Data
    // ============================================================

    // Convert quotation items to invoice items
    const invoiceItems: InvoiceItem[] = (quotation.quotation_items || [])
      .sort((a, b) => a.display_order - b.display_order)
      .map((item) => ({
        id: item.id,
        name: item.product_name,
        description: item.notes || undefined,
        quantity: item.quantity,
        unit: '枚',
        unitPrice: item.unit_price,
        amount: item.total_price,
      }));

    // Generate invoice number (INV-YYYY-NNNN format based on quotation number)
    const invoiceNumber = quotation.quotation_number.replace('QT', 'INV');

    // Calculate due date (30 days from issue date)
    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);

    // Prepare invoice data
    const invoiceData: InvoiceData = {
      invoiceNumber,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),

      // Billing information
      billingName: quotation.customer_name,
      billingNameKana: undefined,
      companyName: undefined,
      postalCode: undefined,
      address: undefined,
      contactPerson: quotation.customer_email,

      // Invoice items
      items: invoiceItems,

      // Payment method
      paymentMethod: '銀行振込',

      // Bank account information
      bankInfo: {
        bankName: '三菱UFJ銀行',
        branchName: '',
        accountType: '普通',
        accountNumber: '1234567',
        accountHolder: 'イーパックラボ株式会社',
      },

      // Supplier information (EPACKAGE Lab)
      supplierInfo: {
        name: 'EPACKAGE Lab',
        subBrand: 'by kanei-trade',
        companyName: '金井貿易株式会社',
        postalCode: '〒673-0846',
        address: '兵庫県明石市上ノ丸2-11-21-102',
        phone: 'TEL：080-6942-7235',
        email: 'info@epackage-lab.com',
        description: 'オーダーメイドバッグ印刷専門',
        registrationNumber: undefined,
        contactPerson: undefined,
      },

      remarks: `※本見積書に基づく請求書です。
※お支払期限までにご送金くださいますようお願い申し上げます。`,
    };

    // ============================================================
    // 5. Generate PDF (Browser-side generation required)
    // ============================================================

    // Note: PDF generation requires browser environment (html2canvas + jsPDF)
    // Server-side PDF generation is not supported by the current implementation
    // We return the invoice data and let the client generate the PDF

    return NextResponse.json({
      success: true,
      invoice: invoiceData,
      message: '請求書データを取得しました。ブラウザでPDFを生成してください。',
      requiresClientSideGeneration: true,
    });

  } catch (error: unknown) {
    console.error('Error in GET /api/quotations/[id]/invoice:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
