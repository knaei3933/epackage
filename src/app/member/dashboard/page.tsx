/**
 * Member Dashboard Page
 *
 * 会員ダッシュボードメインページ（ハイブリッド構造）
 * - Server Component: 初期データフェッチ（SSR）
 * - Client Component: SWRによる自動更新・リアルタイム性
 * - 最近のアクティビティは UnifiedDashboardClient（NextActionList）に一本化済み
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError, getUnifiedDashboardStats } from '@/lib/dashboard';
import type { DashboardInitialStatsResult } from '@/types/dashboard-result';
import { UnifiedDashboardClient } from './UnifiedDashboardClient';

// =====================================================
// Components
// =====================================================

type AuthenticatedUser = Awaited<ReturnType<typeof requireAuth>>;

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

// =====================================================
// Page Component
// =====================================================

// Attempt 58: Remove Suspense wrapper for async Server Component (Next.js 15/16 compatibility)
// async Server Components are automatically wrapped in Suspense by Next.js
export default async function DashboardPage() {
  // Complete verified auth in the route function so unauthorized requests keep
  // today's exact redirect outcome and no shell can leak first.
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
// Server Component Metadata
// =====================================================

export const metadata = {
  title: 'マイページトップ | Epackage Lab',
  description: 'Epackage Lab会員ダッシュボードトップ',
};

// Force dynamic rendering for this authenticated page
export const dynamic = 'force-dynamic';
