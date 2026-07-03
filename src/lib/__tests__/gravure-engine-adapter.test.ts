/**
 * Phase 1c アダプタ検証テスト
 * グラビアブランチ到達（printingType='gravure'）とデジタル後方互換性を担保。
 *
 * ※ UnifiedPricingEngine は DB(Supabase) 依存の getSetting を持つため、
 *   純粋な金額計算は gravure-cost-calculator.test.ts / verify-gravure-phase1c.ts で検証済み。
 *   本テストは「グラビアブランチへの到達（必須パラメータガード）」で
 *   アダプタ分岐が正しく実装されていることを保証する。
 */

const { unifiedPricingEngine } = require('../unified-pricing-engine')

describe('Phase 1c: グラビアアダプタブランチ到達', () => {
  test('printingType=gravure で gravureMaterialWidth 未指定時にエラー（ブランチ到達証明）', async () => {
    await expect(
      unifiedPricingEngine.calculateQuote({
        bagTypeId: 'flat_3_side',
        materialId: 'pet_al',
        width: 100,
        height: 160,
        quantity: 10000,
        printingType: 'gravure',
        printingColors: 3,
        filmLayers: [
          { materialId: 'PET', thickness: 12 },
          { materialId: 'AL', thickness: 7 },
          { materialId: 'LLDPE', thickness: 50 },
        ],
        // gravureMaterialWidth 意図的省略
      } as any)
    ).rejects.toThrow(/gravureMaterialWidth/)
  })

  test('printingType=gravure で filmLayers 未指定時にエラー（ブランチ到達証明）', async () => {
    await expect(
      unifiedPricingEngine.calculateQuote({
        bagTypeId: 'flat_3_side',
        materialId: 'pet_al',
        width: 100,
        height: 160,
        quantity: 10000,
        printingType: 'gravure',
        printingColors: 3,
        gravureMaterialWidth: 740,
        // filmLayers 意図的省略
      } as any)
    ).rejects.toThrow(/filmLayers/)
  })
})

describe('Phase 1c: デジタル後方互換性（ガード確認）', () => {
  test('printingType 未指定(undefined) はグラビアブランチに到達しない', async () => {
    // デジタル既定経路は pouch-cost-calculator を経由するが、
    // このテストでは「グラビア必須エラーが投げられないこと」のみ検証。
    // pouch-cost-calculator が filmLayers を要求する場合は別のエラーになるが、
    // グラビア専用エラー（gravureMaterialWidth等）でなければ後方互換性は保たれている。
    try {
      await unifiedPricingEngine.calculateQuote({
        bagTypeId: 'flat_3_side',
        materialId: 'opp-alu-foil',
        width: 100,
        height: 160,
        quantity: 10000,
        thicknessSelection: 'standard',
        // printingType 省略 = undefined
        printingColors: 1,
        deliveryLocation: 'international',
      } as any)
      // 計算成功でもエラーでも、グラビアエラーでなければOK
    } catch (e: any) {
      expect(e.message).not.toMatch(/gravureMaterialWidth|グラビア計算には/)
    }
  })

  test('printingType=digital はグラビアブランチに到達しない', async () => {
    try {
      await unifiedPricingEngine.calculateQuote({
        bagTypeId: 'flat_3_side',
        materialId: 'opp-alu-foil',
        width: 100,
        height: 160,
        quantity: 10000,
        thicknessSelection: 'standard',
        printingType: 'digital',
        printingColors: 1,
        deliveryLocation: 'international',
      } as any)
    } catch (e: any) {
      expect(e.message).not.toMatch(/gravureMaterialWidth|グラビア計算には/)
    }
  })
})
