/**
 * プレミアムコンテンツダウンロード確認メール
 *
 * プレミアムコンテンツをダウンロードした際に確認メールを送信するテンプレート
 */

import { PremiumContentDownloadData } from '@/types/email'

/**
 * メール件名
 */
export const subject = (data: PremiumContentDownloadData): string => {
  return `[EPackage Lab] ${data.content_title} をダウンロードしました`
}

/**
 * メール本文（プレーンテキスト）
 */
export const plainText = (data: PremiumContentDownloadData): string => {
  return `
${data.user_name} 様

EPackage Labのプレミアムコンテンツをダウンロードありがとうございます。

====================
ダウンロード情報
====================

コンテンツ名: ${data.content_title}
カテゴリ: ${data.content_category}
ダウンロード日時: ${data.downloaded_at}

====================

ダウンロードした資料は以下のリンクから再度アクセスできます。

${data.download_url}

資料に関するご質問や、詳細なご相談がありましたら、お気軽にお問い合わせください。

--------------------
EPackage Lab
このメールはシステムにより自動送信されています。
お問い合わせ: design@package-lab.com
--------------------
`.trim()
}

/**
 * メール本文（HTML）
 */
export const html = (data: PremiumContentDownloadData): string => {
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
    .info-box { background: white; border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
    .download-box { background: #ede9fe; border: 2px solid #8b5cf6; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .download-icon { font-size: 48px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>コンテンツをダウンロードしました 📄</h1>
    </div>
    <div class="content">
      <p>${data.user_name} 様</p>
      <p>EPackage Labのプレミアムコンテンツをダウンロードありがとうございます。</p>

      <div class="download-box">
        <div class="download-icon">📥</div>
        <p style="margin: 0; font-size: 18px;">ダウンロード完了</p>
      </div>

      <div class="info-box">
        <h3>ダウンロード情報</h3>
        <p><strong>コンテンツ名:</strong> ${data.content_title}</p>
        <p><strong>カテゴリ:</strong> ${data.content_category}</p>
        <p><strong>ダウンロード日時:</strong> ${data.downloaded_at}</p>
      </div>

      <div style="text-align: center;">
        <a href="${data.download_url}" class="button">資料を再度ダウンロード</a>
      </div>

      <p>資料に関するご質問や、詳細なご相談がありましたら、お気軽にお問い合わせください。</p>
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
