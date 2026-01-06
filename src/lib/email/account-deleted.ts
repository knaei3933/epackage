/**
 * Account Deletion Email Template
 *
 * アカウント削除確認メールテンプレート
 * - SendGrid integration for reliable delivery
 * - Japanese business email format
 * - Detailed deletion summary
 * - Graceful error handling
 */

import * as nodemailer from 'nodemailer'

// =====================================================
// Types
// =====================================================

export interface AccountDeletionEmailData {
  email: string
  userId: string
  deletionDate?: Date
  deletedCounts?: {
    sampleRequests?: number
    sampleItems?: number
    deliveryAddresses?: number
    billingAddresses?: number
    inquiries?: number
    notifications?: number
    contracts?: number
    quotations?: number
    quotationItems?: number
    orders?: number
    orderItems?: number
    productionOrders?: number
    files?: number
    designRevisions?: number
    koreaCorrections?: number
    koreaTransferLog?: number
    profile?: number
  }
}

// =====================================================
// Email Configuration
// =====================================================

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@epackage-lab.com'

// =====================================================
// Transporter Creation (reuse from email.ts logic)
// =====================================================

let transporter: nodemailer.Transporter | null = null
let transportType: 'sendgrid' | 'aws-ses' | 'console' = 'console'

function createSendGridTransporter() {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
  const SENDGRID_HOST = process.env.SENDGRID_SMTP_HOST || 'smtp.sendgrid.net'
  const SENDGRID_PORT = parseInt(process.env.SENDGRID_SMTP_PORT || '587')

  if (!SENDGRID_API_KEY || SENDGRID_API_KEY === 'SG.placeholder' || SENDGRID_API_KEY === '') {
    console.warn('[AccountDeletionEmail] SendGrid not configured')
    return null
  }

  return nodemailer.createTransport({
    host: SENDGRID_HOST,
    port: SENDGRID_PORT,
    secure: false,
    auth: {
      user: 'apikey',
      pass: SENDGRID_API_KEY,
    },
  })
}

function createAwsSesTransporter() {
  const AWS_SES_SMTP_USERNAME = process.env.AWS_SES_SMTP_USERNAME
  const AWS_SES_SMTP_PASSWORD = process.env.AWS_SES_SMTP_PASSWORD
  const AWS_SES_SMTP_HOST = process.env.AWS_SES_SMTP_HOST || 'email-smtp.ap-northeast-1.amazonaws.com'
  const AWS_SES_SMTP_PORT = parseInt(process.env.AWS_SES_SMTP_PORT || '587')

  if (!AWS_SES_SMTP_USERNAME || !AWS_SES_SMTP_PASSWORD ||
      AWS_SES_SMTP_USERNAME === 'AKIAIOSFODNN7EXAMPLE' ||
      AWS_SES_SMTP_PASSWORD === 'placeholder') {
    return null
  }

  return nodemailer.createTransport({
    host: AWS_SES_SMTP_HOST,
    port: AWS_SES_SMTP_PORT,
    secure: false,
    auth: {
      user: AWS_SES_SMTP_USERNAME,
      pass: AWS_SES_SMTP_PASSWORD,
    },
  })
}

async function initializeTransporter() {
  // Production: SendGrid preferred -> AWS SES backup
  console.log('[AccountDeletionEmail] Configuring email service')

  transporter = createSendGridTransporter()
  if (transporter) {
    transportType = 'sendgrid'
    console.log('[AccountDeletionEmail] SendGrid initialized')
    return
  }

  transporter = createAwsSesTransporter()
  if (transporter) {
    transportType = 'aws-ses'
    console.log('[AccountDeletionEmail] AWS SES initialized (fallback)')
    return
  }

  console.warn('[AccountDeletionEmail] No email service configured - using console fallback')
  transportType = 'console'
}

// Initialize transporter
initializeTransporter()


// =====================================================
// Email Template
// =====================================================

