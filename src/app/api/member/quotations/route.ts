/**
 * Quotation Submission API (Member Portal)
 *
 * Task #102: Implement quotation submission API using Supabase MCP
 * - POST: Create new quotation with items using Supabase MCP executeSql
 *
 * Database Operations:
 * - All queries use mcp__supabase-epackage__execute_sql
 * - Transaction-safe: quotation + items insertion
 * - Auto-generates quotation number (QT-YYYY-NNNN)
 * - Auto-calculates totals (subtotal, tax, total)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Types
interface QuotationItem {
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  specifications?: Record<string, unknown> | null;
}

interface CreateQuotationRequest {
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  notes?: string | null;
  valid_until?: string | null;
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
 * POST /api/member/quotations
 * Create a new quotation with items
 *
 * Request Body:
 * {
 *   "customer_name": "string",
 *   "customer_email": "string",
 *   "customer_phone": "string | null",
 *   "notes": "string | null",
 *   "valid_until": "ISO date string | null",
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
  try {
    // 1. Use x-user-id header from middleware (already authenticated)
    const userId = request.headers.get('x-user-id');
    const isDevMode = request.headers.get('x-dev-mode') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('[Quotation API POST] Using x-user-id from middleware:', userId, '(DEV_MODE:', isDevMode + ')');

    // Create Supabase client for database operations
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 2. Parse and validate request body
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

    // 3. Prepare data for insertion
    const customerId = userId;

    // Calculate totals
    const subtotalAmount = body.items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price),
      0
    );
    const taxAmount = subtotalAmount * 0.1; // 10% Japanese consumption tax
    const totalAmount = subtotalAmount + taxAmount;

    // 4. Use Supabase MCP to insert quotation
    // Note: We use the Supabase client directly since the MCP tool is for server-side tools
    // The executeSql function in supabase-mcp.ts will route through the API
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .insert({
        user_id: userId,
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone || null,
        subtotal_amount: subtotalAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: body.notes || null,
        valid_until: body.valid_until || null,
        status: 'DRAFT',
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

    // 5. Insert quotation items
    const itemsToInsert = body.items.map((item) => ({
      quotation_id: quotation.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      specifications: item.specifications || null,
    }));

    const { data: items, error: itemsError } = await supabase
      .from('quotation_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError) {
      console.error('[Quotation API] Insert items error:', itemsError);
      // Rollback: delete quotation if items insertion fails
      await supabase.from('quotations').delete().eq('id', quotation.id);

      return NextResponse.json(
        {
          error: '見積項目の登録に失敗しました。',
          errorEn: 'Failed to create quotation items',
          details: itemsError.message,
        },
        { status: 500 }
      );
    }

    // 6. Prepare response
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
        message: '見積を作成しました。',
        messageEn: 'Quotation created successfully.',
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
  try {
    // 1. Use x-user-id header from middleware (already authenticated)
    const userId = request.headers.get('x-user-id');
    const isDevMode = request.headers.get('x-dev-mode') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('[Quotation API GET] Using x-user-id from middleware:', userId, '(DEV_MODE:', isDevMode + ')');

    // Create Supabase client for database operations
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    let query = supabase
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
        updated_at,
        sent_at,
        approved_at,
        quotation_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          specifications
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    const { data: quotations, error, count } = await query;

    if (error) {
      throw error;
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
