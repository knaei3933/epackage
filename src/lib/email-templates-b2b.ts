/**
 * B2B Workflow Email Templates (Extension)
 *
 * 追加のB2Bワークフローメールテンプレート
 * - 注文作成通知
 * - 仕様却下通知
 * - 製造開始通知
 * - 配送情報通知
 * - アーカイブ完了通知
 */

import { getJapaneseEmailHeader, getJapaneseEmailFooter, formatDateJP } from './email-templates';
import sanitizeHtml from 'sanitize-html';

// =====================================================
// Utility Functions (Re-export)
// =====================================================

function sanitizeContent(content: string): string {
  const clean = sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return clean.replace(/\n/g, '<br>');
}

function sanitizeText(content: string): string {
  return sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

// =====================================================
// Template Types
// =====================================================

export interface EmailRecipient {
  name: string;
  email: string;
  company?: string;
}

export interface TemplateData {
  recipient: EmailRecipient;
  sender?: {
    name: string;
    email: string;
    title?: string;
  };
}

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

// =====================================================
// Order Created Email Templates (B2B Workflow)
// =====================================================

/**
 * 注文作成メール（顧客向け）
 */
export interface OrderCreatedCustomerEmailData extends TemplateData {
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  orderUrl: string;
}

export function getOrderCreatedCustomerEmail(data: OrderCreatedCustomerEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  const itemsList = data.items.map(item =>
    `${item.productName} x ${item.quantity}: ¥${item.price.toLocaleString()}`
  ).join('\n');

  return {
    subject: `【Epackage Lab】注文を受け付けました (注文番号: ${data.orderNumber})`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。
この度は、ご注文いただき誠にありがとうございます。

注文を受け付けましたので、ご連絡申し上げます。

================================
注文詳細
================================
【注文番号】${data.orderNumber}
【注文日】${formatDateJP(data.orderDate)}

【注文内容】
${itemsList}

【合計金額】¥${data.totalAmount.toLocaleString()}

================================
次のステップ
================================
1. データ入稿（デザインファイルのアップロード）
2. 韓国パートナーによるデータ確認
3. 教正データの作成
4. 最終仕様書のご確認
5. 入金確認
6. 製造開始

注文の詳細は以下のURLからご確認いただけます。
${data.orderUrl}

ご不明な点がございましたら、お気軽にお問い合わせください。

${footer}

※このメールはシステムによる自動送信です。
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>注文を受け付けました</title>
</head>
<body>
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5;">
    <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0;">注文を受け付けました</h1>
    </div>
    <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
      <p>${sanitizeContent(data.recipient.company || data.recipient.name)} 様</p>
      <div style="text-align: center; font-size: 24px; font-weight: bold; color: #059669; margin: 20px 0;">
        注文番号: ${sanitizeContent(data.orderNumber)}
      </div>
      <div style="background: #f0fdf4; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #059669;">注文詳細</h3>
        <p>注文日: ${formatDateJP(data.orderDate)}</p>
      </div>
      <a href="${sanitizeContent(data.orderUrl)}" style="display: block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; margin: 20px 0;">
        注文詳細を確認
      </a>
    </div>
  </div>
</body>
</html>
`,
  };
}

/**
 * 注文作成通知メール（管理者向け）
 */
export interface OrderCreatedAdminEmailData extends TemplateData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  totalAmount: number;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
  orderUrl: string;
}

export function getOrderCreatedAdminEmail(data: OrderCreatedAdminEmailData): EmailTemplate {
  const itemsList = data.items.map(item =>
    `${item.productName} x ${item.quantity}`
  ).join('\n');

  return {
    subject: `【新規注文】${data.orderNumber} - ${data.customerName}様`,
    text: `
管理者の皆様

新しい注文が入りました。

================================
注文情報
================================
【注文番号】${data.orderNumber}
【顧客名】${data.customerName}
【会社名】${data.customerCompany || '-'}
【メール】${data.customerEmail}
【金額】¥${data.totalAmount.toLocaleString()}

【注文内容】
${itemsList}

================================
注文詳細は以下のURLからご確認ください。
${data.orderUrl}

速やかに対応をお願いいたします。
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>新規注文通知</title>
</head>
<body>
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden;">
    <div style="background: #ef4444; color: white; padding: 20px;">
      <h1 style="margin: 0;">🚨 新規注文</h1>
    </div>
    <div style="padding: 30px;">
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${sanitizeContent(data.orderNumber)}</h3>
        <p>${sanitizeContent(data.customerName)} 様</p>
        ${data.customerCompany ? `<p>${sanitizeContent(data.customerCompany)}</p>` : ''}
        <p><strong>¥${data.totalAmount.toLocaleString()}</strong></p>
      </div>
      <a href="${sanitizeContent(data.orderUrl)}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none;">
        注文詳細を確認
      </a>
    </div>
  </div>
</body>
</html>
`,
  };
}

/**
 * 仕様却下通知メール（管理者向け）
 */
export interface SpecRejectedAdminEmailData extends TemplateData {
  orderNumber: string;
  customerName: string;
  revisionNumber: number;
  customerComment: string;
  orderUrl: string;
}

export function getSpecRejectedAdminEmail(data: SpecRejectedAdminEmailData): EmailTemplate {
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【修正要求】${data.orderNumber} - リビジョン#${data.revisionNumber}`,
    text: `
管理者の皆様

顧客から教正データに対する修正要求が届きました。

================================
注文情報
================================
【注文番号】${data.orderNumber}
【リビジョン】#${data.revisionNumber}
【顧客名】${data.customerName}

【修正内容】
${data.customerComment}

================================
速やかに対応をお願いいたします。
${data.orderUrl}

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>修正要求通知</title>
</head>
<body>
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px;">
      <h2 style="margin-top: 0;">⚠️ 修正要求</h2>
      <p><strong>${sanitizeContent(data.orderNumber)}</strong></p>
      <p>リビジョン #${data.revisionNumber}</p>
      <p>${sanitizeContent(data.customerName)} 様</p>
      <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 4px;">
        <strong>修正内容:</strong><br>
        ${sanitizeContent(data.customerComment).replace(/\n/g, '<br>')}
      </div>
      <a href="${sanitizeContent(data.orderUrl)}">注文詳細</a>
    </div>
  </div>
</body>
</html>
`,
  };
}

/**
 * 製造開始通知メール（顧客向け）
 */
export interface ProductionStartedCustomerEmailData extends TemplateData {
  orderNumber: string;
  productName: string;
  estimatedCompletion?: string;
  trackingUrl?: string;
}

export function getProductionStartedCustomerEmail(data: ProductionStartedCustomerEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【製造開始】${data.orderNumber} - 製造が開始されました`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

注文いただきました製品の製造を開始いたしましたので、ご連絡申し上げます。

================================
製造開始情報
================================
【注文番号】${data.orderNumber}
【製品名】${data.productName}
${data.estimatedCompletion ? `【完了予定】${formatDateJP(data.estimatedCompletion)}` : ''}

================================
製造完了次第、配送手続きに入らせていただきます。

進捗状況は会員ダッシュボードからご確認いただけます。

引き続き、よろしくお願い申し上げます。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>製造開始通知</title>
</head>
<body>
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #d1fae5; padding: 20px; border-radius: 8px; text-align: center;">
      <h1 style="color: #065f46; margin: 0;">🏭 製造開始</h1>
      <p>${sanitizeContent(data.orderNumber)}</p>
      <p>${sanitizeContent(data.productName)}</p>
      ${data.estimatedCompletion ? `<p>完了予定: ${formatDateJP(data.estimatedCompletion)}</p>` : ''}
    </div>
  </div>
</body>
</html>
`,
  };
}

