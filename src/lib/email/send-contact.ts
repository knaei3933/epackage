/**
 * Contact + Sample Request Email Functions
 *
 * お問い合わせ・サンプル請求メール送信
 */

import { sendEmail, sendTemplatedEmail, sanitizeUserMessage, escapeHtml, FROM_EMAIL } from './transport';
import { createRecipient } from '../email-templates';
import type { EmailRecipient, SampleRequestEmailData as TemplateSampleRequestEmailData } from '../email-templates';
import type { ContactEmailData, SampleRequestEmailData, AdminNotificationData } from './types';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@package-lab.com';

// =====================================================
// Email Templates
// =====================================================

/**
 * Contact Form メールテンプレート（顧客用）
 */
const getContactConfirmationEmail = (data: ContactEmailData) => ({
  to: data.email,
  from: FROM_EMAIL,
  subject: '【Epackage Lab】お問い合わせありがとうございます',
  text: `
${data.company ? data.company + '\n' : ''}${data.name} 様

お問い合わせいただきありがとうございます。
以下の内容でお問い合わせを受け付けました。

================================
お問い合わせ内容
================================

【お問い合わせ種類】${data.inquiryType}
【件名】${data.subject}
【お問い合わせ内容】
${sanitizeUserMessage(data.message)}

--------------------------------
お問い合わせ者情報
--------------------------------
【お名前】${data.name}
${data.nameKana ? `【フリガナ】${data.nameKana}\n` : ''}【メールアドレス】${data.email}
${data.company ? `【会社名】${data.company}\n` : ''}${data.phone ? `【電話番号】${data.phone}\n` : ''}${data.postalCode ? `【郵便番号】${data.postalCode}\n` : ''}${data.address ? `【住所】${data.address}\n` : ''}${data.urgency ? `【緊急度】${data.urgency}\n` : ''}${data.preferredContact ? `【ご希望の連絡方法】${data.preferredContact}\n` : ''}

================================
担当者より折り返しご連絡させていただきます。
今しばらくお待ちください。
================================

Epackage Lab
https://epackage-lab.com

※このメールはシステムによる自動送信です。
  `.trim(),
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .label { color: #666; font-size: 14px; margin-bottom: 5px; }
    .value { color: #333; font-size: 16px; margin-bottom: 15px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">お問い合わせありがとうございます</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0;">
        ${data.company ? `<strong>${escapeHtml(data.company)}</strong><br>` : ''}<strong>${escapeHtml(data.name)}</strong> 様
      </p>
      <p>お問い合わせいただきありがとうございます。<br>以下の内容でお問い合わせを受け付けました。</p>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #667eea;">お問い合わせ内容</h3>
        <div class="label">お問い合わせ種類</div>
        <div class="value">${escapeHtml(data.inquiryType)}</div>

        <div class="label">件名</div>
        <div class="value">${escapeHtml(data.subject)}</div>

        <div class="label">お問い合わせ内容</div>
        <div class="value" style="white-space: pre-wrap; background: #f3f4f6; padding: 15px; border-radius: 4px;">${sanitizeUserMessage(data.message)}</div>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #667eea;">お問い合わせ者情報</h3>
        <div class="label">お名前</div>
        <div class="value">${escapeHtml(data.name)}</div>
        ${data.nameKana ? `<div class="label">フリガナ</div><div class="value">${escapeHtml(data.nameKana)}</div>` : ''}

        <div class="label">メールアドレス</div>
        <div class="value">${escapeHtml(data.email)}</div>
        ${data.company ? `<div class="label">会社名</div><div class="value">${escapeHtml(data.company)}</div>` : ''}
        ${data.phone ? `<div class="label">電話番号</div><div class="value">${escapeHtml(data.phone)}</div>` : ''}
        ${data.postalCode ? `<div class="label">郵便番号</div><div class="value">${escapeHtml(data.postalCode)}</div>` : ''}
        ${data.address ? `<div class="label">住所</div><div class="value">${escapeHtml(data.address)}</div>` : ''}
        ${data.urgency ? `<div class="label">緊急度</div><div class="value">${escapeHtml(data.urgency)}</div>` : ''}
        ${data.preferredContact ? `<div class="label">ご希望の連絡方法</div><div class="value">${escapeHtml(data.preferredContact)}</div>` : ''}
      </div>

      <p style="text-align: center; color: #667eea; font-weight: bold;">担当者より折り返しご連絡させていただきます。<br>今しばらくお待ちください。</p>
    </div>
    <div class="footer">
      <p>Epackage Lab<br>https://epackage-lab.com</p>
      <p style="font-size: 11px; color: #999;">※このメールはシステムによる自動送信です。</p>
    </div>
  </div>
</body>
</html>
  `.trim()
});

/**
 * Contact Form 管理者通知メール
 */
const getContactAdminNotificationEmail = (data: ContactEmailData & { requestId: string }) => ({
  to: ADMIN_EMAIL,
  from: FROM_EMAIL,
  replyTo: data.email, // 返信先を顧客のメールアドレスに設定
  subject: `【新規お問い合わせ】${data.subject} - ${data.name}`,
  text: `
新しいお問い合わせがありました。

================================
お問い合わせ情報
================================

【リクエストID】${data.requestId}
【お問い合わせ種類】${data.inquiryType}
【緊急度】${data.urgency || '通常'}

--------------------------------
お客様情報
--------------------------------
【お名前】${data.name}
${data.nameKana ? `【フリガナ】${data.nameKana}\n` : ''}【メールアドレス】${data.email}
【電話番号】${data.phone || '未入力'}
${data.fax ? `【FAX】${data.fax}\n` : ''}${data.company ? `【会社名】${data.company}\n` : ''}${data.postalCode ? `【郵便番号】${data.postalCode}\n` : ''}${data.address ? `【住所】${data.address}\n` : ''}【ご希望の連絡方法】${data.preferredContact || '未指定'}

--------------------------------
お問い合わせ内容
--------------------------------
【件名】${data.subject}

${sanitizeUserMessage(data.message)}

================================
Epackage Lab 管理画面
================================
  `.trim(),
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box { background: #f9fafb; padding: 20px; margin: 15px 0; border-radius: 8px; }
    .label { color: #666; font-size: 13px; font-weight: bold; margin-bottom: 5px; }
    .value { color: #333; font-size: 15px; margin-bottom: 12px; }
    .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <strong>⚠️ 新規お問い合わせ通知</strong>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0;">お問い合わせ情報</h3>
      <div class="label">リクエストID</div>
      <div class="value"><code>${escapeHtml(data.requestId)}</code></div>

      <div class="label">お問い合わせ種類</div>
      <div class="value">${escapeHtml(data.inquiryType)}</div>

      <div class="label">緊急度</div>
      <div class="value">${escapeHtml(data.urgency || '通常')}</div>
    </div>

    <div class="info-box">
      <h3>お客様情報</h3>
      <div class="label">お名前</div>
      <div class="value">${escapeHtml(data.name)}</div>
      ${data.nameKana ? `<div class="label">フリガナ</div><div class="value">${escapeHtml(data.nameKana)}</div>` : ''}

      <div class="label">メールアドレス</div>
      <div class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></div>

      <div class="label">電話番号</div>
      <div class="value">${escapeHtml(data.phone || '未入力')}</div>

      ${data.fax ? `<div class="label">FAX</div><div class="value">${escapeHtml(data.fax)}</div>` : ''}
      ${data.company ? `<div class="label">会社名</div><div class="value">${escapeHtml(data.company)}</div>` : ''}
      ${data.postalCode ? `<div class="label">郵便番号</div><div class="value">${escapeHtml(data.postalCode)}</div>` : ''}
      ${data.address ? `<div class="label">住所</div><div class="value">${escapeHtml(data.address)}</div>` : ''}
      ${data.preferredContact ? `<div class="label">ご希望の連絡方法</div><div class="value">${escapeHtml(data.preferredContact)}</div>` : ''}
    </div>

    <div class="info-box">
      <h3>お問い合わせ内容</h3>
      <div class="label">件名</div>
      <div class="value"><strong>${escapeHtml(data.subject)}</strong></div>

      <div class="label">内容</div>
      <div class="value" style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">${sanitizeUserMessage(data.message)}</div>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="mailto:${escapeHtml(data.email)}" class="button">メールで返信</a>
    </div>
  </div>
</body>
</html>
  `.trim()
});

/**
 * Sample Request メールテンプレート（顧客用）
 */
const getSampleRequestConfirmationEmail = (data: SampleRequestEmailData) => {
  const samplesList = data.samples.map((s, i) =>
    `${i + 1}. ${s.productName} x ${s.quantity}点`
  ).join('\n');

  const deliveryList = data.deliveryDestinations.map((d, i) =>
    `${i + 1}. ${d.companyName ? d.companyName + ' ' : ''}${d.contactPerson} 様\n   電話: ${d.phone}\n   住所: ${d.address}`
  ).join('\n\n');

  return {
    to: data.customerEmail,
    from: FROM_EMAIL,
    subject: '【Epackage Lab】サンプルリクエストを受け付けました',
    text: `
${data.company ? data.company + '\n' : ''}${data.customerName} 様

サンプルリクエストをお申込みいただきありがとうございます。
以下の内容でお受け付けいたしました。

================================
リクエストID: ${data.requestId}
================================

【ご依頼内容】
${samplesList}

【配送先】
${deliveryList}

【お問い合わせ内容】
${sanitizeUserMessage(data.message)}

================================
担当者より折り返しご連絡させていただきます。
================================

Epackage Lab
https://epackage-lab.com
  `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f093fb; }
    .sample-item { background: #fdf2f8; padding: 12px; margin: 8px 0; border-radius: 4px; }
    .delivery-item { background: #fef3c7; padding: 12px; margin: 8px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">サンプルリクエストを受け付けました</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0;">
        ${data.company ? `<strong>${data.company}</strong><br>` : ''}<strong>${data.customerName}</strong> 様
      </p>
      <p>サンプルリクエストをお申込みいただきありがとうございます。<br>以下の内容でお受け付けいたしました。</p>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #f093fb;">リクエストID: ${data.requestId}</h3>
        <div class="label" style="color: #666;">ご依頼内容</div>
        ${data.samples.map((s, i) => `
          <div class="sample-item">
            <strong>${i + 1}. ${s.productName}</strong> x ${s.quantity}点
          </div>
        `).join('')}
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #f093fb;">配送先</h3>
        ${data.deliveryDestinations.map((d, i) => `
          <div class="delivery-item">
            <strong>${i + 1}. ${d.companyName ? d.companyName + ' ' : ''}${d.contactPerson} 様</strong><br>
            <span style="color: #666; font-size: 14px;">
              電話: ${d.phone}<br>
              住所: ${d.address}
            </span>
          </div>
        `).join('')}
      </div>

      ${data.message ? `
      <div class="info-box">
        <h3 style="margin-top: 0;">お問い合わせ内容</h3>
        <div style="white-space: pre-wrap; background: #f3f4f6; padding: 15px; border-radius: 4px;">${sanitizeUserMessage(data.message)}</div>
      </div>
      ` : ''}

      <p style="text-align: center; color: #f093fb; font-weight: bold;">担当者より折り返しご連絡させていただきます。<br>今しばらくお待ちください。</p>
    </div>
    <div class="footer">
      <p>Epackage Lab<br>https://epackage-lab.com</p>
    </div>
  </div>
</body>
</html>
  `.trim()
  };
};

/**
 * Sample Request 管理者通知メール
 */
const getSampleRequestAdminNotificationEmail = (data: SampleRequestEmailData) => {
  const samplesList = data.samples && data.samples.length > 0
    ? data.samples.map((s, i) => `${i + 1}. ${s.productName} x ${s.quantity}点`).join('\n')
    : '（標準サンプルセット）';

  return {
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject: `【サンプルリクエスト】${data.customerName} - ${data.requestId}`,
    text: `
新しいサンプルリクエストがありました。

================================
リクエスト情報
================================

【リクエストID】${data.requestId}
【お客様名】${data.customerName}
【会社名】${data.company || '個人'}
【メール】${data.customerEmail}
【電話】${data.customerPhone}

【ご依頼内容】
${samplesList}

【配送タイプ】${data.deliveryType}

【配送先】
${data.deliveryDestinations.map((d, i) =>
  `${i + 1}. ${d.companyName ? d.companyName + ' ' : ''}${d.contactPerson} 様\n   電話: ${d.phone}\n   住所: ${d.address}`
).join('\n\n')}

【お問い合わせ内容】
${data.message || 'なし'}
  `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #fce7f3; border-left: 4px solid #f093fb; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box { background: #f9fafb; padding: 20px; margin: 15px 0; border-radius: 8px; }
    .label { color: #666; font-size: 13px; font-weight: bold; margin-bottom: 5px; }
    .value { color: #333; font-size: 15px; margin-bottom: 12px; }
    .sample-item { background: #fdf2f8; padding: 10px; margin: 5px 0; border-radius: 4px; }
    .delivery-item { background: #fef3c7; padding: 10px; margin: 5px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <strong>🎁 新規サンプルリクエスト</strong>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0;">リクエスト情報</h3>
      <div class="label">リクエストID</div>
      <div class="value"><code>${data.requestId}</code></div>

      <div class="label">お客様名</div>
      <div class="value">${data.customerName}</div>

      <div class="label">会社名</div>
      <div class="value">${data.company || '個人'}</div>

      <div class="label">連絡先</div>
      <div class="value">
        <a href="mailto:${data.customerEmail}">${data.customerEmail}</a><br>
        <a href="tel:${data.customerPhone}">${data.customerPhone}</a>
      </div>
    </div>

    <div class="info-box">
      <h3>ご依頼内容</h3>
      ${data.samples && data.samples.length > 0 ? data.samples.map((s, i) => `
        <div class="sample-item">
          <strong>${i + 1}. ${s.productName}</strong> x ${s.quantity}点
        </div>
      `).join('') : '<div class="sample-item">標準サンプルセット（6種類）</div>'}
    </div>

    <div class="info-box">
      <h3>配送情報</h3>
      <div class="label">配送タイプ</div>
      <div class="value">${data.deliveryType}</div>

      <div class="label">配送先</div>
      ${data.deliveryDestinations.map((d, i) => `
        <div class="delivery-item">
          <strong>${i + 1}. ${d.companyName ? d.companyName + ' ' : ''}${d.contactPerson} 様</strong><br>
          <span style="color: #666; font-size: 14px;">
            電話: <a href="tel:${d.phone}">${d.phone}</a><br>
            住所: ${d.address}
          </span>
        </div>
      `).join('')}
    </div>

    ${data.message ? `
    <div class="info-box">
      <h3>お問い合わせ内容</h3>
      <div style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">${sanitizeUserMessage(data.message)}</div>
    </div>
    ` : ''}
  </div>
</body>
</html>
  `.trim()
  };
};


export async function sendContactEmail(data: ContactEmailData & { requestId: string }): Promise<{
  success: boolean;
  customerEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  adminEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  previewUrl?: string; // Ethereal preview URL (개발용)
  errors: string[];
}> {
  const errors: string[] = [];
  const results: {
    customerEmail?: { success: boolean; messageId?: string; previewUrl?: string };
    adminEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  } = {};

  // 顧客確認メール
  const customerEmailParams = getContactConfirmationEmail(data);
  const customerResult = await sendEmail(
    customerEmailParams.to,
    customerEmailParams.subject,
    customerEmailParams.text,
    customerEmailParams.html
  );
  results.customerEmail = {
    success: customerResult.success,
    messageId: customerResult.messageId,
    previewUrl: customerResult.previewUrl
  };

  if (!customerResult.success) {
    errors.push(`顧客メール送信失敗: ${customerResult.error}`);
  }

  // 管理者通知メール
  const adminEmailParams = getContactAdminNotificationEmail(data);
  const adminResult = await sendEmail(
    adminEmailParams.to,
    adminEmailParams.subject,
    adminEmailParams.text,
    adminEmailParams.html
  );
  results.adminEmail = {
    success: adminResult.success,
    messageId: adminResult.messageId,
    previewUrl: adminResult.previewUrl
  };

  if (!adminResult.success) {
    errors.push(`管理者メール送信失敗: ${adminResult.error}`);
  }

  return {
    success: errors.length === 0,
    previewUrl: customerResult.previewUrl || adminResult.previewUrl,
    ...results,
    errors
  };
}

/**
 * Sample Request メール送信（顧客 + 管理者）
 * テンプレートシステムを使用して日本語エンコーディングを正しく処理
 */
export async function sendSampleRequestEmail(data: SampleRequestEmailData): Promise<{
  success: boolean;
  customerEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  adminEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  previewUrl?: string; // Ethereal preview URL (개발용)
  errors: string[];
}> {
  const errors: string[] = [];
  const results: {
    customerEmail?: { success: boolean; messageId?: string; previewUrl?: string };
    adminEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  } = {};

  // 顧客確認メール - テンプレートシステムを使用
  const customerRecipient: EmailRecipient = {
    name: data.customerName,
    email: data.customerEmail,
    company: data.company
  };

  const customerData: TemplateSampleRequestEmailData = {
    recipient: customerRecipient,
    requestId: data.requestId,
    samples: data.samples,
    deliveryDestinations: data.deliveryDestinations,
    message: data.message
  };

  const customerResult = await sendTemplatedEmail('sample_request_customer', customerData, customerRecipient);
  results.customerEmail = {
    success: customerResult.success,
    messageId: customerResult.messageId,
    previewUrl: customerResult.previewUrl
  };

  if (!customerResult.success) {
    errors.push(`顧客メール送信失敗: ${customerResult.error}`);
  }

  // 管理者通知メール - テンプレートシステムを使用
  const adminRecipient: EmailRecipient = {
    name: '管理者',
    email: ADMIN_EMAIL
  };

  const adminData: TemplateSampleRequestEmailData = {
    recipient: adminRecipient,
    requestId: data.requestId,
    samples: data.samples,
    deliveryDestinations: data.deliveryDestinations,
    message: data.message
  };

  const adminResult = await sendTemplatedEmail('sample_request_admin', adminData, adminRecipient);
  results.adminEmail = {
    success: adminResult.success,
    messageId: adminResult.messageId,
    previewUrl: adminResult.previewUrl
  };

  if (!adminResult.success) {
    errors.push(`管理者メール送信失敗: ${adminResult.error}`);
  }

  return {
    success: errors.length === 0,
    previewUrl: customerResult.previewUrl || adminResult.previewUrl,
    ...results,
    errors
  };
}

