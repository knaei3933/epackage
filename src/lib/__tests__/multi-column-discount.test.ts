/**
 * 多列生産（2〜7列）割引 統一エントリポイント テスト
 * 計画: .omc/plans/multi-column-gravure-unification.md
 *
 * テスト区分（Critic 指摘反映）:
 * - パウチ=回帰: same(2列)/double(3列) が現行 0.85/0.70 と一致（AC2 後方互換）
 * - グラビア=新規: 列数割引導入。AC1（単価単調非増加）検証
 * - ロール=非対象: noop確認（現状維持・AC4）
 * - getAvailableColumnCounts: 最大幅上限と物理可能列数（AC5）
 *
 * 2026-06-28 改定（C2）: 5/6/7 列追加・4列打ち切り廃止。
 *   列数 = floor(maxWidthMm ÷ 1列幅)。納品形態別上限は maxColumnsCap 引数で指定。
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

  test('グラビア 2〜7列 の appliedRate が 15/30/40/45/50/55% に漸近', () => {
    expect(applyMultiColumnDiscount('gravure', 2, 1).appliedRate).toBe(0.15)
    expect(applyMultiColumnDiscount('gravure', 3, 1).appliedRate).toBe(0.30)
    expect(applyMultiColumnDiscount('gravure', 4, 1).appliedRate).toBe(0.40)
    expect(applyMultiColumnDiscount('gravure', 5, 1).appliedRate).toBe(0.45)
    expect(applyMultiColumnDiscount('gravure', 6, 1).appliedRate).toBe(0.50)
    expect(applyMultiColumnDiscount('gravure', 7, 1).appliedRate).toBe(0.55)
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
  test('2列15% / 3列30% / 4列40% / 5列45% / 6列50% / 7列55%', () => {
    expect(MULTI_COLUMN_DISCOUNT_RATES[2]).toBe(0.15)
    expect(MULTI_COLUMN_DISCOUNT_RATES[3]).toBe(0.30)
    expect(MULTI_COLUMN_DISCOUNT_RATES[4]).toBe(0.40)
    expect(MULTI_COLUMN_DISCOUNT_RATES[5]).toBe(0.45)
    expect(MULTI_COLUMN_DISCOUNT_RATES[6]).toBe(0.50)
    expect(MULTI_COLUMN_DISCOUNT_RATES[7]).toBe(0.55)
  })

  test('getMultiColumnDiscountRate: 1列は0、8列以上(未定義)は0', () => {
    expect(getMultiColumnDiscountRate(1)).toBe(0)
    expect(getMultiColumnDiscountRate(2)).toBe(0.15)
    expect(getMultiColumnDiscountRate(5)).toBe(0.45) // C2改定: 5列は45%
    expect(getMultiColumnDiscountRate(7)).toBe(0.55) // C2改定: 7列は55%
    expect(getMultiColumnDiscountRate(8)).toBe(0)    // 8列以上は未定義
  })
})

// ========================================
// 5. getAvailableColumnCounts: 最大幅上限と物理可能列数（AC5）
// ========================================
describe('getAvailableColumnCounts: 最大幅上限と物理可能列数（AC5）', () => {
  test('1列幅355mm → 最大3列（floor(1100/355)=3）→ [2,3]', () => {
    // 仕様§11B 計算例: 355×3=1065mm
    expect(getAvailableColumnCounts(355)).toEqual([2, 3])
  })

  test('1列幅200mm → 最大5列（floor(1100/200)=5、cap既定7で打切なし）→ [2,3,4,5]', () => {
    // C2改定: 4列打ち切り廃止。物理可能5列すべて候補
    expect(getAvailableColumnCounts(200)).toEqual([2, 3, 4, 5])
  })

  test('1列幅150mm → 最大7列（floor(1100/150)=7、cap既定7で7止まり）→ [2..7]', () => {
    // C2改定: 物理7列 = cap既定(7) と一致 → [2,3,4,5,6,7]
    expect(getAvailableColumnCounts(150)).toEqual([2, 3, 4, 5, 6, 7])
  })

  test('1列幅100mm → 物理11列だがcap既定7で打切り → [2..7]', () => {
    // floor(1100/100)=11 だが MAX_COLUMN_COUNT(=7) が上限
    expect(getAvailableColumnCounts(100)).toEqual([2, 3, 4, 5, 6, 7])
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

  test('maxWidthMm 引数: デジタル740mm指定時の物理可能列数', () => {
    // デジタル最大幅740mm: 1列幅150mm → floor(740/150)=4 → [2,3,4]
    expect(getAvailableColumnCounts(150, 740)).toEqual([2, 3, 4])
  })

  test('maxColumnsCap 引数: パウチ袋(2列上限)の絞り込み', () => {
    // 物理は5列可能でも、パウチ袋は2列まで（DELIVERY_MAX_COLUMN_COUNT.pouch=2）
    expect(getAvailableColumnCounts(200, 1100, 2)).toEqual([2])
    expect(getAvailableColumnCounts(150, 1100, 2)).toEqual([2])
    // cap=2 でも物理1列（多列不可）なら []
    expect(getAvailableColumnCounts(600, 1100, 2)).toEqual([])
  })

  test('maxColumnsCap 引数: ロール(7列上限)は物理上限いっぱい', () => {
    // DELIVERY_MAX_COLUMN_COUNT.roll=7。物理7列まで候補
    expect(getAvailableColumnCounts(150, 1100, 7)).toEqual([2, 3, 4, 5, 6, 7])
    // 物理5列なら cap=7 でも5止まり
    expect(getAvailableColumnCounts(200, 1100, 7)).toEqual([2, 3, 4, 5])
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
