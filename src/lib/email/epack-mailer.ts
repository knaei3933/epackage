/**
 * Epackage Lab Mailer Service
 *
 * イーパックラボ 専用メール送信サービス
 * Xserver SMTP (nodemailer) を使用した日本語ビジネスメール送信
 *
 * @module lib/email/epack-mailer
 */

import * as nodemailer from 'nodemailer'
import { epackEmailTemplates, type EpackEmailData, type EpackTemplateId } from './epack-templates'

// ============================================================
// Configuration
// ============================================================

const FROM_EMAIL = process.env.FROM_EMAIL || 'info@epackage-lab.com'
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || 'info@epackage-lab.com'
const COMPANY_NAME = 'イーパックラボ'
const COMPANY_NAME_EN = 'EPackage Lab'

// ============================================================
// Transporter Creation
// ============================================================

let transporter: nodemailer.Transporter | null = null
let transportType: 'xserver' | 'console' = 'console'

/**
 * Xserver SMTP Transporter 생성
 */
function createXServerTransporter() {
  const XSERVER_SMTP_HOST = process.env.XSERVER_SMTP_HOST
  const XSERVER_SMTP_PORT = parseInt(process.env.XSERVER_SMTP_PORT || '587')
  const XSERVER_SMTP_USER = process.env.XSERVER_SMTP_USER
  const XSERVER_SMTP_PASSWORD = process.env.XSERVER_SMTP_PASSWORD

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
    }
  })
}

// 초기화
async function initializeTransporter() {
  // 1. Xserver SMTP
  transporter = createXServerTransporter()
  if (transporter) {
    transportType = 'xserver'
    console.log('[EpackMailer] Xserver SMTP initialized')
    return
  }

  // Fallback: Console
  console.warn('[EpackMailer] No SMTP configured - using console fallback')
  transportType = 'console'
}

initializeTransporter()

// ============================================================
// Type Definitions
// ============================================================

export interface EpackSendResult {
  success: boolean
  messageId?: string
  error?: string
  errorCode?: string
}

export interface EpackAttachment {
  filename: string
  content: string // Base64 encoded
  type: string
  disposition?: 'attachment' | 'inline'
}

// ============================================================
// Core Mailer Functions
// ============================================================

/**
 * Epackage Labメール送信
 *
 * 指定されたテンプレートとデータでメールを送信します
 */
export async function sendEpackEmail(
  templateId: EpackTemplateId,
  data: EpackEmailData,
  attachments?: EpackAttachment[]
): Promise<EpackSendResult> {
  // Consoleモード（Fallback）
  if (transportType === 'console' || !transporter) {
    console.log('[EpackMailer] Console mode - Email content:')
    console.log('='.repeat(60))
    console.log(`To: ${data.customer_email}`)
    console.log(`Template: ${templateId}`)
    console.log('Data:', JSON.stringify(data, null, 2))
    console.log('='.repeat(60))
    return {
      success: true,
      messageId: `console-${Date.now()}`
    }
  }

  try {
    // テンプレートの取得
    const template = epackEmailTemplates[templateId]
    if (!template) {
      return {
        success: false,
        error: `Template not found: ${templateId}`,
        errorCode: 'TEMPLATE_NOT_FOUND',
      }
    }

    // 件名と本文の生成
    const subject = template.subject(data)
    const plainText = template.plainText(data)
    const html = template.html(data)

    // nodemailerメッセージの作成
    const msg = {
      from: `${COMPANY_NAME_EN} <${FROM_EMAIL}>`,
      to: data.customer_email,
      replyTo: REPLY_TO_EMAIL,
      subject,
      text: plainText,
      html,
      attachments: attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        type: att.type,
        disposition: att.disposition || 'attachment',
      })),
    }

    // メール送信
    const info = await transporter.sendMail(msg)

    console.log('[EpackMailer] Email sent successfully:', {
      transportType,
      to: data.customer_email,
      templateId,
      messageId: info.messageId
    })

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error: any) {
    console.error('[EpackMailer] Email send error:', {
      transportType,
      message: error.message,
      code: error.code,
    })

    return {
      success: false,
      error: error.message,
      errorCode: error.code || 'SEND_ERROR',
    }
  }
}

/**
 * 複数宛先へのメール送信（BCC使用）
 */
