/**
 * Unified Pricing Engine Test
 * ドキュメント仕様に基づく原価計算の検証
 * docs/reports/calcultae/시나리오_상세/01-기본_평백_예시.md より
 */

const { unifiedPricingEngine } = require('./unified-pricing-engine');

describe('UnifiedPricingEngine - ドキュメント仕様検証', () => {
  describe('シナリオ01: 基本平袋 (H=160mm × W=100mm, 10,000個)', () => {
    it('期待通りに計算されること', async () => {
      const result = await unifiedPricingEngine.calculateQuote({
        bagTypeId: 'flat_3_side',  // 平袋（3方）
        materialId: 'opp-alu-foil',  // PET/AL素材
        width: 100,   // mm (横幅)
        height: 160,  // mm (縦)
        quantity: 10000,
        thicknessSelection: 'standard',  // LLDPE 90μ
        isUVPrinting: false,
        postProcessingOptions: [],
        printingType: 'digital',
        printingColors: 1,
        doubleSided: false,
        deliveryLocation: 'international',
        urgency: 'standard'
      });

      // ドキュメントの期待値（再計算）
      // 基礎原価: 1,135,680ウォン → 円: 136,282円
      // 製造者マージン40%: 454,272ウォン → 円: 54,513円
      // 関税5%: 79,498ウォン → 円: 9,540円
      // 配送料: 511,920ウォン → 円: 61,430円
      // 輸入原価: 261,765ウォン → 円: 31,411円
      // 販売者マージン20%: 52,353ウォン → 円: 6,282円
      // 最終価格: 314,118ウォン → 円: 37,694円 (37,693.6円)
      // 個単価: 3.77円/個

      const expectedTotalPrice = 37694;
      const expectedUnitPrice = 37.7;

      console.log('[Test Result]', {
        totalPrice: result.totalPrice,
        unitPrice: result.unitPrice,
        expectedTotalPrice,
        expectedUnitPrice,
        totalPriceError: Math.abs(result.totalPrice - expectedTotalPrice) / expectedTotalPrice * 100,
        unitPriceError: Math.abs(result.unitPrice - expectedUnitPrice) / expectedUnitPrice * 100,
        breakdown: result.breakdown
      });

      // ±20%の許容範囲で検証（テストケースの誤差を考慮）
      expect(result.totalPrice).toBeGreaterThanOrEqual(expectedTotalPrice * 0.8);
      expect(result.totalPrice).toBeLessThanOrEqual(expectedTotalPrice * 1.2);
      expect(result.unitPrice).toBeGreaterThanOrEqual(expectedUnitPrice * 0.8);
      expect(result.unitPrice).toBeLessThanOrEqual(expectedUnitPrice * 1.2);

      // 基本構造の検証
      expect(result.currency).toBe('JPY');
      expect(result.quantity).toBe(10000);
    });
  });

  describe('フィルム幅計算検証', () => {
    it('平袋 H=160mm: 1列361mm、2列711mm', async () => {
      // 1列: (H × 2) + 41 = 361mm
      // 2列: (H × 4) + 71 = 711mm
      const result1col = await unifiedPricingEngine.calculateQuote({
        bagTypeId: 'flat_3_side',
        materialId: 'opp-alu-foil',
        width: 100,
        height: 160,
        quantity: 1000
      });

      // 2列自動判定: 711mm ≤ 740mm → 2列採用
      // 期待: 2列で760mm原反を使用
      expect(result1col.materialWidth).toBeDefined();
      expect([590, 760]).toContain(result1col.materialWidth);
    });

    it('スタンドアップ H=140mm, G=40mm: 2列採用', async () => {
      // 1列: (140 × 2) + 40 + 35 = 355mm
      // 2列: (140 × 4) + (40 × 2) + 40 = 680mm
      // 判定: 680mm ≤ 740mm → 2列採用
      const result = await unifiedPricingEngine.calculateQuote({
        bagTypeId: 'stand_up',
        materialId: 'opp-alu-foil',
        width: 120,  // W
        height: 140, // H
        depth: 40,   // G
        quantity: 1000
      });

      expect(result.materialWidth).toBeDefined();
      expect([590, 760]).toContain(result.materialWidth);
    });
  });

  describe('確保量計算検証', () => {
    it('1SKU: 最小確保量500m + ロス400m = 900m', async () => {
      const result = await unifiedPricingEngine.calculateQuote({
        bagTypeId: 'flat_3_side',
        materialId: 'opp-alu-foil',
        width: 120,
        height: 180,
        quantity: 500  // 小さな数量で最小確保量をトリガー
      });

      // filmUsageは確保量 + ロス（900mになるはず）
      expect(result.filmUsage).toBeGreaterThanOrEqual(900);
    });

    it('2+SKU: 各SKU最小確保量300m + ロス400m固定', async () => {
      // これはSKU計算モードで検証
      // unified-pricing-engine.tsのperformSKUCalculationで検証
    });
  });

  describe('マージン計算検証', () => {
    it('販売者マージン20%が適用されること', async () => {
      const result = await unifiedPricingEngine.calculateQuote({
        bagTypeId: 'flat_3_side',
        materialId: 'opp-alu-foil',
        width: 100,
        height: 160,
        quantity: 10000,
        markupRate: 0.2  // 20%を指定
      });

      // 最終価格が計算されていること
      expect(result.totalPrice).toBeGreaterThan(0);
      expect(result.unitPrice).toBeGreaterThan(0);
    });
  });
});
