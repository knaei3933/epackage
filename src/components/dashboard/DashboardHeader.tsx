/**
 * Dashboard Header Component
 *
 * ダッシュボードヘッダーコンポーネント
 * - 通知システム（バッジカウント）
 * - クイックアクションボタン
 * - ユーザードロップダウン
 * - 58px固定高さ
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui';
import type { User as AuthUser } from '@/types/auth';
import type { NotificationBadge } from '@/types/dashboard';
import { motion } from 'framer-motion';

// =====================================================
// Props
// =====================================================

export interface DashboardHeaderProps {
  user: AuthUser;
  notifications: NotificationBadge;
}

// =====================================================
// Component
// =====================================================

export function DashboardHeader({ user, notifications }: DashboardHeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [prevNotificationCount, setPrevNotificationCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track notification count changes for animation
  useEffect(() => {
    if (notifications.total !== prevNotificationCount) {
      setPrevNotificationCount(notifications.total);
    }
  }, [notifications.total, prevNotificationCount]);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ユーザー名を取得（プロフィールから）
  // user.userMetadata 대신 user.kanjiLastName, user.kanjiFirstName를 직접 사용
  // SAFETY: Handle null/undefined user during SSR or AuthContext initialization
  if (!user) {
    return null;
  }

  const displayName =
    (user.kanjiLastName && user.kanjiFirstName)
      ? `${user.kanjiLastName} ${user.kanjiFirstName}`
      : user.companyName
      ? user.companyName
      : user.email?.split('@')[0] || 'User';

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/signout', { method: 'POST' });
      if (response.ok) {
        // SECURITY: Client-side dev mode mock data clearing removed (dev mode now server-side only)
        // Server-side API will handle any dev mode cleanup

        // Redirect to signin page
        router.push('/auth/signin');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-[58px] bg-white border-b border-border-secondary px-4 md:px-6 flex items-center justify-between">
      {/* 左側: ロゴ・タイトル */}
      <div className="flex items-center gap-4">
        <a
          href="/member/dashboard"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/member/dashboard';
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <h1 className="text-lg font-bold text-text-primary">
            Epackage Lab
          </h1>
          <span className="text-sm text-text-muted hidden sm:inline">
            マイページ
          </span>
        </a>
      </div>

      {/* 右側: 通知・クイックアクション・ユーザー */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* クイックアクションボタン */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href="/quote-simulator"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/quote-simulator';
            }}
          >
            <Button variant="primary" size="sm">
              スマート見積
            </Button>
          </a>
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/contact';
            }}
          >
            <Button variant="secondary" size="sm">
              お問い合わせ
            </Button>
          </a>
        </div>

        {/* 通知ベル */}
        <a
          href="/member/dashboard#notifications"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/member/dashboard#notifications';
          }}
          className="relative p-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          aria-label="通知"
        >
          <motion.div
            whileHover={{ rotate: [0, -15, 15, -15, 0], transition: { duration: 0.5 } }}
          >
            <Bell className="w-5 h-5" />
          </motion.div>
          {notifications.total > 0 && (
            <motion.span
              key={notifications.total}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
            >
              {notifications.total > 9 ? '9+' : notifications.total}
            </motion.span>
          )}
        </a>

        {/* ユーザードロップダウン */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-secondary transition-colors"
            aria-label="ユーザーメニュー"
            aria-expanded={isDropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-text-primary hidden md:block max-w-[150px] truncate">
              {displayName}
            </span>
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {/* ドロップダウンメニュー */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-border-secondary rounded-lg shadow-lg py-2 z-50">
              {/* 会社名・ユーザー情報 */}
              <div className="px-4 py-2 border-b border-border-secondary">
                <p className="text-sm font-medium text-text-primary truncate">
                  {displayName}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {user.email}
                </p>
              </div>

              {/* メニューアイテム */}
              <div className="py-1">
                <a
                  href="/member/edit"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDropdownOpen(false);
                    window.location.href = '/member/edit';
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  会員情報編集
                </a>
                <a
                  href="/member/settings"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDropdownOpen(false);
                    window.location.href = '/member/settings';
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  設定
                </a>
              </div>

              {/* ログアウト */}
              <div className="border-t border-border-secondary pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-bg-secondary transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  ログアウト
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
