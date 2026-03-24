/**
 * Email Utility Library
 *
 * メール送信ユーティリティ
 * - 開発環境: Ethereal Email（実際のメール受信テスト）
 * - 本番環境: SendGrid または AWS SES
 * - Contact Form メール送信
 * - Sample Request メール送信
 * - 管理者通知メール送信
 * - XSS対策（sanitize-html）
 * - Japanese Business Email Templates
 */

import * as nodemailer from 'nodemailer';
import sanitizeHtml from 'sanitize-html';
import {
  renderEmailTemplate,
  createRecipient,
  type EmailTemplateType,
  type EmailRecipient,
  type WelcomeEmailData,
  type ApprovalEmailData,
  type RejectionEmailData,
  type QuoteCreatedEmailData,
  type OrderStatusEmailData,
  type ShipmentEmailData,
  type KoreaDataTransferEmailData,
  type KoreaCorrectionNotificationEmailData,
  type SpecSheetApprovalEmailData,
  type SpecSheetRejectionEmailData,
  type SignatureRequestEmailData,
  type SignatureCompletedEmailData,
  type SignatureDeclinedEmailData,
  type SignatureReminderEmailData,
  type ShippingStatusEmailData,
  type DeliveryCompletionEmailData,
  type InvoiceEmailData,
  type KoreaDesignerDataNotificationEmailData,
  type CorrectionReadyForReviewEmailData,
  type CorrectionRejectedEmailData,
  type SampleRequestEmailData as TemplateSampleRequestEmailData,
} from './email-templates';

// Re-export createRecipient for external use
export { createRecipient } from './email-templates';

// =====================================================
// Security: HTML Sanitization Helper
// =====================================================

/**
 * ユーザー入力を安全にエスケープしてXSS対策
 * 改行は<br>タグに変換するが、その他のHTMLタグはすべて削除
 */
function sanitizeUserMessage(message: string): string {
  // 1段階: すべてのHTMLタグを削除
  const clean = sanitizeHtml(message, {
    allowedTags: [],
    allowedAttributes: {},
  });

  // 2段階: 改行を<br>タグに変換（エスケープ後は安全）
  return clean.replace(/\n/g, '<br>');
}

// =====================================================
// Configuration
// =====================================================

// Email Settings
const FROM_EMAIL = process.env.FROM_EMAIL || 'info@package-lab.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@package-lab.com';

// 環境別戦略自動選択
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// =====================================================
// Transporter 생성 (환경별)
// =====================================================

let transporter: nodemailer.Transporter | null = null;
let transportType: 'ethereal' | 'sendgrid' | 'aws-ses' | 'xserver' | 'console' = 'console';

/**
 * 開発用: Ethereal Email Transporter
 * 実際のメールでテスト送信可能（https://ethereal.email）
 */
async function createEtherealTransporter() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transport = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('[Email] Ethereal Email initialized:', {
      user: testAccount.user,
      url: `https://ethereal.email/messages/${testAccount.user}`
    });

    return { transport, testAccount };
  } catch (error) {
    console.error('[Email] Ethereal initialization failed:', error);
    return null;
  }
}

/**
 * 本番用: SendGrid Transporter
 */
function createSendGridTransporter() {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const SENDGRID_HOST = process.env.SENDGRID_SMTP_HOST || 'smtp.sendgrid.net';
  const SENDGRID_PORT = parseInt(process.env.SENDGRID_SMTP_PORT || '587');

  if (!SENDGRID_API_KEY || SENDGRID_API_KEY === 'SG.placeholder' || SENDGRID_API_KEY === '') {
    console.warn('[Email] SendGrid not configured');
    return null;
  }

  return nodemailer.createTransport({
    host: SENDGRID_HOST,
    port: SENDGRID_PORT,
    secure: false,
    auth: {
      user: 'apikey',
      pass: SENDGRID_API_KEY,
    },
  });
}

/**
 * 本番用: AWS SES Transporter（バックアップ）
 */
function createAwsSesTransporter() {
  const AWS_SES_SMTP_USERNAME = process.env.AWS_SES_SMTP_USERNAME;
  const AWS_SES_SMTP_PASSWORD = process.env.AWS_SES_SMTP_PASSWORD;
  const AWS_SES_SMTP_HOST = process.env.AWS_SES_SMTP_HOST || 'email-smtp.ap-northeast-1.amazonaws.com';
  const AWS_SES_SMTP_PORT = parseInt(process.env.AWS_SES_SMTP_PORT || '587');

  if (!AWS_SES_SMTP_USERNAME || !AWS_SES_SMTP_PASSWORD ||
      AWS_SES_SMTP_USERNAME === 'AKIAIOSFODNN7EXAMPLE' ||
      AWS_SES_SMTP_PASSWORD === 'placeholder') {
    return null;
  }

  return nodemailer.createTransport({
    host: AWS_SES_SMTP_HOST,
    port: AWS_SES_SMTP_PORT,
    secure: false,
    auth: {
      user: AWS_SES_SMTP_USERNAME,
      pass: AWS_SES_SMTP_PASSWORD,
    },
  });
}

/**
 * 本番用: XServer SMTP Transporter（日本ホスティング）
 * SUPABASE_SMTP_* または XSERVER_SMTP_* 環境変数を使用
 */
function createXServerTransporter() {
  // SUPABASE_SMTP_* または XSERVER_SMTP_* のどちらかを使う
  const SMTP_HOST = process.env.SUPABASE_SMTP_HOST || process.env.XSERVER_SMTP_HOST;
  const SMTP_PORT = parseInt(process.env.SUPABASE_SMTP_PORT || process.env.XSERVER_SMTP_PORT || '587');
  const SMTP_USER = process.env.SUPABASE_SMTP_USER || process.env.XSERVER_SMTP_USER;
  const SMTP_PASSWORD = process.env.SUPABASE_SMTP_PASSWORD || process.env.XSERVER_SMTP_PASSWORD;

  // SMTP設定がない場合はnullを返す
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // 465ならSSL、587ならTLS
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
    // XServerはTLSを推奨
    tls: {
      rejectUnauthorized: false // 開発環境では証明書検証を緩和
    }
  });
}

// =====================================================
// 初期化（環境別自動選択）
// =====================================================

let etherealTestAccount: NonNullable<Awaited<ReturnType<typeof createEtherealTransporter>>>['testAccount'] | null = null;

