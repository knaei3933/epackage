/**
 * Member Work Orders API
 * POST /api/member/work-orders - Create work order from order
 * GET /api/member/work-orders - List work orders
 *
 * Migrated from /api/b2b/work-orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { sendWorkOrderEmails } from '@/lib/email';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@epackage-lab.com';

// ============================================================
// Helper: Get authenticated user ID with DEV_MODE support
// ============================================================

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const devModeUserId = request.headers.get('x-user-id');
  const isDevMode = request.headers.get('x-dev-mode') === 'true';

  if (isDevMode && devModeUserId) {
    console.log('[Work Orders API] DEV_MODE: Using x-user-id header:', devModeUserId);
    return devModeUserId;
  }

  // Try to get user from middleware header first (more reliable)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && isFromMiddleware) {
    console.log('[Work Orders API] Using user ID from middleware:', userIdFromMiddleware);
    return userIdFromMiddleware;
  }

  // Fallback to SSR client auth
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const response = NextResponse.json({ success: false });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('[Work Orders API] Auth error:', authError);
    return null;
  }

  return user.id;
}

// ============================================================
// Helper: Create Supabase client for database operations
// ============================================================

function createSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });
}

// POST /api/member/work-orders - Create work order
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const supabase = createSupabaseClient(request);

    // Check if user is admin or operator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile || !['ADMIN', 'OPERATOR'].includes(profile.role)) {
      return NextResponse.json(
        { error: '権限がありません。' },
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
        { error: '注文IDは必須項目です。' },
        { status: 400 }
      );
    }

    // Use authenticated service client for write operations
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'create_work_order',
      userId: userId,
      route: '/api/member/work-orders',
    });

    // Get order data
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりません。' },
        { status: 404 }
      );
    }

    // Check if work order already exists
    const { data: existingWorkOrder } = await supabaseAdmin
      .from('work_orders')
      .select('id')
      .eq('order_id', order_id)
      .single();

    if (existingWorkOrder) {
      return NextResponse.json(
        { error: 'すでに作業標準書が作成された注文です。', workOrderId: existingWorkOrder.id },
        { status: 400 }
      );
    }

    // Generate work order number (WO-YYYY-NNNN)
    const year = new Date().getFullYear();
    const workOrderNumber = `WO-${year}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Create work order
    const { data: workOrder, error: workOrderError } = await supabaseAdmin
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
        { error: '作業標準書の作成中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    // Update order status
    await supabaseAdmin
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
    await supabaseAdmin
      .from('order_status_history')
      .insert({
        order_id: order_id,
        from_status: 'CONTRACT_SIGNED',
        to_status: 'WORK_ORDER',
        changed_by: userId,
        reason: '作業標準書作成'
      });

    // ============================================================
    // Email Notification: Work Order Created
    // ============================================================

    try {
      // Get order items for email
      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select('product_name, quantity')
        .eq('order_id', order_id);

      // Prepare work order data for email
      const workOrderData = {
        workOrderId: workOrder.id,
        workOrderNumber: workOrderNumber,
        orderId: order_id,
        orderNumber: order.order_number,
        customerName: order.customer_name || 'お客様',
        customerEmail: order.customer_email || ADMIN_EMAIL,
        estimatedCompletion: estimated_completion || order.estimated_delivery_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        productionTimeline: {
          total_days: 14,
          steps: [
            { step: 'design', name_ja: 'デザイン', name_en: 'Design', duration_days: 3 },
            { step: 'production', name_ja: '製造', name_en: 'Production', duration_days: 7 },
            { step: 'quality_check', name_ja: '品質検査', name_en: 'Quality Check', duration_days: 2 },
            { step: 'packaging', name_ja: '梱包', name_en: 'Packaging', duration_days: 2 },
          ],
        },
        materialRequirements: [],
        items: orderItems?.map((item: any) => ({
          product_name: item.product_name,
          quantity: item.quantity,
        })) || [],
      };

      // Send work order emails (customer + production team)
      await sendWorkOrderEmails(workOrderData);

      console.log('[Work Order] Emails sent successfully:', {
        workOrderId: workOrder.id,
        workOrderNumber,
        customerEmail: order.customer_email,
      });
    } catch (emailError) {
      console.error('[Work Order] Email error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      data: workOrder,
      message: '作業標準書が作成されました。'
    });

  } catch (error) {
    console.error('Work Order API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// GET /api/member/work-orders - List work orders
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const supabase = createSupabaseClient(request);

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
        { error: '作業標準書リストの読み込み中にエラーが発生しました。' },
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
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
