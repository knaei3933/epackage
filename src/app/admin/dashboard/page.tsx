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
import { fetchOrderStats, fetchQuotationStats, normalizeAdminInitialStats } from './data';
import AdminDashboardClient from './AdminDashboardClient';
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

function AdminDashboardRouteShell() {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-accent to-bg-primary"
      aria-busy="true"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-brixa-700 via-brixa-600 to-brixa-500 bg-clip-text text-transparent mb-2">
            管理ダッシュボード
          </h1>
          <p className="text-base text-text-secondary">読み込み中です。</p>
        </div>
        <section aria-label="ダッシュボード読み込み状態">
          <div className="mb-4 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-gradient-to-b from-brixa-500 to-brixa-700 rounded-full" />
            <h2 className="text-lg font-bold text-text-primary leading-tight">ステータス別 KPI</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md border border-border-light">
                <div className="h-10 w-10 bg-border-light rounded-xl animate-pulse" />
                <div className="mt-4 h-3 w-24 bg-border-light rounded animate-pulse" />
                <div className="mt-3 h-8 w-20 bg-border-light rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export async function DashboardContent({
  searchParams,
}: {
  searchParams: PageProps['searchParams'];
}) {
  // Middleware already rejects anonymous requests. Keep server RBAC in this
  // suspended child so the non-sensitive shell can flush independently.
  const authContext = await getAdminAuth(
    ['order:read', 'quotation:read'],
    '/auth/signin?redirect=/admin/dashboard',
  );
  const { period } = await searchParams;

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

export default function AdminDashboardPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<AdminDashboardRouteShell />}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}

export const metadata = {
  title: '管理ダッシュボード | Epackage Lab',
  description: 'Epackage Lab管理ダッシュボード',
};

export const dynamic = 'force-dynamic';
