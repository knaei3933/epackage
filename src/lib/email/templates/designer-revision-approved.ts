/**
 * Designer Revision Approved Email Template
 *
 * 교정 데이터 승인 통지 이메일 템플릿（한국인 디자이너용）
 * Korean email template for designer when revision is approved
 *
 * @module lib/email/templates/designer-revision-approved
 */

import type { DesignerRevisionApprovedEmailData } from '@/types/email'

// ============================================================
// Korean Email Templates (Primary)
// ============================================================

/**
 * Email subject in Korean
 */
export const subject = (data: { order_number: string }): string => {
  return `[Epackage Lab] 교정 데이터가 승인되었습니다 - ${data.order_number}`
}

/**
 * Plain text email in Korean
 */
export const plainText = (data: DesignerRevisionApprovedEmailData): string => {
  return `
${data.designer_name} 님께,

교정하신 데이터가 승인되었습니다.

====================
승인 정보
====================

주문 번호: ${data.order_number}
수정 횟수: ${data.revision_number}회차
승인 일시: ${data.approved_at}

--------------------
고객 승인 대기 중입니다.
고객이 최종 승인 후 생산이 진행됩니다.

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
export const html = (data: DesignerRevisionApprovedEmailData): string => {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: bold; width: 140px; color: #666; }
    .info-value { flex: 1; }
    .success-icon { text-align: center; font-size: 48px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>교정 데이터 승인 완료</h1>
    </div>
    <div class="content">
      <div class="success-icon">✅</div>
      <p style="text-align: center; font-size: 18px; color: #10b981; font-weight: bold; margin: 20px 0;">
        ${data.designer_name} 님, 교정 데이터가 승인되었습니다!
      </p>

      <div class="info-box">
        <h3 style="margin-top: 0;">승인 정보</h3>
        <div class="info-row">
          <span class="info-label">주문 번호</span>
          <span class="info-value">${data.order_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">수정 횟수</span>
          <span class="info-value">${data.revision_number}회차</span>
        </div>
        <div class="info-row">
          <span class="info-label">승인 일시</span>
          <span class="info-value">${data.approved_at}</span>
        </div>
      </div>

      <div style="background: #ecfdf5; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; font-weight: bold; color: #059669;">
          🎉 고객 승인 대기 중입니다
        </p>
        <p style="margin: 10px 0 0 0; color: #666;">
          고객이 최종 승인 후 생산이 진행됩니다.
        </p>
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
  return `[Epackage Lab] 校正データが承認されました - ${data.order_number}`
}

/**
 * Japanese plain text email (for admin reference)
 */
export const plainTextJa = (data: DesignerRevisionApprovedEmailData): string => {
  return `
${data.designer_name} 様

校正データが承認されました。

====================
承認情報
====================

注文番号: ${data.order_number}
修正回数: ${data.revision_number}回目
承認日時: ${data.approved_at}

--------------------
顧客承認待ちです。
顧客の最終承認後、製造が進行します。

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
export const htmlJa = (data: DesignerRevisionApprovedEmailData): string => {
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
    .info-box { background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-weight: bold; width: 140px; color: #666; }
    .info-value { flex: 1; }
    .success-icon { text-align: center; font-size: 48px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>校正データ承認完了</h1>
    </div>
    <div class="content">
      <div class="success-icon">✅</div>
      <p style="text-align: center; font-size: 18px; color: #10b981; font-weight: bold; margin: 20px 0;">
        ${data.designer_name} 様、校正データが承認されました！
      </p>

      <div class="info-box">
        <h3 style="margin-top: 0;">承認情報</h3>
        <div class="info-row">
          <span class="info-label">注文番号</span>
          <span class="info-value">${data.order_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">修正回数</span>
          <span class="info-value">${data.revision_number}回目</span>
        </div>
        <div class="info-row">
          <span class="info-label">承認日時</span>
          <span class="info-value">${data.approved_at}</span>
        </div>
      </div>

      <div style="background: #ecfdf5; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; font-weight: bold; color: #059669;">
          🎉 顧客承認待ちです
        </p>
        <p style="margin: 10px 0 0 0; color: #666;">
          顧客の最終承認後、製造が進行します。
        </p>
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
