/**
 * Member Order Status History API
 *
 * 会員注文ステータス履歴API
 * - 注文IDに基づいてステータス履歴を取得
 * - 認証が必要
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/dashboard';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '認証されていません。' },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;

    // Use SSR client with user's authentication context
    const { client: supabase } = await createSupabaseSSRClient(request);

    // First verify the order belongs to the user
    const { data: order } = await supabase
      .from('orders')
      .select('id, user_id')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。' },
        { status: 404 }
      );
    }

    if (order.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Fetch status history using user's authenticated context
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('changed_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch status history:', error);
      return NextResponse.json(
        { success: false, error: 'ステータス履歴の取得に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Failed to fetch status history:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
