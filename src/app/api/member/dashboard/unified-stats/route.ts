/**
 * 統合会員ダッシュボード統計API
 * SSR/CSR両対応、DEV_MODE対応
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getUnifiedDashboardStats,
  getCurrentUserId,
} from '@/lib/dashboard';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period')
      ? parseInt(searchParams.get('period')!)
      : 30;

    // ユーザーID取得
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 統計取得
    const stats = await getUnifiedDashboardStats(
      userId,
      'MEMBER',
      period
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[API] Member dashboard unified stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
