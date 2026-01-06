/**
 * 見積承認通知（顧客用）
 *
 * 見積が承認された際に顧客へ通知するメールテンプレート
 */

import { QuoteApprovedCustomerData } from '@/types/email'

/**
 * メール件名
 */
export const subject = (data: QuoteApprovedCustomerData): string => {
  return `[EPackage Lab] 見積が承認されました: ${data.quotation_number}`
}

/**
 * メール本文（プレーンテキスト）
 */
export const plainText = (data: QuoteApprovedCustomerData): string => {
  return `
${data.customer_name} 様

ご依頼いただいた見積が承認されました。

====================
見積詳細
====================

見積番号: ${data.quotation_number}
見積ID: ${data.quotation_id}

見積金額: ¥${data.total_amount.toLocaleString('ja-JP')}
有効期限: ${data.valid_until}

承認日時: ${data.approved_at}

====================

この見積に基づいて注文を進めるには、以下のリンクから確認してください。

${data.confirm_url}

有効期限内にご確認をお願いいたします。

--------------------
EPackage Lab B2Bシステム
このメールはシステムにより自動送信されています。
お問い合わせ: support@epackage-lab.com
--------------------
`.trim()
}

/**
 * メール本文（HTML）
 */
export const html = (data: QuoteApprovedCustomerData): string => {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .success-box { background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: bold; width: 140px; color: #666; }
    .info-value { flex: 1; }
    .amount { font-size: 20px; font-weight: bold; color: #10b981; }
    .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
    .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>見積が承認されました</h1>
    </div>
    <div class="content">
      <p>${data.customer_name} 様</p>
      <p>ご依頼いただいた見積が承認されました。</p>

      <div class="success-box">
        <h3>見積詳細</h3>
        <div class="info-row">
          <span class="info-label">見積番号</span>
          <span class="info-value">${data.quotation_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">見積ID</span>
          <span class="info-value">${data.quotation_id}</span>
        </div>
        <div class="info-row">
          <span class="info-label">見積金額</span>
          <span class="info-value amount">¥${data.total_amount.toLocaleString('ja-JP')}</span>
        </div>
        <div class="info-row">
          <span class="info-label">有効期限</span>
          <span class="info-value">${data.valid_until}</span>
        </div>
        <div class="info-row">
          <span class="info-label">承認日時</span>
          <span class="info-value">${data.approved_at}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${data.confirm_url}" class="button">注文に進む</a>
      </div>

      <div class="alert">
        <strong>⚠️ 有効期限をご確認ください</strong><br>
        見積の有効期限は <strong>${data.valid_until}</strong> です。<br>
        期限切れの場合は、再度見積もりをご依頼ください。
      </div>
    </div>
    <div class="footer">
      <p>このメールはシステムにより自動送信されています。</p>
      <p>お問い合わせ: support@epackage-lab.com</p>
      <p>© ${new Date().getFullYear()} EPackage Lab. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
