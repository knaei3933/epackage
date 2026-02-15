/**
 * Member Dashboard Unified Stats API
 *
 * 会員ダッシュボード統計情報を返すAPIエンドポイント
 * - 統計データ（注文、見積、サンプルなど）
 * - 認証済みユーザーのみアクセス可能
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthRequiredError, getUnifiedDashboardStats } from '@/lib/dashboard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// =====================================================
// GET /api/member/dashboard/unified-stats
// =====================================================

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const user = await requireAuth();
    const userId = user.id;

    // クエリパラメータ取得
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30', 10);

    // 統計データ取得
    const stats = await getUnifiedDashboardStats(userId, 'MEMBER', period);

    return NextResponse.json(stats);
  } catch (error) {
    // 認証エラー
    if (error instanceof AuthRequiredError) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // その他のエラー
    console.error('[/api/member/dashboard/unified-stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
