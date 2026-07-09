/**
 * Admin Email Templates
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
  OrderStatusEmailData,
  QuoteCreatedEmailData,
} from './types';

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

/**
 * 韓国パートナーデータ転送メールテンプレート
 */

