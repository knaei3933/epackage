/**
 * Convert Approved Quotation to Order API (Member Portal - Migrated from B2B)
 *
 * 承認された見積を注文に変換するAPI
 *
 * Allows customers to convert their approved quotations to orders
 * POST /api/member/quotations/[id]/convert - Convert quotation to order
 * GET /api/member/quotations/[id]/convert - Check conversion eligibility
 */

export const dynamic = 'force-dynamic';

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
 * Helper: Get authenticated user
 */
async function getAuthenticatedUser(request: NextRequest) {
  // Normal auth: Use cookie-based auth with createSupabaseSSRClient
  const { client: supabase } = await createSupabaseSSRClient(request);
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const userId = authUser.id;
  const user = authUser;
  console.log('[Convert to Order] Authenticated user:', userId);

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
    const { id: quotationId } = params;

    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const { userId, user } = authResult;

    // Parse request body
    const body: ConvertToOrderRequest = await request.json();
    const { notes, deliveryAddress } = body;

    // Use normal SSR client with cookie auth
    const { client: supabase } = await createSupabaseSSRClient(request);

    // Get quotation data (simple query first)
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select('*')
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

    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'convert_quotation_to_order',
      userId,
      route: '/api/member/quotations/[id]/convert',
    });

    // Check if order already exists (check FIRST before status validation)
    // This allows returning existing order even if quotation was already converted
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, order_number')
      .eq('quotation_id', quotationId)
      .maybeSingle();

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

    // Check if quotation is approved (only if no existing order)
    // Support both legacy statuses (approved, APPROVED) and new workflow (QUOTATION_APPROVED)
    const isApproved = quotation.status === 'approved' ||
                      quotation.status === 'APPROVED' ||
                      quotation.status === 'QUOTATION_APPROVED';

    if (!isApproved) {
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

    // Generate order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

    // Get or create delivery and billing addresses
    let deliveryAddressId = quotation.delivery_address_id;
    let billingAddressId = quotation.billing_address_id;

    // Priority for delivery address:
    // 1. Use quotation's delivery_address_id if exists
    // 2. Use registered default delivery address (is_default = true)
    // 3. Create from user profile (registration address)
    if (!deliveryAddressId) {
      const { data: defaultDelivery } = await supabaseAdmin
        .from('delivery_addresses')
        .select('id')
        .eq('user_id', userId)
        .eq('is_default', true)
        .maybeSingle();

      if (defaultDelivery) {
        deliveryAddressId = defaultDelivery.id;
      } else {
        // Create delivery address from user profile
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('kanji_last_name, kanji_first_name, company_name, postal_code, prefecture, city, street, building')
          .eq('id', userId)
          .single();

        if (profile) {
          const fullName = (profile.kanji_last_name && profile.kanji_first_name)
            ? `${profile.kanji_last_name} ${profile.kanji_first_name}`
            : profile.company_name || 'お客様';

          const { data: newDeliveryAddress } = await supabaseAdmin
            .from('delivery_addresses')
            .insert({
              user_id: userId,
              name: fullName,
              postal_code: profile.postal_code || '',
              prefecture: profile.prefecture || '',
              city: profile.city || '',
              address: profile.street || '',
              building: profile.building || '',
              phone: '',
              is_default: true,
            })
            .select('id')
            .single();

          deliveryAddressId = newDeliveryAddress?.id || null;
        }
      }
    }

    // Same priority for billing address
    if (!billingAddressId) {
      const { data: defaultBilling } = await supabaseAdmin
        .from('billing_addresses')
        .select('id')
        .eq('user_id', userId)
        .eq('is_default', true)
        .maybeSingle();

      if (defaultBilling) {
        billingAddressId = defaultBilling.id;
      } else {
        // Create billing address from user profile
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('kanji_last_name, kanji_first_name, company_name, postal_code, prefecture, city, street, building, email')
          .eq('id', userId)
          .single();

        if (profile) {
          const companyName = profile.company_name ||
            ((profile.kanji_last_name && profile.kanji_first_name)
              ? `${profile.kanji_last_name} ${profile.kanji_first_name}`
              : 'お客様');

          const { data: newBillingAddress } = await supabaseAdmin
            .from('billing_addresses')
            .insert({
              user_id: userId,
              company_name: companyName,
              postal_code: profile.postal_code || '',
              prefecture: profile.prefecture || '',
              city: profile.city || '',
              address: profile.street || '',
              building: profile.building || '',
              email: profile.email || '',
              is_default: true,
            })
            .select('id')
            .single();

          billingAddressId = newBillingAddress?.id || null;
        }
      }
    }

    // Get quotation items to copy to order
    const { data: quotationItems, error: itemsError } = await supabaseAdmin
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', quotationId);

    if (itemsError) {
      console.error('[Convert to Order] Failed to fetch quotation items:', itemsError);
      return NextResponse.json(
        { success: false, error: '見積アイテムの取得に失敗しました。', details: itemsError?.message },
        { status: 500 }
      );
    }

    // Create order directly with contract skip
    // 새로운 워크플로우: 견적 승인 후 DATA_UPLOAD_PENDING 상태로 시작
    const { data: order, error: createError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        quotation_id: quotationId,
        order_number: orderNumber,
        status: 'DATA_UPLOAD_PENDING',  // 새 워크플로우: 데이터 입고 대기
        current_stage: 'AWAITING_DATA',  // 데이터 입고 대기
        total_amount: quotation.total_amount,
        customer_name: quotation.customer_name,
        customer_email: quotation.customer_email,
        customer_phone: quotation.customer_phone,
        delivery_address_id: deliveryAddressId,
        billing_address_id: billingAddressId,
        skip_contract: true,  // 계약서 프로세스 건너뛰기
      })
      .select()
      .single();

    if (createError || !order) {
      console.error('[Convert to Order] Create error:', createError);
      return NextResponse.json(
        { success: false, error: '注文作成中にエラーが発生しました。', details: createError?.message },
        { status: 500 }
      );
    }

    // Copy quotation items to order items
    if (quotationItems && quotationItems.length > 0) {
      const orderItems = quotationItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        specifications: item.specifications,
        // Note: total_price is a generated column (unit_price * quantity)
        // sku_index is not in order_items table
      }));

      const { error: itemsInsertError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItems);

      if (itemsInsertError) {
        console.error('[Convert to Order] Failed to insert order items:', itemsInsertError);
        // Don't fail the order creation, just log the error
      } else {
        console.log('[Convert to Order] Copied', orderItems.length, 'items to order');
      }
    }

    // Update quotation status to converted
    await supabaseAdmin
      .from('quotation')
      .update({ status: 'converted' })
      .eq('id', quotationId);

    // Notify admins about new order
    const { data: admins } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('role', 'ADMIN');

    console.log('[Convert to Order] New order created by customer:', {
      orderId: order.id,
      orderNumber: order.order_number,
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
    const { id: quotationId } = params;

    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const { userId } = authResult;

    // Use normal SSR client with cookie auth
    const { client: supabase } = await createSupabaseSSRClient(request);

    // Get quotation data
    const { data: quotation, error } = await supabase
      .from('quotations')
      .select('*')
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
    // Support both legacy statuses (approved, APPROVED) and new workflow (QUOTATION_APPROVED)
    const canConvert = quotation.status === 'approved' ||
                      quotation.status === 'APPROVED' ||
                      quotation.status === 'QUOTATION_APPROVED';
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
