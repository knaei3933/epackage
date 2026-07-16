/**
 * Member Dashboard Page
 *
 * 会員ダッシュボードメインページ（ハイブリッド構造）
 * - Server Component: 初期データフェッチ（SSR）
 * - Client Component: SWRによる自動更新・リアルタイム性
 * - 統計カード
 * - お知らせセクション
 * - 注文・見積・サンプルの最近のアクティビティ
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError, getUnifiedDashboardStats, type UnifiedDashboardStats } from '@/lib/dashboard';
import {
  DashboardStatsCard,
  AnnouncementCard,
  EmptyState
} from '@/components/dashboard';
import { Card } from '@/components/ui';
import { UnifiedDashboardClient } from './UnifiedDashboardClient';

// =====================================================
// Helper Functions
// =====================================================

/**
 * 安全な日付フォーマット関数
 */
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '---';
  try {
    return new Date(date).toLocaleDateString('ja-JP');
  } catch {
    return '---';
  }
}

/**
 * 金額フォーマット関数
 */
function formatAmount(amount: number | null | undefined): string {
  if (amount == null) return '---';
  return `${amount.toLocaleString()}円`;
}

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
  // 従来の詳細統計の呼び出しは廃止 — 行データも unified 側で一本化済み（AC6）
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

  // recent セクション・お知らせは unified データを参照（詳細統計の廃止に伴う一本化・AC6）
  // safeGet によるラップは廃止 — unified の optional フィールドを ?? [] で受ける
  const recentOrders = initialStats.recentOrders ?? [];
  const recentQuotations = initialStats.recentQuotations ?? [];
  const recentSamples = initialStats.recentSamples ?? [];
  const notifications = initialStats.notifications ?? [];
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

      {/* セクショングリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 新規注文 */}
        {recentOrders.length > 0 ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">新規注文</h2>
              <a href="/member/orders" className="text-sm text-primary hover:underline">
                すべて見る
              </a>
            </div>
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="p-3 rounded-lg border border-border-secondary hover:bg-bg-secondary transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-text-muted">
                        {formatAmount(order.totalAmount)}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        {/* 見積依頼 */}
        {recentQuotations.length > 0 ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">見積依頼</h2>
              <a href="/member/quotations" className="text-sm text-primary hover:underline">
                すべて見る
              </a>
            </div>
            <div className="space-y-3">
              {recentQuotations.slice(0, 5).map((quotation) => (
                <div
                  key={quotation.id}
                  className="p-3 rounded-lg border border-border-secondary hover:bg-bg-secondary transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {quotation.quotationNumber}
                      </p>
                      <p className="text-sm text-text-muted">
                        {formatAmount(quotation.totalAmount)}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      {formatDate(quotation.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>

      {/* サンプル依頼セクション */}
      {recentSamples.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">サンプル依頼</h2>
            <a href="/member/samples" className="text-sm text-primary hover:underline">
              すべて見る
            </a>
          </div>
          <div className="space-y-3">
            {recentSamples.slice(0, 5).map((sample) => (
              <div
                key={sample.id}
                className="p-3 rounded-lg border border-border-secondary hover:bg-bg-secondary transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {sample.requestNumber}
                    </p>
                    <p className="text-sm text-text-muted">
                      {(sample.samples ?? []).length}点
                    </p>
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {formatDate(sample.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 通知セクション */}
      {notifications.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <h2 className="text-lg font-semibold text-text-primary">通知</h2>
            </div>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors ${
                  !notification.is_read
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'border-border-secondary hover:bg-bg-secondary'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {notification.title}
                    </p>
                    <p className="text-sm text-text-muted mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
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
