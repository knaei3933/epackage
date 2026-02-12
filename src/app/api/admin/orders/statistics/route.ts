export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { DashboardStatistics } from '@/types/admin';
import type { Database } from '@/types/database';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 認証検証
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const supabase = createServiceClient();

    // 1. ステータス別注文数の集計
    const { data: ordersByStatus } = await supabase
      .from('orders')
      .select('status')
      .order('created_at', { ascending: false });

    // ステータス別カウント計算
    const statusCounts: Record<string, number> = {};
    ordersByStatus?.forEach((order: Pick<Database["public"]["Tables"]["orders"]["Row"], "status" | "total_amount" | "created_at">) => {
      const status = order.status || 'UNKNOWN';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const ordersByStatusFormatted = Object.entries(statusCounts).map(([status, count]) => ({
      status: status as Database['public']['Tables']['orders']['Row']['status'],
      count
    }));

    // 2. 過去30日間の注文数と総売上
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentOrders } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .gte('created_at', thirtyDaysAgo);

    // 総注文数と総売上
    const totalOrders = recentOrders?.length || 0;
    const totalRevenue = recentOrders?.reduce((sum: number, order: Pick<Database["public"]["Tables"]["orders"]["Row"], "status" | "total_amount" | "created_at">) => sum + (order.total_amount || 0), 0) || 0;

    // 3. 月別売上の集計（過去6ヶ月）
    const monthlyRevenueData: Array<{ month: string; amount: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data: monthOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd)
        .eq('status', 'DELIVERED');

      const monthAmount = monthOrders?.reduce((sum: number, order: Pick<Database["public"]["Tables"]["orders"]["Row"], "status" | "total_amount" | "created_at">) => sum + (order.total_amount || 0), 0) || 0;
      monthlyRevenueData.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        amount: monthAmount
      });
    }

    // 4. 保留中の見積もり数
    const { count: pendingQuotations } = await supabase
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    // 5. 本日発送数（ステータスがSHIPPEDで、shipped_atが今日）
    const today = new Date().toISOString().split('T')[0];
    const { count: todayShipments } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'SHIPPED')
      .gte('shipped_at', today)
      .lt('shipped_at', `${today}T23:59:59`);

    const statistics: DashboardStatistics = {
      ordersByStatus: ordersByStatusFormatted,
      monthlyRevenue: monthlyRevenueData,
      pendingQuotations: pendingQuotations || 0,
      todayShipments: todayShipments || 0,
      totalOrders,
      totalRevenue
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Statistics API error:', error);
    return NextResponse.json(
      { error: '統計データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
