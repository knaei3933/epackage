import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import type { Database } from '@/types/database';

/**
 * GET /api/admin/dashboard/statistics
 * 관리자 대시보드 통계 API
 *
 * Query Parameters:
 * - period: 기간 (일수), 기본값 30일
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // 인증 검증
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30'); // 기본 30일

    const supabase = createServiceClient();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // 1. 주문 통계 (Orders Statistics)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('status, total_amount, created_at')
      .gte('created_at', startDate.toISOString());

    if (ordersError) {
      console.error('주문 통계 조회 오류:', ordersError);
    }

    // 주문 상태별 집계
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

    // 주문 상태별 세부 통계
    const pendingOrders = orders?.filter(o => o.status === 'PENDING').length || 0;
    const inProgressOrders = orders?.filter(o =>
      ['QUOTATION', 'DATA_RECEIVED', 'WORK_ORDER', 'CONTRACT_SENT', 'CONTRACT_SIGNED', 'PRODUCTION'].includes(o.status)
    ).length || 0;
    const completedOrders = orders?.filter(o => o.status === 'DELIVERED').length || 0;

    // 월별 매출 집계 (최근 6개월)
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
      .slice(-6); // 최근 6개월

    // 2. 견적 통계 (Quotations Statistics)
    const { data: quotations, error: quotationsError } = await supabase
      .from('quotations')
      .select('status, total_amount, created_at, customer_name, customer_email, quotation_number')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (quotationsError) {
      console.error('견적 통계 조회 오류:', quotationsError);
    }

    const totalQuotations = quotations?.length || 0;
    const draftQuotations = quotations?.filter((q: QuotationRow) => q.status === 'DRAFT').length || 0;
    const sentQuotations = quotations?.filter((q: QuotationRow) => q.status === 'SENT').length || 0;
    const approvedQuotations = quotations?.filter((q: QuotationRow) => q.status === 'APPROVED').length || 0;
    const pendingQuotations = draftQuotations + sentQuotations;

    // 전환율 계산 (승인된 견적 / 전체 견적)
    const conversionRate = totalQuotations > 0
      ? ((approvedQuotations / totalQuotations) * 100).toFixed(1)
      : '0.0';

    // 3. 샘플 요청 통계 (Sample Requests Statistics)
    const { data: sampleRequests, error: sampleError } = await supabase
      .from('sample_requests')
      .select('status, created_at')
      .gte('created_at', startDate.toISOString());

    if (sampleError) {
      console.error('샘플 요청 통계 조회 오류:', sampleError);
    }

    const totalSampleRequests = sampleRequests?.length || 0;
    const processingSamples = sampleRequests?.filter((s: SampleRequestRow) =>
      ['received', 'processing'].includes(s.status)
    ).length || 0;
    const completedSamples = sampleRequests?.filter((s: SampleRequestRow) => s.status === 'delivered').length || 0;

    // 4. 생산 통계 (Production Statistics)
    // Note: production_orders table is used (not production_jobs)
    const { data: productionOrders, error: productionError } = await supabase
      .from('production_orders')
      .select('current_stage, started_at, actual_completion_date, created_at')
      .gte('created_at', startDate.toISOString());

    if (productionError) {
      console.error('생산 통계 조회 오류:', productionError);
    }

    // 진행 중인 생산 주문 (data_received ~ lamination 단계)
    const inProgressProduction = productionOrders?.filter((p: any) =>
      p.current_stage && p.current_stage !== 'final_inspection'
    ).length || 0;
    const completedProduction = productionOrders?.filter((p: any) =>
      p.current_stage === 'final_inspection' && p.actual_completion_date
    ).length || 0;

    // 평균 생산 기간 (일)
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

    // 5. 배송 통계 (Shipment Statistics)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: shipments, error: shipmentsError } = await supabase
      .from('shipments')
      .select('shipped_at, status')
      .gte('shipped_at', today.toISOString());

    if (shipmentsError) {
      console.error('배송 통계 조회 오류:', shipmentsError);
    }

    const todayShipments = shipments?.length || 0;
    const inTransitShipments = shipments?.filter((s: SampleRequestRow) => s.status === 'in_transit').length || 0;

    // 6. 매출 통계 (Revenue Statistics)
    const avgOrderAmount = totalOrders > 0
      ? (totalRevenue / totalOrders).toFixed(0)
      : '0';

    const statistics = {
      // 기본 정보
      period,
      generatedAt: new Date().toISOString(),

      // 주문 통계
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        inProgress: inProgressOrders,
        completed: completedOrders,
        totalRevenue,
        avgOrderAmount: parseFloat(avgOrderAmount),
        byStatus: ordersByStatusArray
      },

      // 견적 통계
      quotations: {
        total: totalQuotations,
        draft: draftQuotations,
        sent: sentQuotations,
        pending: pendingQuotations,
        approved: approvedQuotations,
        conversionRate: parseFloat(conversionRate),
        recent: quotations?.slice(0, 10) || [] // 최근 10개 견적
      },

      // 샘플 요청 통계
      samples: {
        total: totalSampleRequests,
        processing: processingSamples,
        completed: completedSamples
      },

      // 생산 통계
      production: {
        inProgress: inProgressProduction,
        completed: completedProduction,
        avgDays: parseFloat(avgProductionDays)
      },

      // 배송 통계
      shipments: {
        today: todayShipments,
        inTransit: inTransitShipments
      },

      // 월별 매출
      monthlyRevenue,

      // 레거시 호환성 (Legacy compatibility)
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
    console.error('통계 API 오류:', error);
    return NextResponse.json(
      {
        error: '統計データの取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
