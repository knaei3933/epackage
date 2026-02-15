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
  | 'user_approved'              // ユーザー承認通知（顧客）
  | 'premium_content_download'   // プレミアムコンテンツダウンロード確認
  | 'contract_signature_request'  // 契約署名リクエスト
  | 'order_status_updated'        // 注文ステータス更新通知（顧客）

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

/**
 * ユーザー承認通知（顧客）テンプレートデータ
 */
export interface UserApprovedData extends EmailTemplateData {
  user_name: string
  user_email: string
  approved_at: string
  login_url: string
}

/**
 * プレミアムコンテンツダウンロード確認テンプレートデータ
 */
export interface PremiumContentDownloadData extends EmailTemplateData {
  user_name: string
  user_email: string
  content_title: string
  content_category: string
  download_url: string
  downloaded_at: string
}

/**
 * 契約署名リクエストテンプレートデータ
 */
export interface ContractSignatureRequestData extends EmailTemplateData {
  customer_name: string
  contract_url: string
  order_number: string
  due_date: string
  requested_at: string
}

/**
 * 注文ステータス更新通知テンプレートデータ
 */
export interface OrderStatusUpdatedData extends EmailTemplateData {
  order_number: string
  customer_name: string
  product_name: string
  old_status: string
  new_status: string
  status_label: string
  view_url: string
  updated_at: string
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

// ============================================================
// Epackage Lab Email Types
// ============================================================

/**
 * Epackage Lab メールテンプレートID
 */
export type EpackEmailTemplateId =
  | 'quoteReady'                    // 見積作成完了（顧客）
  | 'quoteApproved'                 // 見積承認完了（顧客）
  | 'dataUploadRequest'             // データ入稿依頼（顧客）
  | 'dataReceived'                  // データ受領確認（顧客）
  | 'modificationRequest'           // 修正承認依頼（顧客）
  | 'modificationApproved'          // 修正承認完了（顧客）
  | 'modificationRejected'          // 修正却下確認（顧客）
  | 'correctionReady'               // 校正完了（顧客）
  | 'approvalRequest'               // 顧客承認待ち（顧客）
  | 'productionStarted'             // 製造開始（顧客）
  | 'readyToShip'                   // 出荷準備完了（顧客）
  | 'shipped'                       // 出荷完了（顧客）
  | 'orderCancelled'                // 注文キャンセル（顧客）
  | 'koreaCorrectionRequest'        // 韓国チーム校正依頼（韓国）

/**
 * オーダーステータスに対応するメールテンプレートID
 */
export type OrderStatusToEmailTemplate = {
  'draft': never
  'pending_payment': never
  'payment_confirmed': 'dataUploadRequest'
  'data_upload_required': 'dataUploadRequest'
  'data_received': 'dataReceived'
  'modification_required': 'modificationRequest'
  'modification_approved': 'modificationApproved'
  'modification_rejected': 'modificationRejected'
  'correction_ready': 'correctionReady'
  'approval_pending': 'approvalRequest'
  'approved': 'productionStarted'
  'in_production': 'productionStarted'
  'quality_check': never
  'ready_to_ship': 'readyToShip'
  'shipped': 'shipped'
  'delivered': never
  'cancelled': 'orderCancelled'
  'korea_correction_pending': 'koreaCorrectionRequest'
  'refund_requested': never
  'refunded': never
}
