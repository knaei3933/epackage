/**
 * Invoice PDF Download API
 * GET /api/member/invoices/[invoiceId]/download
 *
 * Generates and returns a PDF for the specified invoice
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import type { InvoiceData, InvoiceItem } from '@/lib/pdf-generator';

/**
 * Get user ID from middleware headers
 */
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    return headersList.get('x-user-id');
  } catch (error) {
    console.error('[getUserIdFromRequest] Error:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { invoiceId } = await params;

    const supabase = createServiceClient();

    // Fetch invoice with items
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .single();

    if (error || !invoice) {
      console.error('Error fetching invoice:', error);
      return NextResponse.json(
        { error: '請求書が見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Transform invoice data to PDF format
    const pdfData: InvoiceData = {
      invoiceNumber: invoice.invoice_number,
      issueDate: new Date(invoice.issue_date).toISOString().split('T')[0],
      dueDate: new Date(invoice.due_date).toISOString().split('T')[0],
      billingName: invoice.customer_name,
      companyName: invoice.company_name || undefined,
      items: (invoice.invoice_items || []).map((item: any) => ({
        id: item.id,
        name: item.product_name,
        description: item.description || undefined,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unit_price,
        amount: item.total_price,
      } as InvoiceItem)),
      paymentMethod: invoice.payment_method || '銀行振込',
      bankInfo: invoice.bank_account ? {
        bankName: invoice.bank_account.bank_name || '',
        branchName: invoice.bank_account.branch_name || '',
        accountType: invoice.bank_account.account_type === 'savings' ? '普通' : '当座',
        accountNumber: invoice.bank_account.account_number || '',
        accountHolder: invoice.bank_account.account_holder || '',
      } : undefined,
      remarks: invoice.notes || undefined,
    };

    // Generate PDF
    const pdfBytes = await generateInvoicePDF(pdfData);

    // Return PDF as downloadable file
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Invoice PDF generation error:', error);
    return NextResponse.json(
      {
        error: 'PDFの生成中にエラーが発生しました',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