export async function sendEpackEmailBatch(
  templateId: EpackTemplateId,
  recipients: Array<{ email: string; name?: string }>,
  baseData: Omit<EpackEmailData, 'customer_email' | 'customer_name'>,
  attachments?: EpackAttachment[]
): Promise<EpackSendResult[]> {
  const results: EpackSendResult[] = []

  // Consoleモード（Fallback）
  if (transportType === 'console' || !transporter) {
    console.log('[EpackMailer] Console mode - Batch email:')
    console.log('='.repeat(60))
    console.log(`Template: ${templateId}`)
    console.log(`Recipients: ${recipients.length}`)
    console.log('='.repeat(60))
    return recipients.map(() => ({
      success: true,
      messageId: `console-${Date.now()}`
    }))
  }

  // テンプレートの取得
  const template = epackEmailTemplates[templateId]
  if (!template) {
    return recipients.map(() => ({
      success: false,
      error: `Template not found: ${templateId}`,
      errorCode: 'TEMPLATE_NOT_FOUND',
    }))
  }

  // メール送信（並列処理）
  const sendPromises = recipients.map(async (recipient) => {
    try {
      const data: EpackEmailData = {
        ...baseData,
        customer_email: recipient.email,
        customer_name: recipient.name || baseData.customer_name,
      }

      const subject = template.subject(data)
      const plainText = template.plainText(data)
      const html = template.html(data)

      const msg = {
        from: `${COMPANY_NAME_EN} <${FROM_EMAIL}>`,
        to: recipient.email,
        replyTo: REPLY_TO_EMAIL,
        subject,
        text: plainText,
        html,
        attachments: attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          type: att.type,
          disposition: att.disposition || 'attachment',
        })),
      }

      const info = await transporter.sendMail(msg)
      return {
        success: true,
        messageId: info.messageId,
      }
    } catch (error: any) {
      console.error(`[EpackMailer] Email send error for ${recipient.email}:`, error)
      return {
        success: false,
        error: error.message || 'Unknown error',
        errorCode: error.code || 'SEND_ERROR',
      }
    }
  })

  return await Promise.all(sendPromises)
}

/**
 * テストメール送信（開発用）
 */