/**
 * 配送情報入力通知メール（顧客向け）
 */
export interface ShippingInfoCustomerEmailData extends TemplateData {
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  trackingUrl?: string;
}

export function getShippingInfoCustomerEmail(data: ShippingInfoCustomerEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【発送準備完了】${data.orderNumber} - 商品を発送いたしました`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

注文いただきました商品の発送準備が完了いたしました。

================================
配送情報
================================
【注文番号】${data.orderNumber}
【送付状番号】${data.trackingNumber}
【配送業者】${data.carrier}
【到着予定】${formatDateJP(data.estimatedDelivery)}

${data.trackingUrl ? `配送状況は以下のURLからご確認いただけます。\n${data.trackingUrl}` : ''}

================================
商品の到着をお待ちください。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>発送通知</title>
</head>
<body>
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #dbeafe; padding: 20px; border-radius: 8px;">
      <h1 style="color: #1e40af; margin: 0;">📦 発送準備完了</h1>
      <p><strong>${sanitizeContent(data.orderNumber)}</strong></p>
      <p>送付状番号: ${sanitizeContent(data.trackingNumber)}</p>
      <p>配送業者: ${sanitizeContent(data.carrier)}</p>
      <p>到着予定: ${formatDateJP(data.estimatedDelivery)}</p>
      ${data.trackingUrl ? `<a href="${sanitizeContent(data.trackingUrl)}">配送状況を確認</a>` : ''}
    </div>
  </div>
</body>
</html>
`,
  };
}

/**
 * アーカイブ完了通知メール（管理者向け）
 */
export interface ArchiveCompletedAdminEmailData extends TemplateData {
  archivedCount: number;
  archiveDate: string;
}

export function getArchiveCompletedAdminEmail(data: ArchiveCompletedAdminEmailData): EmailTemplate {
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【アーカイブ完了】${data.archivedCount}件の注文をアーカイブしました`,
    text: `
管理者の皆様

注文の自動アーカイブ処理が完了いたしました。

================================
アーカイブ情報
================================
【アーカイブ日時】${formatDateJP(data.archiveDate)}
【アーカイブ件数】${data.archivedCount}件

対象: 配送完了から3ヶ月以上経過した注文

================================
${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>アーカイブ完了通知</title>
</head>
<body>
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #f3e8ff; padding: 20px; border-radius: 8px;">
      <h1 style="color: #7c3aed; margin: 0;">📦 アーカイブ完了</h1>
      <p><strong>${data.archivedCount}件</strong>の注文をアーカイブしました</p>
      <p>アーカイブ日時: ${formatDateJP(data.archiveDate)}</p>
    </div>
  </div>
</body>
</html>
`,
  };
}
