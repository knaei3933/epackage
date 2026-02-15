/**
 * Order Feature Types
 *
 * 注文機能に関連する型定義
 * @module types/features/order
 */

import type { Json, TimestampFields } from '../database';
import type { Address } from '../core/common';
import type { OrderStatus } from '../order-status';

// =====================================================
// Order Types
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
}

/**
 * 注文（アイテム付き）
 */
export interface Order {
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
  items?: OrderItem[];
  customer_name: string;
  customer_email: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

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
// Order Status History Types
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
// Order Comments Types
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
