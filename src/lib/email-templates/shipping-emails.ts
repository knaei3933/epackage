/**
 * Shipping Email Templates
 *
 * Auto-extracted from email-templates.ts
 */

import {
  formatDateJP,
  formatCurrencyJP,
  getJapaneseEmailHeader,
  getJapaneseEmailFooter,
  sanitizeContent,
  sanitizeText,
} from './helpers';
import type {
  EmailTemplate,
  TemplateData,
  DeliveryCompletionEmailData,
  ShippingStatusEmailData,
} from './types';

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
      <div>兵庫県加古郡稲美町六分一486</div>
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
      <div>兵庫県加古郡稲美町六分一486</div>
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
 * 韓国デザイナーアップロード完了通知メールデータ
 * Korea Designer Upload Complete Email Data
 */
export interface KoreaDesignerUploadCompleteEmailData extends TemplateData {
  orderNumber: string;
  revisionNumber: number;
  previewImageUrl: string;
  reviewUrl: string;
  commentKo?: string;
  commentJa?: string;
  translationStatus: 'pending' | 'translated' | 'failed' | 'manual';
  designerName: string;
}

/**
 * デザイナートークンアップロードメールデータ（韓国語）
 * Designer Token Upload Email Data (Korean)
 */
export interface DesignerTokenUploadEmailData extends TemplateData {
  uploadUrl: string;
  orderNumber: string;
  customerName: string;
  expiresAt: string;
  expiresInDays: number;
  designerName: string;
}

/**
 * 翻訳失敗通知メールデータ（管理者向け）
 * Translation Failed Notice Email Data (Admin)
 */
export interface TranslationFailedNoticeEmailData extends TemplateData {
  orderNumber: string;
  revisionId: string;
  originalTextKo: string;
  errorDetails: string;
  manualTranslateUrl: string;
}

/**
 * 請求書発行メール（顧客向け）
 * Invoice Created Email (Customer)
 */

