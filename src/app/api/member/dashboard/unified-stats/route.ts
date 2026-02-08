/**
 * 統合会員ダッシュボード統計API
 * SSR/CSR両対応、DEV_MODE対応
 * Cookie-based authentication for client-side navigation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase-ssr';
import { getUnifiedDashboardStats } from '@/lib/dashboard';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period')
      ? parseInt(searchParams.get('period')!)
      : 30;

    // Cookie-based authentication (primary method)
    let authUser = await getAuthenticatedUser(request);
    let userId: string | null = null;

    // Fallback: userId from query parameter for client-side requests
    // This is a temporary workaround for cookie issues on client-side navigation
    if (!authUser || !authUser.id) {
      const queryUserId = searchParams.get('userId');
      if (queryUserId) {
        console.log('[unified-stats] Cookie auth failed, using userId from query param:', queryUserId);
        userId = queryUserId;
      } else {
        console.log('[unified-stats] No authenticated user found (no cookies or userId param), returning 401');
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } else {
      userId = authUser.id;
      console.log('[unified-stats] Authenticated via cookies, user ID:', authUser.id);
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