function getAccountDeletedEmailHTML(data: AccountDeletionEmailData): string {
  const deletionDate = data.deletionDate || new Date()
  const formattedDate = deletionDate.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Build deletion summary HTML if counts are provided
  let deletionSummaryHTML = ''
  if (data.deletedCounts) {
    const counts = data.deletedCounts
    const summaryItems = []

    if (counts.profile && counts.profile > 0) {
      summaryItems.push(`<li>プロフィール情報：${counts.profile}件</li>`)
    }
    if (counts.sampleRequests && counts.sampleRequests > 0) {
      summaryItems.push(`<li>サンプル要求履歴：${counts.sampleRequests}件</li>`)
    }
    if (counts.quotations && counts.quotations > 0) {
      summaryItems.push(`<li>見積もり履歴：${counts.quotations}件</li>`)
    }
    if (counts.orders && counts.orders > 0) {
      summaryItems.push(`<li>注文履歴：${counts.orders}件</li>`)
    }
    if (counts.deliveryAddresses && counts.deliveryAddresses > 0) {
      summaryItems.push(`<li>配送先住所：${counts.deliveryAddresses}件</li>`)
    }
    if (counts.billingAddresses && counts.billingAddresses > 0) {
      summaryItems.push(`<li>請求先住所：${counts.billingAddresses}件</li>`)
    }
    if (counts.inquiries && counts.inquiries > 0) {
      summaryItems.push(`<li>お問い合わせ履歴：${counts.inquiries}件</li>`)
    }
    if (counts.notifications && counts.notifications > 0) {
      summaryItems.push(`<li>通知履歴：${counts.notifications}件</li>`)
    }

    if (summaryItems.length > 0) {
      deletionSummaryHTML = `
      <h2>削除されたデータの詳細</h2>
      <p>
        以下のデータが削除されました：
      </p>
      <ul style="list-style-type: disc; padding-left: 20px;">
        ${summaryItems.join('')}
      </ul>
      `
    }
  }

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>アカウント削除の完了</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px;
    }
    .content h2 {
      color: #333;
      font-size: 20px;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
    }
    .info-box p {
      margin: 5px 0;
    }
    .warning-box {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
    }
    .warning-box p {
      margin: 5px 0;
      color: #856404;
    }
    .contact-box {
      background-color: #e7f3ff;
      border-left: 4px solid #2196F3;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>アカウント削除の完了</h1>
    </div>

    <div class="content">
      <h2>アカウントを削除いたしました</h2>

      <p>
        この度は、Epackage Labをご利用いただき誠にありがとうございました。
      </p>

      <p>
        お客様のアカウントおよび関連するデータは、以下の通り削除されております。
      </p>

      <div class="info-box">
        <p><strong>削除日時：</strong>${formattedDate}</p>
        <p><strong>メールアドレス：</strong>${data.email}</p>
      </div>

      <div class="warning-box">
        <p><strong>重要なお知らせ</strong></p>
        <p>
          この操作は取り消すことができません。<br>
          削除されたデータは復元できませんので、ご了承ください。
        </p>
      </div>

      ${deletionSummaryHTML}

      <h2>個人情報の取り扱いについて</h2>
      <p>
        削除されたお客様の個人情報は、当社プライバシーポリシーに基づき、
        適切に管理・廃棄させていただきます。
      </p>

      <div class="contact-box">
        <h3 style="margin-top: 0; color: #2196F3;">ご不明な点がございましたら</h3>
        <p>
          アカウント削除や個人情報の取り扱いについて、
          ご不明な点がございましたら、お気軽にお問い合わせください。
        </p>
        <p style="margin: 10px 0;">
          <strong>お問い合わせ先：</strong><br>
          メール：${process.env.ADMIN_EMAIL || 'info@epackage-lab.com'}<br>
          ウェブサイト：<a href="https://epackage-lab.com/contact" style="color: #2196F3;">お問い合わせフォーム</a>
        </p>
      </div>

      <h2>ご意見・ご要望</h2>
      <p>
        もし何かご意見やご要望がございましたら、
        お問い合わせフォームよりお気軽にお寄せください。
      </p>

      <p>
        これからも Epackage Lab をよろしくお願い申し上げます。
      </p>

      <p style="margin-top: 30px;">
        敬具
      </p>

      <p style="margin-top: 10px;">
        <strong>Epackage Lab 運営チーム</strong>
      </p>
    </div>

    <div class="footer">
      <p>このメールはシステムにより自動送信されています。</p>
      <p>※このメールに返信しないようお願いいたします。</p>
      <p style="margin-top: 15px;">
        © ${new Date().getFullYear()} Epackage Lab. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function getAccountDeletedEmailText(data: AccountDeletionEmailData): string {
  const deletionDate = data.deletionDate || new Date()
  const formattedDate = deletionDate.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Build deletion summary text if counts are provided
  let deletionSummaryText = ''
  if (data.deletedCounts) {
    const counts = data.deletedCounts
    const summaryItems = []

    if (counts.profile && counts.profile > 0) {
      summaryItems.push(`・プロフィール情報：${counts.profile}件`)
    }
    if (counts.sampleRequests && counts.sampleRequests > 0) {
      summaryItems.push(`・サンプル要求履歴：${counts.sampleRequests}件`)
    }
    if (counts.quotations && counts.quotations > 0) {
      summaryItems.push(`・見積もり履歴：${counts.quotations}件`)
    }
    if (counts.orders && counts.orders > 0) {
      summaryItems.push(`・注文履歴：${counts.orders}件`)
    }
    if (counts.deliveryAddresses && counts.deliveryAddresses > 0) {
      summaryItems.push(`・配送先住所：${counts.deliveryAddresses}件`)
    }
    if (counts.billingAddresses && counts.billingAddresses > 0) {
      summaryItems.push(`・請求先住所：${counts.billingAddresses}件`)
    }
    if (counts.inquiries && counts.inquiries > 0) {
      summaryItems.push(`・お問い合わせ履歴：${counts.inquiries}件`)
    }
    if (counts.notifications && counts.notifications > 0) {
      summaryItems.push(`・通知履歴：${counts.notifications}件`)
    }

    if (summaryItems.length > 0) {
      deletionSummaryText = `
【削除されたデータの詳細】
以下のデータが削除されました：

${summaryItems.join('\n')}
`
    }
  }

  return `
アカウント削除の完了

この度は、Epackage Labをご利用いただき誠にありがとうございました。

お客様のアカウントおよび関連するデータは、以下の通り削除されております。

削除日時：${formattedDate}
メールアドレス：${data.email}

【重要なお知らせ】
この操作は取り消すことができません。
削除されたデータは復元できませんので、ご了承ください。

${deletionSummaryText}
【個人情報の取り扱いについて】
削除されたお客様の個人情報は、当社プライバシーポリシーに基づき、
適切に管理・廃棄させていただきます。

【ご不明な点がございましたら】
アカウント削除や個人情報の取り扱いについて、
ご不明な点がございましたら、お気軽にお問い合わせください。

お問い合わせ先：
メール：${process.env.ADMIN_EMAIL || 'info@epackage-lab.com'}
ウェブサイト：https://epackage-lab.com/contact

【ご意見・ご要望】
もし何かご意見やご要望がございましたら、
お問い合わせフォームよりお気軽にお寄せください。

これからも Epackage Lab をよろしくお願い申し上げます。

敬具

Epackage Lab 運営チーム

---
このメールはシステムにより自動送信されています。
※このメールに返信しないようお願いいたします。

© ${new Date().getFullYear()} Epackage Lab. All rights reserved.
  `.trim()
}

// =====================================================
// Send Email Function
// =====================================================

/**
 * Send account deletion confirmation email using SendGrid
 *
 * アカウント削除確認メールを送信（SendGrid使用）
 *
 * @param email - User email address
 * @param userId - User ID
 * @param deletionDate - Date of deletion (optional)
 * @param deletedCounts - Counts of deleted data (optional)
 * @returns Send result with success status and error details
 */
export async function sendAccountDeletionEmail(
  email: string,
  userId: string,
  deletionDate?: Date,
  deletedCounts?: AccountDeletionEmailData['deletedCounts']
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const emailData: AccountDeletionEmailData = {
      email,
      userId,
      deletionDate,
      deletedCounts
    }

    // Console mode (Fallback)
    if (transportType === 'console' || !transporter) {
      console.log('[AccountDeletionEmail] Console mode - Email content:')
      console.log('='.repeat(60))
      console.log(`To: ${email}`)
      console.log(`Subject: アカウント削除の完了 - Epackage Lab`)
      console.log('Text:', getAccountDeletedEmailText(emailData))
      console.log('='.repeat(60))

      return {
        success: true,
        messageId: `console-${Date.now()}`
      }
    }

    // Send email using configured transporter
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'アカウント削除の完了 - Epackage Lab',
      text: getAccountDeletedEmailText(emailData),
      html: getAccountDeletedEmailHTML(emailData)
    })

    console.log('[AccountDeletionEmail] Email sent successfully:', {
      transportType,
      to: email,
      userId,
      messageId: info.messageId
    })

    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error: any) {
    console.error('[AccountDeletionEmail] Send error:', {
      transportType,
      message: error.message,
      code: error.code
    })

    return {
      success: false,
      error: error.message || 'Failed to send email'
    }
  }
}

/**
 * Send account deletion confirmation email with full deletion result
 *
 * 削除結果を含むアカウント削除確認メールを送信
 *
 * @param email - User email address
 * @param userId - User ID
 * @param deletionResult - Full deletion result with counts
 * @returns Send result
 */
export async function sendAccountDeletionConfirmation(
  email: string,
  userId: string,
  deletionResult: {
    deletionDate?: Date
    deletedCounts?: AccountDeletionEmailData['deletedCounts']
  }
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  return sendAccountDeletionEmail(
    email,
    userId,
    deletionResult.deletionDate,
    deletionResult.deletedCounts
  )
}
