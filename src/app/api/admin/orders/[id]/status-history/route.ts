/**
 * Admin Order Status History API
 *
 * 管理者注文ステータス履歴API
 * - 注文IDに基づいてステータス履歴を取得
 * - 管理者権限が必要
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data: statusHistory, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', id)
      .order('changed_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data: statusHistory || [] });
  } catch (error) {
    console.error('Failed to fetch admin status history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch status history' },
      { status: 500 }
    );
  }
}
