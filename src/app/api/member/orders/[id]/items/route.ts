/**
 * Member Order Items API
 *
 * 会員用注文アイテムAPI
 * - GET: 注文のアイテム一覧取得
 *
 * @route /api/member/orders/[id]/items
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Env vars checked at runtime in handler function
const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

// サービスクライアント (RLSバイパス用)
const getServiceClient = () => createClient(supabaseUrl(), supabaseServiceKey(), {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// =====================================================
// GET Handler - List Order Items
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SSR Client for authentication
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      supabaseUrl(),
      supabaseAnonKey(),
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証されていません' },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();
    const { id: orderId } = await params;

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。' },
        { status: 404 }
      );
    }

    if (order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Get order items
    const { data: items, error } = await supabase
      .from('order_items')
      .select('id, product_name, quantity')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Order Items GET] Error:', error);
      return NextResponse.json(
        { success: false, error: '注文アイテムの取得に失敗しました。' },
        { status: 500 }
      );
    }

    console.log('[Order Items GET] Success:', items?.length || 0, 'items');

    return NextResponse.json({
      success: true,
      items: items || [],
    });

  } catch (error) {
    console.error('[Order Items GET] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONS Handler for CORS
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
