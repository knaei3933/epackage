/**
 * 発注メール（製造社用）
 *
 * 注文変換時に製造社へ送信される発注メールテンプレート。
 * 製造社工価（原価×1.4 + 国際配送費）のみを記載し、販売価格は一切含めない。
 * 製品の全仕様と計算式を明示する。
 */

export interface PurchaseOrderItemData {
  product_name: string;
  quantity: number;
  // 製品仕様
  bagTypeId?: string;
  materialId?: string;
  width?: number;
  height?: number;
  depth?: number;
  sideWidth?: number;
  thicknessSelection?: string;
  printingType?: string;
  printingColors?: number;
  postProcessingOptions?: string[];
  zipper?: boolean;
  hasZipper?: boolean;
  sku_quantities?: number[];
  // 計算詳細（製造社向け）
  cost_breakdown?: {
    materialCost?: number;
    printingCost?: number;
    laminationCost?: number;
    slitterCost?: number;
    surfaceTreatmentCost?: number;
    pouchProcessingCost?: number;
    manufacturingMargin?: number;
    duty?: number;
    delivery?: number;
    salesMargin?: number;
    totalCost?: number;
    intlShippingJPY?: number;
    domesticShippingJPY?: number;
    deliveryBoxes?: number;
  };
  film_cost_details?: {
    materialLayerDetails?: Array<{
      materialId?: string;
      nameJa?: string;
      thicknessMicron?: number;
      density?: number;
      unitPriceKRW?: number;
      areaM2?: number;
      meters?: number;
      widthM?: number;
      weightKg?: number;
      costKRW?: number;
      costJPY?: number;
    }>;
    totalCostKRW?: number;
    costJPY?: number;
    totalWeight?: number;
    totalMeters?: number;
    materialWidthMM?: number;
    areaM2?: number;
  };
  // 製造社向け計算結果
  baseCostJPY?: number;
  manufacturingMarginJPY?: number;
  manufacturerPriceJPY?: number;
  intlShippingJPY?: number;
  domesticShippingJPY?: number;
  deliveryBoxes?: number;
}

export interface PurchaseOrderData {
  quotation_number: string;
  order_number: string;
  customer_name: string;
  company_name?: string;
  // 製造社向け合計（原価×1.4 + 国際配送費、国内1600円は除外）
  manufacturer_amount_jpy: number;
  base_cost_jpy: number;
  manufacturing_margin_jpy: number;
  intl_shipping_jpy: number;
  domestic_shipping_jpy?: number;
  // 為替レート参考
  exchange_rate_note?: string;
  items: PurchaseOrderItemData[];
  submitted_at: string;
  order_url?: string;
}

const fmt = (n: number | undefined): string =>
  (n ?? 0).toLocaleString('ja-JP');

export const subject = (data: PurchaseOrderData): string => {
  return `[発注] 製造依頼: ${data.order_number} (${data.quotation_number})`;
}

