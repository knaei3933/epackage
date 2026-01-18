/**
 * Member Orders API (Unified B2B + Member)
 *
 * GET /api/member/orders - List authenticated member's orders with filtering
 * POST /api/member/orders - Create order from approved quotation (admin/operator only)
 *
 * Updated: Transaction-safe order creation using PostgreSQL RPC function
 * - Replaced manual rollback with ACID transaction
 * - Next.js 15+ compatibility with @supabase/ssr
 * - Supports both B2B (company_id) and Member (user_id) patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { getPerformanceMonitor } from '@/lib/performance-monitor';

// Initialize performance monitor
const perfMonitor = getPerformanceMonitor({
  slowQueryThreshold: 1000,
  enableLogging: true,
});

type OrderWithRelations = Database['public']['Tables']['orders']['Row'] & {
  quotations?: {
    id: string;
    quotation_number: string;
    pdf_url: string | null;
  } | null;
  order_items?: Database['public']['Tables']['order_items']['Row'][];
};

/**
 * Helper: Get authenticated user with DEV_MODE support
 */
async function getAuthenticatedUser(request: NextRequest) {
  // Check for DEV_MODE header from middleware (DEV_MODE has priority)
  const devModeUserId = request.headers.get('x-user-id');
  const isDevMode = request.headers.get('x-dev-mode') === 'true';

  let userId: string;
  let user: any;
  let supabase: any;

  if (isDevMode && devModeUserId) {
    // DEV_MODE: Use header from middleware
    console.log('[Orders API] DEV_MODE: Using x-user-id header:', devModeUserId);
    userId = devModeUserId;
    user = { id: devModeUserId };
    const { client: supabaseClient } = createSupabaseSSRClient(request);
    supabase = supabaseClient;
  } else {
    // Normal auth: Use cookie-based auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Try to get user from middleware header first (more reliable)
    const userIdFromMiddleware = request.headers.get('x-user-id');
    const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

    if (userIdFromMiddleware && isFromMiddleware) {
      userId = userIdFromMiddleware;
      console.log('[Orders API] Using user ID from middleware:', userId);
      const response = NextResponse.json({ success: false });
      supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            response.cookies.delete({ name, ...options });
          },
        },
      });
      user = { id: userId };
    } else {
      // Fallback to SSR client auth
      const response = NextResponse.json({ success: false });
      supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            response.cookies.delete({ name, ...options });
          },
        },
      });

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        console.error('[Orders API] Auth error:', authError);
        return null;
      }
      userId = authUser.id;
      user = authUser;
      console.log('[Orders API] Authenticated user:', userId);
    }
  }

  return { userId, user, supabase };
}

