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

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarNavigation } from '@/components/dashboard/SidebarNavigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { menuItems } from '@/components/dashboard/menuItems';
import { Loader2 } from 'lucide-react';
import { ErrorBoundaryWrapper } from '@/components/error/ErrorBoundary';
import type { NotificationBadge } from '@/types/dashboard';
import { useNotifications } from '@/hooks/useNotifications';

// =====================================================
// Layout Component
// =====================================================

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 通知フックで未読カウントを取得（30秒間隔で自動更新）
  const { unreadCount } = useNotifications({ refreshInterval: 30000 });

  // ローディング状態（最優先）
  // Only show loading after mount to prevent hydration mismatch
  if (isMounted && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-text-muted">読み込み中...</p>
        </div>
      </div>
    );
  }

  // Note: Client-side auth redirect removed - let server-side requireAuth() handle it
  // The dashboard page uses requireAuth() which redirects to signin if not authenticated
  // This prevents race conditions between AuthContext initialization and page navigation

  // 通知バッジ（useNotificationsフックから未読カウントを取得）
  const notifications: NotificationBadge = {
    quotations: 0,
    samples: 0,
    inquiries: 0,
    orders: 0,
    total: unreadCount,
  };

  // Don't render header if user is not available yet (SSR/hydration safety)
  // This prevents null reference errors during initial render
  // NOTE: Server Components handle auth via requireAuth()
  if (!isMounted) {
    return (
      <ErrorBoundaryWrapper
        enableRetry={false}
        showDetails={false}
      >
        <div className="min-h-screen bg-bg-secondary">
          {/* ローディング状態 - only during initial mount */}
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </ErrorBoundaryWrapper>
    );
  }

  // Since Server Components handle auth via requireAuth(),
  // if we're here, the user is authenticated server-side.
  // Always show sidebar and layout - client-side user can be null initially
  return (
    <ErrorBoundaryWrapper
      enableRetry={false}
      showDetails={false}
    >
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
