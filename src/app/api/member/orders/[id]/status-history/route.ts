/**
 * Member Order Status History API
 *
 * 会員注文ステータス履歴API
 * - 注文IDに基づいてステータス履歴を取得
 * - 認証が必要
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/dashboard';
import { getOrderStatusHistory } from '@/lib/dashboard';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const statusHistory = await getOrderStatusHistory(id);

    return NextResponse.json({ success: true, data: statusHistory });
  } catch (error) {
    console.error('Failed to fetch status history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch status history' },
      { status: 500 }
    );
  }
}
