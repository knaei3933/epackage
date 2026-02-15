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

const FROM_EMAIL = process.env.FROM_EMAIL || 'info@package-lab.com'
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || 'info@package-lab.com'
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
  // Support both XSERVER_SMTP_* and SUPABASE_SMTP_* variable names
  const XSERVER_SMTP_HOST = process.env.XSERVER_SMTP_HOST || process.env.SUPABASE_SMTP_HOST
  const XSERVER_SMTP_PORT = parseInt(process.env.XSERVER_SMTP_PORT || process.env.SUPABASE_SMTP_PORT || '587')
  const XSERVER_SMTP_USER = process.env.XSERVER_SMTP_USER || process.env.SUPABASE_SMTP_USER
  const XSERVER_SMTP_PASSWORD = process.env.XSERVER_SMTP_PASSWORD || process.env.SUPABASE_SMTP_PASSWORD

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
      'X-Mailer': 'EPackage Lab Mailer',
      'X-Auto-Response-Suppress': 'All',
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

    // nodemailerメッセージの作成 - Spam対策のためのヘッダー設定
    const msg = {
      from: `${COMPANY_NAME_EN} <${FROM_EMAIL}>`,
      to: data.customer_email,
      replyTo: REPLY_TO_EMAIL,
      subject,
      text: plainText,
      html,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'EPackage Lab Mailer',
        'X-Auto-Response-Suppress': 'All',
      },
      attachments: attachments?.map(att => {
        // PDFファイルの場合、特別な処理を行う
        const isPdf = att.type === 'application/pdf' || att.filename.toLowerCase().endsWith('.pdf')

        return {
          filename: att.filename,
          content: att.content,
          contentType: att.type,
          contentDisposition: att.disposition || 'attachment',
          // PDFの場合、追加のヘッダーを設定
          ...(isPdf && {
            headers: {
              'Content-Transfer-Encoding': 'base64',
              'X-Attachment-Id': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            }
          })
        }
      }),
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
        headers: {
          'X-Priority': '3',
          'X-Mailer': 'EPackage Lab Mailer',
          'X-Auto-Response-Suppress': 'All',
        },
        attachments: attachments?.map(att => {
          // PDFファイルの場合、特別な処理を行う
          const isPdf = att.type === 'application/pdf' || att.filename.toLowerCase().endsWith('.pdf')

          return {
            filename: att.filename,
            content: att.content,
            contentType: att.type,
            contentDisposition: att.disposition || 'attachment',
            // PDFの場合、追加のヘッダーを設定
            ...(isPdf && {
              headers: {
                'Content-Transfer-Encoding': 'base64',
                'X-Attachment-Id': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              }
            })
          }
        }),
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
 * カスタムメール送信（管理者用）
 *
 * カスタムHTML/テキストメールを送信します
 * テンプレートを使用せず、直接コンテンツを指定可能
 *
 * @param to - 宛先（メールアドレス文字列、配列、またはオブジェクト配列）
 * @param subject - 件名
 * @param content - コンテンツ（html または text）
 * @param attachments - 添付ファイル（オプション）
 * @param cc - CC宛先（オプション）
 * @param from - 送信元アドレス（オプション、デフォルトはFROM_EMAIL）
 */
