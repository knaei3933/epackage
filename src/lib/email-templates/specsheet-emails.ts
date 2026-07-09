/**
 * Specsheet Email Templates
 *
 * Auto-extracted from email-templates.ts
 */

import sanitizeHtml from 'sanitize-html';
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
  SpecSheetApprovalEmailData,
  SpecSheetRejectionEmailData,
} from './types';

export function getSpecSheetApprovalEmail(data: SpecSheetApprovalEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  return {
    subject: `【Epackage Lab】仕様書承認完了 - ${data.specNumber}`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、以下の通り仕様書が承認されましたので、ご通知申し上げます。

================================
仕様書番号
================================
${data.specNumber}

================================
注文番号
================================
${data.orderNumber}

================================
承認日時
================================
${data.approvedAt}

${data.comments ? `
================================
コメント
================================
${data.comments}
` : ''}

================================
次のステップ
================================
1. 仕様書に基づいて生産を開始します
2. 完成次第、出荷の手配を行います
3. 納期までに商品をお届けいたします

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>仕様書承認完了</title>
</head>
<body style="font-family: 'Noto Sans JP', sans-serif; line-height: 1.8; color: #333; background-color: #f0fdf4; margin: 0; padding: 20px;">
  <div class="email-container" style="max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
      <h1 style="margin: 0; font-size: 26px; font-weight: bold;">仕様書承認完了</h1>
      <p style="margin-top: 10px; font-size: 14px; opacity: 0.9;">仕様書が承認されました</p>
    </div>

    <div class="content" style="padding: 40px 30px;">
      <div class="greeting" style="font-size: 16px; line-height: 2; color: #555; margin-bottom: 30px;">
        ${data.recipient.company ? `${sanitizeContent(data.recipient.company)}<br>` : ''}${sanitizeContent(data.recipient.name)} 様<br><br>
        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>
        この度、以下の通り仕様書が承認されましたので、ご通知申し上げます。
      </div>

      <div class="success-box" style="background: #f0fdf4; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #10b981;">
        <h3 style="margin-top: 0; font-size: 18px; font-weight: bold; color: #059669; margin-bottom: 20px;">仕様書情報</h3>
        <div style="display: flex; margin-bottom: 10px;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">仕様書番号</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.specNumber}</div>
        </div>
        <div style="display: flex; margin-bottom: 10px;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">注文番号</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.orderNumber}</div>
        </div>
        <div style="display: flex;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">承認日時</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.approvedAt}</div>
        </div>
      </div>

      ${data.comments ? `
      <div class="notes-box" style="background: #eff6ff; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 15px;">コメント</h4>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #333;">${sanitizeHtml(data.comments)}</div>
      </div>
      ` : ''}

      <div class="steps-box" style="background: #f0fdf4; padding: 25px; margin: 25px 0; border-radius: 8px;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #059669; margin-bottom: 20px;">次のステップ</h4>
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">1</span>
            <div style="color: #333; font-size: 14px;">仕様書に基づいて生産を開始します</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">2</span>
            <div style="color: #333; font-size: 14px;">完成次第、出荷の手配を行います</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">3</span>
            <div style="color: #333; font-size: 14px;">納期までに商品をお届けいたします</div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer" style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 10px 0; font-size: 12px; color: #64748b;">
        このメールはシステムにより自動送信されています。<br>
        © ${new Date().getFullYear()} Epackage Lab. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

/**
 * 仕様書却下/修正依頼通知メール（管理者用）
 * Spec sheet rejection notification (admin)
 */

export function getSpecSheetRejectionEmail(data: SpecSheetRejectionEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  const changesList = data.requestedChanges && data.requestedChanges.length > 0
    ? data.requestedChanges.map((change, i) => `${i + 1}. ${change}`).join('\n')
    : 'なし';

  return {
    subject: `【Epackage Lab】仕様書修正依頼 - ${data.specNumber}`,
    text: `
${recipientHeader}

仕様書に対する修正依頼が受付されました。

================================
依頼情報
================================
仕様書番号: ${data.specNumber}
注文番号: ${data.orderNumber}
お客様: ${data.customerName}
要請日時: ${data.rejectedAt}

================================
却下/修正事由
================================
${data.reason}

${data.requestedChanges && data.requestedChanges.length > 0 ? `
================================
要求された修正事項
================================
${changesList}
` : ''}

================================
対応が必要
================================
1. 顧客の要求事項を確認します
2. 修正された仕様書を再作成します
3. 再承認を要求いたします

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>仕様書修正依頼</title>
</head>
<body style="font-family: 'Noto Sans JP', sans-serif; line-height: 1.8; color: #333; background-color: #fef2f2; margin: 0; padding: 20px;">
  <div class="email-container" style="max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 15px;">📝</div>
      <h1 style="margin: 0; font-size: 26px; font-weight: bold;">仕様書修正要求</h1>
      <p style="margin-top: 10px; font-size: 14px; opacity: 0.9;">お客様より修正要求が寄せられました</p>
    </div>

    <div class="content" style="padding: 40px 30px;">
      <div class="greeting" style="font-size: 16px; line-height: 2; color: #555; margin-bottom: 30px;">
        管理者の皆様<br><br>
        仕様書に対する修正要求が受け付けられました。
      </div>

      <div class="info-box" style="background: #fef2f2; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #ef4444;">
        <h3 style="margin-top: 0; font-size: 18px; font-weight: bold; color: #dc2626; margin-bottom: 20px;">要求情報</h3>
        <div style="display: flex; margin-bottom: 10px;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">仕様書番号</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.specNumber}</div>
        </div>
        <div style="display: flex; margin-bottom: 10px;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">注文番号</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.orderNumber}</div>
        </div>
        <div style="display: flex; margin-bottom: 10px;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">お客様</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.customerName}</div>
        </div>
        <div style="display: flex;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">要求日時</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.rejectedAt}</div>
        </div>
      </div>

      <div class="reason-box" style="background: #fffbeb; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #b45309; margin-bottom: 15px;">修正理由</h4>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #333;">${sanitizeHtml(data.reason)}</div>
      </div>

      ${data.requestedChanges && data.requestedChanges.length > 0 ? `
      <div class="changes-box" style="background: #eff6ff; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 15px;">要求された修正事項</h4>
        <ul style="margin: 0; padding-left: 20px; color: #333;">
          ${data.requestedChanges.map(change => `<li style="margin-bottom: 8px;">${sanitizeHtml(change)}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <div class="action-box" style="background: #f0f9ff; padding: 25px; margin: 25px 0; border-radius: 8px;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #0369a1; margin-bottom: 20px;">必要な対応</h4>
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #0284c7; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">1</span>
            <div style="color: #333; font-size: 14px;">お客様の要求内容を検討</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #0284c7; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">2</span>
            <div style="color: #333; font-size: 14px;">修正された仕様書を作成</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #0284c7; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">3</span>
            <div style="color: #333; font-size: 14px;">再承認をリクエスト</div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer" style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 10px 0; font-size: 12px; color: #64748b;">
        このメールはシステムにより自動送信されています。<br>
        © ${new Date().getFullYear()} Epackage Lab. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

// =====================================================
// Signature Email Templates
// =====================================================

/**
 * 電子署名リクエストメール（署名依頼）
 */

