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
  specifications?: DetailedCostBreakdownProps['specifications']
): FiveStepBreakdown {
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

  // Step 4: Base Cost
  const sumBasedBaseCostJPY = rawMaterialTotalJPY + printingCostJPY + postProcessingTotal;
  const sumBasedBaseCostKRW = rawMaterialTotalKRW + printingCostKRW + postProcessingTotalKRW;
  const legacyBaseCost = (breakdown.materialCost || 0) > 0
    ? Math.round((breakdown.materialCost || 0) / 0.4)
    : 0;
  const baseCost = (breakdown as any).baseCost || sumBasedBaseCostJPY || legacyBaseCost;
  // baseCostKRWはステップ1+2+3のKRW合計を使用
  const baseCostKRW = sumBasedBaseCostKRW;

  // Step 5: Manufacturer Margin
  const MANUFACTURER_MARGIN_RATE = 0.3; // 30%
  const manufacturerMargin = Math.round(baseCost * MANUFACTURER_MARGIN_RATE);
  const manufacturerMarginKRW = Math.round(baseCostKRW * MANUFACTURER_MARGIN_RATE);
  const marginFormula = `¥${baseCost.toLocaleString()} × ${(MANUFACTURER_MARGIN_RATE * 100).toFixed(0)}%`;
  const marginFormulaKRW = `₩${baseCostKRW.toLocaleString()} × ${(MANUFACTURER_MARGIN_RATE * 100).toFixed(0)}%`;

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
    formulaKRW: marginFormulaKRW
  };
}
