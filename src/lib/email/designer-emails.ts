/**
 * Designer Email Notifications
 * 韓国デザイナー向けメール通知
 *
 * Korean designer email notification system for data upload events
 *
 * @module lib/email/designer-emails
 */

import { epackMailer } from './epack-mailer';

// ============================================================
// Type Definitions
// ============================================================

export interface DesignerDataUploadNotificationData {
  to: string;
  orderNumber: string;
  customerName: string;
  fileName: string;
  uploadUrl: string;
  uploadedAt: string;
  productName?: string;
  fileType?: string;
}

// ============================================================
// Korean Email Templates
// ============================================================

/**
 * Send notification to Korean designers when customer uploads data
 *
 * @param data - Notification data including recipient and file details
 * @returns Promise with success status and optional error message
 */
export async function sendDesignerDataUploadNotification(
  data: DesignerDataUploadNotificationData
): Promise<{ success: boolean; error?: string }> {
  const subject = `[EPackage Lab] 데이터 업로드 알림: ${data.orderNumber}`;

  // Korean plain text email
  const plainText = `
${data.customerName} 고객님께서 새로운 데이터를 업로드하셨습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【업로드 정보】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

주문 번호：${data.orderNumber}
고객명：${data.customerName}
${data.productName ? `제품명：${data.productName}` : ''}
파일명：${data.fileName}
${data.fileType ? `파일 타입：${data.fileType}` : ''}
업로드 일시：${data.uploadedAt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

아래 링크에서 업로드된 파일을 확인하실 수 있습니다.

${data.uploadUrl}

파일을 다운로드하여 검토해 주시기 바랍니다.
검토 후 필요한 수정 사항이 있다면 관리자에게 알려주십시오.

본 메일은 시스템에 의해 자동으로 발송되었습니다.
문의사항이 있으시면 support@epackage-lab.com으로 연락해 주십시오.

Copyright © ${new Date().getFullYear()} Epackage Lab. All rights reserved.
`.trim();

  // Korean HTML email
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Dotum', sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .info-box {
      background: white;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 4px 4px 0;
    }
    .info-box h3 {
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: bold;
    }
    .info-row {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: bold;
      width: 120px;
      color: #666;
      flex-shrink: 0;
    }
    .info-value {
      color: #333;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
    }
    .button-container {
      text-align: center;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #666;
      font-size: 12px;
    }
    .alert {
      background: #dbeafe;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>데이터 업로드 알림</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0;"><strong>${data.customerName}</strong> 고객님께서 새로운 데이터를 업로드하셨습니다.</p>

      <div class="info-box">
        <h3>업로드 정보</h3>
        <div class="info-row">
          <span class="info-label">주문 번호</span>
          <span class="info-value">${data.orderNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">고객명</span>
          <span class="info-value">${data.customerName}</span>
        </div>
        ${data.productName ? `
        <div class="info-row">
          <span class="info-label">제품명</span>
          <span class="info-value">${data.productName}</span>
        </div>` : ''}
        <div class="info-row">
          <span class="info-label">파일명</span>
          <span class="info-value">${data.fileName}</span>
        </div>
        ${data.fileType ? `
        <div class="info-row">
          <span class="info-label">파일 타입</span>
          <span class="info-value">${data.fileType}</span>
        </div>` : ''}
        <div class="info-row">
          <span class="info-label">업로드 일시</span>
          <span class="info-value">${data.uploadedAt}</span>
        </div>
      </div>

      <div class="button-container">
        <a href="${data.uploadUrl}" class="button">파일 확인하기</a>
      </div>

      <div class="alert">
        <strong>📌 검토 요청</strong><br>
        파일을 다운로드하여 검토해 주시기 바랍니다.<br>
        검토 후 필요한 수정 사항이 있다면 관리자에게 알려주십시오.
      </div>
    </div>
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Epackage Lab</strong></p>
      <p style="margin: 5px 0;">Email: support@epackage-lab.com</p>
      <p style="margin: 5px 0;">URL: https://epackage-lab.com</p>
      <p style="margin: 15px 0 5px 0;">본 메일은 시스템에 의해 자동으로 발송되었습니다.</p>
      <p style="margin: 5px 0;">Copyright © ${new Date().getFullYear()} Epackage Lab. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const result = await epackMailer.sendCustom(
    data.to,
    subject,
    { html, text: plainText }
  );

  return { success: result.success, error: result.error };
}

// ============================================================
// Batch Notification Function
// ============================================================

/**
 * Send notification to multiple Korean designers
 *
 * @param recipients - Array of email addresses
 * @param data - Notification data (without 'to' field)
 * @returns Promise with array of results for each recipient
 */
export async function sendDesignerDataUploadNotificationBatch(
  recipients: string[],
  data: Omit<DesignerDataUploadNotificationData, 'to'>
): Promise<Array<{ email: string; success: boolean; error?: string }>> {
  const results = await Promise.all(
    recipients.map(async (email) => {
      const result = await sendDesignerDataUploadNotification({
        ...data,
        to: email,
      });
      return {
        email,
        success: result.success,
        error: result.error,
      };
    })
  );

  return results;
}

// ============================================================
// Export All Functions
// ============================================================

export const designerEmails = {
  sendDataUploadNotification: sendDesignerDataUploadNotification,
  sendDataUploadNotificationBatch: sendDesignerDataUploadNotificationBatch,
};
