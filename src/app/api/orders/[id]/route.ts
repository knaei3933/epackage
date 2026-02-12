/**
 * Order Detail API Route (Supabase)
 *
 * 注文詳細APIエンドポイント
 * - GET: 注文詳細の取得
 * - PUT: 注文の修正（配送先変更、仕様修正）
 *
 * Features:
 * - Join with order_items, production_orders, shipments
 * - Prevent N+1 queries with single optimized query
 * - Ownership verification
 * - Status-based modification restrictions
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase';
import type { OrderStatus } from '@/types/order-status';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseUrlTyped = supabaseUrl as string;
const supabaseAnonKeyTyped = supabaseAnonKey as string;

// ============================================================
// GET: 注文詳細の取得
// ============================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: orderId } = params;

    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrlTyped, supabaseAnonKeyTyped, {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = cookieStore.get(key);
            return cookie?.value ?? null;
          },
          setItem: (key: string, value: string) => {
            cookieStore.set(key, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          },
          removeItem: (key: string) => {
            cookieStore.delete(key);
          },
        },
      },
    });

    // 現在のユーザー確認
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    // Use service client to bypass RLS and get complete order data
    const supabaseAdmin = createServiceClient();

    // Fetch order with all related data in a single query to prevent N+1
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          specifications,
          notes
        ),
        quotations (
          id,
          quotation_number,
          status,
          valid_until
        )
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('[Order Detail] Order not found:', error);
      return NextResponse.json(
        { error: '注文が見つかりませんでした。' },
        { status: 404 }
      );
    }

    // Verify ownership (SECURE: server-side only dev mode)
    const isDevMode = process.env.NODE_ENV === 'development' &&
                      process.env.ENABLE_DEV_MOCK_AUTH === 'true';
    const DEV_MODE_ADMIN_USER_ID = '54fd7b31-b805-43cf-b92e-898ddd066875';
    const userIdForDb = isDevMode ? DEV_MODE_ADMIN_USER_ID : user.id;

    if (!isDevMode && order.user_id !== userIdForDb) {
      return NextResponse.json(
        { error: 'この注文にアクセスする権限がありません。' },
        { status: 403 }
      );
    }

    // Fetch production orders if they exist
    const { data: productionOrders } = await supabaseAdmin
      .from('production_orders')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    // Fetch shipments if they exist
    const { data: shipments } = await supabaseAdmin
      .from('shipments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      order: {
        ...order,
        production_orders: productionOrders || [],
        shipments: shipments || [],
      },
    });
  } catch (error) {
    console.error('[Order Detail] GET error:', error);

    return NextResponse.json(
      {
        error: '注文詳細の取得に失敗しました。',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT: 注文の修正
// ============================================================

interface UpdateOrderRequest {
  shippingAddress?: {
    name: string;
    postalCode: string;
    prefecture: string;
    city: string;
    address: string;
    building?: string;
    phone: string;
    contactPerson?: string;
  };
  billingAddress?: {
    companyName: string;
    postalCode: string;
    prefecture: string;
    city: string;
    address: string;
    building?: string;
    taxNumber?: string;
    email?: string;
    phone?: string;
  };
  notes?: string;
  requestedDeliveryDate?: string | null;
  deliveryNotes?: string | null;
}

const MODIFIABLE_STATUSES: OrderStatus[] = [
  'PENDING',
  'QUOTATION',
  'DATA_RECEIVED',
];

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: orderId } = params;

    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrlTyped, supabaseAnonKeyTyped, {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = cookieStore.get(key);
            return cookie?.value ?? null;
          },
          setItem: (key: string, value: string) => {
            cookieStore.set(key, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          },
          removeItem: (key: string) => {
            cookieStore.delete(key);
          },
        },
      },
    });

    // 現在のユーザー確認
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    const body = await request.json() as UpdateOrderRequest;

    // Create service client to bypass RLS
    const supabaseAdmin = createServiceClient();

    // Fetch order to verify ownership and status
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, status, order_number')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('[Order Update] Order not found:', orderError);
      return NextResponse.json(
        { error: '注文が見つかりませんでした。' },
        { status: 404 }
      );
    }

    // Verify ownership
    const isDevMode = process.env.NODE_ENV === 'development' &&
                      process.env.ENABLE_DEV_MOCK_AUTH === 'true';
    const DEV_MODE_ADMIN_USER_ID = '54fd7b31-b805-43cf-b92e-898ddd066875';
    const userIdForDb = isDevMode ? DEV_MODE_ADMIN_USER_ID : user.id;

    if (!isDevMode && order.user_id !== userIdForDb) {
      return NextResponse.json(
        { error: 'この注文を修正する権限がありません。' },
        { status: 403 }
      );
    }

    // Check if order can be modified
    if (!MODIFIABLE_STATUSES.includes(order.status as OrderStatus)) {
      return NextResponse.json(
        {
          error: `注文ステータスが「${order.status}」のため修正できません。`,
          currentStatus: order.status,
          modifiableStatuses: MODIFIABLE_STATUSES,
        },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (body.shippingAddress) {
      updateData.shipping_address = body.shippingAddress;
    }

    if (body.billingAddress) {
      updateData.billing_address = body.billingAddress;
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    if (body.requestedDeliveryDate !== undefined) {
      updateData.requested_delivery_date = body.requestedDeliveryDate;
    }

    if (body.deliveryNotes !== undefined) {
      updateData.delivery_notes = body.deliveryNotes;
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      console.error('[Order Update] Failed to update order:', updateError);
      return NextResponse.json(
        { error: '注文の更新に失敗しました。' },
        { status: 500 }
      );
    }

    console.log('[Order Update] Order updated:', {
      orderId,
      orderNumber: order.order_number,
      userId: userIdForDb,
      updateFields: Object.keys(updateData),
    });

    return NextResponse.json({
      order: updatedOrder,
      message: '注文を更新しました。',
    });
  } catch (error) {
    console.error('[Order Update] PUT error:', error);

    return NextResponse.json(
      {
        error: '注文の更新に失敗しました。',
      },
      { status: 500 }
    );
  }
}

// OPTIONSメソッド - CORS preflightリクエスト処理
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
