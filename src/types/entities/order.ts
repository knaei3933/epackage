/**
 * Order Entity Types
 *
 * 注文エンティティの統一型定義
 * すべての注文関連型の正規ソース
 * @module types/entities/order
 */

import type { Json } from '../core/common';
import type { Address } from '../core/common';
import type { OrderStatus } from '../order-status';

// =====================================================
// Order Item
// =====================================================

/**
 * 注文アイテム
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications: Json | null;
  notes: string | null;
  created_at: string;

  // 拡張フィールド
  orderId?: string | null;
}

// =====================================================
// Order
// =====================================================

/**
 * 注文（基本）
 */
export interface OrderBase {
  id: string;
  user_id: string;
  company_id: string | null;
  quotation_id: string | null;
  orderNumber: string; // order_number
  status: OrderStatus;
  paymentTerm: 'credit' | 'advance';
  subtotal: number;
  taxAmount: number; // tax_amount
  totalAmount: number; // total_amount
  shippingAddress: Address | null; // shipping_address
  billingAddress: Address | null; // billing_address
  requestedDeliveryDate: string | null; // requested_delivery_date
  deliveryNotes: string | null; // delivery_notes
  estimatedDeliveryDate: string | null; // estimated_delivery_date
  customer_name: string;
  customer_email: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

/**
 * 注文（アイテム付き）
 */
export interface Order extends OrderBase {
  items?: OrderItem[];
}

// =====================================================
// Order Create/Update Input
// =====================================================

/**
 * 注文作成入力
 */
export interface OrderCreateInput {
  quotation_id?: string;
  paymentTerm: 'credit' | 'advance';
  shipping_address: Address;
  billing_address: Address;
  requested_delivery_date?: string;
  delivery_notes?: string;
  notes?: string;
}

/**
 * 注文更新入力
 */
export interface OrderUpdateInput {
  shipping_address?: Address;
  billing_address?: Address;
  requested_delivery_date?: string;
  delivery_notes?: string;
  notes?: string;
}

// =====================================================
// Order Status History
// =====================================================

/**
 * 注文ステータス変更履歴
 */
export interface OrderStatusHistory {
  id: string;
  order_id: string;
  from_status: string;
  to_status: string;
  changed_by: string;
  changed_at: string;
  reason: string | null;
  metadata: Json | null;
}

// =====================================================
// Order Comments
// =====================================================

/**
 * 注文コメントタイプ
 */
export type OrderCommentType =
  | 'general'
  | 'production'
  | 'shipping'
  | 'billing'
  | 'correction'
  | 'internal';

/**
 * 注文コメント
 */
export interface OrderComment {
  id: string;
  order_id: string;
  user_id: string;
  content: string;
  comment_type: OrderCommentType;
  parent_comment_id: string | null;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

/**
 * コメント作成入力
 */
export interface OrderCommentCreateInput {
  content: string;
  comment_type?: OrderCommentType;
  parent_comment_id?: string;
  attachments?: string[];
}

// =====================================================
// Order Filters & Pagination
// =====================================================

/**
 * 注文フィルター
 */
export interface OrderFilters {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  userId?: string;
  companyId?: string;
}

/**
 * 注文ページネーションパラメータ
 */
export interface OrderPaginationParams {
  page: number;
  limit: number;
  sortBy?: 'created_at' | 'updated_at' | 'orderNumber' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 注文ページネートレスポンス
 */
export interface OrderPaginatedResponse {
  data: Order[];
  pagination: {
    total: number;
    count: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// =====================================================
// Type Guards
// =====================================================

/**
 * 注文アイテムかチェック
 */
export function isOrderItem(value: unknown): value is OrderItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'order_id' in value &&
    'product_name' in value &&
    'quantity' in value &&
    'unit_price' in value &&
    'total_price' in value
  );
}

/**
 * 注文かチェック
 */
export function isOrder(value: unknown): value is Order {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'orderNumber' in value &&
    'status' in value &&
    'customer_name' in value &&
    'totalAmount' in value
  );
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * 注文の合計金額を計算（アイテムから）
 */
export function calculateOrderTotal(items: OrderItem[]): {
  subtotal: number;
  taxAmount: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const taxRate = 0.1; // 10% 消費税
  const taxAmount = Math.round(subtotal * taxRate);
  const total = subtotal + taxAmount;

  return { subtotal, taxAmount, total };
}
