import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import type { Database } from '@/types/database';

/**
 * GET /api/admin/dashboard/statistics
 * 管理者ダッシュボード統計API
 *
 * Query Parameters:
 * - period: 期間（日数）、デフォルト30日
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // 認証検証
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30'); // デフォルト30日

    const supabase = createServiceClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // 1. 注文統計（Orders Statistics）
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('status, total_amount, created_at')
      .gte('created_at', startDate.toISOString());

    if (ordersError) {
      console.error('注文統計取得エラー:', ordersError);
    }

    // 注文ステータス別集計
    const ordersByStatus = orders?.reduce((acc: Record<string, number>, order: OrderRow) => {
      const status = order.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}) || {};

    const ordersByStatusArray = Object.entries(ordersByStatus).map(([status, count]) => ({
      status,
      count: count as number
    }));

    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum: number, order: OrderRow) => sum + (order.total_amount || 0), 0) || 0;

    // 注文ステータス別詳細統計
    const pendingOrders = orders?.filter(o => o.status === 'PENDING').length || 0;
    const inProgressOrders = orders?.filter(o =>
      ['QUOTATION', 'DATA_RECEIVED', 'WORK_ORDER', 'CONTRACT_SENT', 'CONTRACT_SIGNED', 'PRODUCTION'].includes(o.status)
    ).length || 0;
    const completedOrders = orders?.filter(o => o.status === 'DELIVERED').length || 0;

    // 月別売上集計（最近6ヶ月）
    const monthlyRevenueMap = new Map<string, number>();
    orders?.forEach(order => {
      if (order.total_amount) {
        const date = new Date(order.created_at);
        const monthKey = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenueMap.set(monthKey, (monthlyRevenueMap.get(monthKey) || 0) + order.total_amount);
      }
    });

    const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // 最近6ヶ月

    // 2. 見積統計（Quotations Statistics）
    const { data: quotations, error: quotationsError } = await supabase
      .from('quotations')
      .select('status, total_amount, created_at, customer_name, customer_email, quotation_number')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (quotationsError) {
      console.error('見積統計取得エラー:', quotationsError);
    }

    const totalQuotations = quotations?.length || 0;
    const draftQuotations = quotations?.filter((q: QuotationRow) => q.status === 'DRAFT').length || 0;
    const sentQuotations = quotations?.filter((q: QuotationRow) => q.status === 'SENT').length || 0;
    const approvedQuotations = quotations?.filter((q: QuotationRow) => q.status === 'APPROVED').length || 0;
    const pendingQuotations = draftQuotations + sentQuotations;

    // 転換率計算（承認された見積 / 全体の見積）
    const conversionRate = totalQuotations > 0
      ? ((approvedQuotations / totalQuotations) * 100).toFixed(1)
      : '0.0';

    // 3. サンプル依頼統計（Sample Requests Statistics）
    const { data: sampleRequests, error: sampleError } = await supabase
      .from('sample_requests')
      .select('status, created_at')
      .gte('created_at', startDate.toISOString());

    if (sampleError) {
      console.error('サンプル依頼統計取得エラー:', sampleError);
    }

    const totalSampleRequests = sampleRequests?.length || 0;
    const processingSamples = sampleRequests?.filter((s: SampleRequestRow) =>
      ['received', 'processing'].includes(s.status)
    ).length || 0;
    const completedSamples = sampleRequests?.filter((s: SampleRequestRow) => s.status === 'delivered').length || 0;

    // 4. 生産統計（Production Statistics）
    // Note: production_orders table is used (not production_jobs)
    const { data: productionOrders, error: productionError } = await supabase
      .from('production_orders')
      .select('current_stage, started_at, actual_completion_date, created_at')
      .gte('created_at', startDate.toISOString());

    if (productionError) {
      console.error('生産統計取得エラー:', productionError);
    }

    // 進行中の生産注文（data_received ~ lamination 段階）
    const inProgressProduction = productionOrders?.filter((p: any) =>
      p.current_stage && p.current_stage !== 'final_inspection'
    ).length || 0;
    const completedProduction = productionOrders?.filter((p: any) =>
      p.current_stage === 'final_inspection' && p.actual_completion_date
    ).length || 0;

    // 平均生産期間（日）
    const completedOrdersWithDates = productionOrders?.filter((p: any) =>
      p.current_stage === 'final_inspection' && p.started_at && p.actual_completion_date
    ) || [];

    const avgProductionDays = completedOrdersWithDates.length > 0
      ? (completedOrdersWithDates.reduce((sum: number, order: any) => {
          const days = Math.floor(
            (new Date(order.actual_completion_date).getTime() - new Date(order.started_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + Math.max(0, days);
        }, 0) / completedOrdersWithDates.length).toFixed(1)
      : '0.0';

    // 5. 配送統計（Shipment Statistics）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: shipments, error: shipmentsError } = await supabase
      .from('shipments')
      .select('shipped_at, status')
      .gte('shipped_at', today.toISOString());

    if (shipmentsError) {
      console.error('配送統計取得エラー:', shipmentsError);
    }

    const todayShipments = shipments?.length || 0;
    const inTransitShipments = shipments?.filter((s: SampleRequestRow) => s.status === 'in_transit').length || 0;

    // 6. 売上統計（Revenue Statistics）
    const avgOrderAmount = totalOrders > 0
      ? (totalRevenue / totalOrders).toFixed(0)
      : '0';

    const statistics = {
      // 基本情報
      period,
      generatedAt: new Date().toISOString(),

      // 注文統計
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        inProgress: inProgressOrders,
        completed: completedOrders,
        totalRevenue,
        avgOrderAmount: parseFloat(avgOrderAmount),
        byStatus: ordersByStatusArray
      },

      // 見積統計
      quotations: {
        total: totalQuotations,
        draft: draftQuotations,
        sent: sentQuotations,
        pending: pendingQuotations,
        approved: approvedQuotations,
        conversionRate: parseFloat(conversionRate),
        recent: quotations?.slice(0, 10) || [] // 最近10個の見積
      },

      // サンプル依頼統計
      samples: {
        total: totalSampleRequests,
        processing: processingSamples,
        completed: completedSamples
      },

      // 生産統計
      production: {
        inProgress: inProgressProduction,
        completed: completedProduction,
        avgDays: parseFloat(avgProductionDays)
      },

      // 配送統計
      shipments: {
        today: todayShipments,
        inTransit: inTransitShipments
      },

      // 月別売上
      monthlyRevenue,

      // レガシー互換性（Legacy compatibility）
      ordersByStatus: ordersByStatusArray,
      monthlyRevenue,
      pendingQuotations,
      draftQuotations,
      sentQuotations,
      approvedQuotations,
      activeProduction: inProgressProduction,
      todayShipments,
      totalOrders,
      totalRevenue,
      recentQuotations: quotations?.slice(0, 10) || []
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('統計APIエラー:', error);
    return NextResponse.json(
      {
        error: '統計データの取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
