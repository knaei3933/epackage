/**
 * Admin Dashboard Page (Server Component)
 *
 * 管理者ダッシュボードメインページ（Server Component）
 * - RBAC認証チェック
 * - 初期データフェッチ（SSR）
 * - Client Componentにデータを渡す
 */

import { getAdminAuth } from '../loader';
import { fetchOrderStats, fetchQuotationStats, normalizeAdminInitialStats } from './data';
import AdminDashboardClient from './AdminDashboardClient';
import type { AdminAuthContext } from '@/types/admin';
import type { AdminDashboardStats } from '@/types/admin';
import type { DashboardInitialStatsResult } from '@/types/dashboard-result';

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export function buildInitialStatsPromise(period?: string) {
  return Promise.all([
    fetchOrderStats(parseInt(period) || 30),
    fetchQuotationStats(parseInt(period) || 30),
  ]).then(([orderStats, quotationStats]): DashboardInitialStatsResult<AdminDashboardStats> => {
    if (!orderStats || !quotationStats) {
      throw new Error('ダッシュボードデータの取得に失敗しました');
    }

    return { status: 'success' as const, stats: normalizeAdminInitialStats(orderStats, quotationStats) };
  }).catch((error): DashboardInitialStatsResult<AdminDashboardStats> => ({
    status: 'error',
    message: error instanceof Error ? error.message : '不明なエラーが発生しました',
  }));
}

async function DashboardContent({
  authContext,
  period,
}: {
  authContext: AdminAuthContext;
  period?: string;
}) {
  // Start both user-authorized queries after RBAC. Promise.all is passed to the
  // client boundary so the h1/KPI heading can flush before either query lands.
  const initialStatsPromise = buildInitialStatsPromise(period);

  return (
    <AdminDashboardClient
      authContext={authContext}
      initialStatsPromise={initialStatsPromise}
      initialPeriod={parseInt(period) || 30}
    />
  );
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = params.period;
  const authContext = await getAdminAuth(
    ['order:read', 'quotation:read'],
    '/auth/signin?redirect=/admin/dashboard',
  );

  return (
    <DashboardContent authContext={authContext} period={period} />
  );
}

export const metadata = {
  title: '管理ダッシュボード | Epackage Lab',
  description: 'Epackage Lab管理ダッシュボード',
};

export const dynamic = 'force-dynamic';
