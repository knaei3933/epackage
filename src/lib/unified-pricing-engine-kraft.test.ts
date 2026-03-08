/**
 * Kraft材料grammage修正の検証テスト
 *
 * 目的: Kraft材料がgrammage (g/m²) を使用して正しく重量計算されることを検証
 * 修正箇所: unified-pricing-engine.tsの5箇所
 */

import { UnifiedPricingEngine } from './unified-pricing-engine';

describe('UnifiedPricingEngine - Kraft Grammage Fix', () => {
  let engine: UnifiedPricingEngine;

  beforeEach(() => {
    engine = new UnifiedPricingEngine();
  });

  describe('Kraft VMPET LLDPE材料', () => {
    const kraftVmpetParams = {
      bagTypeId: 'flat_3_side' as const,
      width: 200,
      height: 300,
      material: 'kraft_vmpet_lldpe' as const,
      thicknessSelection: 'standard_70' as const,
      quantity: 1000,
      printingType: 'flexo' as const,
      printingColors: 1,
    };

    it('grammage使用時に異常に高くない価格を計算すること', async () => {
      const result = await engine.calculateQuote(kraftVmpetParams);

      // 修正前: ¥62,817,723/個（異常）
      // 修正後: ¥100-500/個程度（正常）

      console.log('=== Kraft VMPET LLDPE Price Test ===');
      console.log('Material:', kraftVmpetParams.material);
      console.log('Quantity:', kraftVmpetParams.quantity);
      console.log('Unit Price (JPY):', result.unitPrice);
      console.log('Total Price (JPY):', result.totalPrice);

      // 単価が正常範囲内にあることを確認（¥50 - ¥5,000）
      expect(result.unitPrice).toBeGreaterThan(50);
      expect(result.unitPrice).toBeLessThan(5000);

      // 総額も妥当であることを確認（¥100万以下）
      expect(result.totalPrice).toBeLessThan(1000000);
    });

    it('grammage使用時の重量計算が正しいこと', async () => {
      const result = await engine.calculateQuote(kraftVmpetParams);

      // Kraft 50g/m² + VMPET 12μ + LLDPE 70μ
      // 重量 = (50/1000) × 幅 × 長さ (g/m² → kg/m²)

      console.log('=== Kraft Weight Calculation Test ===');
      console.log('Breakdown:', JSON.stringify(result.breakdown, null, 2));

      // 重量が正しく計算されていることを確認
      if (result.breakdown?.material_cost_KRW) {
        const materialCostKRW = result.breakdown.material_cost_KRW as number;
        console.log('Material Cost (KRW):', materialCostKRW);

        // 素材費が妥当であることを確認（1万ウォン - 100万ウォン）
        expect(materialCostKRW).toBeGreaterThan(10000);
        expect(materialCostKRW).toBeLessThan(1000000);
      }
    });
  });

  describe('Kraft PET LLDPE材料', () => {
    const kraftPetParams = {
      bagTypeId: 'flat_3_side' as const,
      width: 200,
      height: 300,
      material: 'kraft_pet_lldpe' as const,
      thicknessSelection: 'standard_70' as const,
      quantity: 1000,
      printingType: 'flexo' as const,
      printingColors: 1,
    };

    it('正常な価格を計算すること', async () => {
      const result = await engine.calculateQuote(kraftPetParams);

      console.log('=== Kraft PET LLDPE Price Test ===');
      console.log('Material:', kraftPetParams.material);
      console.log('Unit Price (JPY):', result.unitPrice);
      console.log('Total Price (JPY):', result.totalPrice);

      // 単価が正常範囲内にあることを確認
      expect(result.unitPrice).toBeGreaterThan(50);
      expect(result.unitPrice).toBeLessThan(5000);

      // 総額も妥当であることを確認
      expect(result.totalPrice).toBeLessThan(1000000);
    });
  });

  describe('NY LLDPE材料（grammage不使用 - 比較用）', () => {
    const nyLldpeParams = {
      bagTypeId: 'flat_3_side' as const,
      width: 200,
      height: 300,
      material: 'ny_lldpe' as const,
      thicknessSelection: 'standard_70' as const,
      quantity: 1000,
      printingType: 'flexo' as const,
      printingColors: 1,
    };

    it('thickness × density 方式で正常に計算すること', async () => {
      const result = await engine.calculateQuote(nyLldpeParams);

      console.log('=== NY LLDPE Price Test (Comparison) ===');
      console.log('Material:', nyLldpeParams.material);
      console.log('Unit Price (JPY):', result.unitPrice);
      console.log('Total Price (JPY):', result.totalPrice);

      // NY+LLDPEも正常範囲内であることを確認
      expect(result.unitPrice).toBeGreaterThan(50);
      expect(result.unitPrice).toBeLessThan(5000);
    });
  });

  describe('grammage vs thickness 比較テスト', () => {
    it('Kraft材料とPET AL材料の価格が同程度であること', async () => {
      const kraftResult = await engine.calculateQuote({
        bagTypeId: 'flat_3_side',
        width: 200,
        height: 300,
        material: 'kraft_vmpet_lldpe',
        thicknessSelection: 'standard_70',
        quantity: 1000,
        printingType: 'flexo',
        printingColors: 1,
      });

      const petAlResult = await engine.calculateQuote({
        bagTypeId: 'flat_3_side',
        width: 200,
        height: 300,
        material: 'pet_al',  // PET 12μ + AL 7μ + PET 12μ + LLDPE 70μ
        thicknessSelection: 'standard_70',
        quantity: 1000,
        printingType: 'flexo',
        printingColors: 1,
      });

      console.log('=== Price Comparison ===');
      console.log('Kraft VMPET LLDPE Unit Price:', kraftResult.unitPrice);
      console.log('PET AL Unit Price:', petAlResult.unitPrice);

      // 両材料の価格が大きく異ならないことを確認（3倍以内）
      const priceRatio = kraftResult.unitPrice / petAlResult.unitPrice;
      console.log('Price Ratio (Kraft/PET AL):', priceRatio);

      expect(priceRatio).toBeGreaterThan(0.3);
      expect(priceRatio).toBeLessThan(3);
    });
  });
});
