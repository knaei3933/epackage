/**
 * Quotation Feature Types
 *
 * 見積もり機能に関連する型定義
 * @module types/features/quotation
 */

import type { Json, TimestampFields, QuotationStatus } from '../database';
import type { Address } from '../core/common';

// =====================================================
// Quotation Types
// =====================================================

/**
 * 見積もりアイテム
 */
export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string | null;
  product_name: string;
  category: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications: Json | null;
  notes: string | null;
  display_order: number;
  created_at: string;
}

/**
 * 見積もり（アイテム付き）
 */
export interface Quotation {
  id: string;
  user_id: string;
  company_id: string | null;
  quotation_number: string;
  quotation_status: QuotationStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  subtotal: number;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  valid_until: string | null;
  notes: string | null;
  pdf_url: string | null;
  admin_notes: string | null;
  sales_rep: string | null;
  estimated_delivery_date: string | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  items?: QuotationItem[];
}

/**
 * 見積もり作成入力
 */
export interface QuotationCreateInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    specifications?: Json;
    notes?: string;
  }>;
  valid_until?: string;
  notes?: string;
  estimated_delivery_date?: string;
}

/**
 * 見積もり更新入力
 */
export interface QuotationUpdateInput {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  valid_until?: string;
  notes?: string;
  admin_notes?: string;
  sales_rep?: string;
  estimated_delivery_date?: string;
  items?: Array<{
    id?: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    specifications?: Json;
    notes?: string;
  }>;
}
