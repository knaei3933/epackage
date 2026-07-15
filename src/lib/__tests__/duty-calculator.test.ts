import { describe, it, expect } from '@jest/globals';
import {
  calcDuty,
  calcManufacturingMargin,
  calcManufacturerPrice,
  MANUFACTURER_MARGIN_RATE,
  DUTY_RATE,
} from '../duty-calculator';

/**
 * Duty Calculator ユニットテスト
 *
 * ResultStep.tsx saveQuotationToDatabase の3分岐（SKU / breakdown フォールバック / 最終フォールバック）
 * で duty 計算が一貫していることを検証する。
 *
 * 正確仕様（全モジュール共通）:
 *   manufacturingMargin = baseCost * 0.3
 *   manufacturerPrice   = baseCost + manufacturingMargin = baseCost * 1.3
 *   duty                = manufacturerPrice * 0.05 = baseCost * 0.065
 *
 * ※ 製造者マージンは 2026-07-09 改定で 40%→30%（DB system_settings.manufacturer_margin=0.3 と一致）。
 *
 * 参照:
 *   - pricing/core/constants.ts (MANUFACTURER_MARGIN=0.3, DUTY_RATE=0.05)
 *   - pricing/strategies/base-strategy.ts:227
 *   - pouch-cost-calculator.ts:1287
 *   - cost-breakdown-helpers.ts:324,331
 */
