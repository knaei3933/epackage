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
    details: Array<{
      nameJa: string;
      thicknessMicron: number;
      weightKg: number;
      unitPriceKRW: number;
      costJPY: number;
    }>;
  };
  // Step 2: Printing Cost
  printingCost: {
    costJPY: number;
    costKRW: number;
    formula: string;
    formulaDetails: {
      unitPriceKRW: number;      // 475 KRW/m²
      widthM: number;            // 1m (fixed)
      totalMeters: number;       // e.g., 126m
    };
  };
  // Step 3: Post-processing Cost
  postProcessingCost: {
    lamination: number;
    laminationFormula?: string;  // e.g., "₩15/m × 126m = ₩1,890"
    slitter: number;
    slitterFormula?: string;     // e.g., "₩20/m × 126m = ₩2,520"
    pouch: number;
    pouchFormula?: string;       // e.g., "¥10/袋 × 1000袋 = ¥10,000"
    surfaceTreatment: number;    // NEW: 表面処理費
    surfaceTreatmentFormula?: string;
    total: number;
  };
  // Step 4: Base Cost
  baseCost: number;
  // Step 5: Manufacturer Margin
  manufacturerMargin: number;
  formula: string;  // e.g., "¥113,777 × 40% = ¥45,511"
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
  filmCostDetails: DetailedCostBreakdownProps['filmCostDetails']
): FiveStepBreakdown {
  // Step 1: Raw Material Cost - Sum of all materialLayerDetails
  const rawMaterialDetails = filmCostDetails?.materialLayerDetails?.map(m => ({
    nameJa: m.nameJa,
    thicknessMicron: m.thicknessMicron,
    weightKg: m.weightKg,
    unitPriceKRW: m.unitPriceKRW,
    costJPY: m.costJPY
  })) || [];

  const rawMaterialTotalJPY = rawMaterialDetails.reduce((sum, m) => sum + m.costJPY, 0);

  // Step 2: Printing Cost - Use existing breakdown.printingCost directly
  // (already calculated in unified-pricing-engine with 1m width formula)
  const printingCostJPY = breakdown.printingCost || 0;
  const totalMeters = filmCostDetails?.totalMeters || 0;

  // 詳細計算式: 475ウォン/m² × 1m幅 × メートル数
  const PRINTING_UNIT_PRICE_KRW = 475; // 固定単価
  const printingCostKRW = Math.round(printingCostJPY / 0.12); // KRWへ逆算（為替レート約0.12）
  const printingFormula = totalMeters > 0
    ? `₩${PRINTING_UNIT_PRICE_KRW}/m² × 1m(固定) × ${totalMeters.toFixed(1)}m = ₩${printingCostKRW.toLocaleString()} → ¥${printingCostJPY.toLocaleString()}`
    : '印刷費';

  // Step 3: Post-processing Cost - Use existing breakdown values
  const laminationJPY = breakdown.laminationCost || 0;
  const slitterJPY = breakdown.slitterCost || 0;
  const pouchJPY = breakdown.pouchProcessingCost || 0; // From breakdown, NOT filmCostDetails
  const surfaceTreatmentJPY = breakdown.surfaceTreatmentCost || 0; // NEW: 表面処理費を追加
  const postProcessingTotal = laminationJPY + slitterJPY + pouchJPY + surfaceTreatmentJPY;

  // 後加工費の詳細計算式
  const laminationFormula = laminationJPY > 0 && totalMeters > 0
    ? `¥${Math.round(laminationJPY / totalMeters).toLocaleString()}/m × ${totalMeters.toFixed(1)}m = ¥${laminationJPY.toLocaleString()}`
    : undefined;

  const slitterFormula = slitterJPY > 0 && totalMeters > 0
    ? `¥${Math.round(slitterJPY / totalMeters).toLocaleString()}/m × ${totalMeters.toFixed(1)}m = ¥${slitterJPY.toLocaleString()}`
    : undefined;

  const pouchFormula = pouchJPY > 0
    ? `¥${pouchJPY.toLocaleString()}（製袋加工固定費）`
    : undefined;

  const surfaceTreatmentFormula = surfaceTreatmentJPY > 0
    ? `¥${surfaceTreatmentJPY.toLocaleString()}（表面処理固定費）`
    : undefined;

  // Step 4: Base Cost - Triple fallback strategy (CRITICAL)
  // 1. PRIMARY: Use breakdown.baseCost if available
  // 2. SECONDARY: Sum of rawMaterial + printing + postProcessing
  // 3. TERTIARY: Legacy calculation (materialCost / 0.4)
  const sumBasedBaseCost = rawMaterialTotalJPY + printingCostJPY + postProcessingTotal;
  const legacyBaseCost = (breakdown.materialCost || 0) > 0
    ? Math.round((breakdown.materialCost || 0) / 0.4)
    : 0;

  const baseCost = (breakdown as any).baseCost || sumBasedBaseCost || legacyBaseCost;

  // Step 5: Manufacturer Margin - Calculate from baseCost (40%)
  // IMPORTANT: Always calculate from baseCost to ensure consistency with Step 4 display
  const manufacturerMargin = Math.round(baseCost * 0.4);
  const marginFormula = `¥${baseCost.toLocaleString()} × 40% = ¥${manufacturerMargin.toLocaleString()}`;

  return {
    rawMaterialCost: {
      totalJPY: rawMaterialTotalJPY,
      details: rawMaterialDetails
    },
    printingCost: {
      costJPY: printingCostJPY,
      costKRW: printingCostKRW,
      formula: printingFormula,
      formulaDetails: {
        unitPriceKRW: PRINTING_UNIT_PRICE_KRW,
        widthM: 1, // 固定
        totalMeters: totalMeters
      }
    },
    postProcessingCost: {
      lamination: laminationJPY,
      laminationFormula,
      slitter: slitterJPY,
      slitterFormula,
      pouch: pouchJPY,
      pouchFormula,
      surfaceTreatment: surfaceTreatmentJPY,
      surfaceTreatmentFormula,
      total: postProcessingTotal
    },
    baseCost,
    manufacturerMargin,
    formula: marginFormula
  };
}
