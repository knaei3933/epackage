'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * サイドバーメニュー項目の型定義
 */
export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
  subMenu?: MenuItem[];
  requiresB2B?: boolean;
}

/**
 * サイドバーナビゲーションコンポーネントのプロパティ
 */
export interface SidebarNavigationProps {
  /** メニュー項目のリスト */
  menuItems: MenuItem[];
  /** 通知数オブジェクト */
  notifications?: {
    quotations?: number;
    samples?: number;
    inquiries?: number;
    orders?: number;
  };
}

/**
 * メニュー項目コンポーネント
 */
interface MenuItemComponentProps {
  item: MenuItem;
  isActive: boolean;
  isSubActive: boolean;
  isCollapsed: boolean;
  pathname: string;
  onItemClick?: () => void;
}

const MenuItemComponent: React.FC<MenuItemComponentProps> = ({
  item,
  isActive,
  isSubActive,
  isCollapsed,
  pathname,
  onItemClick
}) => {
  // ✅ PRIORITY 3: Use Next.js Router instead of window.location.href for proper session management
  const router = useRouter();
  const hasSubMenu = item.subMenu && item.subMenu.length > 0;

  // 現在のパスに基づいてサブメニューを自動的に開く
  const shouldSubmenuBeOpen = useMemo(() => {
    if (!hasSubMenu) return false;
    return item.subMenu!.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'));
  }, [hasSubMenu, item.subMenu, pathname]);

  const [isSubmenuOpen, setIsSubmenuOpen] = useState(shouldSubmenuBeOpen);

  // パスが変更したときにサブメニューを自動的に開閉
  useEffect(() => {
    setIsSubmenuOpen(shouldSubmenuBeOpen);
  }, [shouldSubmenuBeOpen]);

  const Icon = item.icon;

  const handleClick = () => {
    if (onItemClick) onItemClick();
  };

  return (
    <div className="w-full">
      <a
        href={hasSubMenu ? '#' : item.href}
        onClick={(e) => {
          if (hasSubMenu) {
            e.preventDefault();
            setIsSubmenuOpen(!isSubmenuOpen);
          } else {
            e.preventDefault();
            // ✅ PRIORITY 3 FIX: Use Next.js router instead of window.location.href
            // This preserves session cookies and prevents authentication loss
            router.push(item.href);
            if (onItemClick) {
              onItemClick();
            }
          }
        }}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out cursor-pointer
          ${isActive || isSubActive
            ? 'bg-[#007AFF] text-white font-medium shadow-sm'
            : 'hover:bg-gray-100 text-gray-700'
          }
          ${isCollapsed ? 'justify-center px-3' : ''}
        `}
        aria-label={item.label}
        aria-current={isActive ? 'page' : undefined}
        aria-expanded={hasSubMenu ? isSubmenuOpen : undefined}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive || isSubActive ? 'text-white' : 'text-gray-500'}`} />

        {!isCollapsed && (
          <>
            <span className="flex-1 text-left text-sm truncate">{item.label}</span>

            {item.badge !== undefined && item.badge > 0 && (
              <span className={`
                text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-medium
                ${isActive || isSubActive
                  ? 'bg-white text-[#007AFF]'
                  : 'bg-red-500 text-white'
                }
              `}>
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}

            {hasSubMenu && (
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 flex-shrink-0 ${
                  isSubmenuOpen ? 'rotate-180' : ''
                } ${isActive || isSubActive ? 'text-white' : 'text-gray-400'}`}
              />
            )}
          </>
        )}
      </a>

      {/* サブメニュー - スライドアニメーション付き */}
      {hasSubMenu && (
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isSubmenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
            ${isCollapsed ? 'hidden' : ''}
          `}
        >
          <div className="ml-8 mt-1 space-y-1 pb-2">
            {item.subMenu!.map((subItem) => {
              // ✅ PRIORITY 3: Use Next.js Router for submenu items
              const SubIcon = subItem.icon;
              const isSubItemActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');

              return (
                <a
                  key={subItem.id}
                  href={subItem.href}
                  onClick={(e) => {
                    e.preventDefault();
                    // ✅ PRIORITY 3 FIX: Use Next.js router instead of window.location.href
                    router.push(subItem.href);
                    if (onItemClick) onItemClick();
                  }}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer
                    ${isSubItemActive
                      ? 'bg-[#007AFF]/10 text-[#007AFF] font-medium border-l-2 border-[#007AFF]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  aria-label={subItem.label}
                  aria-current={isSubItemActive ? 'page' : undefined}
                >
                  <SubIcon className={`w-4 h-4 flex-shrink-0 ${isSubItemActive ? 'text-[#007AFF]' : 'text-gray-400'}`} />
                  <span className="flex-1 text-left truncate">{subItem.label}</span>
                  {subItem.badge !== undefined && subItem.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[18px] text-center">
                      {subItem.badge > 99 ? '99+' : subItem.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * サイドバーナビゲーションコンポーネント
 *
 * brixa.jp マイページベースの階層型ナビゲーションを実装
 * - デスクトップ: 常時表示サイドバー（開閉可能）
 * - モバイル: ハンバーガーメニュー + オーバーレイ表示
 * - 開閉機能（localStorageで状態保存）
 * - アクティブルートハイライト（#007AFF青色背景）
 * - サブメニュー自動展開（現在のパスに基づく）
 * - バッジ通知表示
 * - レスポンシブ対応
 * - キーボードナビゲーション（Tab, Enter, Space, Esc）
 */
export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  menuItems,
  notifications = {}
}) => {
  const pathname = usePathname();
  const { profile } = useAuth();
  const isB2B = profile?.user_type === 'B2B';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Filter menu items based on user_type
  const visibleMenuItems = useMemo(() => {
    return menuItems.filter(item => !item.requiresB2B || isB2B);
  }, [menuItems, isB2B]);

  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // localStorageからサイドバーの状態を復元（デスクトップのみ）
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });

  // サイドバーの状態を保存
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
  }, [isCollapsed]);

  // モバイルメニューが開いているときはbodyスクロールを防止
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      // モバイルメニューが開いたら最初のリンクにフォーカス
      setTimeout(() => {
        const firstLink = mobileNavRef.current?.querySelector('a');
        if (firstLink) {
          (firstLink as HTMLElement).focus();
        }
      }, 100);
    } else {
      document.body.style.overflow = '';
      // モバイルメニューが閉じたらハンバーガーボタンにフォーカスを戻す
      if (mobileMenuButtonRef.current) {
        mobileMenuButtonRef.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // モバイルメニュー内でTabキーでフォーカストラップ
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = mobileNavRef.current?.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab: 最後の要素から最初の要素へ
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: 最初の要素から最後の要素へ
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isMobileMenuOpen]);

  // モバイルかどうかを判定
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  // メニュークリック後、モバイルではメニューを閉じる
  const handleMenuItemClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Escキーでモバイルメニューを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* モバイル用ハンバーガーメニュー ({md}のみ表示) */}
      {isMounted && !isMobile && (
        <button
          ref={mobileMenuButtonRef}
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-md hover:border-[#007AFF] transition-all"
          aria-label="メニューを開く"
          aria-expanded={isMobileMenuOpen}
          type="button"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* モバイルメニューオーバーレイ */}
      {isMounted && isMobile && (
        <>
          {/* オーバーレイ背景 */}
          <div
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* モバイルサイドバー */}
          <nav
            ref={mobileNavRef}
            className={`
              fixed left-0 top-0 h-screen bg-white z-50
              transition-transform duration-300 ease-in-out lg:hidden
              ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
              w-72 max-w-[80vw]
            `}
            aria-label="会員メニュー"
            role="navigation"
          >
            {/* ヘッダー: 閉じるボタンとタイトル */}
            <div className="h-[58px] flex items-center justify-between border-b border-gray-200 px-4">
              <span className="text-lg font-bold text-gray-900 tracking-tight">マイページ</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="メニューを閉じる"
                type="button"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* メニューアイテムリスト */}
            <div className="py-4 space-y-1 overflow-y-auto flex-1 px-2">
              {visibleMenuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const isSubActive = item.subMenu?.some(
                  sub => pathname === sub.href || pathname.startsWith(sub.href + '/')
                );

                return (
                  <MenuItemComponent
                    key={item.id}
                    item={item}
                    isActive={isActive}
                    isSubActive={!!isSubActive}
                    isCollapsed={false}
                    pathname={pathname}
                    onItemClick={handleMenuItemClick}
                  />
                );
              })}
            </div>

            {/* フッター: ログアウト */}
            <div className="p-4 border-t border-gray-200">
              <a
                href="/auth/logout"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  // ✅ PRIORITY 3 FIX: Use Next.js router instead of window.location.href
                  // Note: For logout, we still use window.location.href to ensure full page reload
                  // and proper session cleanup, but we close the menu first
                  window.location.href = '/auth/logout';
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 cursor-pointer"
                aria-label="ログアウト"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">ログアウト</span>
              </a>
            </div>
          </nav>
        </>
      )}

      {/* デスクトップサイドバー ({lg}以上で表示) */}
      <nav
        className={`
          fixed left-0 top-0 h-screen bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out z-40 hidden lg:block
          ${isCollapsed ? 'w-16' : 'w-52'}
        `}
        aria-label="会員メニュー"
        role="navigation"
      >
        {/* ロゴ・タイトルエリア */}
        <div className="h-[58px] flex items-center justify-between border-b border-gray-200 px-4">
          {!isCollapsed && (
            <span className="text-lg font-bold text-gray-900 tracking-tight">マイページ</span>
          )}
          {isCollapsed && (
            <span className="text-lg font-bold text-[#007AFF] mx-auto">M</span>
          )}
        </div>

        {/* トグルボタン - 影付きで視認性向上 */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-[72px] w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:border-[#007AFF] transition-all duration-200 z-50"
          aria-label={isCollapsed ? 'サイドバーを開く' : 'サイドバーを閉じる'}
          aria-expanded={!isCollapsed}
          type="button"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* メニューアイテムリスト */}
        <div className="py-4 space-y-1 overflow-y-auto flex-1">
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isSubActive = item.subMenu?.some(
              sub => pathname === sub.href || pathname.startsWith(sub.href + '/')
            );

            return (
              <MenuItemComponent
                key={item.id}
                item={item}
                isActive={isActive}
                isSubActive={!!isSubActive}
                isCollapsed={isCollapsed}
                pathname={pathname}
              />
            );
          })}
        </div>

        {/* フッター: ログアウト */}
        <div className="p-4 border-t border-gray-200">
          <a
            href="/auth/logout"
            onClick={(e) => {
              e.preventDefault();
              // ✅ PRIORITY 3 FIX: For logout, we use window.location.href to ensure full page reload
              // This is intentional - logout needs a full page reload to clear all session state
              window.location.href = '/auth/logout';
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
            aria-label="ログアウト"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="text-sm font-medium">ログアウト</span>}
          </a>
        </div>
      </nav>
    </>
  );
};

export default SidebarNavigation;
