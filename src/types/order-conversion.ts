/**
 * Order Conversion Types
 *
 * 見積書から注文への変換に関する型定義
 * - API リクエスト/レスポンス型
 * - 変換結果型
 * - バリデーション型
 */

import { OrderStatus } from './order-status';

// ============================================================
// API Request/Response Types
// ============================================================

/**
 * 注文変換リクエスト
 */
export interface ConvertToOrderRequest {
  quotationId: string;
  paymentTerm?: 'credit' | 'advance';
  shippingAddress?: ShippingAddressInput;
  billingAddress?: BillingAddressInput;
  requestedDeliveryDate?: string;
  deliveryNotes?: string;
  customerNotes?: string;
}

/**
 * 配送先住所入力
 */
export interface ShippingAddressInput {
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  company: string;
  contactName: string;
  phone: string;
}

/**
 * 請求先住所入力
 */
export interface BillingAddressInput {
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building?: string;
  companyName: string;
  email?: string;
  phone?: string;
  taxNumber?: string;
}

/**
 * 注文変換レスポンス (成功)
 */
export interface ConvertToOrderSuccessResponse {
  success: true;
  message: string;
  order: {
    id: string;
    order_number: string;
    status: OrderStatus;
    current_state: string;
    total_amount: number;
    customer_name: string;
    customer_email: string;
    created_at: string;
  };
  quotation: {
    id: string;
    quotation_number: string;
    status: string;
  };
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

/**
 * 注文変換エラーレスポンス
 */
export interface ConvertToOrderErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string[] | string>;
}

/**
 * 注文変換レスポンス (統合)
 */
export type ConvertToOrderResponse = ConvertToOrderSuccessResponse | ConvertToOrderErrorResponse;

// ============================================================
// Validation Types
// ============================================================

/**
 * 見積書検証結果
 */
export interface QuotationValidationResult {
  valid: boolean;
  quotation?: QuotationValidationData;
  items?: QuotationItemValidationData[];
  error?: string;
}

/**
 * 見積書検証データ
 */
export interface QuotationValidationData {
  id: string;
  quotation_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  subtotal_amount: number;
  tax_amount: number;
  valid_until: string | null;
  estimated_delivery_date: string | null;
  status: string;
  created_at: string;
}

/**
 * 見積書アイテム検証データ
 */
export interface QuotationItemValidationData {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications: Record<string, any> | null;
}

/**
 * 変換可能性チェックレスポンス
 */
export interface CanConvertToOrderResponse {
  canConvert: boolean;
  error?: string;
  quotation?: QuotationValidationData;
  itemCount?: number;
  itemsSummary?: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

// ============================================================
// Conversion Result Types
// ============================================================

/**
 * 注文変換の詳細結果
 */
export interface OrderConversionResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  quotationId?: string;
  error?: string;
  details?: string;
  warnings?: string[];
}

/**
 * 注文作成データ
 */
export interface OrderCreationData {
  user_id: string;
  company_id: string | null;
  quotation_id: string;
  order_number: string;
  current_state: string;
  status: OrderStatus;
  payment_term: 'credit' | 'advance';
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  customer_name: string;
  customer_email: string;
  shipping_address: ShippingAddressInput | null;
  billing_address: BillingAddressInput | null;
  requested_delivery_date: string | null;
  delivery_notes: string | null;
  estimated_delivery_date: string | null;
  state_metadata: OrderStateMetadata;
}

/**
 * 注文ステートメタデータ
 */
export interface OrderStateMetadata {
  converted_from_quotation: boolean;
  quotation_number: string;
  conversion_date: string;
  converted_by: string;
}

/**
 * 注文アイテム作成データ
 */
export interface OrderItemCreationData {
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications: Record<string, any> | null;
}

// ============================================================
// Email Types
// ============================================================

/**
 * 注文確認メールデータ
 */
export interface OrderConfirmationEmailData {
  orderId: string;
  orderNumber: string;
  quotationNumber: string;
  customerEmail: string;
  customerName: string;
  items: OrderEmailItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  estimatedDeliveryDate?: string | null;
  paymentTerm?: 'credit' | 'advance';
  shippingAddress?: ShippingAddressInput;
  deliveryNotes?: string;
  customerNotes?: string;
  isAdmin?: boolean;
}

/**
 * 注文メールアイテム
 */
export interface OrderEmailItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * メール送信結果
 */
export interface OrderEmailResult {
  success: boolean;
  customerEmail?: {
    success: boolean;
    messageId?: string;
    previewUrl?: string;
  };
  adminEmail?: {
    success: boolean;
    messageId?: string;
    previewUrl?: string;
  };
  previewUrl?: string;
  errors: string[];
}

// ============================================================
// Error Types
// ============================================================

/**
 * 変換エラーコード
 */
export type ConversionErrorCode =
  | 'QUOTATION_NOT_FOUND'
  | 'QUOTATION_NOT_APPROVED'
  | 'QUOTATION_ALREADY_CONVERTED'
  | 'QUOTATION_EXPIRED'
  | 'NO_ITEMS_FOUND'
  | 'ORDER_CREATION_FAILED'
  | 'ITEMS_COPY_FAILED'
  | 'QUOTATION_UPDATE_FAILED'
  | 'AUDIT_LOG_FAILED'
  | 'EMAIL_SEND_FAILED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR';

/**
 * 変換エラー詳細
 */
export interface ConversionError {
  code: ConversionErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// ============================================================
// Utility Types
// ============================================================

/**
 * 注文番号生成パラメータ
 */
export interface OrderNumberGenerationParams {
  year?: number;
  sequence?: number;
}

/**
 * ステータス履歴作成パラメータ
 */
export interface StatusHistoryParams {
  orderId: string;
  toStatus: string;
  changedBy: string;
  reason?: string;
  fromStatus?: string | null;
}

/**
 * 監査ログ作成パラメータ
 */
export interface AuditLogParams {
  tableName: string;
  recordId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  newData: Record<string, any>;
  changedBy: string;
  ipAddress?: string;
  userAgent?: string;
  oldData?: Record<string, any> | null;
  changedFields?: string[] | null;
}

// ============================================================
// Type Guards
// ============================================================

/**
 * 成功レスポンスかどうか
 */
export function isSuccessResponse(
  response: ConvertToOrderResponse
): response is ConvertToOrderSuccessResponse {
  return response.success === true;
}

/**
 * エラーレスポンスかどうか
 */
export function isErrorResponse(
  response: ConvertToOrderResponse
): response is ConvertToOrderErrorResponse {
  return response.success === false;
}

/**
 * 注文変換が成功したかどうか
 */
export function isSuccessfulConversion(
  result: OrderConversionResult
): result is OrderConversionResult & { success: true; orderId: string; orderNumber: string } {
  return result.success === true && typeof result.orderId === 'string' && typeof result.orderNumber === 'string';
}
