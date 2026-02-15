/**
 * 契約書送信通知（顧客用）
 *
 * 契約書が送信された際に顧客へ通知するメールテンプレート
 */

import { ContractSentData } from '@/types/email'

/**
 * メール件名
 */
export const subject = (data: ContractSentData): string => {
  return `[EPackage Lab] 契約書をご確認ください: ${data.order_number}`
}

/**
 * メール本文（プレーンテキスト）
 */
export const plainText = (data: ContractSentData): string => {
  return `
${data.customer_name} 様

ご注文いただきありがとうございます。

契約書を作成いたしました。以下のリンクから内容をご確認の上、署名をお願いいたします。

====================
契約情報
====================

注文番号: ${data.order_number}
注文ID: ${data.order_id}

送信日時: ${data.sent_at}
署名期限: ${data.due_date}

====================

契約書を確認・署名するには、以下のリンクからアクセスしてください。

${data.contract_url}

署名期限内にご署名をお願いいたします。

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
export const html = (data: ContractSentData): string => {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: bold; width: 140px; color: #666; }
    .info-value { flex: 1; }
    .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
    .alert { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .steps { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .step { display: flex; margin-bottom: 15px; }
    .step-number { background: #3b82f6; color: white; width: 30px; height: 30px; border-radius: 50%; text-align: center; line-height: 30px; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
    .step-text { flex: 1; padding-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>契約書をご確認ください</h1>
    </div>
    <div class="content">
      <p>${data.customer_name} 様</p>
      <p>ご注文いただきありがとうございます。</p>
      <p>契約書を作成いたしました。内容をご確認の上、署名をお願いいたします。</p>

      <div class="info-box">
        <h3>契約情報</h3>
        <div class="info-row">
          <span class="info-label">注文番号</span>
          <span class="info-value">${data.order_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">注文ID</span>
          <span class="info-value">${data.order_id}</span>
        </div>
        <div class="info-row">
          <span class="info-label">送信日時</span>
          <span class="info-value">${data.sent_at}</span>
        </div>
        <div class="info-row">
          <span class="info-label">署名期限</span>
          <span class="info-value" style="color: #ef4444; font-weight: bold;">${data.due_date}</span>
        </div>
      </div>

      <div class="steps">
        <h3>契約手順</h3>
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-text">下のボタンから契約書にアクセス</div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-text">契約内容をよくお読みください</div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-text">電子署名を行ってください</div>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${data.contract_url}" class="button">契約書を確認・署名する</a>
      </div>

      <div class="alert">
        <strong>⚠️ 署名期限にご注意ください</strong><br>
        署名期限は <strong>${data.due_date}</strong> です。<br>
        期限を過ぎると契約は無効となりますので、必ず期限内にご署名ください。
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
