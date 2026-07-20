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
import type { Quotation } from './entities/quotation';

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

export type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';

export interface AppliedCoupon {
  id: string;
  code: string;
  name: string;
  nameJa?: string;
  type: DiscountType;
  value: number;
  discountAmount: number;
}

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
  // Coupon-related fields
  couponId?: string;
  discountAmount?: number;
  discountType?: DiscountType;
  appliedCoupon?: AppliedCoupon;
  quotation_id?: string;
  // Manual discount fields (admin)
  manualDiscountPercentage?: number;
  manualDiscountAmount?: number;
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

// Re-export from unified entity types
export type {
  QuotationStatus,
  Quotation,
  QuotationItem,
  QuotationItemSpecifications,
  QuotationItemInput,
  QuotationCreateInput,
  QuotationUpdateInput,
  QuotationFilters,
  QuotationPaginationParams,
  QuotationPaginatedResponse,
  SpoutPouchFields,
  CostBreakdown,
  FilmCostDetails,
} from './entities/quotation';

export {
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_VARIANTS,
  isQuotationStatus,
  isQuotationItem,
  isQuotation,
  getQuotationStatusLabel,
  getQuotationStatusVariant,
  calculateQuotationTotal,
} from './entities/quotation';

// Legacy compatibility aliases
export type LegacyQuotationStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

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
  | 'other'       // その他
  | 'general'     // 一般
  | 'technical'   // 技術
  | 'sales'       // 営業
  | 'support';    // サポート

export type InquiryStatus =
  | 'pending'     // 保留中（新設・Phase 3）
  | 'open'        // 未対応
  | 'in_progress' // 対応中（新設・Phase 3・reopen 遷移先）
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
  /**
   * 注文 ID（注文のお問い合わせ場合のみ・任意）
   * Phase 2 で inquiries.order_id 列と紐付け（AC-API-5）
   */
  orderId?: string;
  /**
   * 注文番号（注文のお問い合わせ場合のみ・任意）
   * orders テーブルと JOIN して補完（AC-API-5・AC-ROB-4）
   */
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
}

/**
 * お問い合わせ添付ファイル（inquiry_messages.attachments JSONB の1要素）
 *
 * NOTE: API レスポンス（GET/POST .../messages）の実装が snake_case で返すため、
 * クライアント型も snake_case で定義（マッピング変換を避けてコードを簡素化）。
 * - url: GET 時は signed URL（期限付き）・DB 内部では Storage path
 * - validation_status: 'valid' 等（file-validation の検証結果）
 */
export interface InquiryAttachment {
  url: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
  validation_status: string;
}

/**
 * お問い合わせスレッドの個別メッセージ（inquiry_messages テーブル対応）
 *
 * senderType:
 * - 'member': 会員側の発言（右側・primary 系の吹き出し）
 * - 'admin': 管理者側の回答（左側・muted 系の吹き出し）
 *
 * senderName は GET .../messages で profiles 結合済み。POST 直後の楽観表示では null の場合あり。
 */
export interface InquiryMessage {
  id: string;
  inquiryId: string;
  senderType: 'member' | 'admin';
  senderId: string | null;
  senderName?: string | null;
  body: string;
  attachments: InquiryAttachment[];
  createdAt: string;
}

/**
 * 管理者向けお問い合わせメッセージ（GET /api/admin/inquiries/[id] の messages 要素）
 *
 * InquiryMessage に senderRole（profiles.role・admin/operator/sales/accounting 等）
 * が追加された形状。管理者側スレッド表示で送信者の役職を併記するために使用。
 */
export interface AdminInquiryMessage extends InquiryMessage {
  senderRole?: string | null;
}

/**
 * 管理者向けお問い合わせ（一覧・GET /api/admin/inquiries）
 *
 * Inquiry 型に対し、顧客情報（customerName / companyName / email / phone 等）・
 * urgency・preferredContact など管理者画面で必要な全項目を保持。
 * inquiries テーブルの管理者 API 変換後 shape（camelCase）に対応。
 */
export interface AdminInquiry {
  id: string;
  inquiryNumber: string | null;
  type: InquiryType;
  status: InquiryStatus;
  subject: string;
  message: string;
  customerName: string | null;
  customerNameKana: string | null;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  urgency: string | null;
  preferredContact: string | null;
  userId: string | null;
  /**
   * 注文 ID（注文のお問い合わせ場合のみ・任意）
   * inquiries.order_id 列に対応。管理者一覧で注文ラベル表示の判定に使用（AC-API-5）
   */
  orderId: string | null;
  /**
   * 注文番号（注文のお問い合わせ場合のみ・任意）
   * orders テーブルと 別途 JOIN して補完（AC-API-5・AC-ROB-4）
   * 注文削除（order_id SET NULL）後は null になるため nullable
   */
  orderNumber: string | null;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
}

/**
 * 管理者向けお問い合わせ詳細（GET /api/admin/inquiries/[id]）
 *
 * inquiry 本体 + 時系列順のメッセージ一覧。
 * attachments の url は signed URL（1 時間有効）。
 */
export interface AdminInquiryDetail {
  inquiry: AdminInquiry;
  messages: AdminInquiryMessage[];
}

/**
 * 管理者回答の送信結果（POST /api/admin/inquiries/[id]/messages）
 *
 * statusTransitioned: status が open/in_progress から responded へ自動遷移したか
 * emailSent: 会員への回答通知メールが送信されたか（失敗時 false・DB は commit 済み）
 */
export interface AdminReplyResult extends AdminInquiryMessage {
  statusTransitioned: boolean;
  emailSent: boolean;
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
// Member Types
// =====================================================

/**
 * 会員用請求先住所（APIレスポンス構造に一致）
 */
export interface MemberBillingAddress {
  id: string;
  userId: string;
  companyName: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building?: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 会員用契約ステータス
 */
export type MemberContractStatus =
  | 'pending'    // 保留中
  | 'active'     // 有効
  | 'completed'  // 完了
  | 'cancelled'; // キャンセル

/**
 * 会員用契約情報
 */
export interface MemberContract {
  id: string;
  contractNumber: string;
  status: MemberContractStatus;
  totalAmount: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 会員用通知タイプ
 */
export type MemberNotificationType =
  | 'order'      // 注文関連
  | 'quotation'  // 見積関連
  | 'shipment'   // 配送関連
  | 'system';    // システム通知

/**
 * 会員用通知
 */
export interface MemberNotification {
  id: string;
  userId: string;
  type: MemberNotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
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

/**
 * お問い合わせフィルターステート
 */
export interface InquiryFilterState {
  type?: InquiryType;
  status?: InquiryStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

/**
 * 汎用フィルター設定
 */
export interface FilterConfig<T> {
  filters: T;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
