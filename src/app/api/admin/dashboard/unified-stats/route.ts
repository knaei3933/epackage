/**
 * 統合管理者ダッシュボード統計API
 * SSR/CSR両対応、DEV_MODE対応
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getUnifiedDashboardStats,
} from '@/lib/dashboard';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period')
      ? parseInt(searchParams.get('period')!)
      : 30;

    // Supabase SSR clientを使用して認証
    const { client: supabase } = createSupabaseSSRClient(request);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.warn('[API] Admin dashboard stats: Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Service clientを使用してプロフィールを取得（RLSバイパス）
    const serviceClient = createServiceClient();
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // admin/operator/sales/accountingのみアクセス可能
    const adminRoles = ['admin', 'operator', 'sales', 'accounting'];
    const userRole = profile?.role?.toLowerCase();

    if (!userRole || !adminRoles.includes(userRole)) {
      console.warn('[API] Admin dashboard stats: Forbidden - insufficient permissions');
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 統計取得
    const stats = await getUnifiedDashboardStats(
      user.id,
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
