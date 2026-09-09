/**
 * Member Dashboard Page
 *
 * 会員ダッシュボードメインページ（ハイブリッド構造）
 * - Server Component: 初期データフェッチ（SSR）
 * - Client Component: SWRによる自動更新・リアルタイム性
 * - 最近のアクティビティは UnifiedDashboardClient（NextActionList）に一本化済み
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError, getUnifiedDashboardStats } from '@/lib/dashboard';
import type { DashboardInitialStatsResult } from '@/types/dashboard-result';
import { UnifiedDashboardClient } from './UnifiedDashboardClient';

// =====================================================
// Components
// =====================================================

type AuthenticatedUser = Awaited<ReturnType<typeof requireAuth>>;

function MemberDashboardRouteShell() {
  return (
    <div className="min-h-screen bg-bg-primary" aria-busy="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">マイページトップ</h1>
          <p className="mt-2 text-sm text-text-muted">読み込み中です。</p>
        </div>
        <section aria-label="ダッシュボード読み込み状態">
          <h2 className="text-lg font-semibold text-text-primary mb-4">クイックアクション</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md border border-border-light">
                <div className="h-10 w-10 bg-border-light rounded-xl animate-pulse" />
                <div className="mt-4 h-3 w-24 bg-border-light rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function buildInitialStatsPromise(userId: string) {
  return getUnifiedDashboardStats(userId, 'MEMBER', 30)
    .then((stats): DashboardInitialStatsResult<typeof stats> => ({ status: 'success', stats }))
    .catch((error): DashboardInitialStatsResult<never> => {
      console.error('[Dashboard] Failed to fetch unified stats:', error);
      return {
        status: 'error',
        message: 'DASHBOARD_DATA_UNAVAILABLE',
      };
    });
}

async function DashboardContent({ user }: { user: AuthenticatedUser }) {
  // Start the authorized server fetch immediately, but do not await it before
  // the post-auth shell/header can flush. The client boundary consumes it once.
  const initialStatsPromise = buildInitialStatsPromise(user.id);

  // ユーザー名の取得
  const userName = user.user_metadata?.kanji_last_name ||
                   user.user_metadata?.name_kanji ||
                   'テスト';

  return (
    <div className="space-y-6">
      {/* 統合ダッシュボード（自動更新付き） */}
      <UnifiedDashboardClient
        initialStatsPromise={initialStatsPromise}
        userId={user.id}
        userName={userName}
        initialPeriod={30}
      />
    </div>
  );
}

export async function AuthenticatedDashboard() {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    console.error('[DashboardContent] requireAuth FAILED:', error);
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/dashboard');
    }
    throw error;
  }

  return <DashboardContent user={user} />;
}

// =====================================================
// Page Component
// =====================================================

export default function DashboardPage() {
  return (
    <Suspense fallback={<MemberDashboardRouteShell />}>
      <AuthenticatedDashboard />
    </Suspense>
  );
}

// =====================================================
// Server Component Metadata
// =====================================================

export const metadata = {
  title: 'マイページトップ | Epackage Lab',
  description: 'Epackage Lab会員ダッシュボードトップ',
};

// Force dynamic rendering for this authenticated page
export const dynamic = 'force-dynamic';
