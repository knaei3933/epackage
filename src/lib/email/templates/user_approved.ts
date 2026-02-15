/**
 * ユーザー承認通知（顧客用）
 *
 * ユーザーアカウントが承認された際に顧客へ通知するメールテンプレート
 */

import { UserApprovedData } from '@/types/email'

/**
 * メール件名
 */
export const subject = (data: UserApprovedData): string => {
  return `[EPackage Lab] アカウントが承認されました`
}

/**
 * メール本文（プレーンテキスト）
 */
export const plainText = (data: UserApprovedData): string => {
  return `
${data.user_name} 様

EPackage Labへのご登録ありがとうございます。

あなたのアカウントが承認されました。以下のリンクからログインして、サービスをご利用いただけます。

====================
アカウント情報
====================

メールアドレス: ${data.user_email}
承認日時: ${data.approved_at}

====================

ログインはこちらから:
${data.login_url}

今後ともEPackage Labをよろしくお願いいたします。

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
export const html = (data: UserApprovedData): string => {
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
    .info-box { background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
    .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .checkmark { font-size: 48px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>アカウントが承認されました 🎉</h1>
    </div>
    <div class="content">
      <p>${data.user_name} 様</p>
      <p>EPackage Labへのご登録ありがとうございます。</p>
      <p>あなたのアカウントが承認されました。サービスをご利用いただけます。</p>

      <div class="success-box">
        <div class="checkmark">✅</div>
        <p style="margin: 0; font-size: 18px;">アカウント承認完了</p>
      </div>

      <div class="info-box">
        <h3>アカウント情報</h3>
        <p><strong>メールアドレス:</strong> ${data.user_email}</p>
        <p><strong>承認日時:</strong> ${data.approved_at}</p>
      </div>

      <div style="text-align: center;">
        <a href="${data.login_url}" class="button">ログインする</a>
      </div>

      <p>今後ともEPackage Labをよろしくお願いいたします。</p>
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
