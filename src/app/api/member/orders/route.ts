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

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromHeaders } from '@/lib/supabase-ssr';
import type { Database } from '@/types/database';
import { getStatusProgress, isOrderStatus } from '@/types/order-status';
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
 * GET /api/member/orders - List orders with filtering
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Task #27: getAuthenticatedUserFromHeaders trusts middleware-verified x-user-*
    // headers (DB-verified upstream), skipping the redundant getUser() RTT and
    // returning role/status directly — so the separate profiles(role) SELECT is removed.
    // 認証結果（誰が認証されるか）は不変。検証経路の最適化のみ。
    const authUser = await getAuthenticatedUserFromHeaders(request);
    if (!authUser) {
      return NextResponse.json(
        { error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const { id: userId, supabase, role } = authUser;

    // 注: role は実行時 'OPERATOR' 等の追加値も入り得るため string キャストで比較（実行時ロジック不変）。
    const isAdmin = (role as string) === 'ADMIN' || (role as string) === 'OPERATOR';

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
    // 注: quotations/order_items リレーション解決で postgrest-js の型推論が
    // 発散し TS2589 が発生するため、中間クエリ型を any で受ける（実行時ロジック不変）。
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('orders')
      .select(`
        *,
        quotations (
          id,
          quotation_number,
          pdf_url,
          quotation_items (*)
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
    // 旧レガシーステータス（DB 残存可能性）のための推定進捗フォールバック
    const legacyProgressMap: Record<string, number> = {
      PENDING: 0,
      QUOTATION: 10,
      DATA_RECEIVED: 30,
      WORK_ORDER: 50,
      CONTRACT_SENT: 55,
      CONTRACT_SIGNED: 60,
      STOCK_IN: 90,
      DELIVERED: 100,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ordersWithProgress = (ordersWithRelations || []).map((order: any) => {
      // 進捗率は正規14ステータス体系（getStatusProgress）で算出。
      // current_stage（旧フロント用 current_state エイリアス）はステージ表示用であり進捗計算には使わない。
      // status が正規14ステータスでない旧値の場合のみ legacyProgressMap でフォールバック。
      const status = order.status;
      const progressPercentage = isOrderStatus(status)
        ? getStatusProgress(status)
        : (legacyProgressMap[status] ?? (status === 'SHIPPED' ? 100 : 0));

      // Extract order_items array from Supabase relation format
      // Supabase returns relations as { data: [...], ... } or directly as array
      const orderItemsArray = Array.isArray(order.order_items)
        ? order.order_items
        : order.order_items?.data || null;

      return {
        ...order,
        progress_percentage: progressPercentage,
        // Convert order_items to items for client compatibility
        items: orderItemsArray
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
    // Task #27: getAuthenticatedUserFromHeaders trusts middleware-verified x-user-*
    // headers (role DB-verified upstream), skipping the redundant getUser() RTT and
    // the separate profiles(role) SELECT. 認証結果（誰が認証されるか）は不変。
    const authUser = await getAuthenticatedUserFromHeaders(request);
    if (!authUser) {
      return NextResponse.json(
        { error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const { id: userId, supabase, role } = authUser;

    // Check if user is admin or operator (role verified by middleware via DB lookup)
    if (!['ADMIN', 'OPERATOR'].includes(role)) {
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
    // Support legacy lowercase ('approved'), uppercase ('APPROVED'), and
    // new-workflow ('QUOTATION_APPROVED') — matches the customer-facing
    // convert route and the UPPER-normalized check inside create_order_from_quotation.
    // Cast to string for legacy/new comparison without TS2367 (runtime logic unchanged:
    // all three values are semantically "approved").
    const quotationStatus = quotation.status as unknown as string;
    const isApproved = quotationStatus === 'approved' ||
                       quotationStatus === 'APPROVED' ||
                       quotationStatus === 'QUOTATION_APPROVED';
    if (!isApproved) {
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
