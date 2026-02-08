/**
 * Inventory Feature Types
 *
 * 在庫管理機能に関連する型定義
 * @module types/features/inventory
 */

import type { TimestampFields } from '../database';

// =====================================================
// Product Types
// =====================================================

/**
 * 製品カテゴリ
 */
export type ProductCategory =
  | 'flat_3_side'
  | 'stand_up'
  | 'gusset'
  | 'box'
  | 'flat_with_zip'
  | 'special'
  | 'soft_pouch'
  | 'spout_pouch'
  | 'roll_film';

/**
 * 材料タイプ
 */
export type MaterialType = 'PET' | 'AL' | 'CPP' | 'PE' | 'NY' | 'PAPER' | 'OTHER';

/**
 * 製品インターフェース（基本）
 */
export interface Product {
  id: string;
  category: ProductCategory;
  name_ja: string;
  name_en: string;
  name_ko?: string;
  description_ja: string;
  description_en: string;
  description_ko?: string;
  specifications: Record<string, unknown>;
  materials: string[];
  pricing_formula: Record<string, unknown>;
  min_order_quantity: number;
  lead_time_days: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image?: string;
  tags?: string[];
  applications?: string[];
  features?: string[];
}

// =====================================================
// Inventory Types
// =====================================================

/**
 * 在庫アイテム
 */
export interface InventoryItem {
  id: string;
  product_id: string;
  warehouse_location: string;
  bin_location: string | null;
  quantity_on_hand: number;
  quantity_allocated: number;
  quantity_available: number;
  reorder_point: number;
  max_stock_level: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * 在庫調整レスポンス
 */
export interface InventoryAdjustResponse {
  itemId: string;
  previousQuantity: number;
  newQuantity: number;
  adjustment: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: string;
}

// =====================================================
// Inventory Transaction Types
// =====================================================

/**
 * 在庫トランザクション
 */
export interface InventoryTransaction {
  id: string;
  product_id: string;
  inventory_id: string | null;
  order_id: string | null;
  production_job_id: string | null;
  transaction_type:
    | 'receipt'
    | 'issue'
    | 'adjustment'
    | 'transfer'
    | 'return'
    | 'production_in'
    | 'production_out';
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  reference_number: string | null;
  reference_type: string | null;
  reason: string | null;
  notes: string | null;
  performed_by: string | null;
  transaction_at: string;
  created_at: string;
}
