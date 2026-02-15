/**
 * 契約署名通知（管理者用）
 *
 * 契約が署名された際に管理者へ通知するメールテンプレート
 */

import { ContractSignedAdminData } from '@/types/email'

/**
 * メール件名
 */
export const subject = (data: ContractSignedAdminData): string => {
  return `[EPackage Lab] 契約が署名されました: ${data.order_number}`
}

/**
 * メール本文（プレーンテキスト）
 */
export const plainText = (data: ContractSignedAdminData): string => {
  return `
${data.company_name} 様

契約書が署名されました。

====================
契約署名情報
====================

注文番号: ${data.order_number}
注文ID: ${data.order_id}
顧客名: ${data.customer_name}
会社名: ${data.company_name}

署名日時: ${data.signed_at}

====================

署名済み契約書を確認するには、以下のリンクからアクセスしてください。

${data.contract_url}

注文詳細は以下から確認できます。

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
export const html = (data: ContractSignedAdminData): string => {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .success-box { background: white; border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: bold; width: 140px; color: #666; }
    .info-value { flex: 1; }
    .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
    .button-group { text-align: center; }
    .next-steps { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .next-step { display: flex; margin-bottom: 12px; }
    .check { color: #8b5cf6; font-size: 20px; margin-right: 12px; }
    .step-text { flex: 1; padding-top: 2px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>契約が署名されました</h1>
    </div>
    <div class="content">
      <p>${data.company_name} 様</p>
      <p>契約書が署名されました。生産開始の準備ができています。</p>

      <div class="success-box">
        <h3>契約署名情報</h3>
        <div class="info-row">
          <span class="info-label">注文番号</span>
          <span class="info-value">${data.order_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">注文ID</span>
          <span class="info-value">${data.order_id}</span>
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
          <span class="info-label">署名日時</span>
          <span class="info-value">${data.signed_at}</span>
        </div>
      </div>

      <div class="next-steps">
        <h3>次のステップ</h3>
        <div class="next-step">
          <span class="check">✓</span>
          <span class="step-text">契約書を確認する</span>
        </div>
        <div class="next-step">
          <span class="check">✓</span>
          <span class="step-text">生産データを確認する</span>
        </div>
        <div class="next-step">
          <span class="check">✓</span>
          <span class="step-text">作業標準書を作成する</span>
        </div>
        <div class="next-step">
          <span class="check">✓</span>
          <span class="step-text">生産開始の準備</span>
        </div>
      </div>

      <div class="button-group">
        <a href="${data.contract_url}" class="button">契約書を確認</a>
        <a href="${data.view_url}" class="button">注文詳細を見る</a>
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
