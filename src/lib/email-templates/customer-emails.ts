/**
 * Customer Email Templates
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
  ApprovalEmailData,
  OrderStatusEmailData,
  QuoteCreatedEmailData,
  RejectionEmailData,
  ShipmentEmailData,
  WelcomeEmailData,
} from './types';

export function getWelcomeCustomerEmail(data: WelcomeEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: '【Epackage Lab】会員登録ありがとうございます',
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。
この度は、Epackage Labの会員登録を完了いただき、誠にありがとうございます。

会員登録が完了いたしましたことを、ご通知申し上げます。

================================
ご登録内容の確認
================================
【お名前】${data.recipient.name}
【メールアドレス】${data.recipient.email}
${data.recipient.company ? `【会社名】${data.recipient.company}` : ''}

${data.tempPassword ? `
================================
仮パスワードのお知らせ
================================
初期パスワードは以下の通りです。

${data.tempPassword}

※セキュリティのため、初回ログイン時に必ずパスワードの変更をお願いいたします。
` : ''}

================================
サービスのご案内
================================
Epackage Labでは、以下のサービスをご利用いただけます。

• 商品カタログ閲覧・検索
• サンプルリクエスト（最大5点まで）
• 見積依頼・注文管理
• 配送状況の確認

${data.loginUrl ? `
ログインは以下のURLからアクセスいただけます。

${data.loginUrl}
` : ''}

今後とも、Epackage Labをよろしくお願い申し上げます。

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
  <title>会員登録ありがとうございます</title>
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
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: bold;
      letter-spacing: 0.05em;
    }
    .header-subtitle {
      margin-top: 10px;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      line-height: 2;
      color: #555;
      margin-bottom: 30px;
    }
    .info-box {
      background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
      border-left: 4px solid #667eea;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .info-box-title {
      font-size: 18px;
      font-weight: bold;
      color: #667eea;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .info-item {
      margin-bottom: 15px;
      font-size: 15px;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      margin-bottom: 5px;
    }
    .info-value {
      color: #333;
      font-weight: 500;
    }
    .password-box {
      background: #fff3cd;
      border: 2px solid #ffc107;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      text-align: center;
    }
    .password-title {
      font-size: 16px;
      font-weight: bold;
      color: #856404;
      margin: 0 0 15px 0;
    }
    .password-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      letter-spacing: 0.1em;
      padding: 15px;
      background: white;
      border-radius: 4px;
      margin: 15px 0;
    }
    .service-list {
      background: #f8f9fa;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .service-list ul {
      margin: 15px 0;
      padding-left: 25px;
    }
    .service-list li {
      margin: 10px 0;
      font-size: 15px;
      color: #555;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 15px 40px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
    .footer-info {
      margin: 10px 0;
      line-height: 1.6;
    }
    .auto-notice {
      font-size: 12px;
      color: #999;
      margin-top: 20px;
    }
    @media only screen and (max-width: 600px) {
      .content { padding: 25px 20px; }
      .header { padding: 30px 20px; }
      .header h1 { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>会員登録ありがとうございます</h1>
      <div class="header-subtitle">Welcome to Epackage Lab</div>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
        <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

        平素より格別のご高配を賜り、厚く御礼申し上げます。<br>
        この度は、Epackage Labの会員登録を完了いただき、誠にありがとうございます。<br><br>

        会員登録が完了いたしましたことを、ご通知申し上げます。
      </div>

      <div class="info-box">
        <h3 class="info-box-title">ご登録内容の確認</h3>
        <div class="info-item">
          <div class="info-label">お名前</div>
          <div class="info-value">${sanitizeContent(data.recipient.name)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">メールアドレス</div>
          <div class="info-value">${sanitizeContent(data.recipient.email)}</div>
        </div>
        ${data.recipient.company ? `
        <div class="info-item">
          <div class="info-label">会社名</div>
          <div class="info-value">${sanitizeContent(data.recipient.company)}</div>
        </div>
        ` : ''}
      </div>

      ${data.tempPassword ? `
      <div class="password-box">
        <h3 class="password-title">⚠️ 仮パスワードのお知らせ</h3>
        <p style="margin: 10px 0; color: #856404;">初期パスワードは以下の通りです。</p>
        <div class="password-value">${sanitizeContent(data.tempPassword)}</div>
        <p style="margin: 15px 0 0 0; font-size: 13px; color: #856404;">
          ※セキュリティのため、初回ログイン時に必ずパスワードの変更をお願いいたします。
        </p>
      </div>
      ` : ''}

      <div class="service-list">
        <h3 class="info-box-title">サービスのご案内</h3>
        <p style="margin: 15px 0; color: #555;">Epackage Labでは、以下のサービスをご利用いただけます。</p>
        <ul>
          <li>商品カタログ閲覧・検索</li>
          <li>サンプルリクエスト（最大5点まで）</li>
          <li>見積依頼・注文管理</li>
          <li>配送状況の確認</li>
        </ul>
      </div>

      ${data.loginUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${sanitizeContent(data.loginUrl)}" class="cta-button">ログインはこちら</a>
        <p style="margin-top: 15px; font-size: 13px; color: #666;">
          上記ボタンからマイページにアクセスいただけます
        </p>
      </div>
      ` : ''}

      <div style="margin-top: 30px; text-align: center; color: #667eea; font-weight: bold;">
        今後とも、Epackage Labをよろしくお願い申し上げます。
      </div>
    </div>

    <div class="footer">
      <div class="footer-info">
        <strong>Epackage Lab</strong><br>
        兵庫県加古郡稲美町六分一486<br>
        電話: 050-1793-6500 | Email: info@package-lab.com<br>
        <a href="https://epackage-lab.com" style="color: #667eea; text-decoration: none;">https://epackage-lab.com</a>
      </div>
      <div class="footer-info">
        ${formatDateJP(new Date().toISOString())}
      </div>
      <div class="auto-notice">
        ※このメールはシステムによる自動送信です。<br>
        お問い合わせの際は、上記連絡先までご連絡ください。
      </div>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

// =====================================================
// Approval Notification Templates
// =====================================================

/**
 * 承認通知メール（顧客向け）
 */

