/**
 * Phase 1b: 円変換集約層の後方互換性テスト（AC-22）
 *
 * 仕様 gravure-integration-consensus.md AC-22「円変換は集約レイヤーで統一」の検証。
 * 従来コード内に散在した `* 0.12` を convertKRWtoJPY(krw) に集約したが、
 * 計算結果が数学的に完全一致（後方互換性）することを保証する。
 *
 * 後方互換性の論理:
 *   従来: value_KRW * 0.12
 *   新規: convertKRWtoJPY(value_KRW) = value_KRW * PRICING_CONSTANTS.EXCHANGE_RATE_KRW_TO_JPY
 *   PRICING_CONSTANTS.EXCHANGE_RATE_KRW_TO_JPY === 0.12 である限り完全一致。
 */

const { PRICING_CONSTANTS } = require('../pricing/core/constants')
const { convertKRWtoJPY } = require('../unified-pricing-engine')

describe('Phase 1b: convertKRWtoJPY 集約ヘルパー（AC-22）', () => {
  describe('SSoT 定数の不変性', () => {
    it('EXCHANGE_RATE_KRW_TO_JPY が 0.12 であること（従来値と一致）', () => {
      // この値が変わらない限り、全計算パスの円貨値は従来と完全一致する。
      expect(PRICING_CONSTANTS.EXCHANGE_RATE_KRW_TO_JPY).toBe(0.12)
    })
  })

  describe('従来 `* 0.12` との数学的完全一致（後方互換性）', () => {
    // 実際の見積もり計算で現れるウォン金額の代表値を網羅。
    // 各値について `convertKRWtoJPY(x) === x * 0.12` を検証。
    const sampleKrwValues: Array<{ name: string; krw: number }> = [
      { name: '小額（マット費相当）', krw: 11800 },          // 0.59 * 40 * 500
      { name: '中額（スリッター最小）', krw: 30000 },        // MAX(30000, ...)
      { name: '材料費（例）', krw: 1135680 },                // ドキュメント基礎原価
      { name: '配送費（1箱）', krw: 127980 },                // DELIVERY_COST_PER_BOX_KRW
      { name: 'ラミネート費（例）', krw: 5000000 },
      { name: '大額（グラビア原価想定）', krw: 100000000 },   // 1億ウォン
      { name: 'ゼロ', krw: 0 },
      { name: '端数', krw: 1234567 },
    ]

    for (const { name, krw } of sampleKrwValues) {
      it(`"${name}" (krw=${krw}): convertKRWtoJPY === krw * 0.12`, () => {
        const legacy = krw * 0.12
        const refactored = convertKRWtoJPY(krw)
        // 浮動小数点の完全同一性を検証（同一演算なので === で成立）
        expect(refactored).toBe(legacy)
        // ゼロ除算等の異常がないことも確認
        expect(Number.isFinite(refactored)).toBe(true)
      })
    }
  })

  describe('単調増加性（為替の正確性）', () => {
    it('ウォンが大きいほど円も大きいこと（比例関係の維持）', () => {
      const small = convertKRWtoJPY(100000)
      const large = convertKRWtoJPY(1000000)
      expect(large).toBeGreaterThan(small)
      // 比例: 10倍のウォンは10倍の円
      expect(large / small).toBeCloseTo(10, 10)
    })
  })
})
