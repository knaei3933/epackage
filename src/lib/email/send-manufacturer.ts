/**
 * Manufacturer Order Email Send Function
 *
 * 한국 제조사 발주 메일 발송
 */

import { sendEmail } from './transport';
import type { ManufacturerOrderEmailData } from './types';

function buildManufacturerOrderHTML(data: ManufacturerOrderEmailData): string {
  const fmtKRW = (n: number) => `₩${Math.round(n).toLocaleString()}`;

  const itemRows = data.items.map((item, idx) => {
    const specParts: string[] = [];
    if (item.specifications?.size) specParts.push(`사이즈: ${item.specifications.size}`);
    if (item.specifications?.material) specParts.push(`소재: ${item.specifications.material}`);
    if (item.specifications?.printing) specParts.push(`인쇄: ${item.specifications.printing}`);
    if (item.specifications?.spoutSize) specParts.push(`스파웃: ${item.specifications.spoutSize}파이`);
    const specText = specParts.length > 0 ? specParts.join(' / ') : '-';

    const marginRateText = item.manufacturerMarginRate != null
      ? `${(item.manufacturerMarginRate * 100).toFixed(0)}%`
      : '30%';

    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px;">
          <strong>${item.productName}</strong><br/>
          <span style="font-size: 12px; color: #6b7280;">${item.bagType}</span><br/>
          <span style="font-size: 12px; color: #6b7280;">${specText}</span>
        </td>
        <td style="padding: 8px; text-align: right;">${item.quantity.toLocaleString()}</td>
        <td style="padding: 8px; text-align: right;">${fmtKRW(item.materialCostKRW)}</td>
        <td style="padding: 8px; text-align: right;">${fmtKRW(item.printingCostKRW)}</td>
        <td style="padding: 8px; text-align: right;">${fmtKRW(item.postProcessingTotalKRW)}</td>
        <td style="padding: 8px; text-align: right;">${fmtKRW(item.baseCostKRW)}</td>
        <td style="padding: 8px; text-align: right;">${fmtKRW(item.manufacturerMarginKRW)}<br/><span style="font-size:11px;color:#6b7280;">(${marginRateText})</span></td>
        <td style="padding: 8px; text-align: right;"><strong>${fmtKRW(item.manufacturingCostKRW)}</strong></td>
      </tr>
    `;
  }).join('');

  const detailRows = data.items.map((item, idx) => {
    const details: string[] = [];
    if (item.materialMarkupRate != null) {
      details.push(`원단 인상률: ${(item.materialMarkupRate * 100).toFixed(0)}%`);
    }
    if (item.laminationUnitPriceKRW != null && item.laminationCycles != null) {
      details.push(`라미 단가: ₩${item.laminationUnitPriceKRW}/m × ${item.laminationCycles}회${item.hasALMaterial ? ' (AL포함)' : ''}`);
    }
    if (item.slitterUnitPriceKRW != null) {
      const minText = item.slitterMinCostKRW != null ? ` (최소 ₩${item.slitterMinCostKRW.toLocaleString()})` : '';
      details.push(`슬리터 단가: ₩${item.slitterUnitPriceKRW}/m${minText}`);
    }
    if (item.spoutPriceKRW != null && item.spoutQuantity != null) {
      details.push(`스파웃: ₩${item.spoutPriceKRW}/개 × ${item.spoutQuantity.toLocaleString()}개 = ₩${(item.spoutCostKRW ?? 0).toLocaleString()}`);
      if (item.spoutRoundTripShippingKRW != null) {
        details.push(`스파웃 왕복배송: ₩${item.spoutRoundTripShippingKRW.toLocaleString()}`);
      }
    }
    if (item.outsourcingShippingKRW != null) {
      details.push(`외주가공 배송료: ₩${item.outsourcingShippingKRW.toLocaleString()}`);
    }
    if (details.length === 0) return '';
    return `
      <tr style="border-bottom: 1px solid #f3f4f6; background-color: #f9fafb;">
        <td style="padding: 6px 8px;" colspan="9">
          <span style="font-size: 12px; color: #4b5563;"><strong>품목 ${idx + 1} 상세:</strong> ${details.join(' | ')}</span>
        </td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>발주서 ${data.quoteNumber}</title>
</head>
<body style="font-family: 'Malgun Gothic', '맑은 고딕', AppleGothic, sans-serif; margin: 0; padding: 20px; background-color: #f3f4f6;">
  <div style="max-width: 900px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="background: #1e40af; color: white; padding: 24px;">
      <h1 style="margin: 0; font-size: 24px;">[발주서] 견적번호 ${data.quoteNumber}</h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">제조 의뢰 — ${data.customerName}</p>
    </div>

    <div style="padding: 24px;">
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #374151;">
        안녕하십니까,<br/>
        아래 내역과 같이 제조 발주를 의뢰드립니다.
      </p>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
        <thead>
          <tr style="background: #e5e7eb; text-align: center;">
            <th style="padding: 8px; width: 30px;">No</th>
            <th style="padding: 8px; text-align: left;">품목명 / 규격</th>
            <th style="padding: 8px; text-align: right;">수량</th>
            <th style="padding: 8px; text-align: right;">원재료비</th>
            <th style="padding: 8px; text-align: right;">인쇄비</th>
            <th style="padding: 8px; text-align: right;">후가공비</th>
            <th style="padding: 8px; text-align: right;">기초원가</th>
            <th style="padding: 8px; text-align: right;">제조마진</th>
            <th style="padding: 8px; text-align: right;">제조원가</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
          ${detailRows}
        </tbody>
        <tfoot>
          <tr style="background: #dbeafe; font-weight: bold;">
            <td style="padding: 10px 8px;" colspan="8">제조원가 합계 (KRW)</td>
            <td style="padding: 10px 8px; text-align: right; font-size: 15px;">${fmtKRW(data.totalManufacturingCostKRW)}</td>
          </tr>
        </tfoot>
      </table>

      ${data.notes ? `<div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; padding: 12px; margin-bottom: 16px;"><strong>비고:</strong><br/>${data.notes}</div>` : ''}

      <div style="font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 12px;">
        <p>※ 본 메일은 자동 발송된 발주서입니다. 문의사항이 있으시면 회신 부탁드립니다.</p>
        <p>※ 모든 금액은 한국 원화(KRW) 기준입니다.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 한국 제조사 발주 메일 발송
 * - 수신자: system_settings.production.manufacturer_order_email
 * - 본문: KRW 비용표만 (판매마진·관세·박스수·판매가격 제외)
 */
export async function sendManufacturerOrderEmail(data: ManufacturerOrderEmailData): Promise<{
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}> {
  if (!data.recipientEmail) {
    return { success: false, error: '제조사 발주 메일 주소가 설정되지 않았습니다. 관리자 설정에서 production.manufacturer_order_email을 입력하세요.' };
  }

  const subject = `[발주서] 견적번호 ${data.quoteNumber} - 제조 의뢰`;
  const text = `[발주서] 견적번호 ${data.quoteNumber}\n제조 의뢰 — ${data.customerName}\n제조원가 합계: ₩${Math.round(data.totalManufacturingCostKRW).toLocaleString()}\n\n상세 내역은 HTML 본문을 확인해 주세요.`;
  const html = buildManufacturerOrderHTML(data);

  const result = await sendEmail(data.recipientEmail, subject, text, html);
  return {
    success: result.success,
    messageId: result.messageId,
    previewUrl: result.previewUrl,
    error: result.error,
  };
}