export const plainText = (data: PurchaseOrderData): string => {
  const itemLines = data.items.map((item, idx) => {
    const cb = item.cost_breakdown || {};
    const fcd = item.film_cost_details || {};
    const layers = (fcd.materialLayerDetails || []).map(l =>
      `    - ${l.nameJa || l.materialId || '?'} ${l.thicknessMicron || 0}μm / 密度${l.density || 0} / 単価${fmt(l.unitPriceKRW)}KRW/kg / 面積${(l.areaM2 ?? 0).toFixed(2)}m² / 長さ${fmt(l.meters)}m / 巾${(l.widthM ?? 0).toFixed(3)}m / 重量${(l.weightKg ?? 0).toFixed(3)}kg / ${fmt(l.costKRW)}KRW = ${fmt(l.costJPY)}JPY`
    ).join('\n');

    const skuLine = (item.sku_quantities && item.sku_quantities.length > 1)
      ? `  SKU分割: ${item.sku_quantities.length}種 (${item.sku_quantities.map(q => fmt(q)).join(' / ')} 枚)\n`
      : '';

    return `
----- 項目 ${idx + 1} -----
製品名: ${item.product_name}
数量: ${fmt(item.quantity)} 枚
${skuLine}【製品仕様】
  製品タイプ: ${item.bagTypeId || '-'}
  材質ID: ${item.materialId || '-'}
  サイズ: ${item.width ?? '?'} × ${item.height ?? '?'}${item.depth ? ` × ${item.depth}` : ''}${item.sideWidth ? ` (側面${item.sideWidth})` : ''} mm
  厚さ選択: ${item.thicknessSelection || '-'}
  印刷方式: ${item.printingType || '-'} / 印刷色数: ${item.printingColors ?? '-'}
  後加工: ${(item.postProcessingOptions || []).join(', ') || 'なし'}
  ジッパー: ${item.zipper || item.hasZipper ? 'あり' : 'なし'}

【原価内訳（JPY）】
  原材料費: ${fmt(cb.materialCost)}
  印刷費: ${fmt(cb.printingCost)}
  合着費: ${fmt(cb.laminationCost)}
  スリッター費: ${fmt(cb.slitterCost)}
  表面処理費: ${fmt(cb.surfaceTreatmentCost)}
  製袋加工費: ${fmt(cb.pouchProcessingCost)}
  ---- 原価合計: ${fmt(cb.totalCost)} JPY
  製造者マージン(×0.4): ${fmt(item.manufacturingMarginJPY ?? cb.manufacturingMargin)}
  → 製造者価格: ${fmt(item.manufacturerPriceJPY)} JPY

【フィルム原価詳細】
  原巾: ${fcd.materialWidthMM ?? '?'} mm
  総長さ: ${fmt(fcd.totalMeters)} m
  総面積: ${(fcd.areaM2 ?? 0).toFixed(2)} m²
  総重量: ${(fcd.totalWeight ?? 0).toFixed(3)} kg
  原価合計: ${fmt(fcd.totalCostKRW)} KRW = ${fmt(fcd.costJPY)} JPY
  レイヤー別:
${layers || '  (なし)'}

【製造社請求額】
  原価: ${fmt(item.baseCostJPY)} JPY
  ×1.4 (製造マージン) → 製造者価格: ${fmt(item.manufacturerPriceJPY)} JPY
  + 国際配送費: ${fmt(item.intlShippingJPY)} JPY${item.deliveryBoxes ? `（箱数: ${item.deliveryBoxes}）` : ''}
  → 製造社請求額: ${fmt((item.manufacturerPriceJPY ?? 0) + (item.intlShippingJPY ?? 0))} JPY
  ※ 国内配送費 ${fmt(item.domesticShippingJPY)} JPY は発注額に含みません
`;
  }).join('\n');

  return `
${data.company_name || data.customer_name} 様（製造依頼）

以下の内容で発注いたします。

====================
発注概要
====================

注文番号: ${data.order_number}
見積番号: ${data.quotation_number}
顧客名: ${data.customer_name}
発注日時: ${data.submitted_at}

【製造社請求額 合計】
  原価合計: ${fmt(data.base_cost_jpy)} JPY
  製造者マージン(×0.4): ${fmt(data.manufacturing_margin_jpy)} JPY
  → 製造者価格: ${fmt(data.base_cost_jpy + data.manufacturing_margin_jpy)} JPY
  + 国際配送費: ${fmt(data.intl_shipping_jpy)} JPY
  → 製造社請求額 合計: ${fmt(data.manufacturer_amount_jpy)} JPY

※ 国内配送費 ${fmt(data.domestic_shipping_jpy)} JPY は発注額に含まれません。
${data.exchange_rate_note ? `※ ${data.exchange_rate_note}` : ''}

====================
明細（仕様 + 計算式）
====================
${itemLines}

====================
この発注は販売価格を含みません。上記製造社請求額にてご手配をお願いいたします。
${data.order_url ? `ご確認: ${data.order_url}` : ''}

--------------------
EPackage Lab 発注システム
このメールはシステムにより自動送信されています。
--------------------
`.trim();
}

