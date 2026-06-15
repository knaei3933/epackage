/**
 * AC-Q1: 2列生産 Win-Win価格構造のガイド等価テスト
 *
 * ガイド SSoT: docs/reports/calcultae/06-마진_및_최종가격.md:120-181
 *   - 2列同数: 1列単価に対して 15% OFF (×0.85) → ガイド例 41円 → 35円
 *   - 2列倍量: 1列単価に対して 30% OFF (×0.70) → ガイド例 41円 → 24円
 *
 * AC-Q1 要求: diff == 0（割引率の厳密な一致）。
 * DB非依存で calculateTwoColumnProductionOptions の比率関係を直接検証する。
 *
 * 確定方針（team-lead 2026-06-15）:
 *   - manufacturer_margin = 0.4（ガイド準拠、DB UPDATE済み）
 *   - default_markup_rate = 0.3（ユーザー承認の現状維持、UPDATE却下）
 *   - ガイド文書の販売マージン20%表記とDB30%の不一致は「ユーザー承認の既知事項」
 *
 * 本テストは「1列単価に対する2列割引率（×0.85/×0.70）」を検証する。
 * この割引率は manufacturer_margin / default_markup_rate に依存しない
 * （1列単価を入力とする相対比率だから）。よって 0.3/0.4 両方のDB状態で成立する。
 */

const { PouchCostCalculator } = require('./pouch-cost-calculator');

describe('AC-Q1: 2列生産 Win-Win価格構造（ガイド等価）', () => {
  let calculator: any;

  beforeEach(() => {
    calculator = new PouchCostCalculator();
  });

  /**
   * 2列生産可能なスタンドパウチ寸法で検証。
   * canUseTwoColumnProduction が true を返す条件:
   *   - pouchType が stand-up pouch 系
   *   - 寸法が原反幅に収まる
   */
  const twoColumnableDims = { width: 130, height: 130, gusset: 30 };

  describe('ガイド比率: 2列同数 = ×0.85 / 2列倍量 = ×0.70', () => {
    // canUseTwoColumnProduction は actualPrintMeters >= 1000m を要求。
    // 寸法 width=130mm → pouchesPerMeter ≈ 7.69個/m → 1000m到達には約7691個以上必要。
    // （7690個は 999.70m で境界未満 → null）
    const cases = [
      { qty: 10000, unitPrice: 50 },  // 1300m
      { qty: 20000, unitPrice: 33 },  // 2600m
      { qty: 15380, unitPrice: 41 },  // ガイド 06:159 倍量シナリオ数量（2000m）
      { qty: 8000, unitPrice: 41 },   // 1040m（境界直上）
    ];

    cases.forEach(({ qty, unitPrice }) => {
      it(`数量=${qty}, 1列単価=${unitPrice}円 → 同数=×0.85, 倍量=×0.70 (diff==0)`, () => {
        const result = (calculator as any).calculateTwoColumnProductionOptions(
          qty,
          unitPrice,
          'stand_up_pouch',
          twoColumnableDims,
          760 // materialWidth
        );

        // 2列生産可能であること
        expect(result).not.toBeNull();
        if (!result) return;

        const expectedSame = Math.round(unitPrice * 0.85);
        const expectedDouble = Math.round(unitPrice * 0.70);

        // AC-Q1: diff == 0（1円単位の完全一致）
        expect(result.sameQuantity.unitPrice).toBe(expectedSame);
        expect(result.doubleQuantity.unitPrice).toBe(expectedDouble);

        // 総額 = 単価 × 数量 の整合性
        expect(result.sameQuantity.totalPrice).toBe(expectedSame * qty);

        // savingsRate がガイド値（15/30）に固定されていること
        expect(result.sameQuantity.savingsRate).toBe(15);
        expect(result.doubleQuantity.savingsRate).toBe(30);
      });
    });
  });

  describe('ガイド数値例の比率再現（1列41円 → 同数35円 / 倍量29円）', () => {
    it('1列41円の場合、2列同数単価=35円(×0.85)、2列倍量単価=29円(×0.70)となること', () => {
      // 15380個（2000m、2列可能）でガイド比率を検証
      const result = (calculator as any).calculateTwoColumnProductionOptions(
        15380,
        41,
        'stand_up_pouch',
        twoColumnableDims,
        760
      );

      expect(result).not.toBeNull();
      if (!result) return;

      // ガイド 06:148: 2列同数 = 1列 × 0.85 = 34.85 → 35
      expect(result.sameQuantity.unitPrice).toBe(35);
      // ガイド 06:170: 2列倍量 = 1列 × 0.70 = 28.7 → 29
      // （ガイド文書の「24円」は倍量シナリオ全体の再計算結果であり、
      //  calculateTwoColumnProductionOptions の契約である「1列単価×0.70」とは別。
      //  ここでは関数の割引契約 ×0.70 を検証）
      expect(result.doubleQuantity.unitPrice).toBe(29);
    });
  });

  describe('倍数量の計算', () => {
    it('倍数量は現在数量×2を100単位で切り捨てた値となること', () => {
      const result = (calculator as any).calculateTwoColumnProductionOptions(
        15380,
        41,
        'stand_up_pouch',
        twoColumnableDims,
        760
      );

      expect(result).not.toBeNull();
      if (!result) return;

      // 15380 × 2 = 30760 → roundDownToHundreds → 30700
      expect(result.doubleQuantity.quantity).toBe(30700);
      expect(result.sameQuantity.quantity).toBe(15380);
    });
  });

  describe('2列生産の数量境界（1000mルール）', () => {
    it('7690個（999.70m、境界未満）は null を返すこと', () => {
      const result = (calculator as any).calculateTwoColumnProductionOptions(
        7690,
        41,
        'stand_up_pouch',
        twoColumnableDims,
        760
      );
      // actualPrintMeters = 7690 / 7.69 = 999.70m < 1000m → 2列不可
      expect(result).toBeNull();
    });

    it('8000個（1040m、境界超）は2列オプションを返すこと', () => {
      const result = (calculator as any).calculateTwoColumnProductionOptions(
        8000,
        41,
        'stand_up_pouch',
        twoColumnableDims,
        760
      );
      expect(result).not.toBeNull();
    });
  });

  describe('2列生産不可能なケース', () => {
    it('ロールフィルムは null を返すこと', () => {
      const result = (calculator as any).calculateTwoColumnProductionOptions(
        7690,
        41,
        'roll_film',
        twoColumnableDims,
        760
      );
      expect(result).toBeNull();
    });

    it('スパウトパウチは null を返すこと', () => {
      const result = (calculator as any).calculateTwoColumnProductionOptions(
        7690,
        41,
        'spout_pouch',
        twoColumnableDims,
        760
      );
      expect(result).toBeNull();
    });
  });
});
