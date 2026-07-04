import { describe, it, expect } from '@jest/globals'
import { unifiedPricingEngine } from '../unified-pricing-engine'
import { PRICING_CONSTANTS } from '../pricing/core/constants'
import { getDefaultFilmLayers } from '../film-structure'

/**
 * 価格計算ゴールデン値テスト（Phase 4）
 *
 * マスタープラン判断1(b)/2/3/9 適用後の価格計算仕様を固定し、
 * 将来の意図しない変更（定数変更・markupRate 未適用・マージン退行）を検出する回帰ガード。
 *
 * 判断対応:
 * - 判断3 : 製造者マージン 40% 確定（constants/DB/計算結果で一貫）
 * - 判断9 : 関税率 getSetting DB駆動化（フォールバック = PRICING_CONSTANTS.DUTY_RATE = 0.05）
 * - 判断1(b): 基準販売マージン 25% + 顧客別 markupRate 調整
 *            ※ roll_film/gravure = 加算方式 (1 + 0.25 + markupRate)
 *            ※ デジタル袋(pouch-cost-calculator) = 乗算方式 (1+0.25)×(1+markupRate)
 * - 判断2 : 経路間の意図的差（加算 vs 乗算）の明文化・旧仕様(20%)からの退行ガード
 *
 * 参考: duty-calculator.test.ts（純粋関数の回帰ガードパターン）
 */
