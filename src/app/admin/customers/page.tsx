/**
 * Customer Portal Dashboard Page
 * カスタマーポータルダッシュボード
 *
 * Main dashboard showing:
 * - Order statistics cards
 * - Recent orders
 * - Upcoming deliveries
 * - Recent notifications
 * - Quick actions
 *
 * Migrated from /portal to /admin/customers
 */

import React from 'react';
import Link from 'next/link';
import { OrderSummaryCard } from '@/components/shared';
import { formatDate } from '@/types/portal';
import { cn } from '@/lib/utils';
import { createServiceClient } from '@/lib/supabase';

// Force dynamic rendering - this page requires authentication and cannot be pre-rendered
export const dynamic = 'force-dynamic';

async function getDashboardData() {
  // Use service client for admin pages (bypasses RLS)
  const supabase = createServiceClient();

  // Fetch orders for statistics
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, status, total_amount, estimated_delivery_date, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (ordersError) {
    console.error('Orders fetch error:', ordersError);
    return {
      stats: {
        total_orders: 0,
        pending_orders: 0,
        in_production_orders: 0,
        shipped_orders: 0,
        unread_notifications: 0,
      },
      recent_orders: [],
      upcoming_deliveries: [],
    };
  }

  // Calculate stats
  const stats = {
    total_orders: orders?.length || 0,
    pending_orders: orders?.filter(o => o.status === 'PENDING').length || 0,
    in_production_orders: orders?.filter(o => o.status === 'PRODUCTION' || o.status === 'PROCESSING').length || 0,
    shipped_orders: orders?.filter(o => o.status === 'SHIPPED' || o.status === 'DELIVERED').length || 0,
    unread_notifications: 0, // TODO: Fetch from notifications table
  };

  // Get recent orders
  const recent_orders = orders?.slice(0, 6) || [];

  // Get upcoming deliveries (orders with estimated_delivery_date in future)
  const now = new Date();
  const upcoming_deliveries = orders
    ?.filter(o => o.estimated_delivery_date && new Date(o.estimated_delivery_date) > now)
    .map(o => ({
      order_id: o.id,
      order_number: o.order_number,
      estimated_delivery_date: o.estimated_delivery_date,
      days_until_delivery: Math.ceil(
        (new Date(o.estimated_delivery_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }))
    .sort((a, b) => a.days_until_delivery - b.days_until_delivery)
    .slice(0, 5) || [];

  return {
    stats,
    recent_orders,
    upcoming_deliveries,
  };
}

export default async function CustomerPortalDashboardPage() {
  const dashboardData = await getDashboardData();

  const { stats, recent_orders, upcoming_deliveries } = dashboardData;

  const summaryCards = [
    {
      title: '総注文数',
      value: stats.total_orders,
      color: 'bg-blue-500',
      href: '/admin/customers/orders',
    },
    {
      title: '見積中',
      value: stats.pending_orders,
      color: 'bg-yellow-500',
      href: '/admin/customers/orders?status=PENDING',
    },
    {
      title: '製作中',
      value: stats.in_production_orders,
      color: 'bg-orange-500',
      href: '/admin/customers/orders?status=PRODUCTION',
    },
    {
      title: '発送済',
      value: stats.shipped_orders,
      color: 'bg-green-500',
      href: '/admin/customers/orders?status=SHIPPED',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          ダッシュボード
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          ようこそ、お客様ダッシュボードへ
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{card.title}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {card.value}
                </p>
              </div>
              <div className={cn('w-12 h-12 rounded-lg', card.color)} />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/quote-simulator"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規見積依頼
        </Link>
        <Link
          href="/admin/customers/support"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          お問い合わせ
        </Link>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          製品カタログ
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              最近の注文
            </h2>
            <Link
              href="/admin/customers/orders"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              すべて見る
            </Link>
          </div>

          {recent_orders && recent_orders.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {recent_orders.map((order: { id: string }) => (
                <OrderSummaryCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                まだ注文がありません
              </p>
              <Link
                href="/quote-simulator"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                最初の見積を依頼する
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deliveries */}
          {upcoming_deliveries && upcoming_deliveries.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                配達予定
              </h3>
              <div className="space-y-3">
                {upcoming_deliveries.map((delivery: {
                  order_id: string;
                  order_number: string;
                  estimated_delivery_date: string;
                  days_until_delivery: number;
                }) => {
                  const daysUntil = delivery.days_until_delivery;
                  const isUrgent = daysUntil <= 3 && daysUntil >= 0;
                  const isOverdue = daysUntil < 0;

                  return (
                    <Link
                      key={delivery.order_id}
                      href={`/admin/customers/orders/${delivery.order_id}`}
                      className="block p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {delivery.order_number}
                        </span>
                        <span
                          className={cn(
                            'text-xs px-2 py-1 rounded-full',
                            isOverdue && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                            !isOverdue && isUrgent && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
                            !isOverdue && !isUrgent && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          )}
                        >
                          {isOverdue && '遅延'}
                          {!isOverdue && isUrgent && 'まもなく'}
                          {!isOverdue && !isUrgent && `${daysUntil}日後`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(delivery.estimated_delivery_date, 'ja')}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notifications Preview */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                通知
              </h3>
              {stats.unread_notifications > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.unread_notifications}
                </span>
              )}
            </div>
            <Link
              href="/admin/customers?tab=notifications"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              すべての通知を見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
