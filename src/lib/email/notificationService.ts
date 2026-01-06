/**
 * Notification Service
 *
 * 通知サービス
 * SendGridを使用したメール通知システム
 *
 * @module lib/email/notificationService
 */

import SGMail from '@sendgrid/mail'
import type { ResponseError } from '@sendgrid/helpers/classes'
import {
  type EmailTemplateId,
  type SendEmailRequest,
  type SendEmailResult,
  type NotificationEvent,
  type BounceEvent,
  type EmailRecipient,
  type BounceType,
  type DeliveryStatus,
} from '@/types/email'
import { emailTemplates } from './templates'

// ============================================================
// Type Definitions
// ============================================================

/**
 * Type guard for email template data with customer fields
 */
interface CustomerEmailData {
  customer_email?: string
  customer_name?: string
}

function isCustomerEmailData(data: unknown): data is CustomerEmailData {
  if (typeof data !== 'object' || data === null) {
    return false
  }
  const d = data as Record<string, unknown>
  return (
    typeof d.customer_email === 'string' ||
    typeof d.customer_name === 'string'
  )
}

// ============================================================
// Configuration
// ============================================================

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@epackage-lab.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@epackage-lab.com'
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || 'support@epackage-lab.com'

// SendGrid API Keyの検証
if (!process.env.SENDGRID_API_KEY) {
  console.warn('[NotificationService] SENDGRID_API_KEY is not configured. Emails will not be sent.')
}

// SendGridクライアントの初期化
if (process.env.SENDGRID_API_KEY) {
  SGMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// ============================================================
// Core Functions
// ============================================================

/**
 * メール送信
 *
 * 指定されたテンプレートとデータでメールを送信します
 */
export async function sendEmail(request: SendEmailRequest): Promise<SendEmailResult> {
  // SendGrid API Keyのチェック
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[NotificationService] SendGrid not configured, skipping email send')
    return {
      success: false,
      error: 'SendGrid not configured',
      errorCode: 'CONFIG_ERROR',
    }
  }

  try {
    // テンプレートの取得
    const template = emailTemplates[request.templateId]
    if (!template) {
      return {
        success: false,
        error: `Template not found: ${request.templateId}`,
        errorCode: 'TEMPLATE_NOT_FOUND',
      }
    }

    // 件名と本文の生成 - template exports are functions
    const subject = typeof template.subject === 'function'
      ? template.subject(request.data as unknown as never)
      : String(template.subject)
    const plainText = typeof template.plainText === 'function'
      ? template.plainText(request.data as unknown as never)
      : String(template.plainText)
    const html = typeof template.html === 'function'
      ? template.html(request.data as unknown as never)
      : String(template.html)

    // 受信者を配列に統一
    const recipients = Array.isArray(request.to) ? request.to : [request.to]

    // SendGridメッセージの作成
    const msg = {
      to: recipients.map(r => ({ email: r.email, name: r.name || '' })),
      from: FROM_EMAIL,
      replyTo: request.replyTo || REPLY_TO_EMAIL,
      subject,
      text: plainText,
      html,
      attachments: request.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        type: att.type,
        disposition: att.disposition || 'attachment',
      })),
    }

    // メール送信
    const response = await SGMail.send(msg)

    return {
      success: true,
      messageId: response[0]?.headers?.['x-message-id'] || 'unknown',
    }
  } catch (error) {
    console.error('[NotificationService] Email send error:', error)

    const sgError = error as ResponseError
    return {
      success: false,
      error: sgError.message || 'Unknown error',
      errorCode: sgError.code ? String(sgError.code) : 'SEND_ERROR',
    }
  }
}

/**
 * 通知イベントの処理
 *
 * イベントタイプに応じて適切なメールを送信します
 */
export async function handleNotificationEvent(event: NotificationEvent): Promise<SendEmailResult> {
  const templateId = getTemplateIdForEvent(event.type)
  if (!templateId) {
    return {
      success: false,
      error: `No template configured for event: ${event.type}`,
      errorCode: 'NO_TEMPLATE',
    }
  }

  // 受信者の決定
  const recipients = getRecipientsForEvent(event)
  if (recipients.length === 0) {
    return {
      success: false,
      error: `No recipients found for event: ${event.type}`,
      errorCode: 'NO_RECIPIENTS',
    }
  }

  return sendEmail({
    to: recipients,
    templateId,
    data: event.data,
  })
}

