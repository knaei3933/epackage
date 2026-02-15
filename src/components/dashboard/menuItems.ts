/**
 * 会員ダッシュボードサイドバーナビゲーション用メニューデータ
 */

import {
  Home,
  ShoppingCart,
  FileText,
  Package,
  MessageSquare,
  User,
  Settings,
  ClipboardList,
  RefreshCw,
  History,
  Truck,
  Receipt,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import { MenuItem } from './SidebarNavigation';

/**
 * メインメニューデータ
 * brixa.jp マイページ構造に基づく階層型ナビゲーション
 *
 * 構造の改善点:
 * - 配送先と請求先を注文のサブメニューから独立したメニューアイテムに分離
 * - プロフィール閲覧と会員情報編集を別のメニューアイテムとして明確に区分
 */
export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'マイページトップ',
    icon: Home,
    href: '/member/dashboard',
  },
  {
    id: 'samples',
    label: 'サンプル依頼',
    icon: Package,
    href: '/member/samples',
  },
  {
    id: 'inquiries',
    label: 'お問い合わせ',
    icon: MessageSquare,
    href: '/member/inquiries',
  },
  {
    id: 'quotations',
    label: '見積管理',
    icon: FileText,
    href: '/member/quotations',
  },
  {
    id: 'orders',
    label: '注文',
    icon: ShoppingCart,
    href: '/member/orders/new',
    subMenu: [
      {
        id: 'orders-new',
        label: '新規注文',
        icon: ClipboardList,
        href: '/member/orders/new',
      },
      {
        id: 'orders-reorder',
        label: '再注文',
        icon: RefreshCw,
        href: '/member/orders/reorder',
      },
      {
        id: 'orders-history',
        label: '注文履歴',
        icon: History,
        href: '/member/orders/history',
      },
    ],
  },
  {
    id: 'deliveries',
    label: '納品先管理',
    icon: Truck,
    href: '/member/deliveries',
  },
  {
    id: 'billing-addresses',
    label: '請求先管理',
    icon: Receipt,
    href: '/member/billing-addresses',
  },
  {
    id: 'invoices',
    label: '請求書',
    icon: FileText,
    href: '/member/invoices',
  },
  {
    id: 'contracts',
    label: '契約管理',
    icon: FileCheck,
    href: '/member/contracts',
  },
  {
    id: 'profile',
    label: 'プロフィール',
    icon: User,
    href: '/member/profile',
  },
  {
    id: 'edit',
    label: '会員情報編集',
    icon: User,
    href: '/member/edit',
  },
  {
    id: 'settings',
    label: '設定',
    icon: Settings,
    href: '/member/settings',
  },
];

/**
 * メニューアイテムに通知バッジを追加する関数
 * @param items ベースメニューアイテム
 * @param notifications 通知数オブジェクト
 * @returns バッジ付きメニューアイテム
 */
export const addBadgesToMenu = (
  items: MenuItem[],
  notifications: {
    quotations?: number;
    samples?: number;
    inquiries?: number;
    orders?: number;
  }
): MenuItem[] => {
  return items.map((item) => {
    let badge = notifications[item.id as keyof typeof notifications];

    // サブメニューの場合は合計を計算
    if (item.subMenu) {
      const subMenuBadges = item.subMenu
        .map((sub) => notifications[sub.id as keyof typeof notifications] || 0)
        .filter((n) => n > 0);

      if (subMenuBadges.length > 0) {
        badge = subMenuBadges.reduce((sum, n) => sum + n, 0);
      }
    }

    return {
      ...item,
      badge,
      subMenu: item.subMenu
        ? item.subMenu.map((sub) => ({
            ...sub,
            badge: notifications[sub.id as keyof typeof notifications],
          }))
        : undefined,
    };
  });
};
