import { OrderStatus } from './database';
import type { Permission } from '@/lib/rbac/rbac-helpers';
import type { UnifiedDashboardStats } from '@/lib/dashboard';

// =====================================================
// Admin Auth Types (Canonical)
// =====================================================

/**
 * Admin認証コンテキスト
 *
 * Server Component (loader.ts) と Client Component 間で共有される
 * 正規の認証情報型。各ページやコンポーネントで個別に定義せず、
 * この型をインポートして使用すること。
 */
export interface AdminAuthContext {
  userId: string;
  role: 'admin' | 'operator' | 'sales' | 'accounting';
  userName: string;
  permissions: Permission[];
  isDevMode: boolean;
}

/**
 * Client Component用の最小限のProps型
 *
 * Server ComponentからClient ComponentにauthContextを渡す際の
 * 共通Props。各ページのClient Componentはこの型を拡張して使用する。
 *
 * @example
 * interface MyPageClientProps extends AdminClientProps {
 *   initialData: SomeData;
 * }
 */
export interface AdminClientProps {
  authContext: AdminAuthContext;
}

// =====================================================
// Dashboard Types
// =====================================================

export interface DashboardStatistics {
  // 注文統計（Order Statistics）
  ordersByStatus: Array<{
    status: OrderStatus;
    count: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  pendingQuotations: number;
  todayShipments: number;
  totalOrders: number;
  totalRevenue: number;
  recentQuotations?: Array<{
    quotation_number: string;
    customer_name: string;
    customer_email: string;
    status: string;
    total_amount: number;
    created_at: string;
  }>;

  // 追加統計（Enhanced Statistics）
  orders?: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    totalRevenue: number;
    avgOrderAmount: number;
    byStatus: Array<{ status: string; count: number }>;
  };

  quotations?: {
    total: number;
    draft: number;
    sent: number;
    pending: number;
    approved: number;
    conversionRate: number;
    recent: Array<{
      quotation_number: string;
      customer_name: string;
      customer_email: string;
      status: string;
      total_amount: number;
      created_at: string;
    }>;
  };

  samples?: {
    total: number;
    processing: number;
    completed: number;
  };

  production?: {
    inProgress: number;
    completed: number;
    avgDays: number;
  };

  shipments?: {
    today: number;
    inTransit: number;
  };

  period?: number;
  generatedAt?: string;
}

/**
 * 管理者ダッシュボード用統計型（型統合・ADR synthesis・解釈B）
 *
 * UnifiedDashboardStats（会員・管理者共通の正規型・src/lib/dashboard.ts）を
 * ベースに、管理者ダッシュボードが KPI カードやウィジェットで必須参照する
 * 項目を required 上書きした交差型（intersection）の type alias。
 *
 * 設計方針:
 * - UnifiedDashboardStats は現状維持（会員側 src/lib/dashboard.ts への影響ゼロ）。
 * - 第3の interface は新設せず、type alias の intersection のみ（Principle 3 準拠）。
 *
 * これにより:
 * - /api/admin/dashboard/unified-stats（getUnifiedDashboardStats の戻り値）と
 * - AdminDashboardClient の useSWR<AdminDashboardStats>
 * が同じ UnifiedDashboardStats 由来の構造で型安全に結合する。
 * recentQuotations は UnifiedDashboardStats の Quotation[] を引き継ぐ。
 */
export type AdminDashboardStats = UnifiedDashboardStats & {
  // UnifiedDashboardStats では optional の、管理者ダッシュボード必須項目を required 化
  ordersByStatus: NonNullable<UnifiedDashboardStats['ordersByStatus']>;
  pendingQuotations: number;
  todayShipments: number;
  monthlyRevenue: NonNullable<UnifiedDashboardStats['monthlyRevenue']>;
  // activeUsers のエイリアス・管理ダッシュボードではアクティブ顧客数として表示
  activeCustomers: number;
};

export interface DashboardAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  count: number;
  action?: string;
  actionHref?: string;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'quotation' | 'production' | 'shipment';
  customerName: string;
  productName: string;
  status: OrderStatus;
  createdAt: string;
}

export type ContractStatus = 'DRAFT' | 'SENT' | 'PENDING_SIGNATURE' | 'CUSTOMER_SIGNED' | 'ADMIN_SIGNED' | 'SIGNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Contract {
  id: string;
  contractNumber: string;
  orderId: string;
  customerName: string;
  customerEmail?: string;
  status: ContractStatus;
  sentAt: string | null;
  customerSignedAt: string | null;
  adminSignedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}