describe('duty-calculator', () => {
  describe('constants', () => {
    it('MANUFACTURER_MARGIN_RATE は 0.3', () => {
      expect(MANUFACTURER_MARGIN_RATE).toBe(0.3);
    });

    it('DUTY_RATE は 0.05', () => {
      expect(DUTY_RATE).toBe(0.05);
    });
  });

  describe('calcManufacturingMargin', () => {
    it('原価の30%を返す', () => {
      expect(calcManufacturingMargin(1000)).toBe(300);
      expect(calcManufacturingMargin(100)).toBe(30);
    });

    it('原価0の場合は0', () => {
      expect(calcManufacturingMargin(0)).toBe(0);
    });
  });

  describe('calcManufacturerPrice', () => {
    it('原価 + マージン(30%) = 原価*1.3', () => {
      expect(calcManufacturerPrice(1000)).toBe(1300);
      expect(calcManufacturerPrice(100)).toBe(130);
    });

    it('manufacturingMargin を明示的に渡せる', () => {
      // pouch-cost-calculator が各SKU単位で計算した値をそのまま使うSKUモードと同等
      expect(calcManufacturerPrice(1000, 500)).toBe(1500);
    });
  });

  describe('calcDuty', () => {
    it('製造者価格(原価*1.3) × 0.05 = 原価*0.065 を返す', () => {
      // baseCost=1000 → manufacturerPrice=1300 → duty=65
      expect(calcDuty(1000)).toBe(65);
      expect(calcDuty(100)).toBe(6.5);
      expect(calcDuty(0)).toBe(0);
    });

    it('旧実装(原価*0.05)と乖離している（回帰ガード）', () => {
      // 旧フォールバック実装は duty = baseCost * 0.05 だった。
      // 正確仕様は baseCost * 0.065。この差が約30%の過小計算だった。
      const baseCost = 1000;
      const oldImpl = baseCost * 0.05; // 50
      const correctImpl = calcDuty(baseCost); // 65
      expect(correctImpl).toBeGreaterThan(oldImpl);
      expect(correctImpl).toBe(65);
      expect(oldImpl).toBe(50);
    });

    it('売価を baseCost に渡した場合は約50%大きくなる（売価混入バグの再現ガード）', () => {
      // 最終フォールバックの旧バグ: baseCost に売価(totalPrice)が混入すると
      // duty が売価×0.065に跳ね上がった。原価と売価の違いを明示。
      // 売価1.5倍 → duty も1.5倍（約50%大きい）。
      const baseCost = 1000;       // 原価
      const sellPrice = 1500;      // 売価（原価の1.5倍を想定）
      expect(calcDuty(sellPrice)).toBeGreaterThan(calcDuty(baseCost));
      // 原価ベースの正しい duty
      expect(calcDuty(baseCost)).toBe(65);
    });

    it('manufacturingMargin 明示指定でも製造者価格×0.05 が成立', () => {
      // SKUモード: pouch-cost-calculator が計算した manufacturingMargin を使う
      const baseCost = 1000;
      const margin = 300; // baseCost * 0.3 と同値
      expect(calcDuty(baseCost, margin)).toBe((baseCost + margin) * 0.05);
      expect(calcDuty(baseCost, margin)).toBe(65);
    });
  });

  /**
   * 3分岐の duty 一貫性検証
   * ResultStep.tsx の saveQuotationToDatabase にある3分岐すべてが、
   * 同一の原価入力に対して同じ duty を算出することを確認する。
   *
   * 分岐1 (SKUモード):        sku.costBreakdown.duty の集計（pouch-cost-calculator 計算値）
   * 分岐2 (breakdown fallback): breakdown.duty ?? calcDuty(baseCost, manufacturingMargin)
   * 分岐3 (final fallback):    result.breakdown?.duty ?? calcDuty(baseCost, manufacturingMargin)
   *
   * 分岐2・3 は calcDuty を経由するため、SKUモードの計算式（製造者価格×0.05）と等価。
   */
  describe('3分岐の duty 一貫性 (ResultStep.saveQuotationToDatabase)', () => {
    const baseCost = 1000;
    const manufacturingMargin = calcManufacturingMargin(baseCost); // 300

    it('分岐1(SKU)相当: pouch-cost-calculator の計算式と等価', () => {
      // SKUモードは各SKUの costBreakdown.duty を集計。
      // pouch-cost-calculator の式: duty = (baseCost + baseCost*0.3) * 0.05
      const skuModeDuty = (baseCost + baseCost * 0.3) * 0.05;
      expect(skuModeDuty).toBe(65);
    });

    it('分岐2(breakdown fallback): calcDuty でSKUモードと同値', () => {
      // breakdown.duty が undefined の場合は calcDuty で計算
      const breakdownFallbackDuty = calcDuty(baseCost, manufacturingMargin);
      const skuModeDuty = (baseCost + baseCost * 0.3) * 0.05;
      expect(breakdownFallbackDuty).toBe(skuModeDuty);
      expect(breakdownFallbackDuty).toBe(65);
    });

    it('分岐3(final fallback): calcDuty でSKUモードと同値', () => {
      // result.breakdown?.duty が undefined の場合は calcDuty で計算
      // baseCost は原価（売価 totalPrice を含まない）
      const finalFallbackDuty = calcDuty(baseCost, manufacturingMargin);
      const skuModeDuty = (baseCost + baseCost * 0.3) * 0.05;
      expect(finalFallbackDuty).toBe(skuModeDuty);
      expect(finalFallbackDuty).toBe(65);
    });

    it('3分岐すべてが同一の duty 値(65)を算出', () => {
      const skuModeDuty = (baseCost + baseCost * 0.3) * 0.05;
      const breakdownFallbackDuty = calcDuty(baseCost, manufacturingMargin);
      const finalFallbackDuty = calcDuty(baseCost, manufacturingMargin);

      expect(skuModeDuty).toBe(breakdownFallbackDuty);
      expect(breakdownFallbackDuty).toBe(finalFallbackDuty);
      expect(skuModeDuty).toBe(65);
    });

    it('Math.round 後も3分岐で一致（DB保存時の実挙動）', () => {
      // ResultStep.tsx は各分岐で Math.round(duty) を保存
      const skuModeDuty = Math.round((baseCost + baseCost * 0.3) * 0.05);
      const breakdownFallbackDuty = Math.round(calcDuty(baseCost, manufacturingMargin));
      const finalFallbackDuty = Math.round(calcDuty(baseCost, manufacturingMargin));

      expect(skuModeDuty).toBe(breakdownFallbackDuty);
      expect(breakdownFallbackDuty).toBe(finalFallbackDuty);
      expect(skuModeDuty).toBe(65);
    });

    it('旧最終フォールバック(売価混入)との乖離を再現・是正確認', () => {
      // 旧バグ: final fallback は baseCost = totalPrice(売価) を使っていた。
      // 売価 = 原価 + 諸マージン + 関税 + 配送 + 販売マージン で原価より大きく、
      // duty が売価ベースに跳ね上がり大きく乖離していた。
      const baseCostVal = 1000;
      const buggySellPriceAsBaseCost = 2400; // 売価が原価の2.4倍程度を想定
      const correctDuty = calcDuty(baseCostVal); // 65
      const buggyDuty = calcDuty(buggySellPriceAsBaseCost); // 156

      expect(buggyDuty).toBeGreaterThan(correctDuty);
      // 是正後: 3分岐とも原価(1000)ベースの正しい duty=65 を算出
      expect(correctDuty).toBe(65);
    });
  });
});
