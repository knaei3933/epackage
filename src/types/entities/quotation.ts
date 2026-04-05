/**
 * Quotation Entity Types
 *
 * 見積もりエンティティの統一型定義
 * すべての見積もり関連型の正規ソース
 * @module types/entities/quotation
 */

import type { Json } from '../core/common';

// =====================================================
// Quotation Status
// =====================================================

/**
 * 見積ステータス
 * - DRAFT: 作成中/審査中
 * - SENT: 送信済み
 * - APPROVED: 承認済み
 * - REJECTED: 却下
 * - EXPIRED: 期限切れ
 * - CONVERTED: 注文変換済み
 */
export type QuotationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CONVERTED';

/**
 * 見積ステータスラベル
 */
export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  DRAFT: '審査中',
  SENT: '送信済み',
  APPROVED: '承認済み',
  REJECTED: '却下',
  EXPIRED: '期限切れ',
  CONVERTED: '注文変換済み',
};

/**
 * 見積ステータスバリアント（UI用）
 */
export const QUOTATION_STATUS_VARIANTS: Record<QuotationStatus, 'secondary' | 'info' | 'success' | 'error' | 'warning' | 'default'> = {
  DRAFT: 'secondary',
  SENT: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
  EXPIRED: 'warning',
  CONVERTED: 'default',
};

// =====================================================
// Spout Pouch Fields
// =====================================================

/**
 * スパウトパウチ専用フィールド
 */
export interface SpoutPouchFields {
  bagTypeId?: 'spout_pouch';
  spoutSize?: number;  // 9, 15, 18, 22, 28
  spoutPosition?: 'top-left' | 'top-center' | 'top-right';
  hasGusset?: boolean;
}

// =====================================================
// Quotation Item Specifications
// =====================================================

/**
 * 見積アイテム仕様
 */
export interface QuotationItemSpecifications {
  // 基本情報
  bag_type?: string;
  bag_type_display?: string;
  bagTypeId?: string;
  productCategory?: string;

  // 素材・サイズ
  material?: string;
  material_display?: string;
  material_specification?: string;
  weight_range?: string;
  thickness?: string;
  thickness_display?: string;
  size?: string;
  dimensions?: string;
  width?: number;
  height?: number;
  depth?: number;

  // 印刷
  printing?: string;
  printing_display?: string;
  printing_type?: string;
  colors?: string;
  isUVPrinting?: boolean;
  doubleSided?: boolean;

  // 後加工
  post_processing?: string[];
  post_processing_display?: string[];
  zipper?: boolean;

  // スパウトパウチ
  spout?: boolean;
  spoutSize?: number;
  spoutPosition?: 'top-left' | 'top-center' | 'top-right';
  hasGusset?: boolean;

  // その他
  urgency?: string;
  contents?: string;
  contentsType?: string;
  deliveryLocation?: string;
  distributionEnvironment?: string;
  sealWidth?: string;
}

// =====================================================
// Cost Breakdown
// =====================================================

/**
 * コスト内訳
 */
export interface CostBreakdown {
  materialCost: number;
  laminationCost: number;
  slitterCost: number;
  surfaceTreatmentCost: number;
  pouchProcessingCost: number;
  printingCost: number;
  manufacturingMargin: number;
  duty: number;
  delivery: number;
  salesMargin: number;
  totalCost: number;
}

// =====================================================
// Film Cost Details
// =====================================================

/**
 * フィルム費用詳細
 */
export interface FilmCostDetails {
  materialCost?: number;
  laminationCost?: number;
  [key: string]: number | undefined;
}

// =====================================================
// Quotation Item
// =====================================================

/**
 * 見積アイテム
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
  specifications: (QuotationItemSpecifications & Partial<SpoutPouchFields>) | Json | null;
  notes: string | null;
  display_order: number;
  created_at: string;

  // 拡張フィールド（クライアント用）
  orderId?: string | null;

  // 詳細仕様（内訳用）
  breakdown?: {
    quantity: number;
    unit_price: number;
    total_price: number;
    specifications: QuotationItemSpecifications & Partial<SpoutPouchFields>;
    area?: { mm2: number; m2: number };
    sku_info?: { count: number; quantities: number[]; total: number };
    breakdown?: CostBreakdown;
    filmCostDetails?: FilmCostDetails;
  };
}

// =====================================================
// Quotation
// =====================================================

/**
 * 見積もり（基本）
 */
export interface QuotationBase {
  id: string;
  user_id: string;
  company_id: string | null;
  quotation_number: string;
  status: QuotationStatus;
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
}

/**
 * 見積もり（アイテム付き）
 */
export interface Quotation extends QuotationBase {
  items?: QuotationItem[];
}

// =====================================================
// Quotation Create/Update Input
// =====================================================

/**
 * 見积アイテム入力
 */
export interface QuotationItemInput {
  id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  specifications?: Json;
  notes?: string;
}

/**
 * 見積作成入力
 */
export interface QuotationCreateInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  items: QuotationItemInput[];
  valid_until?: string;
  notes?: string;
  estimated_delivery_date?: string;
}

/**
 * 見積更新入力
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
  items?: QuotationItemInput[];
}

// =====================================================
// Quotation Filters & Pagination
// =====================================================

/**
 * 見積フィルター
 */
export interface QuotationFilters {
  status?: QuotationStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  userId?: string;
  companyId?: string;
}

/**
 * 見積ページネーションパラメータ
 */
export interface QuotationPaginationParams {
  page: number;
  limit: number;
  sortBy?: 'created_at' | 'updated_at' | 'quotation_number' | 'total_amount';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 見積ページネートレスポンス
 */
export interface QuotationPaginatedResponse {
  data: Quotation[];
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
 * 見積ステータスかチェック
 */
export function isQuotationStatus(value: string): value is QuotationStatus {
  return ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED'].includes(value);
}

/**
 * 見積アイテムかチェック
 */
export function isQuotationItem(value: unknown): value is QuotationItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'quotation_id' in value &&
    'product_name' in value &&
    'quantity' in value &&
    'unit_price' in value &&
    'total_price' in value
  );
}

/**
 * 見積もりかチェック
 */
export function isQuotation(value: unknown): value is Quotation {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'quotation_number' in value &&
    'status' in value &&
    'customer_name' in value &&
    'total_amount' in value
  );
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * 見積ステータスのラベルを取得
 */
export function getQuotationStatusLabel(status: QuotationStatus): string {
  return QUOTATION_STATUS_LABELS[status] || status;
}

/**
 * 見積ステータスのバリアントを取得
 */
export function getQuotationStatusVariant(status: QuotationStatus): 'secondary' | 'info' | 'success' | 'error' | 'warning' | 'default' {
  return QUOTATION_STATUS_VARIANTS[status] || 'default';
}

/**
 * 見積の合計金額を計算（アイテムから）
 */
export function calculateQuotationTotal(items: QuotationItem[]): {
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
