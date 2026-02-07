'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  FileText,
  UserCheck,
  Boxes,
  Settings,
  Users,
  ChevronRight,
  DollarSign,
  Tag,
  Bell,
} from 'lucide-react';

const navigation = [
  { name: 'ダッシュボード', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: '注文管理', href: '/admin/orders', icon: ShoppingCart },
  { name: '見積管理', href: '/admin/quotations', icon: FileText },
  // 生産管理は非表示
  // { name: '生産管理', href: '/admin/production', icon: Package },
  { name: '配送管理', href: '/admin/shipments', icon: Truck },
  { name: '契約管理', href: '/admin/contracts', icon: FileText },
  { name: '会員承認', href: '/admin/approvals', icon: UserCheck },
  { name: '在庫管理', href: '/admin/inventory', icon: Boxes },
  { name: 'お知らせ管理', href: '/admin/notifications', icon: Bell },
  { name: '配送設定', href: '/admin/shipping', icon: Settings },
  { name: 'リード管理', href: '/admin/leads', icon: Users },
  { name: 'システム設定', href: '/admin/settings', icon: DollarSign },
  { name: 'クーポン管理', href: '/admin/coupons', icon: Tag },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 overflow-x-auto py-2">
          {navigation.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md
                  transition-colors duration-150 whitespace-nowrap
                  ${isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{item.name}</span>
                <ChevronRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
