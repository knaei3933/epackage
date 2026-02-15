/**
 * Japanese Business Email Templates System
 *
 * ビジネスメールテンプレートシステム
 * - 日本のビジネスマナーに基づいた丁寧な敬語表現
 * - HTMLとプレーンテキスト両対応
 * - レスポンシブデザイン
 * - 顧客向け・管理者向けテンプレート
 */

import sanitizeHtml from 'sanitize-html';

// =====================================================
// Types & Interfaces
// =====================================================

export interface EmailRecipient {
  name: string;
  email: string;
  company?: string;
}

export interface OrderInfo {
  orderId: string;
  orderDate: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface ShipmentInfo {
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  shippingAddress: string;
}

export interface QuoteInfo {
  quoteId: string;
  validUntil: string;
  totalAmount: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

export interface TemplateData {
  recipient: EmailRecipient;
  sender?: {
    name: string;
    email: string;
    title?: string;
  };
}

export interface WelcomeEmailData extends TemplateData {
  loginUrl?: string;
  tempPassword?: string;
}

export interface ApprovalEmailData extends TemplateData {
  requestType: string;
  requestDetails: string;
  approvedBy: string;
  approvalDate: string;
  nextSteps?: string;
}

export interface RejectionEmailData extends TemplateData {
  requestType: string;
  rejectionReason: string;
  alternativeOptions?: string;
  contactInfo?: string;
}

export interface QuoteCreatedEmailData extends TemplateData {
  quoteInfo: QuoteInfo;
  quoteUrl: string;
}

export interface OrderStatusEmailData extends TemplateData {
  orderInfo: OrderInfo;
  status: 'processing' | 'in_production' | 'quality_check' | 'ready' | 'delayed';
  estimatedCompletion?: string;
  statusDetails?: string;
}

export interface ShipmentEmailData extends TemplateData {
  orderInfo: OrderInfo;
  shipmentInfo: ShipmentInfo;
  trackingUrl?: string;
}

export interface KoreaCorrectionNotificationEmailData extends TemplateData {
  orderId: string;
  orderNumber: string;
  correctionDescription: string;
  correctedFiles: Array<{
    fileName: string;
    fileUrl: string;
  }>;
  correctionDate: string;
  notes?: string;
}

export interface SpecSheetApprovalEmailData extends TemplateData {
  specNumber: string;
  orderNumber: string;
  customerName: string;
  approvedAt: string;
  comments?: string;
}

export interface SpecSheetRejectionEmailData extends TemplateData {
  specNumber: string;
  orderNumber: string;
  customerName: string;
  reason: string;
  requestedChanges?: string[];
  rejectedAt: string;
}

// =====================================================
// Signature Email Templates
// =====================================================

export interface SignatureRequestEmailData extends TemplateData {
  documentTitle: string;
  envelopeId: string;
  signingUrl?: string;
  expiresAt: string;
  signers: Array<{
    name: string;
    email: string;
  }>;
  message?: string;
}

export interface SignatureCompletedEmailData extends TemplateData {
  documentTitle: string;
  envelopeId: string;
  completedAt: string;
  signers: Array<{
    name: string;
    email: string;
    signedAt: string;
  }>;
  documentUrl?: string;
}

export interface SignatureDeclinedEmailData extends TemplateData {
  documentTitle: string;
  envelopeId: string;
  declinedBy: string;
  declinedAt: string;
  reason?: string;
}

export interface SignatureReminderEmailData extends TemplateData {
  documentTitle: string;
  envelopeId: string;
  signingUrl: string;
  expiresAt: string;
  daysUntilExpiry: number;
}

/**
 * Shipping Status Email Data
 * 配送状況メールデータ
 */
export interface ShippingStatusEmailData extends TemplateData {
  orderNumber: string;
  trackingNumber: string;
  carrier: 'ems' | 'surface_mail' | 'sea_freight' | 'air_freight' | 'other';
  status: 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  message: string;
  trackingUrl?: string;
  japanPostUrl?: string;
  estimatedDelivery?: string;
  location?: string;
}

/**
 * Delivery Completion Email Data
 * 配送完了メールデータ
 */
export interface DeliveryCompletionEmailData extends TemplateData {
  orderNumber: string;
  shipmentNumber: string;
  trackingNumber: string;
  carrierName: string;
  carrier: 'yamato' | 'sagawa' | 'jp_post' | 'seino';
  deliveredAt: string;
  deliveredTo?: string;
  deliveryAddress?: {
    postalCode: string;
    prefecture: string;
    city: string;
    address: string;
    building?: string;
  };
  items?: Array<{
    productName: string;
    quantity: number;
  }>;
  deliveryNoteUrl?: string;
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Sanitize user input to prevent XSS attacks in HTML content
 * - Strips all HTML tags
 * - Converts newlines to <br>
 */
function sanitizeContent(content: string): string {
  const clean = sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return clean.replace(/\n/g, '<br>');
}

/**
 * Sanitize text content for plain text/subject lines
 * - Strips all HTML tags
 * - Preserves newlines for plain text
 * - Prevents XSS in email subjects and plain text bodies
 */
function sanitizeText(content: string): string {
  return sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

/**
 * Format Japanese date
 */
function formatDateJP(dateStr: string): string {
  const date = new Date(dateStr);
  const era = date.getFullYear() > 2019 ? '令和' : '平成';
  const year = date.getFullYear() - (date.getFullYear() > 2019 ? 2019 : 1989);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${era}${year}年${month}月${day}日`;
}

/**
 * Format currency in Japanese style
 */
function formatCurrencyJP(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}

/**
 * Generate common Japanese email header
 * - Sanitizes inputs to prevent XSS attacks
 */
function getJapaneseEmailHeader(
  recipientName: string,
  recipientCompany?: string
): string {
  const sanitizedName = sanitizeText(recipientName);
  const sanitizedCompany = recipientCompany ? sanitizeText(recipientCompany) : undefined;

  if (sanitizedCompany) {
    return `${sanitizedCompany}\n${sanitizedName} 様`;
  }
  return `${sanitizedName} 様`;
}

/**
 * Generate common Japanese email footer
 */
function getJapaneseEmailFooter(companyName = 'Epackage Lab'): string {
  const currentDate = new Date();
  return `
================================
${companyName}
兵庫県明石市上ノ丸2-11-21
電話: 050-1793-6500
Email: info@package-lab.com
https://epackage-lab.com

================================
${formatDateJP(currentDate.toISOString())}
  `.trim();
}

// =====================================================
// Template Type Definitions
// =====================================================

export type EmailTemplate = {
  subject: string;
  text: string;
  html: string;
};

export type EmailTemplateType =
  | 'welcome_customer'
  | 'approval_customer'
  | 'rejection_customer'
  | 'quote_created_customer'
  | 'order_status_update'
  | 'shipment_notification'
  | 'admin_new_order'
  | 'admin_quote_request'
  | 'admin_shipment_alert'
  | 'korea_data_transfer'
  | 'korea_correction_notification'
  | 'spec_sheet_approval'
  | 'spec_sheet_rejection'
  | 'signature_request'
  | 'signature_completed'
  | 'signature_declined'
  | 'signature_reminder'
  | 'shipping_status'
  | 'delivery_completion'
  | 'invoice_created'
  | 'invoice_reminder'
  | 'invoice_overdue'
  | 'payment_confirmation'
  | 'purchase_order_korea'
  | 'order_created_customer'
  | 'order_created_admin'
  | 'spec_rejected_admin'
  | 'production_started_customer'
  | 'shipping_info_customer'
  | 'archive_completed_admin'
  | 'korea_designer_data_notification'
  | 'correction_ready_for_review'
  | 'correction_rejected';

// =====================================================
// Welcome Email Templates
// =====================================================

/**
 * 新規会員登録歓迎メール（顧客向け）
 */
export function getWelcomeCustomerEmail(data: WelcomeEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: '【Epackage Lab】会員登録ありがとうございます',
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。
この度は、Epackage Labの会員登録を完了いただき、誠にありがとうございます。

会員登録が完了いたしましたことを、ご通知申し上げます。

================================
ご登録内容の確認
================================
【お名前】${data.recipient.name}
【メールアドレス】${data.recipient.email}
${data.recipient.company ? `【会社名】${data.recipient.company}` : ''}

${data.tempPassword ? `
================================
仮パスワードのお知らせ
================================
初期パスワードは以下の通りです。

${data.tempPassword}

※セキュリティのため、初回ログイン時に必ずパスワードの変更をお願いいたします。
` : ''}

================================
サービスのご案内
================================
Epackage Labでは、以下のサービスをご利用いただけます。

• 商品カタログ閲覧・検索
• サンプルリクエスト（最大5点まで）
• 見積依頼・注文管理
• 配送状況の確認

${data.loginUrl ? `
ログインは以下のURLからアクセスいただけます。

${data.loginUrl}
` : ''}

今後とも、Epackage Labをよろしくお願い申し上げます。

${footer}

※このメールはシステムによる自動送信です。
お問い合わせの際は、上記連絡先までご連絡ください。
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>会員登録ありがとうございます</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: bold;
      letter-spacing: 0.05em;
    }
    .header-subtitle {
      margin-top: 10px;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      line-height: 2;
      color: #555;
      margin-bottom: 30px;
    }
    .info-box {
      background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
      border-left: 4px solid #667eea;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .info-box-title {
      font-size: 18px;
      font-weight: bold;
      color: #667eea;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .info-item {
      margin-bottom: 15px;
      font-size: 15px;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      margin-bottom: 5px;
    }
    .info-value {
      color: #333;
      font-weight: 500;
    }
    .password-box {
      background: #fff3cd;
      border: 2px solid #ffc107;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      text-align: center;
    }
    .password-title {
      font-size: 16px;
      font-weight: bold;
      color: #856404;
      margin: 0 0 15px 0;
    }
    .password-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      letter-spacing: 0.1em;
      padding: 15px;
      background: white;
      border-radius: 4px;
      margin: 15px 0;
    }
    .service-list {
      background: #f8f9fa;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .service-list ul {
      margin: 15px 0;
      padding-left: 25px;
    }
    .service-list li {
      margin: 10px 0;
      font-size: 15px;
      color: #555;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 15px 40px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
    .footer-info {
      margin: 10px 0;
      line-height: 1.6;
    }
    .auto-notice {
      font-size: 12px;
      color: #999;
      margin-top: 20px;
    }
    @media only screen and (max-width: 600px) {
      .content { padding: 25px 20px; }
      .header { padding: 30px 20px; }
      .header h1 { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>会員登録ありがとうございます</h1>
      <div class="header-subtitle">Welcome to Epackage Lab</div>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
        <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

        平素より格別のご高配を賜り、厚く御礼申し上げます。<br>
        この度は、Epackage Labの会員登録を完了いただき、誠にありがとうございます。<br><br>

        会員登録が完了いたしましたことを、ご通知申し上げます。
      </div>

      <div class="info-box">
        <h3 class="info-box-title">ご登録内容の確認</h3>
        <div class="info-item">
          <div class="info-label">お名前</div>
          <div class="info-value">${sanitizeContent(data.recipient.name)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">メールアドレス</div>
          <div class="info-value">${sanitizeContent(data.recipient.email)}</div>
        </div>
        ${data.recipient.company ? `
        <div class="info-item">
          <div class="info-label">会社名</div>
          <div class="info-value">${sanitizeContent(data.recipient.company)}</div>
        </div>
        ` : ''}
      </div>

      ${data.tempPassword ? `
      <div class="password-box">
        <h3 class="password-title">⚠️ 仮パスワードのお知らせ</h3>
        <p style="margin: 10px 0; color: #856404;">初期パスワードは以下の通りです。</p>
        <div class="password-value">${sanitizeContent(data.tempPassword)}</div>
        <p style="margin: 15px 0 0 0; font-size: 13px; color: #856404;">
          ※セキュリティのため、初回ログイン時に必ずパスワードの変更をお願いいたします。
        </p>
      </div>
      ` : ''}

      <div class="service-list">
        <h3 class="info-box-title">サービスのご案内</h3>
        <p style="margin: 15px 0; color: #555;">Epackage Labでは、以下のサービスをご利用いただけます。</p>
        <ul>
          <li>商品カタログ閲覧・検索</li>
          <li>サンプルリクエスト（最大5点まで）</li>
          <li>見積依頼・注文管理</li>
          <li>配送状況の確認</li>
        </ul>
      </div>

      ${data.loginUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${sanitizeContent(data.loginUrl)}" class="cta-button">ログインはこちら</a>
        <p style="margin-top: 15px; font-size: 13px; color: #666;">
          上記ボタンからマイページにアクセスいただけます
        </p>
      </div>
      ` : ''}

      <div style="margin-top: 30px; text-align: center; color: #667eea; font-weight: bold;">
        今後とも、Epackage Labをよろしくお願い申し上げます。
      </div>
    </div>

    <div class="footer">
      <div class="footer-info">
        <strong>Epackage Lab</strong><br>
        兵庫県明石市上ノ丸2-11-21<br>
        電話: 050-1793-6500 | Email: info@package-lab.com<br>
        <a href="https://epackage-lab.com" style="color: #667eea; text-decoration: none;">https://epackage-lab.com</a>
      </div>
      <div class="footer-info">
        ${formatDateJP(new Date().toISOString())}
      </div>
      <div class="auto-notice">
        ※このメールはシステムによる自動送信です。<br>
        お問い合わせの際は、上記連絡先までご連絡ください。
      </div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

// =====================================================
// Approval Notification Templates
// =====================================================

/**
 * 承認通知メール（顧客向け）
 */
export function getApprovalCustomerEmail(data: ApprovalEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【Epackage Lab】${data.requestType}の承認について`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、お申込みいただきました${data.requestType}について、
下記の通り承認いたしましたのでお知らせ申し上げます。

================================
承認内容の詳細
================================
【申請種別】${data.requestType}
【承認日】${formatDateJP(data.approvalDate)}
【承認者】${data.approvedBy}

【申請内容】
${sanitizeContent(data.requestDetails)}

${data.nextSteps ? `
================================
今後の進め方
================================
${sanitizeContent(data.nextSteps)}
` : ''}

詳細につきましては、マイページよりご確認いただけます。

引き続き、弊社サービスをよろしくお願い申し上げます。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>承認のお知らせ</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f0fdf4;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      line-height: 2;
      color: #555;
      margin-bottom: 30px;
    }
    .approval-box {
      background: #f0fdf4;
      border: 2px solid #10b981;
      border-radius: 8px;
      padding: 30px;
      margin: 30px 0;
      text-align: center;
    }
    .approval-icon {
      font-size: 64px;
      margin-bottom: 15px;
    }
    .approval-title {
      font-size: 22px;
      font-weight: bold;
      color: #059669;
      margin: 0 0 10px 0;
    }
    .approval-subtitle {
      font-size: 15px;
      color: #047857;
      margin: 0;
    }
    .info-box {
      background: #f9fafb;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }
    .info-box-title {
      font-size: 18px;
      font-weight: bold;
      color: #059669;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .info-item {
      margin-bottom: 15px;
      display: flex;
      align-items: baseline;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      min-width: 120px;
      margin-right: 15px;
    }
    .info-value {
      color: #333;
      font-weight: 500;
      font-size: 15px;
    }
    .details-box {
      background: white;
      padding: 20px;
      margin: 20px 0;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      white-space: pre-wrap;
      line-height: 1.8;
    }
    .next-steps {
      background: #ecfdf5;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #059669;
    }
    .next-steps-title {
      font-size: 16px;
      font-weight: bold;
      color: #059669;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
    @media only screen and (max-width: 600px) {
      .info-item { flex-direction: column; }
      .info-label { margin-bottom: 5px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-icon">✓</div>
      <h1>承認のお知らせ</h1>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
        <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

        この度、お申込みいただきました<strong>${sanitizeContent(data.requestType)}</strong>について、<br>
        下記の通り承認いたしましたのでお知らせ申し上げます。
      </div>

      <div class="approval-box">
        <div class="approval-icon">✅</div>
        <h2 class="approval-title">承認が完了しました</h2>
        <p class="approval-subtitle">承認日: ${formatDateJP(data.approvalDate)}</p>
      </div>

      <div class="info-box">
        <h3 class="info-box-title">承認内容の詳細</h3>
        <div class="info-item">
          <div class="info-label">申請種別</div>
          <div class="info-value">${sanitizeContent(data.requestType)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">承認日</div>
          <div class="info-value">${formatDateJP(data.approvalDate)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">承認者</div>
          <div class="info-value">${sanitizeContent(data.approvedBy)}</div>
        </div>

        <h4 style="margin: 20px 0 10px 0; color: #059669; font-size: 15px;">申請内容</h4>
        <div class="details-box">${sanitizeContent(data.requestDetails)}</div>
      </div>

      ${data.nextSteps ? `
      <div class="next-steps">
        <h4 class="next-steps-title">今後の進め方</h4>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #374151;">${sanitizeContent(data.nextSteps)}</div>
      </div>
      ` : ''}

      <div style="margin-top: 30px; text-align: center; color: #059669; font-weight: bold;">
        詳細につきましては、マイページよりご確認いただけます。<br><br>
        引き続き、弊社サービスをよろしくお願い申し上げます。
      </div>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>兵庫県明石市上ノ丸2-11-21</div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

// =====================================================
// Rejection Notification Templates
// =====================================================

/**
 * 却下通知メール（顧客向け）
 */
export function getRejectionCustomerEmail(data: RejectionEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【Epackage Lab】${data.requestType}に関するご連絡`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、お申込みいただきました${data.requestType}について、
慎重に審査いたしました結果、誠に残念ながら今回は承認を見送らせていただくこととなりました。

================================
審査結果
================================
【申請種別】${data.requestType}
【結果】承認見送り

【理由】
${sanitizeContent(data.rejectionReason)}

${data.alternativeOptions ? `
================================
代替案のご提案
================================
${sanitizeContent(data.alternativeOptions)}
` : ''}

この度は、せっかくご提案いただきましたにも関わらず、
ご期待に添えず誠に申し訳ございません。

${data.contactInfo ? `
詳細につきましては、下記までお問い合わせください。

${sanitizeContent(data.contactInfo)}
` : ''}

今後とも、変わらぬご愛顧を賜りますようお願い申し上げます。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>審査結果のご連絡</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #fef2f2;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      line-height: 2;
      color: #555;
      margin-bottom: 30px;
    }
    .result-box {
      background: #fef2f2;
      border: 2px solid #ef4444;
      border-radius: 8px;
      padding: 30px;
      margin: 30px 0;
      text-align: center;
    }
    .result-icon {
      font-size: 64px;
      margin-bottom: 15px;
    }
    .result-title {
      font-size: 22px;
      font-weight: bold;
      color: #dc2626;
      margin: 0 0 10px 0;
    }
    .result-subtitle {
      font-size: 15px;
      color: #b91c1c;
      margin: 0;
    }
    .info-box {
      background: #fef2f2;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #ef4444;
    }
    .info-box-title {
      font-size: 18px;
      font-weight: bold;
      color: #dc2626;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .reason-box {
      background: white;
      padding: 20px;
      margin: 20px 0;
      border-radius: 6px;
      border: 1px solid #fecaca;
      white-space: pre-wrap;
      line-height: 1.8;
    }
    .alternative-box {
      background: #fffbeb;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
    }
    .alternative-title {
      font-size: 16px;
      font-weight: bold;
      color: #d97706;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .apology {
      background: #f3f4f6;
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
      text-align: center;
      font-style: italic;
      color: #6b7280;
      line-height: 2;
    }
    .contact-box {
      background: #eff6ff;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      text-align: center;
    }
    .contact-box p {
      margin: 5px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-icon">📋</div>
      <h1>審査結果のご連絡</h1>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
        <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

        この度、お申込みいただきました<strong>${sanitizeContent(data.requestType)}</strong>について、<br>
        慎重に審査いたしました結果、誠に残念ながら今回は承認を見送らせていただくこととなりました。
      </div>

      <div class="result-box">
        <div class="result-icon">✕</div>
        <h2 class="result-title">承認見送り</h2>
        <p class="result-subtitle">審査の結果、承認を見送らせていただきました</p>
      </div>

      <div class="info-box">
        <h3 class="info-box-title">却下理由</h3>
        <div class="reason-box">${sanitizeContent(data.rejectionReason)}</div>
      </div>

      ${data.alternativeOptions ? `
      <div class="alternative-box">
        <h4 class="alternative-title">💡 代替案のご提案</h4>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #374151;">${sanitizeContent(data.alternativeOptions)}</div>
      </div>
      ` : ''}

      <div class="apology">
        この度は、せっかくご提案いただきましたにも関わらず、<br>
        ご期待に添えず誠に申し訳ございません。
      </div>

      ${data.contactInfo ? `
      <div class="contact-box">
        <p style="font-weight: bold; color: #1e40af; margin-bottom: 15px;">詳細につきましては、下記までお問い合わせください</p>
        <p style="white-space: pre-wrap; color: #374151;">${sanitizeContent(data.contactInfo)}</p>
      </div>
      ` : ''}

      <div style="margin-top: 30px; text-align: center; color: #374151; font-weight: bold;">
        今後とも、変わらぬご愛顧を賜りますようお願い申し上げます。
      </div>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>兵庫県明石市上ノ丸2-11-21</div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

// =====================================================
// Quote Created Templates
// =====================================================

/**
 * 見積作成通知メール（顧客向け）
 */
export function getQuoteCreatedCustomerEmail(data: QuoteCreatedEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  const itemsList = data.quoteInfo.items.map((item, index) => {
    return `${index + 1}. ${item.description}
   数量: ${item.quantity}点
   単価: ${formatCurrencyJP(item.unitPrice)}
   金額: ${formatCurrencyJP(item.amount)}`;
  }).join('\n\n');

  return {
    subject: `【Epackage Lab】お見積書を作成いたしました（見積番号: ${data.quoteInfo.quoteId}）`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、お見積書を作成いたしましたのでご連絡申し上げます。
見積内容は以下の通りです。

================================
お見積書
================================
【見積番号】${data.quoteInfo.quoteId}
【有効期限】${formatDateJP(data.quoteInfo.validUntil)}まで
【見積金額合計】${formatCurrencyJP(data.quoteInfo.totalAmount)}

【見積明細】
${itemsList}

================================
お見積の有効期限について
================================
本見積の有効期限は${formatDateJP(data.quoteInfo.validUntil)}となっております。
期限を過ぎますと、価格や仕様が変更となる場合がございます。

お見積内容のご確認・ご承認につきましては、以下のURLよりアクセスいただけます。

${data.quoteUrl}

ご不明な点がございましたら、お気軽にお問い合わせください。

今後とも、弊社サービスをよろしくお願い申し上げます。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>お見積書を作成いたしました</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #fefce8;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: bold;
    }
    .header-subtitle {
      margin-top: 10px;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      line-height: 2;
      color: #555;
      margin-bottom: 30px;
    }
    .quote-header {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
    }
    .quote-title {
      font-size: 20px;
      font-weight: bold;
      color: #d97706;
      margin: 0 0 15px 0;
    }
    .quote-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      font-size: 14px;
      color: #78350f;
    }
    .quote-meta-item {
      flex: 1;
      min-width: 200px;
    }
    .quote-meta-label {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .items-table {
      width: 100%;
      margin: 30px 0;
      border-collapse: collapse;
    }
    .items-table th {
      background: #fef3c7;
      color: #78350f;
      font-weight: bold;
      padding: 15px 12px;
      text-align: left;
      border-bottom: 2px solid #f59e0b;
    }
    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .total-section {
      background: #fffbeb;
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
      text-align: right;
    }
    .total-label {
      font-size: 18px;
      color: #78350f;
      margin-bottom: 10px;
    }
    .total-amount {
      font-size: 32px;
      font-weight: bold;
      color: #d97706;
    }
    .validity-box {
      background: #fef2f2;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #ef4444;
    }
    .validity-title {
      font-weight: bold;
      color: #dc2626;
      margin-bottom: 10px;
    }
    .cta-button {
      display: block;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      text-decoration: none;
      padding: 18px 40px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 16px;
      text-align: center;
      margin: 30px auto;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
    @media only screen and (max-width: 600px) {
      .items-table { font-size: 13px; }
      .items-table th, .items-table td { padding: 10px 8px; }
      .total-amount { font-size: 24px; }
      .quote-meta { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-icon">📄</div>
      <h1>お見積書を作成いたしました</h1>
      <div class="header-subtitle">Thank you for your request</div>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
        <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

        この度、お見積書を作成いたしましたのでご連絡申し上げます。<br>
        見積内容は以下の通りです。
      </div>

      <div class="quote-header">
        <h2 class="quote-title">お見積書</h2>
        <div class="quote-meta">
          <div class="quote-meta-item">
            <div class="quote-meta-label">見積番号</div>
            <div>${sanitizeContent(data.quoteInfo.quoteId)}</div>
          </div>
          <div class="quote-meta-item">
            <div class="quote-meta-label">有効期限</div>
            <div>${formatDateJP(data.quoteInfo.validUntil)}まで</div>
          </div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>項目</th>
            <th>数量</th>
            <th>単価</th>
            <th>金額</th>
          </tr>
        </thead>
        <tbody>
          ${data.quoteInfo.items.map((item, index) => `
          <tr>
            <td>${index + 1}. ${sanitizeContent(item.description)}</td>
            <td>${item.quantity}点</td>
            <td>${formatCurrencyJP(item.unitPrice)}</td>
            <td>${formatCurrencyJP(item.amount)}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-label">見積金額合計</div>
        <div class="total-amount">${formatCurrencyJP(data.quoteInfo.totalAmount)}</div>
      </div>

      <div class="validity-box">
        <div class="validity-title">⚠️ お見積の有効期限について</div>
        <p style="margin: 10px 0; color: #7f1d1d; line-height: 1.8;">
          本見積の有効期限は<strong>${formatDateJP(data.quoteInfo.validUntil)}</strong>となっております。<br>
          期限を過ぎますと、価格や仕様が変更となる場合がございます。
        </p>
      </div>

      <a href="${sanitizeContent(data.quoteUrl)}" class="cta-button">見積内容を確認・承認する</a>

      <div style="margin-top: 30px; text-align: center; color: #d97706; font-weight: bold;">
        ご不明な点がございましたら、お気軽にお問い合わせください。<br><br>
        今後とも、弊社サービスをよろしくお願い申し上げます。
      </div>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>兵庫県明石市上ノ丸2-11-21</div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

// =====================================================
// Order Status Update Templates
// =====================================================

/**
 * 注文状況更新通知メール
 */
export function getOrderStatusUpdateEmail(data: OrderStatusEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  const statusMap = {
    processing: { text: '受付処理中', icon: '📝', color: '#3b82f6' },
    in_production: { text: '製造中', icon: '🔧', color: '#f59e0b' },
    quality_check: { text: '品質検査中', icon: '🔍', color: '#8b5cf6' },
    ready: { text: '発送準備完了', icon: '✅', color: '#10b981' },
    delayed: { text: '遅延あり', icon: '⚠️', color: '#ef4444' },
  };

  const statusInfo = statusMap[data.status];
  const itemsList = data.orderInfo.items.map((item, index) => {
    return `${index + 1}. ${item.name} x ${item.quantity}点\n   ${formatCurrencyJP(item.price)}`;
  }).join('\n');

  return {
    subject: `【Epackage Lab】注文${data.orderInfo.orderId}の状況更新について`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

ご注文いただきました商品の状況についてご連絡申し上げます。

================================
注文状況
================================
${statusInfo.icon} 【現在のステータス】${statusInfo.text}

【注文番号】${data.orderInfo.orderId}
【注文日】${formatDateJP(data.orderInfo.orderDate)}
${data.estimatedCompletion ? `【完了予定日】${formatDateJP(data.estimatedCompletion)}` : ''}

================================
注文内容
================================
${itemsList}

【注文合計】${formatCurrencyJP(data.orderInfo.totalAmount)}

${data.statusDetails ? `
================================
詳細情報
================================
${sanitizeContent(data.statusDetails)}
` : ''}

現在の状況につきましては、マイページよりご確認いただけます。

引き続き、弊社サービスをよろしくお願い申し上げます。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>注文状況更新のお知らせ</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f0f9ff;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      line-height: 2;
      color: #555;
      margin-bottom: 30px;
    }
    .status-badge {
      display: inline-block;
      background: ${statusInfo.color};
      color: white;
      padding: 12px 30px;
      border-radius: 50px;
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0;
    }
    .order-info-box {
      background: #f8fafc;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid ${statusInfo.color};
    }
    .info-item {
      margin-bottom: 12px;
      display: flex;
      align-items: baseline;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      min-width: 140px;
      margin-right: 15px;
    }
    .info-value {
      color: #333;
      font-weight: 500;
      font-size: 15px;
    }
    .items-table {
      width: 100%;
      margin: 30px 0;
      border-collapse: collapse;
    }
    .items-table th {
      background: #f1f5f9;
      color: #475569;
      font-weight: bold;
      padding: 15px 12px;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
    }
    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .details-box {
      background: ${data.status === 'delayed' ? '#fef2f2' : '#f8fafc'};
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid ${data.status === 'delayed' ? '#ef4444' : statusInfo.color};
      white-space: pre-wrap;
      line-height: 1.8;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      margin: 30px 0;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, ${statusInfo.color} 0%, ${statusInfo.color}cc 100%);
      border-radius: 4px;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
    @media only screen and (max-width: 600px) {
      .info-item { flex-direction: column; }
      .info-label { margin-bottom: 5px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-icon">${statusInfo.icon}</div>
      <h1>注文状況更新のお知らせ</h1>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
        <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

        ご注文いただきました商品の状況についてご連絡申し上げます。
      </div>

      <div style="text-align: center;">
        <span class="status-badge">${statusInfo.icon} ${statusInfo.text}</span>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${
          data.status === 'processing' ? '20%' :
          data.status === 'in_production' ? '50%' :
          data.status === 'quality_check' ? '75%' :
          data.status === 'ready' ? '90%' :
          data.status === 'delayed' ? '30%' : '10%'
        };"></div>
      </div>

      <div class="order-info-box">
        <div class="info-item">
          <div class="info-label">注文番号</div>
          <div class="info-value">${sanitizeContent(data.orderInfo.orderId)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">注文日</div>
          <div class="info-value">${formatDateJP(data.orderInfo.orderDate)}</div>
        </div>
        ${data.estimatedCompletion ? `
        <div class="info-item">
          <div class="info-label">完了予定日</div>
          <div class="info-value">${formatDateJP(data.estimatedCompletion)}</div>
        </div>
        ` : ''}
      </div>

      <h3 style="margin: 30px 0 15px 0; color: #475569;">注文内容</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>商品名</th>
            <th>数量</th>
            <th>単価</th>
          </tr>
        </thead>
        <tbody>
          ${data.orderInfo.items.map((item, index) => `
          <tr>
            <td>${index + 1}. ${sanitizeContent(item.name)}</td>
            <td>${item.quantity}点</td>
            <td>${formatCurrencyJP(item.price)}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 20px; font-size: 18px; color: #475569;">
        <strong>注文合計: ${formatCurrencyJP(data.orderInfo.totalAmount)}</strong>
      </div>

      ${data.statusDetails ? `
      <div class="details-box">
        <strong style="color: ${data.status === 'delayed' ? '#dc2626' : statusInfo.color};">詳細情報</strong><br><br>
        ${sanitizeContent(data.statusDetails)}
      </div>
      ` : ''}

      <div style="margin-top: 30px; text-align: center; color: #475569; font-weight: bold;">
        現在の状況につきましては、マイページよりご確認いただけます。<br><br>
        引き続き、弊社サービスをよろしくお願い申し上げます。
      </div>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>兵庫県明石市上ノ丸2-11-21</div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

// =====================================================
// Shipment Notification Templates
// =====================================================

/**
 * 配送通知メール（顧客向け）
 */
export function getShipmentNotificationCustomerEmail(data: ShipmentEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  const itemsList = data.orderInfo.items.map((item, index) => {
    return `${index + 1}. ${item.name} x ${item.quantity}点`;
  }).join('\n');

  return {
    subject: `【Epackage Lab】商品を発送いたしました（注文番号: ${data.orderInfo.orderId}）`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、ご注文いただきました商品を発送いたしましたのでご連絡申し上げます。

================================
発送情報
================================
【注文番号】${data.orderInfo.orderId}
【配送会社】${data.shipmentInfo.carrier}
【追跡番号】${data.shipmentInfo.trackingNumber}
【お届け予定日】${formatDateJP(data.shipmentInfo.estimatedDelivery)}

${data.trackingUrl ? `【配送状況確認】
${data.trackingUrl}` : ''}

================================
お届け先
================================
${sanitizeContent(data.shipmentInfo.shippingAddress)}

================================
発送内容
================================
${itemsList}

【注文合計】${formatCurrencyJP(data.orderInfo.totalAmount)}

商品の到着をお楽しみにしております。
お届けまで、今しばらくお待ちください。

今後とも、弊社サービスをよろしくお願い申し上げます。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>商品を発送いたしました</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f0fdf4;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      line-height: 2;
      color: #555;
      margin-bottom: 30px;
    }
    .shipment-box {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      padding: 30px;
      margin: 30px 0;
      border-radius: 8px;
      border-left: 4px solid #10b981;
      text-align: center;
    }
    .shipment-icon {
      font-size: 64px;
      margin-bottom: 15px;
    }
    .shipment-title {
      font-size: 22px;
      font-weight: bold;
      color: #059669;
      margin: 0 0 10px 0;
    }
    .tracking-box {
      background: #fef3c7;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      border: 2px solid #f59e0b;
    }
    .tracking-label {
      font-size: 13px;
      color: #78350f;
      margin-bottom: 5px;
    }
    .tracking-number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      letter-spacing: 0.1em;
      margin: 10px 0;
    }
    .cta-button {
      display: inline-block;
      background: #f59e0b;
      color: white;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 14px;
      margin-top: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .info-card {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .info-card-icon {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .info-card-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    .info-card-value {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    .address-box {
      background: #f8fafc;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #64748b;
    }
    .items-list {
      background: #f9fafb;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .item-row {
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .item-row:last-child {
      border-bottom: none;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
    @media only screen and (max-width: 600px) {
      .info-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-icon">📦</div>
      <h1>商品を発送いたしました</h1>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
        <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

        この度、ご注文いただきました商品を発送いたしましたのでご連絡申し上げます。
      </div>

      <div class="shipment-box">
        <div class="shipment-icon">🚚</div>
        <h2 class="shipment-title">商品を発送いたしました！</h2>
        <p style="margin: 10px 0; color: #047857;">お届け予定日: ${formatDateJP(data.shipmentInfo.estimatedDelivery)}</p>
      </div>

      <div class="tracking-box">
        <div class="tracking-label">追跡番号 / Tracking Number</div>
        <div class="tracking-number">${sanitizeContent(data.shipmentInfo.trackingNumber)}</div>
        ${data.trackingUrl ? `
        <div style="text-align: center;">
          <a href="${sanitizeContent(data.trackingUrl)}" class="cta-button">配送状況を確認する</a>
        </div>
        ` : ''}
      </div>

      <div class="info-grid">
        <div class="info-card">
          <div class="info-card-icon">📋</div>
          <div class="info-card-label">注文番号</div>
          <div class="info-card-value">${sanitizeContent(data.orderInfo.orderId)}</div>
        </div>
        <div class="info-card">
          <div class="info-card-icon">🚛</div>
          <div class="info-card-label">配送会社</div>
          <div class="info-card-value">${sanitizeContent(data.shipmentInfo.carrier)}</div>
        </div>
      </div>

      <div class="address-box">
        <div style="font-weight: bold; color: #475569; margin-bottom: 10px;">📍 お届け先</div>
        <div style="line-height: 1.8; color: #374151;">${sanitizeContent(data.shipmentInfo.shippingAddress)}</div>
      </div>

      <div class="items-list">
        <div style="font-weight: bold; color: #475569; margin-bottom: 15px;">📦 発送内容</div>
        ${data.orderInfo.items.map((item, index) => `
        <div class="item-row">
          <strong>${index + 1}. ${sanitizeContent(item.name)}</strong> × ${item.quantity}点
        </div>
        `).join('')}
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <div style="font-size: 18px; color: #059669; font-weight: bold; margin-bottom: 10px;">
          商品の到着をお楽しみにしています
        </div>
        <div style="color: #64748b;">
          お届けまで、今しばらくお待ちください。
        </div>
      </div>

      <div style="margin-top: 30px; text-align: center; color: #374151; font-weight: bold;">
        今後とも、弊社サービスをよろしくお願い申し上げます。
      </div>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>兵庫県明石市上ノ丸2-11-21</div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

// =====================================================
// Admin Notification Templates
// =====================================================

/**
 * 管理者通知: 新規注文
 */
export function getAdminNewOrderEmail(data: OrderStatusEmailData): EmailTemplate {
  const itemsList = data.orderInfo.items.map((item, index) => {
    return `${index + 1}. ${item.name} x ${item.quantity}点\n   ${formatCurrencyJP(item.price)}`;
  }).join('\n');

  return {
    subject: `【新規注文】注文${data.orderInfo.orderId}が入りました`,
    text: `
新しい注文が入りました。

================================
注文情報
================================
【注文番号】${sanitizeText(data.orderInfo.orderId)}
【注文日】${formatDateJP(data.orderInfo.orderDate)}
【顧客名】${sanitizeText(data.recipient.name)}
${data.recipient.company ? `【会社名】${sanitizeText(data.recipient.company)}` : ''}
【メール】${sanitizeText(data.recipient.email)}

【注文内容】
${itemsList}

【注文合計】${formatCurrencyJP(data.orderInfo.totalAmount)}
${data.estimatedCompletion ? `【完了予定日】${formatDateJP(data.estimatedCompletion)}` : ''}

================================
対応が必要です
================================
マイページより詳細をご確認の上、対応をお願いいたします。
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box { background: #f9fafb; padding: 20px; margin: 15px 0; border-radius: 8px; }
    .label { color: #666; font-size: 13px; font-weight: bold; margin-bottom: 5px; }
    .value { color: #333; font-size: 15px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <strong>🔔 新規注文通知</strong>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0;">注文情報</h3>
      <div class="label">注文番号</div>
      <div class="value"><code>${sanitizeContent(data.orderInfo.orderId)}</code></div>

      <div class="label">注文日</div>
      <div class="value">${formatDateJP(data.orderInfo.orderDate)}</div>

      <div class="label">顧客名</div>
      <div class="value">${sanitizeContent(data.recipient.name)}</div>

      ${data.recipient.company ? `
      <div class="label">会社名</div>
      <div class="value">${sanitizeContent(data.recipient.company)}</div>
      ` : ''}

      <div class="label">メール</div>
      <div class="value"><a href="mailto:${sanitizeContent(data.recipient.email)}">${sanitizeContent(data.recipient.email)}</a></div>

      ${data.estimatedCompletion ? `
      <div class="label">完了予定日</div>
      <div class="value">${formatDateJP(data.estimatedCompletion)}</div>
      ` : ''}
    </div>

    <div class="info-box">
      <h3>注文内容</h3>
      ${data.orderInfo.items.map((item, index) => `
      <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
        <strong>${index + 1}. ${sanitizeContent(item.name)}</strong> × ${item.quantity}点 = ${formatCurrencyJP(item.price)}
      </div>
      `).join('')}

      <div style="margin-top: 15px; font-size: 18px; color: #059669; font-weight: bold;">
        注文合計: ${formatCurrencyJP(data.orderInfo.totalAmount)}
      </div>
    </div>

    <div style="text-align: center; margin-top: 30px; padding: 20px; background: #fffbeb; border-radius: 8px;">
      <strong style="color: #d97706;">⚠️ 対応が必要です</strong><br>
      マイページより詳細をご確認の上、対応をお願いいたします。
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

/**
 * 管理者通知: 見積依頼
 */
export function getAdminQuoteRequestEmail(data: QuoteCreatedEmailData): EmailTemplate {
  const itemsList = data.quoteInfo.items.map((item, index) => {
    return `${index + 1}. ${item.description}\n   数量: ${item.quantity}点\n   金額: ${formatCurrencyJP(item.amount)}`;
  }).join('\n');

  return {
    subject: `【見積依頼】${sanitizeText(data.recipient.name)}様より見積依頼`,
    text: `
新しい見積依頼が入りました。

================================
見積依頼情報
================================
【見積番号】${data.quoteInfo.quoteId}
【依頼日】${new Date().toLocaleDateString('ja-JP')}
【顧客名】${sanitizeText(data.recipient.name)}
${data.recipient.company ? `【会社名】${sanitizeText(data.recipient.company)}` : ''}
【メール】${sanitizeText(data.recipient.email)}

【見積明細】
${itemsList}

【見積金額合計】${formatCurrencyJP(data.quoteInfo.totalAmount)}
【有効期限】${formatDateJP(data.quoteInfo.validUntil)}

================================
対応が必要です
================================
詳細をご確認の上、見積書を作成してください。
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #ede9fe; border-left: 4px solid #8b5cf6; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box { background: #f9fafb; padding: 20px; margin: 15px 0; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <strong>📋 新規見積依頼</strong>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0;">見積依頼情報</h3>
      <div style="margin-bottom: 12px;"><strong>見積番号:</strong> <code>${sanitizeContent(data.quoteInfo.quoteId)}</code></div>
      <div style="margin-bottom: 12px;"><strong>依頼日:</strong> ${new Date().toLocaleDateString('ja-JP')}</div>
      <div style="margin-bottom: 12px;"><strong>顧客名:</strong> ${sanitizeContent(data.recipient.name)}</div>
      ${data.recipient.company ? `<div style="margin-bottom: 12px;"><strong>会社名:</strong> ${sanitizeContent(data.recipient.company)}</div>` : ''}
      <div style="margin-bottom: 12px;"><strong>メール:</strong> <a href="mailto:${sanitizeContent(data.recipient.email)}">${sanitizeContent(data.recipient.email)}</a></div>
    </div>

    <div class="info-box">
      <h3>見積明細</h3>
      ${data.quoteInfo.items.map((item, index) => `
      <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
        <strong>${index + 1}. ${sanitizeContent(item.description)}</strong><br>
        数量: ${item.quantity}点 | 金額: ${formatCurrencyJP(item.amount)}
      </div>
      `).join('')}

      <div style="margin-top: 15px; font-size: 18px; color: #8b5cf6; font-weight: bold;">
        見積金額合計: ${formatCurrencyJP(data.quoteInfo.totalAmount)}
      </div>
      <div style="margin-top: 10px; color: #666;">
        有効期限: ${formatDateJP(data.quoteInfo.validUntil)}
      </div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

// =====================================================
// Korean Data Transfer Templates
// =====================================================

/**
 * 韓国パートナーへデータ転送メール
 */
export interface KoreaDataTransferEmailData extends TemplateData {
  orderId: string;
  quotationNumber: string;
  customerName: string;
  customerCompany?: string;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
  aiExtractedData: {
    designSpecs?: Record<string, any>;
    materials?: Array<{ name: string; quantity: number }>;
    dimensions?: { width?: number; height?: number; depth?: number };
    colors?: string[];
    specialRequirements?: string;
  };
  files: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
  notes?: string;
  urgency?: 'normal' | 'urgent' | 'expedited';
}

/**
 * 韓国パートナーデータ転送メールテンプレート
 */
export function getKoreaDataTransferEmail(data: KoreaDataTransferEmailData): EmailTemplate {
  const itemsList = data.items.map((item, index) => {
    return `${index + 1}. ${item.productName} x ${item.quantity}点`;
  }).join('\n');

  const filesList = data.files.map((file, index) => {
    const sizeMB = (file.fileSize / (1024 * 1024)).toFixed(2);
    return `${index + 1}. ${file.fileName} (${file.fileType}, ${sizeMB}MB)`;
  }).join('\n');

  const aiDataJson = JSON.stringify(data.aiExtractedData, null, 2);

  return {
    subject: `[Epackage Japan] データ転送依頼 - ${data.quotationNumber}`,
    text: `
한국 파트너팀 귀하,

일본 Epackage Lab에서 새로운 주문 데이터를 전송합니다.

================================
주문 정보
================================
【주문번호】${data.orderId}
【견적번호】${data.quotationNumber}
【고객명】${data.customerName}${data.customerCompany ? ` (${data.customerCompany})` : ''}
【긴급도】${data.urgency === 'urgent' ? '긴급' : data.urgency === 'expedited' ? '우선' : '일반'}

================================
제품 목록
================================
${itemsList}

================================
AI 추출 데이터
================================
${aiDataJson}

================================
첨부 파일
================================
${filesList}

${data.notes ? `
================================
비고
================================
${sanitizeContent(data.notes)}
` : ''}

================================
다음 단계
================================
1. 첨부된 AI 파일과 참조 이미지를 검토합니다
2. AI 추출 데이터를 확인합니다
3. 생산 가능 여부와 일정을 회신합니다
4. 필요한 경우 추가 정보를 요청합니다

문의사항이 있으시면 언제든 연락주십시오.

Epackage Lab Japan
Email: ${process.env.ADMIN_EMAIL || 'admin@epackage-lab.com'}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>データ転送依頼</title>
  <style>
    body {
      font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f0f9ff;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 700px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: bold;
    }
    .header-subtitle {
      margin-top: 10px;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      line-height: 2;
      color: #555;
      margin-bottom: 30px;
    }
    .info-box {
      background: #f8fafc;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    .info-box-title {
      font-size: 18px;
      font-weight: bold;
      color: #2563eb;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .info-item {
      margin-bottom: 15px;
      display: flex;
      align-items: baseline;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      min-width: 100px;
      margin-right: 15px;
      font-weight: bold;
    }
    .info-value {
      color: #333;
      font-size: 15px;
      font-weight: 500;
    }
    .items-list {
      background: #fffbeb;
      padding: 20px;
      margin: 20px 0;
      border-radius: 6px;
    }
    .item-row {
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .item-row:last-child {
      border-bottom: none;
    }
    .ai-data-box {
      background: #f0fdf4;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }
    .ai-data-title {
      font-size: 16px;
      font-weight: bold;
      color: #059669;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .ai-data-content {
      background: white;
      padding: 15px;
      border-radius: 6px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
      line-height: 1.6;
      color: #374151;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .files-list {
      background: #fef3c7;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .files-title {
      font-size: 16px;
      font-weight: bold;
      color: #d97706;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .file-item {
      padding: 10px;
      background: white;
      margin: 8px 0;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .file-name {
      font-weight: bold;
      color: #374151;
    }
    .file-meta {
      font-size: 13px;
      color: #6b7280;
    }
    .steps-box {
      background: #eff6ff;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .steps-title {
      font-size: 16px;
      font-weight: bold;
      color: #1d4ed8;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .step-item {
      display: flex;
      margin: 12px 0;
    }
    .step-number {
      background: #3b82f6;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      flex-shrink: 0;
      margin-right: 12px;
    }
    .urgency-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      margin-left: 10px;
    }
    .urgency-urgent {
      background: #fee2e2;
      color: #dc2626;
    }
    .urgency-expedited {
      background: #fef3c7;
      color: #d97706;
    }
    .urgency-normal {
      background: #dbeafe;
      color: #2563eb;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
    .contact-link {
      color: #3b82f6;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-icon">📤</div>
      <h1>データ転送依頼</h1>
      <div class="header-subtitle">New Design Data from Japan Epackage Lab</div>
    </div>

    <div class="content">
      <div class="greeting">
        韓国パートナーチーム 御中,<br><br>
        日本Epackage Labより新しい注文データを送信いたします。
      </div>

      <div class="info-box">
        <h3 class="info-box-title">注文情報</h3>
        <div class="info-item">
          <div class="info-label">注文番号</div>
          <div class="info-value"><code>${sanitizeContent(data.orderId)}</code></div>
        </div>
        <div class="info-item">
          <div class="info-label">見積番号</div>
          <div class="info-value"><code>${sanitizeContent(data.quotationNumber)}</code></div>
        </div>
        <div class="info-item">
          <div class="info-label">顧客名</div>
          <div class="info-value">
            ${sanitizeContent(data.customerName)}
            ${data.customerCompany ? `(${sanitizeContent(data.customerCompany)})` : ''}
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">緊急度</div>
          <div class="info-value">
            ${data.urgency === 'urgent' ? '<span class="urgency-badge urgency-urgent">緊急</span>' :
              data.urgency === 'expedited' ? '<span class="urgency-badge urgency-expedited">優先</span>' :
              '<span class="urgency-badge urgency-normal">通常</span>'}
          </div>
        </div>
      </div>

      <div class="items-list">
        <h4 style="margin-top: 0; color: #78350f; font-size: 16px;">📦 製品リスト</h4>
        ${data.items.map((item, index) => `
        <div class="item-row">
          <strong>${index + 1}. ${sanitizeContent(item.productName)}</strong> × ${item.quantity}点
        </div>
        `).join('')}
      </div>

      <div class="ai-data-box">
        <h4 class="ai-data-title">🤖 AI抽出データ</h4>
        <div class="ai-data-content">${sanitizeContent(aiDataJson)}</div>
      </div>

      <div class="files-list">
        <h4 class="files-title">📎 添付ファイル</h4>
        ${data.files.map((file) => {
          const sizeMB = (file.fileSize / (1024 * 1024)).toFixed(2);
          return `
        <div class="file-item">
          <div class="file-name">📄 ${sanitizeContent(file.fileName)}</div>
          <div class="file-meta">${file.fileType} · ${sizeMB}MB</div>
        </div>
          `;
        }).join('')}
      </div>

      ${data.notes ? `
      <div class="info-box">
        <h3 class="info-box-title">備考</h3>
        <div style="white-space: pre-wrap; line-height: 1.8;">${sanitizeContent(data.notes)}</div>
      </div>
      ` : ''}

      <div class="steps-box">
        <h4 class="steps-title">次のステップ</h4>
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-content">添付されたAIファイルと参照画像を確認します</div>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-content">AI抽出データを確認します</div>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-content">生産可能かどうかとスケジュールをご返信いたします</div>
        </div>
        <div class="step-item">
          <div class="step-number">4</div>
          <div class="step-content">必要に応じて追加情報を要求いたします</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 10px 0;">
        ご不明な点がございましたら、いつでもご連絡ください。<br>
        <a href="mailto:${process.env.ADMIN_EMAIL || 'admin@epackage-lab.com'}" class="contact-link">
          ${process.env.ADMIN_EMAIL || 'admin@epackage-lab.com'}
        </a>
      </p>
      <p style="margin: 20px 0 0 0; font-size: 12px; color: #999;">
        ※このメールはシステムにより自動送信されました。
      </p>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

// =====================================================
// Korea Correction Notification Email Template (Customer)
// =====================================================

/**
 * 韓国パートナー修正事項完了通知メール（顧客向け）
 * Korean partner correction completed notification
 */
export function getKoreaCorrectionNotificationEmail(data: KoreaCorrectionNotificationEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  const filesList = data.correctedFiles.map((file, index) =>
    `${index + 1}. ${file.fileName}\n   ${file.fileUrl}`
  ).join('\n');

  return {
    subject: `【Epackage Lab】韓国パートナーによる修正データが完成いたしました`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、韓国パートナーにて修正作業が完了いたしましたので、ご通知申し上げます。

================================
修正内容
================================
${data.correctionDescription}

================================
注文番号
================================
${data.orderNumber}

================================
修正完了日
================================
${data.correctionDate}

${data.correctedFiles.length > 0 ? `
================================
修正ファイル
================================
${filesList}
` : ''}

${data.notes ? `
================================
備考
================================
${data.notes}
` : ''}

================================
次のステップ
================================
1. 修正されたファイルをご確認ください
2. 内容に問題がなければ、生産に進みます
3. ご不明な点がございましたら、お気軽にお問い合わせください

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>韓国パートナーによる修正データが完成いたしました</title>
</head>
<body style="font-family: 'Noto Sans JP', sans-serif; line-height: 1.8; color: #333; background-color: #f8fafc; margin: 0; padding: 20px;">
  <div class="email-container" style="max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div class="header" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 40px 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
      <h1 style="margin: 0; font-size: 26px; font-weight: bold;">修正データ完成のお知らせ</h1>
      <p style="margin-top: 10px; font-size: 14px; opacity: 0.9;">韓国パートナーによる修正作業が完了いたしました</p>
    </div>

    <div class="content" style="padding: 40px 30px;">
      <div class="greeting" style="font-size: 16px; line-height: 2; color: #555; margin-bottom: 30px;">
        ${data.recipient.company ? `${sanitizeContent(data.recipient.company)}<br>` : ''}${sanitizeContent(data.recipient.name)} 様<br><br>
        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>
        この度、韓国パートナーにて修正作業が完了いたしましたので、ご通知申し上げます。
      </div>

      <div class="success-box" style="background: #f0fdf4; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #10b981;">
        <h3 style="margin-top: 0; font-size: 18px; font-weight: bold; color: #059669; margin-bottom: 20px;">修正内容</h3>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #333;">${sanitizeHtml(data.correctionDescription)}</div>
      </div>

      <div class="info-box" style="background: #f8fafc; padding: 25px; margin: 25px 0; border-radius: 8px;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 15px;">注文情報</h4>
        <div style="display: flex; margin-bottom: 10px;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">注文番号</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.orderNumber}</div>
        </div>
        <div style="display: flex;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">修正完了日</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.correctionDate}</div>
        </div>
      </div>

      ${data.correctedFiles.length > 0 ? `
      <div class="files-box" style="background: #eff6ff; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 15px;">修正ファイル</h4>
        ${data.correctedFiles.map((file) => `
        <div style="background: white; padding: 15px; margin-bottom: 10px; border-radius: 6px; border: 1px solid #dbeafe;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">📄</span>
            <a href="${file.fileUrl}" style="color: #2563eb; text-decoration: none; font-weight: 500; flex: 1;">${sanitizeHtml(file.fileName)}</a>
            <span style="color: #64748b; font-size: 12px;">ダウンロード</span>
          </div>
        </div>
        `).join('')}
      </div>
      ` : ''}

      ${data.notes ? `
      <div class="notes-box" style="background: #fffbeb; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #b45309; margin-bottom: 15px;">備考</h4>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #333;">${sanitizeHtml(data.notes)}</div>
      </div>
      ` : ''}

      <div class="steps-box" style="background: #fef3c7; padding: 25px; margin: 25px 0; border-radius: 8px;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #b45309; margin-bottom: 20px;">次のステップ</h4>
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">1</span>
            <div style="color: #333; font-size: 14px;">修正されたファイルをご確認ください</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">2</span>
            <div style="color: #333; font-size: 14px;">内容に問題がなければ、生産に進みます</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">3</span>
            <div style="color: #333; font-size: 14px;">ご不明な点がございましたら、お気軽にお問い合わせください</div>
          </div>
        </div>
      </div>

      <div class="contact-box" style="background: #f0f9ff; padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #64748b;">
          ご不明な点がございましたら、以下までお問い合わせください<br>
          <a href="mailto:${process.env.ADMIN_EMAIL || 'admin@epackage-lab.com'}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${process.env.ADMIN_EMAIL || 'admin@epackage-lab.com'}</a>
        </p>
      </div>
    </div>

    <div class="footer" style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 10px 0; font-size: 12px; color: #64748b;">
        このメールはシステムにより自動送信されています。<br>
        © ${new Date().getFullYear()} Epackage Lab. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

// =====================================================
// Spec Sheet Approval Email Template
// =====================================================

/**
 * 仕様書承認通知メール（顧客/管理者用）
 * Spec sheet approval notification
 */
export function getSpecSheetApprovalEmail(data: SpecSheetApprovalEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【Epackage Lab】仕様書承認完了 - ${data.specNumber}`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、以下の通り仕様書が承認されましたので、ご通知申し上げます。

================================
仕様書番号
================================
${data.specNumber}

================================
注文番号
================================
${data.orderNumber}

================================
承認日時
================================
${data.approvedAt}

${data.comments ? `
================================
コメント
================================
${data.comments}
` : ''}

================================
次のステップ
================================
1. 仕様書に基づいて生産を開始します
2. 完成次第、出荷の手配を行います
3. 納期までに商品をお届けいたします

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>仕様書承認完了</title>
</head>
<body style="font-family: 'Noto Sans JP', sans-serif; line-height: 1.8; color: #333; background-color: #f0fdf4; margin: 0; padding: 20px;">
  <div class="email-container" style="max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
      <h1 style="margin: 0; font-size: 26px; font-weight: bold;">仕様書承認完了</h1>
      <p style="margin-top: 10px; font-size: 14px; opacity: 0.9;">仕様書が承認されました</p>
    </div>

    <div class="content" style="padding: 40px 30px;">
      <div class="greeting" style="font-size: 16px; line-height: 2; color: #555; margin-bottom: 30px;">
        ${data.recipient.company ? `${sanitizeContent(data.recipient.company)}<br>` : ''}${sanitizeContent(data.recipient.name)} 様<br><br>
        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>
        この度、以下の通り仕様書が承認されましたので、ご通知申し上げます。
      </div>

      <div class="success-box" style="background: #f0fdf4; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #10b981;">
        <h3 style="margin-top: 0; font-size: 18px; font-weight: bold; color: #059669; margin-bottom: 20px;">仕様書情報</h3>
        <div style="display: flex; margin-bottom: 10px;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">仕様書番号</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.specNumber}</div>
        </div>
        <div style="display: flex; margin-bottom: 10px;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">注文番号</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.orderNumber}</div>
        </div>
        <div style="display: flex;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">承認日時</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.approvedAt}</div>
        </div>
      </div>

      ${data.comments ? `
      <div class="notes-box" style="background: #eff6ff; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 15px;">コメント</h4>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #333;">${sanitizeHtml(data.comments)}</div>
      </div>
      ` : ''}

      <div class="steps-box" style="background: #f0fdf4; padding: 25px; margin: 25px 0; border-radius: 8px;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #059669; margin-bottom: 20px;">次のステップ</h4>
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">1</span>
            <div style="color: #333; font-size: 14px;">仕様書に基づいて生産を開始します</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">2</span>
            <div style="color: #333; font-size: 14px;">完成次第、出荷の手配を行います</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">3</span>
            <div style="color: #333; font-size: 14px;">納期までに商品をお届けいたします</div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer" style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 10px 0; font-size: 12px; color: #64748b;">
        このメールはシステムにより自動送信されています。<br>
        © ${new Date().getFullYear()} Epackage Lab. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

/**
 * 仕様書却下/修正依頼通知メール（管理者用）
 * Spec sheet rejection notification (admin)
 */
export function getSpecSheetRejectionEmail(data: SpecSheetRejectionEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  const changesList = data.requestedChanges && data.requestedChanges.length > 0
    ? data.requestedChanges.map((change, i) => `${i + 1}. ${change}`).join('\n')
    : 'なし';

  return {
    subject: `【Epackage Lab】仕様書修正依頼 - ${data.specNumber}`,
    text: `
${recipientHeader}

仕様書に対する修正依頼が受付されました。

================================
依頼情報
================================
仕様書番号: ${data.specNumber}
注文番号: ${data.orderNumber}
お客様: ${data.customerName}
要請日時: ${data.rejectedAt}

================================
却下/修正事由
================================
${data.reason}

${data.requestedChanges && data.requestedChanges.length > 0 ? `
================================
要求された修正事項
================================
${changesList}
` : ''}

================================
対応が必要
================================
1. 顧客の要求事項を確認します
2. 修正された仕様書を再作成します
3. 再承認を要求いたします

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>仕様書修正依頼</title>
</head>
<body style="font-family: 'Noto Sans JP', sans-serif; line-height: 1.8; color: #333; background-color: #fef2f2; margin: 0; padding: 20px;">
  <div class="email-container" style="max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 15px;">📝</div>
      <h1 style="margin: 0; font-size: 26px; font-weight: bold;">仕様書修正要求</h1>
      <p style="margin-top: 10px; font-size: 14px; opacity: 0.9;">お客様より修正要求が寄せられました</p>
    </div>

    <div class="content" style="padding: 40px 30px;">
      <div class="greeting" style="font-size: 16px; line-height: 2; color: #555; margin-bottom: 30px;">
        管理者の皆様<br><br>
        仕様書に対する修正要求が受け付けられました。
      </div>

      <div class="info-box" style="background: #fef2f2; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #ef4444;">
        <h3 style="margin-top: 0; font-size: 18px; font-weight: bold; color: #dc2626; margin-bottom: 20px;">要求情報</h3>
        <div style="display: flex; margin-bottom: 10px;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">仕様書番号</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.specNumber}</div>
        </div>
        <div style="display: flex; margin-bottom: 10px;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">注文番号</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.orderNumber}</div>
        </div>
        <div style="display: flex; margin-bottom: 10px;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">お客様</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.customerName}</div>
        </div>
        <div style="display: flex;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">要求日時</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.rejectedAt}</div>
        </div>
      </div>

      <div class="reason-box" style="background: #fffbeb; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #b45309; margin-bottom: 15px;">修正理由</h4>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #333;">${sanitizeHtml(data.reason)}</div>
      </div>

      ${data.requestedChanges && data.requestedChanges.length > 0 ? `
      <div class="changes-box" style="background: #eff6ff; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 15px;">要求された修正事項</h4>
        <ul style="margin: 0; padding-left: 20px; color: #333;">
          ${data.requestedChanges.map(change => `<li style="margin-bottom: 8px;">${sanitizeHtml(change)}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <div class="action-box" style="background: #f0f9ff; padding: 25px; margin: 25px 0; border-radius: 8px;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #0369a1; margin-bottom: 20px;">必要な対応</h4>
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #0284c7; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">1</span>
            <div style="color: #333; font-size: 14px;">お客様の要求内容を検討</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #0284c7; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">2</span>
            <div style="color: #333; font-size: 14px;">修正された仕様書を作成</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #0284c7; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">3</span>
            <div style="color: #333; font-size: 14px;">再承認をリクエスト</div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer" style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 10px 0; font-size: 12px; color: #64748b;">
        このメールはシステムにより自動送信されています。<br>
        © ${new Date().getFullYear()} Epackage Lab. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

// =====================================================
// Signature Email Templates
// =====================================================

/**
 * 電子署名リクエストメール（署名依頼）
 */
export function getSignatureRequestEmail(data: SignatureRequestEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();
  const expiresDate = new Date(data.expiresAt);
  const daysUntilExpiry = Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return {
    subject: `【Epackage Lab】電子署名のお願い（${data.documentTitle}）`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、以下の書類について電子署名のお願いを申し上げます。

================================
署名依頼内容
================================
【書類名】${data.documentTitle}
【依頼ID】${data.envelopeId}
【有効期限】${formatDateJP(data.expiresAt)}（残り${daysUntilExpiry}日）

${data.signers.map(s => `【署名者】${s.name}様（${s.email}）`).join('\n')}
================================

${data.message ? `
【メッセージ】
${data.message}

` : ''}

${data.signingUrl ? `
署名は以下のURLから行うことができます。

${data.signingUrl}

` : ''}

※有効期限までに署名が完了されない場合、依頼はキャンセルされます。
※ご不明な点がございましたら、お気軽にお問い合わせください。

何卒よろしくお願い申し上げます。

${footer}

※このメールはシステムによる自動送信です。
お問い合わせの際は、上記連絡先までご連絡ください。
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>電子署名のお願い</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      margin-bottom: 30px;
    }
    .info-box {
      background: #f8fafc;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .info-item {
      margin-bottom: 12px;
      display: flex;
      align-items: baseline;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      min-width: 120px;
      margin-right: 15px;
    }
    .info-value {
      color: #333;
      font-weight: 500;
    }
    .signers-list {
      margin: 15px 0;
      padding-left: 20px;
    }
    .signers-list li {
      margin-bottom: 8px;
      color: #333;
    }
    .message-box {
      background: #fffbeb;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
      white-space: pre-wrap;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .sign-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 40px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
    .expiry-notice {
      background: #fef2f2;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
      border-left: 4px solid #ef4444;
      font-size: 14px;
      color: #991b1b;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>✍️ 電子署名のお願い</h1>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
        <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

        この度、以下の書類について電子署名のお願いを申し上げます。
      </div>

      <div class="info-box">
        <div class="info-item">
          <div class="info-label">書類名</div>
          <div class="info-value">${sanitizeContent(data.documentTitle)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">依頼ID</div>
          <div class="info-value">${sanitizeContent(data.envelopeId)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">有効期限</div>
          <div class="info-value">${formatDateJP(data.expiresAt)}（残り${daysUntilExpiry}日）</div>
        </div>
        <div class="info-item" style="flex-direction: column; align-items: flex-start;">
          <div class="info-label">署名者</div>
          <ul class="signers-list">
            ${data.signers.map(s => `<li>${sanitizeContent(s.name)}様（${sanitizeContent(s.email)}）</li>`).join('')}
          </ul>
        </div>
      </div>

      ${data.message ? `
      <div class="message-box">
        <strong>メッセージ</strong><br><br>
        ${sanitizeContent(data.message)}
      </div>
      ` : ''}

      ${data.signingUrl ? `
      <div class="button-container">
        <a href="${sanitizeContent(data.signingUrl)}" class="sign-button">署名する</a>
      </div>
      ` : ''}

      <div class="expiry-notice">
        ⚠️ 有効期限までに署名が完了されない場合、依頼はキャンセルされます。
      </div>

      <div style="margin-top: 30px; text-align: center; color: #475569; font-size: 14px;">
        ご不明な点がございましたら、お気軽にお問い合わせください。<br><br>
        何卒よろしくお願い申し上げます。
      </div>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>兵庫県明石市上ノ丸2-11-21</div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

/**
 * 電子署名完了通知メール
 */
export function getSignatureCompletedEmail(data: SignatureCompletedEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【Epackage Lab】電子署名が完了いたしました（${data.documentTitle}）`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、以下の書類の署名が全て完了いたしましたのでご連絡申し上げます。

================================
署名完了情報
================================
【書類名】${data.documentTitle}
【依頼ID】${data.envelopeId}
【完了日時】${formatDateJP(data.completedAt)}

署名者：
${data.signers.map(s => `・${s.name}様（${formatDateJP(s.signedAt)}）`).join('\n')}
================================

${data.documentUrl ? `
署名済みの書類は以下のURLからダウンロードいただけます。

${data.documentUrl}

` : ''}

本書類は法的に有効です。大切に保管してください。

今後とも、弊社サービスをよろしくお願い申し上げます。

${footer}

※このメールはシステムによる自動送信です。
お問い合わせの際は、上記連絡先までご連絡ください。
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>署名完了のお知らせ</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
    }
    .success-box {
      background: #ecfdf5;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }
    .info-item {
      margin-bottom: 12px;
      display: flex;
      align-items: baseline;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      min-width: 120px;
      margin-right: 15px;
    }
    .info-value {
      color: #333;
      font-weight: 500;
    }
    .signers-box {
      background: #f8fafc;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .signer-item {
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .signer-item:last-child {
      border-bottom: none;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .download-button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 15px 40px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-icon">✅</div>
      <h1>署名完了のお知らせ</h1>
    </div>

    <div class="content">
      ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
      <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

      平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

      この度、以下の書類の署名が全て完了いたしましたのでご連絡申し上げます。

      <div class="success-box">
        <div class="info-item">
          <div class="info-label">書類名</div>
          <div class="info-value">${sanitizeContent(data.documentTitle)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">依頼ID</div>
          <div class="info-value">${sanitizeContent(data.envelopeId)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">完了日時</div>
          <div class="info-value">${formatDateJP(data.completedAt)}</div>
        </div>
      </div>

      <h3 style="color: #475569; font-size: 16px; margin: 25px 0 15px 0;">署名者</h3>
      <div class="signers-box">
        ${data.signers.map(s => `
        <div class="signer-item">
          <strong>${sanitizeContent(s.name)}</strong> 様
          <div style="font-size: 13px; color: #666; margin-top: 5px;">
            署名日時: ${formatDateJP(s.signedAt)}
          </div>
        </div>
        `).join('')}
      </div>

      ${data.documentUrl ? `
      <div class="button-container">
        <a href="${sanitizeContent(data.documentUrl)}" class="download-button">署名済み書類をダウンロード</a>
      </div>
      ` : ''}

      <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px; text-align: center; color: #0369a1; font-size: 14px;">
        本書類は法的に有効です。大切に保管してください。
      </div>

      <div style="margin-top: 30px; text-align: center; color: #475569;">
        今後とも、弊社サービスをよろしくお願い申し上げます。
      </div>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>兵庫県明石市上ノ丸2-11-21</div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

/**
 * 電子署名拒否通知メール（管理者向け）
 */
export function getSignatureDeclinedEmail(data: SignatureDeclinedEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【重要】署名が拒否されました（${data.documentTitle}）`,
    text: `
${recipientHeader}

署名依頼いただいていた書類について、署名者が拒否を行いました。

================================
拒否情報
================================
【書類名】${data.documentTitle}
【依頼ID】${data.envelopeId}
【拒否者】${data.declinedBy}
【拒否日時】${formatDateJP(data.declinedAt)}
${data.reason ? `【拒否理由】${data.reason}` : ''}
================================

ご確認の上、必要な対応をお願いいたします。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>署名拒否通知</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .content {
      padding: 40px 30px;
    }
    .alert-box {
      background: #fef2f2;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #ef4444;
    }
    .info-item {
      margin-bottom: 12px;
      display: flex;
      align-items: baseline;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      min-width: 120px;
      margin-right: 15px;
    }
    .info-value {
      color: #333;
      font-weight: 500;
    }
    .reason-box {
      background: #fff;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      border: 1px solid #fecaca;
      white-space: pre-wrap;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>⚠️ 署名拒否通知</h1>
    </div>

    <div class="content">
      <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

      署名依頼いただいていた書類について、署名者が拒否を行いました。

      <div class="alert-box">
        <div class="info-item">
          <div class="info-label">書類名</div>
          <div class="info-value">${sanitizeContent(data.documentTitle)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">依頼ID</div>
          <div class="info-value">${sanitizeContent(data.envelopeId)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">拒否者</div>
          <div class="info-value">${sanitizeContent(data.declinedBy)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">拒否日時</div>
          <div class="info-value">${formatDateJP(data.declinedAt)}</div>
        </div>
      </div>

      ${data.reason ? `
      <div class="reason-box">
        <strong style="color: #991b1b;">拒否理由</strong><br><br>
        ${sanitizeContent(data.reason)}
      </div>
      ` : ''}

      <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; text-align: center; color: #92400e;">
        ご確認の上、必要な対応をお願いいたします。
      </div>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

/**
 * 電子署名リマインダーメール
 */
export function getSignatureReminderEmail(data: SignatureReminderEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【リマインダー】署名のお願い（残り${data.daysUntilExpiry}日）`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

署名依頼いただいております書類について、有効期限が近づいておりますのでご案内申し上げます。

================================
署名依頼情報
================================
【書類名】${data.documentTitle}
【依頼ID】${data.envelopeId}
【有効期限】${formatDateJP(data.expiresAt)}（残り${data.daysUntilExpiry}日）
================================

${data.daysUntilExpiry <= 3 ? `
⚠️ 有効期限まであと${data.daysUntilExpiry}日となっております。
お手数ですが、至急署名の手続きをお願いいたします。

` : ''}

署名は以下のURLから行うことができます。

${data.signingUrl}

ご不明な点がございましたら、お気軽にお問い合わせください。

何卒よろしくお願い申し上げます。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>署名リマインダー</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: ${data.daysUntilExpiry <= 3
        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'};
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .content {
      padding: 40px 30px;
    }
    .info-box {
      background: #f8fafc;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid ${data.daysUntilExpiry <= 3 ? '#f59e0b' : '#3b82f6'};
    }
    .info-item {
      margin-bottom: 12px;
      display: flex;
      align-items: baseline;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      min-width: 120px;
      margin-right: 15px;
    }
    .info-value {
      color: #333;
      font-weight: 500;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .sign-button {
      display: inline-block;
      background: ${data.daysUntilExpiry <= 3
        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'};
      color: white;
      padding: 15px 40px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 4px 6px ${data.daysUntilExpiry <= 3
        ? 'rgba(245, 158, 11, 0.3)'
        : 'rgba(59, 130, 246, 0.3)'};
    }
    .alert-box {
      background: #fef3c7;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
      text-align: center;
      color: #92400e;
      font-size: 14px;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>${data.daysUntilExpiry <= 3 ? '⏰ 署名期限が近づいています' : '🔔 署名リマインダー'}</h1>
    </div>

    <div class="content">
      ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
      <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

      平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

      署名依頼いただいております書類について、有効期限が近づいておりますのでご案内申し上げます。

      <div class="info-box">
        <div class="info-item">
          <div class="info-label">書類名</div>
          <div class="info-value">${sanitizeContent(data.documentTitle)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">依頼ID</div>
          <div class="info-value">${sanitizeContent(data.envelopeId)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">有効期限</div>
          <div class="info-value">${formatDateJP(data.expiresAt)}（残り${data.daysUntilExpiry}日）</div>
        </div>
      </div>

      ${data.daysUntilExpiry <= 3 ? `
      <div class="alert-box">
        ⚠️ 有効期限まであと${data.daysUntilExpiry}日となっております。<br>
        お手数ですが、至急署名の手続きをお願いいたします。
      </div>
      ` : ''}

      <div class="button-container">
        <a href="${sanitizeContent(data.signingUrl)}" class="sign-button">署名する</a>
      </div>

      <div style="margin-top: 30px; text-align: center; color: #475569; font-size: 14px;">
        ご不明な点がございましたら、お気軽にお問い合わせください。<br><br>
        何卒よろしくお願い申し上げます。
      </div>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>兵庫県明石市上ノ丸2-11-21</div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

/**
 * 配送状況メールテンプレート
 * Shipping Status Email Template
 */
export function getShippingStatusEmail(data: ShippingStatusEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  // Carrier names in Japanese
  const carrierNames: Record<string, string> = {
    ems: 'EMS',
    surface_mail: '船便（船輸送）',
    sea_freight: '海上コンテナ',
    air_freight: '航空貨物',
    other: 'その他',
  };

  // Status labels in Japanese
  const statusLabels: Record<string, string> = {
    processing: '発送準備中',
    shipped: '発送完了',
    in_transit: '輸送中',
    out_for_delivery: '配達予定',
    delivered: '配達完了',
    failed: '配送失敗',
    returned: '返送されました',
  };

  const carrierName = carrierNames[data.carrier] || data.carrier;
  const statusLabel = statusLabels[data.status] || data.status;

  return {
    subject: `【配送状況】${data.orderNumber} - ${statusLabel}`,
    text: `
${recipientHeader}

平素よりEpackage Labをご利用いただきありがとうございます。
ご注文の配送状況についてご案内申し上げます。

================================
配送情報
================================
【注文番号】${data.orderNumber}
【配送業者】${carrierName}
【お問い合わせ番号】${data.trackingNumber}
【配送状況】${statusLabel}
================================

${data.estimatedDelivery ? `【配達予定日】${formatDateJP(data.estimatedDelivery)}\n` : ''}${data.location ? `【現在の場所】${data.location}\n` : ''}${data.message}

${data.trackingUrl ? `
【EMS追跡サイト】
${data.trackingUrl}
` : ''}${data.japanPostUrl ? `
【日本郵便追跡サイト】
${data.japanPostUrl}
` : ''}

ご不明な点がございましたら、お気軽にお問い合わせください。

何卒よろしくお願い申し上げます。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>配送状況</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
    }
    .info-box {
      background: #f0f9ff;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    .info-item {
      margin-bottom: 12px;
      display: flex;
      align-items: baseline;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      min-width: 120px;
      margin-right: 15px;
    }
    .info-value {
      color: #333;
      font-weight: 500;
    }
    .tracking-number {
      background: #fff;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
      border: 2px solid #3b82f6;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      color: #1d4ed8;
      letter-spacing: 2px;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      border-radius: 20px;
      font-weight: bold;
      margin-top: 10px;
    }
    .message-box {
      background: #fff;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .button-container {
      text-align: center;
      margin: 25px 0;
    }
    .tracking-button {
      display: inline-block;
      padding: 12px 30px;
      background: #3b82f6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 5px;
    }
    .tracking-button:hover {
      background: #2563eb;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>📦 配送状況ご案内</h1>
    </div>

    <div class="content">
      ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
      <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

      平素よりEpackage Labをご利用いただきありがとうございます。<br>
      ご注文の配送状況についてご案内申し上げます。

      <div class="info-box">
        <div class="info-item">
          <div class="info-label">注文番号</div>
          <div class="info-value">${sanitizeContent(data.orderNumber)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">配送業者</div>
          <div class="info-value">${sanitizeContent(carrierName)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">配送状況</div>
          <div class="info-value"><span class="status-badge">${sanitizeContent(statusLabel)}</span></div>
        </div>
        ${data.estimatedDelivery ? `
        <div class="info-item">
          <div class="info-label">配達予定日</div>
          <div class="info-value">${formatDateJP(data.estimatedDelivery)}</div>
        </div>
        ` : ''}
        ${data.location ? `
        <div class="info-item">
          <div class="info-label">現在の場所</div>
          <div class="info-value">${sanitizeContent(data.location)}</div>
        </div>
        ` : ''}
      </div>

      <div class="tracking-number">
        ${sanitizeContent(data.trackingNumber)}
      </div>

      <div class="message-box">
        ${sanitizeContent(data.message)}
      </div>

      ${data.trackingUrl || data.japanPostUrl ? `
      <div class="button-container">
        ${data.trackingUrl ? `
        <a href="${sanitizeContent(data.trackingUrl)}" class="tracking-button" target="_blank">
          EMS追跡サイト
        </a>
        ` : ''}
        ${data.japanPostUrl ? `
        <a href="${sanitizeContent(data.japanPostUrl)}" class="tracking-button" target="_blank">
          日本郵便追跡
        </a>
        ` : ''}
      </div>
      ` : ''}

      <div style="margin-top: 30px; text-align: center; color: #64748b; font-size: 14px;">
        ご不明な点がございましたら、お気軽にお問い合わせください。<br><br>
        何卒よろしくお願い申し上げます。
      </div>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>兵庫県明石市上ノ丸2-11-21</div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

/**
 * 配送完了メールテンプレート
 * Delivery Completion Email Template
 */
export function getDeliveryCompletionEmail(data: DeliveryCompletionEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  // Carrier names in Japanese
  const carrierNames: Record<string, string> = {
    yamato: 'ヤマト運輸',
    sagawa: '佐川急便',
    jp_post: '日本郵便',
    seino: '西濃運輸',
  };

  const carrierName = carrierNames[data.carrier] || data.carrierName;

  return {
    subject: `【配送完了】${data.orderNumber} - お届けいたしました`,
    text: `
${recipientHeader}

平素よりEpackage Labをご利用いただきありがとうございます。
この度、ご注文いただいた商品が配達完了いたしました。

================================
配送完了情報
================================
【注文番号】${data.orderNumber}
【出荷番号】${data.shipmentNumber}
【配送業者】${carrierName}
【お問い合わせ番号】${data.trackingNumber}
【配達日時】${formatDateJP(data.deliveredAt)}
================================

${data.deliveredTo ? `【受取人】${data.deliveredTo}\n` : ''}${data.deliveryAddress ? `
【配達先】
〒${data.deliveryAddress.postalCode}
${data.deliveryAddress.prefecture}${data.deliveryAddress.city}${data.deliveryAddress.address}
${data.deliveryAddress.building || ''}` : ''}${data.items ? `
【お届けした商品】
${data.items.map((item, i) => `${i + 1}. ${item.productName} x ${item.quantity}点`).join('\n')}` : ''}${data.deliveryNoteUrl ? `
\n【配送伝票URL】
${data.deliveryNoteUrl}
` : ''}

今後ともEpackage Labをよろしくお願い申し上げます。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>配送完了</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
    }
    .success-box {
      background: #f0fdf4;
      padding: 25px;
      margin: 20px 0;
      border-radius: 8px;
      border-left: 4px solid #10b981;
      text-align: center;
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .success-text {
      color: #10b981;
      font-size: 18px;
      font-weight: bold;
    }
    .info-box {
      background: #f9fafb;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .info-item {
      margin-bottom: 12px;
      display: flex;
      align-items: baseline;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      min-width: 120px;
      margin-right: 15px;
    }
    .info-value {
      color: #333;
      font-weight: 500;
    }
    .address-box {
      background: #fff;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .items-list {
      background: #fff;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .item {
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .item:last-child {
      border-bottom: none;
    }
    .button-container {
      text-align: center;
      margin: 25px 0;
    }
    .view-button {
      display: inline-block;
      padding: 12px 30px;
      background: #10b981;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>📦 配送完了のお知らせ</h1>
    </div>

    <div class="content">
      ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
      <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

      <div class="success-box">
        <div class="success-icon">✅</div>
        <div class="success-text">商品が無事に配達されました</div>
      </div>

      <p>平素よりEpackage Labをご利用いただきありがとうございます。<br>
      この度、ご注文いただいた商品が配達完了いたしましたことをご報告申し上げます。</p>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #10b981;">配送情報</h3>
        <div class="info-item">
          <div class="info-label">注文番号</div>
          <div class="info-value">${sanitizeContent(data.orderNumber)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">出荷番号</div>
          <div class="info-value"><code>${sanitizeContent(data.shipmentNumber)}</code></div>
        </div>
        <div class="info-item">
          <div class="info-label">配送業者</div>
          <div class="info-value">${sanitizeContent(carrierName)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">お問い合わせ番号</div>
          <div class="info-value" style="font-size: 18px; font-weight: bold; color: #10b981;">
            ${sanitizeContent(data.trackingNumber)}
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">配達日時</div>
          <div class="info-value">${formatDateJP(data.deliveredAt)}</div>
        </div>
        ${data.deliveredTo ? `
        <div class="info-item">
          <div class="info-label">受取人</div>
          <div class="info-value">${sanitizeContent(data.deliveredTo)}</div>
        </div>
        ` : ''}
      </div>

      ${data.deliveryAddress ? `
      <div class="address-box">
        <h4 style="margin-top: 0; margin-bottom: 15px;">配達先</h4>
        <div style="font-size: 14px; line-height: 1.6;">
          〒${sanitizeContent(data.deliveryAddress.postalCode)}<br>
          ${sanitizeContent(data.deliveryAddress.prefecture)}${sanitizeContent(data.deliveryAddress.city)}${sanitizeContent(data.deliveryAddress.address)}<br>
          ${data.deliveryAddress.building ? sanitizeContent(data.deliveryAddress.building) + '<br>' : ''}
        </div>
      </div>
      ` : ''}

      ${data.items && data.items.length > 0 ? `
      <div class="items-list">
        <h4 style="margin-top: 0; margin-bottom: 10px;">お届けした商品</h4>
        ${data.items.map((item, i) => `
          <div class="item">
            <strong>${i + 1}. ${sanitizeContent(item.productName)}</strong> x ${item.quantity}点
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${data.deliveryNoteUrl ? `
      <div class="button-container">
        <a href="${sanitizeContent(data.deliveryNoteUrl)}" class="view-button" target="_blank">
          配送伝票を表示
        </a>
      </div>
      ` : ''}

      <div style="margin-top: 30px; text-align: center; color: #475569; font-size: 14px;">
        今後ともEpackage Labをよろしくお願い申し上げます。<br><br>
        ご不明な点がございましたら、お気軽にお問い合わせください。
      </div>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>兵庫県明石市上ノ丸2-11-21</div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

// =====================================================
// Invoice Email Templates
// =====================================================

/**
 * 請求書メールデータ
 */
export interface InvoiceEmailData {
  /** 請求書番号 / Invoice number */
  invoiceNumber: string;
  /** 注文番号 / Order number */
  orderNumber: string;
  /** 発行日 / Issue date */
  issueDate: string;
  /** 支払期限 / Payment due date */
  dueDate: string;
  /** 請求金額 / Invoice amount */
  amount: number;
  /** 会社名 / Company name */
  companyName: string;
  /** 担当者名 / Contact person name */
  contactPerson?: string;
  /** 請求書PDF URL / Invoice PDF URL */
  invoicePdfUrl?: string;
  /** 支払方法 / Payment method */
  paymentMethod?: string;
  /** 備考 / Remarks */
  remarks?: string;
}

/**
 * 入金確認メールデータ
 * Payment Confirmation Email Data
 */
export interface PaymentConfirmationEmailData extends TemplateData {
  orderNumber: string;
  customerName: string;
  paymentAmount: number;
  paymentDate: string;
  totalAmount: number;
}

/**
 * 韓国発注書メールデータ
 * Purchase Order to Korea Email Data
 */
export interface PurchaseOrderKoreaEmailData extends TemplateData {
  orderNumber: string;
  companyName: string;
  items: Array<{
    productName: string;
    quantity: number;
    specifications: Record<string, any>;
  }>;
  totalQuantity: number;
  estimatedDelivery: string;
  purchaseOrderPdfUrl?: string;
}

/**
 * 韓国デザイナーデータ入稿通知メールデータ
 * Korea Designer Data Notification Email Data
 */
export interface KoreaDesignerDataNotificationEmailData extends TemplateData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  dataUploadUrl: string;
  correctionUploadUrl: string;
}

/**
 * 教正データ完成通知メールデータ（顧客向け）
 * Correction Ready for Review Email Data
 */
export interface CorrectionReadyForReviewEmailData extends TemplateData {
  orderNumber: string;
  revisionNumber: number;
  previewImageUrl: string;
  reviewUrl: string;
}

/**
 * 教正データ差し戻し通知メールデータ（韓国デザイナー向け）
 * Correction Rejected Email Data
 */
export interface CorrectionRejectedEmailData extends TemplateData {
  orderNumber: string;
  customerComment: string;
  correctionUploadUrl: string;
}

/**
 * 請求書発行メール（顧客向け）
 * Invoice Created Email (Customer)
 */
export function getInvoiceCreatedEmail(data: InvoiceEmailData): EmailTemplate {
  const formatYen = (amount: number) => `¥${amount.toLocaleString('ja-JP')}`;
  const formatDateJP = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return {
    subject: `【請求書発行】${data.invoiceNumber} Epackage Lab`,
    text: `
${data.companyName}
${data.contactPerson ? `${data.contactPerson} 様` : ''}

平素はEpackage Labをご利用いただき、誠にありがとうございます。

この度、以下の内容で請求書を発行いたしました。
請求書PDFを添付いたしますので、ご確認をお願い申し上げます。

────────────────────────────────
■ 請求書情報
────────────────────────────────
請求書番号：${data.invoiceNumber}
注文番号　：${data.orderNumber}
発行日　　：${formatDateJP(data.issueDate)}
支払期限　：${formatDateJP(data.dueDate)}
請求金額　：${formatYen(data.amount)}

${data.paymentMethod ? `支払方法　：${data.paymentMethod}` : ''}

${data.remarks ? `■ 備考\n${data.remarks}\n` : ''}────────────────────────────────

ご確認の上、支払期限までのお支払いをお願い申し上げます。

本メールに関してご不明な点がございましたら、
お気軽にお問い合わせください。

────────────────────────────────
Epackage Lab
兵庫県明石市上ノ丸2-11-21
Email: info@package-lab.com
${formatDateJP(new Date().toISOString())}
────────────────────────────────
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      margin-bottom: 20px;
      font-size: 15px;
    }
    .info-box {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .info-box-title {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 15px;
      color: #495057;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #dee2e6;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 500;
      color: #6c757d;
    }
    .info-value {
      font-weight: bold;
      color: #212529;
    }
    .amount-highlight {
      background: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 4px;
      padding: 10px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .view-button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 25px;
      font-weight: bold;
      transition: transform 0.2s;
    }
    .view-button:hover {
      transform: translateY(-2px);
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
    }
    .remarks {
      margin-top: 20px;
      padding: 15px;
      background: #fff9e6;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>請求書発行のお知らせ</h1>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.companyName}<br>
        ${data.contactPerson ? `${data.contactPerson} 様` : ''}
      </div>

      <p>平素はEpackage Labをご利用いただき、誠にありがとうございます。</p>

      <p>この度、以下の内容で請求書を発行いたしました。<br>
      請求書PDFを添付いたしますので、ご確認をお願い申し上げます。</p>

      <div class="info-box">
        <div class="info-box-title">請求書情報</div>
        <div class="info-row">
          <span class="info-label">請求書番号</span>
          <span class="info-value">${sanitizeContent(data.invoiceNumber)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">注文番号</span>
          <span class="info-value">${sanitizeContent(data.orderNumber)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">発行日</span>
          <span class="info-value">${formatDateJP(data.issueDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">支払期限</span>
          <span class="info-value">${formatDateJP(data.dueDate)}</span>
        </div>
        <div class="info-row amount-highlight">
          <span class="info-label">請求金額</span>
          <span class="info-value">${formatYen(data.amount)}</span>
        </div>
        ${data.paymentMethod ? `
        <div class="info-row">
          <span class="info-label">支払方法</span>
          <span class="info-value">${sanitizeContent(data.paymentMethod)}</span>
        </div>
        ` : ''}
      </div>

      ${data.invoicePdfUrl ? `
      <div class="button-container">
        <a href="${sanitizeContent(data.invoicePdfUrl)}" class="view-button" target="_blank">
          請求書PDFを表示
        </a>
      </div>
      ` : ''}

      ${data.remarks ? `
      <div class="remarks">
        <strong>備考</strong><br>
        ${sanitizeContent(data.remarks)}
      </div>
      ` : ''}

      <p style="margin-top: 30px; text-align: center;">
        ご確認の上、支払期限までのお支払いをお願い申し上げます。<br><br>
        ご不明な点がございましたら、お気軽にお問い合わせください。
      </p>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>兵庫県明石市上ノ丸2-11-21</div>
      <div>Email: info@package-lab.com</div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

/**
 * 請求書リマインダーメール（顧客向け）
 * Invoice Reminder Email (Customer)
 */
export function getInvoiceReminderEmail(data: InvoiceEmailData & { daysOverdue?: number }): EmailTemplate {
  const formatYen = (amount: number) => `¥${amount.toLocaleString('ja-JP')}`;
  const formatDateJP = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const isOverdue = data.daysOverdue !== undefined && data.daysOverdue > 0;
  const urgencyMessage = isOverdue
    ? `支払期限から${data.daysOverdue}日が経過しております。`
    : '支払期限まであとわずかとなっております。';

  return {
    subject: isOverdue
      ? `【重要】請求書のお支払い確認 ${data.invoiceNumber}`
      : `【リマインダー】請求書のお支払い期限 ${data.invoiceNumber}`,
    text: `
${data.companyName}
${data.contactPerson ? `${data.contactPerson} 様` : ''}

平素はEpackage Labをご利用いただき、誠にありがとうございます。

請求書番号：${data.invoiceNumber}につきまして、
${urgencyMessage}

お手数ですが、至急お支払いの手続きをお願い申し上げます。

────────────────────────────────
■ 請求書情報
────────────────────────────────
請求書番号：${data.invoiceNumber}
注文番号　：${data.orderNumber}
発行日　　：${formatDateJP(data.issueDate)}
支払期限　：${formatDateJP(data.dueDate)}
請求金額　：${formatYen(data.amount)}

${data.paymentMethod ? `支払方法　：${data.paymentMethod}` : ''}

${isOverdue ? `■ 遅延日数：${data.daysOverdue}日\n` : ''}────────────────────────────────

既にお支払い済みの場合は、このメールを無視してください。

ご不明な点がございましたら、お気軽にお問い合わせください。

────────────────────────────────
Epackage Lab
兵庫県明石市上ノ丸2-11-21
Email: info@package-lab.com
${formatDateJP(new Date().toISOString())}
────────────────────────────────
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      ${isOverdue ? 'background: linear-gradient(135deg, #f56565 0%, #c53030 100%);' : 'background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);'}
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 30px 20px;
    }
    .alert-box {
      ${isOverdue ? 'background: #fed7d7; border-color: #fc8181;' : 'background: #feebc8; border-color: #f6ad55;'}
      border: 2px solid;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .alert-box strong {
      display: block;
      font-size: 18px;
      margin-bottom: 10px;
      ${isOverdue ? 'color: #c53030;' : 'color: #dd6b20;'}
    }
    .info-box {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #dee2e6;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 500;
      color: #6c757d;
    }
    .info-value {
      font-weight: bold;
      color: #212529;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>${isOverdue ? '請求書のお支払い確認' : '請求書のお支払いリマインダー'}</h1>
    </div>

    <div class="content">
      <div>
        ${data.companyName}<br>
        ${data.contactPerson ? `${data.contactPerson} 様` : ''}
      </div>

      <p>平素はEpackage Labをご利用いただき、誠にありがとうございます。</p>

      <div class="alert-box">
        <strong>${isOverdue ? '【重要】' : '【リマインダー】'}</strong>
        請求書番号：${sanitizeContent(data.invoiceNumber)}につきまして、<br>
        ${sanitizeContent(urgencyMessage)}<br>
        お手数ですが、至急お支払いの手続きをお願い申し上げます。
      </div>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">請求書番号</span>
          <span class="info-value">${sanitizeContent(data.invoiceNumber)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">注文番号</span>
          <span class="info-value">${sanitizeContent(data.orderNumber)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">発行日</span>
          <span class="info-value">${formatDateJP(data.issueDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">支払期限</span>
          <span class="info-value">${formatDateJP(data.dueDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">請求金額</span>
          <span class="info-value">${formatYen(data.amount)}</span>
        </div>
        ${data.paymentMethod ? `
        <div class="info-row">
          <span class="info-label">支払方法</span>
          <span class="info-value">${sanitizeContent(data.paymentMethod)}</span>
        </div>
        ` : ''}
        ${isOverdue ? `
        <div class="info-row" style="background: #fed7d7;">
          <span class="info-label">遅延日数</span>
          <span class="info-value" style="color: #c53030;">${data.daysOverdue}日</span>
        </div>
        ` : ''}
      </div>

      <p style="margin-top: 30px; text-align: center; font-size: 14px; color: #6c757d;">
        既にお支払い済みの場合は、このメールを無視してください。<br><br>
        ご不明な点がございましたら、お気軽にお問い合わせください。
      </p>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>兵庫県明石市上ノ丸2-11-21</div>
      <div>Email: info@package-lab.com</div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

// =====================================================
// Template Selection Function
// =====================================================

/**
 * Select and render email template based on type
 */
export function renderEmailTemplate(
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
    | SignatureRequestEmailData
    | SignatureCompletedEmailData
    | SignatureDeclinedEmailData
    | SignatureReminderEmailData
    | ShippingStatusEmailData
    | DeliveryCompletionEmailData
    | InvoiceEmailData
    | (InvoiceEmailData & { daysOverdue?: number })
    | PaymentConfirmationEmailData
    | PurchaseOrderKoreaEmailData
): EmailTemplate {
  switch (type) {
    case 'welcome_customer':
      return getWelcomeCustomerEmail(data as WelcomeEmailData);

    case 'approval_customer':
      return getApprovalCustomerEmail(data as ApprovalEmailData);

    case 'rejection_customer':
      return getRejectionCustomerEmail(data as RejectionEmailData);

    case 'quote_created_customer':
      return getQuoteCreatedCustomerEmail(data as QuoteCreatedEmailData);

    case 'order_status_update':
      return getOrderStatusUpdateEmail(data as OrderStatusEmailData);

    case 'shipment_notification':
      return getShipmentNotificationCustomerEmail(data as ShipmentEmailData);

    case 'admin_new_order':
      return getAdminNewOrderEmail(data as OrderStatusEmailData);

    case 'admin_quote_request':
      return getAdminQuoteRequestEmail(data as QuoteCreatedEmailData);

    case 'korea_data_transfer':
      return getKoreaDataTransferEmail(data as KoreaDataTransferEmailData);

    case 'korea_correction_notification':
      return getKoreaCorrectionNotificationEmail(data as KoreaCorrectionNotificationEmailData);

    case 'spec_sheet_approval':
      return getSpecSheetApprovalEmail(data as SpecSheetApprovalEmailData);

    case 'spec_sheet_rejection':
      return getSpecSheetRejectionEmail(data as SpecSheetRejectionEmailData);

    case 'signature_request':
      return getSignatureRequestEmail(data as SignatureRequestEmailData);

    case 'signature_completed':
      return getSignatureCompletedEmail(data as SignatureCompletedEmailData);

    case 'signature_declined':
      return getSignatureDeclinedEmail(data as SignatureDeclinedEmailData);

    case 'signature_reminder':
      return getSignatureReminderEmail(data as SignatureReminderEmailData);

    case 'shipping_status':
      return getShippingStatusEmail(data as ShippingStatusEmailData);

    case 'delivery_completion':
      return getDeliveryCompletionEmail(data as DeliveryCompletionEmailData);

    case 'invoice_created':
      return getInvoiceCreatedEmail(data as InvoiceEmailData);

    case 'invoice_reminder':
    case 'invoice_overdue':
      return getInvoiceReminderEmail(data as InvoiceEmailData & { daysOverdue?: number });

    case 'payment_confirmation':
      return getPaymentConfirmationEmail(data as PaymentConfirmationEmailData);

    case 'purchase_order_korea':
      return getPurchaseOrderKoreaEmail(data as PurchaseOrderKoreaEmailData);

    case 'korea_designer_data_notification':
      return getKoreaDesignerDataNotificationEmail(data as KoreaDesignerDataNotificationEmailData);

    case 'correction_ready_for_review':
      return getCorrectionReadyForReviewEmail(data as CorrectionReadyForReviewEmailData);

    case 'correction_rejected':
      return getCorrectionRejectedEmail(data as CorrectionRejectedEmailData);

    default:
      throw new Error(`Unknown email template type: ${type}`);
  }
}

// =====================================================
// Helper: Generate consistent recipient data
// =====================================================

/**
 * Create recipient object from basic info
 */
export function createRecipient(
  name: string,
  email: string,
  company?: string
): EmailRecipient {
  return {
    name: sanitizeContent(name),
    email: sanitizeContent(email),
    company: company ? sanitizeContent(company) : undefined,
  };
}

// =====================================================
// Payment Confirmation Email Template
// =====================================================

/**
 * 入金確認メール（顧客向け）
 * Payment Confirmation Email (Customer)
 */
export function getPaymentConfirmationEmail(data: PaymentConfirmationEmailData): EmailTemplate {
  const formatYen = (amount: number) => `¥${amount.toLocaleString('ja-JP')}`;
  const formatDateJP = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return {
    subject: `【入金確認】${data.orderNumber} Epackage Lab`,
    text: `
${data.customerName} 様

平素はEpackage Labをご利用いただき、誠にありがとうございます。

この度、以下の注文について入金を確認いたしました。

────────────────────────────────
■ 入金情報
────────────────────────────────
注文番号　：${data.orderNumber}
入金額　　：${formatYen(data.paymentAmount)}
入金日　　：${formatDateJP(data.paymentDate)}
注文総額　：${formatYen(data.totalAmount)}

${data.paymentAmount < data.totalAmount ? `残金　　　：${formatYen(data.totalAmount - data.paymentAmount)}
※ 残金につきましては、別途ご請求いたします。` : ''}
※ 入金が確認でき次第、製造工程を開始いたします。

────────────────────────────────
■ 今後の流れ
────────────────────────────────
1. データ承認完了
2. 契約書署名
3. 製造開始

────────────────────────────────

ご不明な点がございましたら、お気軽にお問い合わせください。

引き続き、どうぞよろしくお願い申し上げます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EPACKAGE Lab
〒100-0001
東京都〇〇区〇〇1-2-3
TEL: 050-1793-6500
Email: info@package-lab.com
Web: https://epackage-lab.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`,
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>入金確認</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 30px;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }
    .section h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #10b981;
      font-size: 18px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #6b7280;
    }
    .info-value {
      color: #111827;
      font-weight: 500;
    }
    .amount {
      font-size: 24px;
      font-weight: bold;
      color: #10b981;
    }
    .highlight {
      background-color: #d1fae5;
      padding: 15px;
      border-radius: 4px;
      margin-top: 15px;
    }
    .steps {
      margin-top: 20px;
    }
    .step {
      display: flex;
      align-items: center;
      padding: 10px 0;
    }
    .step-number {
      width: 30px;
      height: 30px;
      background-color: #10b981;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 15px;
      flex-shrink: 0;
    }
    .footer {
      background-color: #1f2937;
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 12px;
    }
    .footer p {
      margin: 5px 0;
    }
    .footer a {
      color: #10b981;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>入金確認</h1>
    </div>

    <div class="content">
      <p style="margin-top: 0;">
        ${data.customerName} 様<br>
        平素はEpackage Labをご利用いただき、誠にありがとうございます。
      </p>
      <p>この度、以下の注文について入金を確認いたしました。</p>

      <div class="section">
        <h3>入金情報</h3>
        <div class="info-row">
          <span class="info-label">注文番号</span>
          <span class="info-value">${data.orderNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">入金額</span>
          <span class="info-value amount">${formatYen(data.paymentAmount)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">入金日</span>
          <span class="info-value">${formatDateJP(data.paymentDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">注文総額</span>
          <span class="info-value">${formatYen(data.totalAmount)}</span>
        </div>

        ${data.paymentAmount < data.totalAmount ? `
        <div class="highlight">
          <p style="margin: 0; color: #065f46;">
            <strong>残金：${formatYen(data.totalAmount - data.paymentAmount)}</strong><br>
            <span style="font-size: 14px;">※ 残金につきましては、別途ご請求いたします。</span>
          </p>
        </div>
        ` : `
        <div class="highlight">
          <p style="margin: 0; color: #065f46;">
            <strong>※ 入金が確認でき次第、製造工程を開始いたします。</strong>
          </p>
        </div>
        `}
      </div>

      <div class="section">
        <h3>今後の流れ</h3>
        <div class="steps">
          <div class="step">
            <span class="step-number">1</span>
            <span>データ承認完了</span>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <span>契約書署名</span>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <span>製造開始</span>
          </div>
        </div>
      </div>

      <p style="text-align: center; margin-top: 30px;">
        ご不明な点がございましたら、お気軽にお問い合わせください。<br>
        引き続き、どうぞよろしくお願い申し上げます。
      </p>
    </div>

    <div class="footer">
      <p><strong>EPACKAGE Lab</strong></p>
      <p>〒100-0001 東京都〇〇区〇〇1-2-3</p>
      <p>TEL: 050-1793-6500 | Email: info@package-lab.com</p>
      <p><a href="https://epackage-lab.com">https://epackage-lab.com</a></p>
    </div>
  </div>
</body>
</html>
`,
  };
}

// =====================================================
// Purchase Order to Korea Email Template
// =====================================================

/**
 * 韓国発注書メール（韓国パートナー向け）
 * Purchase Order to Korea Email
 */
export function getPurchaseOrderKoreaEmail(data: PurchaseOrderKoreaEmailData): EmailTemplate {
  const formatYen = (amount: number) => `¥${amount.toLocaleString('ja-JP')}`;
  const formatDateJP = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // Build items list
  const itemsList = data.items.map((item, index) => {
    const specs = item.specifications || {};
    const size = specs.dimensions || `${specs.width || 0}×${specs.height || 0}${specs.depth ? `×${specs.depth}` : ''}`;
    const material = specs.materialId === 'pet_al' ? 'PET/AL' :
                   specs.materialId === 'pet_pe' ? 'PET/PE' :
                   specs.materialId === 'kp' ? 'クラフト' :
                   specs.materialId || '-';
    return `${index + 1}. ${item.productName}
   - サイズ: ${size}
   - 素材: ${material}
   - 数量: ${item.quantity.toLocaleString()}個`;
  }).join('\n');

  // Calculate total amount
  const totalAmount = data.items.reduce((sum: number, item: any) => {
    const unitPrice = item.specifications?.unitPrice || 0;
    return sum + (unitPrice * item.quantity);
  }, 0);

  return {
    subject: `【発注】${data.orderNumber} ${data.companyName}`,
    text: `
韓国パートナーの皆様

平素はお世話になっております。

この度、以下の内容で発注させていただきます。

────────────────────────────────
■ 発注情報
────────────────────────────────
注文番号　：${data.orderNumber}
顧客名　　：${data.companyName}
納品予定　：${data.estimatedDelivery ? formatDateJP(data.estimatedDelivery) : '未定'}
総数量　　：${data.totalQuantity.toLocaleString()}個

────────────────────────────────
■ 注文明細
────────────────────────────────
${itemsList}

総額　　　：${formatYen(totalAmount)}

────────────────────────────────

ご確認のほど、よろしくお願い申し上げます。

EPACKAGE Lab
東京本社
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: info@package-lab.com
Tel: 050-1793-6500
`,
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>発注書</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 30px;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #8b5cf6;
    }
    .section h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #8b5cf6;
      font-size: 18px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #6b7280;
    }
    .info-value {
      color: #111827;
      font-weight: 500;
    }
    .items-list {
      background-color: #ffffff;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
      white-space: pre-line;
      font-family: monospace;
      font-size: 14px;
    }
    .footer {
      background-color: #1f2937;
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 12px;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>発注書</h1>
    </div>

    <div class="content">
      <p style="margin-top: 0;">
        韓国パートナーの皆様<br>
        平素はお世話になっております。
      </p>
      <p>この度、以下の内容で発注させていただきます。</p>

      <div class="section">
        <h3>発注情報</h3>
        <div class="info-row">
          <span class="info-label">注文番号</span>
          <span class="info-value">${data.orderNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">顧客名</span>
          <span class="info-value">${data.companyName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">納品予定</span>
          <span class="info-value">${data.estimatedDelivery ? formatDateJP(data.estimatedDelivery) : '未定'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">総数量</span>
          <span class="info-value">${data.totalQuantity.toLocaleString()}個</span>
        </div>
      </div>

      <div class="section">
        <h3>注文明細</h3>
        <div class="items-list">${itemsList.replace(/\n/g, '<br>')}</div>
      </div>

      <p style="text-align: center; margin-top: 30px;">
        ご確認のほど、よろしくお願い申し上げます。
      </p>
    </div>

    <div class="footer">
      <p><strong>EPACKAGE Lab</strong></p>
      <p>東京本社</p>
      <p>Email: info@package-lab.com</p>
      <p>Tel: 050-1793-6500</p>
    </div>
  </div>
</body>
</html>
`,
  };
}

// =====================================================
// Korea Designer Data Notification Email Template
// =====================================================

/**
 * 韓国デザイナーデータ入稿通知メール
 */
export function getKoreaDesignerDataNotificationEmail(data: KoreaDesignerDataNotificationEmailData): EmailTemplate {
  return {
    subject: `【データ入稿依頼】注文 ${data.orderNumber}`,
    text: `
韓国デザイナーの皆様

新しい注文でデータが入稿されました。

────────────────────────────────
■ 注文情報
────────────────────────────────
注文番号　：${data.orderNumber}
顧客名　　：${data.customerName}
顧客メール：${data.customerEmail}

────────────────────────────────
■ データ入稿URL
────────────────────────────────
${data.dataUploadUrl}

────────────────────────────────
■ 教正データアップロード
────────────────────────────────
以下のURLから教正データをアップロードしてください：

${data.correctionUploadUrl}

データをご確認の上、教正データの作成をお願いいたします。
`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>データ入稿依頼</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #1f2937;">【データ入稿依頼】新しい注文のデータが入稿されました</h2>

    <p>以下の注文でデータが入稿されました。</p>

    <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">注文情報</h3>
      <p><strong>注文番号：</strong>${data.orderNumber}</p>
      <p><strong>顧客名：</strong>${data.customerName}</p>
      <p><strong>顧客メール：</strong>${data.customerEmail}</p>
    </div>

    <div style="background-color: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">データ入稿URL</h3>
      <p><a href="${data.dataUploadUrl}" style="color: #1d4ed8; text-decoration: none;">${data.dataUploadUrl}</a></p>
    </div>

    <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">教正データアップロード</h3>
      <p>以下のURLから教正データをアップロードしてください：</p>
      <p><a href="${data.correctionUploadUrl}" style="color: #1d4ed8; text-decoration: none; font-weight: bold;">${data.correctionUploadUrl}</a></p>
    </div>

    <p>データをご確認の上、教正データの作成をお願いいたします。</p>
  </div>
</body>
</html>
`,
  };
}

// =====================================================
// Correction Ready for Review Email Template (Customer)
// =====================================================

/**
 * 教正データ完成通知メール（顧客向け）
 */
export function getCorrectionReadyForReviewEmail(data: CorrectionReadyForReviewEmailData): EmailTemplate {
  return {
    subject: `【教正データ完成】注文 ${data.orderNumber} のご確認をお願いいたします`,
    text: `
${data.recipient.name} 様

平素はEpackage Labをご利用いただき、誠にありがとうございます。

この度、注文 ${data.orderNumber} の教正データが完成いたしました。
以下のページからご確認ください。

────────────────────────────────
■ 教正データ情報
────────────────────────────────
注文番号　　：${data.orderNumber}
教正回数　　：${data.revisionNumber}回目

プレビュー画像：
${data.previewImageUrl}

────────────────────────────────
■ 確認ページ
────────────────────────────────
${data.reviewUrl}

内容をご確認の上、承認または修正依頼をお選びください。
`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>教正データ完成</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #1f2937;">【教正データ完成】ご確認をお願いいたします</h2>

    <p>${data.recipient.name} 様</p>
    <p>平素はEpackage Labをご利用いただき、誠にありがとうございます。</p>

    <p>この度、注文 ${data.orderNumber} の教正データが完成いたしました。</p>

    <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">教正データ情報</h3>
      <p><strong>注文番号：</strong>${data.orderNumber}</p>
      <p><strong>教正回数：</strong>${data.revisionNumber}回目</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <img src="${data.previewImageUrl}" alt="教正データプレビュー" style="max-width: 100%; border-radius: 5px; border: 1px solid #e5e7eb;">
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.reviewUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1d4ed8; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">教正データを確認する</a>
    </div>

    <p>内容をご確認の上、承認または修正依頼をお選びください。</p>
  </div>
</body>
</html>
`,
  };
}

// =====================================================
// Correction Rejected Email Template (Korea Designer)
// =====================================================

/**
 * 教正データ差し戻し通知メール（韓国デザイナー向け）
 */
export function getCorrectionRejectedEmail(data: CorrectionRejectedEmailData): EmailTemplate {
  return {
    subject: `【教正データ差し戻し】注文 ${data.orderNumber}`,
    text: `
韓国デザイナーの皆様

以下の注文で顧客から修正依頼がありました。

────────────────────────────────
■ 注文情報
────────────────────────────────
注文番号：${data.orderNumber}

顧客コメント：
${data.customerComment}

────────────────────────────────
■ 再度教正データをアップロード
────────────────────────────────
以下のURLから再度教正データをアップロードしてください：

${data.correctionUploadUrl}

お手数をおかけしますが、ご対応のほどよろしくお願いいたします。
`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>教正データ差し戻し</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #dc2626;">【教正データ差し戻し】顧客より修正依頼がありました</h2>

    <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
      <h3 style="margin-top: 0; color: #dc2626;">注文情報</h3>
      <p><strong>注文番号：</strong>${data.orderNumber}</p>
    </div>

    <div style="background-color: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">顧客コメント</h3>
      <p style="white-space: pre-wrap;">${data.customerComment}</p>
    </div>

    <div style="background-color: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">再度教正データをアップロード</h3>
      <p>以下のURLから再度教正データをアップロードしてください：</p>
      <p><a href="${data.correctionUploadUrl}" style="color: #1d4ed8; text-decoration: none; font-weight: bold;">${data.correctionUploadUrl}</a></p>
    </div>

    <p>お手数をおかけしますが、ご対応のほどよろしくお願いいたします。</p>
  </div>
</body>
</html>
`,
  };
}
