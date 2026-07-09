/**
 * Korea Email Templates
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
import sanitizeHtml from 'sanitize-html';
import type { EmailTemplate } from './types';
import type {
  KoreaCorrectionNotificationEmailData,
  KoreaDataTransferEmailData,
} from './types';

export function getKoreaDataTransferEmail(data: KoreaDataTransferEmailData): EmailTemplate {
  const itemsList = data.items.map((item, index) => {
    return `${index + 1}. ${item.productName} x ${item.quantity}点`;
  }).join('\n');

  const filesList = data.files.map((file, index) => {
    const sizeMB = (file.fileSize / (1024 * 1024)).toFixed(2);
    return `${index + 1}. ${file.fileName} (${file.fileType}, ${sizeMB}MB)`;
  }).join('\n');

  const aiDataJson = JSON.stringify(data.aiExtractedData, null, 2);

  return {
    subject: `[Epackage Japan] データ転送依頼 - ${data.quotationNumber}`,
    text: `
한국 파트너팀 귀하,

일본 Epackage Lab에서 새로운 주문 데이터를 전송합니다.

================================
주문 정보
================================
【주문번호】${data.orderId}
【견적번호】${data.quotationNumber}
【고객명】${data.customerName}${data.customerCompany ? ` (${data.customerCompany})` : ''}
【긴급도】${data.urgency === 'urgent' ? '긴급' : data.urgency === 'expedited' ? '우선' : '일반'}

================================
제품 목록
================================
${itemsList}

================================
AI 추출 데이터
================================
${aiDataJson}

================================
첨부 파일
================================
${filesList}

${data.notes ? `
================================
비고
================================
${sanitizeContent(data.notes)}
` : ''}

================================
다음 단계
================================
1. 첨부된 AI 파일과 참조 이미지를 검토합니다
2. AI 추출 데이터를 확인합니다
3. 생산 가능 여부와 일정을 회신합니다
4. 필요한 경우 추가 정보를 요청합니다

문의사항이 있으시면 언제든 연락주십시오.

Epackage Lab Japan
Email: ${process.env.ADMIN_EMAIL || 'admin@epackage-lab.com'}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>データ転送依頼</title>
  <style>
    body {
      font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;
      line-height: 1.8;
      color: #333;
      background-color: #f0f9ff;
      margin: 0;
      padding: 20px;
    }
    .email-container {
      max-width: 700px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
    .info-box {
      background: #f8fafc;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    .info-box-title {
      font-size: 18px;
      font-weight: bold;
      color: #2563eb;
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
      min-width: 100px;
      margin-right: 15px;
      font-weight: bold;
    }
    .info-value {
      color: #333;
      font-size: 15px;
      font-weight: 500;
    }
    .items-list {
      background: #fffbeb;
      padding: 20px;
      margin: 20px 0;
      border-radius: 6px;
    }
    .item-row {
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .item-row:last-child {
      border-bottom: none;
    }
    .ai-data-box {
      background: #f0fdf4;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }
    .ai-data-title {
      font-size: 16px;
      font-weight: bold;
      color: #059669;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .ai-data-content {
      background: white;
      padding: 15px;
      border-radius: 6px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
      line-height: 1.6;
      color: #374151;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .files-list {
      background: #fef3c7;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .files-title {
      font-size: 16px;
      font-weight: bold;
      color: #d97706;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .file-item {
      padding: 10px;
      background: white;
      margin: 8px 0;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .file-name {
      font-weight: bold;
      color: #374151;
    }
    .file-meta {
      font-size: 13px;
      color: #6b7280;
    }
    .steps-box {
      background: #eff6ff;
      padding: 25px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .steps-title {
      font-size: 16px;
      font-weight: bold;
      color: #1d4ed8;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .step-item {
      display: flex;
      margin: 12px 0;
    }
    .step-number {
      background: #3b82f6;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      flex-shrink: 0;
      margin-right: 12px;
    }
    .urgency-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      margin-left: 10px;
    }
    .urgency-urgent {
      background: #fee2e2;
      color: #dc2626;
    }
    .urgency-expedited {
      background: #fef3c7;
      color: #d97706;
    }
    .urgency-normal {
      background: #dbeafe;
      color: #2563eb;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #666;
    }
    .contact-link {
      color: #3b82f6;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="header-icon">📤</div>
      <h1>データ転送依頼</h1>
      <div class="header-subtitle">New Design Data from Japan Epackage Lab</div>
    </div>

    <div class="content">
      <div class="greeting">
        韓国パートナーチーム 御中,<br><br>
        日本Epackage Labより新しい注文データを送信いたします。
      </div>

      <div class="info-box">
        <h3 class="info-box-title">注文情報</h3>
        <div class="info-item">
          <div class="info-label">注文番号</div>
          <div class="info-value"><code>${sanitizeContent(data.orderId)}</code></div>
        </div>
        <div class="info-item">
          <div class="info-label">見積番号</div>
          <div class="info-value"><code>${sanitizeContent(data.quotationNumber)}</code></div>
        </div>
        <div class="info-item">
          <div class="info-label">顧客名</div>
          <div class="info-value">
            ${sanitizeContent(data.customerName)}
            ${data.customerCompany ? `(${sanitizeContent(data.customerCompany)})` : ''}
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">緊急度</div>
          <div class="info-value">
            ${data.urgency === 'urgent' ? '<span class="urgency-badge urgency-urgent">緊急</span>' :
              data.urgency === 'expedited' ? '<span class="urgency-badge urgency-expedited">優先</span>' :
              '<span class="urgency-badge urgency-normal">通常</span>'}
          </div>
        </div>
      </div>

      <div class="items-list">
        <h4 style="margin-top: 0; color: #78350f; font-size: 16px;">📦 製品リスト</h4>
        ${data.items.map((item, index) => `
        <div class="item-row">
          <strong>${index + 1}. ${sanitizeContent(item.productName)}</strong> × ${item.quantity}点
        </div>
        `).join('')}
      </div>

      <div class="ai-data-box">
        <h4 class="ai-data-title">🤖 AI抽出データ</h4>
        <div class="ai-data-content">${sanitizeContent(aiDataJson)}</div>
      </div>

      <div class="files-list">
        <h4 class="files-title">📎 添付ファイル</h4>
        ${data.files.map((file) => {
          const sizeMB = (file.fileSize / (1024 * 1024)).toFixed(2);
          return `
        <div class="file-item">
          <div class="file-name">📄 ${sanitizeContent(file.fileName)}</div>
          <div class="file-meta">${file.fileType} · ${sizeMB}MB</div>
        </div>
          `;
        }).join('')}
      </div>

      ${data.notes ? `
      <div class="info-box">
        <h3 class="info-box-title">備考</h3>
        <div style="white-space: pre-wrap; line-height: 1.8;">${sanitizeContent(data.notes)}</div>
      </div>
      ` : ''}

      <div class="steps-box">
        <h4 class="steps-title">次のステップ</h4>
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-content">添付されたAIファイルと参照画像を確認します</div>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-content">AI抽出データを確認します</div>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-content">生産可能かどうかとスケジュールをご返信いたします</div>
        </div>
        <div class="step-item">
          <div class="step-number">4</div>
          <div class="step-content">必要に応じて追加情報を要求いたします</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 10px 0;">
        ご不明な点がございましたら、いつでもご連絡ください。<br>
        <a href="mailto:${process.env.ADMIN_EMAIL || 'admin@epackage-lab.com'}" class="contact-link">
          ${process.env.ADMIN_EMAIL || 'admin@epackage-lab.com'}
        </a>
      </p>
      <p style="margin: 20px 0 0 0; font-size: 12px; color: #999;">
        ※このメールはシステムにより自動送信されました。
      </p>
    </div>
  </div>
</body>
</html>
    `.trim()
  };
}

// =====================================================
// Korea Correction Notification Email Template (Customer)
// =====================================================

/**
 * 韓国パートナー修正事項完了通知メール（顧客向け）
 * Korean partner correction completed notification
 */

