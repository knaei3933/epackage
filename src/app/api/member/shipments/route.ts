/**
 * Member Shipments API
 * POST /api/member/shipments - Process shipment
 *
 * Migrated from /api/b2b/shipments
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

// ============================================================
// Helper: Get authenticated user ID
// ============================================================

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
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

    // C-19: 出荷前の status を取得（監査正確性・Phase 1 start-production と同じパターン）
    const { data: orderBefore } = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('id', order_id)
      .single();
    const previousStatus = (orderBefore?.status as string) || 'STOCK_IN';

    // C-19: 存在しない current_state/state_metadata カラム参照を削除。
    // current_stage を status と同期（Phase 1 原則: status + current_stage 同時更新）。
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'SHIPPED',
        current_stage: 'SHIPPED',
        shipped_at: new Date(shipping_date).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (updateError) {
      throw updateError;
    }

    // C-19: order_audit_log（本番未存在テーブル）参照を削除。監査証跡は order_status_history に統一。
    // invoice/carrier/tracking 情報は reason 文字列として間接的に記録される。

    // Log status change
    await supabaseAdmin
      .from('order_status_history')
      .insert({
        order_id: order_id,
        from_status: previousStatus,
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