export function getApprovalCustomerEmail(data: ApprovalEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【Epackage Lab】${data.requestType}の承認について`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、お申込みいただきました${data.requestType}について、
下記の通り承認いたしましたのでお知らせ申し上げます。

================================
承認内容の詳細
================================
【申請種別】${data.requestType}
【承認日】${formatDateJP(data.approvalDate)}
【承認者】${data.approvedBy}

【申請内容】
${sanitizeContent(data.requestDetails)}

${data.nextSteps ? `
================================
今後の進め方
================================
${sanitizeContent(data.nextSteps)}
` : ''}

詳細につきましては、マイページよりご確認いただけます。

引き続き、弊社サービスをよろしくお願い申し上げます。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>承認のお知らせ</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f0fdf4;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      line-height: 2;
      color: #555;
      margin-bottom: 30px;
    }
    .approval-box {
      background: #f0fdf4;
      border: 2px solid #10b981;
      border-radius: 8px;
      padding: 30px;
      margin: 30px 0;
      text-align: center;
    }
    .approval-icon {
      font-size: 64px;
      margin-bottom: 15px;
    }
    .approval-title {
      font-size: 22px;
      font-weight: bold;
      color: #059669;
      margin: 0 0 10px 0;
    }
    .approval-subtitle {
      font-size: 15px;
      color: #047857;
      margin: 0;
    }
    .info-box {
      background: #f9fafb;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }
    .info-box-title {
      font-size: 18px;
      font-weight: bold;
      color: #059669;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .info-item {
      margin-bottom: 15px;
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
      font-size: 15px;
    }
    .details-box {
      background: white;
      padding: 20px;
      margin: 20px 0;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      white-space: pre-wrap;
      line-height: 1.8;
    }
    .next-steps {
      background: #ecfdf5;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #059669;
    }
    .next-steps-title {
      font-size: 16px;
      font-weight: bold;
      color: #059669;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
    @media only screen and (max-width: 600px) {
      .info-item { flex-direction: column; }
      .info-label { margin-bottom: 5px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-icon">✓</div>
      <h1>承認のお知らせ</h1>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
        <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

        この度、お申込みいただきました<strong>${sanitizeContent(data.requestType)}</strong>について、<br>
        下記の通り承認いたしましたのでお知らせ申し上げます。
      </div>

      <div class="approval-box">
        <div class="approval-icon">✅</div>
        <h2 class="approval-title">承認が完了しました</h2>
        <p class="approval-subtitle">承認日: ${formatDateJP(data.approvalDate)}</p>
      </div>

      <div class="info-box">
        <h3 class="info-box-title">承認内容の詳細</h3>
        <div class="info-item">
          <div class="info-label">申請種別</div>
          <div class="info-value">${sanitizeContent(data.requestType)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">承認日</div>
          <div class="info-value">${formatDateJP(data.approvalDate)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">承認者</div>
          <div class="info-value">${sanitizeContent(data.approvedBy)}</div>
        </div>

        <h4 style="margin: 20px 0 10px 0; color: #059669; font-size: 15px;">申請内容</h4>
        <div class="details-box">${sanitizeContent(data.requestDetails)}</div>
      </div>

      ${data.nextSteps ? `
      <div class="next-steps">
        <h4 class="next-steps-title">今後の進め方</h4>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #374151;">${sanitizeContent(data.nextSteps)}</div>
      </div>
      ` : ''}

      <div style="margin-top: 30px; text-align: center; color: #059669; font-weight: bold;">
        詳細につきましては、マイページよりご確認いただけます。<br><br>
        引き続き、弊社サービスをよろしくお願い申し上げます。
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

// =====================================================
// Rejection Notification Templates
// =====================================================

/**
 * 却下通知メール（顧客向け）
 */

export function getRejectionCustomerEmail(data: RejectionEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【Epackage Lab】${data.requestType}に関するご連絡`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、お申込みいただきました${data.requestType}について、
慎重に審査いたしました結果、誠に残念ながら今回は承認を見送らせていただくこととなりました。

================================
審査結果
================================
【申請種別】${data.requestType}
【結果】承認見送り

【理由】
${sanitizeContent(data.rejectionReason)}

${data.alternativeOptions ? `
================================
代替案のご提案
================================
${sanitizeContent(data.alternativeOptions)}
` : ''}

この度は、せっかくご提案いただきましたにも関わらず、
ご期待に添えず誠に申し訳ございません。

${data.contactInfo ? `
詳細につきましては、下記までお問い合わせください。

${sanitizeContent(data.contactInfo)}
` : ''}

今後とも、変わらぬご愛顧を賜りますようお願い申し上げます。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>審査結果のご連絡</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #fef2f2;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      line-height: 2;
      color: #555;
      margin-bottom: 30px;
    }
    .result-box {
      background: #fef2f2;
      border: 2px solid #ef4444;
      border-radius: 8px;
      padding: 30px;
      margin: 30px 0;
      text-align: center;
    }
    .result-icon {
      font-size: 64px;
      margin-bottom: 15px;
    }
    .result-title {
      font-size: 22px;
      font-weight: bold;
      color: #dc2626;
      margin: 0 0 10px 0;
    }
    .result-subtitle {
      font-size: 15px;
      color: #b91c1c;
      margin: 0;
    }
    .info-box {
      background: #fef2f2;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #ef4444;
    }
    .info-box-title {
      font-size: 18px;
      font-weight: bold;
      color: #dc2626;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .reason-box {
      background: white;
      padding: 20px;
      margin: 20px 0;
      border-radius: 6px;
      border: 1px solid #fecaca;
      white-space: pre-wrap;
      line-height: 1.8;
    }
    .alternative-box {
      background: #fffbeb;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
    }
    .alternative-title {
      font-size: 16px;
      font-weight: bold;
      color: #d97706;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .apology {
      background: #f3f4f6;
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
      text-align: center;
      font-style: italic;
      color: #6b7280;
      line-height: 2;
    }
    .contact-box {
      background: #eff6ff;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      text-align: center;
    }
    .contact-box p {
      margin: 5px 0;
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
      <div class="header-icon">📋</div>
      <h1>審査結果のご連絡</h1>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
        <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

        この度、お申込みいただきました<strong>${sanitizeContent(data.requestType)}</strong>について、<br>
        慎重に審査いたしました結果、誠に残念ながら今回は承認を見送らせていただくこととなりました。
      </div>

      <div class="result-box">
        <div class="result-icon">✕</div>
        <h2 class="result-title">承認見送り</h2>
        <p class="result-subtitle">審査の結果、承認を見送らせていただきました</p>
      </div>

      <div class="info-box">
        <h3 class="info-box-title">却下理由</h3>
        <div class="reason-box">${sanitizeContent(data.rejectionReason)}</div>
      </div>

      ${data.alternativeOptions ? `
      <div class="alternative-box">
        <h4 class="alternative-title">💡 代替案のご提案</h4>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #374151;">${sanitizeContent(data.alternativeOptions)}</div>
      </div>
      ` : ''}

      <div class="apology">
        この度は、せっかくご提案いただきましたにも関わらず、<br>
        ご期待に添えず誠に申し訳ございません。
      </div>

      ${data.contactInfo ? `
      <div class="contact-box">
        <p style="font-weight: bold; color: #1e40af; margin-bottom: 15px;">詳細につきましては、下記までお問い合わせください</p>
        <p style="white-space: pre-wrap; color: #374151;">${sanitizeContent(data.contactInfo)}</p>
      </div>
      ` : ''}

      <div style="margin-top: 30px; text-align: center; color: #374151; font-weight: bold;">
        今後とも、変わらぬご愛顧を賜りますようお願い申し上げます。
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

// =====================================================
// Quote Created Templates
// =====================================================

/**
 * 見積作成通知メール（顧客向け）
 */

export function getQuoteCreatedCustomerEmail(data: QuoteCreatedEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  const itemsList = data.quoteInfo.items.map((item, index) => {
    return `${index + 1}. ${item.description}
   数量: ${item.quantity}点
   単価: ${formatCurrencyJP(item.unitPrice)}
   金額: ${formatCurrencyJP(item.amount)}`;
  }).join('\n\n');

  return {
    subject: `【Epackage Lab】お見積書を作成いたしました（見積番号: ${data.quoteInfo.quoteId}）`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、お見積書を作成いたしましたのでご連絡申し上げます。
見積内容は以下の通りです。

================================
お見積書
================================
【見積番号】${data.quoteInfo.quoteId}
【有効期限】${formatDateJP(data.quoteInfo.validUntil)}まで
【見積金額合計】${formatCurrencyJP(data.quoteInfo.totalAmount)}

【見積明細】
${itemsList}

================================
お見積の有効期限について
================================
本見積の有効期限は${formatDateJP(data.quoteInfo.validUntil)}となっております。
期限を過ぎますと、価格や仕様が変更となる場合がございます。

お見積内容のご確認・ご承認につきましては、以下のURLよりアクセスいただけます。

${data.quoteUrl}

ご不明な点がございましたら、お気軽にお問い合わせください。

今後とも、弊社サービスをよろしくお願い申し上げます。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>お見積書を作成いたしました</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #fefce8;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: bold;
    }
    .header-subtitle {
      margin-top: 10px;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      line-height: 2;
      color: #555;
      margin-bottom: 30px;
    }
    .quote-header {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
    }
    .quote-title {
      font-size: 20px;
      font-weight: bold;
      color: #d97706;
      margin: 0 0 15px 0;
    }
    .quote-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      font-size: 14px;
      color: #78350f;
    }
    .quote-meta-item {
      flex: 1;
      min-width: 200px;
    }
    .quote-meta-label {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .items-table {
      width: 100%;
      margin: 30px 0;
      border-collapse: collapse;
    }
    .items-table th {
      background: #fef3c7;
      color: #78350f;
      font-weight: bold;
      padding: 15px 12px;
      text-align: left;
      border-bottom: 2px solid #f59e0b;
    }
    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .total-section {
      background: #fffbeb;
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
      text-align: right;
    }
    .total-label {
      font-size: 18px;
      color: #78350f;
      margin-bottom: 10px;
    }
    .total-amount {
      font-size: 32px;
      font-weight: bold;
      color: #d97706;
    }
    .validity-box {
      background: #fef2f2;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #ef4444;
    }
    .validity-title {
      font-weight: bold;
      color: #dc2626;
      margin-bottom: 10px;
    }
    .cta-button {
      display: block;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      text-decoration: none;
      padding: 18px 40px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 16px;
      text-align: center;
      margin: 30px auto;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
    @media only screen and (max-width: 600px) {
      .items-table { font-size: 13px; }
      .items-table th, .items-table td { padding: 10px 8px; }
      .total-amount { font-size: 24px; }
      .quote-meta { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-icon">📄</div>
      <h1>お見積書を作成いたしました</h1>
      <div class="header-subtitle">Thank you for your request</div>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
        <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

        この度、お見積書を作成いたしましたのでご連絡申し上げます。<br>
        見積内容は以下の通りです。
      </div>

      <div class="quote-header">
        <h2 class="quote-title">お見積書</h2>
        <div class="quote-meta">
          <div class="quote-meta-item">
            <div class="quote-meta-label">見積番号</div>
            <div>${sanitizeContent(data.quoteInfo.quoteId)}</div>
          </div>
          <div class="quote-meta-item">
            <div class="quote-meta-label">有効期限</div>
            <div>${formatDateJP(data.quoteInfo.validUntil)}まで</div>
          </div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>項目</th>
            <th>数量</th>
            <th>単価</th>
            <th>金額</th>
          </tr>
        </thead>
        <tbody>
          ${data.quoteInfo.items.map((item, index) => `
          <tr>
            <td>${index + 1}. ${sanitizeContent(item.description)}</td>
            <td>${item.quantity}点</td>
            <td>${formatCurrencyJP(item.unitPrice)}</td>
            <td>${formatCurrencyJP(item.amount)}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-label">見積金額合計</div>
        <div class="total-amount">${formatCurrencyJP(data.quoteInfo.totalAmount)}</div>
      </div>

      <div class="validity-box">
        <div class="validity-title">⚠️ お見積の有効期限について</div>
        <p style="margin: 10px 0; color: #7f1d1d; line-height: 1.8;">
          本見積の有効期限は<strong>${formatDateJP(data.quoteInfo.validUntil)}</strong>となっております。<br>
          期限を過ぎますと、価格や仕様が変更となる場合がございます。
        </p>
      </div>

      <a href="${sanitizeContent(data.quoteUrl)}" class="cta-button">見積内容を確認・承認する</a>

      <div style="margin-top: 30px; text-align: center; color: #d97706; font-weight: bold;">
        ご不明な点がございましたら、お気軽にお問い合わせください。<br><br>
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

// =====================================================
// Order Status Update Templates
// =====================================================

/**
 * 注文状況更新通知メール
 */

export function getOrderStatusUpdateEmail(data: OrderStatusEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  const statusMap = {
    processing: { text: '受付処理中', icon: '📝', color: '#3b82f6' },
    in_production: { text: '製造中', icon: '🔧', color: '#f59e0b' },
    quality_check: { text: '品質検査中', icon: '🔍', color: '#8b5cf6' },
    ready: { text: '発送準備完了', icon: '✅', color: '#10b981' },
    delayed: { text: '遅延あり', icon: '⚠️', color: '#ef4444' },
  };

  const statusInfo = statusMap[data.status];
  const itemsList = data.orderInfo.items.map((item, index) => {
    return `${index + 1}. ${item.name} x ${item.quantity}点\n   ${formatCurrencyJP(item.price)}`;
  }).join('\n');

  return {
    subject: `【Epackage Lab】注文${data.orderInfo.orderId}の状況更新について`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

ご注文いただきました商品の状況についてご連絡申し上げます。

================================
注文状況
================================
${statusInfo.icon} 【現在のステータス】${statusInfo.text}

【注文番号】${data.orderInfo.orderId}
【注文日】${formatDateJP(data.orderInfo.orderDate)}
${data.estimatedCompletion ? `【完了予定日】${formatDateJP(data.estimatedCompletion)}` : ''}

================================
注文内容
================================
${itemsList}

【注文合計】${formatCurrencyJP(data.orderInfo.totalAmount)}

${data.statusDetails ? `
================================
詳細情報
================================
${sanitizeContent(data.statusDetails)}
` : ''}

現在の状況につきましては、マイページよりご確認いただけます。

引き続き、弊社サービスをよろしくお願い申し上げます。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>注文状況更新のお知らせ</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f0f9ff;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      line-height: 2;
      color: #555;
      margin-bottom: 30px;
    }
    .status-badge {
      display: inline-block;
      background: ${statusInfo.color};
      color: white;
      padding: 12px 30px;
      border-radius: 50px;
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0;
    }
    .order-info-box {
      background: #f8fafc;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid ${statusInfo.color};
    }
    .info-item {
      margin-bottom: 12px;
      display: flex;
      align-items: baseline;
    }
    .info-label {
      color: #666;
      font-size: 13px;
      min-width: 140px;
      margin-right: 15px;
    }
    .info-value {
      color: #333;
      font-weight: 500;
      font-size: 15px;
    }
    .items-table {
      width: 100%;
      margin: 30px 0;
      border-collapse: collapse;
    }
    .items-table th {
      background: #f1f5f9;
      color: #475569;
      font-weight: bold;
      padding: 15px 12px;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
    }
    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .details-box {
      background: ${data.status === 'delayed' ? '#fef2f2' : '#f8fafc'};
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid ${data.status === 'delayed' ? '#ef4444' : statusInfo.color};
      white-space: pre-wrap;
      line-height: 1.8;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      margin: 30px 0;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, ${statusInfo.color} 0%, ${statusInfo.color}cc 100%);
      border-radius: 4px;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
    @media only screen and (max-width: 600px) {
      .info-item { flex-direction: column; }
      .info-label { margin-bottom: 5px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-icon">${statusInfo.icon}</div>
      <h1>注文状況更新のお知らせ</h1>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
        <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

        ご注文いただきました商品の状況についてご連絡申し上げます。
      </div>

      <div style="text-align: center;">
        <span class="status-badge">${statusInfo.icon} ${statusInfo.text}</span>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${
          data.status === 'processing' ? '20%' :
          data.status === 'in_production' ? '50%' :
          data.status === 'quality_check' ? '75%' :
          data.status === 'ready' ? '90%' :
          data.status === 'delayed' ? '30%' : '10%'
        };"></div>
      </div>

      <div class="order-info-box">
        <div class="info-item">
          <div class="info-label">注文番号</div>
          <div class="info-value">${sanitizeContent(data.orderInfo.orderId)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">注文日</div>
          <div class="info-value">${formatDateJP(data.orderInfo.orderDate)}</div>
        </div>
        ${data.estimatedCompletion ? `
        <div class="info-item">
          <div class="info-label">完了予定日</div>
          <div class="info-value">${formatDateJP(data.estimatedCompletion)}</div>
        </div>
        ` : ''}
      </div>

      <h3 style="margin: 30px 0 15px 0; color: #475569;">注文内容</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>商品名</th>
            <th>数量</th>
            <th>単価</th>
          </tr>
        </thead>
        <tbody>
          ${data.orderInfo.items.map((item, index) => `
          <tr>
            <td>${index + 1}. ${sanitizeContent(item.name)}</td>
            <td>${item.quantity}点</td>
            <td>${formatCurrencyJP(item.price)}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 20px; font-size: 18px; color: #475569;">
        <strong>注文合計: ${formatCurrencyJP(data.orderInfo.totalAmount)}</strong>
      </div>

      ${data.statusDetails ? `
      <div class="details-box">
        <strong style="color: ${data.status === 'delayed' ? '#dc2626' : statusInfo.color};">詳細情報</strong><br><br>
        ${sanitizeContent(data.statusDetails)}
      </div>
      ` : ''}

      <div style="margin-top: 30px; text-align: center; color: #475569; font-weight: bold;">
        現在の状況につきましては、マイページよりご確認いただけます。<br><br>
        引き続き、弊社サービスをよろしくお願い申し上げます。
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

// =====================================================
// Shipment Notification Templates
// =====================================================

/**
 * 配送通知メール（顧客向け）
 */

export function getShipmentNotificationCustomerEmail(data: ShipmentEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  const itemsList = data.orderInfo.items.map((item, index) => {
    return `${index + 1}. ${item.name} x ${item.quantity}点`;
  }).join('\n');

  return {
    subject: `【Epackage Lab】商品を発送いたしました（注文番号: ${data.orderInfo.orderId}）`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、ご注文いただきました商品を発送いたしましたのでご連絡申し上げます。

================================
発送情報
================================
【注文番号】${data.orderInfo.orderId}
【配送会社】${data.shipmentInfo.carrier}
【追跡番号】${data.shipmentInfo.trackingNumber}
【お届け予定日】${formatDateJP(data.shipmentInfo.estimatedDelivery)}

${data.trackingUrl ? `【配送状況確認】
${data.trackingUrl}` : ''}

================================
お届け先
================================
${sanitizeContent(data.shipmentInfo.shippingAddress)}

================================
発送内容
================================
${itemsList}

【注文合計】${formatCurrencyJP(data.orderInfo.totalAmount)}

商品の到着をお楽しみにしております。
お届けまで、今しばらくお待ちください。

今後とも、弊社サービスをよろしくお願い申し上げます。

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>商品を発送いたしました</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f0fdf4;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 16px;
      line-height: 2;
      color: #555;
      margin-bottom: 30px;
    }
    .shipment-box {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      padding: 30px;
      margin: 30px 0;
      border-radius: 8px;
      border-left: 4px solid #10b981;
      text-align: center;
    }
    .shipment-icon {
      font-size: 64px;
      margin-bottom: 15px;
    }
    .shipment-title {
      font-size: 22px;
      font-weight: bold;
      color: #059669;
      margin: 0 0 10px 0;
    }
    .tracking-box {
      background: #fef3c7;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      border: 2px solid #f59e0b;
    }
    .tracking-label {
      font-size: 13px;
      color: #78350f;
      margin-bottom: 5px;
    }
    .tracking-number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      letter-spacing: 0.1em;
      margin: 10px 0;
    }
    .cta-button {
      display: inline-block;
      background: #f59e0b;
      color: white;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 14px;
      margin-top: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .info-card {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .info-card-icon {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .info-card-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    .info-card-value {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    .address-box {
      background: #f8fafc;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #64748b;
    }
    .items-list {
      background: #f9fafb;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .item-row {
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .item-row:last-child {
      border-bottom: none;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
    @media only screen and (max-width: 600px) {
      .info-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-icon">📦</div>
      <h1>商品を発送いたしました</h1>
    </div>

    <div class="content">
      <div class="greeting">
        ${data.recipient.company ? `<strong>${sanitizeContent(data.recipient.company)}</strong><br>` : ''}
        <strong>${sanitizeContent(data.recipient.name)}</strong> 様<br><br>

        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>

        この度、ご注文いただきました商品を発送いたしましたのでご連絡申し上げます。
      </div>

      <div class="shipment-box">
        <div class="shipment-icon">🚚</div>
        <h2 class="shipment-title">商品を発送いたしました！</h2>
        <p style="margin: 10px 0; color: #047857;">お届け予定日: ${formatDateJP(data.shipmentInfo.estimatedDelivery)}</p>
      </div>

      <div class="tracking-box">
        <div class="tracking-label">追跡番号 / Tracking Number</div>
        <div class="tracking-number">${sanitizeContent(data.shipmentInfo.trackingNumber)}</div>
        ${data.trackingUrl ? `
        <div style="text-align: center;">
          <a href="${sanitizeContent(data.trackingUrl)}" class="cta-button">配送状況を確認する</a>
        </div>
        ` : ''}
      </div>

      <div class="info-grid">
        <div class="info-card">
          <div class="info-card-icon">📋</div>
          <div class="info-card-label">注文番号</div>
          <div class="info-card-value">${sanitizeContent(data.orderInfo.orderId)}</div>
        </div>
        <div class="info-card">
          <div class="info-card-icon">🚛</div>
          <div class="info-card-label">配送会社</div>
          <div class="info-card-value">${sanitizeContent(data.shipmentInfo.carrier)}</div>
        </div>
      </div>

      <div class="address-box">
        <div style="font-weight: bold; color: #475569; margin-bottom: 10px;">📍 お届け先</div>
        <div style="line-height: 1.8; color: #374151;">${sanitizeContent(data.shipmentInfo.shippingAddress)}</div>
      </div>

      <div class="items-list">
        <div style="font-weight: bold; color: #475569; margin-bottom: 15px;">📦 発送内容</div>
        ${data.orderInfo.items.map((item, index) => `
        <div class="item-row">
          <strong>${index + 1}. ${sanitizeContent(item.name)}</strong> × ${item.quantity}点
        </div>
        `).join('')}
      </div>

      <div style="margin-top: 30px; text-align: center;">
        <div style="font-size: 18px; color: #059669; font-weight: bold; margin-bottom: 10px;">
          商品の到着をお楽しみにしています
        </div>
        <div style="color: #64748b;">
          お届けまで、今しばらくお待ちください。
        </div>
      </div>

      <div style="margin-top: 30px; text-align: center; color: #374151; font-weight: bold;">
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

// =====================================================
// Admin Notification Templates
// =====================================================

/**
 * 管理者通知: 新規注文
 */

