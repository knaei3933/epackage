/**
 * 見積作成通知（管理者用）
 *
 * 新しい見積依頼が作成された際に管理者へ通知するメールテンプレート
 */

import { QuoteCreatedAdminData } from '@/types/email'

/**
 * メール件名
 */
export const subject = (data: QuoteCreatedAdminData): string => {
  return `[EPackage Lab] 新しい見積依頼: ${data.quotation_number}`
}

/**
 * メール本文（プレーンテキスト）
 */
export const plainText = (data: QuoteCreatedAdminData): string => {
  return `
${data.company_name} 様

新しい見積依頼が届きました。

====================
見積依頼詳細
====================

見積番号: ${data.quotation_number}
見積ID: ${data.quotation_id}
顧客名: ${data.customer_name}
会社名: ${data.company_name}

見積金額: ¥${data.total_amount.toLocaleString('ja-JP')}
有効期限: ${data.valid_until}

依頼日時: ${data.submitted_at}

====================

この見積依頼を確認・承認するには、以下のリンクからアクセスしてください。

${data.view_url}

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
export const html = (data: QuoteCreatedAdminData): string => {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: bold; width: 140px; color: #666; }
    .info-value { flex: 1; }
    .amount { font-size: 20px; font-weight: bold; color: #667eea; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>新しい見積依頼が届きました</h1>
    </div>
    <div class="content">
      <p>${data.company_name} 様</p>
      <p>新しい見積依頼が届きました。</p>

      <div class="info-box">
        <h3>見積依頼詳細</h3>
        <div class="info-row">
          <span class="info-label">見積番号</span>
          <span class="info-value">${data.quotation_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">見積ID</span>
          <span class="info-value">${data.quotation_id}</span>
        </div>
        <div class="info-row">
          <span class="info-label">顧客名</span>
          <span class="info-value">${data.customer_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">会社名</span>
          <span class="info-value">${data.company_name}</span>
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
          <span class="info-label">依頼日時</span>
          <span class="info-value">${data.submitted_at}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${data.view_url}" class="button">見積を確認・承認する</a>
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
