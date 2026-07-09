/**
 * Work Order Email Functions
 *
 * 作業指示書メール送信
 */

import { sendEmail, FROM_EMAIL, ADMIN_EMAIL } from './transport';
import type { WorkOrderData } from './types';

// =====================================================

/**
 * Work Order Customer Notification Email
 */
const getWorkOrderCustomerEmail = (data: WorkOrderData) => {
  const itemsList = data.items.map((item, i) =>
    `${i + 1}. ${item.product_name} x ${item.quantity.toLocaleString()}点`
  ).join('\n');

  const completionDate = new Date(data.estimatedCompletion);
  const formattedDate = completionDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    to: data.customerEmail,
    from: FROM_EMAIL,
    subject: `【製造開始】作業指示書発行のお知らせ ${data.workOrderNumber}`,
    text: `
${data.customerName} 様

平素はEpackage Labをご利用いただきありがとうございます。
この度、ご注文いただいた製品の製造を開始いたしました。

================================
作業指示書番号: ${data.workOrderNumber}
================================

【ご注文番号】${data.orderNumber}

【製造予定アイテム】
${itemsList}

【納品予定日】${formattedDate}

【製造工程】
${data.productionTimeline.steps.map((s, i) =>
  `${i + 1}. ${s.name_ja} (${s.duration_days}日間)`
).join('\n')}

================================
製造完了次第、配送の手配をさせていただきます。
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
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #10b981; }
    .label { color: #666; font-size: 14px; margin-bottom: 5px; }
    .value { color: #333; font-size: 16px; margin-bottom: 15px; }
    .step-item { background: #ecfdf5; padding: 12px; margin: 8px 0; border-radius: 4px; border-left: 3px solid #10b981; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">製造開始のお知らせ</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0;"><strong>${data.customerName}</strong> 様</p>
      <p>平素はEpackage Labをご利用いただきありがとうございます。<br>この度、ご注文いただいた製品の製造を開始いたしました。</p>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #10b981;">作業指示書番号: ${data.workOrderNumber}</h3>
        <div class="label">ご注文番号</div>
        <div class="value"><code>${data.orderNumber}</code></div>

        <div class="label">製造予定アイテム</div>
        ${data.items.map((item, i) => `
          <div style="background: #f0fdf4; padding: 10px; margin: 5px 0; border-radius: 4px;">
            <strong>${i + 1}. ${item.product_name}</strong> x ${item.quantity.toLocaleString()}点
          </div>
        `).join('')}

        <div class="label">納品予定日</div>
        <div class="value" style="color: #10b981; font-weight: bold; font-size: 18px;">
          ${formattedDate}
        </div>
      </div>

      <div class="info-box">
        <h3 style="margin-top: 0; color: #10b981;">製造工程</h3>
        ${data.productionTimeline.steps.map((s, i) => `
          <div class="step-item">
            <strong>${i + 1}. ${s.name_ja}</strong>
            <span style="color: #666; font-size: 14px;">(${s.duration_days}日間)</span>
          </div>
        `).join('')}
      </div>

      <p style="text-align: center; color: #10b981; font-weight: bold;">製造完了次第、配送の手配をさせていただきます。</p>
    </div>
    <div class="footer">
      <p>Epackage Lab<br>https://epackage-lab.com</p>
      <p style="font-size: 11px; color: #999;">※このメールはシステムによる自動送信です。</p>
    </div>
  </div>
</body>
</html>
  `.trim()
  };
};

/**
 * Work Order Production Team Notification Email
 */
