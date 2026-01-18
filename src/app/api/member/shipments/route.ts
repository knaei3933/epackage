/**
 * Member Shipments API
 * POST /api/member/shipments - Process shipment
 *
 * Migrated from /api/b2b/shipments
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

// ============================================================
// Helper: Get authenticated user ID with DEV_MODE support
// ============================================================

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const devModeUserId = request.headers.get('x-user-id');
  const isDevMode = request.headers.get('x-dev-mode') === 'true';

  if (isDevMode && devModeUserId) {
    console.log('[Shipments API] DEV_MODE: Using x-user-id header:', devModeUserId);
    return devModeUserId;
  }

  // Try to get user from middleware header first (more reliable)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && isFromMiddleware) {
    console.log('[Shipments API] Using user ID from middleware:', userIdFromMiddleware);
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
    console.error('[Shipments API] Auth error:', authError);
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
      invoice_number,
      carrier,
      tracking_number,
      tracking_url,
      shipping_date
    } = body;

    if (!order_id || !invoice_number || !carrier) {
      return NextResponse.json(
        { error: '必須項目が不足しています。' },
        { status: 400 }
      );
    }

    // Use authenticated service client for write operations
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'process_shipment',
      userId: userId,
      route: '/api/member/shipments',
    });

    // Update order with shipment info
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'SHIPPED',
        current_state: 'shipped',
        shipped_at: new Date(shipping_date).toISOString(),
        state_metadata: {
          invoice_number,
          carrier,
          tracking_number,
          tracking_url
        }
      })
      .eq('id', order_id);

    if (updateError) {
      throw updateError;
    }

    // Log shipment
    await supabaseAdmin
      .from('order_audit_log')
      .insert({
        table_name: 'shipments',
        record_id: order_id,
        action: 'INSERT',
        new_data: {
          invoice_number,
          carrier,
          tracking_number,
          tracking_url,
          shipping_date,
          shipped_by: userId
        },
        changed_by: userId
      });

    // Log status change
    await supabaseAdmin
      .from('order_status_history')
      .insert({
        order_id: order_id,
        from_status: 'STOCK_IN',
        to_status: 'SHIPPED',
        changed_by: userId,
        reason: `出荷完了: ${carrier} (${invoice_number})`
      });

    // TODO: Send notification to customer (email/SMS)
    // await sendShipmentNotification(order_id, tracking_number, tracking_url);

    return NextResponse.json({
      success: true,
      message: '出荷処理が完了しました。'
    });

  } catch (error) {
    console.error('Shipment API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
