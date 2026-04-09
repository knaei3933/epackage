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
  specifications?: {
    dimensions?: string;
    bagType?: string;
    material?: string;
    materialDetail?: string;
    weight?: string;
    thickness?: string;
    thicknessDetail?: string;
    printingType?: string;
    colors?: string;
    urgency?: string;
    deliveryLocation?: string;
    postProcessing?: string[];
  };
  // Token-based authentication for designer order access
  // トークンベースのデザイナー注文アクセス用
  accessToken?: string;
  useTokenUrl?: boolean;
  // 本番環境のベースURL（トークンURL生成用）
  // Production base URL (for token URL generation)
  baseUrl?: string;
}

// ============================================================
// Korean Translation Mappings
// ============================================================

const SPEC_TRANSLATIONS = {
  // Bag types
  'stand_up': '스탠드 파우치',
  'flat_pouch': '플랫 파우치',
  'zipper': '지퍼백',

  // Materials
  'pet_al': 'PET/AL (알루미늄 박 라미네이트)',
  'pet': 'PET',
  'ppe': 'PPE',
  'paper': '종이',

  // Material details
  'medium': '표준 타입 (~500g)',
  'light': '경량 (~300g)',
  'heavy': '중량 (~1kg)',

  // Printing types
  'digital': '디지털 인쇄',
  'gravure': '그라비아 인쇄',
  'flexo': '플렉소 인쇄',

  // Colors
  'full_color': '풀 컬러',
  '1': '1색',
  '2': '2색',
  '4': '4색',

  // Urgency
  'standard': '표준',
  'urgent': '긴급',
  'express': '특급',

  // Delivery location
  'domestic': '국내',
  'international': '해외',

  // Post processing options
  'corner-round': '모서리 둥글게',
  'glossy': '광택 처리',
  'matte': '무광 처리',
  'hang-hole-6mm': '걸이 구멍 6mm',
  'hang-hole-4mm': '걸이 구멍 4mm',
  'machi-printing-yes': '마치 인쇄 있음',
  'machi-printing-no': '마치 인쇄 없음',
  'notch-yes': 'V 노치',
  'notch-no': 'V 노치 없음',
  'sealing-width-5mm': '밀봉폭 5mm',
  'sealing-width-8mm': '밀봉폭 8mm',
  'sealing-width-10mm': '밀봉폭 10mm',
  'top-open': '상단 개봉',
  'bottom-open': '하단 개봉',
  'side-open': '측면 개봉',
  'valve-yes': '밸브 있음',
  'valve-no': '밸브 없음',
  'zipper-yes': '지퍼 있음',
  'zipper-no': '지퍼 없음',
};

/**
 * Translate specification value to Korean
 */
function translateSpec(key: string, value: any): string {
  if (typeof value === 'string') {
    return SPEC_TRANSLATIONS[value as keyof typeof SPEC_TRANSLATIONS] || value;
  }
  return value;
}

/**
 * Format specifications for email display
 */
function formatSpecifications(specs?: DesignerDataUploadNotificationData['specifications']): string {
  if (!specs) return '';

  const lines: string[] = [];

  if (specs.dimensions) {
    lines.push(`사이즈：${specs.dimensions}`);
  }
  if (specs.bagType) {
    lines.push(`봉투 타입：${specs.bagType}`);
  }
  if (specs.material) {
    lines.push(`소재：${specs.material}`);
  }
  if (specs.materialDetail) {
    lines.push(`소재 상세：${specs.materialDetail}`);
  }
  if (specs.weight) {
    lines.push(`중량：${specs.weight}`);
  }
  if (specs.thickness) {
    lines.push(`두께：${specs.thickness}`);
  }
  if (specs.thicknessDetail) {
    lines.push(`두께 상세：${specs.thicknessDetail}`);
  }
  if (specs.printingType) {
    lines.push(`인쇄：${specs.printingType}`);
  }
  if (specs.colors) {
    lines.push(`색수：${specs.colors}`);
  }
  if (specs.urgency) {
    lines.push(`납기：${specs.urgency}`);
  }
  if (specs.deliveryLocation) {
    lines.push(`배송처：${specs.deliveryLocation}`);
  }
  if (specs.postProcessing && specs.postProcessing.length > 0) {
    lines.push(`후가공：${specs.postProcessing.join(', ')}`);
  }

  return lines.join('\n');
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

  // Generate token-based URL if useTokenUrl is true
  // useTokenUrl이 true인 경우 토큰 기반 URL을 생성
  let uploadUrl = data.uploadUrl;
  if (data.useTokenUrl && data.accessToken) {
    // Use provided baseUrl first, otherwise extract from uploadUrl, otherwise use default
    // 제공된 baseUrl을 먼저 사용하고, 없으면 uploadUrl에서 추출하며, 그래도 없으면 기본값 사용
    let baseUrl = data.baseUrl;
    if (!baseUrl) {
      try {
        const url = new URL(data.uploadUrl);
        baseUrl = `${url.protocol}//${url.host}`;
      } catch {
        // If uploadUrl is invalid, use environment variable or default
        // uploadUrl이 유효하지 않은 경우 환경 변수 또는 기본값 사용
        baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://package-lab.com';
      }
    }
    // Use token-based designer order URL
    // 토큰 기반 디자이너 주문 URL 사용
    uploadUrl = `${baseUrl}/designer-order/${data.accessToken}`;
  }

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
${data.specifications ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【디자인 스펙】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${formatSpecifications(data.specifications)}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

아래 링크에서 업로드된 파일을 확인하실 수 있습니다.

${uploadUrl}

파일을 다운로드하여 검토해 주시기 바랍니다.
검토 후 필요한 수정 사항이 있다면 관리자에게 알려주십시오.

본 메일은 시스템에 의해 자동으로 발송되었습니다.
문의사항이 있으시면 design@package-lab.com으로 연락해 주십시오.

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

      ${data.specifications && Object.keys(data.specifications).length > 0 ? `
      <div class="info-box">
        <h3>디자인 스펙</h3>
        ${Object.entries({
          '사이즈': data.specifications.dimensions,
          '봉투 타입': data.specifications.bagType,
          '소재': data.specifications.material,
          '소재 상세': data.specifications.materialDetail,
          '중량': data.specifications.weight,
          '두께': data.specifications.thickness,
          '두께 상세': data.specifications.thicknessDetail,
          '인쇄': data.specifications.printingType,
          '색수': data.specifications.colors,
          '납기': data.specifications.urgency,
          '배송처': data.specifications.deliveryLocation,
          '후가공': data.specifications.postProcessing?.join(', '),
        }).filter(([_, value]) => value !== undefined && value !== '').map(([label, value]) => `
        <div class="info-row">
          <span class="info-label">${label}</span>
          <span class="info-value">${value}</span>
        </div>`).join('')}
      </div>` : ''}

      <div class="button-container">
        <a href="${uploadUrl}" class="button">파일 확인하기</a>
      </div>

      <div class="alert">
        <strong>📌 검토 요청</strong><br>
        파일을 다운로드하여 검토해 주시기 바랍니다.<br>
        검토 후 필요한 수정 사항이 있다면 관리자에게 알려주십시오.
      </div>
    </div>
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Epackage Lab</strong></p>
      <p style="margin: 5px 0;">Email: design@package-lab.com</p>
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
