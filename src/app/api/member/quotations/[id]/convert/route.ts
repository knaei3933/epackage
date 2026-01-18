/**
 * Convert Approved Quotation to Order API (Member Portal - Migrated from B2B)
 *
 * 承認された見積を注文に変換するAPI
 *
 * Allows customers to convert their approved quotations to orders
 * POST /api/member/quotations/[id]/convert - Convert quotation to order
 * GET /api/member/quotations/[id]/convert - Check conversion eligibility
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
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

/**
 * Helper: Get authenticated user with DEV_MODE support
 */
async function getAuthenticatedUser(request: NextRequest) {
  // Check for DEV_MODE header from middleware (DEV_MODE has priority)
  const devModeUserId = request.headers.get('x-user-id');
  const isDevMode = request.headers.get('x-dev-mode') === 'true';

  let userId: string;
  let user: any;

  if (isDevMode && devModeUserId) {
    // DEV_MODE: Use header from middleware
    console.log('[Convert to Order] DEV_MODE: Using x-user-id header:', devModeUserId);
    userId = devModeUserId;
    user = { id: devModeUserId, email: 'dev@example.com' };
  } else {
    // Normal auth: Use cookie-based auth with createSupabaseSSRClient
    const { client: supabase } = createSupabaseSSRClient(request);
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return null;
    }

    userId = authUser.id;
    user = authUser;
    console.log('[Convert to Order] Authenticated user:', userId);
  }

  return { userId, user };
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

    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const { userId, user } = authResult;
    const { client: supabase } = createSupabaseSSRClient(request);

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
        { success: false, error: '見積が見つかりません。' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (quotation.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Check if quotation is approved
    if (quotation.status !== 'APPROVED') {
      return NextResponse.json(
        {
          success: false,
          error: '承認された見積のみ注文に変換できます。',
          currentStatus: quotation.status,
        },
        { status: 400 }
      );
    }

    // Check if expired
    if (quotation.valid_until && new Date(quotation.valid_until) < new Date()) {
      return NextResponse.json(
        { success: false, error: '有効期限切れの見積です。' },
        { status: 400 }
      );
    }

    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'convert_quotation_to_order',
      userId,
      route: '/api/member/quotations/[id]/convert',
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
          message: '既に注文が生成されています。',
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
        p_user_id: userId,
        p_order_number: null, // Auto-generated
      }
    );

    if (rpcError) {
      console.error('[Convert to Order] RPC Error:', rpcError);
      return NextResponse.json(
        { success: false, error: '注文作成中にエラーが発生しました。', details: rpcError.message },
        { status: 500 }
      );
    }

    if (!rpcResult || rpcResult.length === 0) {
      return NextResponse.json(
        { success: false, error: '注文作成中に不明なエラーが発生しました。' },
        { status: 500 }
      );
    }

    const result = rpcResult[0];

    // Handle failure case
    if (!result.success || !result.order_id) {
      return NextResponse.json(
        {
          error: result.error_message || '注文作成中にエラーが発生しました。',
          success: result.success,
          order_id: result.order_id,
        },
        { status: result.error_message?.includes('見つかりません') ? 404 : 400 }
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
        message: '注文が生成されました。',
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
      message: '注文が生成されました。',
    });
  } catch (error: any) {
    console.error('[Convert to Order] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'サーバーエラーが発生しました。' },
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

    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const { userId } = authResult;
    const { client: supabase } = createSupabaseSSRClient(request);

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
        { success: false, error: '見積が見つかりません。' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (quotation.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Check if order exists
    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'convert_quotation_to_order',
      userId,
      route: '/api/member/quotations/[id]/convert',
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
            ? '見積が承認されていません。'
            : hasOrder
            ? '既に注文が生成されています。'
            : isExpired
            ? '有効期限が切れています。'
            : null,
        },
      },
    });
  } catch (error: any) {
    console.error('[Convert to Order] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
