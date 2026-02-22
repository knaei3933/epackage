/**
 * Designer Revision Rejected Email Template
 *
 * 校正データ反arry通知メールテンプレート（韓国人デザイナー向け）
 * Korean email template for designer when revision is rejected
 *
 * @module lib/email/templates/designer-revision-rejected
 */

import type { DesignerRevisionRejectedEmailData } from '@/types/email'

// ============================================================
// Korean Email Templates (Primary)
// ============================================================

/**
 * Email subject in Korean
 */
export const subject = (data: { order_number: string }): string => {
  return `[Epackage Lab] 교정 데이터가 반려되었습니다 - ${data.order_number}`
}

/**
 * Plain text email in Korean
 */
export const plainText = (data: DesignerRevisionRejectedEmailData): string => {
  return `
${data.designer_name} 님께,

교정하신 데이터가 검토 후 반려되었습니다.

====================
반려 정보
====================

주문 번호: ${data.order_number}
반려 사유: ${data.rejection_reason}

--------------------
반려 사유를 확인하시고 수정하여 다시 업로드해 주세요.

다시 업로드하기:
${data.upload_url}

--------------------
Epackage Lab B2B 시스템
본 메일은 시스템에 의해 자동 발송됩니다.
문의: support@epackage-lab.com
--------------------
`.trim()
}

/**
 * HTML email in Korean
 */
export const html = (data: DesignerRevisionRejectedEmailData): string => {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: bold; width: 140px; color: #666; }
    .info-value { flex: 1; }
    .reason-box { background: #fef2f2; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ef4444; }
    .button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>교정 데이터 반려 알림</h1>
    </div>
    <div class="content">
      <p>${data.designer_name} 님께,</p>
      <p>교정하신 데이터가 검토 후 반려되었습니다.</p>

      <div class="info-box">
        <h3 style="margin-top: 0;">반려 정보</h3>
        <div class="info-row">
          <span class="info-label">주문 번호</span>
          <span class="info-value">${data.order_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">반려 사유</span>
          <span class="info-value"></span>
        </div>
      </div>

      <div class="reason-box">
        <strong>반려 사유:</strong><br>
        ${data.rejection_reason}
      </div>

      <p style="text-align: center; margin-top: 30px;">반려 사유를 확인하시고 수정하여 다시 업로드해 주세요.</p>

      <div style="text-align: center;">
        <a href="${data.upload_url}" class="button">다시 업로드하기</a>
      </div>
    </div>
    <div class="footer">
      <p>본 메일은 시스템에 의해 자동 발송됩니다.</p>
      <p>문의: support@epackage-lab.com</p>
      <p>© ${new Date().getFullYear()} Epackage Lab. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// ============================================================
// Japanese Email Templates (For Admin Reference)
// ============================================================

/**
 * Japanese email subject (for admin reference)
 */
export const subjectJa = (data: { order_number: string }): string => {
  return `[Epackage Lab] 校正データが拒否されました - ${data.order_number}`
}

/**
 * Japanese plain text email (for admin reference)
 */
export const plainTextJa = (data: DesignerRevisionRejectedEmailData): string => {
  return `
${data.designer_name} 様

校正データが審査後、拒否されました。

====================
拒否情報
====================

注文番号: ${data.order_number}
拒否理由: ${data.rejection_reason}

--------------------
拒否理由を確認の上、修正して再度アップロードしてください。

再アップロード:
${data.upload_url}

--------------------
EPackage Lab B2Bシステム
このメールはシステムにより自動送信されています。
お問い合わせ: support@epackage-lab.com
--------------------
`.trim()
}

/**
 * Japanese HTML email (for admin reference)
 */
export const htmlJa = (data: DesignerRevisionRejectedEmailData): string => {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: bold; width: 140px; color: #666; }
    .info-value { flex: 1; }
    .reason-box { background: #fef2f2; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ef4444; }
    .button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>校正データ拒否通知</h1>
    </div>
    <div class="content">
      <p>${data.designer_name} 様</p>
      <p>校正データが審査後、拒否されました。</p>

      <div class="info-box">
        <h3 style="margin-top: 0;">拒否情報</h3>
        <div class="info-row">
          <span class="info-label">注文番号</span>
          <span class="info-value">${data.order_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">拒否理由</span>
          <span class="info-value"></span>
        </div>
      </div>

      <div class="reason-box">
        <strong>拒否理由:</strong><br>
        ${data.rejection_reason}
      </div>

      <p style="text-align: center; margin-top: 30px;">拒否理由を確認の上、修正して再度アップロードしてください。</p>

      <div style="text-align: center;">
        <a href="${data.upload_url}" class="button">再アップロード</a>
      </div>
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
