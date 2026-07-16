/**
 * Member Dashboard Page
 *
 * 会員ダッシュボードメインページ（ハイブリッド構造）
 * - Server Component: 初期データフェッチ（SSR）
 * - Client Component: SWRによる自動更新・リアルタイム性
 * - 最近のアクティビティは UnifiedDashboardClient（NextActionList）に一本化済み
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError, getUnifiedDashboardStats, type UnifiedDashboardStats } from '@/lib/dashboard';
import { AnnouncementCard } from '@/components/dashboard';
import { UnifiedDashboardClient } from './UnifiedDashboardClient';

// =====================================================
// Components
// =====================================================

async function DashboardContent() {
  // ⚡ OPTIMIZATION: 認証と統計取得を並行実行でFCP改善
  // 従来の詳細統計の併用は廃止 — unified 側で行データ含め一本化済み（AC6）

  // Use requireAuth helper - works in both Dev Mode and Production
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

  // ⚡ 統合統計情報を取得（SSR用初期データ）
  // 行データも unified 側で一本化済み（AC6）・最近セクションは NextActionList に統合し重複を解消
  const initialStats = await getUnifiedDashboardStats(user.id, 'MEMBER', 30).catch((error): UnifiedDashboardStats => {
    console.error('[Dashboard] Failed to fetch unified stats:', error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      totalRevenue: 0,
      activeUsers: 0,
      pendingQuotations: 0,
      ordersByStatus: [],
    };
  });

  // ユーザー名の取得
  const userName = user.user_metadata?.kanji_last_name ||
                   user.user_metadata?.name_kanji ||
                   'テスト';

  // お知らせは unified データを参照（AnnouncementCard・NextActionList とは重複しない）
  const announcements = initialStats.announcements ?? [];

  return (
    <div className="space-y-6">
      {/* 統合ダッシュボード（自動更新付き） */}
      <UnifiedDashboardClient
        initialStats={initialStats}
        userId={user.id}
        userName={userName}
      />

      {/* お知らせセクション（unified の announcements を参照・Critic MAJOR-1） */}
      {announcements.length > 0 && (
        <AnnouncementCard announcements={announcements} />
      )}
    </div>
  );
}

// =====================================================
// Page Component
// =====================================================

// Attempt 58: Remove Suspense wrapper for async Server Component (Next.js 15/16 compatibility)
// async Server Components are automatically wrapped in Suspense by Next.js
export default async function DashboardPage() {
  return <DashboardContent />;
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
