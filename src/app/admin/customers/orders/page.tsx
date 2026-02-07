/**
 * Customer Orders List Page
 * 注文一覧ページ
 *
 * Displays all customer orders with filtering and search
 * Migrated from /portal/orders to /admin/customers/orders
 */

import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { OrderSummaryCard } from '@/components/shared';
import { PORTAL_ORDER_STATUS_LABELS } from '@/types/portal';
import { createServiceClient } from '@/lib/supabase';

// Force dynamic rendering - this page requires authentication and cannot be pre-rendered
export const dynamic = 'force-dynamic';

async function getOrders(searchParams: { status?: string; search?: string }) {
  const supabase = createServiceClient();

  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply status filter if specified
  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }

  // Apply search filter if specified
  if (searchParams.search) {
    query = query.or(`order_number.ilike.%${searchParams.search}%,customer_name.ilike.%${searchParams.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Orders fetch error:', error);
    return null;
  }

  return { orders: data || [] };
}

export default async function CustomerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const data = await getOrders(params);

  const orders = data?.orders || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            注文一覧
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            すべての注文を確認・管理できます
          </p>
        </div>
        <Link
          href="/quote-simulator"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors self-start"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規見積依頼
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              ステータス
            </label>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/customers/orders"
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                  !params.status
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-medium'
                    : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                )}
              >
                すべて
              </Link>
              {Object.entries(PORTAL_ORDER_STATUS_LABELS).map(([status, info]) => (
                <Link
                  key={status}
                  href={`/admin/customers/orders?status=${status}`}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                    params.status === status
                      ? `${info.color} border-current`
                      : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                  )}
                >
                  {info.ja}
                </Link>
              ))}
            </div>
          </div>

          {/* Search */}
          <form className="flex-1" method="GET" action="/admin/customers/orders">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              検索
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="search"
                placeholder="注文番号またはお客様名"
                defaultValue={params.search}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                検索
              </button>
              {params.search && (
                <Link
                  href="/admin/customers/orders"
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  クリア
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Orders Grid */}
      {orders.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order: any) => (
            <OrderSummaryCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            注文が見つかりません
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {params.status || params.search
              ? '検索条件に一致する注文がありません。'
              : 'まだ注文がありません。'}
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/quote-simulator"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              最初の見積を依頼する
            </Link>
            {(params.status || params.search) && (
              <Link
                href="/admin/customers/orders"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
              >
                フィルターをクリア
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
