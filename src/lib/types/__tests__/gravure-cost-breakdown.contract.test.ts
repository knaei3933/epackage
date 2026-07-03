/**
 * Phase 4a: cost_breakdown JSONB 契約のコンパイル時検証
 *
 * このファイルは実行時テストではなく、コンパイル時の型検証を目的とする。
 * `performGravureSKUCalculation` が構築する breakdown が GravureCostBreakdown 契約に
 * 違反していないことを静的に保証する（tsc --noEmit で検証）。
 *
 * Phase 1c の breakdown 構造が変更された場合、本ファイルのコンパイルが失敗し
 * 契約ドリフトを検出できる。
 */

import type { UnifiedQuoteResult } from '../../unified-pricing-engine'
import type {
  GravureCostBreakdown,
  GravureFilmValueBreakdownKRW,
} from '../gravure-cost-breakdown'
import { isGravureCostBreakdown } from '../gravure-cost-breakdown'

/**
 * アサーション1: UnifiedQuoteResult.breakdown は GravureCostBreakdown に割当可能
 *
 * 構造的部分型: UnifiedQuoteResult.breakdown の全フィールドが
 * GravureCostBreakdown の対応フィールドと型互換であることを保証。
 * performGravureSKUCalculation が返す breakdown は本契約のスーパーセットであること。
 */
type AssertBreakdownAssignableToContract = UnifiedQuoteResult['breakdown'] extends GravureCostBreakdown
  ? true
  : never

// コンパイル時アサーション（実行時には影響しない）
const _assert1: AssertBreakdownAssignableToContract = true

/**
 * アサーション2: GravureFilmValueBreakdownKRW は gravure-cost-calculator.ts の
 * calculateGravureFilmValue 戻り型と構造一致
 *
 * gravure-cost-calculator.ts は { materialCost, printingCost, laminationCost, total } を返す。
 * 本契約型とフィールド名・型が一致することを保証。
 */
type AssertFilmValueShape = GravureFilmValueBreakdownKRW extends {
  materialCost: number
  printingCost: number
  laminationCost: number
  total: number
}
  ? true
  : never

const _assert2: AssertFilmValueShape = true

/**
 * 実行時ユニット: 型ガード isGravureCostBreakdown の基本動作確認
 * （JSONB 読込パスで使用される関数の動作保証）
 */
describe('Phase 4a: GravureCostBreakdown 契約', () => {
  describe('isGravureCostBreakdown 型ガード', () => {
    it('判別子 gravureFilmValueKRW を持つオブジェクトをグラビア契約と判定', () => {
      const breakdown = {
        material: 334000,
        gravureFilmValueKRW: 3260000,
        gravureMaterialCostKRW: 2784864,
        total: 864000,
      }
      expect(isGravureCostBreakdown(breakdown)).toBe(true)
    })

    it('判別子なしのオブジェクト（デジタル breakdown）を非グラビアと判定', () => {
      const digitalBreakdown = {
        material: 100000,
        processing: 50000,
        printing: 30000,
        setup: 0,
        discount: 0,
        delivery: 1500,
        subtotal: 200000,
        total: 240000,
      }
      expect(isGravureCostBreakdown(digitalBreakdown)).toBe(false)
    })

    it('null/undefined/primitive を非グラビアと判定（安全なフォールバック）', () => {
      expect(isGravureCostBreakdown(null)).toBe(false)
      expect(isGravureCostBreakdown(undefined)).toBe(false)
      expect(isGravureCostBreakdown('string')).toBe(false)
      expect(isGravureCostBreakdown(123)).toBe(false)
    })
  })

  describe('契約フィールドの存在保証（Phase 4b 実装前の固定）', () => {
    it('GravureCostBreakdown に必須フィールド material/processing/printing/setup/discount/delivery/subtotal/total が存在', () => {
      // このテストは実行時検証ではなく、コンパイル時の型構造ドキュメント。
      // 実際の型保証は _assert1 のコンパイル時チェックで行う。
      const sample: GravureCostBreakdown = {
        material: 0,
        processing: 0,
        printing: 0,
        setup: 0,
        discount: 0,
        delivery: 0,
        subtotal: 0,
        total: 0,
      }
      // オプショナルフィールドの存在も確認（型レベル）
      const withGravureFields: GravureCostBreakdown = {
        ...sample,
        gravureFilmValueKRW: 0,
        gravureMaterialCostKRW: 0,
        gravurePrintingCostKRW: 0,
        gravureLaminationCostKRW: 0,
        gravureCopperPlateCostKRW: 0,
        gravureProductionMeters: 6000,
        gravureMaterialWidthMM: 740,
      }
      expect(withGravureFields.gravureFilmValueKRW).toBe(0)
      expect(sample.total).toBe(0)
    })
  })
})
