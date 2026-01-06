/**
 * Email Type Definitions
 *
 * メールタイプ定義
 * SendGridメール通知システムの型定義
 */

// ============================================================
// Email Template Types
// ============================================================

/**
 * メールテンプレートID
 */
export type EmailTemplateId =
  | 'quote_created_admin'        // 見積作成通知（管理者）
  | 'quote_approved_customer'    // 見積承認通知（顧客）
  | 'contract_sent'              // 契約書送信通知（顧客）
  | 'contract_signed_admin'      // 契約署名通知（管理者）
  | 'production_update'          // 生産状況更新（顧客）
  | 'shipped'                    // 発送通知（顧客）

/**
 * メールテンプレートデータ
 */
export interface EmailTemplateData {
  [key: string]: any
}

/**
 * 見積作成通知（管理者）テンプレートデータ
 */
export interface QuoteCreatedAdminData extends EmailTemplateData {
  quotation_id: string
  quotation_number: string
  customer_name: string
  company_name: string
  total_amount: number
  valid_until: string
  view_url: string
  submitted_at: string
}

/**
 * 見積承認通知（顧客）テンプレートデータ
 */
export interface QuoteApprovedCustomerData extends EmailTemplateData {
  quotation_id: string
  quotation_number: string
  customer_name: string
  total_amount: number
  valid_until: string
  confirm_url: string
  approved_at: string
}

/**
 * 契約書送信通知（顧客）テンプレートデータ
 */
export interface ContractSentData extends EmailTemplateData {
  order_id: string
  order_number: string
  customer_name: string
  contract_url: string
  due_date: string
  sent_at: string
}

/**
 * 契約署名通知（管理者）テンプレートデータ
 */
export interface ContractSignedAdminData extends EmailTemplateData {
  order_id: string
  order_number: string
  customer_name: string
  company_name: string
  contract_url: string
  signed_at: string
  view_url: string
}

/**
 * 生産状況更新（顧客）テンプレートデータ
 */
export interface ProductionUpdateData extends EmailTemplateData {
  order_id: string
  order_number: string
  customer_name: string
  product_name: string
  status: string
  status_label: string
  estimated_completion: string
  progress_percentage: number
  view_url: string
  updated_at: string
}

/**
 * 発送通知（顧客）テンプレートデータ
 */
export interface ShippedData extends EmailTemplateData {
  order_id: string
  order_number: string
  customer_name: string
  product_name: string
  tracking_number?: string
  carrier?: string
  estimated_delivery: string
  shipped_at: string
  tracking_url?: string
  view_url: string
}

// ============================================================
// Email Recipient Types
// ============================================================

/**
 * メール受信者タイプ
 */
export type EmailRecipientType = 'customer' | 'admin' | 'both'

/**
 * メール受信者
 */
export interface EmailRecipient {
  email: string
  name?: string
  type: EmailRecipientType
}

// ============================================================
// Email Message Types
// ============================================================

/**
 * メール送信リクエスト
 */
export interface SendEmailRequest {
  to: EmailRecipient | EmailRecipient[]
  templateId: EmailTemplateId
  data: EmailTemplateData
  attachments?: EmailAttachment[]
  replyTo?: string
}

/**
 * メール添付ファイル
 */
export interface EmailAttachment {
  filename: string
  content: string // Base64 encoded content
  type: string
  disposition?: 'attachment' | 'inline'
}

/**
 * メール送信結果
 */
export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
  errorCode?: string
}

// ============================================================
// Notification Event Types
// ============================================================

/**
 * 通知イベントタイプ
 */
export type NotificationEventType =
  | 'quotation_created'
  | 'quotation_approved'
  | 'contract_sent'
  | 'contract_signed'
  | 'production_updated'
  | 'order_shipped'

/**
 * 通知イベント
 */
export interface NotificationEvent {
  type: NotificationEventType
  recipientType: EmailRecipientType
  data: EmailTemplateData
  metadata?: {
    orderId?: string
    quotationId?: string
    userId?: string
    timestamp?: string
  }
}

// ============================================================
// Bounce and Delivery Types
// ============================================================

/**
 * バウンスタイプ
 */
export type BounceType =
  | 'hard'      // 永続的なバウンス（存在しないメールアドレス等）
  | 'soft'      // 一時的なバウンス（メールボックスフル等）
  | 'blocked'   // ブロック（スパムフィルタ等）

/**
 * バウンスイベント
 */
export interface BounceEvent {
  email: string
  type: BounceType
  reason: string
  occurredAt: string
  eventId: string
  messageId: string
  category?: string
}

/**
 * 配信ステータス
 */
export type DeliveryStatus = 'delivered' | 'bounced' | 'deferred' | 'opened' | 'clicked'

/**
 * 配信イベント
 */
export interface DeliveryEvent {
  messageId: string
  email: string
  status: DeliveryStatus
  timestamp: string
  eventId: string
  metadata?: Record<string, any>
}

// ============================================================
// Email Statistics Types
// ============================================================

/**
 * メール統計情報
 */
export interface EmailStatistics {
  total: number
  delivered: number
  bounced: number
  opened: number
  clicked: number
  deliveryRate: number // percentage
  openRate: number     // percentage
  clickRate: number    // percentage
  period: {
    start: string
    end: string
  }
}

// ============================================================
// Template Type Guards
// ============================================================

/**
 * テンプレートIDに対応するデータ型を取得
 */
export type TemplateDataMap = {
  quote_created_admin: QuoteCreatedAdminData
  quote_approved_customer: QuoteApprovedCustomerData
  contract_sent: ContractSentData
  contract_signed_admin: ContractSignedAdminData
  production_update: ProductionUpdateData
  shipped: ShippedData
}

/**
 * テンプレートIDからデータ型を取得
 */
export type GetTemplateData<T extends EmailTemplateId> = TemplateDataMap[T]
