/**
 * Cost Breakdown Helper Utilities
 *
 * Korea-friendly 5-step cost breakdown helpers.
 * Uses existing breakdown data from unified-pricing-engine.ts
 *
 * IMPORTANT: baseCost Calculation Strategy
 * ========================================
 * The baseCost is calculated using a triple fallback approach:
 *
 * 1. PRIMARY: breakdown.baseCost (from unified-pricing-engine)
 *    - This is the stored value from the pricing engine
 *    - Ensures displayed value matches stored value
 *
 * 2. SECONDARY: Sum of components (rawMaterial + printing + postProcessing)
 *    - Used when breakdown.baseCost is not populated
 *    - Provides consistent calculation based on breakdown values
 *
 * 3. TERTIARY: materialCost / 0.4 (legacy calculation)
 *    - Used only as last resort for backward compatibility
 *    - This matches the old formula: baseCost = materialCost / 40%
 *
 * The component's local baseCost calculation (line 166) will be REPLACED
 * with fiveStep.baseCost from this helper to ensure consistency.
 */

import type { DetailedCostBreakdownProps } from '@/components/admin/quotation/DetailedCostBreakdown';

export interface FiveStepBreakdown {
  // Step 1: Raw Material Cost
  rawMaterialCost: {
    totalJPY: number;
    totalKRW: number;  // 韓国ウォン総額
    details: Array<{
      nameJa: string;
      thicknessMicron: number;
      weightKg: number;
      unitPriceKRW: number;
      costJPY: number;
      costKRW: number;  // 韓国ウォン費用
      // 追加フィールド（詳細表示用）
      areaM2: number;
      meters: number;
      widthM: number;
      density: number;
    }>;
  };
  // Step 2: Printing Cost
  printingCost: {
    costJPY: number;
    costKRW: number;
    formula: string;
    formulaKRW: string;  // 韓国ウォン計算式
    formulaDetails: {
      unitPriceKRW: number;      // 475 KRW/m²
      widthM: number;            // 1m (fixed)
      totalMeters: number;       // e.g., 126m
    };
  };
  // Step 3: Post-processing Cost
  postProcessingCost: {
    lamination: number;      // 円表示（互換性維持）
    laminationKRW: number;   // 韓国ウォン
    laminationFormula?: string;
    laminationFormulaKRW?: string;  // 韓国ウォン計算式
    slitter: number;
    slitterKRW: number;
    slitterFormula?: string;
    slitterFormulaKRW?: string;
    pouch: number;
    pouchKRW: number;
    pouchFormula?: string;
    pouchFormulaKRW?: string;
    surfaceTreatment: number;
    surfaceTreatmentKRW: number;
    surfaceTreatmentFormula?: string;
    surfaceTreatmentFormulaKRW?: string;
    total: number;      // 円表示
    totalKRW: number;   // 韓国ウォン表示
  };
  // Step 4: Base Cost
  baseCost: number;      // 円表示
  baseCostKRW: number;   // 韓国ウォン表示
  // Step 5: Manufacturer Margin
  manufacturerMargin: number;      // 円表示
  manufacturerMarginKRW: number;   // 韓国ウォン表示
  manufacturerMarginRate: string;   // マージン率（文字列表現）
  formula: string;      // 円計算式
  formulaKRW: string;   // 韓国ウォン計算式

  // ========================================
  // NEW: Extended Cost Breakdown Structure
  // ========================================

  // Step 6: Manufacturing Cost Total (製造業原価 = baseCost + manufacturerMargin)
  manufacturingCost: {
    totalKRW: number;      // 製造業原価（ウォン）
    totalJPY: number;      // 製造業原価（円）
  };

  // Additional Costs (追加費用)
  additionalCosts: {
    duty: number;          // 関税（円）
    dutyKRW: number;       // 関税（ウォン）
    delivery: number;      // 配送料（円）
    deliveryKRW: number;   // 配送料（ウォン）
    totalKRW: number;      // 追加費用合計（ウォン）
    totalJPY: number;      // 追加費用合計（円）
  };

