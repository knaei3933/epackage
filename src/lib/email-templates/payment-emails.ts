/**
 * Payment Email Templates
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
import type { EmailTemplate } from './types';
import type {
  PaymentConfirmationEmailData,
  PurchaseOrderKoreaEmailData,
} from './types';

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

