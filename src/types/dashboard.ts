/**
 * Dashboard Types
 *
 * 会員ダッシュボード用タイプ定義
 * - 注文管理
 * - 納品先・請求先
 * - 見積・サンプル・お問い合わせ
 * - 統計情報
 */

import type { User as SupabaseUser } from '@supabase/supabase-js';
import type {
  OrderStatus,
  OrderStatusLegacy,
  ProductionSubStatus,
} from '@/types/order-status';

// Re-export for convenience
export type { OrderStatus, OrderStatusLegacy, ProductionSubStatus };

// Export order status utilities from the unified type system
export {
  ORDER_STATUS_LABELS,
  PRODUCTION_SUB_STATUS_LABELS,
  OrderStatusMapping,
  VALID_STATUS_TRANSITIONS,
  isValidStatusTransition,
  getNextStatuses,
  isTerminalStatus,
  isActiveStatus,
  isOrderStatus,
  isOrderStatusLegacy,
  isProductionSubStatus,
  isProductionStatus,
  isContractStatus,
  isInitialPhase,
  isFulfillmentPhase,
  getStatusLabel,
  getStatusDescription,
  getStatusCategory,
  getProductionSubStatusLabel,
  getStatusProgress,
  getAllStatuses,
  getAllProductionSubStatuses,
} from '@/types/order-status';

// =====================================================
// User Types
// =====================================================

export interface User {
  id: string;
  email?: string;
  emailVerified?: boolean | Date | null;  // Compatible with both auth types
  userMetadata?: {
    company_name?: string;
    kanji_last_name?: string;
    kanji_first_name?: string;
    kana_last_name?: string;
    kana_first_name?: string;
  };
  createdAt?: string | Date;  // Compatible with both auth types
  updatedAt?: string | Date;
}

// =====================================================
// Order Types
// =====================================================

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  deliveryAddress?: DeliveryAddress;
  billingAddress?: BillingAddress;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  subtotal?: number;
  taxAmount?: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: {
    size?: string;
    material?: string;
    printing?: string;
    postProcessing?: string[];
  };
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
  createdAt: string;
}

// =====================================================
// Address Types
// =====================================================

export interface DeliveryAddress {
  id: string;
  userId: string;
  name: string; // 納品先名（会社名・施設名など）
  postalCode: string;
  prefecture: string;
  city: string;
  address: string; // 番地
  building?: string; // 建物名
  phone: string;
  contactPerson?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillingAddress {
  id: string;
  userId: string;
  companyName: string; // 請求先会社名
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building?: string;
  taxNumber?: string; // 法人番号
  email?: string;
  phone?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// Quotation Types
// =====================================================

export type QuotationStatus =
  | 'draft'      // 作成中
  | 'sent'       // 送信済
  | 'approved'   // 承認済
  | 'rejected'   // 却下
  | 'expired';   // 期限切れ

export interface Quotation {
  id: string;
  userId: string;
  quotationNumber: string;
  status: QuotationStatus;
  totalAmount: number;
  validUntil: string;
  items: QuotationItem[];
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  approvedAt?: string;
  pdfUrl?: string | null;  // 保存されたPDFのURL
}

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: Record<string, unknown>;
  orderId?: string | null;  // Reference to order created from this item
}

// =====================================================
// Sample Request Types
// =====================================================

export type DashboardSampleRequestStatus =
  | 'received'    // 受付済
  | 'processing'  // 処理中
  | 'shipped'     // 発送済
  | 'delivered'   // 配送完了
  | 'cancelled';  // キャンセル

export interface DashboardSampleRequest {
  id: string;
  userId: string;
  requestNumber: string;
  status: DashboardSampleRequestStatus;
  samples: SampleItem[];
  deliveryAddress?: DeliveryAddress;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  trackingNumber?: string;
}

export interface SampleItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
}

// =====================================================
// Inquiry Types
// =====================================================

export type InquiryType =
  | 'product'     // 商品に関するお問い合わせ
  | 'quotation'   // 見積に関するお問い合わせ
  | 'sample'      // サンプルに関するお問い合わせ
  | 'order'       // 注文に関するお問い合わせ
  | 'billing'     // 請求に関するお問い合わせ
  | 'other';      // その他

export type InquiryStatus =
  | 'open'        // 未対応
  | 'responded'   // 返信済
  | 'resolved'    // 完了
  | 'closed';     // クローズ

export interface Inquiry {
  id: string;
  userId: string;
  inquiryNumber: string;
  type: InquiryType;
  status: InquiryStatus;
  subject: string;
  message: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
}

// =====================================================
// Announcement Types
// =====================================================

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'maintenance' | 'update' | 'notice' | 'promotion';
  priority: 'low' | 'medium' | 'high';
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
}

// =====================================================
// Dashboard Stats Types
// =====================================================

export interface ContractStats {
  id: string;
  contract_number: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export interface NotificationStats {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

export interface DashboardStats {
  orders: {
    new: Order[];
    processing: Order[];
    total: number;
  };
  quotations: {
    pending: Quotation[];
    total: number;
  };
  samples: {
    pending: DashboardSampleRequest[];
    total: number;
  };
  inquiries: {
    unread: Inquiry[];
    total: number;
  };
  announcements: Announcement[];
  // B2B integration: contracts and notifications
  contracts: {
    pending: ContractStats[];
    total: number;
    signed: number;
  };
  notifications: NotificationStats[];
}

export interface NotificationBadge {
  quotations?: number;
  samples?: number;
  inquiries?: number;
  orders?: number;
  total: number;
}

// =====================================================
// Filter and Pagination Types
// =====================================================

export interface OrderFilters {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =====================================================
// Form Types
// =====================================================

export interface DeliveryAddressFormData {
  name: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building?: string;
  phone: string;
  contactPerson?: string;
  isDefault?: boolean;
}

export interface BillingAddressFormData {
  companyName: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building?: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  isDefault?: boolean;
}