export async function sendCustomEmail(
  to: string | Array<{ email: string; name?: string }>,
  subject: string,
  content: { html?: string; text?: string },
  attachments?: EpackAttachment[],
  cc?: Array<{ email: string; name?: string }>,
  from?: string
): Promise<EpackSendResult> {
  // 受信者を標準化
  let recipients: Array<{ email: string; name?: string }>
  if (typeof to === 'string') {
    recipients = [{ email: to }]
  } else if (Array.isArray(to)) {
    recipients = to
  } else {
    recipients = [{ email: String(to) }]
  }

  // バリデーション: 少なくともHTMLまたはテキストが必要
  if (!content.html && !content.text) {
    return {
      success: false,
      error: 'HTMLまたはテキストコンテンツのいずれかを指定してください。',
      errorCode: 'NO_CONTENT',
    }
  }

  // 件名バリデーション
  if (!subject || subject.trim().length === 0) {
    return {
      success: false,
      error: '件名を指定してください。',
      errorCode: 'NO_SUBJECT',
    }
  }

  // Consoleモード（Fallback）
  if (transportType === 'console' || !transporter) {
    console.log('[EpackMailer] Console mode - Custom email:')
    console.log('='.repeat(60))
    console.log(`To: ${recipients.map(r => r.email).join(', ')}`)
    if (cc) console.log(`CC: ${cc.map(r => r.email).join(', ')}`)
    console.log(`Subject: ${subject}`)
    if (content.html) console.log('HTML:', content.html.substring(0, 200) + '...')
    if (content.text) console.log('Text:', content.text.substring(0, 200) + '...')
    console.log(`Attachments: ${attachments?.length || 0}`)
    console.log('='.repeat(60))
    return {
      success: true,
      messageId: `console-${Date.now()}`,
    }
  }

  // 複数宛先の場合は個別送信
  const results = await Promise.all(
    recipients.map(async (recipient) => {
      try {
        // nodemailerメッセージの作成
        const fromAddress = from || FROM_EMAIL
        const msg: nodemailer.SendMailOptions = {
          from: fromAddress,
          to: recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email,
          replyTo: REPLY_TO_EMAIL,
          subject,
          // Spam対策のためのヘッダー設定
          headers: {
            'X-Priority': '3',
            'X-Mailer': 'EPackage Lab Mailer',
            'X-Auto-Response-Suppress': 'All',
            'Precedence': 'bulk',
            'List-Unsubscribe': `<mailto:${FROM_EMAIL}?subject=unsubscribe>`,
          }
        }

        // CC recipients
        if (cc && cc.length > 0) {
          msg.cc = cc.map(c => c.name ? `${c.name} <${c.email}>` : c.email).join(', ')
        }

        // HTMLまたはテキストを設定
        if (content.html) {
          msg.html = content.html
        }
        if (content.text) {
          msg.text = content.text
        }

        // 添付ファイル - Spam対策のための適切なMIME設定
        if (attachments && attachments.length > 0) {
          msg.attachments = attachments.map(att => {
            // PDFファイルの場合、特別な処理を行う
            const isPdf = att.type === 'application/pdf' || att.filename.toLowerCase().endsWith('.pdf')

            return {
              filename: att.filename,
              content: Buffer.from(att.content, 'base64'),
              contentType: att.type || 'application/octet-stream',
              contentDisposition: att.disposition || 'attachment',
              // PDFの場合、追加のヘッダーを設定
              ...(isPdf && {
                headers: {
                  'Content-Transfer-Encoding': 'base64',
                  'X-Attachment-Id': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                }
              })
            }
          })
        }

        // メール送信
        const info = await transporter.sendMail(msg)

        console.log('[EpackMailer] Custom email sent successfully:', {
          to: recipient.email,
          cc: cc?.map(c => c.email).join(', '),
          subject,
          messageId: info.messageId,
        })

        return {
          success: true,
          messageId: info.messageId,
        }
      } catch (error: any) {
        console.error(`[EpackMailer] Custom email send error for ${recipient.email}:`, {
          message: error.message,
          code: error.code,
        })

        return {
          success: false,
          error: error.message || 'Unknown error',
          errorCode: error.code || 'SEND_ERROR',
        }
      }
    })
  )

  // すべて成功した場合は成功、それ以外は失敗
  const allSuccess = results.every(r => r.success)
  const firstMessageId = results.find(r => r.messageId)?.messageId

  return {
    success: allSuccess,
    messageId: allSuccess ? firstMessageId : undefined,
    error: allSuccess ? undefined : results.find(r => !r.success)?.error,
    errorCode: allSuccess ? undefined : results.find(r => !r.success)?.errorCode,
  }
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
// Contact Form Email Functions
// ============================================================

/**
 * コンタクトフォームメール送信
 *
 * お問い合わせフォームからの送信を処理し、
 * 顧客と管理者にメールを送信します
 */
export interface ContactFormData {
  name: string
  email: string
  company?: string
  inquiryType: string
  subject?: string
  message: string
  urgency?: string
  preferredContact?: string
  requestId: string
}

export interface ContactEmailResult {
  success: boolean
  errors?: Array<{ to: string; error: string }>
  customerEmail?: EpackSendResult
  adminEmail?: EpackSendResult
}

export async function sendContactEmail(data: ContactFormData): Promise<ContactEmailResult> {
  const ADMIN_EMAIL = 'info@package-lab.com'
  const errors: Array<{ to: string; error: string }> = []

  // 顧客への自動返信メール
  const customerSubject = `【お問い合わせ受付完了】${data.requestId}`
  const customerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }
        h1 { margin: 0; font-size: 24px; }
        h2 { color: #333; font-size: 18px; margin-top: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>お問い合わせありがとうございます</h1>
        </div>
        <div class="content">
          <p>${data.name} 様</p>
          <p>この度は、Epackage Labにお問い合わせいただき、誠にありがとうございます。</p>

          <div class="info-box">
            <h2>お問い合わせ内容</h2>
            <p><strong>お問い合わせ番号:</strong> ${data.requestId}</p>
            <p><strong>種類:</strong> ${data.inquiryType}</p>
            ${data.subject ? `<p><strong>件名:</strong> ${data.subject}</p>` : ''}
            <p><strong>お問い合わせ内容:</strong></p>
            <p style="white-space: pre-wrap;">${data.message}</p>
          </div>

          <p>担当者より折り返しごご連絡させていただきます。</p>
          <p>通常、1-2営業日以内にご返信いたします。</p>
        </div>
        <div class="footer">
          <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
          <p>Epackage Lab (EPackage Lab)</p>
          <p>〒000-0000</p>
          <p>メール: info@package-lab.com</p>
          <p>URL: https://epackage-lab.com</p>
          <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
        </div>
      </div>
    </body>
    </html>
  `

  const customerText = `
お問い合わせありがとうございます
====================================

${data.name} 様

この度は、Epackage Labにお問い合わせいただき、誠にありがとうございます。

お問い合わせ番号: ${data.requestId}
種類: ${data.inquiryType}
${data.subject ? `件名: ${data.subject}` : ''}

お問い合わせ内容:
${data.message}

担当者より折り返しごご連絡させていただきます。
通常、1-2営業日以内にご返信いたします。

====================================
Epackage Lab (EPackage Lab)
メール: info@package-lab.com
URL: https://epackage-lab.com
====================================
  `

  // 管理者への通知メール
  const adminSubject = `【お問い合わせ】${data.inquiryType}: ${data.requestId}`
  const urgencyLabelMap: Record<string, string> = {
    'low': '低',
    'normal': '普通',
    'high': '高',
    'urgent': '至急'
  }
  const urgencyLabel = data.urgency ? (urgencyLabelMap[data.urgency] || '普通') : '普通';

  // 事前に緊急度行のclassを計算
  const urgencyRowClass = (data.urgency === 'urgent' || data.urgency === 'high') ? 'urgent-high' : ''
  const urgencyRow = data.urgency ? `<tr class="${urgencyRowClass}"><th>緊急度</th><td>${urgencyLabel}</td></tr>` : ''
  const preferredContactRow = data.preferredContact ? `<tr><th>希望連絡方法</th><td>${data.preferredContact}</td></tr>` : ''
  const subjectRow = data.subject ? `<tr><th>件名</th><td>${data.subject}</td></tr>` : ''

  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-top: none; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .info-table th { background: #f5f5f5; padding: 10px; text-align: left; border: 1px solid #ddd; }
        .info-table td { padding: 10px; border: 1px solid #ddd; }
        .urgent-high { background: #ffebee; color: #c62828; }
        .message-box { background: #f9f9f9; padding: 15px; border-radius: 4px; white-space: pre-wrap; }
        .footer { background: #f0f0f0; padding: 15px; font-size: 11px; color: #666; text-align: center; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">【新規お問い合わせ】${data.inquiryType}</h2>
        </div>
        <div class="content">
          <table class="info-table">
            <tr><th>お問い合わせ番号</th><td>${data.requestId}</td></tr>
            <tr><th>お名前</th><td>${data.name}</td></tr>
            <tr><th>会社名</th><td>${data.company || '-'}</td></tr>
            <tr><th>メールアドレス</th><td>${data.email}</td></tr>
            <tr><th>お問い合わせ種類</th><td>${data.inquiryType}</td></tr>
            ${urgencyRow}
            ${preferredContactRow}
            ${subjectRow}
          </table>

          <h3 style="margin-top: 20px;">お問い合わせ内容:</h3>
          <div class="message-box">${data.message}</div>
        </div>
        <div class="footer">
          ${new Date().toLocaleString('ja-JP')}
        </div>
      </div>
    </body>
    </html>
  `

  const adminText = `
【新規お問い合わせ】${data.inquiryType}
====================================

お問い合わせ番号: ${data.requestId}
お名前: ${data.name}
会社名: ${data.company || '-'}
メールアドレス: ${data.email}
お問い合わせ種類: ${data.inquiryType}
${data.urgency ? `緊急度: ${urgencyLabel}` : ''}
${data.preferredContact ? `希望連絡方法: ${data.preferredContact}` : ''}
${data.subject ? `件名: ${data.subject}` : ''}

お問い合わせ内容:
${data.message}

====================================
${new Date().toLocaleString('ja-JP')}
  `

  try {
    // 顧客へメール送信
    const customerResult = await sendCustomEmail(
      data.email,
      customerSubject,
      { html: customerHtml, text: customerText }
    )

    if (!customerResult.success) {
      errors.push({ to: data.email, error: customerResult.error || '送信失敗' })
    }

    // 管理者へメール送信（送信元は顧客のメールアドレス）
    const adminResult = await sendCustomEmail(
      ADMIN_EMAIL,
      adminSubject,
      { html: adminHtml, text: adminText },
      undefined, // attachments
      undefined, // cc
      data.email // from: 顧客のメールアドレス
    )

    if (!adminResult.success) {
      errors.push({ to: ADMIN_EMAIL, error: adminResult.error || '送信失敗' })
    }

    // 両方成功であれば成功とみなす
    const success = customerResult.success && adminResult.success

    return {
      success,
      errors: errors.length > 0 ? errors : undefined,
      customerEmail: customerResult,
      adminEmail: adminResult
    }
  } catch (error: any) {
    console.error('[Contact Email] Error:', error)
    return {
      success: false,
      errors: [{ to: 'unknown', error: error.message || '不明なエラー' }]
    }
  }
}

// ============================================================
// Export All Functions
// ============================================================

export const epackMailer = {
  send: sendEpackEmail,
  sendBatch: sendEpackEmailBatch,
  sendCustom: sendCustomEmail,
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

  // Contact form
  sendContact: sendContactEmail,

  // Utilities
  isValidEmail: isValidEpackEmail,
  escapeText: escapeJapaneseText,
  formatAmount: formatYenAmount,
  formatDate: formatJapaneseDate,
  encodeBase64,
  createAttachment,
}
