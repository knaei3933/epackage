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
import { FullPageSpinner } from '@/components/ui';
import { createServiceClient } from '@/lib/supabase';

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

async function OrdersContent({ searchParams }: { searchParams: { status?: string; quotation?: string } }) {
  // RBAC認証チェック
  const authContext = await getAdminAuth(['order:read'], '/auth/signin?redirect=/admin/orders');

  // URLパラメータからステータスと見積もりIDを取得
  const initialStatus = searchParams.status || 'all';
  const quotationId = searchParams.quotation;

  // サーバーサイドで注文データを取得
  const supabaseService = createServiceClient();
  let query = supabaseService
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (initialStatus !== 'all') {
    query = query.eq('status', initialStatus);
  }

  // 見積もりIDでフィルタリング
  if (quotationId) {
    query = query.eq('quotation_id', quotationId);
  }

  const { data: orders } = await query;

  console.log('[AdminOrdersPage] Server-side fetched orders:', orders?.length || 0, 'quotation filter:', quotationId || 'none');

  // Pass initial orders to client component
  return (
    <AdminOrdersClient
      initialStatus={initialStatus}
      initialOrders={(orders as Order[]) || []}
      quotationFilter={quotationId}
    />
  );
}

// ============================================================
// Page Component
// ============================================================

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; quotation?: string }>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<FullPageSpinner label="注文リストを読み込み中..." />}>
      <OrdersContent searchParams={params} />
    </Suspense>
  );
}

export const metadata = {
  title: '注文管理 | Epackage Lab Admin',
  description: '注文管理ページ',
};

export const dynamic = 'force-dynamic';
