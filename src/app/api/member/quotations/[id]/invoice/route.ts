/**
 * POST /api/member/quotations/[id]/invoice
 *
 * Task 105: Invoice PDF Generation API (Member Portal)
 * - Generate invoice PDF based on quotation data
 * - All DB operations via Supabase MCP
 * - Returns invoice data for client-side PDF generation
 *
 * Database Operations:
 * - Fetch quotation with items (quotations + quotation_items)
 * - Fetch user profile for authorization
 * - Use Supabase client for all queries
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import type { InvoiceData, InvoiceItem } from '@/lib/pdf-generator';

// ============================================================
// Environment Variables
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// ============================================================
// Types
// ============================================================

interface InvoiceResponse {
  success: boolean;
  invoice?: InvoiceData;
  error?: string;
  message?: string;
}

// ============================================================
// POST: Generate Invoice PDF Data
// ============================================================

/**
 * POST /api/member/quotations/[id]/invoice
 *
 * Request body: empty (quotation ID from URL)
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "invoice": {
 *     "invoiceNumber": "INV-2025-0001",
 *     "issueDate": "2025-01-04T...",
 *     "dueDate": "2025-02-03T...",
 *     "billingName": "Customer Name",
 *     "items": [...],
 *     "bankInfo": {...},
 *     "supplierInfo": {...}
 *   }
 * }
 */
export async function POST(
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
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = cookieStore.get(key);
            return cookie?.value ?? null;
          },
          setItem: (key: string, value: string) => {
            cookieStore.set(key, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          },
          removeItem: (key: string) => {
            cookieStore.delete(key);
          },
        },
      },
    });

    // Check for DEV_MODE header from middleware
    const devModeUserId = request.headers.get('x-user-id');
    const isDevMode = request.headers.get('x-dev-mode') === 'true';

    let userId: string;

    if (isDevMode && devModeUserId) {
      // DEV_MODE: Use header from middleware
      console.log('[Invoice API] DEV_MODE: Using x-user-id header:', devModeUserId);
      userId = devModeUserId;
    } else {
      // Normal auth: Use cookie-based auth
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
      userId = user.id;
    }

    // ============================================================
    // 2. Fetch Quotation Data (using Supabase client)
    // ============================================================

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
          specifications,
          notes,
          display_order
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

    // ============================================================
    // 3. Authorization Check
    // ============================================================

    // Only allow the quotation owner to download invoice
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
      // Task 106: Bank Account Info Display
      bankInfo: {
        bankName: '三菱UFJ銀行',
        branchName: '東京支店',
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
        phone: '080-6942-7235',
        email: 'info@epackage-lab.com',
        description: 'オーダーメイドバッグ印刷専門',
        registrationNumber: undefined,
        contactPerson: undefined,
      },

      remarks: `※本見積書に基づく請求書です。
※お支払期限までにご送金くださいますようお願い申し上げます。`,
    };

    // ============================================================
    // 5. Return Invoice Data for Client-Side PDF Generation
    // ============================================================

    // Note: PDF generation requires browser environment (html2canvas + jsPDF)
    // Server-side PDF generation is not supported by the current implementation
    // We return the invoice data and let the client generate the PDF

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

// ============================================================
// GET: Fetch Invoice Data (alias for POST)
// ============================================================

/**
 * GET /api/member/quotations/[id]/invoice
 *
 * Alternative to POST for fetching invoice data
 * Same functionality as POST
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Delegate to POST handler
  return POST(request, context);
}

// ============================================================
// OPTIONS handler for CORS preflight
// ============================================================

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