export const html = (data: PurchaseOrderData): string => {
  const itemRows = data.items.map((item, idx) => {
    const cb = item.cost_breakdown || {};
    const fcd = item.film_cost_details || {};
    const layers = (fcd.materialLayerDetails || []).map(l => `
        <tr>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;">${l.nameJa || l.materialId || '-'}</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;">${l.thicknessMicron || 0}μm</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;">${fmt(l.meters)}m</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;">${(l.widthM ?? 0).toFixed(3)}m</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;">${(l.weightKg ?? 0).toFixed(3)}kg</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:right;">${fmt(l.costKRW)}KRW</td>
          <td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:right;">${fmt(l.costJPY)}JPY</td>
        </tr>`).join('');

    const skuCell = (item.sku_quantities && item.sku_quantities.length > 1)
      ? `<div style="font-size:12px;color:#6b21a8;margin-top:4px;">SKU分割: ${item.sku_quantities.length}種 (${item.sku_quantities.map(q => fmt(q)).join(' / ')} 枚)</div>`
      : '';

    return `
      <div style="border:1px solid #ddd;border-radius:8px;padding:16px;margin-bottom:16px;">
        <h3 style="margin:0 0 8px;font-size:16px;color:#1f2937;">項目 ${idx + 1}: ${item.product_name}</h3>
        <p style="margin:0 0 8px;color:#374151;">数量: <strong>${fmt(item.quantity)} 枚</strong></p>
        ${skuCell}
        <table style="width:100%;font-size:13px;border-collapse:collapse;margin:8px 0;">
          <tr><td style="padding:4px 8px;color:#6b7280;width:140px;">製品タイプ</td><td style="padding:4px 8px;">${item.bagTypeId || '-'}</td></tr>
          <tr><td style="padding:4px 8px;color:#6b7280;">材質ID</td><td style="padding:4px 8px;">${item.materialId || '-'}</td></tr>
          <tr><td style="padding:4px 8px;color:#6b7280;">サイズ</td><td style="padding:4px 8px;">${item.width ?? '?'} × ${item.height ?? '?'}${item.depth ? ` × ${item.depth}` : ''}${item.sideWidth ? ` (側面${item.sideWidth})` : ''} mm</td></tr>
          <tr><td style="padding:4px 8px;color:#6b7280;">厚さ</td><td style="padding:4px 8px;">${item.thicknessSelection || '-'}</td></tr>
          <tr><td style="padding:4px 8px;color:#6b7280;">印刷</td><td style="padding:4px 8px;">${item.printingType || '-'} / ${item.printingColors ?? '-'}色</td></tr>
          <tr><td style="padding:4px 8px;color:#6b7280;">後加工</td><td style="padding:4px 8px;">${(item.postProcessingOptions || []).join(', ') || 'なし'}</td></tr>
          <tr><td style="padding:4px 8px;color:#6b7280;">ジッパー</td><td style="padding:4px 8px;">${item.zipper || item.hasZipper ? 'あり' : 'なし'}</td></tr>
        </table>

        <h4 style="font-size:14px;color:#1f2937;margin:12px 0 4px;">原価内訳 (JPY)</h4>
        <table style="width:100%;font-size:12px;border-collapse:collapse;">
          <tr><td style="padding:3px 8px;color:#6b7280;">原材料費</td><td style="padding:3px 8px;text-align:right;">${fmt(cb.materialCost)}</td>
              <td style="padding:3px 8px;color:#6b7280;">印刷費</td><td style="padding:3px 8px;text-align:right;">${fmt(cb.printingCost)}</td></tr>
          <tr><td style="padding:3px 8px;color:#6b7280;">合着費</td><td style="padding:3px 8px;text-align:right;">${fmt(cb.laminationCost)}</td>
              <td style="padding:3px 8px;color:#6b7280;">スリッター費</td><td style="padding:3px 8px;text-align:right;">${fmt(cb.slitterCost)}</td></tr>
          <tr><td style="padding:3px 8px;color:#6b7280;">表面処理費</td><td style="padding:3px 8px;text-align:right;">${fmt(cb.surfaceTreatmentCost)}</td>
              <td style="padding:3px 8px;color:#6b7280;">製袋加工費</td><td style="padding:3px 8px;text-align:right;">${fmt(cb.pouchProcessingCost)}</td></tr>
          <tr style="background:#f9fafb;"><td style="padding:4px 8px;font-weight:bold;" colspan="3">原価合計</td><td style="padding:4px 8px;text-align:right;font-weight:bold;">${fmt(cb.totalCost)} JPY</td></tr>
          <tr><td style="padding:3px 8px;color:#6b7280;">製造者マージン(×0.4)</td><td style="padding:3px 8px;text-align:right;" colspan="3">${fmt(item.manufacturingMarginJPY ?? cb.manufacturingMargin)}</td></tr>
          <tr style="background:#eff6ff;"><td style="padding:4px 8px;font-weight:bold;color:#1e40af;" colspan="3">製造者価格 (原価×1.4)</td><td style="padding:4px 8px;text-align:right;font-weight:bold;color:#1e40af;">${fmt(item.manufacturerPriceJPY)} JPY</td></tr>
        </table>

        <h4 style="font-size:14px;color:#1f2937;margin:12px 0 4px;">フィルム原価詳細</h4>
        <p style="font-size:12px;color:#6b7280;margin:0 0 4px;">原巾: ${fcd.materialWidthMM ?? '-'} mm / 総長: ${fmt(fcd.totalMeters)} m / 総面積: ${(fcd.areaM2 ?? 0).toFixed(2)} m² / 総重量: ${(fcd.totalWeight ?? 0).toFixed(3)} kg</p>
        <table style="width:100%;font-size:11px;border-collapse:collapse;border:1px solid #e5e7eb;">
          <thead><tr style="background:#f3f4f6;">
            <th style="padding:4px 8px;text-align:left;">素材</th><th style="padding:4px 8px;">厚さ</th><th style="padding:4px 8px;">長さ</th><th style="padding:4px 8px;">巾</th><th style="padding:4px 8px;">重量</th><th style="padding:4px 8px;text-align:right;">KRW</th><th style="padding:4px 8px;text-align:right;">JPY</th>
          </tr></thead>
          <tbody>${layers || '<tr><td colspan="7" style="padding:8px;color:#9ca3af;">(なし)</td></tr>'}</tbody>
        </table>

        <div style="margin-top:12px;padding:8px;background:#f0fdf4;border-radius:6px;font-size:13px;">
          <strong>製造社請求額:</strong> 原価 ${fmt(item.baseCostJPY)} × 1.4 = ${fmt(item.manufacturerPriceJPY)} JPY + 国際配送 ${fmt(item.intlShippingJPY)} JPY = <strong style="color:#15803d;">${fmt((item.manufacturerPriceJPY ?? 0) + (item.intlShippingJPY ?? 0))} JPY</strong><br><span style="font-size:11px;color:#9ca3af;">国内配送 ${fmt(item.domesticShippingJPY)} JPY は除外</span>
        </div>
      </div>`;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif; line-height: 1.5; color: #333; }
    .container { max-width: 680px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 22px; }
    .content { background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; }
    .summary { background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .summary .total { font-size: 22px; font-weight: bold; color: #065f46; }
    .footer { text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>発注依頼（製造社向け）</h1>
      <p style="margin:4px 0 0;opacity:0.9;">${data.company_name || data.customer_name}</p>
    </div>
    <div class="content">
      <table style="width:100%;font-size:13px;margin-bottom:16px;">
        <tr><td style="color:#6b7280;width:100px;">注文番号</td><td><strong>${data.order_number}</strong></td></tr>
        <tr><td style="color:#6b7280;">見積番号</td><td>${data.quotation_number}</td></tr>
        <tr><td style="color:#6b7280;">顧客名</td><td>${data.customer_name}</td></tr>
        <tr><td style="color:#6b7280;">発注日時</td><td>${data.submitted_at}</td></tr>
      </table>

      <div class="summary">
        <div style="font-size:14px;color:#065f46;margin-bottom:8px;">製造社請求額 合計</div>
        <table style="width:100%;font-size:13px;">
          <tr><td style="color:#374151;">原価合計</td><td style="text-align:right;">${fmt(data.base_cost_jpy)} JPY</td></tr>
          <tr><td style="color:#374151;">製造者マージン (×0.4)</td><td style="text-align:right;">${fmt(data.manufacturing_margin_jpy)} JPY</td></tr>
          <tr><td style="color:#374151;">→ 製造者価格</td><td style="text-align:right;">${fmt(data.base_cost_jpy + data.manufacturing_margin_jpy)} JPY</td></tr>
          <tr><td style="color:#374151;">+ 国際配送費</td><td style="text-align:right;">${fmt(data.intl_shipping_jpy)} JPY</td></tr>
          <tr style="border-top:1px solid #10b981;"><td style="padding-top:8px;font-weight:bold;font-size:16px;">合計</td><td style="padding-top:8px;text-align:right;" class="total">${fmt(data.manufacturer_amount_jpy)} JPY</td></tr>
        </table>
        <p style="font-size:11px;color:#6b7280;margin:8px 0 0;">※ 国内配送費(1,600 JPY/箱)は除外${data.exchange_rate_note ? ' / ' + data.exchange_rate_note : ''}</p>
      </div>

      <h2 style="font-size:16px;color:#1f2937;margin:20px 0 8px;">明細（仕様 + 計算式）</h2>
      ${itemRows}

      <div style="padding:12px;background:#fef3c7;border-radius:6px;font-size:12px;color:#92400e;margin-top:16px;">
        ※ 本発注メールは販売価格を含みません。上記製造社請求額にてご手配をお願いいたします。
        ${data.order_url ? `<br><a href="${data.order_url}" style="color:#92400e;">発注内容を確認 →</a>` : ''}
      </div>
    </div>
    <div class="footer">
      <p>EPackage Lab 発注システム / 自動送信メール</p>
    </div>
  </div>
</body>
</html>
`.trim();
}