/**
 * イベントタイプに対応するテンプレートIDを取得
 */
function getTemplateIdForEvent(eventType: NotificationEvent['type']): EmailTemplateId | null {
  const templateMap: Record<NotificationEvent['type'], EmailTemplateId> = {
    quotation_created: 'quote_created_admin',
    quotation_approved: 'quote_approved_customer',
    contract_sent: 'contract_sent',
    contract_signed: 'contract_signed_admin',
    production_updated: 'production_update',
    order_shipped: 'shipped',
  }

  return templateMap[eventType] || null
}

/**
 * イベントに対応する受信者を取得
 */
function getRecipientsForEvent(event: NotificationEvent): EmailRecipient[] {
  const { type, recipientType, data } = event

  // 受信者タイプに基づいて受信者を決定
  switch (recipientType) {
    case 'admin':
      return [
        {
          email: ADMIN_EMAIL,
          name: 'EPackage Lab 管理者',
          type: 'admin',
        },
      ]

    case 'customer':
      if (!isCustomerEmailData(data)) return []
      const customerEmail = data.customer_email
      const customerName = data.customer_name
      if (!customerEmail) return []
      return [
        {
          email: customerEmail,
          name: customerName || 'お客様',
          type: 'customer',
        },
      ]

    case 'both':
      const both: EmailRecipient[] = [
        {
          email: ADMIN_EMAIL,
          name: 'EPackage Lab 管理者',
          type: 'admin',
        },
      ]
      if (isCustomerEmailData(data)) {
        const custEmail = data.customer_email
        const custName = data.customer_name
        if (custEmail) {
          both.push({
            email: custEmail,
            name: custName || 'お客様',
            type: 'customer',
          })
        }
      }
      return both

    default:
      return []
  }
}

// ============================================================
// Template-Specific Functions
// ============================================================

/**
 * 見積作成通知（管理者）
 */
export async function sendQuoteCreatedAdminEmail(data: {
  quotation_id: string
  quotation_number: string
  customer_name: string
  company_name: string
  total_amount: number
  valid_until: string
  view_url: string
}): Promise<SendEmailResult> {
  return sendEmail({
    to: { email: ADMIN_EMAIL, name: 'EPackage Lab 管理者', type: 'admin' },
    templateId: 'quote_created_admin',
    data: {
      ...data,
      submitted_at: new Date().toLocaleString('ja-JP'),
    },
  })
}

/**
 * 見積承認通知（顧客）
 */
export async function sendQuoteApprovedCustomerEmail(data: {
  quotation_id: string
  quotation_number: string
  customer_name: string
  customer_email: string
  total_amount: number
  valid_until: string
  confirm_url: string
}): Promise<SendEmailResult> {
  return sendEmail({
    to: { email: data.customer_email, name: data.customer_name, type: 'customer' },
    templateId: 'quote_approved_customer',
    data: {
      quotation_id: data.quotation_id,
      quotation_number: data.quotation_number,
      customer_name: data.customer_name,
      total_amount: data.total_amount,
      valid_until: data.valid_until,
      confirm_url: data.confirm_url,
      approved_at: new Date().toLocaleString('ja-JP'),
    },
  })
}

/**
 * 契約書送信通知（顧客）
 */
export async function sendContractSentEmail(data: {
  order_id: string
  order_number: string
  customer_name: string
  customer_email: string
  contract_url: string
  due_date: string
}): Promise<SendEmailResult> {
  return sendEmail({
    to: { email: data.customer_email, name: data.customer_name, type: 'customer' },
    templateId: 'contract_sent',
    data: {
      ...data,
      sent_at: new Date().toLocaleString('ja-JP'),
    },
  })
}

/**
 * 契約署名通知（管理者）
 */
export async function sendContractSignedAdminEmail(data: {
  order_id: string
  order_number: string
  customer_name: string
  company_name: string
  contract_url: string
  view_url: string
}): Promise<SendEmailResult> {
  return sendEmail({
    to: { email: ADMIN_EMAIL, name: 'EPackage Lab 管理者', type: 'admin' },
    templateId: 'contract_signed_admin',
    data: {
      ...data,
      signed_at: new Date().toLocaleString('ja-JP'),
    },
  })
}

