/**
 * Portal Layout Component
 * カスタマーポータルレイアウト
 *
 * Main layout wrapper for the customer portal with:
 * - Sidebar navigation
 * - Header with notifications and user menu
 * - Mobile responsive design
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PORTAL_NAV_ITEMS, type PortalNavItem } from '@/types/portal';
import { cn } from '@/lib/utils';
import { useFocusTrap } from '@/hooks';

interface PortalLayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  item: PortalNavItem;
  isActive: boolean;
}

function NavItem({ item, isActive }: NavItemProps) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
        'hover:bg-slate-100 dark:hover:bg-slate-800',
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
          : 'text-slate-700 dark:text-slate-300'
      )}
    >
      {/* Icon placeholder - would use proper icons */}
      <span className="text-lg">
        {item.icon === 'home' && '🏠'}
        {item.icon === 'document' && '📋'}
        {item.icon === 'file' && '📄'}
        {item.icon === 'settings' && '⚙️'}
        {item.icon === 'message' && '💬'}
      </span>

      <span className="flex-1">{item.label_ja}</span>

      {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
        <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </Link>
  );
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  // Focus trap for mobile menu - keeps focus within sidebar when open
  useFocusTrap(sidebarRef, {
    isActive: isMobileMenuOpen,
    returnFocusRef: menuButtonRef,
    autoFocus: true,
  });

  // Escape key handler to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMobileMenuOpen]);

  // Get unread count for notifications badge (would come from API)
  const notificationCount = 0;

  const navItemsWithBadges: PortalNavItem[] = PORTAL_NAV_ITEMS.map((item) => {
    if (item.href === '/portal') {
      return item;
    }
    return item;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            ref={menuButtonRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="メニュー"
            aria-expanded={isMobileMenuOpen}
            aria-controls="sidebar-menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">カスタマーポータル</h1>
          <div className="w-10" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        ref={sidebarRef}
        id="sidebar-menu"
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <Link href="/portal" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                E
              </div>
              <div>
                <h1 className="font-semibold text-slate-900 dark:text-white">Epackage Lab</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">カスタマーポータル</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItemsWithBadges.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href));
              return <NavItem key={item.href} item={item} isActive={isActive} />;
            })}
          </nav>

          {/* User Info Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <Link
              href="/portal/profile"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  ユーザー
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  お客様名
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  プロフィール設定
                </p>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* Desktop Header */}
        <header className="hidden lg:block sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                {PORTAL_NAV_ITEMS.find((item) => pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href)))?.label_ja || 'カスタマーポータル'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Link
                href="/portal?tab=notifications"
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Link>

              {/* Logout */}
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  ログアウト
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
            <p>&copy; 2025 Epackage Lab. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-slate-700 dark:hover:text-slate-300">
                利用規約
              </Link>
              <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-300">
                プライバシーポリシー
              </Link>
              <Link href="/portal/support" className="hover:text-slate-700 dark:hover:text-slate-300">
                お問い合わせ
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