  // Total Cost (総原価 = 製造業原価 + 追加費用)
  totalCost: {
    totalKRW: number;      // 総原価（ウォン）
    totalJPY: number;      // 総原価（円）
  };

  // Sales Price & Profit (販売価格と利益)
  salesAndProfit: {
    salesPrice: number;       // 販売価格（円）- 実際の見積価格
    salesPriceKRW: number;    // 販売価格（ウォン）
    calculatedPrice: number;  // 計算上の販売価格（小計×1.2）
    calculatedPriceKRW: number; // 計算上の販売価格（ウォン）
    priceAdjustment: number;  // 価格調整（見積価格 - 計算価格）
    priceAdjustmentKRW: number; // 価格調整（ウォン）
    salesMargin: number;      // 販売マージン（円）= 小計 × 20%
    salesMarginKRW: number;   // 販売マージン（ウォン）
    salesMarginRate: string;  // 販売マージン率（ドキュメント準拠20%）
    profit: number;           // 純利益（円）= 販売価格 - 総原価
    profitKRW: number;        // 純利益（ウォン）
    profitRate: string;       // 利益率（実際の利益/販売価格）
    actualMarginRate: string; // 実際のマージン率（利益/総原価）
  };
}

/**
 * Calculate the 5-step breakdown from existing data sources
 *
 * IMPORTANT: Uses existing breakdown values directly to ensure
 * displayed values match stored values (no recalculation).
 *
 * baseCost uses triple fallback:
 * 1. breakdown.baseCost (preferred)
 * 2. sum of components
 * 3. materialCost / 0.4 (legacy)
 */
