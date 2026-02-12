/**
 * Member Order Tracking API (Unified B2B + Member)
 *
 * GET /api/member/orders/[id]/tracking - Get order tracking data
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';

/**
 * Helper: Get authenticated user
 */
async function getAuthenticatedUser(request: NextRequest) {
  // Use cookie-based auth with createSupabaseSSRClient
  const { client: supabase } = await createSupabaseSSRClient($$$ARGS);
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const userId = authUser.id;
  console.log('[Order Tracking] Authenticated user:', userId);

  return { userId, user: authUser };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const { userId } = authResult;
    const { client: supabase } = await createSupabaseSSRClient($$$ARGS);
    const { id: orderId } = await context.params;

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
        user_id,
        company_id
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりません。' },
        { status: 404 }
      );
    }

    // Check access permission (customer or admin/operator)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, id')
      .eq('id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'プロフィールが見つかりません。' },
        { status: 404 }
      );
    }

    const isAdmin = ['ADMIN', 'OPERATOR'].includes(profile.role);
    const isOwner = order.user_id === userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: '権限がありません。' },
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

    // Get company info if exists
    let company: any = null;
    if (order.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, name_kana')
        .eq('id', order.company_id)
        .single();
      company = companyData;
    }

    // Get user profile for customer name
    let customerName: string | null = null;
    if (order.user_id) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('kanji_last_name, kanji_first_name')
        .eq('id', order.user_id)
        .single();
      if (userProfile) {
        customerName = `${userProfile.kanji_last_name || ''} ${userProfile.kanji_first_name || ''}`.trim();
      }
    }

    // Format response data
    const trackingData = {
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        current_state: order.current_state,
        customer_name: company?.name || customerName || '未登録',
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
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
