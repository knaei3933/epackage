/**
 * Notification Service
 *
 * 通知サービス
 * Xserver SMTP (nodemailer) を使用したメール通知システム
 *
 * @module lib/email/notificationService
 */

import * as nodemailer from 'nodemailer'
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

// Xserver SMTP Configuration
const XSERVER_SMTP_HOST = process.env.XSERVER_SMTP_HOST
const XSERVER_SMTP_PORT = parseInt(process.env.XSERVER_SMTP_PORT || '587')
const XSERVER_SMTP_USER = process.env.XSERVER_SMTP_USER
const XSERVER_SMTP_PASSWORD = process.env.XSERVER_SMTP_PASSWORD

// ============================================================
// SMTP Transporter
// ============================================================

let transporter: nodemailer.Transporter | null = null
let transportType: 'xserver' | 'console' = 'console'

/**
 * Xserver SMTP Transporter 作成
 */
function createXServerTransporter() {
  if (!XSERVER_SMTP_HOST || !XSERVER_SMTP_USER || !XSERVER_SMTP_PASSWORD) {
    return null
  }

  return nodemailer.createTransport({
    host: XSERVER_SMTP_HOST,
    port: XSERVER_SMTP_PORT,
    secure: XSERVER_SMTP_PORT === 465,
    auth: {
      user: XSERVER_SMTP_USER,
      pass: XSERVER_SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    },
    // Spam対策のためのヘッダー設定
    headers: {
      'X-Priority': '3',
      'X-Mailer': 'EPackage Lab Notification Service',
      'X-Auto-Response-Suppress': 'All',
    }
  })
}

// 初期化
async function initializeTransporter() {
  // 1. Xserver SMTP
  transporter = createXServerTransporter()
  if (transporter) {
    transportType = 'xserver'
    console.log('[NotificationService] Xserver SMTP initialized')
    return
  }

  // Fallback: Console
  console.warn('[NotificationService] No SMTP configured - using console fallback')
  transportType = 'console'
}

initializeTransporter()

// ============================================================
// Core Functions
// ============================================================

/**
 * メール送信
 *
 * 指定されたテンプレートとデータでメールを送信します
 */
export async function sendEmail(request: SendEmailRequest): Promise<SendEmailResult> {
  // SMTP設定のチェック
  if (!transporter || transportType === 'console') {
    console.warn('[NotificationService] SMTP not configured, skipping email send')
    console.log('[NotificationService] Email would be sent:', {
      templateId: request.templateId,
      to: request.to,
      data: request.data,
    })
    return {
      success: false,
      error: 'SMTP not configured',
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

    // 件名と本文の生成
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

    // nodemailerメッセージの作成
    const mailOptions: nodemailer.SendMailOptions = {
      from: FROM_EMAIL,
      replyTo: request.replyTo || REPLY_TO_EMAIL,
      to: recipients.map(r => ({ email: r.email, name: r.name || '' })),
      subject,
      text: plainText,
      html: html,
      attachments: request.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.type,
        contentDisposition: att.disposition || 'attachment',
      })),
    }

    // メール送信
    const info = await transporter.sendMail(mailOptions)

    return {
      success: true,
      messageId: info.messageId || 'unknown',
    }
  } catch (error) {
    console.error('[NotificationService] Email send error:', error)

    const err = error as Error
    return {
      success: false,
      error: err.message || 'Unknown error',
      errorCode: 'SEND_ERROR',
    }
  }
}

/**
 * 通知イベントの処理
 *
 * イベントタイプに応じて適切なメールを送信します
 */
export async function handleNotificationEvent(event: NotificationEvent): Promise<SendEmailResult> {
  // イベントタイプからテンプレートIDへのマッピング
  const templateMap: Record<NotificationEventType, EmailTemplateId> = {
    quotation_created: 'quote_created_admin',
    quotation_approved: 'quote_approved_customer',
    contract_sent: 'contract_sent',
    contract_signed: 'contract_signed_admin',
    production_updated: 'production_update',
    order_shipped: 'shipped',
  }

  const templateId = templateMap[event.type]
  if (!templateId) {
    console.warn('[NotificationService] Unknown event type:', event.type)
    return {
      success: false,
      error: `Unknown event type: ${event.type}`,
      errorCode: 'UNKNOWN_EVENT',
    }
  }

  // 受信者の決定
  let recipients: EmailRecipient[] = []

  if (event.recipientType === 'admin') {
    recipients = [{
      email: ADMIN_EMAIL,
      name: 'EPackage Lab 管理者',
      type: 'admin',
    }]
  } else if (event.recipientType === 'customer') {
    // 顧客データからメールアドレスを取得
    if (isCustomerEmailData(event.data)) {
      recipients = [{
        email: event.data.customer_email || '',
        name: event.data.customer_name || '',
        type: 'customer',
      }]
    }
  } else {
    // both - 管理者と顧客両方に送信
    recipients = [
      {
        email: ADMIN_EMAIL,
        name: 'EPackage Lab 管理者',
        type: 'admin',
      },
    ]
    if (isCustomerEmailData(event.data)) {
      recipients.push({
        email: event.data.customer_email || '',
        name: event.data.customer_name || '',
        type: 'customer',
      })
    }
  }

  // メール送信
  return sendEmail({
    to: recipients,
    templateId,
    data: event.data,
  })
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * メールアドレスが有効かチェック
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * コンソールにメール内容を出力（開発用）
 */
export function logEmailContent(request: SendEmailRequest): void {
  const template = emailTemplates[request.templateId]
  if (!template) {
    console.log('[NotificationService] Template not found:', request.templateId)
    return
  }

  const subject = typeof template.subject === 'function'
    ? template.subject(request.data as unknown as never)
    : String(template.subject)
  const plainText = typeof template.plainText === 'function'
    ? template.plainText(request.data as unknown as never)
    : String(template.plainText)

  console.log('====================================')
  console.log('[Email Preview]')
  console.log('====================================')
  console.log(`To: ${JSON.stringify(request.to)}`)
  console.log(`Subject: ${subject}`)
  console.log('------------------------------------')
  console.log(plainText)
  console.log('====================================')
}

/**
 * Xserver SMTP 接続テスト
 */
export async function testXServerConnection(): Promise<{ success: boolean; error?: string }> {
  if (!transporter) {
    return { success: false, error: 'Transporter not initialized' }
  }

  try {
    await transporter.verify()
    return { success: true }
  } catch (error) {
    const err = error as Error
    return { success: false, error: err.message }
  }
}
