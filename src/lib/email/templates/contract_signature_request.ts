/**
 * 契約署名リクエストメール
 *
 * 契約書への署名をリマインドするメールテンプレート
 */

import { ContractSignatureRequestData } from '@/types/email'

/**
 * メール件名
 */
export const subject = (data: ContractSignatureRequestData): string => {
  return `[EPackage Lab] 契約書への署名をお願いします: ${data.order_number}`
}

/**
 * メール本文（プレーンテキスト）
 */
export const plainText = (data: ContractSignatureRequestData): string => {
  return `
${data.customer_name} 様

ご注文いただいた製品の契約書への署名がまだ完了していません。
以下のリンクから契約書をご確認の上、署名をお願いいたします。

====================
契約情報
====================

注文番号: ${data.order_number}
署名期限: ${data.due_date}

====================
※署名期限を過ぎると契約は無効となりますので、必ず期限内にご署名ください。

契約書を確認・署名するには、以下のリンクからアクセスしてください。

${data.contract_url}

ご不明な点がございましたら、お気軽にお問い合わせください。

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
export const html = (data: ContractSignatureRequestData): string => {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
    .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .reminder-box { background: #fffbeb; border: 2px dashed #f59e0b; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .clock-icon { font-size: 48px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>契約書への署名をお願いします ⏰</h1>
    </div>
    <div class="content">
      <p>${data.customer_name} 様</p>
      <p>ご注文いただいた製品の契約書への署名がまだ完了していません。</p>
      <p>お手数ですが、以下のリンクから契約書をご確認の上、署名をお願いいたします。</p>

      <div class="reminder-box">
        <div class="clock-icon">⏰</div>
        <p style="margin: 0; font-size: 18px;">署名お待ちしております</p>
      </div>

      <div class="info-box">
        <h3>契約情報</h3>
        <p><strong>注文番号:</strong> ${data.order_number}</p>
        <p><strong>署名期限:</strong> <span style="color: #d97706; font-weight: bold;">${data.due_date}</span></p>
      </div>

      <div style="text-align: center;">
        <a href="${data.contract_url}" class="button">契約書を確認・署名する</a>
      </div>

      <div class="alert">
        <strong>⚠️ ご注意ください</strong><br>
        署名期限を過ぎると契約は無効となります。<br>
        必ず期限内にご署名ください。
      </div>

      <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
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