async function initializeTransporter() {
  if (isDevelopment) {
    // 開発環境: XServer優先（実際のメールテスト用）
    console.log('[Email] Development mode - configuring email service');

    // 1. XServer SMTP（日本ホスティング）
    transporter = createXServerTransporter();
    if (transporter) {
      transportType = 'xserver';
      console.log('[Email] XServer SMTP initialized (development)');
      return;
    }

    // 2. Ethereal Email（バックアップ）
    console.log('[Email] XServer not configured - using Ethereal Email');
    const result = await createEtherealTransporter();
    if (result) {
      transporter = result.transport;
      etherealTestAccount = result.testAccount;
      transportType = 'ethereal';
      return;
    }

    // Fallback: Console出力
    console.warn('[Email] No email service configured - using console fallback');
    transportType = 'console';
    return;
  }

  if (isProduction) {
    // 本番: XServer優先 → SendGrid → AWS SESバックアップ
    console.log('[Email] Production mode - configuring email service');

    // 1. XServer SMTP（日本ホスティング）
    transporter = createXServerTransporter();
    if (transporter) {
      transportType = 'xserver';
      console.log('[Email] XServer SMTP initialized');
      return;
    }

    // 2. SendGrid（国際クラウド）
    transporter = createSendGridTransporter();
    if (transporter) {
      transportType = 'sendgrid';
      console.log('[Email] SendGrid initialized (fallback)');
      return;
    }

    // 3. AWS SES（国際クラウドバックアップ）
    transporter = createAwsSesTransporter();
    if (transporter) {
      transportType = 'aws-ses';
      console.log('[Email] AWS SES initialized (fallback)');
      return;
    }

    console.warn('[Email] No email service configured - using console fallback');
    transportType = 'console';
  }
}

// 初期化実行
initializeTransporter();

// =====================================================
// Types
// =====================================================

export interface ContactEmailData {
  name: string;
  email: string;
  company?: string;
  inquiryType: string;
  subject: string;
  message: string;
  urgency?: string;
  preferredContact?: string;
  phone?: string;
  fax?: string;
  postalCode?: string;
  address?: string;
}

export interface SampleRequestEmailData {
  requestId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company?: string;
  samples: Array<{
    productName: string;
    quantity: number;
  }>;
  deliveryType: string;
  deliveryDestinations: Array<{
    companyName?: string;
    contactPerson: string;
    phone: string;
    address: string;
  }>;
  message: string;
}

export interface AdminNotificationData {
  type: 'contact' | 'sample_request';
  requestId: string;
  timestamp: string;
  data: ContactEmailData | SampleRequestEmailData;
}

// =====================================================
// Email Templates
// =====================================================

/**
 * Contact Form メールテンプレート（顧客用）
 */
