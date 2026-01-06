/**
 * B2B 계약서 API (B2B Contract API)
 * POST /api/b2b/contracts - Create contract from order
 * GET /api/b2b/contracts - List contracts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST /api/b2b/contracts - Create contract from order
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
    const { order_id, work_order_id } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: '주문 ID는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    // Get order data with related information
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        companies (*),
        quotations (
          id,
          quotation_number,
          quotation_items (*)
        ),
        order_items (*)
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Check if contract already exists
    const { data: existingContract } = await supabase
      .from('contracts')
      .select('id')
      .eq('order_id', order_id)
      .single();

    if (existingContract) {
      return NextResponse.json(
        { error: '이미 계약서가 생성된 주문입니다.', contractId: existingContract.id },
        { status: 400 }
      );
    }

    // Generate contract number (CTR-YYYY-NNNN)
    const year = new Date().getFullYear();
    const contractNumber = `CTR-${year}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Calculate total amount from order items or use order total
    const totalAmount = order.total_amount;

    // Create contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .insert({
        contract_number: contractNumber,
        order_id: order_id,
        work_order_id: work_order_id || null,
        company_id: order.company_id,
        customer_name: order.customer_name,
        total_amount: totalAmount,
        status: 'DRAFT'
      })
      .select()
      .single();

    if (contractError) {
      console.error('Error creating contract:', contractError);
      return NextResponse.json(
        { error: '계약서 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'CONTRACT_SENT',
        current_state: 'contract_sent',
        state_metadata: {
          contract_id: contract.id,
          contract_number: contractNumber
        }
      })
      .eq('id', order_id);

    // Log status change
    await supabase
      .from('order_status_history')
      .insert({
        order_id: order_id,
        from_status: 'QUOTATION',
        to_status: 'CONTRACT_SENT',
        changed_by: user.id,
        reason: '계약서 송부'
      });

    return NextResponse.json({
      success: true,
      data: contract,
      message: '계약서가 생성되었습니다.'
    });

  } catch (error) {
    console.error('Contract API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET /api/b2b/contracts - List contracts
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

    // Get user's role and company
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'OPERATOR';

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const orderId = searchParams.get('order_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('contracts')
      .select(`
        *,
        companies (
          id,
          name,
          name_kana
        ),
        orders (
          id,
          order_number,
          customer_name
        ),
        work_orders (
          id,
          work_order_number,
          pdf_url
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters based on role
    if (!isAdmin) {
      // Regular users can only see contracts for their company
      if (profile?.company_id) {
        query = query.eq('company_id', profile.company_id);
      } else {
        // If no company, return empty
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { limit, offset, total: 0 }
        });
      }
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    // Apply order filter
    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data: contracts, error, count } = await query;

    if (error) {
      console.error('Error fetching contracts:', error);
      return NextResponse.json(
        { error: '계약서 목록을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contracts,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Contract API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
