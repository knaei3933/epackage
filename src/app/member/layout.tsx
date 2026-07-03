/**
 * Member Dashboard Layout
 *
 * 会員ダッシュボードレイアウト
 * - クライアントコンポーネント
 * - 認証チェックのみ
 * - データフェッチは各ページで実行
 * - Error Boundaryでエラー耐性強化
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { menuItems } from '@/components/dashboard/menuItems';
import { ErrorBoundaryWrapper } from '@/components/error/ErrorBoundary';
import type { NotificationBadge } from '@/types/dashboard';
import { useNotifications } from '@/hooks/useNotifications';

// Dynamic imports for navigation components
const SidebarNavigation = dynamic(
  () => import('@/components/dashboard/SidebarNavigation').then(m => m.SidebarNavigation),
  {
    ssr: false,
    loading: () => <div className="w-52 h-screen bg-gray-100 animate-pulse" />
  }
);

const DashboardHeader = dynamic(
  () => import('@/components/dashboard/DashboardHeader').then(m => m.DashboardHeader),
  {
    ssr: false,
    loading: () => <div className="h-16 bg-gray-100 animate-pulse" />
  }
);

// =====================================================
// Layout Component
// =====================================================

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  // 通知フックで未読カウントを取得（60秒間隔で自動更新）
  const { unreadCount } = useNotifications({ refreshInterval: 60000 });

  // 通知バッジ（useNotificationsフックから未読カウントを取得）
  const notifications: NotificationBadge = {
    quotations: 0,
    samples: 0,
    inquiries: 0,
    orders: 0,
    total: unreadCount,
  };

  // レイアウト構造は SSR とクライアント初回レンダーで完全に一致させる（hydration mismatch を根本解消）。
  // 認証リダイレクトは各ページの Server Component (requireAuth) が担当するため、
  // ここでは isMounted ゲートによる分岐ツリーを生成しない。
  return (
    <ErrorBoundaryWrapper enableRetry={false} showDetails={false}>
      <div className="min-h-screen bg-bg-secondary">
        {/* デスクトップサイドバー - always show (server-side auth passed) */}
        <div className="hidden lg:block">
          <SidebarNavigation menuItems={menuItems} notifications={notifications} />
        </div>

        {/* メインコンテンツエリア */}
        <div className="lg:pl-52">
          {/* ダッシュボードヘッダー - only show if we have client-side user */}
          {user && <DashboardHeader user={user} notifications={notifications} />}

          {/* ページコンテンツ - always render */}
          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ErrorBoundaryWrapper>
  );
}
