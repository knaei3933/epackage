/**
 * 注文ステータス更新通知メール
 *
 * 注文ステータスが更新された際に顧客へ通知するメールテンプレート
 */

import { OrderStatusUpdatedData } from '@/types/email'

/**
 * メール件名
 */
export const subject = (data: OrderStatusUpdatedData): string => {
  return `[EPackage Lab] 注文ステータスが更新されました: ${data.order_number}`
}

/**
 * メール本文（プレーンテキスト）
 */
export const plainText = (data: OrderStatusUpdatedData): string => {
  return `
${data.customer_name} 様

ご注文のステータスが更新されました。

====================
注文情報
====================

注文番号: ${data.order_number}
製品名: ${data.product_name}

====================
ステータス変更: ${data.old_status} → ${data.status_label}

====================

詳細な注文情報は、以下のリンクから確認できます。

${data.view_url}

ご不明な点がございましたら、お気軽にお問い合わせください。

--------------------
EPackage Lab B2Bシステム
このメールはシステムにより自動送信されています。
お問い合わせ: design@package-lab.com
--------------------
`.trim()
}

/**
 * メール本文（HTML）
 */
export const html = (data: OrderStatusUpdatedData): string => {
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
    .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
    .status-update { background: #dbeafe; border: 2px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .arrow { font-size: 24px; margin: 0 10px; }
    .status-badge { display: inline-block; background: #3b82f6; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>注文ステータスが更新されました 📋</h1>
    </div>
    <div class="content">
      <p>${data.customer_name} 様</p>
      <p>ご注文のステータスが更新されました。</p>

      <div class="status-update">
        <span style="color: #9ca3af; font-size: 14px;">${data.old_status}</span>
        <span class="arrow">→</span>
        <span class="status-badge">${data.status_label}</span>
      </div>

      <div class="info-box">
        <h3>注文情報</h3>
        <p><strong>注文番号:</strong> ${data.order_number}</p>
        <p><strong>製品名:</strong> ${data.product_name}</p>
        <p><strong>更新日時:</strong> ${data.updated_at}</p>
      </div>

      <div style="text-align: center;">
        <a href="${data.view_url}" class="button">注文詳細を見る</a>
      </div>

      <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
    </div>
    <div class="footer">
      <p>このメールはシステムにより自動送信されています。</p>
      <p>お問い合わせ: design@package-lab.com</p>
      <p>© ${new Date().getFullYear()} EPackage Lab. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
