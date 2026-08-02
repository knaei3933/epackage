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
import { getAuthenticatedUserFromHeaders } from '@/lib/supabase-ssr';
import { getPerformanceMonitor } from '@/lib/performance-monitor';
import { sendEmail } from '@/lib/email';
import { subject, plainText, html } from '@/lib/email/templates/quote_created_admin';
import type { Database } from '@/types/database';

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
  cost_breakdown?: Record<string, unknown>; // アイテム別原価内訳
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
  // フロントエンドの見積シミュレータから送信される追加フィールド（型契約の明確化）
  discountAmount?: number;
  appliedCoupon?: { type?: string; couponId?: string };
  adjustedTotal?: number;
  total_cost_breakdown?: Record<string, unknown>;
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
    // Task #27: getAuthenticatedUserFromHeaders trusts middleware-verified x-user-*
    // headers (DB-verified upstream), skipping the redundant getUser() RTT.
    // 認証結果（誰が認証されるか）は不変。検証経路の最適化のみ。
    const authUser = await getAuthenticatedUserFromHeaders(request);
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

    // Validation (with diagnostic logging to pinpoint failures)
    console.log('[Quotation API] POST body keys:', Object.keys(body));
    console.log('[Quotation API] customer_name:', body.customer_name, '| customer_email:', body.customer_email);
    console.log('[Quotation API] items count:', body.items?.length, '| items type:', typeof body.items);
    if (body.items?.length > 0) {
      console.log('[Quotation API] item[0]:', {
        product_name: body.items[0].product_name,
        quantity: body.items[0].quantity,
        unit_price: body.items[0].unit_price,
        typeof_qty: typeof body.items[0].quantity,
        typeof_up: typeof body.items[0].unit_price,
        has_unitPrice: 'unitPrice' in (body.items[0] as any),
      });
    }

    if (!body.customer_name || !body.customer_email) {
      console.error('[Quotation API] FAIL: missing customer_name or customer_email');
      return NextResponse.json(
        { error: '必須項目が不足しています。', errorEn: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      console.error('[Quotation API] FAIL: items empty or not array');
      return NextResponse.json(
        { error: '見積項目が少なくとも1つ必要です。', errorEn: 'At least one quotation item is required' },
        { status: 400 }
      );
    }

    // Validate items
    for (let vi = 0; vi < body.items.length; vi++) {
      const item = body.items[vi];
      if (!item.product_name) {
        console.error(`[Quotation API] FAIL item[${vi}]: missing product_name`);
        return NextResponse.json(
          { error: '製品名は必須です。', errorEn: 'Product name is required', field: 'product_name', itemIndex: vi },
          { status: 400 }
        );
      }
      // Defensive: coerce invalid quantity to 1 instead of hard-failing.
      // Frontend multi-quantity mode can pass 0 when patternTotalQuantity falls back to Map index.
      if (typeof item.quantity !== 'number' || !isFinite(item.quantity) || item.quantity <= 0) {
        console.warn(`[Quotation API] WARN item[${vi}]: quantity invalid (${item.quantity}), coercing to 1`);
        item.quantity = 1;
      }
      // Defensive: coerce missing/non-finite unit_price to 0 instead of hard-failing.
      // JSON.stringify omits undefined keys, so a missing unit_price arrives as undefined.
      if (typeof item.unit_price !== 'number' || !isFinite(item.unit_price) || item.unit_price < 0) {
        console.warn(`[Quotation API] WARN item[${vi}]: unit_price invalid (${item.unit_price}), coercing to 0`);
        item.unit_price = 0;
      }
    }

    // Calculate totals with 100-yen rounding
    // IMPORTANT: Use totalPrice if available (already calculated by frontend), otherwise calculate from unit_price
    // Calculate from totalPrice for accurate pricing
    const totalFromItems = body.items.reduce((sum, item) => {
      // Use totalPrice if available (already calculated by quote simulator), otherwise calculate from unit_price * quantity
      const itemTotal = item.totalPrice !== undefined
        ? item.totalPrice
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
    const discountAmount = body.discountAmount || 0;
    const discountType = body.appliedCoupon?.type || null;
    let finalTotalAmount = totalAmount;

    if (body.appliedCoupon?.couponId) {
      const couponCode = body.appliedCoupon.couponId;
      const { data: coupon } = await serviceClient
        .from('coupons')
        .select('id')
        .eq('code', couponCode.toUpperCase())
        .single();

      if (coupon) {
        couponId = coupon.id;
        // adjustedTotalがあれば使用、なければ計算したtotalAmountを使用
        finalTotalAmount = body.adjustedTotal || totalAmount;
      }
    }

    // Bug5: 同一内容の直近見積（5分以内）があれば新規作成せず既存を返す（重複防止）。
    // 主犯経路（flushGuestQuotes=連続DRAFT保存 / ResultStep handleDownloadPdf=PDFごとのSENT保存）
    // の最終防壁。user_id + total_amount + status + 5分窓 の4条件一致で「同じ見積の再送」と判定。
    // DB列追加なし（既存列で判定）→ 既存データには触らない。total_amount(numeric)は String で比較。
    const DEDUP_WINDOW_MIN = 5;
    const { data: existingQuotation } = await serviceClient
      .from('quotations')
      .select('id, quotation_number, status, total_amount, customer_name, customer_email, subtotal_amount, tax_amount, valid_until, created_at')
      .eq('user_id', userId)
      .eq('total_amount', String(finalTotalAmount))
      .eq('status', status)
      .gte('created_at', new Date(Date.now() - DEDUP_WINDOW_MIN * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingQuotation) {
      const { data: existingItems } = await serviceClient
        .from('quotation_items')
        .select('product_id, product_name, quantity, unit_price, specifications')
        .eq('quotation_id', existingQuotation.id);
      return NextResponse.json(
        {
          success: true,
          quotation: { ...existingQuotation, items: existingItems ?? [] },
          message: '同一内容の見積が直近で作成済みのため、重複保存をスキップしました。',
          messageEn: 'Skipped duplicate quotation (identical content within 5 min).',
          deduplicated: true,
        },
        { status: 200 } // 201 ではなく 200（既存返却）
      );
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
        total_cost_breakdown: body.total_cost_breakdown || {},
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
      cost_breakdown: item.cost_breakdown || {},
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
      items: items.map((item: { product_id: string; product_name: string; quantity: number; unit_price: number | string; specifications: unknown }) => ({
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

      // 管理者通知メール送信: quote_created_admin テンプレートは subject/plainText/html を
      // 「データ受け取り関数」として公開しているため、データを適用して文字列を生成し sendEmail() で送信する。
      // （修正前は sendTemplatedEmail を誤って 7 引数で呼び出しており、実質メール未送信だった）
      const adminEmailData = {
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
      };

      const emailResult = await sendEmail(
        'info@package-lab.com',
        subject(adminEmailData),
        plainText(adminEmailData),
        html(adminEmailData)
      );

      if (emailResult.success) {
        console.log('[Quotation API] Admin notification email sent for quotation:', quotation.quotation_number);
      } else {
        console.error('[Quotation API] Failed to send admin notification email:', emailResult.error);
      }
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
    // Task #27: getAuthenticatedUserFromHeaders trusts middleware-verified x-user-*
    // headers (DB-verified upstream), skipping the redundant getUser() RTT.
    // 認証結果（誰が認証されるか）は不変。検証経路の最適化のみ。
    const authUser = await getAuthenticatedUserFromHeaders(request);
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
        pdf_url,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // ステータスフィルターを適用 - check both lowercase and uppercase status
    // IDOR-safe: .or() ではなく .in() を使い、user_id 制約（外側の .eq('user_id')）が
    // or 短絡評価で無効化されるリスクを根本から回避。.in() は .eq('user_id') と AND 結合
    // されるため、他人の quotation が status 一致で漏洩することはない。
    if (status) {
      const statusValues = [status.toLowerCase(), status.toUpperCase()];
      query = query.in('status', statusValues);
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
      (quotations || []).map(async (quotation: { id: string } & Record<string, unknown>) => {
        const { data: items } = await serviceClient
          .from('quotation_items')
          .select('*')
          .eq('quotation_id', quotation.id)
          .order('display_order', { ascending: true });

        return {
          ...quotation,
          items: (items || []).map((i: any) => ({ ...i, orderId: i.order_id ?? null })),
        };
      })
    );

    // 総数を取得
    let countQuery = serviceClient
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // IDOR-safe: .or() を .in() で回避（L487 と同様・count クエリも user_id 制約維持）
    if (status) {
      const statusValues = [status.toLowerCase(), status.toUpperCase()];
      countQuery = countQuery.in('status', statusValues);
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
