/**
 * Core Database Types
 *
 * データベース関連のコア型定義
 * Supabaseから生成された型をインポートし、拡張する
 * @module types/core/database
 */

// =====================================================
// Import from main database.ts
// =====================================================

// データベース型はメインのdatabase.tsからインポート
// このファイルではコアとなる型のみを再エクスポートし、
// 必要に応じて拡張型を定義する

export type { Database, Json } from '../database';

// =====================================================
// Common Database Field Types
// =====================================================

/**
 * タイムスタンプフィールド（共通）
 */
export interface TimestampFields {
  created_at: string;
  updated_at: string;
}

/**
 * ソフト削除フィールド
 */
export interface SoftDeleteFields extends TimestampFields {
  deleted_at: string | null;
}

// =====================================================
// User & Profile Types (Core)
// =====================================================

/**
 * ユーザー区分値（enums.ts の真正値を re-export）
 *
 * 真正値（source of truth）は enums.ts（as const 配列）。実DB profiles と整合:
 *   - role（5値: ADMIN/MEMBER/KOREA_DESIGNER/OPERATOR/SALES）
 *   - business_type（2値: INDIVIDUAL/CORPORATION）
 *   - status（5値: PENDING/ACTIVE/SUSPENDED/DELETED/INVITED）
 *   - product_category（6値: COSMETICS/CLOTHING/ELECTRONICS/KITCHEN/FURNITURE/OTHER）
 */
export type {
  UserRole,
  BusinessType,
  UserStatus,
  ProductCategory,
} from '../enums';

/**
 * ユーザータイプ（B2C/B2B）
 */
export type UserType = 'B2C' | 'B2B';

// =====================================================
// Order Status Types (Core)
// =====================================================

/**
 * 注文ステータス（詳細はorder-status.tsに委譲）
 */
export type OrderStatusBase =
  | 'pending'
  | 'processing'
  | 'manufacturing'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

/**
 * 生産サブステータス
 */
export type ProductionSubStatus =
  | 'design_received'
  | 'work_order_created'
  | 'material_prepared'
  | 'printing'
  | 'lamination'
  | 'slitting'
  | 'pouch_making'
  | 'qc_passed'
  | 'packaged';

// =====================================================
// Quotation Status Types
// =====================================================

/**
 * 見積ステータス
 */
export type QuotationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CONVERTED';

// =====================================================
// Contract Status Types
// =====================================================

/**
 * 契約ステータス
 */
export type ContractStatus =
  | 'DRAFT'
  | 'SENT'
  | 'CUSTOMER_SIGNED'
  | 'ADMIN_SIGNED'
  | 'ACTIVE'
  | 'CANCELLED';

// =====================================================
// Inquiry Types
// =====================================================

/**
 * 問い合わせタイプ
 */
export type InquiryType =
  | 'product'
  | 'quotation'
  | 'sample'
  | 'order'
  | 'billing'
  | 'other'
  | 'general'
  | 'technical'
  | 'sales'
  | 'support';

/**
 * 問い合わせステータス
 */
export type InquiryStatus =
  | 'open'
  | 'responded'
  | 'resolved'
  | 'closed'
  | 'pending'
  | 'in_progress';

// =====================================================
// File Types
// =====================================================

/**
 * ファイルタイプ
 */
export type FileType = 'AI' | 'PDF' | 'PSD' | 'PNG' | 'JPG' | 'EXCEL' | 'OTHER';

/**
 * ファイル検証ステータス
 */
export type FileValidationStatus = 'PENDING' | 'VALID' | 'INVALID';

/**
 * AI抽出ステータス
 */
export type AiExtractionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'needs_revision';

/**
 * AI抽出方法
 */
export type AiExtractionMethod =
  | 'ai_parser'
  | 'manual'
  | 'hybrid'
  | 'adobe_api'
  | 'pattern_matching'
  | 'manual_entry'
  | 'ai_vision'
  | 'ocr';

// =====================================================
// Shipment Types
// =====================================================

/**
 * 配送ステータス
 */
export type ShipmentStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned'
  | 'cancelled';

/**
 * 配送方法
 */
export type ShippingMethod = 'ground' | 'air' | 'sea' | 'rail' | 'courier';

// =====================================================
// Signature Types
// =====================================================

/**
 * 署名タイプ
 */
export type SignatureType = 'handwritten' | 'hanko' | 'mixed';

/**
 * 署名ステータス
 */
export type SignatureStatusValue =
  | 'pending'
  | 'viewed'
  | 'signed'
  | 'delivered'
  | 'cancelled'
  | 'expired'
  | 'declined';

/**
 * 署名プロバイダー
 */
export type SignatureProvider = 'docusign' | 'hellosign' | 'local';

// =====================================================
// Notification Types
// =====================================================

/**
 * 通知タイプ
 */
export type NotificationType =
  | 'order_update'
  | 'shipment_update'
  | 'contract_ready'
  | 'quote_ready'
  | 'production_update'
  | 'document_ready'
  | 'delivery_scheduled';

// =====================================================
// Production Types
// =====================================================

/**
 * 生産ジョブタイプ
 */
export type ProductionJobType =
  | 'design_setup'
  | 'material_prep'
  | 'printing'
  | 'lamination'
  | 'slitting'
  | 'pouch_making'
  | 'quality_check'
  | 'packaging'
  | 'other';

/**
 * 生産ジョブステータス
 */
export type ProductionJobStatus =
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * 生産データタイプ
 */
export type ProductionDataType =
  | 'design_file'
  | 'specification'
  | 'approval'
  | 'material_data'
  | 'layout_data'
  | 'color_data'
  | 'other';

/**
 * 仕様書ステータス
 */
export type SpecSheetStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'deprecated'
  | 'archived';

// =====================================================
// Inventory Types
// =====================================================

/**
 * 在庫トランザクションタイプ
 */
export type InventoryTransactionType =
  | 'receipt'
  | 'issue'
  | 'adjustment'
  | 'transfer'
  | 'return'
  | 'production_in'
  | 'production_out';
