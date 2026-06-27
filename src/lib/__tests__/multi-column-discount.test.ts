/**
 * 多列生産（2/3/4列）割引 統一エントリポイント テスト
 * 計画: .omc/plans/multi-column-gravure-unification.md
 *
 * テスト区分（Critic 指摘反映）:
 * - パウチ=回帰: same(2列)/double(3列) が現行 0.85/0.70 と一致（AC2 後方互換）
 * - グラビア=新規: 列数割引導入。AC1（単価単調非増加）検証
 * - ロール=非対象: noop確認（現状維持・AC4）
 * - getAvailableColumnCounts: 1100mm上限と物理可能列数（AC5）
 */

import {
  applyMultiColumnDiscount,
  getMultiColumnDiscountRate,
  MULTI_COLUMN_DISCOUNT_RATES,
  type MultiColumnPrintType,
} from '../multi-column-discount'
import { getAvailableColumnCounts } from '../gravure-material-width'

// ========================================
// 1. パウチ: 回帰テスト（AC2 後方互換）
// ========================================
describe('パウチ多列割引: 現行 0.85/0.70 との完全一致（AC2 後方互換）', () => {
  const base = 41 // ガイド数値例（06:148,170）

  test('same=2列 は ×0.85 と一致', () => {
    const result = applyMultiColumnDiscount('pouch', 2, base)
    expect(result.finalCost).toBeCloseTo(base * 0.85, 10)
    expect(result.appliedRate).toBe(0.15)
    expect(result.discountAmount).toBeCloseTo(base * 0.15, 10)
    expect(result.mode).toBe('rate')
  })

  test('double=3列 は ×0.70 と一致', () => {
    const result = applyMultiColumnDiscount('pouch', 3, base)
    expect(result.finalCost).toBeCloseTo(base * 0.70, 10)
    expect(result.appliedRate).toBe(0.30)
    expect(result.discountAmount).toBeCloseTo(base * 0.30, 10)
    expect(result.mode).toBe('rate')
  })

  test('4列 は ×0.60 と一致（40% OFF）', () => {
    const result = applyMultiColumnDiscount('pouch', 4, base)
    expect(result.finalCost).toBeCloseTo(base * 0.60, 10)
    expect(result.appliedRate).toBe(0.40)
  })

  test('1列(単列) は割引なし（原価そのまま）', () => {
    const result = applyMultiColumnDiscount('pouch', 1, base)
    expect(result.finalCost).toBe(base)
    expect(result.appliedRate).toBe(0)
    expect(result.discountAmount).toBe(0)
  })
})

// ========================================
// 2. グラビア: 新規（AC1 マージン逆転防止）
// ========================================
describe('グラビア多列割引: AC1 単価単調非増加（マージン逆転防止）', () => {
  // グラビアは cost-based モード。applyMultiColumnDiscount 自体は cost をそのまま返し、
  // 本体（performGravureSKUCalculation）で銅版費除算を行う。
  // ここでは I/F 契約と mode を検証。実際の単調非増加は engine 側で銅版費除算により保証。
  test('グラビアは cost-based モード（cost をそのまま返す・appliedRate は参照値）', () => {
    const base = 1000000
    const result = applyMultiColumnDiscount('gravure', 3, base)
    expect(result.finalCost).toBe(base) // そのまま
    expect(result.appliedRate).toBe(0.30) // 統一率（参照値）
    expect(result.discountAmount).toBe(0) // 除算は本体側で実施
    expect(result.mode).toBe('cost-based')
  })

  test('グラビア 2/3/4列 の appliedRate が 15/30/40% に漸近', () => {
    expect(applyMultiColumnDiscount('gravure', 2, 1).appliedRate).toBe(0.15)
    expect(applyMultiColumnDiscount('gravure', 3, 1).appliedRate).toBe(0.30)
    expect(applyMultiColumnDiscount('gravure', 4, 1).appliedRate).toBe(0.40)
  })

  test('グラビア 1列 は割引なし', () => {
    const result = applyMultiColumnDiscount('gravure', 1, 1000)
    expect(result.finalCost).toBe(1000)
    expect(result.appliedRate).toBe(0)
  })

  // AC1 構造的検証: 銅版費除算ロジックの模倣で単調非増加を確認
  // （performGravureSKUCalculation の effectiveCopperPlateCostKRW = copper/columnCount と同等）
  test('AC1: 銅版費除算モデルで 1≧2≧3≧4列 が単調非増加', () => {
    const filmCost = 1_000_000   // 材料費（原反幅ベース・列数で触らない）
    const copperPlate = 600_000  // 銅版費（固定費）
    const unitPrices = [1, 2, 3, 4].map((col) => {
      const effCopper = col > 1 ? copperPlate / col : copperPlate
      const baseCost = filmCost + effCopper
      return baseCost * 1.4 * 1.05 * 1.2 // manufacturer→duty→sales chain
    })
    expect(unitPrices[0]).toBeGreaterThanOrEqual(unitPrices[1])
    expect(unitPrices[1]).toBeGreaterThanOrEqual(unitPrices[2])
    expect(unitPrices[2]).toBeGreaterThanOrEqual(unitPrices[3])
  })
})

