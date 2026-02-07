/**
 * Admin Orders Page (Server Component)
 *
 * 注文管理ページ - Server Component
 * - RBAC認証チェック
 * - サーバーサイドでデータを取得
 * - Client Componentでインタラクティブ操作
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../loader';
import AdminOrdersClient from './AdminOrdersClient';
import { FullPageSpinner } from '@/components/ui';
import { createServiceClient } from '@/lib/supabase';

// ============================================================
// Types
// ============================================================

interface AuthContext {
  userId: string;
  role: 'ADMIN' | 'OPERATOR' | 'SALES' | 'ACCOUNTING';
  userName: string;
  isDevMode: boolean;
}

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

async function OrdersContent({ searchParams }: { searchParams: Promise<{ status?: string; quotation?: string }> }) {
  // RBAC認証チェック
  let authContext: AuthContext;
  try {
    authContext = await requireAdminAuth(['order:read']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/orders');
  }

  // URLパラメータからステータスと見積もりIDを取得
  const params = await searchParams;
  const initialStatus = params.status || 'all';
  const quotationId = params.quotation;

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

  // Pass auth context and initial orders to client component
  return (
    <AdminOrdersClient
      authContext={authContext}
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
  searchParams: { status?: string; quotation?: string };
}) {
  return (
    <Suspense fallback={<FullPageSpinner label="注文リストを読み込み中..." />}>
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
}

export const metadata = {
  title: '注文管理 | Epackage Lab Admin',
  description: '注文管理ページ',
};

export const dynamic = 'force-dynamic';
