/**
 * Invoice Email Templates
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
  InvoiceEmailData,
} from './types';

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
兵庫県加古郡稲美町六分一486
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
      <div>兵庫県加古郡稲美町六分一486</div>
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
兵庫県加古郡稲美町六分一486
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
      <div>兵庫県加古郡稲美町六分一486</div>
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

