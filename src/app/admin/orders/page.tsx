/**
 * Admin Orders Page (Server Component)
 *
 * 注文管理ページ - Server Component
 * - RBAC認証チェック
 * - サーバーサイドでデータを取得
 * - Client Componentでインタラクティブ操作
 */

import { Suspense } from 'react';
import { getAdminAuth } from '../loader';
import AdminOrdersClient from './AdminOrdersClient';
import { createServiceClient } from '@/lib/supabase';
import type { Database } from '@/types/database';

// orders.status の実DB enum 型（b2b_order_status）。
type OrderStatus = Database['public']['Tables']['orders']['Row']['status'];

// ============================================================
// Types
// ============================================================

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total_amount: number;
  created_at: string;
}

// ============================================================
// Server-Side Data Fetching
// ============================================================

function AdminOrdersRouteShell() {
  return (
    <div className="min-h-screen bg-gray-50" aria-busy="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div
            aria-hidden="true"
            className="h-8 w-48 bg-gray-200 rounded animate-pulse"
          />
          <p className="mt-2 text-sm text-gray-600">読み込み中です。</p>
        </div>
        <section aria-label="注文一覧を読み込み中" data-testid="admin-orders-list-shell">
          <div className="space-y-4" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="mt-4 h-3 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export async function OrdersContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; quotation?: string }>;
}) {
  // Preserve server-side authorization and its exact redirect after the shell.
  await getAdminAuth(['order:read'], '/auth/signin?redirect=/admin/orders');
  const params = await searchParams;

  // URLパラメータからステータスと見積もりIDを取得
  const initialStatus = params.status || 'all';
  const quotationId = params.quotation;

  // サーバーサイドで注文データを取得
  const supabaseService = createServiceClient();
  let query = supabaseService
    .from('orders')
    .select(
      'id, order_number, customer_name, customer_email, status, total_amount, created_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false });

  if (initialStatus !== 'all') {
    query = query.eq('status', initialStatus as OrderStatus);
  }

  // 見積もりIDでフィルタリング
  if (quotationId) {
    query = query.eq('quotation_id', quotationId);
  }

  const { data: orders, count } = await query;

  console.log('[AdminOrdersPage] Server-side fetched orders:', orders?.length || 0, 'quotation filter:', quotationId || 'none');

  // Pass initial orders to client component
  return (
    <AdminOrdersClient
      initialStatus={initialStatus}
      initialOrders={(orders as any) || []}
      initialTotal={count ?? 0}
      quotationFilter={quotationId}
    />
  );
}

// ============================================================
// Page Component
// ============================================================

export default function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; quotation?: string }>;
}) {
  return (
    <Suspense fallback={<AdminOrdersRouteShell />}>
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
}

export const metadata = {
  title: '注文管理 | Epackage Lab Admin',
  description: '注文管理ページ',
};

export const dynamic = 'force-dynamic';
