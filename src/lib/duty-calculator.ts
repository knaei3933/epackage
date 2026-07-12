/**
 * Duty Calculator
 *
 * 関税（duty）計算の統一ヘルパー。
 * 仕様: duty = 製造者価格 × 関税率(0.05)
 *      製造者価格 = 原価(baseCost) + 製造者マージン(manufacturingMargin)
 *
 * 参照元（全て同一仕様）:
 *   - src/lib/pricing/core/constants.ts   : MANUFACTURER_MARGIN=0.3, DUTY_RATE=0.05
 *   - src/lib/pricing/strategies/base-strategy.ts:227 : manufacturerPrice = baseCost * 1.3
 *   - src/lib/pouch-cost-calculator.ts:1287          : manufacturerPriceKRW = baseCostKRW * (1 + MANUFACTURER_MARGIN)
 *   - src/lib/cost-breakdown-helpers.ts:324,331      : manufacturerPrice = baseCost + margin, duty = manufacturerPrice * 0.05
 *
 * ResultStep.tsx saveQuotationToDatabase の3分岐（SKU / breakdown フォールバック / 最終フォールバック）
 * すべてこのヘルパー経由で duty を計算し、一貫性を保証する。
 */

/** 製造者マージン率 30%（PRICING_CONSTANTS.MANUFACTURER_MARGIN と一致、DB=0.3） */
export const MANUFACTURER_MARGIN_RATE = 0.3;
/** 関税率 5%（PRICING_CONSTANTS.DUTY_RATE と一致） */
export const DUTY_RATE = 0.05;

/**
 * 原価から製造者マージンを計算する。
 * manufacturingMargin = baseCost * MANUFACTURER_MARGIN_RATE(0.3)
 */
export function calcManufacturingMargin(baseCost: number): number {
  return baseCost * MANUFACTURER_MARGIN_RATE;
}

/**
 * 製造者価格を計算する。
 * manufacturerPrice = baseCost + manufacturingMargin = baseCost * 1.3
 */
export function calcManufacturerPrice(
  baseCost: number,
  manufacturingMargin?: number
): number {
  const margin = manufacturingMargin ?? calcManufacturingMargin(baseCost);
  return baseCost + margin;
}

/**
 * 関税（duty）を計算する。
 * duty = 製造者価格(baseCost + manufacturingMargin) × DUTY_RATE(0.05)
*
 * @param baseCost 原価（売価を含まないこと。売価を渡すと約30%乖離する）
 * @param manufacturingMargin 製造者マージン。省略時は baseCost * 0.3 を使用
 * @returns duty（小数含む、呼び出し元で Math.round すること）
 */
export function calcDuty(
  baseCost: number,
  manufacturingMargin?: number
): number {
  return calcManufacturerPrice(baseCost, manufacturingMargin) * DUTY_RATE;
}
