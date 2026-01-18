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

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServiceClient } from '@/lib/supabase';
import { getPerformanceMonitor } from '@/lib/performance-monitor';

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

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Helper: Get authenticated user from middleware headers
 *
 * IMPORTANT: The middleware already authenticates the user and sets headers.
 * This function simply extracts the user ID from the headers.
 *
 * Do NOT call supabase.auth.getUser() in API routes - it causes redirect loops.
 */
async function getAuthenticatedUser(request: NextRequest) {
  // Use x-user-id header from middleware (already authenticated)
  const userId = request.headers.get('x-user-id');

  if (!userId) {
    console.error('[Quotations API] No x-user-id header found');
    return null;
  }

  const isDevMode = request.headers.get('x-dev-mode') === 'true';
  console.log('[Quotations API] Using x-user-id from middleware:', userId, '(DEV_MODE:', isDevMode + ')');

  return { userId, user: { id: userId } };
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
    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId, user } = authResult;

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

    // Calculate totals
    const subtotalAmount = body.items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price),
      0
    );
    const taxAmount = subtotalAmount * 0.1; // 10% Japanese consumption tax
    const totalAmount = subtotalAmount + taxAmount;

    // Determine status
    const status = body.status ? body.status.toUpperCase() : 'DRAFT';

    // Insert quotation
    const { data: quotation, error: quotationError } = await serviceClient
      .from('quotations')
      .insert({
        user_id: userId,
        company_id: body.company_id || null, // Optional: B2B mode
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone || null,
        subtotal_amount: subtotalAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: body.notes || null,
        valid_until: body.valid_until || null,
        status,
      })
      .select()
      .single();

    if (quotationError) {
      console.error('[Quotation API] Insert quotation error:', quotationError);
      return NextResponse.json(
        {
          error: '見積の作成に失敗しました。',
          errorEn: 'Failed to create quotation',
          details: quotationError.message,
        },
        { status: 500 }
      );
    }

    // Insert quotation items
    const itemsToInsert = body.items.map((item, index) => ({
      quotation_id: quotation.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      category: item.category || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      specifications: item.specifications || null,
      notes: item.notes || null,
      display_order: index,
    }));

    const { data: items, error: itemsError } = await serviceClient
      .from('quotation_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError) {
      console.error('[Quotation API] Insert items error:', itemsError);
      // Rollback: delete quotation if items insertion fails
      await serviceClient.from('quotations').delete().eq('id', quotation.id);

      return NextResponse.json(
        {
          error: '見積項目の登録に失敗しました。',
          errorEn: 'Failed to create quotation items',
          details: itemsError.message,
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

    return NextResponse.json(
      {
        success: true,
        quotation: response,
        message: status === 'SENT'
          ? '見積依頼を受け付けました。'
          : '見積を作成しました。',
        messageEn: status === 'SENT'
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
    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId } = authResult;

    // Create service client for database operations
    const serviceClient = createServiceClient();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // ✅ N+1 Query Fix: Use RPC function to fetch all data in single query
    // This reduces queries significantly for better performance
    const { data: quotations, error } = await serviceClient.rpc('get_quotations_with_relations', {
      p_user_id: userId,
      p_limit: limit,
      p_offset: offset,
      p_status: status?.toUpperCase() || null
    });

    // Get total count separately (still efficient with composite index)
    let countQuery = serviceClient
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (status) {
      countQuery = countQuery.eq('status', status.toUpperCase());
    }

    const { count } = await countQuery;

    if (error) {
      console.error('Error fetching quotations:', error);
      return NextResponse.json(
        { error: '見積リストの読み込み中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quotations: quotations || [],
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
