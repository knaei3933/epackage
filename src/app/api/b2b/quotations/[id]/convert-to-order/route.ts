/**
 * Convert Approved Quotation to Order API
 *
 * 승인된 견적을 주문으로 전환하는 API
 *
 * Allows customers to convert their approved quotations to orders
 * POST /api/b2b/quotations/[id]/convert-to-order - Convert quotation to order
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

// ============================================================
// Types
// ============================================================

interface ConvertToOrderRequest {
  quotationId: string;
  notes?: string;
  deliveryAddress?: {
    postalCode: string;
    prefecture: string;
    city: string;
    address: string;
    building?: string;
    contactPerson?: string;
    contactPhone?: string;
  };
}

// ============================================================
// POST: Convert Quotation to Order
// ============================================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quotationId = params.id;

    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: ConvertToOrderRequest = await request.json();
    const { notes, deliveryAddress } = body;

    // Get quotation data with items
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select(`
        *,
        companies (
          id,
          name,
          name_kana,
          postal_code,
          prefecture,
          city,
          address,
          building
        ),
        quotation_items (*)
      `)
      .eq('id', quotationId)
      .single();

    if (quotationError || !quotation) {
      return NextResponse.json(
        { success: false, error: '견적을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (quotation.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // Check if quotation is approved
    if (quotation.status !== 'APPROVED') {
      return NextResponse.json(
        {
          success: false,
          error: '승인된 견적만 주문으로 전환할 수 있습니다.',
          currentStatus: quotation.status,
        },
        { status: 400 }
      );
    }

    // Check if expired
    if (quotation.valid_until && new Date(quotation.valid_until) < new Date()) {
      return NextResponse.json(
        { success: false, error: '유효기간이 만료된 견적입니다.' },
        { status: 400 }
      );
    }

    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'convert_quotation_to_order',
      userId: user.id,
      route: '/api/b2b/quotations/[id]/convert-to-order',
    });

    // Check if order already exists
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, order_number')
      .eq('quotation_id', quotationId)
      .single();

    if (existingOrder) {
      return NextResponse.json(
        {
          success: true,
          data: existingOrder,
          message: '이미 주문이 생성되었습니다.',
          alreadyExists: true,
        },
        { status: 200 }
      );
    }

    // Use the RPC function to create order from quotation
    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
      'create_order_from_quotation',
      {
        p_quotation_id: quotationId,
        p_user_id: user.id,
        p_order_number: null, // Auto-generated
      }
    );

    if (rpcError) {
      console.error('[Convert to Order] RPC Error:', rpcError);
      return NextResponse.json(
        { success: false, error: '주문 생성 중 오류가 발생했습니다.', details: rpcError.message },
        { status: 500 }
      );
    }

    if (!rpcResult || rpcResult.length === 0) {
      return NextResponse.json(
        { success: false, error: '주문 생성 중 알 수 없는 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    const result = rpcResult[0];

    // Handle failure case
    if (!result.success || !result.order_id) {
      return NextResponse.json(
        {
          error: result.error_message || '주문 생성 중 오류가 발생했습니다.',
          success: result.success,
          order_id: result.order_id,
        },
        { status: result.error_message?.includes('찾을 수 없습니다') ? 404 : 400 }
      );
    }

    // Fetch complete order data
    const { data: order, error: fetchError } = await supabaseAdmin
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
      console.error('[Convert to Order] Fetch error:', fetchError);
      // Order was created successfully, but fetch failed
      return NextResponse.json({
        success: true,
        data: { id: result.order_id, order_number: result.order_number },
        message: '주문이 생성되었습니다.',
      });
    }

    // Notify admins about new order
    const { data: admins } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('role', 'ADMIN');

    console.log('[Convert to Order] New order created by customer:', {
      orderId: result.order_id,
      orderNumber: result.order_number,
      quotationId,
      customerEmail: user.email,
      adminEmails: admins?.map((a: any) => a.email) || [],
    });

    return NextResponse.json({
      success: true,
      data: order,
      message: '주문이 생성되었습니다.',
    });
  } catch (error: any) {
    console.error('[Convert to Order] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// ============================================================
// GET: Check if quotation can be converted to order
// ============================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quotationId = params.id;

    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // Get quotation data
    const { data: quotation, error } = await supabase
      .from('quotations')
      .select(`
        *,
        companies (*)
      `)
      .eq('id', quotationId)
      .single();

    if (error || !quotation) {
      return NextResponse.json(
        { success: false, error: '견적을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (quotation.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // Check if order exists
    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'convert_quotation_to_order',
      userId: user.id,
      route: '/api/b2b/quotations/[id]/convert-to-order',
    });

    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, created_at')
      .eq('quotation_id', quotationId)
      .maybeSingle();

    // Check conversion eligibility
    const canConvert = quotation.status === 'APPROVED';
    const isExpired =
      quotation.valid_until && new Date(quotation.valid_until) < new Date();
    const hasOrder = !!existingOrder;

    return NextResponse.json({
      success: true,
      data: {
        quotation: {
          id: quotation.id,
          quotation_number: quotation.quotation_number,
          status: quotation.status,
          total_amount: quotation.total_amount,
          valid_until: quotation.valid_until,
        },
        conversionStatus: {
          canConvert: canConvert && !hasOrder && !isExpired,
          isExpired,
          hasOrder,
          existingOrder,
          reason: !canConvert
            ? '견적이 승인되지 않았습니다.'
            : hasOrder
            ? '이미 주문이 생성되었습니다.'
            : isExpired
            ? '유효기간이 만료되었습니다.'
            : null,
        },
      },
    });
  } catch (error: any) {
    console.error('[Convert to Order] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
