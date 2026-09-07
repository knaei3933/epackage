'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  FileText,
  UserCheck,
  Settings,
  Users,
  ChevronRight,
  DollarSign,
  Tag,
  Bell,
  MessageSquare,
} from 'lucide-react';

const navigation = [
  { name: 'ダッシュボード', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: '会員承認', href: '/admin/approvals', icon: UserCheck },
  { name: '見積管理', href: '/admin/quotations', icon: FileText },
  { name: '注文管理', href: '/admin/orders', icon: ShoppingCart },
  { name: '配送管理', href: '/admin/shipments', icon: Truck },
  { name: 'ブログ管理', href: '/admin/blog', icon: FileText },
  { name: '顧客管理', href: '/admin/customers/management', icon: Users },
  { name: 'お問い合わせ', href: '/admin/inquiries', icon: MessageSquare },
  { name: '契約管理', href: '/admin/contracts', icon: FileText },
  { name: 'お知らせ管理', href: '/admin/notifications', icon: Bell },
  { name: '配送設定', href: '/admin/shipping', icon: Settings },
  { name: 'システム設定', href: '/admin/settings', icon: DollarSign },
  { name: 'クーポン管理', href: '/admin/coupons', icon: Tag },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="管理者ナビゲーション" className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-1 py-2">
          {navigation.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  group flex min-w-0 max-w-full w-fit items-center rounded-md px-2 py-2
                  text-xs font-medium transition-colors duration-150 sm:px-3 sm:text-sm
                  ${isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="mr-1.5 h-4 w-4 flex-shrink-0 sm:mr-2" />
                <span className="min-w-0 max-w-full">{item.name}</span>
                <ChevronRight className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