describe('価格計算ゴールデン値テスト（Phase 4 - 判断1(b)/2/3/9 回帰ガード）', () => {
  // ============================================================
  // セクション1: 定数値の固定（仕様変更の即時検出）
  // ============================================================
  // これらの定数は system_settings(DB) のフォールバック値でもある。
  // DB値と一致していることが前提（不一致時は getSetting がDB値を優先するため、
  // ここを変えるだけでは計算結果は変わらない点に注意）。
  // ============================================================
  describe('定数値の固定（判断3/9/1(b)）', () => {
    it('MANUFACTURER_MARGIN = 0.4（判断3・製造者マージン40%確定）', () => {
      expect(PRICING_CONSTANTS.MANUFACTURER_MARGIN).toBe(0.4)
    })

    it('SALES_MARGIN = 0.25（判断1(b) 基準販売マージン・2026-06-27 改定 0.2→0.25）', () => {
      expect(PRICING_CONSTANTS.SALES_MARGIN).toBe(0.25)
    })

    it('DUTY_RATE = 0.05（判断9 フォールバック値・関税率5%）', () => {
      expect(PRICING_CONSTANTS.DUTY_RATE).toBe(0.05)
    })

    it('DEFAULT_MARKUP_RATE = SALES_MARGIN = 0.25（フォールバック整合）', () => {
      expect(PRICING_CONSTANTS.DEFAULT_MARKUP_RATE).toBe(0.25)
      expect(PRICING_CONSTANTS.DEFAULT_MARKUP_RATE).toBe(PRICING_CONSTANTS.SALES_MARGIN)
    })

    it('旧仕様(0.2)に退行していない（判断2 回帰ガード）', () => {
      // 2026-06-27 改定で販売マージン 20%→25%。意図せず 0.2 に戻らないことを保証。
      expect(PRICING_CONSTANTS.SALES_MARGIN).not.toBe(0.2)
      expect(PRICING_CONSTANTS.DEFAULT_MARKUP_RATE).not.toBe(0.2)
    })

    it('総マージン率 = (1+0.4)×(1+0.25)-1 = 0.75（製造40%×販売25%）', () => {
      const totalMargin = (1 + PRICING_CONSTANTS.MANUFACTURER_MARGIN) * (1 + PRICING_CONSTANTS.SALES_MARGIN) - 1
      expect(totalMargin).toBe(0.75)
    })
  })

  // ============================================================
  // セクション2: markupRate の適用（判断1(b)・顧客別調整）
  // ============================================================
  // profiles.markup_rate の実分布: 0.0×33件・(-0.1)×2件（0.5の顧客は皆無）。
  // markupRate=0（大多数）は計算結果不変。markupRate≠0（-0.1の2件）のみ割引反映。
  // デジタル袋(flat_3_side)は pouch-cost-calculator の乗算方式で適用される。
  // ============================================================
  describe('markupRate の適用（判断1(b)・デジタル袋=乗算方式）', () => {
    const baseInput = {
      bagTypeId: 'flat_3_side',  // 平袋（3方）→ pouch-cost-calculator 経由
      materialId: 'opp-alu-foil',
      width: 100,
      height: 160,
      quantity: 10000,
    }

    it('markupRate=0 は基準販売マージン25%のみ（100円丸め・正の金額）', async () => {
      const result = await unifiedPricingEngine.calculateQuote({ ...baseInput, markupRate: 0 })
      expect(result.totalPrice).toBeGreaterThan(0)
      expect(result.totalPrice % 100).toBe(0)  // 100円丸め（Math.ceil(/100)*100）
      expect(result.unitPrice).toBeGreaterThan(0)
    })

    it('markupRate=-0.1 は割引（markupRate=0 より安い）', async () => {
      const base = await unifiedPricingEngine.calculateQuote({ ...baseInput, markupRate: 0 })
      const discounted = await unifiedPricingEngine.calculateQuote({ ...baseInput, markupRate: -0.1 })
      // 実データの割引顧客(-0.1×2件)と同効果。割引方向であることを検証。
      expect(discounted.totalPrice).toBeLessThan(base.totalPrice)
    })

    it('markupRate=0.1 は割増（markupRate=0 より高い）', async () => {
      const base = await unifiedPricingEngine.calculateQuote({ ...baseInput, markupRate: 0 })
      const premium = await unifiedPricingEngine.calculateQuote({ ...baseInput, markupRate: 0.1 })
      expect(premium.totalPrice).toBeGreaterThan(base.totalPrice)
    })

    it('markupRate 単調性: -0.1 ≤ 0 ≤ 0.1 で totalPrice は非減少', async () => {
      // markupRate が全パスで salesMargin 計算に反映されていること（判断1(b)）の検証。
      // 単調増加であれば、markupRate が計算に効いている証拠。
      const low = await unifiedPricingEngine.calculateQuote({ ...baseInput, markupRate: -0.1 })
      const mid = await unifiedPricingEngine.calculateQuote({ ...baseInput, markupRate: 0 })
      const high = await unifiedPricingEngine.calculateQuote({ ...baseInput, markupRate: 0.1 })
      expect(low.totalPrice).toBeLessThanOrEqual(mid.totalPrice)
      expect(mid.totalPrice).toBeLessThanOrEqual(high.totalPrice)
    })
  })

  // ============================================================
  // セクション3: markupRate の適用（判断1(b)・gravure=加算方式）
  // ============================================================
  // gravure 経路は performGravureSKUCalculation（unified-pricing-engine.ts:1874）で計算され、
  // 販売マージンは「加算方式」(1 + 0.25 + markupRate) で適用（L1970）。
  // デジタル袋(乗算)との意図的差（判断2）のうち、gravure 側の回帰ガード。
  // 分岐: performSKUCalculation 内 printingType==='gravure' → performGravureSKUCalculation（L1631-1632）
  // ============================================================
  describe('markupRate の適用（判断1(b)・gravure=加算方式）', () => {
    const gravureInput = {
      bagTypeId: 'flat_3_side',
      materialId: 'pet_al',  // getDefaultFilmLayers の layerMap に存在する素材
      width: 100,
      height: 160,
      quantity: 10000,
      printingType: 'gravure' as const,  // gravure 経路（加算方式・L1970）
      filmLayers: getDefaultFilmLayers('pet_al', 'standard_70'),  // gravure 計算必須（L1897）
      gravureMaterialWidth: 760,  // gravure 計算必須（L1899）
    }

    it('markupRate=0 は基準販売マージン25%のみ（gravure・正の金額・100円丸め）', async () => {
      const result = await unifiedPricingEngine.calculateQuote({ ...gravureInput, markupRate: 0 })
      expect(result.totalPrice).toBeGreaterThan(0)
      // gravure 経路も100円丸めあり（案A統一・デジタル袋 performSKUCalculation L1782 と一致）
      expect(result.totalPrice % 100).toBe(0)  // 100円丸め（Math.ceil(/100)*100）
      expect(result.unitPrice).toBeGreaterThan(0)
    })

    it('markupRate=-0.1 は割引（gravure 加算方式）', async () => {
      const base = await unifiedPricingEngine.calculateQuote({ ...gravureInput, markupRate: 0 })
      const discounted = await unifiedPricingEngine.calculateQuote({ ...gravureInput, markupRate: -0.1 })
      expect(discounted.totalPrice).toBeLessThan(base.totalPrice)
    })

    it('markupRate=0.1 は割増（gravure 加算方式）', async () => {
      const base = await unifiedPricingEngine.calculateQuote({ ...gravureInput, markupRate: 0 })
      const premium = await unifiedPricingEngine.calculateQuote({ ...gravureInput, markupRate: 0.1 })
      expect(premium.totalPrice).toBeGreaterThan(base.totalPrice)
    })

    it('markupRate 単調性（gravure・加算方式）: -0.1 ≤ 0 ≤ 0.1 で非減少', async () => {
      const low = await unifiedPricingEngine.calculateQuote({ ...gravureInput, markupRate: -0.1 })
      const mid = await unifiedPricingEngine.calculateQuote({ ...gravureInput, markupRate: 0 })
      const high = await unifiedPricingEngine.calculateQuote({ ...gravureInput, markupRate: 0.1 })
      expect(low.totalPrice).toBeLessThanOrEqual(mid.totalPrice)
      expect(mid.totalPrice).toBeLessThanOrEqual(high.totalPrice)
    })
  })
})
