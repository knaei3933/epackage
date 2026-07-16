/**
 * Admin Dashboard Page (Server Component)
 *
 * 管理者ダッシュボードメインページ（Server Component）
 * - RBAC認証チェック
 * - 初期データフェッチ（SSR）
 * - Client Componentにデータを渡す
 */

import { getAdminAuth } from '../loader';
import { fetchOrderStats, fetchQuotationStats } from './data';
import AdminDashboardClient from './AdminDashboardClient';

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

async function DashboardContent({ period }: { period?: string }) {
  // RBAC認証チェック（管理者権限必須）
  const authContext = await getAdminAuth(['order:read', 'quotation:read'], '/auth/signin?redirect=/admin/dashboard');

  // 並列データフェッチ
  const [orderStats, quotationStats] = await Promise.all([
    fetchOrderStats(parseInt(period) || 30),
    fetchQuotationStats(parseInt(period) || 30),
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
    // Next.js 16 では loading.tsx（DashboardLoading）が同セグメントの自動 Suspense boundary として機能するため、
    // ここでは手動 Suspense ではなく DashboardContent を直接レンダリング（Suspense 境界の二重化を回避）
    <DashboardContent period={period} />
  );
}

export const metadata = {
  title: '管理ダッシュボード | Epackage Lab',
  description: 'Epackage Lab管理ダッシュボード',
};

export const dynamic = 'force-dynamic';