/**
 * 生産状況更新通知（顧客）
 */
export async function sendProductionUpdateEmail(data: {
  order_id: string
  order_number: string
  customer_name: string
  customer_email: string
  product_name: string
  status: string
  status_label: string
  estimated_completion: string
  progress_percentage: number
  view_url: string
}): Promise<SendEmailResult> {
  return sendEmail({
    to: { email: data.customer_email, name: data.customer_name, type: 'customer' },
    templateId: 'production_update',
    data: {
      ...data,
      updated_at: new Date().toLocaleString('ja-JP'),
    },
  })
}

/**
 * 発送通知（顧客）
 */
export async function sendShippedEmail(data: {
  order_id: string
  order_number: string
  customer_name: string
  customer_email: string
  product_name: string
  tracking_number?: string
  carrier?: string
  estimated_delivery: string
  tracking_url?: string
  view_url: string
}): Promise<SendEmailResult> {
  return sendEmail({
    to: { email: data.customer_email, name: data.customer_name, type: 'customer' },
    templateId: 'shipped',
    data: {
      ...data,
      shipped_at: new Date().toLocaleString('ja-JP'),
    },
  })
}

// ============================================================
// Bounce Handling
// ============================================================

/**
 * バウンメールアドレスの検証
 *
 * 指定されたメールアドレスがバウンステータスかどうかを確認
 */
export async function isBouncedEmail(email: string): Promise<boolean> {
  // TODO: Implement database check for bounced emails
  // For now, always return false
  return false
}

/**
 * バウンステータスを記録
 *
 * バウンメールアドレスをデータベースに記録
 */
export async function recordBounce(bounce: BounceEvent): Promise<void> {
  // TODO: Implement database recording for bounces
  console.warn(`[NotificationService] Bounce recorded for ${bounce.email}: ${bounce.reason}`)
}

/**
 * SendGrid webhook からのバウンストイベントの処理
 */

/**
 * SendGrid webhook event type
 */
interface SendGridWebhookEvent {
  event: string
  email?: string
  status?: string
  reason?: string
  response?: string
  timestamp: number
  sg_message_id?: string
  category?: string
}

export async function handleBounceWebhook(events: SendGridWebhookEvent[]): Promise<void> {
  for (const event of events) {
    if (event.event === 'bounce' || event.event === 'dropped') {
      const bounceEvent: BounceEvent = {
        email: event.email || '',
        type: event.event === 'bounce' ? (event.status === '5xx' ? 'hard' : 'soft') : 'blocked',
        reason: event.reason || event.response || 'Unknown reason',
        occurredAt: new Date(event.timestamp * 1000).toISOString(),
        eventId: event.sg_message_id || '',
        messageId: event.sg_message_id || '',
        category: event.category,
      }

      await recordBounce(bounceEvent)
    }
  }
}

// ============================================================
// Utilities
// ============================================================

/**
 * メールアドレスのフォーマット検証
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 日本語メールアドレスの対応チェック
 */
export function supportsJapaneseEmail(): boolean {
  // SendGridは日本語メールアドレス（RFC 6531）をサポート
  return true
}

/**
 * 配送状況のログ記録
 */
export async function logDeliveryStatus(
  messageId: string,
  email: string,
  status: DeliveryStatus,
  metadata?: Record<string, unknown>
): Promise<void> {
  // TODO: Implement database logging for delivery status
  console.log(`[NotificationService] Delivery status: ${messageId} -> ${email}: ${status}`)
}

/**
 * テストメール送信
 *
 * 開発・テスト用のメールを送信
 */
export async function sendTestEmail(recipient: string): Promise<SendEmailResult> {
  return sendEmail({
    to: { email: recipient, name: 'テストユーザー', type: 'customer' },
    templateId: 'quote_approved_customer',
    data: {
      quotation_id: 'test-001',
      quotation_number: 'QT-TEST-001',
      customer_name: 'テストユーザー',
      total_amount: 10000,
      valid_until: '2025-12-31',
      confirm_url: 'https://example.com/test',
      approved_at: new Date().toLocaleString('ja-JP'),
    },
  })
}