export async function sendEpackTestEmail(
  recipientEmail: string,
  templateId: EpackTemplateId = 'quoteReady'
): Promise<EpackSendResult> {
  const testData: EpackEmailData = {
    quotation_id: 'TEST-001',
    quotation_number: 'QT-TEST-2025-001',
    order_id: 'ORD-TEST-2025-001',
    order_number: 'ORD-TEST-001',
    customer_name: 'テスト様',
    customer_email: recipientEmail,
    company_name: 'テスト株式会社',
    product_name: 'スタンアップパウチ（スタンダード）',
    total_amount: 100000,
    valid_until: '2025-12-31',
    upload_deadline: '2025-02-15',
    approval_deadline: '2025-02-20',
    estimated_completion: '2025-03-15',
    estimated_delivery: '2025-03-20',
    file_name: 'design_test.ai',
    quantity: '1,000枚',
    modification_details: 'ロゴの解像度が不足しています。350dpi以上のデータをご用意ください。',
    correction_details: '印刷データのトンボ位置を調整してください。',
    rejection_reason: 'テスト用',
    refund_amount: 50000,
    refund_method: '銀行振込',
    cancellation_reason: 'テスト用キャンセル',
    view_url: 'https://epackage-lab.com/test',
    tracking_number: 'TEST123456789JP',
    carrier: 'ヤマト運輸',
    tracking_url: 'https://track.yamato-transport.co.jp/',
  }

  return sendEpackEmail(templateId, testData)
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * メールアドレスのフォーマット検証
 */
export function isValidEpackEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 日本語文字列のエスケープ
 */
export function escapeJapaneseText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * 金額のフォーマット（日本円）
 */
export function formatYenAmount(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`
}

/**
 * 日付のフォーマット（日本語）
 */
export function formatJapaneseDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Base64エンコード（ファイル添付用）
 */
export function encodeBase64(content: Buffer): string {
  return content.toString('base64')
}

/**
 * 添付ファイルの作成
 */
export function createAttachment(
  filename: string,
  content: Buffer,
  type: string,
  disposition: 'attachment' | 'inline' = 'attachment'
): EpackAttachment {
  return {
    filename,
    content: encodeBase64(content),
    type,
    disposition,
  }
}

// ============================================================
// Template-Specific Wrapper Functions
// ============================================================

/**
 * 見積作成完了メール
 */
export async function sendQuoteReadyEmail(data: EpackEmailData): Promise<EpackSendResult> {
  return sendEpackEmail('quoteReady', data)
}

/**
 * 見積承認完了メール
 */
export async function sendQuoteApprovedEmail(data: EpackEmailData): Promise<EpackSendResult> {
  return sendEpackEmail('quoteApproved', data)
}

/**
 * データ入稿依頼メール
 */
export async function sendDataUploadRequestEmail(data: EpackEmailData): Promise<EpackSendResult> {
  return sendEpackEmail('dataUploadRequest', data)
}

/**
 * データ受領確認メール
 */
export async function sendDataReceivedEmail(data: EpackEmailData): Promise<EpackSendResult> {
  return sendEpackEmail('dataReceived', data)
}

/**
 * 修正承認依頼メール
 */
export async function sendModificationRequestEmail(data: EpackEmailData): Promise<EpackSendResult> {
  return sendEpackEmail('modificationRequest', data)
}

/**
 * 修正承認完了メール
 */
export async function sendModificationApprovedEmail(data: EpackEmailData): Promise<EpackSendResult> {
  return sendEpackEmail('modificationApproved', data)
}

/**
 * 修正却下確認メール
 */
export async function sendModificationRejectedEmail(data: EpackEmailData): Promise<EpackSendResult> {
  return sendEpackEmail('modificationRejected', data)
}

/**
 * 校正完了メール
 */
export async function sendCorrectionReadyEmail(data: EpackEmailData): Promise<EpackSendResult> {
  return sendEpackEmail('correctionReady', data)
}

/**
 * 顧客承認待ちメール
 */
export async function sendApprovalRequestEmail(data: EpackEmailData): Promise<EpackSendResult> {
  return sendEpackEmail('approvalRequest', data)
}

/**
 * 製造開始メール
 */
export async function sendProductionStartedEmail(data: EpackEmailData): Promise<EpackSendResult> {
  return sendEpackEmail('productionStarted', data)
}

/**
 * 出荷準備完了メール
 */
export async function sendReadyToShipEmail(data: EpackEmailData): Promise<EpackSendResult> {
  return sendEpackEmail('readyToShip', data)
}

/**
 * 出荷完了メール
 */
export async function sendShippedEmail(data: EpackEmailData): Promise<EpackSendResult> {
  return sendEpackEmail('shipped', data)
}

/**
 * 注文キャンセルメール
 */
export async function sendOrderCancelledEmail(data: EpackEmailData): Promise<EpackSendResult> {
  return sendEpackEmail('orderCancelled', data)
}

/**
 * 韓国チーム校正依頼メール
 */
export async function sendKoreaCorrectionRequestEmail(data: EpackEmailData): Promise<EpackSendResult> {
  return sendEpackEmail('koreaCorrectionRequest', data)
}

// ============================================================
// Export All Functions
// ============================================================

export const epackMailer = {
  send: sendEpackEmail,
  sendBatch: sendEpackEmailBatch,
  sendTest: sendEpackTestEmail,

  // Template-specific functions
  quoteReady: sendQuoteReadyEmail,
  quoteApproved: sendQuoteApprovedEmail,
  dataUploadRequest: sendDataUploadRequestEmail,
  dataReceived: sendDataReceivedEmail,
  modificationRequest: sendModificationRequestEmail,
  modificationApproved: sendModificationApprovedEmail,
  modificationRejected: sendModificationRejectedEmail,
  correctionReady: sendCorrectionReadyEmail,
  approvalRequest: sendApprovalRequestEmail,
  productionStarted: sendProductionStartedEmail,
  readyToShip: sendReadyToShipEmail,
  shipped: sendShippedEmail,
  orderCancelled: sendOrderCancelledEmail,
  koreaCorrectionRequest: sendKoreaCorrectionRequestEmail,

  // Utilities
  isValidEmail: isValidEpackEmail,
  escapeText: escapeJapaneseText,
  formatAmount: formatYenAmount,
  formatDate: formatJapaneseDate,
  encodeBase64,
  createAttachment,
}