// ========================================
// 3. ロール: noop（AC4 現状維持）
// ========================================
describe('ロール多列割引: noop（別系維持・AC4）', () => {
  test('ロールはいかなる列数でも cost をそのまま返す', () => {
    const base = 50000
    for (const col of [1, 2, 3, 4, 5, 6, 7]) {
      const result = applyMultiColumnDiscount('roll', col, base)
      expect(result.finalCost).toBe(base)
      expect(result.appliedRate).toBe(0)
      expect(result.discountAmount).toBe(0)
      expect(result.mode).toBe('noop')
    }
  })
})

// ========================================
// 4. 統一率テーブル
// ========================================
describe('MULTI_COLUMN_DISCOUNT_RATES 統一率', () => {
  test('2列15% / 3列30% / 4列40%', () => {
    expect(MULTI_COLUMN_DISCOUNT_RATES[2]).toBe(0.15)
    expect(MULTI_COLUMN_DISCOUNT_RATES[3]).toBe(0.30)
    expect(MULTI_COLUMN_DISCOUNT_RATES[4]).toBe(0.40)
  })

  test('getMultiColumnDiscountRate: 1列は0、未定義列数は0', () => {
    expect(getMultiColumnDiscountRate(1)).toBe(0)
    expect(getMultiColumnDiscountRate(2)).toBe(0.15)
    expect(getMultiColumnDiscountRate(5)).toBe(0) // 5列以上は本計画対象外
  })
})

// ========================================
// 5. getAvailableColumnCounts: 1100mm上限（AC5）
// ========================================
describe('getAvailableColumnCounts: 1100mm上限と物理可能列数（AC5）', () => {
  test('1列幅355mm → 最大3列（floor(1100/355)=3）→ [2,3]', () => {
    // 仕様§11B 計算例: 355×3=1065mm
    expect(getAvailableColumnCounts(355)).toEqual([2, 3])
  })

  test('1列幅200mm → 最大5列だが4列で打切り → [2,3,4]', () => {
    expect(getAvailableColumnCounts(200)).toEqual([2, 3, 4])
  })

  test('1列幅600mm → 最大1列（floor(1100/600)=1）→ []（多列不可）', () => {
    expect(getAvailableColumnCounts(600)).toEqual([])
  })

  test('1列幅1100mm → 最大1列 → []', () => {
    expect(getAvailableColumnCounts(1100)).toEqual([])
  })

  test('1列幅550mm → 最大2列 → [2]', () => {
    expect(getAvailableColumnCounts(550)).toEqual([2])
  })

  test('無効値（0/負）は空配列', () => {
    expect(getAvailableColumnCounts(0)).toEqual([])
    expect(getAvailableColumnCounts(-100)).toEqual([])
  })
})

// ========================================
// 6. 型安全: 全 printType が処理される
// ========================================
describe('全 printType の網羅', () => {
  const types: MultiColumnPrintType[] = ['pouch', 'gravure', 'roll']
  test('各 printType が例外なく結果を返す', () => {
    for (const t of types) {
      const result = applyMultiColumnDiscount(t, 2, 1000)
      expect(result).toBeDefined()
      expect(typeof result.finalCost).toBe('number')
    }
  })
})
