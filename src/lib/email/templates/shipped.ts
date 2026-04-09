/**
 * 発送通知（顧客用）
 *
 * 製品が発送された際に顧客へ通知するメールテンプレート
 */

import { ShippedData } from '@/types/email'

/**
 * メール件名
 */
export const subject = (data: ShippedData): string => {
  return `[EPackage Lab] 製品を発送いたしました: ${data.order_number}`
}

/**
 * メール本文（プレーンテキスト）
 */
export const plainText = (data: ShippedData): string => {
  let trackingInfo = ''
  if (data.tracking_number) {
    trackingInfo = `
配送業者: ${data.carrier || ''}
追跡番号: ${data.tracking_number}
`
  }

  return `
${data.customer_name} 様

ご注文いただいた製品を発送いたしました。

====================
発送情報
====================

注文番号: ${data.order_number}
製品名: ${data.product_name}
発送日時: ${data.shipped_at}
${trackingInfo}
お届け予定日: ${data.estimated_delivery}

====================

${data.tracking_number ? `配送状況は以下のURLから確認できます。\n${data.tracking_url || ''}\n` : ''}詳細な注文情報は、以下のリンクから確認できます。

${data.view_url}

商品のお届けを楽しみにしております。

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
export const html = (data: ShippedData): string => {
  const trackingSection = data.tracking_number ? `
    <div class="info-row">
      <span class="info-label">配送業者</span>
      <span class="info-value">${data.carrier || '-'}</span>
    </div>
    <div class="info-row">
      <span class="info-label">追跡番号</span>
      <span class="info-value"><strong>${data.tracking_number}</strong></span>
    </div>
  ` : ''

  const trackingButton = data.tracking_url ? `
    <a href="${data.tracking_url}" class="button" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">配送状況を追跡</a>
  ` : ''

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; border-left: 4px solid #06b6d4; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: bold; width: 140px; color: #666; }
    .info-value { flex: 1; }
    .button { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
    .button-group { text-align: center; }
    .tracking-box { background: #ecfeff; border: 2px dashed #06b6d4; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
    .emoji { font-size: 48px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>製品を発送いたしました 🎉</h1>
    </div>
    <div class="content">
      <p>${data.customer_name} 様</p>
      <p>ご注文いただいた製品を発送いたしました。</p>

      <div class="tracking-box">
        <div class="emoji">📦</div>
        <p style="margin: 0; font-size: 18px;">商品をお届けできることを楽しみにしています！</p>
      </div>

      <div class="info-box">
        <h3>発送情報</h3>
        <div class="info-row">
          <span class="info-label">注文番号</span>
          <span class="info-value">${data.order_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">製品名</span>
          <span class="info-value">${data.product_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">発送日時</span>
          <span class="info-value">${data.shipped_at}</span>
        </div>
        ${trackingSection}
        <div class="info-row">
          <span class="info-label">お届け予定日</span>
          <span class="info-value" style="color: #06b6d4; font-weight: bold;">${data.estimated_delivery}</span>
        </div>
      </div>

      <div class="button-group">
        ${trackingButton}
        <a href="${data.view_url}" class="button">注文詳細を見る</a>
      </div>
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
