/**
 * 統合管理者ダッシュボード統計API
 * SSR/CSR両対応、DEV_MODE対応
 * Cookie-based authentication for client-side navigation
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getUnifiedDashboardStats,
} from '@/lib/dashboard';
import { getAuthenticatedUser } from '@/lib/supabase-ssr';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period')
      ? parseInt(searchParams.get('period')!)
      : 30;

    // Cookie-based authentication (primary method)
    // getAuthenticatedUser handles DEV_MODE fallback automatically
    const authUser = await getAuthenticatedUser(request);

    if (!authUser || !authUser.id) {
      console.warn('[API] Admin dashboard stats: Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[API] Admin dashboard stats: User authenticated:', authUser.id);

    // 統計取得
    const stats = await getUnifiedDashboardStats(
      authUser.id,
      'ADMIN',
      period
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[API] Admin dashboard unified stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
