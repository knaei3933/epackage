import { OrderStatus } from './database';

export interface DashboardStatistics {
  // 注文統計（Order Statistics）
  ordersByStatus: Array<{
    status: OrderStatus;
    count: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    amount: number;
  }>;
  pendingQuotations: number;
  activeProduction: number;
  todayShipments: number;
  totalOrders: number;
  totalRevenue: number;

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
