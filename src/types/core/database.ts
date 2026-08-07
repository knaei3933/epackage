/**
 * Core Database Types
 *
 * データベース関連のコア型定義
 * Supabaseから生成された型をインポートし、拡張する
 * @module types/core/database
 *
 * 【本ファイルの役割（commit-7 で明確化）】
 * 1. 再エクスポート窓口: Database / Json を ../database（実DB 生成型・SoT）から転送。
 * 2. 手書き業務型エイリアス群: 実DB enum が存在しない、または text 型カラムへ
 *    アプリ側で意味を持たせる区分値（ContractStatus 等）を定義。
 *
 * 実DB の enum 定義は ../database の Enums セクション（generate 対象外・手書き保護）
 * を参照のこと。本ファイルの業務型は実DB enum ではなくアプリ層の便宜型が主で、
 * 両者が同名になる場合は本ファイル側をアプリ SoT とする。
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
 * 契約ステータス（アプリ業務型の SoT）
 *
 * 実DB contracts.status は text 型（enum 非存在）。よって本型が
 * アプリ全体の唯一の正系（single source of truth）となる。
 * 従来 core/database 版（6値）と admin 版（9値）で二重定義していたが、
 * 9値が6値の上位互換（包含）のため、本 9値へ統一して曖昧さを解消。
 * barrel（types/index.ts）経由でも直接 import でも同一の型へ解決する。
 */
export type ContractStatus =
  | 'DRAFT'
  | 'SENT'
  | 'PENDING_SIGNATURE'
  | 'CUSTOMER_SIGNED'
  | 'ADMIN_SIGNED'
  | 'SIGNED'
  | 'ACTIVE'
  | 'COMPLETED'
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
