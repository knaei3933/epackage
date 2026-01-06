/**
 * B2B 주문 추적 API (B2B Order Tracking API)
 * GET /api/b2b/orders/[id]/tracking - Get order tracking data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { id: orderId } = await context.params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // Get order with basic info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        current_state,
        created_at,
        state_metadata,
        profiles!orders_customer_id_fkey (
          id,
          full_name,
          email
        ),
        companies!orders_company_id_fkey (
          id,
          company_name
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Check access permission (customer or admin/operator)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: '프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const isAdmin = ['ADMIN', 'OPERATOR'].includes(profile.role);
    const isOwner = (order as any).profiles?.[0]?.id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // Get status history
    const { data: statusHistory } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('changed_at', { ascending: false });

    // Get production logs
    const { data: productionLogs } = await supabase
      .from('production_logs')
      .select('*')
      .eq('order_id', orderId)
      .order('logged_at', { ascending: false });

    // Get work order if exists
    const { data: workOrder } = await supabase
      .from('work_orders')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    // Get contract if exists
    const { data: contract } = await supabase
      .from('contracts')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    // Format response data
    const trackingData = {
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        current_state: order.current_state,
        customer_name: (order as any).companies?.[0]?.company_name || (order as any).profiles?.[0]?.full_name,
        created_at: order.created_at,
        state_metadata: order.state_metadata
      },
      statusHistory: statusHistory || [],
      productionLogs: productionLogs || [],
      workOrder: workOrder ? {
        work_order_number: workOrder.work_order_number,
        pdf_url: workOrder.pdf_url,
        specifications: workOrder.specifications
      } : undefined,
      contract: contract ? {
        contract_number: contract.contract_number,
        pdf_url: contract.pdf_url,
        customer_signed_at: contract.customer_signed_at,
        admin_signed_at: contract.admin_signed_at
      } : undefined
    };

    return NextResponse.json({
      success: true,
      data: trackingData
    });

  } catch (error) {
    console.error('Order Tracking API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
