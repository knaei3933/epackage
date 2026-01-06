/**
 * B2B 작업표준서 API (B2B Work Order API)
 * POST /api/b2b/work-orders - Create work order from order
 * GET /api/b2b/work-orders - List work orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST /api/b2b/work-orders - Create work order
export async function POST(request: NextRequest) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

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
    const {
      order_id,
      specifications,
      production_flow,
      quality_standards,
      packaging_specs,
      estimated_completion
    } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: '주문 ID는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    // Get order data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Check if work order already exists
    const { data: existingWorkOrder } = await supabase
      .from('work_orders')
      .select('id')
      .eq('order_id', order_id)
      .single();

    if (existingWorkOrder) {
      return NextResponse.json(
        { error: '이미 작업표준서가 생성된 주문입니다.', workOrderId: existingWorkOrder.id },
        { status: 400 }
      );
    }

    // Generate work order number (WO-YYYY-NNNN)
    const year = new Date().getFullYear();
    const workOrderNumber = `WO-${year}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Create work order
    const { data: workOrder, error: workOrderError } = await supabase
      .from('work_orders')
      .insert({
        work_order_number: workOrderNumber,
        order_id: order_id,
        specifications: specifications || {},
        production_flow: production_flow || [],
        quality_standards: quality_standards || {},
        pdf_url: null,
        status: 'GENERATED'
      })
      .select()
      .single();

    if (workOrderError) {
      console.error('Error creating work order:', workOrderError);
      return NextResponse.json(
        { error: '작업표준서 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'WORK_ORDER',
        current_state: 'work_order_created',
        state_metadata: {
          work_order_id: workOrder.id,
          work_order_number: workOrderNumber
        }
      })
      .eq('id', order_id);

    // Log status change
    await supabase
      .from('order_status_history')
      .insert({
        order_id: order_id,
        from_status: 'CONTRACT_SIGNED',
        to_status: 'WORK_ORDER',
        changed_by: user.id,
        reason: '작업표준서 생성'
      });

    return NextResponse.json({
      success: true,
      data: workOrder,
      message: '작업표준서가 생성되었습니다.'
    });

  } catch (error) {
    console.error('Work Order API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET /api/b2b/work-orders - List work orders
export async function GET(request: NextRequest) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const orderId = searchParams.get('order_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('work_orders')
      .select(`
        *,
        orders (
          id,
          order_number,
          customer_name
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter
    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    // Apply order filter
    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data: workOrders, error, count } = await query;

    if (error) {
      console.error('Error fetching work orders:', error);
      return NextResponse.json(
        { error: '작업표준서 목록을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: workOrders,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Work Order API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
