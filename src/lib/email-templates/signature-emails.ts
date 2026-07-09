/**
 * Signature Email Templates
 *
 * Auto-extracted from email-templates.ts
 */

import {
  formatDateJP,
  formatCurrencyJP,
  getJapaneseEmailHeader,
  getJapaneseEmailFooter,
  sanitizeContent,
  sanitizeText,
} from './helpers';
import type { EmailTemplate } from './types';
import type {
  SignatureCompletedEmailData,
  SignatureDeclinedEmailData,
  SignatureReminderEmailData,
  SignatureRequestEmailData,
} from './types';

export function getSignatureRequestEmail(data: SignatureRequestEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();
  const expiresDate = new Date(data.expiresAt);
  const daysUntilExpiry = Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return {
    subject: `【Epackage Lab】電子署名のお願い（${data.documentTitle}）`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、以下の書類について電子署名のお願いを申し上げます。

================================
署名依頼内容
================================
【書類名】${data.documentTitle}
【依頼ID】${data.envelopeId}
【有効期限】${formatDateJP(data.expiresAt)}（残り${daysUntilExpiry}日）

${data.signers.map(s => `【署名者】${s.name}様（${s.email}）`).join('\n')}
================================

${data.message ? `
【メッセージ】
${data.message}

` : ''}

${data.signingUrl ? `
署名は以下のURLから行うことができます。

${data.signingUrl}

` : ''}

※有効期限までに署名が完了されない場合、依頼はキャンセルされます。
※ご不明な点がございましたら、お気軽にお問い合わせください。

何卒よろしくお願い申し上げます。

${footer}

※このメールはシステムによる自動送信です。
お問い合わせの際は、上記連絡先までご連絡ください。
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>電子署名のお願い</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      margin-bottom: 30px;
    }
    .info-box {
      background: #f8fafc;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .info-item {
      margin-bottom: 12px;
      display: flex;
      align-items: baseline;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      min-width: 120px;
      margin-right: 15px;
    }
    .info-value {
      color: #333;
      font-weight: 500;
    }
    .signers-list {
      margin: 15px 0;
      padding-left: 20px;
    }
    .signers-list li {
      margin-bottom: 8px;
      color: #333;
    }
    .message-box {
      background: #fffbeb;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
      white-space: pre-wrap;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .sign-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 40px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
    .expiry-notice {
      background: #fef2f2;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
      border-left: 4px solid #ef4444;
      font-size: 14px;
      color: #991b1b;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>✍️ 電子署名のお願い</h1>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
        <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

        この度、以下の書類について電子署名のお願いを申し上げます。
      </div>

      <div class="info-box">
        <div class="info-item">
          <div class="info-label">書類名</div>
          <div class="info-value">${sanitizeContent(data.documentTitle)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">依頼ID</div>
          <div class="info-value">${sanitizeContent(data.envelopeId)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">有効期限</div>
          <div class="info-value">${formatDateJP(data.expiresAt)}（残り${daysUntilExpiry}日）</div>
        </div>
        <div class="info-item" style="flex-direction: column; align-items: flex-start;">
          <div class="info-label">署名者</div>
          <ul class="signers-list">
            ${data.signers.map(s => `<li>${sanitizeContent(s.name)}様（${sanitizeContent(s.email)}）</li>`).join('')}
          </ul>
        </div>
      </div>

      ${data.message ? `
      <div class="message-box">
        <strong>メッセージ</strong><br><br>
        ${sanitizeContent(data.message)}
      </div>
      ` : ''}

      ${data.signingUrl ? `
      <div class="button-container">
        <a href="${sanitizeContent(data.signingUrl)}" class="sign-button">署名する</a>
      </div>
      ` : ''}

      <div class="expiry-notice">
        ⚠️ 有効期限までに署名が完了されない場合、依頼はキャンセルされます。
      </div>

      <div style="margin-top: 30px; text-align: center; color: #475569; font-size: 14px;">
        ご不明な点がございましたら、お気軽にお問い合わせください。<br><br>
        何卒よろしくお願い申し上げます。
      </div>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>兵庫県加古郡稲美町六分一486</div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

/**
 * 電子署名完了通知メール
 */

export function getSignatureCompletedEmail(data: SignatureCompletedEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【Epackage Lab】電子署名が完了いたしました（${data.documentTitle}）`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、以下の書類の署名が全て完了いたしましたのでご連絡申し上げます。

================================
署名完了情報
================================
【書類名】${data.documentTitle}
【依頼ID】${data.envelopeId}
【完了日時】${formatDateJP(data.completedAt)}

署名者：
${data.signers.map(s => `・${s.name}様（${formatDateJP(s.signedAt)}）`).join('\n')}
================================

${data.documentUrl ? `
署名済みの書類は以下のURLからダウンロードいただけます。

${data.documentUrl}

` : ''}

本書類は法的に有効です。大切に保管してください。

今後とも、弊社サービスをよろしくお願い申し上げます。

${footer}

※このメールはシステムによる自動送信です。
お問い合わせの際は、上記連絡先までご連絡ください。
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>署名完了のお知らせ</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
    }
    .success-box {
      background: #ecfdf5;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }
    .info-item {
      margin-bottom: 12px;
      display: flex;
      align-items: baseline;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      min-width: 120px;
      margin-right: 15px;
    }
    .info-value {
      color: #333;
      font-weight: 500;
    }
    .signers-box {
      background: #f8fafc;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .signer-item {
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .signer-item:last-child {
      border-bottom: none;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .download-button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 15px 40px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-icon">✅</div>
      <h1>署名完了のお知らせ</h1>
    </div>

    <div class="content">
      ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
      <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

      平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

      この度、以下の書類の署名が全て完了いたしましたのでご連絡申し上げます。

      <div class="success-box">
        <div class="info-item">
          <div class="info-label">書類名</div>
          <div class="info-value">${sanitizeContent(data.documentTitle)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">依頼ID</div>
          <div class="info-value">${sanitizeContent(data.envelopeId)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">完了日時</div>
          <div class="info-value">${formatDateJP(data.completedAt)}</div>
        </div>
      </div>

      <h3 style="color: #475569; font-size: 16px; margin: 25px 0 15px 0;">署名者</h3>
      <div class="signers-box">
        ${data.signers.map(s => `
        <div class="signer-item">
          <strong>${sanitizeContent(s.name)}</strong> 様
          <div style="font-size: 13px; color: #666; margin-top: 5px;">
            署名日時: ${formatDateJP(s.signedAt)}
          </div>
        </div>
        `).join('')}
      </div>

      ${data.documentUrl ? `
      <div class="button-container">
        <a href="${sanitizeContent(data.documentUrl)}" class="download-button">署名済み書類をダウンロード</a>
      </div>
      ` : ''}

      <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px; text-align: center; color: #0369a1; font-size: 14px;">
        本書類は法的に有効です。大切に保管してください。
      </div>

      <div style="margin-top: 30px; text-align: center; color: #475569;">
        今後とも、弊社サービスをよろしくお願い申し上げます。
      </div>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>兵庫県加古郡稲美町六分一486</div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

/**
 * 電子署名拒否通知メール（管理者向け）
 */

export function getSignatureDeclinedEmail(data: SignatureDeclinedEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【重要】署名が拒否されました（${data.documentTitle}）`,
    text: `
${recipientHeader}

署名依頼いただいていた書類について、署名者が拒否を行いました。

================================
拒否情報
================================
【書類名】${data.documentTitle}
【依頼ID】${data.envelopeId}
【拒否者】${data.declinedBy}
【拒否日時】${formatDateJP(data.declinedAt)}
${data.reason ? `【拒否理由】${data.reason}` : ''}
================================

ご確認の上、必要な対応をお願いいたします。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>署名拒否通知</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .content {
      padding: 40px 30px;
    }
    .alert-box {
      background: #fef2f2;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #ef4444;
    }
    .info-item {
      margin-bottom: 12px;
      display: flex;
      align-items: baseline;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      min-width: 120px;
      margin-right: 15px;
    }
    .info-value {
      color: #333;
      font-weight: 500;
    }
    .reason-box {
      background: #fff;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      border: 1px solid #fecaca;
      white-space: pre-wrap;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>⚠️ 署名拒否通知</h1>
    </div>

    <div class="content">
      <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

      署名依頼いただいていた書類について、署名者が拒否を行いました。

      <div class="alert-box">
        <div class="info-item">
          <div class="info-label">書類名</div>
          <div class="info-value">${sanitizeContent(data.documentTitle)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">依頼ID</div>
          <div class="info-value">${sanitizeContent(data.envelopeId)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">拒否者</div>
          <div class="info-value">${sanitizeContent(data.declinedBy)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">拒否日時</div>
          <div class="info-value">${formatDateJP(data.declinedAt)}</div>
        </div>
      </div>

      ${data.reason ? `
      <div class="reason-box">
        <strong style="color: #991b1b;">拒否理由</strong><br><br>
        ${sanitizeContent(data.reason)}
      </div>
      ` : ''}

      <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; text-align: center; color: #92400e;">
        ご確認の上、必要な対応をお願いいたします。
      </div>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

/**
 * 電子署名リマインダーメール
 */

export function getSignatureReminderEmail(data: SignatureReminderEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【リマインダー】署名のお願い（残り${data.daysUntilExpiry}日）`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

署名依頼いただいております書類について、有効期限が近づいておりますのでご案内申し上げます。

================================
署名依頼情報
================================
【書類名】${data.documentTitle}
【依頼ID】${data.envelopeId}
【有効期限】${formatDateJP(data.expiresAt)}（残り${data.daysUntilExpiry}日）
================================

${data.daysUntilExpiry <= 3 ? `
⚠️ 有効期限まであと${data.daysUntilExpiry}日となっております。
お手数ですが、至急署名の手続きをお願いいたします。

` : ''}

署名は以下のURLから行うことができます。

${data.signingUrl}

ご不明な点がございましたら、お気軽にお問い合わせください。

何卒よろしくお願い申し上げます。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>署名リマインダー</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: ${data.daysUntilExpiry <= 3
        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'};
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .content {
      padding: 40px 30px;
    }
    .info-box {
      background: #f8fafc;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid ${data.daysUntilExpiry <= 3 ? '#f59e0b' : '#3b82f6'};
    }
    .info-item {
      margin-bottom: 12px;
      display: flex;
      align-items: baseline;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      min-width: 120px;
      margin-right: 15px;
    }
    .info-value {
      color: #333;
      font-weight: 500;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .sign-button {
      display: inline-block;
      background: ${data.daysUntilExpiry <= 3
        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'};
      color: white;
      padding: 15px 40px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 4px 6px ${data.daysUntilExpiry <= 3
        ? 'rgba(245, 158, 11, 0.3)'
        : 'rgba(59, 130, 246, 0.3)'};
    }
    .alert-box {
      background: #fef3c7;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
      text-align: center;
      color: #92400e;
      font-size: 14px;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>${data.daysUntilExpiry <= 3 ? '⏰ 署名期限が近づいています' : '🔔 署名リマインダー'}</h1>
    </div>

    <div class="content">
      ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
      <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

      平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

      署名依頼いただいております書類について、有効期限が近づいておりますのでご案内申し上げます。

      <div class="info-box">
        <div class="info-item">
          <div class="info-label">書類名</div>
          <div class="info-value">${sanitizeContent(data.documentTitle)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">依頼ID</div>
          <div class="info-value">${sanitizeContent(data.envelopeId)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">有効期限</div>
          <div class="info-value">${formatDateJP(data.expiresAt)}（残り${data.daysUntilExpiry}日）</div>
        </div>
      </div>

      ${data.daysUntilExpiry <= 3 ? `
      <div class="alert-box">
        ⚠️ 有効期限まであと${data.daysUntilExpiry}日となっております。<br>
        お手数ですが、至急署名の手続きをお願いいたします。
      </div>
      ` : ''}

      <div class="button-container">
        <a href="${sanitizeContent(data.signingUrl)}" class="sign-button">署名する</a>
      </div>

      <div style="margin-top: 30px; text-align: center; color: #475569; font-size: 14px;">
        ご不明な点がございましたら、お気軽にお問い合わせください。<br><br>
        何卒よろしくお願い申し上げます。
      </div>
    </div>

    <div class="footer">
      <div><strong>Epackage Lab</strong></div>
      <div>兵庫県加古郡稲美町六分一486</div>
      <div>${formatDateJP(new Date().toISOString())}</div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

/**
 * 配送状況メールテンプレート
 * Shipping Status Email Template
 */

