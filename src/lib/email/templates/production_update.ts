/**
 * 生産状況更新通知（顧客用）
 *
 * 生産状況が更新された際に顧客へ通知するメールテンプレート
 */

import { ProductionUpdateData } from '@/types/email'

/**
 * メール件名
 */
export const subject = (data: ProductionUpdateData): string => {
  return `[EPackage Lab] 生産状況更新: ${data.order_number}`
}

/**
 * メール本文（プレーンテキスト）
 */
export const plainText = (data: ProductionUpdateData): string => {
  return `
${data.customer_name} 様

ご注文いただいた製品の生産状況が更新されました。

====================
生産状況
====================

注文番号: ${data.order_number}
製品名: ${data.product_name}

現在のステータス: ${data.status_label}
進捗: ${data.progress_percentage}%

完了予定日: ${data.estimated_completion}
更新日時: ${data.updated_at}

====================

詳細な生産状況は、以下のリンクから確認できます。

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
export const html = (data: ProductionUpdateData): string => {
  // ステータスに応じた色を設定
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'WORK_ORDER': '#3b82f6',      // 青
      'PRODUCTION': '#f59e0b',     // オレンジ
      'STOCK_IN': '#10b981',       // 緑
      'SHIPPED': '#8b5cf6',        // 紫
      'DELIVERED': '#06b6d4',      // シアン
    }
    return colors[status] || '#6b7280'
  }

  const statusColor = getStatusColor(data.status)

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
    .info-box { background: white; border-left: 4px solid ${statusColor}; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: bold; width: 140px; color: #666; }
    .info-value { flex: 1; }
    .status { font-size: 18px; font-weight: bold; color: ${statusColor}; }
    .progress-container { background: #e5e7eb; border-radius: 10px; height: 24px; overflow: hidden; margin: 15px 0; }
    .progress-bar { background: linear-gradient(90deg, ${statusColor} 0%, ${statusColor}dd 100%); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; transition: width 0.3s ease; }
    .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>生産状況更新のお知らせ</h1>
    </div>
    <div class="content">
      <p>${data.customer_name} 様</p>
      <p>ご注文いただいた製品の生産状況が更新されました。</p>

      <div class="info-box">
        <h3>生産状況</h3>
        <div class="info-row">
          <span class="info-label">注文番号</span>
          <span class="info-value">${data.order_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">製品名</span>
          <span class="info-value">${data.product_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">現在のステータス</span>
          <span class="info-value status">${data.status_label}</span>
        </div>
        <div class="info-row">
          <span class="info-label">完了予定日</span>
          <span class="info-value">${data.estimated_completion}</span>
        </div>
        <div class="info-row">
          <span class="info-label">更新日時</span>
          <span class="info-value">${data.updated_at}</span>
        </div>
      </div>

      <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0;">進捗状況</h3>
        <div class="progress-container">
          <div class="progress-bar" style="width: ${data.progress_percentage}%;">
            ${data.progress_percentage}%
          </div>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${data.view_url}" class="button">詳細を確認する</a>
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