export function calculateFiveStepBreakdown(
  breakdown: DetailedCostBreakdownProps['breakdown'],
  filmCostDetails: DetailedCostBreakdownProps['filmCostDetails'],
  specifications?: DetailedCostBreakdownProps['specifications'],
  quotationSubtotal?: number  // 実際の見積価格（小計）
): FiveStepBreakdown {
  // ========================================
  // 配送料の取得（複数ソースから優先順位で取得）
  // ========================================
  // 1. cost_breakdown.delivery（優先）
  // 2. film_cost_details.deliveryCostJPY
  // 3. film_cost_details.breakdownの配送料計算結果
  // 4. デフォルト配送料（ドキュメント準拠: 127,980ウォン × 0.12 = 15,358円）
  const DEFAULT_DELIVERY_KRW = 127980;  // ドキュメント準拠のデフォルト配送料
  // 注: KRW_TO_JPY_RATE は312行目で定義済み

  const deliveryFromBreakdown = breakdown.delivery || 0;
  const deliveryFromFilmDetails = (filmCostDetails as any)?.deliveryCostJPY || 0;
  const deliveryFromFilmBreakdown = (filmCostDetails as any)?.breakdown?.deliveryCost || 0;
  const defaultDeliveryJPY = Math.round(DEFAULT_DELIVERY_KRW * 0.12);  // ≈15,358円

  // 配送料の決定（優先順位: breakdown > filmDetails > filmBreakdown > default）
  const deliveryJPY = deliveryFromBreakdown || deliveryFromFilmDetails || deliveryFromFilmBreakdown || defaultDeliveryJPY;
  // 為替レート: 1円 = 約8.33ウォン
  const JPY_TO_KRW_RATE = 8.33;

  // Step 1: Raw Material Cost - Sum of all materialLayerDetails
  const rawMaterialDetails = filmCostDetails?.materialLayerDetails?.map(m => ({
    nameJa: m.nameJa,
    thicknessMicron: m.thicknessMicron,
    weightKg: m.weightKg,
    unitPriceKRW: m.unitPriceKRW,
    costJPY: m.costJPY,
    costKRW: m.costKRW,  // 既にウォン（KRW）で保存されている値を直接使用
    // 追加フィールド（詳細表示用）
    areaM2: m.areaM2,
    meters: m.meters,
    widthM: m.widthM,
    density: m.density
  })) || [];

  const rawMaterialTotalJPY = rawMaterialDetails.reduce((sum, m) => sum + m.costJPY, 0);
  const rawMaterialTotalKRW = rawMaterialDetails.reduce((sum, m) => sum + m.costKRW, 0);  // costKRWを合計

  // Step 2: Printing Cost
  const totalMeters = filmCostDetails?.totalMeters || 0;
  const PRINTING_UNIT_PRICE_KRW = 475;
  // filmCostDetails.breakdown.printingからデータを取得（基本印刷費 + マット印刷追加費）
  const printingBasicKRW = filmCostDetails?.breakdown?.printing?.basic || 0;
  const printingMatteKRW = filmCostDetails?.breakdown?.printing?.matte || 0;
  const printingTotalKRW = filmCostDetails?.breakdown?.printing?.total || 0;

  // フォールバック: breakdown.printingまたは直接計算
  const printingCostJPY = (breakdown as any).printing || (breakdown as any).printingCost || 0;

  // 直接計算: totalMeters × 475 (filmCostDetailsから 데이터가 없는 경우)
  let calculatedPrintingKRW = 0;
  if (totalMeters > 0 && printingTotalKRW === 0) {
    calculatedPrintingKRW = Math.round(totalMeters * PRINTING_UNIT_PRICE_KRW);
  }

  const printingCostKRW = printingTotalKRW > 0
    ? printingTotalKRW
    : (calculatedPrintingKRW > 0 ? calculatedPrintingKRW : Math.round(printingCostJPY * JPY_TO_KRW_RATE));

  const printingFormula = totalMeters > 0
    ? `₩${PRINTING_UNIT_PRICE_KRW}/m² × 1m(固定) × ${totalMeters.toFixed(1)}m`
    : '印刷費';
  const printingFormulaKRW = totalMeters > 0
    ? `₩${PRINTING_UNIT_PRICE_KRW}/m² × 1m(固定) × ${totalMeters.toFixed(1)}m${printingMatteKRW > 0 ? ' + マット仕上げ追加費 ₩' + printingMatteKRW.toLocaleString() : ''} = ₩${printingCostKRW.toLocaleString()}`
    : '印刷費';

  // Step 3: Post-processing Cost
  const laminationJPY = breakdown.laminationCost || 0;
  const slitterJPY = breakdown.slitterCost || 0;
  const pouchJPY = breakdown.pouchProcessingCost || 0;
  const surfaceTreatmentJPY = breakdown.surfaceTreatmentCost || 0;
  const postProcessingTotal = laminationJPY + slitterJPY + pouchJPY + surfaceTreatmentJPY;

  // ラミネート・スリッターの数式パラメータ（表示用）
  const hasALMaterial = filmCostDetails?.materialLayerDetails?.some(l => l.materialId === 'AL') || false;
  const laminationPricePerMeterKRW = hasALMaterial ? 75 : 65;
  const laminationCycles = filmCostDetails?.breakdown?.lamination?.count || ((filmCostDetails?.materialLayerDetails?.length || 1) - 1);
  const materialWidthMM = filmCostDetails?.materialWidthMM || 590;
  const materialWidthM = materialWidthMM / 1000;

  // KRW値: filmCostDetails.breakdownから実際の計算値を優先使用（DB設定反映済み）
  // フォールバック: 数式パラメータから計算 → JPY逆変換
  const laminationKRW = filmCostDetails?.breakdown?.lamination?.cost
    ?? ((laminationPricePerMeterKRW > 0 && totalMeters > 0)
      ? Math.round(laminationPricePerMeterKRW * materialWidthM * laminationCycles * totalMeters)
      : Math.round(laminationJPY * JPY_TO_KRW_RATE));

  const slitterKRW = filmCostDetails?.breakdown?.slitter?.final
    ?? (totalMeters > 0
      ? Math.max(30000, Math.round(totalMeters * 10))
      : Math.round(slitterJPY * JPY_TO_KRW_RATE));

  // 製袋加工費: unified-pricing-engine でKRW計算後にJPY変換されているため、元に戻す
  // pouchProcessingCostJPY = pouchProcessingCostKRW * 0.12
  const pouchKRW = pouchJPY > 0 ? Math.round(pouchJPY / 0.12) : 0;
  const surfaceTreatmentKRW = Math.round(surfaceTreatmentJPY * JPY_TO_KRW_RATE);
  const postProcessingTotalKRW = laminationKRW + slitterKRW + pouchKRW + surfaceTreatmentKRW;

  // ラミネート表示: 基本単価（₩65/m or ₩75/m）を明示
  // ドキュメント: ラミネート費 = 実際使用幅(m) × 使用メートル数 × ラミ単価 × ラミ回数
  const laminationFormula = laminationJPY > 0 && totalMeters > 0
    ? `¥${Math.round(laminationJPY / totalMeters).toLocaleString()}/m × ${totalMeters.toFixed(1)}m`
    : undefined;
  const laminationFormulaKRW = laminationKRW > 0 && totalMeters > 0
    ? `基本単価 ₩${laminationPricePerMeterKRW}/m × ${materialWidthM.toFixed(2)}m(幅) × ${laminationCycles}回 × ${totalMeters.toFixed(1)}m = ₩${laminationKRW.toLocaleString()}`
    : undefined;

  // スリッター表示: 最小単価30,000ウォンを明示
  // ドキュメント: スリッター費 = MAX(30,000ウォン, 使用メートル数 × 10ウォン)
  const slitterCalculatedCost = Math.round(totalMeters * 10);
  const slitterIsMinimum = slitterKRW === 30000 && slitterCalculatedCost < 30000;

  const slitterFormula = slitterJPY > 0 && totalMeters > 0
    ? `¥${Math.round(slitterJPY / totalMeters).toLocaleString()}/m × ${totalMeters.toFixed(1)}m`
    : undefined;
  const slitterFormulaKRW = slitterKRW > 0 && totalMeters > 0
    ? slitterIsMinimum
      ? `最小単価 ₩30,000（${totalMeters.toFixed(1)}m × ₩10/m = ₩${slitterCalculatedCost.toLocaleString()}）`
      : `₩${slitterKRW.toLocaleString()}（${totalMeters.toFixed(1)}m × ₩10/m）`
    : undefined;

  // スパウトパウチの場合、詳細な計算式を表示
  const spoutSize = specifications?.spoutSize as (number | undefined) || undefined;
  const quantity = filmCostDetails?.quantity || 0;

  let pouchFormula: string | undefined;
  let pouchFormulaKRW: string | undefined;

  if (spoutSize && pouchKRW > 0) {
    // スパウト単価マップ（pouch-cost-calculator.ts基準）
    const SPOUT_PRICES: Record<number, number> = {
      9: 70,    // 9パイ（φ9mm）: 70ウォン
      15: 80,   // 15パイ（φ15mm）: 80ウォン
      18: 110,  // 18パイ（φ18mm）: 110ウォン
      22: 130,  // 22パイ（φ22mm）: 130ウォン
      28: 200   // 28パイ（φ28mm）: 200ウォン
    };
    const spoutPrice = SPOUT_PRICES[spoutSize] || 80;
    const ROUND_TRIP_SHIPPING = 150000; // 往復配送料: 150,000ウォン
    const MIN_SPOUT_QUANTITY = 5000;    // 最小注文数量: 5,000個
    const actualQuantity = Math.max(quantity, MIN_SPOUT_QUANTITY);
    const spoutCost = spoutPrice * actualQuantity;

    pouchFormula = pouchJPY > 0 ? `スパウト加工費 ¥${pouchJPY.toLocaleString()}` : undefined;
    pouchFormulaKRW = `スパウト単価 ₩${spoutPrice} × ${actualQuantity.toLocaleString()}個 + 往復配送料 ₩${ROUND_TRIP_SHIPPING.toLocaleString()} = ₩${pouchKRW.toLocaleString()}`;
  } else {
    // スパウトパウチ以外の場合
    pouchFormula = pouchJPY > 0 ? `¥${pouchJPY.toLocaleString()}` : undefined;
    pouchFormulaKRW = pouchKRW > 0 ? `₩${pouchKRW.toLocaleString()}` : undefined;
  }

  const surfaceTreatmentFormula = surfaceTreatmentJPY > 0 ? `¥${surfaceTreatmentJPY.toLocaleString()}` : undefined;
  const surfaceTreatmentFormulaKRW = surfaceTreatmentKRW > 0 ? `₩${surfaceTreatmentKRW.toLocaleString()}` : undefined;

  // ========================================
  // ドキュメント準拠の価格計算フロー
  // Reference: docs/reports/calcultae/06-마진_및_최종가격.md
  // ========================================

  // 為替レート: 1円 = 約8.33ウォン (0.12 = ウォン→円)
  const KRW_TO_JPY_RATE = 0.12;

  // Step 4: 基礎原価 (KRW) = 原材料費 + 印刷費 + 後加工費
  const baseCostKRW = rawMaterialTotalKRW + printingCostKRW + postProcessingTotalKRW;

  // Step 5: 製造者マージン (40%)
  const MANUFACTURER_MARGIN_RATE = 0.4; // 40%
  const manufacturerMarginKRW = Math.round(baseCostKRW * MANUFACTURER_MARGIN_RATE);
  const marginFormulaKRW = `₩${baseCostKRW.toLocaleString()} × ${(MANUFACTURER_MARGIN_RATE * 100).toFixed(0)}%`;

  // Step 6: 製造者価格 (KRW) = 基礎原価 + 製造者マージン
  const manufacturerPriceKRW = baseCostKRW + manufacturerMarginKRW;

  // Step 7: 円貨製造者価格 (JPY) = 製造者価格 × 0.12 (為替レート適用)
  const manufacturerPriceJPY = Math.round(manufacturerPriceKRW * KRW_TO_JPY_RATE);

  // Step 8: 関税 (JPY) = 円貨製造者価格 × 5%
  const DUTY_RATE = 0.05; // 5%
  const dutyJPY = Math.round(manufacturerPriceJPY * DUTY_RATE);

  // Step 10: 小計 (JPY) = 円貨製造者価格 + 関税 + 配送料
  // （配送料は関数先頭で既に取得済み）
  const subtotalJPY = manufacturerPriceJPY + dutyJPY + deliveryJPY;

  // Step 11: 販売者マージン (20%)
  const SALES_MARGIN_RATE = 0.2; // 20%
  const salesMarginJPY = Math.round(subtotalJPY * SALES_MARGIN_RATE);

  // Step 12: 最終販売価格 (JPY) = 小計 × 1.2（販売者マージン20%追加）
  // ドキュメント準拠の計算
  const calculatedFinalPriceJPY = Math.round(subtotalJPY * (1 + SALES_MARGIN_RATE));

  // 実際の見積価格がある場合、差異を利益調整として計算
  const actualQuotationPrice = quotationSubtotal || 0;
  const priceAdjustment = actualQuotationPrice > 0 ? actualQuotationPrice - calculatedFinalPriceJPY : 0;

  // 最終販売価格：見積価格がある場合はそれを使用、なければ計算値
  const finalPriceJPY = actualQuotationPrice > 0 ? actualQuotationPrice : calculatedFinalPriceJPY;

  // ========================================
  // 表示用の値を計算
  // ========================================

  // 基礎原価のJPY表示
  const baseCost = Math.round(baseCostKRW * KRW_TO_JPY_RATE);
  const marginFormula = `¥${baseCost.toLocaleString()} × ${(MANUFACTURER_MARGIN_RATE * 100).toFixed(0)}%`;
  const manufacturerMargin = Math.round(manufacturerMarginKRW * KRW_TO_JPY_RATE);

  // 追加費用のKRW表示
  const dutyKRW = Math.round(dutyJPY / KRW_TO_JPY_RATE);
  const deliveryKRW = Math.round(deliveryJPY / KRW_TO_JPY_RATE);

  // 製造業原価
  const manufacturingCostKRW = manufacturerPriceKRW;
  const manufacturingCostJPY = manufacturerPriceJPY;

  // 追加費用合計
  const additionalCostsTotalKRW = dutyKRW + deliveryKRW;
  const additionalCostsTotalJPY = dutyJPY + deliveryJPY;

  // 総原価
  const totalCostKRW = Math.round(subtotalJPY / KRW_TO_JPY_RATE);
  const totalCostJPY = subtotalJPY;

  // 販売価格と利益
  const salesPriceJPY = finalPriceJPY;
  const salesPriceKRW = Math.round(salesPriceJPY / KRW_TO_JPY_RATE);

  // 計算上の販売価格（ドキュメント準拠）
  const calculatedPriceJPY = calculatedFinalPriceJPY;
  const calculatedPriceKRW = Math.round(calculatedPriceJPY / KRW_TO_JPY_RATE);

  // 価格調整（見積価格 - 計算価格）
  const priceAdjustmentJPY = priceAdjustment;
  const priceAdjustmentKRW = Math.round(priceAdjustmentJPY / KRW_TO_JPY_RATE);

  // 利益 = 販売価格 - 総原価
  const profitJPY = salesPriceJPY - totalCostJPY;
  const profitKRW = salesPriceKRW - totalCostKRW;

  // 販売マージン（利益と同義）
  const salesMarginKRW = profitKRW;

  // マージン率（ドキュメント準拠: 20%）
  const salesMarginRate = `${(SALES_MARGIN_RATE * 100).toFixed(0)}%`;

  // 実際のマージン率（利益/総原価）
  const actualMarginRate = totalCostJPY > 0
    ? ((profitJPY / totalCostJPY) * 100).toFixed(1)
    : '0.0';

  // 利益率（利益/販売価格）
  const profitRate = salesPriceJPY > 0
    ? ((profitJPY / salesPriceJPY) * 100).toFixed(1)
    : '0.0';

  return {
    rawMaterialCost: {
      totalJPY: rawMaterialTotalJPY,
      totalKRW: rawMaterialTotalKRW,
      details: rawMaterialDetails
    },
    printingCost: {
      costJPY: printingCostJPY,
      costKRW: printingCostKRW,
      formula: printingFormula,
      formulaKRW: printingFormulaKRW,
      formulaDetails: {
        unitPriceKRW: PRINTING_UNIT_PRICE_KRW,
        widthM: 1,
        totalMeters: totalMeters
      }
    },
    postProcessingCost: {
      lamination: laminationJPY,
      laminationKRW,
      laminationFormula,
      laminationFormulaKRW,
      slitter: slitterJPY,
      slitterKRW,
      slitterFormula,
      slitterFormulaKRW,
      pouch: pouchJPY,
      pouchKRW,
      pouchFormula,
      pouchFormulaKRW,
      surfaceTreatment: surfaceTreatmentJPY,
      surfaceTreatmentKRW,
      surfaceTreatmentFormula,
      surfaceTreatmentFormulaKRW,
      total: postProcessingTotal,
      totalKRW: postProcessingTotalKRW
    },
    baseCost,
    baseCostKRW,
    manufacturerMargin,
    manufacturerMarginKRW,
    manufacturerMarginRate: `${(MANUFACTURER_MARGIN_RATE * 100).toFixed(0)}%`,
    formula: marginFormula,
    formulaKRW: marginFormulaKRW,

    // NEW: Extended fields
    manufacturingCost: {
      totalKRW: manufacturingCostKRW,
      totalJPY: manufacturingCostJPY
    },
    additionalCosts: {
      duty: dutyJPY,
      dutyKRW,
      delivery: deliveryJPY,
      deliveryKRW,
      totalKRW: additionalCostsTotalKRW,
      totalJPY: additionalCostsTotalJPY
    },
    totalCost: {
      totalKRW: totalCostKRW,
      totalJPY: totalCostJPY
    },
    salesAndProfit: {
      salesPrice: salesPriceJPY,
      salesPriceKRW,
      calculatedPrice: calculatedPriceJPY,
      calculatedPriceKRW,
      priceAdjustment: priceAdjustmentJPY,
      priceAdjustmentKRW,
      salesMargin: salesMarginJPY,
      salesMarginKRW,
      salesMarginRate,
      profit: profitJPY,
      profitKRW,
      profitRate: `${profitRate}%`,
      actualMarginRate: `${actualMarginRate}%`
    }
  };
}
