/**
 * B2B 주문 API (B2B Order API)
 * POST /api/b2b/orders - Create order from approved quotation
 * GET /api/b2b/orders - List orders
 *
 * Updated: Transaction-safe order creation using PostgreSQL RPC function
 * - Replaced manual rollback with ACID transaction
 * - Next.js 15+ compatibility with @supabase/ssr
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPerformanceMonitor } from '@/lib/performance-monitor';

// Initialize performance monitor
const perfMonitor = getPerformanceMonitor({
  slowQueryThreshold: 1000,
  enableLogging: true,
});

// POST /api/b2b/orders - Create order from approved quotation
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // Check if user is admin or operator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['ADMIN', 'OPERATOR'].includes(profile.role)) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { quotation_id } = body;

    if (!quotation_id) {
      return NextResponse.json(
        { error: '견적 ID는 필수 항목입니다.' },
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
        { error: '견적을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Check quotation status
    if (quotation.status !== 'APPROVED') {
      return NextResponse.json(
        { error: '승인된 견적만 주문으로 전환할 수 있습니다.' },
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
        { error: '이미 주문이 생성된 견적입니다.', orderId: existingOrder.id },
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
      p_user_id: user.id,
      p_order_number: null  // Auto-generated
    });

    if (rpcError) {
      console.error('RPC Error creating order:', rpcError);
      return NextResponse.json(
        { error: '주문 생성 중 오류가 발생했습니다.', details: rpcError.message },
        { status: 500 }
      );
    }

    // Check RPC function result
    if (!rpcResult || rpcResult.length === 0) {
      return NextResponse.json(
        { error: '주문 생성 중 알 수 없는 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    const result = rpcResult[0];

    // Handle edge case: order already exists
    if (result.order_id && result.error_message && result.error_message.includes('이미 주문이 생성')) {
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
          error: result.error_message || '주문 생성 중 오류가 발생했습니다.',
          success: result.success,
          order_id: result.order_id
        },
        { status: result.error_message?.includes('찾을 수 없습니다') ? 404 : 400 }
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
        message: '주문이 생성되었습니다.'
      });
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: '주문이 생성되었습니다.'
    });

  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    // Track order creation API execution time
    const duration = Date.now() - startTime;
    perfMonitor.trackQuery(`POST /api/b2b/orders`, duration);
  }
}

// GET /api/b2b/orders - List orders with filtering
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // Get user's role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'OPERATOR';

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const state = searchParams.get('state');
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        companies (
          id,
          name,
          name_kana
        ),
        quotations (
          id,
          quotation_number,
          pdf_url
        ),
        order_items (*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters based on role
    if (!isAdmin) {
      // Regular users can only see their own orders
      query = query.eq('user_id', user.id);
    } else {
      // Admins can filter by user_id
      if (userId) {
        query = query.eq('user_id', userId);
      }
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    // Apply state filter
    if (state) {
      query = query.eq('current_state', state);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: '주문 목록을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // Calculate progress percentage for each order
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

    const ordersWithProgress = (orders || []).map((order: any) => {
      const currentIndex = statusOrder.indexOf(order.status);
      const progressPercentage = currentIndex >= 0
        ? Math.round(((currentIndex + 1) / statusOrder.length) * 100)
        : 0;

      return {
        ...order,
        progress_percentage: progressPercentage
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: ordersWithProgress,
        total: orders?.length || 0
      },
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    // Track order list API execution time
    const duration = Date.now() - startTime;
    perfMonitor.trackQuery(`GET /api/b2b/orders`, duration);
  }
}
