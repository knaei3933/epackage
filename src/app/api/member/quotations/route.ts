/**
 * Member Quotations API (Unified B2B + Member)
 *
 * Task #102: Implement quotation submission API using Supabase MCP
 * - POST: Create new quotation with items using Supabase MCP executeSql
 * - GET: List quotations with filtering and pagination
 * - Supports both B2B (company_id) and Member (user_id) patterns
 *
 * Database Operations:
 * - All queries use mcp__supabase-epackage__execute_sql
 * - Transaction-safe: quotation + items insertion
 * - Auto-generates quotation number (QT-YYYY-NNNN)
 * - Auto-calculates totals (subtotal, tax, total)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getAuthenticatedUser } from '@/lib/supabase-ssr';
import { getPerformanceMonitor } from '@/lib/performance-monitor';
import { sendTemplatedEmail } from '@/lib/email';
import { subject, plainText, html } from '@/lib/email/templates/quote_created_admin';

// Initialize performance monitor
const perfMonitor = getPerformanceMonitor({
  slowQueryThreshold: 1000, // Log queries slower than 1 second
  enableLogging: true,
});

// Types
interface QuotationItem {
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  totalPrice?: number; // Optional: pre-calculated total from simulator (to avoid rounding errors)
  category?: string | null;
  specifications?: Record<string, unknown> | null;
  notes?: string | null;
}

interface CreateQuotationRequest {
  company_id?: string; // Optional: B2B mode
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  notes?: string | null;
  valid_until?: string | null;
  status?: string; // DRAFT, SENT, etc.
  items: QuotationItem[];
}

interface QuotationResponse {
  id: string;
  quotation_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  valid_until: string | null;
  items: QuotationItem[];
  created_at: string;
}

/**
 * POST /api/member/quotations
 * Create a new quotation with items
 *
 * Request Body:
 * {
 *   "company_id": "string | undefined",  // Optional: B2B mode
 *   "customer_name": "string",
 *   "customer_email": "string",
 *   "customer_phone": "string | null",
 *   "notes": "string | null",
 *   "valid_until": "ISO date string | null",
 *   "status": "string | undefined",  // DRAFT, SENT, etc.
 *   "items": [
 *     {
 *       "product_id": "string | null",
 *       "product_name": "string",
 *       "quantity": number,
 *       "unit_price": number,
 *       "specifications": { ... } | null
 *     }
 *   ]
 * }
 *
 * Success Response (201):
 * {
 *   "success": true,
 *   "quotation": { ... }
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Get authenticated user using unified authentication
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      console.error('[Quotation API] Authentication failed: No user found in request');
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('[Quotation API] Authenticated user:', authUser.id);

    const { id: userId } = authUser;

    // Create service client for database operations
    const serviceClient = createServiceClient();

    // Parse and validate request body
    const body: CreateQuotationRequest = await request.json();

    // Validation
    if (!body.customer_name || !body.customer_email) {
      return NextResponse.json(
        { error: '必須項目が不足しています。', errorEn: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: '見積項目が少なくとも1つ必要です。', errorEn: 'At least one quotation item is required' },
        { status: 400 }
      );
    }

    // Validate items
    for (const item of body.items) {
      if (!item.product_name) {
        return NextResponse.json(
          { error: '製品名は必須です。', errorEn: 'Product name is required' },
          { status: 400 }
        );
      }
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json(
          { error: '数量は正の数でなければなりません。', errorEn: 'Quantity must be a positive number' },
          { status: 400 }
        );
      }
      if (typeof item.unit_price !== 'number' || item.unit_price < 0) {
        return NextResponse.json(
          { error: '単価は0以上でなければなりません。', errorEn: 'Unit price must be non-negative' },
          { status: 400 }
        );
      }
    }

    // Calculate totals with 100-yen rounding
    // IMPORTANT: Use totalPrice if available (already calculated by frontend), otherwise calculate from unit_price
    // Calculate from totalPrice for accurate pricing
    const totalFromItems = body.items.reduce((sum, item) => {
      // Use totalPrice if available (already calculated by quote simulator), otherwise calculate from unit_price * quantity
      const itemTotal = (item as any).totalPrice !== undefined
        ? (item as any).totalPrice
        : (item.quantity * item.unit_price);
      return sum + itemTotal;
    }, 0);

    // Apply 100-yen ceiling rounding (反り上げ) as user requested
    const roundedSubtotalAmount = Math.ceil(totalFromItems / 100) * 100;
    const taxAmount = roundedSubtotalAmount * 0.1; // 10% Japanese consumption tax
    const roundedTaxAmount = Math.ceil(taxAmount);
    const totalAmount = Math.ceil((roundedSubtotalAmount + roundedTaxAmount) / 100) * 100;

    console.log('[Quotation API] Price calculation:', {
      totalFromItems,
      roundedSubtotal: roundedSubtotalAmount,
      rawTax: taxAmount,
      roundedTax: roundedTaxAmount,
      totalAmount,
    });

    // Determine status - use new 10-step workflow statuses (UPPERCASE)
    // Default to QUOTATION_PENDING for new quotations (step 1: 検討承認待ち)
    const status = body.status ? body.status.toUpperCase() : 'QUOTATION_PENDING';

    // クーポン処理：クーポンコードからcoupon_idを取得
    let couponId = null;
    let discountAmount = (body as any).discountAmount || 0;
    let discountType = (body as any).appliedCoupon?.type || null;
    let finalTotalAmount = totalAmount;

    if ((body as any).appliedCoupon?.couponId) {
      const couponCode = (body as any).appliedCoupon.couponId;
      const { data: coupon } = await serviceClient
        .from('coupons')
        .select('id')
        .eq('code', couponCode.toUpperCase())
        .single();

      if (coupon) {
        couponId = coupon.id;
        // adjustedTotalがあれば使用、なければ計算したtotalAmountを使用
        finalTotalAmount = (body as any).adjustedTotal || totalAmount;
      }
    }

    // Insert quotation
    const { data: quotation, error: quotationError } = await serviceClient
      .from('quotations')
      .insert({
        user_id: userId,
        company_id: body.company_id || null, // Optional: B2B mode
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone || null,
        subtotal_amount: roundedSubtotalAmount,
        tax_amount: roundedTaxAmount,
        total_amount: finalTotalAmount, // クーポン適用後の金額を使用
        coupon_id: couponId,
        discount_amount: discountAmount > 0 ? discountAmount : 0,  // NOT NULL制約に対応
        discount_type: discountType,
        notes: body.notes || null,
        valid_until: body.valid_until || null,
        status,
        // 【追加】見積全体の原価内訳
        total_cost_breakdown: (body as any).total_cost_breakdown || {},
      })
      .select()
      .single();

    if (quotationError) {
      console.error('[Quotation API] ========================================');
      console.error('[Quotation API] Insert quotation ERROR:');
      console.error('[Quotation API] Error code:', quotationError.code);
      console.error('[Quotation API] Error message:', quotationError.message);
      console.error('[Quotation API] Error details:', quotationError.details);
      console.error('[Quotation API] Error hint:', quotationError.hint);
      console.error('[Quotation API] Full error:', JSON.stringify(quotationError, null, 2));
      console.error('[Quotation API] Request body:', JSON.stringify(body, null, 2));
      console.error('[Quotation API] User ID:', userId);
      console.error('[Quotation API] ========================================');
      return NextResponse.json(
        {
          error: '見積の作成に失敗しました。',
          errorEn: 'Failed to create quotation',
          details: process.env.NODE_ENV === 'development' ? quotationError.message : 'Internal server error',
          code: quotationError.code,
        },
        { status: 500 }
      );
    }

    // Insert quotation items
    // Note: total_price is a generated column, cannot insert manually
    // Insert quotation items
    // IMPORTANT: unit_price should preserve decimal precision for accurate total_price calculation
    // total_price is a generated column (unit_price * quantity), so unit_price must be exact
    const itemsToInsert = body.items.map((item) => ({
      quotation_id: quotation.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      quantity: item.quantity,
      // unit_priceは小数点以下を保持（total_priceは生成列で自動計算されるため）
      unit_price: item.unit_price,
      specifications: item.specifications || null,
      // 【追加】アイテム別原価内訳
      cost_breakdown: (item as any).cost_breakdown || {},
    }));

    const { data: items, error: itemsError } = await serviceClient
      .from('quotation_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError) {
      console.error('[Quotation API] ========================================');
      console.error('[Quotation API] Insert quotation_items ERROR:');
      console.error('[Quotation API] Error code:', itemsError.code);
      console.error('[Quotation API] Error message:', itemsError.message);
      console.error('[Quotation API] Error details:', itemsError.details);
      console.error('[Quotation API] Error hint:', itemsError.hint);
      console.error('[Quotation API] Full error:', JSON.stringify(itemsError, null, 2));
      console.error('[Quotation API] Items to insert:', JSON.stringify(itemsToInsert, null, 2));
      console.error('[Quotation API] Quotation ID:', quotation.id);
      console.error('[Quotation API] ========================================');
      // Rollback: delete quotation if items insertion fails
      await serviceClient.from('quotations').delete().eq('id', quotation.id);

      return NextResponse.json(
        {
          error: '見積項目の登録に失敗しました。',
          errorEn: 'Failed to create quotation items',
          details: process.env.NODE_ENV === 'development' ? itemsError.message : 'Internal server error',
          code: itemsError.code,
        },
        { status: 500 }
      );
    }

    // Prepare response
    const response: QuotationResponse = {
      id: quotation.id,
      quotation_number: quotation.quotation_number,
      status: quotation.status,
      customer_name: quotation.customer_name,
      customer_email: quotation.customer_email,
      subtotal_amount: Number(quotation.subtotal_amount),
      tax_amount: Number(quotation.tax_amount),
      total_amount: Number(quotation.total_amount),
      valid_until: quotation.valid_until,
      items: items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        specifications: item.specifications,
      })),
      created_at: quotation.created_at,
    };

    // ========================================
    // Send notification email to admin
    // ========================================
    try {
      const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.package-lab.com';

      // Get user profile for company name
      const { data: profile } = await serviceClient
        .from('profiles')
        .select('company_name')
        .eq('id', userId)
        .maybeSingle();

      const companyName = profile?.company_name || 'EPackage Lab';

      // Send email to admin using the template
      await sendTemplatedEmail(
        'info@package-lab.com', // Admin email recipient
        'quote_created_admin',
        {
          quotation_id: quotation.id,
          quotation_number: quotation.quotation_number,
          customer_name: quotation.customer_name,
          company_name: companyName,
          total_amount: Number(quotation.total_amount),
          valid_until: quotation.valid_until
            ? new Date(quotation.valid_until).toLocaleDateString('ja-JP')
            : '設定なし',
          view_url: `${appUrl}/admin/quotations/${quotation.id}`,
          submitted_at: new Date(quotation.created_at).toLocaleString('ja-JP'),
        },
        subject,
        plainText,
        html
      );

      console.log('[Quotation API] Admin notification email sent for quotation:', quotation.quotation_number);
    } catch (emailError) {
      // Don't fail the quotation creation if email fails
      console.error('[Quotation API] Failed to send admin notification email:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        quotation: response,
        message: status === 'QUOTATION_PENDING'
          ? '見積依頼を受け付けました。'
          : '見積を作成しました。',
        messageEn: status === 'QUOTATION_PENDING'
          ? 'Quotation request submitted.'
          : 'Quotation created successfully.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Quotation API] Unexpected error:', error);

    return NextResponse.json(
      {
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    // Track total API execution time
    const duration = Date.now() - startTime;
    perfMonitor.trackQuery(`POST /api/member/quotations`, duration);
  }
}

/**
 * GET /api/member/quotations
 * Get quotations for the authenticated user
 *
 * Query Parameters:
 * - status: Filter by status (DRAFT, SENT, APPROVED, etc.)
 * - limit: Maximum number of results (default: 20)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Get authenticated user using unified authentication
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: userId } = authUser;

    // Create service client for database operations
    const serviceClient = createServiceClient();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // ✅ RPC関数を使わずに標準クエリを使用
    // 基本クエリを構築
    let query = serviceClient
      .from('quotations')
      .select(`
        id,
        quotation_number,
        status,
        customer_name,
        customer_email,
        subtotal_amount,
        tax_amount,
        total_amount,
        valid_until,
        notes,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // ステータスフィルターを適用 - check both lowercase and uppercase status
    if (status) {
      query = query.or(`status.eq.${status.toLowerCase()},status.eq.${status.toUpperCase()}`);
    }

    const { data: quotations, error } = await query;

    if (error) {
      console.error('[Quotation API] Fetch quotations error:', error);
      return NextResponse.json(
        {
          error: '見積リストの読み込み中にエラーが発生しました。',
          errorEn: 'Failed to fetch quotations',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // 各見積のアイテムを取得
    const quotationsWithItems = await Promise.all(
      (quotations || []).map(async (quotation: any) => {
        const { data: items } = await serviceClient
          .from('quotation_items')
          .select('*')
          .eq('quotation_id', quotation.id)
          .order('display_order', { ascending: true });

        return {
          ...quotation,
          items: items || [],
        };
      })
    );

    // 総数を取得
    let countQuery = serviceClient
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (status) {
      countQuery = countQuery.or(`status.eq.${status.toLowerCase()},status.eq.${status.toUpperCase()}`);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      success: true,
      quotations: quotationsWithItems || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('[Quotation API] Get quotations error:', error);

    return NextResponse.json(
      {
        error: '見積履歴の取得に失敗しました。',
        errorEn: 'Failed to fetch quotations',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    // Track GET API execution time
    const duration = Date.now() - startTime;
    perfMonitor.trackQuery(`GET /api/member/quotations`, duration);
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
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
