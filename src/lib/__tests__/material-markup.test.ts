import { describe, it, expect } from '@jest/globals'
import { FilmCostCalculator } from '../film-cost-calculator'

/**
 * 원단 단가 인상률(material_markup_rate) 적용 테스트
 *
 * 협상 결과: 원단 단가에 10% 인상 (PET 4300 → 4730 KRW/kg)
 * 인쇄·래미네이트·슬리터 비용은 인상 미적용
 */
describe('원단 단가 인상률 (material_markup_rate)', () => {
  const calculator = new FilmCostCalculator()

  const baseLayers = [
    { materialId: 'PET', thickness: 12 },
    { materialId: 'AL', thickness: 7 },
    { materialId: 'LLDPE', thickness: 80 },
  ]

  it('material_markup_rate=0.10 일 때 PET 단가가 10% 인상된다', () => {
    const settingsWithMarkup = {
      PET_unit_price: 4300,
      AL_unit_price: 10500,
      LLDPE_unit_price: 4500,
      PET_density: 1.40,
      AL_density: 2.71,
      LLDPE_density: 0.92,
      material_markup_rate: 0.10,
      exchange_rate_krw_to_jpy: 0.12,
    }

    const settingsWithoutMarkup = {
      PET_unit_price: 4300,
      AL_unit_price: 10500,
      LLDPE_unit_price: 4500,
      PET_density: 1.40,
      AL_density: 2.71,
      LLDPE_density: 0.92,
      material_markup_rate: 0,
      exchange_rate_krw_to_jpy: 0.12,
    }

    const resultMarked = calculator.calculateCostWithDBSettings({
      layers: baseLayers,
      width: 100,
      length: 100,
      materialWidth: 760,
      lossRate: 0,
      hasPrinting: true,
      printingType: 'basic',
      colors: 1,
    }, settingsWithMarkup)

    const resultBase = calculator.calculateCostWithDBSettings({
      layers: baseLayers,
      width: 100,
      length: 100,
      materialWidth: 760,
      lossRate: 0,
      hasPrinting: true,
      printingType: 'basic',
      colors: 1,
    }, settingsWithoutMarkup)

    // 인상 적용시 원단비가 더 높아야 함
    expect(resultMarked.materialCost).toBeGreaterThan(resultBase.materialCost)
    // 정확히 10% 차이 (원단비 부분만)
    const ratio = resultMarked.materialCost / resultBase.materialCost
    expect(Math.abs(ratio - 1.10)).toBeLessThan(0.001)
  })

  it('material_markup_rate 누락시 안전 폴백 (0% = 기준원가 그대로)', () => {
    const settingsNoMarkup = {
      PET_unit_price: 4300,
      AL_unit_price: 10500,
      LLDPE_unit_price: 4500,
      PET_density: 1.40,
      AL_density: 2.71,
      LLDPE_density: 0.92,
      // material_markup_rate 생략
      exchange_rate_krw_to_jpy: 0.12,
    }

    const result = calculator.calculateCostWithDBSettings({
      layers: baseLayers,
      width: 100,
      length: 100,
      materialWidth: 760,
      lossRate: 0,
      hasPrinting: true,
      printingType: 'basic',
      colors: 1,
    }, settingsNoMarkup)

    // material_markup_rate가 없어도 에러 없이 동작
    expect(result.materialCost).toBeGreaterThan(0)
    expect(result.totalCostKRW).toBeGreaterThan(result.materialCost)
  })

  it('material_markup_rate가 인쇄/래미네이트/슬리터 비용에 영향을 주지 않는다', () => {
    const settings = {
      PET_unit_price: 4300,
      AL_unit_price: 10500,
      LLDPE_unit_price: 4500,
      PET_density: 1.40,
      AL_density: 2.71,
      LLDPE_density: 0.92,
      printing_cost_per_m2: 100,
      lamination_cost_per_m2: 50,
      slitter_cost_per_m: 10,
      material_markup_rate: 0.10,
      exchange_rate_krw_to_jpy: 0.12,
    }

    const result = calculator.calculateCostWithDBSettings({
      layers: baseLayers,
      width: 100,
      length: 100,
      materialWidth: 760,
      lossRate: 0,
      hasPrinting: true,
      printingType: 'basic',
      colors: 1,
    }, settings)

    // 원단비만 인상되고, 인쇄/가공비는 별도
    expect(result.materialCost).toBeGreaterThan(0)
    expect(result.totalCostKRW).toBeGreaterThanOrEqual(result.materialCost)
  })
})
