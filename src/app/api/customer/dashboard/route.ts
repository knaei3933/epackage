/**
 * Customer Dashboard API
 * GET /api/customer/dashboard - Get customer dashboard data
 *
 * Provides summary data for the customer portal dashboard including:
 * - Order statistics (total, pending, in production, shipped)
 * - Recent orders
 * - Unread notifications count
 * - Upcoming deliveries
 * - Customer preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get customer profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'プロフィールが見つかりません。', error_code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user is active
    if (profile.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'アカウントが有効ではありません。', error_code: 'ACCOUNT_INACTIVE' },
        { status: 403 }
      );
    }

    // Get dashboard data using RPC function
    const { data: dashboardData, error: dashboardError } = await supabase
      .rpc('get_customer_dashboard_data', { user_uuid: user.id });

    if (dashboardError) {
      console.error('Dashboard data error:', dashboardError);
      return NextResponse.json(
        { error: 'ダッシュボードデータの取得中にエラーが発生しました。', error_code: 'DASHBOARD_ERROR' },
        { status: 500 }
      );
    }

    // Get order summary with proper labels
    const { data: orderSummary } = await supabase
      .rpc('get_customer_order_summary', { user_uuid: user.id });

    const orderSummaryWithLabels = (orderSummary || []).map((item: any) => {
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
      .eq('user_id', user.id)
      .in('status', ['PRODUCTION', 'STOCK_IN', 'SHIPPED'])
      .not('estimated_delivery_date', 'is', null)
      .order('estimated_delivery_date', { ascending: true })
      .limit(5);

    const upcomingDeliveries = (upcomingOrders || []).map((order: any) => {
      const estimatedDate = new Date(order.estimated_delivery_date);
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

    // Get recent notifications
    const { data: notifications } = await supabase
      .from('customer_notifications')
      .select('*')
      .eq('user_id', user.id)
      .is('expires_at', null) // or where expires_at > NOW()
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          total_orders: dashboardData?.recent_orders?.length || 0,
          pending_orders: orderSummaryWithLabels.find((s: any) => s.status === 'PENDING')?.count || 0,
          in_production_orders: orderSummaryWithLabels.find((s: any) => s.status === 'PRODUCTION')?.count || 0,
          shipped_orders: orderSummaryWithLabels.find((s: any) => s.status === 'SHIPPED')?.count || 0,
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
