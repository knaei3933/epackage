/**
 * POST /api/member/quotations/[id]/invoice
 *
 * Task 105: Invoice PDF Generation API (Member Portal)
 * - Generate invoice PDF based on quotation data
 * - All DB operations via Supabase MCP
 * - Returns invoice data for client-side PDF generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// ============================================================
// Types
// ============================================================

interface BankInfo {
  bankName: string;
  branchName?: string;
  accountType?: string;
  accountNumber: string;
  accountHolder: string;
}

interface SupplierInfo {
  name: string;
  subBrand?: string;
  companyName?: string;
  postalCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  registrationNumber?: string;
  contactPerson?: string;
}

interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  billingName?: string;
  billingNameKana?: string;
  companyName?: string;
  postalCode?: string;
  address?: string;
  contactPerson?: string;
  items: InvoiceItem[];
  paymentMethod: string;
  bankInfo: BankInfo;
  supplierInfo: SupplierInfo;
  remarks?: string;
}

interface InvoiceResponse {
  success: boolean;
  invoice?: InvoiceData;
  error?: string;
  message?: string;
}

// ============================================================
// Environment Variables
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// ============================================================
// POST: Generate Invoice PDF Data
// ============================================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quotationId = params.id;

    // 1. Authentication Check using @supabase/ssr
    const cookieStore = await cookies();
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseAnonKey!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Normal auth: Use cookie-based auth with getUser()
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: '認証されていません。ログインしてください。',
          errorEn: 'Authentication required',
        } as InvoiceResponse,
        { status: 401 }
      );
    }

    const userId = user.id;

    // 2. Fetch Quotation Data
    const { data: quotation, error: quotationError } = await supabase
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
        user_id,
        quotation_items (
          id,
          product_name,
          quantity,
          unit_price,
          total_price,
          specifications
        )
      `)
      .eq('id', quotationId)
      .single();

    if (quotationError || !quotation) {
      console.error('[Invoice API] Error fetching quotation:', quotationError);
      return NextResponse.json(
        {
          success: false,
          error: '見積が見つかりませんでした。',
          errorEn: 'Quotation not found',
        } as InvoiceResponse,
        { status: 404 }
      );
    }

    // 3. Authorization Check
    if (quotation.user_id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'この請求書にアクセスする権限がありません。',
          errorEn: 'Access denied',
        } as InvoiceResponse,
        { status: 403 }
      );
    }

    // 4. Prepare Invoice Data
    const invoiceItems: InvoiceItem[] = (quotation.quotation_items || []).map((item) => ({
      id: item.id,
      name: item.product_name,
      description: undefined,
      quantity: item.quantity,
      unit: '枚',
      unitPrice: item.unit_price,
      amount: item.total_price,
    }));

    const invoiceNumber = quotation.quotation_number.replace('QT', 'INV');

    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const invoiceData: InvoiceData = {
      invoiceNumber,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      billingName: quotation.customer_name,
      items: invoiceItems,
      paymentMethod: '銀行振込',
      bankInfo: {
        bankName: '三菱UFJ銀行',
        branchName: '東京支店',
        accountType: '普通',
        accountNumber: '1234567',
        accountHolder: 'イーパックラボ株式会社',
      },
      supplierInfo: {
        name: 'EPACKAGE Lab',
        subBrand: 'by kanei-trade',
        companyName: '金井貿易株式会社',
        postalCode: '〒673-0846',
        address: '兵庫県明石市上ノ丸2-11-21',
        phone: '050-1793-6500',
        email: 'info@package-lab.com',
        description: 'オーダーメイドバッグ印刷専門',
      },
      remarks: `※本見積書に基づく請求書です。
※お支払期限までにご送金くださいますようお願い申し上げます。`,
    };

    return NextResponse.json(
      {
        success: true,
        invoice: invoiceData,
        message: '請求書データを取得しました。',
        messageEn: 'Invoice data retrieved successfully.',
        requiresClientSideGeneration: true,
      } as InvoiceResponse & { requiresClientSideGeneration?: boolean },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Invoice API] Unexpected error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      } as InvoiceResponse,
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return POST(request, context);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
