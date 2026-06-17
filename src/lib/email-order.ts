/**
 * Order Email Templates and Sending Functions
 *
 * 注文関連メール送信機能
 * - 注文確認メール (顧客用)
 * - 注文受領通知メール (管理者用)
 */

import { sendContactEmail, getEmailConfigStatus } from './email';

// Alias for consistency
const sendEmail = sendContactEmail;
import sanitizeHtml from 'sanitize-html';

// =====================================================
// Types
// =====================================================

export interface OrderConfirmationEmailData {
  orderId: string;
  orderNumber: string;
  quotationNumber: string;
  customerEmail: string;
  customerName: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  estimatedDeliveryDate?: string | null;
  paymentTerm?: 'credit' | 'advance';
  shippingAddress?: {
    postalCode: string;
    prefecture: string;
    city: string;
    addressLine1: string;
    addressLine2?: string;
    company: string;
    contactName: string;
    phone: string;
  };
  deliveryNotes?: string;
  customerNotes?: string;
  isAdmin?: boolean;
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Sanitize user input
 */
function sanitizeUserMessage(message: string): string {
  const clean = sanitizeHtml(message, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return clean.replace(/\n/g, '<br>');
}

/**
 * Format currency (JPY)
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}

/**
 * Format date (Japanese)
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '未定';
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get payment term label
 */
function getPaymentTermLabel(term: 'credit' | 'advance' | undefined): string {
  if (!term) return '掛け払い';
  return term === 'credit' ? '掛け払い' : '前払い';
}

// =====================================================
// Email Templates
// =====================================================

/**
 * Order Confirmation Email Template (Customer)
 */
const getOrderConfirmationEmail = (data: OrderConfirmationEmailData) => {
  const itemsList = data.items
    .map(
      (item, i) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px; text-align: center;">${i + 1}</td>
      <td style="padding: 12px 8px;">${item.productName}</td>
      <td style="padding: 12px 8px; text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: bold;">${formatCurrency(item.totalPrice)}</td>
    </tr>
  `
    )
    .join('');

  const shippingAddress = data.shippingAddress
    ? `
  〒${data.shippingAddress.postalCode}<br>
  ${data.shippingAddress.prefecture} ${data.shippingAddress.city}<br>
  ${data.shippingAddress.addressLine1}${data.shippingAddress.addressLine2 ? ' ' + data.shippingAddress.addressLine2 : ''}<br>
  ${data.shippingAddress.company}<br>
  ${data.shippingAddress.contactName} 様<br>
  電話: ${data.shippingAddress.phone}
  `
    : '未指定';

  return {
    to: data.customerEmail,
    from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
    subject: `【Epackage Lab】注文を受け付けました (${data.orderNumber})`,
    text: `
${data.customerName} 様

この度は、Epackage Labをご利用いただきありがとうございます。
見積書 ${data.quotationNumber} に基づく注文を受け付けました。

================================
注文情報
================================

【注文番号】${data.orderNumber}
【見積番号】${data.quotationNumber}
【注文日時】${new Date().toLocaleDateString('ja-JP')}

--------------------------------
注文内容
--------------------------------
${data.items
  .map(
    (item, i) =>
      `${i + 1}. ${item.productName}\n   単価: ${formatCurrency(item.unitPrice)}\n   数量: ${item.quantity}\n   小計: ${formatCurrency(item.totalPrice)}`
  )
  .join('\n\n')}

================================
金額明細
================================

小計: ${formatCurrency(data.subtotal)}
消費税 (10%): ${formatCurrency(data.taxAmount)}
合計: ${formatCurrency(data.totalAmount)}

【お支払い方法】${getPaymentTermLabel(data.paymentTerm)}
【納品予定日】${formatDate(data.estimatedDeliveryDate ?? null)}

--------------------------------
配送先
--------------------------------
${shippingAddress.replace(/<br>/g, '\n')}

${data.deliveryNotes ? `【配送備考】\n${data.deliveryNotes}\n\n` : ''}${data.customerNotes ? `【お客様メモ】\n${sanitizeUserMessage(data.customerNotes)}\n\n` : ''}================================
次のステップ
================================

1. データ受領: デザインデータや仕様書をご提出ください
2. 作業標準書作成: 製造仕様を確定させます
3. 契約書送信: 電子契約書を送信します
4. 製造開始: 契約完了後、製造を開始します

================================
お問い合わせ
================================

ご不明な点がございましたら、お気軽にお問い合わせください。

Epackage Lab
URL: https://epackage-lab.com
Email: ${process.env.ADMIN_EMAIL || 'admin@epackage-lab.com'}

※このメールはシステムによる自動送信です。
  `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 650px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: bold; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .content { padding: 40px 30px; }
    .order-number { background: #ecfdf5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; }
    .order-number .number { font-size: 24px; font-weight: bold; color: #059669; }
    .info-box { background: #f9fafb; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #10b981; }
    .info-box h3 { margin-top: 0; color: #059669; font-size: 18px; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table th { background: #059669; color: white; padding: 12px 8px; text-align: left; font-weight: bold; }
    .table td { padding: 12px 8px; border-bottom: 1px solid #e5e7eb; }
    .table tr:last-child td { border-bottom: none; }
    .table tr:nth-child(even) { background: #f9fafb; }
    .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .summary-row.total { font-size: 18px; font-weight: bold; color: #059669; border-top: 2px solid #d1d5db; margin-top: 10px; padding-top: 15px; }
    .steps { background: #eff6ff; padding: 25px; border-radius: 8px; margin: 25px 0; }
    .steps h3 { margin-top: 0; color: #1d4ed8; }
    .step { display: flex; margin: 15px 0; }
    .step-number { background: #1d4ed8; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 15px; }
    .step-content { flex: 1; }
    .footer { background: #1f2937; color: white; padding: 30px; text-align: center; font-size: 13px; }
    .footer a { color: #10b981; text-decoration: none; }
    .label { color: #666; font-size: 13px; margin-bottom: 4px; }
    .value { font-size: 15px; margin-bottom: 15px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>注文を受け付けました</h1>
      <p>この度は、Epackage Labをご利用いただきありがとうございます。</p>
    </div>

    <div class="content">
      <p style="margin-top: 0;">
        <strong>${data.customerName}</strong> 様
      </p>
      <p>
        見積書 <strong>${data.quotationNumber}</strong> に基づく注文を受け付けました。<br>
        注文の詳細は以下の通りです。
      </p>

      <div class="order-number">
        <div style="font-size: 14px; margin-bottom: 8px;">注文番号</div>
        <div class="number">${data.orderNumber}</div>
        <div style="font-size: 12px; margin-top: 10px; color: #666;">注文日時: ${new Date().toLocaleDateString('ja-JP')}</div>
      </div>

      <div class="info-box">
        <h3>注文内容</h3>
        <table class="table">
          <thead>
            <tr>
              <th style="text-align: center; width: 50px;">#</th>
              <th>商品名</th>
              <th style="text-align: right; width: 110px;">単価</th>
              <th style="text-align: center; width: 70px;">数量</th>
              <th style="text-align: right; width: 120px;">小計</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>
      </div>

      <div class="info-box">
        <h3>金額明細</h3>
        <div class="summary">
          <div class="summary-row">
            <span>小計</span>
            <span>${formatCurrency(data.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>消費税 (10%)</span>
            <span>${formatCurrency(data.taxAmount)}</span>
          </div>
          <div class="summary-row total">
            <span>合計</span>
            <span>${formatCurrency(data.totalAmount)}</span>
          </div>
        </div>
        <div style="margin-top: 20px;">
          <div class="label">お支払い方法</div>
          <div class="value">${getPaymentTermLabel(data.paymentTerm)}</div>
          <div class="label">納品予定日</div>
          <div class="value">${formatDate(data.estimatedDeliveryDate ?? null)}</div>
        </div>
      </div>

      <div class="info-box">
        <h3>配送先</h3>
        <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">
          ${shippingAddress}
        </div>
        ${data.deliveryNotes ? `
          <div style="margin-top: 15px;">
            <div class="label">配送備考</div>
            <div class="value">${sanitizeUserMessage(data.deliveryNotes)}</div>
          </div>
        ` : ''}
      </div>

      ${data.customerNotes ? `
      <div class="info-box">
        <h3>お客様メモ</h3>
        <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb; white-space: pre-wrap;">${sanitizeUserMessage(data.customerNotes)}</div>
      </div>
      ` : ''}

      <div class="steps">
        <h3>次のステップ</h3>
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <strong>データ受領</strong><br>
            デザインデータや仕様書をご提出ください
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <strong>作業標準書作成</strong><br>
            製造仕様を確定させます
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <strong>契約書送信</strong><br>
            電子契約書を送信します
          </div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <strong>製造開始</strong><br>
            契約完了後、製造を開始します
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p><strong>Epackage Lab</strong></p>
      <p style="margin: 10px 0;">
        URL: <a href="https://epackage-lab.com">https://epackage-lab.com</a><br>
        Email: ${process.env.ADMIN_EMAIL || 'admin@epackage-lab.com'}
      </p>
      <p style="font-size: 11px; opacity: 0.7; margin-top: 15px;">※このメールはシステムによる自動送信です。</p>
    </div>
  </div>
</body>
</html>
  `.trim(),
  };
};

/**
 * Order Admin Notification Email Template
 */
const getOrderAdminNotificationEmail = (data: OrderConfirmationEmailData) => {
  const itemsList = data.items
    .map(
      (item, i) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px 8px;">${i + 1}</td>
      <td style="padding: 10px 8px;">${item.productName}</td>
      <td style="padding: 10px 8px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px 8px; text-align: right;">${formatCurrency(item.totalPrice)}</td>
    </tr>
  `
    )
    .join('');

  return {
    to: process.env.ADMIN_EMAIL || 'admin@epackage-lab.com',
    from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
    subject: `【新規注文】${data.orderNumber} - ${data.customerName}`,
    text: `
新しい注文がありました。

================================
注文情報
================================

【注文番号】${data.orderNumber}
【注文ID】${data.orderId}
【見積番号】${data.quotationNumber}
【注文日時】${new Date().toLocaleDateString('ja-JP')}

--------------------------------
顧客情報
--------------------------------
【お名前】${data.customerName}
【メールアドレス】${data.customerEmail}

--------------------------------
注文内容
--------------------------------
${data.items
  .map(
    (item, i) =>
      `${i + 1}. ${item.productName}\n   数量: ${item.quantity}\n   小計: ${formatCurrency(item.totalPrice)}`
  )
  .join('\n\n')}

--------------------------------
金額
--------------------------------
小計: ${formatCurrency(data.subtotal)}
消費税: ${formatCurrency(data.taxAmount)}
合計: ${formatCurrency(data.totalAmount)}

【お支払い方法】${getPaymentTermLabel(data.paymentTerm)}
【納品予定日】${formatDate(data.estimatedDeliveryDate ?? null)}

================================
管理画面で詳細をご確認ください
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
    .alert { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
    .alert h2 { margin: 0 0 10px; color: #059669; font-size: 20px; }
    .info-box { background: #f9fafb; padding: 20px; margin: 15px 0; border-radius: 8px; }
    .info-box h3 { margin-top: 0; color: #374151; font-size: 16px; }
    .label { color: #666; font-size: 13px; font-weight: bold; margin-bottom: 4px; }
    .value { color: #333; font-size: 15px; margin-bottom: 12px; }
    .code { background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace; }
    .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .table th { background: #059669; color: white; padding: 10px 8px; text-align: left; font-weight: bold; }
    .table td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
    .total { background: #f3f4f6; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <h2>📦 新規注文通知</h2>
    </div>

    <div class="info-box">
      <h3>注文情報</h3>
      <div class="label">注文番号</div>
      <div class="value"><span class="code">${data.orderNumber}</span></div>

      <div class="label">注文ID</div>
      <div class="value"><span class="code">${data.orderId}</span></div>

      <div class="label">見積番号</div>
      <div class="value">${data.quotationNumber}</div>

      <div class="label">注文日時</div>
      <div class="value">${new Date().toLocaleDateString('ja-JP')}</div>
    </div>

    <div class="info-box">
      <h3>顧客情報</h3>
      <div class="label">お名前</div>
      <div class="value">${data.customerName}</div>

      <div class="label">メールアドレス</div>
      <div class="value"><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></div>
    </div>

    <div class="info-box">
      <h3>注文内容</h3>
      <table class="table">
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th>商品名</th>
            <th style="width: 70px; text-align: center;">数量</th>
            <th style="width: 120px; text-align: right;">小計</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
          <tr class="total">
            <td colspan="3" style="text-align: right; padding: 15px 8px;">合計</td>
            <td style="text-align: right; padding: 15px 8px; color: #059669; font-size: 16px;">${formatCurrency(data.totalAmount)}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 15px;">
        <span class="label">お支払い方法:</span>
        <span style="margin-left: 10px;">${getPaymentTermLabel(data.paymentTerm)}</span><br>
        <span class="label">納品予定日:</span>
        <span style="margin-left: 10px;">${formatDate(data.estimatedDeliveryDate ?? null)}</span>
      </div>
    </div>

    <div style="text-align: center; margin-top: 30px; padding: 20px; background: #eff6ff; border-radius: 8px;">
      <p style="margin: 0; color: #1d4ed8; font-weight: bold;">
        管理画面で詳細をご確認ください
      </p>
    </div>
  </div>
</body>
</html>
  `.trim(),
  };
};

// =====================================================
// Export Functions
// =====================================================

/**
 * Send Order Confirmation Email (Customer)
 */
export async function sendOrderConfirmationEmail(
  data: OrderConfirmationEmailData
): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
  previewUrl?: string;
}> {
  try {
    const emailParams = data.isAdmin
      ? getOrderAdminNotificationEmail(data)
      : getOrderConfirmationEmail(data);

    const result = await (sendEmail as any)(
      emailParams.to,
      emailParams.subject,
      emailParams.text,
      emailParams.html
    );

    if (result.success) {
      console.log('[Order Email] Email sent successfully:', {
        type: data.isAdmin ? 'admin' : 'customer',
        orderNumber: data.orderNumber,
        messageId: result.messageId,
      });
    } else {
      console.error('[Order Email] Failed to send email:', result.error);
    }

    return result;
  } catch (error: unknown) {
    const errMsg = (error as { message?: string }).message;
    console.error('[Order Email] Error sending email:', error);
    return {
      success: false,
      error: errMsg || 'Unknown error',
    };
  }
}

/**
 * Get order email configuration status
 */
export function getOrderEmailConfigStatus() {
  return {
    ...getEmailConfigStatus(),
    templates: {
      orderConfirmation: true,
      orderAdminNotification: true,
    },
  };
}
