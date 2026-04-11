/**
 * Admin Dashboard Page (Server Component)
 *
 * 管理者ダッシュボードメインページ（Server Component）
 * - RBAC認証チェック
 * - 初期データフェッチ（SSR）
 * - Client Componentにデータを渡す
 */

import { Suspense } from 'react';
import { getAdminAuth } from '../loader';
import { fetchOrderStats, fetchQuotationStats } from './data';
import AdminDashboardClient from './AdminDashboardClient';
import { FullPageSpinner } from '@/components/ui';

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

async function DashboardContent({ period }: { period?: string }) {
  // RBAC認証チェック（管理者権限必須）
  const authContext = await getAdminAuth(['order:read', 'quotation:read'], '/auth/signin?redirect=/admin/dashboard');

  // 並列データフェッチ
  const [orderStats, quotationStats] = await Promise.all([
    fetchOrderStats(parseInt(period) || 30),
    fetchQuotationStats(),
  ]);

  return (
    <AdminDashboardClient
      authContext={authContext}
      initialOrderStats={orderStats}
      initialQuotationStats={quotationStats}
      initialPeriod={parseInt(period) || 30}
    />
  );
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = params.period;

  return (
    <Suspense fallback={<FullPageSpinner label="ダッシュボードを読み込み中..." />}>
      <DashboardContent period={period} />
    </Suspense>
  );
}

export const metadata = {
  title: '管理ダッシュボード | Epackage Lab',
  description: 'Epackage Lab管理ダッシュボード',
};

export const dynamic = 'force-dynamic';
