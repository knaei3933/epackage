/**
 * Phase 1a 単体テスト: グラビア純粋計算モジュール
 * 仕様: docs/gravure-pricing-calculation-formula.md §11 / §11B 計算例
 *
 * 条件（§11）: PET12/AL7/PET12/LLDPE50、3色、製作6,000m、原反幅740mm、2液セミ
 * 期待値: 原材1,654,284 / 印刷253,080 / ラミ877,500 / 原反値2,784,864 / 銅版529,200
 */

import {
  calculateGravureFilmValue,
  calculateCopperPlateCost,
  calculateGravurePrintingCost,
  calculateGravureMaterialCost,
  calculateGravureLaminationCost,
} from '../gravure-cost-calculator'
import { determineGravureMaterialWidth, calculateSingleColumnFilmWidth } from '../gravure-material-width'
import type { FilmStructureLayer } from '../pricing/core/types'

// PET12/AL7/PET12/LLDPE50
const layers: FilmStructureLayer[] = [
  { materialId: 'PET', thickness: 12 },
  { materialId: 'AL', thickness: 7 },
  { materialId: 'PET', thickness: 12 },
  { materialId: 'LLDPE', thickness: 50 }, // 最終熱シール層
]

const MATERIAL_WIDTH_MM = 740
const PRODUCTION_METERS = 6000
const COLORS = 3

describe('グラビア純粋計算 §11 計算例 (PET12/AL7/PET12/LLDPE50, 3色, 6000m, 740mm)', () => {
  test('原材料費 = 1,654,284₫', () => {
    const cost = calculateGravureMaterialCost(layers, MATERIAL_WIDTH_MM, PRODUCTION_METERS)
    expect(cost).toBeCloseTo(1654284, -1)
  })

  test('印刷費 = 253,080₫ (0.74 × 6000 × 3 × 19)', () => {
    const cost = calculateGravurePrintingCost(MATERIAL_WIDTH_MM, PRODUCTION_METERS, COLORS)
    expect(cost).toBeCloseTo(253080, -1)
  })

  test('ラミネート費 = 877,500₫ (最終層幅750mm × 6000 × 3回 × 65)', () => {
    // 最終熱シール層幅 = 740 + 10 = 750mm、層数4 → ラミ3回
    const cost = calculateGravureLaminationCost(750, PRODUCTION_METERS, '2liquid_semi', 4)
    expect(cost).toBeCloseTo(877500, -1)
  })

  test('原反値合計 = 2,784,864₫', () => {
    const filmValue = calculateGravureFilmValue(layers, MATERIAL_WIDTH_MM, PRODUCTION_METERS, COLORS, '2liquid_semi')
    expect(filmValue.total).toBeCloseTo(2784864, -1)
    expect(filmValue.materialCost).toBeCloseTo(1654284, -1)
    expect(filmValue.printingCost).toBeCloseTo(253080, -1)
    expect(filmValue.laminationCost).toBeCloseTo(877500, -1)
  })

  test('銅版費 = 529,200₫ (3色 × 84cm × 50 × 42cm)', () => {
    const cost = calculateCopperPlateCost(COLORS, MATERIAL_WIDTH_MM, false)
    expect(cost).toBeCloseTo(529200, -1)
  })

  test('銅版費: 修正(수정)は単価30 → 317,520₫', () => {
    // 3 × 84 × 30 × 42 = 317,520
    const cost = calculateCopperPlateCost(COLORS, MATERIAL_WIDTH_MM, true)
    expect(cost).toBeCloseTo(317520, -1)
  })
})

describe('グラビア原反幅決定 §11B 計算例 (スタンド H130×W100×G30)', () => {
  test('1列フィルム幅 = (130×2)+(30×2)+35 = 355mm', () => {
    const single = calculateSingleColumnFilmWidth('stand_up', 130, 100, 30)
    expect(single).toBe(355)
  })

  test('原反幅 = 355×3 = 1,065mm（10mm丸めなし）', () => {
    const width = determineGravureMaterialWidth('stand_up', 130, 100, 30)
    expect(width).toBe(1065)
  })

  test('最終熱シール層幅 = 原反幅 + 10 = 1,075mm', () => {
    const width = determineGravureMaterialWidth('stand_up', 130, 100, 30)
    expect(width + 10).toBe(1075)
  })
})

describe('グラビア原反幅 タイプ別公式', () => {
  test('平袋(三封): (H×2)+41', () => {
    expect(calculateSingleColumnFilmWidth('flat_3_side', 150, 100, 0)).toBe(150 * 2 + 41)
  })
  test('合掌(T封): (W×2)+22', () => {
    expect(calculateSingleColumnFilmWidth('t_shape', 150, 60, 0)).toBe(60 * 2 + 22)
  })
  test('ガゼット(M封): (G+W)×2+32', () => {
    expect(calculateSingleColumnFilmWidth('m_shape', 200, 50, 90)).toBe((90 + 50) * 2 + 32)
  })
})

describe('グラビア原反幅 境界値', () => {
  test('1列幅が1,100mm超 → 列数1、原反幅=1列幅（MAX1100でクランプ）', () => {
    // H=600 → 平袋 (600*2)+41 = 1241mm > 1100 → 列数1 → クランプ1100
    const width = determineGravureMaterialWidth('flat_3_side', 600, 100, 0)
    expect(width).toBeLessThanOrEqual(1100)
  })

  test('最小500mm保証（極小パウチ）', () => {
    // H=20 → 平袋 (20*2)+41 = 81mm → 列数13 → 81*13=1053mm（500超）
    const width = determineGravureMaterialWidth('flat_3_side', 20, 30, 0)
    expect(width).toBeGreaterThanOrEqual(500)
  })
})