const getWorkOrderProductionTeamEmail = (data: WorkOrderData) => {
  const itemsList = data.items.map((item, i) =>
    `${i + 1}. ${item.product_name} x ${item.quantity.toLocaleString()}点`
  ).join('\n');

  const materialsList = data.materialRequirements.map((m, i) =>
    `${i + 1}. ${m.material_name}: ${m.quantity.toLocaleString()} ${m.unit}`
  ).join('\n');

  const completionDate = new Date(data.estimatedCompletion);
  const formattedDate = completionDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject: `【新作業指示】${data.workOrderNumber} - ${data.customerName}`,
    text: `
新しい作業指示書が発行されました。

================================
作業指示書詳細
================================

【作業指示書番号】${data.workOrderNumber}
【注文番号】${data.orderNumber}
【お客様名】${data.customerName}
【メールアドレス】${data.customerEmail}

【納品予定日】${formattedDate}（${data.productionTimeline.total_days}日後）

--------------------------------
製造アイテム
--------------------------------
${itemsList}

--------------------------------
材料要求
--------------------------------
${materialsList}

--------------------------------
製造工程
--------------------------------
${data.productionTimeline.steps.map((s, i) =>
  `${i + 1}. ${s.name_ja} - ${s.duration_days}日間`
).join('\n')}

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
    .alert { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box { background: #f9fafb; padding: 20px; margin: 15px 0; border-radius: 8px; }
    .label { color: #666; font-size: 13px; font-weight: bold; margin-bottom: 5px; }
    .value { color: #333; font-size: 15px; margin-bottom: 12px; }
    .step-item { background: #ecfdf5; padding: 10px; margin: 5px 0; border-radius: 4px; }
    .material-item { background: #fef3c7; padding: 10px; margin: 5px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <strong>🏭 新規作業指示通知</strong>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0;">作業指示書詳細</h3>
      <div class="label">作業指示書番号</div>
      <div class="value"><code>${data.workOrderNumber}</code></div>

      <div class="label">注文番号</div>
      <div class="value"><code>${data.orderNumber}</code></div>

      <div class="label">お客様名</div>
      <div class="value">${data.customerName}</div>

      <div class="label">メールアドレス</div>
      <div class="value"><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></div>

      <div class="label">納品予定日</div>
      <div class="value" style="color: #10b981; font-weight: bold;">
        ${formattedDate} <span style="color: #666; font-weight: normal;">（${data.productionTimeline.total_days}日後）</span>
      </div>
    </div>

    <div class="info-box">
      <h3>製造アイテム</h3>
      ${data.items.map((item, i) => `
        <div class="step-item">
          <strong>${i + 1}. ${item.product_name}</strong> x ${item.quantity.toLocaleString()}点
        </div>
      `).join('')}
    </div>

    <div class="info-box">
      <h3>材料要求</h3>
      ${data.materialRequirements.map((m, i) => `
        <div class="material-item">
          <strong>${i + 1}. ${m.material_name}</strong>: ${m.quantity.toLocaleString()} ${m.unit}
        </div>
      `).join('')}
    </div>

    <div class="info-box">
      <h3>製造工程</h3>
      ${data.productionTimeline.steps.map((s, i) => `
        <div class="step-item" style="border-left-color: #059669;">
          <strong>${i + 1}. ${s.name_ja}</strong>
          <span style="color: #666; font-size: 14px;">- ${s.duration_days}日間</span>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>
  `.trim()
  };
};

/**
 * Work Order Email Sending Functions
 */

/**
 * Send Work Order notifications (customer + production team)
 */
export async function sendWorkOrderEmails(data: WorkOrderData): Promise<{
  success: boolean;
  customerEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  productionTeamEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  previewUrl?: string;
  errors: string[];
}> {
  const errors: string[] = [];
  const results: {
    customerEmail?: { success: boolean; messageId?: string; previewUrl?: string };
    productionTeamEmail?: { success: boolean; messageId?: string; previewUrl?: string };
  } = {};

  // Customer notification email
  const customerEmailParams = getWorkOrderCustomerEmail(data);
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

  // Production team notification email
  const productionEmailParams = getWorkOrderProductionTeamEmail(data);
  const productionResult = await sendEmail(
    productionEmailParams.to,
    productionEmailParams.subject,
    productionEmailParams.text,
    productionEmailParams.html
  );
  results.productionTeamEmail = {
    success: productionResult.success,
    messageId: productionResult.messageId,
    previewUrl: productionResult.previewUrl
  };

  if (!productionResult.success) {
    errors.push(`製造チームメール送信失敗: ${productionResult.error}`);
  }

  return {
    success: errors.length === 0,
    previewUrl: customerResult.previewUrl || productionResult.previewUrl,
    ...results,
    errors
  };
}

/**
 * メール設定状態確認
 */