export function getKoreaCorrectionNotificationEmail(data: KoreaCorrectionNotificationEmailData): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  const filesList = data.correctedFiles.map((file, index) =>
    `${index + 1}. ${file.fileName}\n   ${file.fileUrl}`
  ).join('\n');

  return {
    subject: `【Epackage Lab】韓国パートナーによる修正データが完成いたしました`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

この度、韓国パートナーにて修正作業が完了いたしましたので、ご通知申し上げます。

================================
修正内容
================================
${data.correctionDescription}

================================
注文番号
================================
${data.orderNumber}

================================
修正完了日
================================
${data.correctionDate}

${data.correctedFiles.length > 0 ? `
================================
修正ファイル
================================
${filesList}
` : ''}

${data.notes ? `
================================
備考
================================
${data.notes}
` : ''}

================================
次のステップ
================================
1. 修正されたファイルをご確認ください
2. 内容に問題がなければ、生産に進みます
3. ご不明な点がございましたら、お気軽にお問い合わせください

${footer}
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>韓国パートナーによる修正データが完成いたしました</title>
</head>
<body style="font-family: 'Noto Sans JP', sans-serif; line-height: 1.8; color: #333; background-color: #f8fafc; margin: 0; padding: 20px;">
  <div class="email-container" style="max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div class="header" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 40px 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
      <h1 style="margin: 0; font-size: 26px; font-weight: bold;">修正データ完成のお知らせ</h1>
      <p style="margin-top: 10px; font-size: 14px; opacity: 0.9;">韓国パートナーによる修正作業が完了いたしました</p>
    </div>

    <div class="content" style="padding: 40px 30px;">
      <div class="greeting" style="font-size: 16px; line-height: 2; color: #555; margin-bottom: 30px;">
        ${data.recipient.company ? `${sanitizeContent(data.recipient.company)}<br>` : ''}${sanitizeContent(data.recipient.name)} 様<br><br>
        平素より格別のご高配を賜り、厚く御礼申し上げます。<br><br>
        この度、韓国パートナーにて修正作業が完了いたしましたので、ご通知申し上げます。
      </div>

      <div class="success-box" style="background: #f0fdf4; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #10b981;">
        <h3 style="margin-top: 0; font-size: 18px; font-weight: bold; color: #059669; margin-bottom: 20px;">修正内容</h3>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #333;">${sanitizeHtml(data.correctionDescription)}</div>
      </div>

      <div class="info-box" style="background: #f8fafc; padding: 25px; margin: 25px 0; border-radius: 8px;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 15px;">注文情報</h4>
        <div style="display: flex; margin-bottom: 10px;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">注文番号</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.orderNumber}</div>
        </div>
        <div style="display: flex;">
          <div style="color: #666; font-size: 13px; min-width: 120px; font-weight: bold;">修正完了日</div>
          <div style="color: #333; font-size: 15px; font-weight: 500;">${data.correctionDate}</div>
        </div>
      </div>

      ${data.correctedFiles.length > 0 ? `
      <div class="files-box" style="background: #eff6ff; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 15px;">修正ファイル</h4>
        ${data.correctedFiles.map((file) => `
        <div style="background: white; padding: 15px; margin-bottom: 10px; border-radius: 6px; border: 1px solid #dbeafe;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">📄</span>
            <a href="${file.fileUrl}" style="color: #2563eb; text-decoration: none; font-weight: 500; flex: 1;">${sanitizeHtml(file.fileName)}</a>
            <span style="color: #64748b; font-size: 12px;">ダウンロード</span>
          </div>
        </div>
        `).join('')}
      </div>
      ` : ''}

      ${data.notes ? `
      <div class="notes-box" style="background: #fffbeb; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #b45309; margin-bottom: 15px;">備考</h4>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #333;">${sanitizeHtml(data.notes)}</div>
      </div>
      ` : ''}

      <div class="steps-box" style="background: #fef3c7; padding: 25px; margin: 25px 0; border-radius: 8px;">
        <h4 style="margin-top: 0; font-size: 16px; font-weight: bold; color: #b45309; margin-bottom: 20px;">次のステップ</h4>
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">1</span>
            <div style="color: #333; font-size: 14px;">修正されたファイルをご確認ください</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">2</span>
            <div style="color: #333; font-size: 14px;">内容に問題がなければ、生産に進みます</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 200px; flex: 1;">
            <span style="background: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">3</span>
            <div style="color: #333; font-size: 14px;">ご不明な点がございましたら、お気軽にお問い合わせください</div>
          </div>
        </div>
      </div>

      <div class="contact-box" style="background: #f0f9ff; padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #64748b;">
          ご不明な点がございましたら、以下までお問い合わせください<br>
          <a href="mailto:${process.env.ADMIN_EMAIL || 'admin@epackage-lab.com'}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${process.env.ADMIN_EMAIL || 'admin@epackage-lab.com'}</a>
        </p>
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
// Spec Sheet Approval Email Template
// =====================================================

/**
 * 仕様書承認通知メール（顧客/管理者用）
 * Spec sheet approval notification
 */