const getContactConfirmationEmail = (data: ContactEmailData) => ({
  to: data.email,
  from: FROM_EMAIL,
  subject: '【Epackage Lab】お問い合わせありがとうございます',
  text: `
${data.company ? data.company + '\n' : ''}${data.name} 様

お問い合わせいただきありがとうございます。
以下の内容でお問い合わせを受け付けました。

================================
お問い合わせ内容
================================

【お問い合わせ種類】${data.inquiryType}
【件名】${data.subject}
【おしい内容】
${sanitizeUserMessage(data.message)}

--------------------------------
お問い合わせ者情報
--------------------------------
【お名前】${data.name}
【メールアドレス】${data.email}
${data.company ? `【会社名】${data.company}\n` : ''}${data.urgency ? `【緊急度】${data.urgency}\n` : ''}${data.preferredContact ? `【ご希望の連絡方法】${data.preferredContact}\n` : ''}

================================
担当者より折り返しご連絡させていただきます。
今しばらくお待ちください。
================================

Epackage Lab
https://epackage-lab.com

※このメールはシステムによる自動送信です。
  `.trim(),
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .label { color: #666; font-size: 14px; margin-bottom: 5px; }
    .value { color: #333; font-size: 16px; margin-bottom: 15px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">お問い合わせありがとうございます</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0;">
        ${data.company ? `<strong>${data.company}</strong><br>` : ''}<strong>${data.name}</strong> 様
      </p>
      <p>お問い合わせいただきありがとうございます。<br>以下の内容でお問い合わせを受け付けました。</p>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #667eea;">お問い合わせ内容</h3>
        <div class="label">お問い合わせ種類</div>
        <div class="value">${data.inquiryType}</div>

        <div class="label">件名</div>
        <div class="value">${data.subject}</div>

        <div class="label">お問い合わせ内容</div>
        <div class="value" style="white-space: pre-wrap; background: #f3f4f6; padding: 15px; border-radius: 4px;">${sanitizeUserMessage(data.message)}</div>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #667eea;">お問い合わせ者情報</h3>
        <div class="label">お名前</div>
        <div class="value">${data.name}</div>

        <div class="label">メールアドレス</div>
        <div class="value">${data.email}</div>
        ${data.company ? `<div class="label">会社名</div><div class="value">${data.company}</div>` : ''}
        ${data.urgency ? `<div class="label">緊急度</div><div class="value">${data.urgency}</div>` : ''}
        ${data.preferredContact ? `<div class="label">ご希望の連絡方法</div><div class="value">${data.preferredContact}</div>` : ''}
      </div>

      <p style="text-align: center; color: #667eea; font-weight: bold;">担当者より折り返しご連絡させていただきます。<br>今しばらくお待ちください。</p>
    </div>
    <div class="footer">
      <p>Epackage Lab<br>https://epackage-lab.com</p>
      <p style="font-size: 11px; color: #999;">※このメールはシステムによる自動送信です。</p>
    </div>
  </div>
</body>
</html>
  `.trim()
});

/**
 * Contact Form 管理者通知メール
 */
const getContactAdminNotificationEmail = (data: ContactEmailData & { requestId: string }) => ({
  to: ADMIN_EMAIL,
  from: FROM_EMAIL,
  replyTo: data.email, // 返信先を顧客のメールアドレスに設定
  subject: `【新規お問い合わせ】${data.subject} - ${data.name}`,
  text: `
新しいお問い合わせがありました。

================================
お問い合わせ情報
================================

【リクエストID】${data.requestId}
【お問い合わせ種類】${data.inquiryType}
【緊急度】${data.urgency || '通常'}

--------------------------------
お客様情報
--------------------------------
【お名前】${data.name}
【メールアドレス】${data.email}
【電話番号】${data.phone || '未入力'}
${data.fax ? `【FAX】${data.fax}\n` : ''}${data.company ? `【会社名】${data.company}\n` : ''}${data.postalCode ? `【郵便番号】${data.postalCode}\n` : ''}${data.address ? `【住所】${data.address}\n` : ''}【ご希望の連絡方法】${data.preferredContact || '未指定'}

--------------------------------
お問い合わせ内容
--------------------------------
【件名】${data.subject}

${sanitizeUserMessage(data.message)}

================================
Epackage Lab 管理画面
================================
  `.trim(),
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box { background: #f9fafb; padding: 20px; margin: 15px 0; border-radius: 8px; }
    .label { color: #666; font-size: 13px; font-weight: bold; margin-bottom: 5px; }
    .value { color: #333; font-size: 15px; margin-bottom: 12px; }
    .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <strong>⚠️ 新規お問い合わせ通知</strong>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0;">お問い合わせ情報</h3>
      <div class="label">リクエストID</div>
      <div class="value"><code>${data.requestId}</code></div>

      <div class="label">お問い合わせ種類</div>
      <div class="value">${data.inquiryType}</div>

      <div class="label">緊急度</div>
      <div class="value">${data.urgency || '通常'}</div>
    </div>

    <div class="info-box">
      <h3>お客様情報</h3>
      <div class="label">お名前</div>
      <div class="value">${data.name}</div>

      <div class="label">メールアドレス</div>
      <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>

      <div class="label">電話番号</div>
      <div class="value">${data.phone || '未入力'}</div>

      ${data.fax ? `<div class="label">FAX</div><div class="value">${data.fax}</div>` : ''}
      ${data.company ? `<div class="label">会社名</div><div class="value">${data.company}</div>` : ''}
      ${data.postalCode ? `<div class="label">郵便番号</div><div class="value">${data.postalCode}</div>` : ''}
      ${data.address ? `<div class="label">住所</div><div class="value">${data.address}</div>` : ''}
      ${data.preferredContact ? `<div class="label">ご希望の連絡方法</div><div class="value">${data.preferredContact}</div>` : ''}
    </div>

    <div class="info-box">
      <h3>お問い合わせ内容</h3>
      <div class="label">件名</div>
      <div class="value"><strong>${data.subject}</strong></div>

      <div class="label">内容</div>
      <div class="value" style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">${sanitizeUserMessage(data.message)}</div>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="mailto:${data.email}" class="button">メールで返信</a>
    </div>
  </div>
</body>
</html>
  `.trim()
});

/**
 * Sample Request メールテンプレート（顧客用）
 */
const getSampleRequestConfirmationEmail = (data: SampleRequestEmailData) => {
  const samplesList = data.samples.map((s, i) =>
    `${i + 1}. ${s.productName} x ${s.quantity}点`
  ).join('\n');

  const deliveryList = data.deliveryDestinations.map((d, i) =>
    `${i + 1}. ${d.companyName ? d.companyName + ' ' : ''}${d.contactPerson} 様\n   電話: ${d.phone}\n   住所: ${d.address}`
  ).join('\n\n');

  return {
    to: data.customerEmail,
    from: FROM_EMAIL,
    subject: '【Epackage Lab】サンプルリクエストを受け付けました',
    text: `
${data.company ? data.company + '\n' : ''}${data.customerName} 様

サンプルリクエストをお申込みいただきありがとうございます。
以下の内容でお受け付けいたしました。

================================
リクエストID: ${data.requestId}
================================

【ご依頼内容】
${samplesList}

【配送先】
${deliveryList}

【お問い合わせ内容】
${sanitizeUserMessage(data.message)}

================================
担当者より折り返しご連絡させていただきます。
================================

Epackage Lab
https://epackage-lab.com
  `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f093fb; }
    .sample-item { background: #fdf2f8; padding: 12px; margin: 8px 0; border-radius: 4px; }
    .delivery-item { background: #fef3c7; padding: 12px; margin: 8px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">サンプルリクエストを受け付けました</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0;">
        ${data.company ? `<strong>${data.company}</strong><br>` : ''}<strong>${data.customerName}</strong> 様
      </p>
      <p>サンプルリクエストをお申込みいただきありがとうございます。<br>以下の内容でお受け付けいたしました。</p>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #f093fb;">リクエストID: ${data.requestId}</h3>
        <div class="label" style="color: #666;">ご依頼内容</div>
        ${data.samples.map((s, i) => `
          <div class="sample-item">
            <strong>${i + 1}. ${s.productName}</strong> x ${s.quantity}点
          </div>
        `).join('')}
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #f093fb;">配送先</h3>
        ${data.deliveryDestinations.map((d, i) => `
          <div class="delivery-item">
            <strong>${i + 1}. ${d.companyName ? d.companyName + ' ' : ''}${d.contactPerson} 様</strong><br>
            <span style="color: #666; font-size: 14px;">
              電話: ${d.phone}<br>
              住所: ${d.address}
            </span>
          </div>
        `).join('')}
      </div>

      ${data.message ? `
      <div class="info-box">
        <h3 style="margin-top: 0;">お問い合わせ内容</h3>
        <div style="white-space: pre-wrap; background: #f3f4f6; padding: 15px; border-radius: 4px;">${sanitizeUserMessage(data.message)}</div>
      </div>
      ` : ''}

      <p style="text-align: center; color: #f093fb; font-weight: bold;">担当者より折り返しご連絡させていただきます。<br>今しばらくお待ちください。</p>
    </div>
    <div class="footer">
      <p>Epackage Lab<br>https://epackage-lab.com</p>
    </div>
  </div>
</body>
</html>
  `.trim()
  };
};

/**
 * Sample Request 管理者通知メール
 */
const getSampleRequestAdminNotificationEmail = (data: SampleRequestEmailData) => {
  const samplesList = data.samples && data.samples.length > 0
    ? data.samples.map((s, i) => `${i + 1}. ${s.productName} x ${s.quantity}点`).join('\n')
    : '（標準サンプルセット）';

  return {
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject: `【サンプルリクエスト】${data.customerName} - ${data.requestId}`,
    text: `
新しいサンプルリクエストがありました。

================================
リクエスト情報
================================

【リクエストID】${data.requestId}
【お客様名】${data.customerName}
【会社名】${data.company || '個人'}
【メール】${data.customerEmail}
【電話】${data.customerPhone}

【ご依頼内容】
${samplesList}

【配送タイプ】${data.deliveryType}

【配送先】
${data.deliveryDestinations.map((d, i) =>
  `${i + 1}. ${d.companyName ? d.companyName + ' ' : ''}${d.contactPerson} 様\n   電話: ${d.phone}\n   住所: ${d.address}`
).join('\n\n')}

【お問い合わせ内容】
${data.message || 'なし'}
  `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #fce7f3; border-left: 4px solid #f093fb; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box { background: #f9fafb; padding: 20px; margin: 15px 0; border-radius: 8px; }
    .label { color: #666; font-size: 13px; font-weight: bold; margin-bottom: 5px; }
    .value { color: #333; font-size: 15px; margin-bottom: 12px; }
    .sample-item { background: #fdf2f8; padding: 10px; margin: 5px 0; border-radius: 4px; }
    .delivery-item { background: #fef3c7; padding: 10px; margin: 5px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <strong>🎁 新規サンプルリクエスト</strong>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0;">リクエスト情報</h3>
      <div class="label">リクエストID</div>
      <div class="value"><code>${data.requestId}</code></div>

      <div class="label">お客様名</div>
      <div class="value">${data.customerName}</div>

      <div class="label">会社名</div>
      <div class="value">${data.company || '個人'}</div>

      <div class="label">連絡先</div>
      <div class="value">
        <a href="mailto:${data.customerEmail}">${data.customerEmail}</a><br>
        <a href="tel:${data.customerPhone}">${data.customerPhone}</a>
      </div>
    </div>

    <div class="info-box">
      <h3>ご依頼内容</h3>
      ${data.samples && data.samples.length > 0 ? data.samples.map((s, i) => `
        <div class="sample-item">
          <strong>${i + 1}. ${s.productName}</strong> x ${s.quantity}点
        </div>
      `).join('') : '<div class="sample-item">標準サンプルセット（6種類）</div>'}
    </div>

    <div class="info-box">
      <h3>配送情報</h3>
      <div class="label">配送タイプ</div>
      <div class="value">${data.deliveryType}</div>

      <div class="label">配送先</div>
      ${data.deliveryDestinations.map((d, i) => `
        <div class="delivery-item">
          <strong>${i + 1}. ${d.companyName ? d.companyName + ' ' : ''}${d.contactPerson} 様</strong><br>
          <span style="color: #666; font-size: 14px;">
            電話: <a href="tel:${d.phone}">${d.phone}</a><br>
            住所: ${d.address}
          </span>
        </div>
      `).join('')}
    </div>

    ${data.message ? `
    <div class="info-box">
      <h3>お問い合わせ内容</h3>
      <div style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">${sanitizeUserMessage(data.message)}</div>
    </div>
    ` : ''}
  </div>
</body>
</html>
  `.trim()
  };
};

// =====================================================
// Email Sending Functions
// =====================================================

/**
 * メール送信（環境別自動分岐）
 */
async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string
): Promise<{ success: boolean; error?: string; messageId?: string; previewUrl?: string }> {
  // Consoleモード（Fallback）
  if (transportType === 'console' || !transporter) {
    console.log('[Email] Console mode - Email content:');
    console.log('='.repeat(60));
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('Text:', text);
    console.log('HTML:', html);
    console.log('='.repeat(60));

    return {
      success: true,
      messageId: `console-${Date.now()}`
    };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      // Send both text and HTML parts for proper Japanese email support
      text,
      html,
      // Explicit UTF-8 encoding for Japanese character support
      encoding: 'utf-8',
      // Ensure proper MIME headers for Japanese
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });

    const result: { success: boolean; error?: string; messageId?: string; previewUrl?: string } = {
      success: true,
      messageId: info.messageId
    };

    // Etherealの場合はpreview URLを提供
    if (transportType === 'ethereal' && nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        result.previewUrl = previewUrl;
        console.log('[Email] Ethereal preview URL:', result.previewUrl);
      }
    }

    console.log('[Email] Email sent successfully:', {
      transportType,
      to,
      subject,
      messageId: info.messageId
    });

    return result;
  } catch (error: any) {
    console.error('[Email] Send error:', {
      transportType,
      message: error.message,
      code: error.code
    });

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Contact Form メール送信（顧客 + 管理者）
 */
export async function sendContactEmail(data: ContactEmailData & { requestId: string }): Promise<{
  success: boolean;
  customerEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  adminEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  previewUrl?: string; // Ethereal preview URL (개발용)
  errors: string[];
}> {
  const errors: string[] = [];
  const results: {
    customerEmail?: { success: boolean; messageId?: string; previewUrl?: string };
    adminEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  } = {};

  // 顧客確認メール
  const customerEmailParams = getContactConfirmationEmail(data);
  const customerResult = await sendEmail(
    customerEmailParams.to,
    customerEmailParams.subject,
    customerEmailParams.text,
    customerEmailParams.html
  );
  results.customerEmail = {
    success: customerResult.success,
    messageId: customerResult.messageId,
    previewUrl: customerResult.previewUrl
  };

  if (!customerResult.success) {
    errors.push(`顧客メール送信失敗: ${customerResult.error}`);
  }

  // 管理者通知メール
  const adminEmailParams = getContactAdminNotificationEmail(data);
  const adminResult = await sendEmail(
    adminEmailParams.to,
    adminEmailParams.subject,
    adminEmailParams.text,
    adminEmailParams.html
  );
  results.adminEmail = {
    success: adminResult.success,
    messageId: adminResult.messageId,
    previewUrl: adminResult.previewUrl
  };

  if (!adminResult.success) {
    errors.push(`管理者メール送信失敗: ${adminResult.error}`);
  }

  return {
    success: errors.length === 0,
    previewUrl: customerResult.previewUrl || adminResult.previewUrl,
    ...results,
    errors
  };
}

/**
 * Sample Request メール送信（顧客 + 管理者）
 * テンプレートシステムを使用して日本語エンコーディングを正しく処理
 */
export async function sendSampleRequestEmail(data: SampleRequestEmailData): Promise<{
  success: boolean;
  customerEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  adminEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  previewUrl?: string; // Ethereal preview URL (개발용)
  errors: string[];
}> {
  const errors: string[] = [];
  const results: {
    customerEmail?: { success: boolean; messageId?: string; previewUrl?: string };
    adminEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  } = {};

  // 顧客確認メール - テンプレートシステムを使用
  const customerRecipient: EmailRecipient = {
    name: data.customerName,
    email: data.customerEmail,
    company: data.company
  };

  const customerData: TemplateSampleRequestEmailData = {
    recipient: customerRecipient,
    requestId: data.requestId,
    samples: data.samples,
    deliveryDestinations: data.deliveryDestinations,
    message: data.message
  };

  const customerResult = await sendTemplatedEmail('sample_request_customer', customerData, customerRecipient);
  results.customerEmail = {
    success: customerResult.success,
    messageId: customerResult.messageId,
    previewUrl: customerResult.previewUrl
  };

  if (!customerResult.success) {
    errors.push(`顧客メール送信失敗: ${customerResult.error}`);
  }

  // 管理者通知メール - テンプレートシステムを使用
  const adminRecipient: EmailRecipient = {
    name: '管理者',
    email: ADMIN_EMAIL
  };

  const adminData: TemplateSampleRequestEmailData = {
    recipient: adminRecipient,
    requestId: data.requestId,
    samples: data.samples,
    deliveryDestinations: data.deliveryDestinations,
    message: data.message
  };

  const adminResult = await sendTemplatedEmail('sample_request_admin', adminData, adminRecipient);
  results.adminEmail = {
    success: adminResult.success,
    messageId: adminResult.messageId,
    previewUrl: adminResult.previewUrl
  };

  if (!adminResult.success) {
    errors.push(`管理者メール送信失敗: ${adminResult.error}`);
  }

  return {
    success: errors.length === 0,
    previewUrl: customerResult.previewUrl || adminResult.previewUrl,
    ...results,
    errors
  };
}

// =====================================================
// Work Order Email Types
// =====================================================

export interface WorkOrderData {
  workOrderId: string;
  workOrderNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  estimatedCompletion: string;
  productionTimeline: {
    total_days: number;
    steps: Array<{
      step: string;
      name_ja: string;
      name_en: string;
      duration_days: number;
    }>;
  };
  materialRequirements: Array<{
    material_name: string;
    quantity: number;
    unit: string;
  }>;
  items: Array<{
    product_name: string;
    quantity: number;
  }>;
}

// =====================================================
// Work Order Email Templates
// =====================================================

/**
 * Work Order Customer Notification Email
 */
const getWorkOrderCustomerEmail = (data: WorkOrderData) => {
  const itemsList = data.items.map((item, i) =>
    `${i + 1}. ${item.product_name} x ${item.quantity.toLocaleString()}点`
  ).join('\n');

  const completionDate = new Date(data.estimatedCompletion);
  const formattedDate = completionDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    to: data.customerEmail,
    from: FROM_EMAIL,
    subject: `【製造開始】作業指示書発行のお知らせ ${data.workOrderNumber}`,
    text: `
${data.customerName} 様

平素はEpackage Labをご利用いただきありがとうございます。
この度、ご注文いただいた製品の製造を開始いたしました。

================================
作業指示書番号: ${data.workOrderNumber}
================================

【ご注文番号】${data.orderNumber}

【製造予定アイテム】
${itemsList}

【納品予定日】${formattedDate}

【製造工程】
${data.productionTimeline.steps.map((s, i) =>
  `${i + 1}. ${s.name_ja} (${s.duration_days}日間)`
).join('\n')}

================================
製造完了次第、配送の手配をさせていただきます。
================================

Epackage Lab
https://epackage-lab.com

※このメールはシステムによる自動送信です。
  `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
    .label { color: #666; font-size: 14px; margin-bottom: 5px; }
    .value { color: #333; font-size: 16px; margin-bottom: 15px; }
    .step-item { background: #ecfdf5; padding: 12px; margin: 8px 0; border-radius: 4px; border-left: 3px solid #10b981; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">製造開始のお知らせ</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0;"><strong>${data.customerName}</strong> 様</p>
      <p>平素はEpackage Labをご利用いただきありがとうございます。<br>この度、ご注文いただいた製品の製造を開始いたしました。</p>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #10b981;">作業指示書番号: ${data.workOrderNumber}</h3>
        <div class="label">ご注文番号</div>
        <div class="value"><code>${data.orderNumber}</code></div>

        <div class="label">製造予定アイテム</div>
        ${data.items.map((item, i) => `
          <div style="background: #f0fdf4; padding: 10px; margin: 5px 0; border-radius: 4px;">
            <strong>${i + 1}. ${item.product_name}</strong> x ${item.quantity.toLocaleString()}点
          </div>
        `).join('')}

        <div class="label">納品予定日</div>
        <div class="value" style="color: #10b981; font-weight: bold; font-size: 18px;">
          ${formattedDate}
        </div>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #10b981;">製造工程</h3>
        ${data.productionTimeline.steps.map((s, i) => `
          <div class="step-item">
            <strong>${i + 1}. ${s.name_ja}</strong>
            <span style="color: #666; font-size: 14px;">(${s.duration_days}日間)</span>
          </div>
        `).join('')}
      </div>

      <p style="text-align: center; color: #10b981; font-weight: bold;">製造完了次第、配送の手配をさせていただきます。</p>
    </div>
    <div class="footer">
      <p>Epackage Lab<br>https://epackage-lab.com</p>
      <p style="font-size: 11px; color: #999;">※このメールはシステムによる自動送信です。</p>
    </div>
  </div>
</body>
</html>
  `.trim()
  };
};

/**
 * Work Order Production Team Notification Email
 */
const getWorkOrderProductionTeamEmail = (data: WorkOrderData) => {
  const itemsList = data.items.map((item, i) =>
    `${i + 1}. ${item.product_name} x ${item.quantity.toLocaleString()}点`
  ).join('\n');

  const materialsList = data.materialRequirements.map((m, i) =>
    `${i + 1}. ${m.material_name}: ${m.quantity.toLocaleString()} ${m.unit}`
  ).join('\n');

  const completionDate = new Date(data.estimatedCompletion);
  const formattedDate = completionDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject: `【新作業指示】${data.workOrderNumber} - ${data.customerName}`,
    text: `
新しい作業指示書が発行されました。

================================
作業指示書詳細
================================

【作業指示書番号】${data.workOrderNumber}
【注文番号】${data.orderNumber}
【お客様名】${data.customerName}
【メールアドレス】${data.customerEmail}

【納品予定日】${formattedDate}（${data.productionTimeline.total_days}日後）

--------------------------------
製造アイテム
--------------------------------
${itemsList}

--------------------------------
材料要求
--------------------------------
${materialsList}

--------------------------------
製造工程
--------------------------------
${data.productionTimeline.steps.map((s, i) =>
  `${i + 1}. ${s.name_ja} - ${s.duration_days}日間`
).join('\n')}

================================
Epackage Lab 管理画面
================================
  `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box { background: #f9fafb; padding: 20px; margin: 15px 0; border-radius: 8px; }
    .label { color: #666; font-size: 13px; font-weight: bold; margin-bottom: 5px; }
    .value { color: #333; font-size: 15px; margin-bottom: 12px; }
    .step-item { background: #ecfdf5; padding: 10px; margin: 5px 0; border-radius: 4px; }
    .material-item { background: #fef3c7; padding: 10px; margin: 5px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <strong>🏭 新規作業指示通知</strong>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0;">作業指示書詳細</h3>
      <div class="label">作業指示書番号</div>
      <div class="value"><code>${data.workOrderNumber}</code></div>

      <div class="label">注文番号</div>
      <div class="value"><code>${data.orderNumber}</code></div>

      <div class="label">お客様名</div>
      <div class="value">${data.customerName}</div>

      <div class="label">メールアドレス</div>
      <div class="value"><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></div>

      <div class="label">納品予定日</div>
      <div class="value" style="color: #10b981; font-weight: bold;">
        ${formattedDate} <span style="color: #666; font-weight: normal;">（${data.productionTimeline.total_days}日後）</span>
      </div>
    </div>

    <div class="info-box">
      <h3>製造アイテム</h3>
      ${data.items.map((item, i) => `
        <div class="step-item">
          <strong>${i + 1}. ${item.product_name}</strong> x ${item.quantity.toLocaleString()}点
        </div>
      `).join('')}
    </div>

    <div class="info-box">
      <h3>材料要求</h3>
      ${data.materialRequirements.map((m, i) => `
        <div class="material-item">
          <strong>${i + 1}. ${m.material_name}</strong>: ${m.quantity.toLocaleString()} ${m.unit}
        </div>
      `).join('')}
    </div>

    <div class="info-box">
      <h3>製造工程</h3>
      ${data.productionTimeline.steps.map((s, i) => `
        <div class="step-item" style="border-left-color: #059669;">
          <strong>${i + 1}. ${s.name_ja}</strong>
          <span style="color: #666; font-size: 14px;">- ${s.duration_days}日間</span>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>
  `.trim()
  };
};

/**
 * Work Order Email Sending Functions
 */

/**
 * Send Work Order notifications (customer + production team)
 */
export async function sendWorkOrderEmails(data: WorkOrderData): Promise<{
  success: boolean;
  customerEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  productionTeamEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  previewUrl?: string;
  errors: string[];
}> {
  const errors: string[] = [];
  const results: {
    customerEmail?: { success: boolean; messageId?: string; previewUrl?: string };
    productionTeamEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  } = {};

  // Customer notification email
  const customerEmailParams = getWorkOrderCustomerEmail(data);
  const customerResult = await sendEmail(
    customerEmailParams.to,
    customerEmailParams.subject,
    customerEmailParams.text,
    customerEmailParams.html
  );
  results.customerEmail = {
    success: customerResult.success,
    messageId: customerResult.messageId,
    previewUrl: customerResult.previewUrl
  };

  if (!customerResult.success) {
    errors.push(`顧客メール送信失敗: ${customerResult.error}`);
  }

  // Production team notification email
  const productionEmailParams = getWorkOrderProductionTeamEmail(data);
  const productionResult = await sendEmail(
    productionEmailParams.to,
    productionEmailParams.subject,
    productionEmailParams.text,
    productionEmailParams.html
  );
  results.productionTeamEmail = {
    success: productionResult.success,
    messageId: productionResult.messageId,
    previewUrl: productionResult.previewUrl
  };

  if (!productionResult.success) {
    errors.push(`製造チームメール送信失敗: ${productionResult.error}`);
  }

  return {
    success: errors.length === 0,
    previewUrl: customerResult.previewUrl || productionResult.previewUrl,
    ...results,
    errors
  };
}

/**
 * メール設定状態確認
 */
export function getEmailConfigStatus(): {
  mode: string;
  transportType: string;
  configured: boolean;
  hasXServer: boolean;
  hasSendGrid: boolean;
  hasAwsSes: boolean;
  hasFromEmail: boolean;
  hasAdminEmail: boolean;
} {
  const SMTP_HOST = process.env.SUPABASE_SMTP_HOST || process.env.XSERVER_SMTP_HOST;
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const AWS_SES_SMTP_USERNAME = process.env.AWS_SES_SMTP_USERNAME;

  return {
    mode: isDevelopment ? 'development' : isProduction ? 'production' : 'unknown',
    transportType,
    configured: !!transporter && transportType !== 'console',
    hasXServer: !!SMTP_HOST,
    hasSendGrid: !!(SENDGRID_API_KEY && SENDGRID_API_KEY !== 'SG.placeholder'),
    hasAwsSes: !!(AWS_SES_SMTP_USERNAME && AWS_SES_SMTP_USERNAME !== 'AKIAIOSFODNN7EXAMPLE'),
    hasFromEmail: !!FROM_EMAIL,
    hasAdminEmail: !!ADMIN_EMAIL
  };
}

// =====================================================
// Japanese Business Email Template Integration
// =====================================================

/**
 * Send email using Japanese business templates
 */
export async function sendTemplatedEmail(
  type: EmailTemplateType,
  data:
    | WelcomeEmailData
    | ApprovalEmailData
    | RejectionEmailData
    | QuoteCreatedEmailData
    | OrderStatusEmailData
    | ShipmentEmailData
    | KoreaDataTransferEmailData
    | KoreaCorrectionNotificationEmailData
    | SpecSheetApprovalEmailData
    | SpecSheetRejectionEmailData
    | InvoiceEmailData
    | (InvoiceEmailData & { daysOverdue?: number })
    | TemplateSampleRequestEmailData,
  recipient: EmailRecipient
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  try {
    // Add recipient to data
    const templateData = {
      ...data,
      recipient,
    } as typeof data;

    // Render template
    const template = renderEmailTemplate(type, templateData);

    // Send email
    return await sendEmail(
      recipient.email,
      template.subject,
      template.text,
      template.html
    );
  } catch (error: any) {
    console.error('[Email] Template error:', {
      type,
      message: error.message,
    });

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send welcome email to new customer
 */
export async function sendWelcomeEmail(
  recipient: EmailRecipient,
  options?: {
    loginUrl?: string;
    tempPassword?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: WelcomeEmailData = {
    recipient,
    ...options,
  };

  return sendTemplatedEmail('welcome_customer', data, recipient);
}

/**
 * Send approval notification
 */
export async function sendApprovalEmail(
  recipient: EmailRecipient,
  requestType: string,
  requestDetails: string,
  approvedBy: string,
  options?: {
    approvalDate?: string;
    nextSteps?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: ApprovalEmailData = {
    recipient,
    requestType,
    requestDetails,
    approvedBy,
    approvalDate: options?.approvalDate || new Date().toISOString(),
    nextSteps: options?.nextSteps,
  };

  return sendTemplatedEmail('approval_customer', data, recipient);
}

/**
 * Send rejection notification
 */
export async function sendRejectionEmail(
  recipient: EmailRecipient,
  requestType: string,
  rejectionReason: string,
  options?: {
    alternativeOptions?: string;
    contactInfo?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: RejectionEmailData = {
    recipient,
    requestType,
    rejectionReason,
    alternativeOptions: options?.alternativeOptions,
    contactInfo: options?.contactInfo,
  };

  return sendTemplatedEmail('rejection_customer', data, recipient);
}

/**
 * Send quote created notification
 */
export async function sendQuoteCreatedEmail(
  recipient: EmailRecipient,
  quoteInfo: QuoteCreatedEmailData['quoteInfo'],
  quoteUrl: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: QuoteCreatedEmailData = {
    recipient,
    quoteInfo,
    quoteUrl,
  };

  return sendTemplatedEmail('quote_created_customer', data, recipient);
}

/**
 * Send order status update
 */
export async function sendOrderStatusUpdateEmail(
  recipient: EmailRecipient,
  orderInfo: OrderStatusEmailData['orderInfo'],
  status: OrderStatusEmailData['status'],
  options?: {
    estimatedCompletion?: string;
    statusDetails?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: OrderStatusEmailData = {
    recipient,
    orderInfo,
    status,
    ...options,
  };

  return sendTemplatedEmail('order_status_update', data, recipient);
}

/**
 * Send shipment notification
 */
export async function sendShipmentNotificationEmail(
  recipient: EmailRecipient,
  orderInfo: ShipmentEmailData['orderInfo'],
  shipmentInfo: ShipmentEmailData['shipmentInfo'],
  options?: {
    trackingUrl?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: ShipmentEmailData = {
    recipient,
    orderInfo,
    shipmentInfo,
    ...options,
  };

  return sendTemplatedEmail('shipment_notification', data, recipient);
}

/**
 * Send admin notification for new order
 */
export async function sendAdminNewOrderEmail(
  orderInfo: OrderStatusEmailData['orderInfo'],
  customerInfo: {
    name: string;
    email: string;
    company?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: OrderStatusEmailData = {
    recipient: createRecipient(customerInfo.name, customerInfo.email, customerInfo.company),
    orderInfo,
    status: 'processing',
  };

  return sendTemplatedEmail('admin_new_order', data, createRecipient('Admin', ADMIN_EMAIL));
}

/**
 * Send admin notification for quote request
 */
export async function sendAdminQuoteRequestEmail(
  quoteInfo: QuoteCreatedEmailData['quoteInfo'],
  customerInfo: {
    name: string;
    email: string;
    company?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const data: QuoteCreatedEmailData = {
    recipient: createRecipient(customerInfo.name, customerInfo.email, customerInfo.company),
    quoteInfo,
    quoteUrl: '', // Will be filled by system
  };

  return sendTemplatedEmail('admin_quote_request', data, createRecipient('Admin', ADMIN_EMAIL));
}

// =====================================================
// Korea Data Transfer Functions
// =====================================================

/**
 * Send design data to Korean partners via email
 *
 * 韓国パートナーにデザインデータメール送信
 * - AI抽出データをメール本文に含む
 * - 元ファイル添付（AIファイル、参照画像など）
 */
export async function sendKoreaDataTransferEmail(
  data: Omit<KoreaDataTransferEmailData, 'recipient'> & {
    recipient?: EmailRecipient;
  },
  koreaEmail: string = process.env.KOREA_PARTNER_EMAIL || 'korea@epackage-lab.com'
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  try {
    // Create Korea partner recipient
    const recipient = data.recipient || createRecipient(
      'Korea Partner Team',
      koreaEmail,
      'Epackage Korea'
    );

    // Prepare email data with recipient
    const emailData: KoreaDataTransferEmailData = {
      ...data,
      recipient,
    };

    // Render template
    const template = renderEmailTemplate('korea_data_transfer', emailData);

    // Send email
    return await sendEmail(
      koreaEmail,
      template.subject,
      template.text,
      template.html
    );
  } catch (error: any) {
    console.error('[Email] Korea data transfer error:', {
      message: error.message,
      orderId: data.orderId,
    });

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send design data to Korea with file attachments
 *
 * ファイル添付付き韓国データ送信
 * - nodemailer attachments使用
 * - Supabase StorageからファイルURL取得して添付
 */
export async function sendKoreaDataTransferWithAttachments(
  data: Omit<KoreaDataTransferEmailData, 'recipient'> & {
    recipient?: EmailRecipient;
  },
  attachmentData: Array<{
    filename: string;
    path?: string;  // Local file path (for development)
    content?: Buffer; // File content as Buffer
    href?: string;   // Public URL (for production)
  }>,
  koreaEmail: string = process.env.KOREA_PARTNER_EMAIL || 'korea@epackage-lab.com'
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  // Consoleモード（Fallback）
  if (transportType === 'console' || !transporter) {
    console.log('[Email] Console mode - Korea data transfer:');
    console.log('='.repeat(60));
    console.log(`To: ${koreaEmail}`);
    console.log(`Order ID: ${data.orderId}`);
    console.log(`Quotation: ${data.quotationNumber}`);
    console.log(`Attachments: ${attachmentData.length} files`);
    console.log('AI Data:', JSON.stringify(data.aiExtractedData, null, 2));
    console.log('='.repeat(60));

    return {
      success: true,
      messageId: `console-${Date.now()}`
    };
  }

  try {
    // Create Korea partner recipient
    const recipient = data.recipient || createRecipient(
      'Korea Partner Team',
      koreaEmail,
      'Epackage Korea'
    );

    // Prepare email data
    const emailData: KoreaDataTransferEmailData = {
      ...data,
      recipient,
    };

    // Render template
    const template = renderEmailTemplate('korea_data_transfer', emailData);

    // Prepare attachments for nodemailer
    const nodemailerAttachments = attachmentData
      .filter(att => att.path || att.content || att.href)
      .map(att => {
        if (att.content) {
          return {
            filename: att.filename,
            content: att.content,
          };
        } else if (att.path) {
          return {
            filename: att.filename,
            path: att.path,
          };
        } else {
          return {
            filename: att.filename,
            href: att.href!,
          };
        }
      });

    // Send email with attachments
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: koreaEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
      attachments: nodemailerAttachments,
    });

    const result: {
      success: boolean;
      error?: string;
      messageId?: string;
      previewUrl?: string;
    } = {
      success: true,
      messageId: info.messageId
    };

    // Etherealの場合はpreview URLを提供
    if (transportType === 'ethereal' && nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        result.previewUrl = previewUrl;
        console.log('[Email] Ethereal preview URL:', result.previewUrl);
      }
    }

    console.log('[Email] Korea data transfer sent successfully:', {
      transportType,
      to: koreaEmail,
      orderId: data.orderId,
      messageId: info.messageId,
      attachmentsCount: nodemailerAttachments.length,
    });

    return result;
  } catch (error: any) {
    console.error('[Email] Korea data transfer error:', {
      transportType,
      message: error.message,
      code: error.code,
      orderId: data.orderId,
    });

    return {
      success: false,
      error: error.message,
    };
  }
}

// =====================================================
// Korea Correction Notification (Customer)
// =====================================================

/**
 * Send Korea correction notification to customer
 * 韓国パートナー修正事項完了顧客通知
 */
export async function sendKoreaCorrectionNotificationEmail(
  data: Omit<KoreaCorrectionNotificationEmailData, 'recipient'> & { recipient?: EmailRecipient },
  customerEmail?: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  // If recipient is not provided, try to get it from customer email
  let recipient = data.recipient;

  if (!recipient && customerEmail) {
    recipient = createRecipient('Customer', customerEmail);
  }

  if (!recipient) {
    return {
      success: false,
      error: 'No recipient provided',
    };
  }

  const emailData: KoreaCorrectionNotificationEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('korea_correction_notification', emailData, recipient);
}

// =====================================================
// Spec Sheet Approval (Customer)
// =====================================================

/**
 * Send spec sheet approval notification
 * 仕様書承認通知送信
 */
export async function sendSpecSheetApprovalEmail(
  data: Omit<SpecSheetApprovalEmailData, 'recipient'> & { recipient?: EmailRecipient },
  customerEmail?: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  let recipient = data.recipient;

  if (!recipient && customerEmail) {
    recipient = createRecipient('Customer', customerEmail);
  }

  if (!recipient) {
    return {
      success: false,
      error: 'No recipient provided',
    };
  }

  const emailData: SpecSheetApprovalEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('spec_sheet_approval', emailData, recipient);
}

// =====================================================
// Spec Sheet Rejection (Admin)
// =====================================================

/**
 * Send spec sheet rejection notification to admin
 * 仕様書却下通知管理者に送信
 */
export async function sendSpecSheetRejectionEmail(
  data: Omit<SpecSheetRejectionEmailData, 'recipient'> & { recipient?: EmailRecipient },
  adminEmail?: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  let recipient = data.recipient;

  if (!recipient) {
    if (adminEmail) {
      recipient = createRecipient('Admin', adminEmail);
    } else {
      recipient = createRecipient('Admin', process.env.ADMIN_EMAIL || 'admin@epackage-lab.com');
    }
  }

  const emailData: SpecSheetRejectionEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('spec_sheet_rejection', emailData, recipient);
}

// =====================================================
// Signature Email Functions
// =====================================================

/**
 * Send signature request email to signer
 * 署名依頼メールを署名者に送信
 */
export async function sendSignatureRequestEmail(
  data: Omit<SignatureRequestEmailData, 'recipient'> & { recipient?: EmailRecipient },
  signerEmail: string,
  signerName: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const recipient = data.recipient || createRecipient(signerName, signerEmail);

  const emailData: SignatureRequestEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('signature_request', emailData, recipient);
}

/**
 * Send signature completion notification to all parties
 * 署名完了通知を全関係者に送信
 */
export async function sendSignatureCompletedEmail(
  data: Omit<SignatureCompletedEmailData, 'recipient'> & { recipient?: EmailRecipient },
  recipientEmail: string,
  recipientName: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const recipient = data.recipient || createRecipient(recipientName, recipientEmail);

  const emailData: SignatureCompletedEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('signature_completed', emailData, recipient);
}

/**
 * Send signature declined notification to admin
 * 署名拒否通知を管理者に送信
 */
export async function sendSignatureDeclinedEmail(
  data: Omit<SignatureDeclinedEmailData, 'recipient'> & { recipient?: EmailRecipient },
  adminEmail?: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  let recipient = data.recipient;

  if (!recipient) {
    if (adminEmail) {
      recipient = createRecipient('Admin', adminEmail);
    } else {
      recipient = createRecipient('Admin', process.env.ADMIN_EMAIL || 'admin@epackage-lab.com');
    }
  }

  const emailData: SignatureDeclinedEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('signature_declined', emailData, recipient);
}

/**
 * Send signature reminder email to pending signers
 * 署名リマインダーメールを未署名者に送信
 */
export async function sendSignatureReminderEmail(
  data: Omit<SignatureReminderEmailData, 'recipient'> & { recipient?: EmailRecipient },
  signerEmail: string,
  signerName: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  const recipient = data.recipient || createRecipient(signerName, signerEmail);

  const emailData: SignatureReminderEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('signature_reminder', emailData, recipient);
}

// =====================================================
// Shipping Status Email Functions
// =====================================================

/**
 * Send shipping status notification to customer
 * 配送状況通知メールを顧客に送信
 *
 * 配送状況の更新をお客様にお知らせするメールを送信します
 */
export async function sendShippingStatusEmail(
  data: Omit<ShippingStatusEmailData, 'recipient'> & { recipient?: EmailRecipient },
  customerEmail?: string,
  customerName?: string,
  customerCompany?: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  // If recipient is not provided, try to create it from customer info
  let recipient = data.recipient;

  if (!recipient && customerEmail && customerName) {
    recipient = createRecipient(customerName, customerEmail, customerCompany);
  }

  if (!recipient) {
    return {
      success: false,
      error: 'No recipient provided. Please provide either recipient object or customer email/name.',
    };
  }

  const emailData: ShippingStatusEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('shipping_status', emailData, recipient);
}

/**
 * Send delivery completion notification to customer
 * 配送完了通知メールを顧客に送信
 *
 * 商品が配送完了したことをお客様にお知らせするメールを送信します
 */
export async function sendDeliveryCompletionEmail(
  data: Omit<DeliveryCompletionEmailData, 'recipient'> & { recipient?: EmailRecipient },
  customerEmail?: string,
  customerName?: string,
  customerCompany?: string
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  // If recipient is not provided, try to create it from customer info
  let recipient = data.recipient;

  if (!recipient && customerEmail && customerName) {
    recipient = createRecipient(customerName, customerEmail, customerCompany);
  }

  if (!recipient) {
    return {
      success: false,
      error: 'No recipient provided. Please provide either recipient object or customer email/name.',
    };
  }

  const emailData: DeliveryCompletionEmailData = {
    ...data,
    recipient,
  };

  return sendTemplatedEmail('delivery_completion', emailData, recipient);
}
