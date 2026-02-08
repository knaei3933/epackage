/**
 * Member Dashboard API (Integrated from /api/customer/dashboard)
 * GET /api/member/dashboard - Get complete dashboard data
 *
 * Provides summary data for the member/customer portal dashboard including:
 * - Order statistics (total, pending, in production, shipped)
 * - Recent orders
 * - Unread notifications count
 * - Upcoming deliveries
 * - Order summary by status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase-ssr';

interface DashboardData {
  recent_orders: unknown[];
  unread_notifications: number;
  preferences: unknown;
  order_summary?: Record<string, unknown>;
}

interface OrderSummaryItem {
  status: string;
  count: number;
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user using unified authentication
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id: userId, supabase } = authUser;

    // Get customer profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'プロフィールが見つかりません。', error_code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user is active (with fallback for missing status field)
    const userStatus = profile.status;
    if (userStatus && userStatus !== 'ACTIVE' && userStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'アカウントが有効ではありません。', error_code: 'ACCOUNT_INACTIVE' },
        { status: 403 }
      );
    }

    // Get dashboard data using RPC function with fallback
    let dashboardData: DashboardData | null = null;
    let dashboardError: Error | null = null;

    try {
      const result = await supabase.rpc('get_customer_dashboard_data', { user_uuid: userId });
      dashboardData = result.data as DashboardData | null;
      dashboardError = result.error as Error | null;
    } catch (e) {
      console.error('Dashboard RPC call failed:', e);
      dashboardError = e as Error;
    }

    // If RPC fails, fall back to direct queries
    if (dashboardError || !dashboardData) {
      console.warn('Dashboard RPC failed, using fallback queries:', dashboardError);

      // Fallback: Get recent orders directly
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, order_number, status, total_amount, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fallback: Get unread notifications count
      let unreadCount = 0;
      try {
        const { data: notifications } = await supabase
          .from('customer_notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('is_read', false)
          .is('expires_at', null); // or where expires_at > NOW()

        unreadCount = notifications?.length || 0;
      } catch (e) {
        console.warn('customer_notifications table not available for count:', e);
        unreadCount = 0;
      }

      dashboardData = {
        recent_orders: recentOrders || [],
        unread_notifications: unreadCount,
        preferences: null,
        order_summary: {}
      };
    }

    // Get order summary with proper labels (with fallback)
    let orderSummary: OrderSummaryItem[] | null = null;
    let orderSummaryError: Error | null = null;

    try {
      const result = await supabase.rpc('get_customer_order_summary', { user_uuid: userId });
      orderSummary = result.data as OrderSummaryItem[] | null;
      orderSummaryError = result.error as Error | null;
    } catch (e) {
      console.error('Order summary RPC failed:', e);
      orderSummaryError = e as Error;
    }

    // Fallback: Get order summary with direct query
    if (orderSummaryError || !orderSummary) {
      console.warn('Order summary RPC failed, using fallback query:', orderSummaryError);

      const { data: orders } = await supabase
        .from('orders')
        .select('status')
        .eq('user_id', userId)
        .neq('status', 'CANCELLED');

      // Count orders by status
      const statusCounts: Record<string, number> = {};
      orders?.forEach((order: { status: string }) => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });

      // Convert to array format
      orderSummary = Object.entries(statusCounts).map(([status, count]) => ({ status, count: Number(count) }));
    }

    const orderSummaryWithLabels = (orderSummary || []).map((item: OrderSummaryItem) => {
      const statusLabels: Record<string, string> = {
        PENDING: '見積中',
        QUOTATION: '見積提出済',
        DATA_RECEIVED: 'データ入稿済',
        WORK_ORDER: '作業標準書作成中',
        CONTRACT_SENT: '契約書送付済',
        CONTRACT_SIGNED: '契約済',
        PRODUCTION: '製作中',
        STOCK_IN: '検品済',
        SHIPPED: '発送済',
        DELIVERED: '納品済',
      };

      const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        QUOTATION: 'bg-blue-100 text-blue-800',
        DATA_RECEIVED: 'bg-indigo-100 text-indigo-800',
        WORK_ORDER: 'bg-purple-100 text-purple-800',
        CONTRACT_SENT: 'bg-pink-100 text-pink-800',
        CONTRACT_SIGNED: 'bg-green-100 text-green-800',
        PRODUCTION: 'bg-orange-100 text-orange-800',
        STOCK_IN: 'bg-teal-100 text-teal-800',
        SHIPPED: 'bg-cyan-100 text-cyan-800',
        DELIVERED: 'bg-gray-100 text-gray-800',
      };

      return {
        status: item.status,
        count: item.count,
        label: statusLabels[item.status] || item.status,
        label_ja: statusLabels[item.status] || item.status,
        color: statusColors[item.status] || 'bg-gray-100 text-gray-800',
      };
    });

    // Get upcoming deliveries
    const { data: upcomingOrders } = await supabase
      .from('orders')
      .select('id, order_number, status, estimated_delivery_date')
      .eq('user_id', userId)
      .in('status', ['PRODUCTION', 'STOCK_IN', 'SHIPPED'])
      .not('estimated_delivery_date', 'is', null)
      .order('estimated_delivery_date', { ascending: true })
      .limit(5);

    const upcomingDeliveries = (upcomingOrders || []).map((order: {
      id: string;
      order_number: string;
      estimated_delivery_date: string | null;
      status: string;
    }) => {
      const estimatedDate = new Date(order.estimated_delivery_date || '');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      estimatedDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.ceil((estimatedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return {
        order_id: order.id,
        order_number: order.order_number,
        estimated_delivery_date: order.estimated_delivery_date,
        days_until_delivery: daysUntil,
        status: order.status,
      };
    });

    // Get recent notifications (with fallback for missing table)
    let notifications: unknown[] | null = null;
    try {
      const result = await supabase
        .from('customer_notifications')
        .select('*')
        .eq('user_id', userId)
        .is('expires_at', null) // or where expires_at > NOW()
        .order('created_at', { ascending: false })
        .limit(10);
      notifications = result.data as unknown[] | null;
    } catch (e) {
      console.warn('customer_notifications table not available:', e);
      notifications = [];
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          total_orders: dashboardData?.recent_orders?.length || 0,
          pending_orders: orderSummaryWithLabels.find((s) => s.status === 'PENDING')?.count || 0,
          in_production_orders: orderSummaryWithLabels.find((s) => s.status === 'PRODUCTION')?.count || 0,
          shipped_orders: orderSummaryWithLabels.find((s) => s.status === 'SHIPPED')?.count || 0,
          unread_notifications: dashboardData?.unread_notifications || 0,
        },
        order_summary: orderSummaryWithLabels,
        recent_orders: dashboardData?.recent_orders || [],
        upcoming_deliveries: upcomingDeliveries || [],
        unread_notifications_count: dashboardData?.unread_notifications || 0,
        recent_notifications: notifications || [],
        preferences: dashboardData?.preferences || null,
      },
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
