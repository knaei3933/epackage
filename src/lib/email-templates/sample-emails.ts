/**
 * Sample Email Templates
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
  SampleRequestEmailData,
} from './types';

export function getSampleRequestCustomerEmail(data: SampleRequestEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  const samplesList = data.samples.map((s, i) =>
    `${i + 1}. ${s.productName} x ${s.quantity}点`
  ).join('\n');

  const deliveryList = data.deliveryDestinations.map((d, i) =>
    `${i + 1}. ${d.companyName ? d.companyName + ' ' : ''}${d.contactPerson} 様\n   電話: ${d.phone}\n   住所: ${d.address}`
  ).join('\n\n');

  const sanitizedMessage = sanitizeText(data.message);

  return {
    subject: `【Epackage Lab】サンプルリクエストを受け付けました`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。
この度は、サンプルリクエストをお申込みいただき、誠にありがとうございます。

以下の内容でお受け付けいたしました。

================================
リクエストID: ${data.requestId}
================================

【ご依頼内容】
${samplesList}

【配送先】
${deliveryList}

【お問い合わせ内容】
${sanitizedMessage}

================================
担当者より折り返しご連絡させていただきます。
================================

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
  <title>サンプルリクエストを受け付けました</title>
</head>
<body style="margin: 0; padding: 20px; font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif; background-color: #f9fafb; line-height: 1.6; color: #333;">
  <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div class="header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px;">サンプルリクエストを受け付けました</h1>
    </div>
    <div class="content" style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <p style="margin-top: 0;">
        ${data.recipient.company ? `<strong>${data.recipient.company}</strong><br>` : ''}<strong>${data.recipient.name}</strong> 様
      </p>
      <p>平素より格別のご高配を賜り、厚く御礼申し上げます。<br>この度は、サンプルリクエストをお申込みいただき、誠にありがとうございます。</p>

      <div style="background: #fdf2f8; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f093fb;">
        <h3 style="margin-top: 0; color: #be185d;">リクエストID: ${data.requestId}</h3>
        <div style="color: #666; font-weight: bold; margin-bottom: 10px;">ご依頼内容</div>
        ${data.samples.map((s, i) => `
          <div style="background: white; padding: 12px; margin: 8px 0; border-radius: 4px;">
            <strong>${i + 1}. ${s.productName}</strong> x ${s.quantity}点
          </div>
        `).join('')}
      </div>

      <div style="background: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #b45309;">配送先</h3>
        ${data.deliveryDestinations.map((d, i) => `
          <div style="background: white; padding: 12px; margin: 8px 0; border-radius: 4px;">
            <strong>${i + 1}. ${d.companyName ? d.companyName + ' ' : ''}${d.contactPerson} 様</strong><br>
            <span style="color: #666; font-size: 14px;">
              電話: ${d.phone}<br>
              住所: ${d.address}
            </span>
          </div>
        `).join('')}
      </div>

      ${data.message ? `
      <div style="background: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3 style="margin-top: 0;">お問い合わせ内容</h3>
        <div style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 4px;">${sanitizedMessage}</div>
      </div>
      ` : ''}

      <p style="text-align: center; color: #be185d; font-weight: bold;">担当者より折り返しご連絡させていただきます。<br>今しばらくお待ちください。</p>
    </div>
    <div class="footer" style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px;">
      <p style="margin: 5px 0;">Epackage Lab</p>
      <p style="margin: 5px 0;">兵庫県加古郡稲美町六分一486</p>
      <p style="margin: 5px 0;">電話: 050-1793-6500</p>
      <p style="margin: 5px 0;">Email: info@package-lab.com</p>
      <p style="margin: 5px 0;">https://epackage-lab.com</p>
      <p style="margin: 15px 0 5px 0; color: #999;">※このメールはシステムによる自動送信です。</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };
}

/**
 * サンプルリクエスト通知メール（管理者向け）
 * Sample Request Notification Email (Admin)
 */

export function getSampleRequestAdminEmail(data: SampleRequestEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  const samplesList = data.samples.map((s, i) =>
    `${i + 1}. ${s.productName} x ${s.quantity}点`
  ).join('\n');

  const deliveryList = data.deliveryDestinations.map((d, i) =>
    `${i + 1}. ${d.companyName ? d.companyName + ' ' : ''}${d.contactPerson} 様\n   電話: ${d.phone}\n   住所: ${d.address}`
  ).join('\n\n');

  const sanitizedMessage = sanitizeText(data.message);

  return {
    subject: `【新規サンプルリクエスト】${data.requestId}`,
    text: `
${recipientHeader}

新しいサンプルリクエストが届きました。

================================
リクエストID: ${data.requestId}
================================

【顧客情報】
お名前: ${data.recipient.name}
${data.recipient.company ? `会社名: ${data.recipient.company}\n` : ''}メールアドレス: ${data.recipient.email}

【ご依頼内容】
${samplesList}

【配送先】
${deliveryList}

【お問い合わせ内容】
${sanitizedMessage}

================================
管理画面で詳細をご確認ください。
================================

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>新規サンプルリクエスト</title>
</head>
<body style="margin: 0; padding: 20px; font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif; background-color: #f9fafb; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 6px 6px 0 0;">
      <h2 style="margin: 0; font-size: 20px;">【新規サンプルリクエスト】</h2>
      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">リクエストID: ${data.requestId}</p>
    </div>

    <div style="padding: 20px;">
      <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
        <h3 style="margin-top: 0; color: #1e40af; font-size: 16px;">顧客情報</h3>
        <p style="margin: 5px 0;"><strong>お名前:</strong> ${data.recipient.name}</p>
        ${data.recipient.company ? `<p style="margin: 5px 0;"><strong>会社名:</strong> ${data.recipient.company}</p>` : ''}
        <p style="margin: 5px 0;"><strong>メール:</strong> <a href="mailto:${data.recipient.email}" style="color: #3b82f6;">${data.recipient.email}</a></p>
      </div>

      <div style="background: #fdf2f8; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #ec4899;">
        <h3 style="margin-top: 0; color: #be185d; font-size: 16px;">ご依頼内容</h3>
        ${data.samples.map((s, i) => `
          <div style="background: white; padding: 10px; margin: 5px 0; border-radius: 4px;">
            <strong>${i + 1}. ${s.productName}</strong> x ${s.quantity}点
          </div>
        `).join('')}
      </div>

      <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
        <h3 style="margin-top: 0; color: #b45309; font-size: 16px;">配送先</h3>
        ${data.deliveryDestinations.map((d, i) => `
          <div style="background: white; padding: 10px; margin: 5px 0; border-radius: 4px;">
            <strong>${i + 1}. ${d.companyName ? d.companyName + ' ' : ''}${d.contactPerson} 様</strong><br>
            <span style="font-size: 14px; color: #666;">
              電話: ${d.phone}<br>
              住所: ${d.address}
            </span>
          </div>
        `).join('')}
      </div>

      ${data.message ? `
      <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; font-size: 16px;">お問い合わせ内容</h3>
        <div style="white-space: pre-wrap; background: white; padding: 10px; border-radius: 4px;">${sanitizedMessage}</div>
      </div>
      ` : ''}

      <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 5px 0; color: #666; font-size: 14px;">管理画面で詳細をご確認ください</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };
}