/**
 * GET /api/member/orders - List orders with filtering
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const { userId, supabase } = authResult;

    // Get user's role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'OPERATOR';

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const state = searchParams.get('state');
    const searchUserId = searchParams.get('user_id');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query with JOINs to fetch related data in a SINGLE query (fixes N+1 query problem)
    // Performance: Instead of 1 + 2N queries, we now use only 1 query
    let query = supabase
      .from('orders')
      .select(`
        *,
        quotations (
          id,
          quotation_number,
          pdf_url
        ),
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    // Apply filters based on role
    if (!isAdmin) {
      // Regular users can only see their own orders
      query = query.eq('user_id', userId);
    } else {
      // Admins can filter by user_id
      if (searchUserId) {
        query = query.eq('user_id', searchUserId);
      }
    }

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status.toUpperCase());
    }

    // Apply state filter
    if (state) {
      query = query.eq('current_state', state);
    }

    // Apply search filter (order_number, customer_name)
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%`);
    }

    // Apply date range filter
    if (startDate) {
      query = query.gte('created_at', new Date(startDate).toISOString());
    }
    if (endDate) {
      query = query.lte('created_at', new Date(endDate).toISOString());
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: ordersWithRelations, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: '注文リストの読み込み中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    // Transform and calculate progress percentage for each order
    const statusOrder = [
      'QUOTATION',
      'DATA_RECEIVED',
      'WORK_ORDER',
      'CONTRACT_SENT',
      'CONTRACT_SIGNED',
      'PRODUCTION',
      'STOCK_IN',
      'SHIPPED',
      'DELIVERED'
    ];

    const ordersWithProgress = (ordersWithRelations || []).map((order) => {
      // Calculate progress percentage
      const progressPercentage = order.current_state
        ? (() => {
            const currentIndex = statusOrder.indexOf(order.current_state);
            return currentIndex >= 0
              ? Math.round(((currentIndex + 1) / statusOrder.length) * 100)
              : 0;
          })()
        : 0;

      return {
        ...order,
        progress_percentage: progressPercentage
      };
    });

    console.log('[Orders API] Successfully fetched orders:', ordersWithProgress?.length || 0);

    return NextResponse.json({
      success: true,
      data: ordersWithProgress,
    });

  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  } finally {
    // Track order list API execution time
    const duration = Date.now() - startTime;
    perfMonitor.trackQuery(`GET /api/member/orders`, duration);
  }
}

/**
 * POST /api/member/orders - Create order from approved quotation (admin/operator only)
 * Note: For customers, use the convert endpoint: /api/member/quotations/[id]/convert
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const { userId, supabase } = authResult;

    // Check if user is admin or operator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile || !['ADMIN', 'OPERATOR'].includes(profile.role)) {
      return NextResponse.json(
        { error: '権限がありません。管理者またはオペレーターのみ注文を作成できます。' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { quotation_id } = body;

    if (!quotation_id) {
      return NextResponse.json(
        { error: '見積IDは必須項目です。' },
        { status: 400 }
      );
    }

    // Get quotation data
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select(`
        *,
        companies (*),
        quotation_items (*)
      `)
      .eq('id', quotation_id)
      .single();

    if (quotationError || !quotation) {
      return NextResponse.json(
        { error: '見積が見つかりません。' },
        { status: 404 }
      );
    }

    // Check quotation status
    if (quotation.status !== 'APPROVED') {
      return NextResponse.json(
        { error: '承認済みの見積のみ注文に変換できます。' },
        { status: 400 }
      );
    }

    // Check if order already exists
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('quotation_id', quotation_id)
      .single();

    if (existingOrder) {
      return NextResponse.json(
        { error: '既に注文が作成された見積です。', orderId: existingOrder.id },
        { status: 400 }
      );
    }

    // =====================================================
    // Create Order Using Transaction-Safe RPC Function
    // =====================================================
    // All operations wrapped in ACID transaction:
    // 1. Create order record
    // 2. Create order items (from quotation items)
    // 3. Update quotation status to CONVERTED
    // 4. Create order status history entry
    //
    // If any operation fails, the entire transaction is rolled back
    // automatically by PostgreSQL.

    const { data: rpcResult, error: rpcError } = await supabase.rpc('create_order_from_quotation', {
      p_quotation_id: quotation_id,
      p_user_id: userId,
      p_order_number: null  // Auto-generated
    });

    if (rpcError) {
      console.error('RPC Error creating order:', rpcError);
      return NextResponse.json(
        { error: '注文作成中にエラーが発生しました。', details: rpcError.message },
        { status: 500 }
      );
    }

    // Check RPC function result
    if (!rpcResult || rpcResult.length === 0) {
      return NextResponse.json(
        { error: '注文作成中に不明なエラーが発生しました。' },
        { status: 500 }
      );
    }

    const result = rpcResult[0];

    // Handle edge case: order already exists
    if (result.order_id && result.error_message && result.error_message.includes('既に注文が作成')) {
      return NextResponse.json(
        {
          success: true,
          data: { id: result.order_id, order_number: result.order_number },
          message: result.error_message
        },
        { status: 200 }
      );
    }

    // Handle failure case
    if (!result.success || !result.order_id) {
      return NextResponse.json(
        {
          error: result.error_message || '注文作成中にエラーが発生しました。',
          success: result.success,
          order_id: result.order_id
        },
        { status: result.error_message?.includes('見つかりません') ? 404 : 400 }
      );
    }

    // Fetch the complete order data for response
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        companies (*),
        quotations (
          id,
          quotation_number,
          pdf_url
        ),
        order_items (*)
      `)
      .eq('id', result.order_id)
      .single();

    if (fetchError) {
      console.error('Error fetching created order:', fetchError);
      // Order was created successfully, but fetch failed
      return NextResponse.json({
        success: true,
        data: { id: result.order_id, order_number: result.order_number },
        message: '注文が作成されました。'
      });
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: '注文が作成されました。'
    });

  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  } finally {
    // Track order creation API execution time
    const duration = Date.now() - startTime;
    perfMonitor.trackQuery(`POST /api/member/orders`, duration);
  }
}
