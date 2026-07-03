/**
 * materialTypes 平易化ヘルパーのテスト（C3: 見積UI改善・専門用語平易化）
 *
 * 検証対象:
 * - MATERIAL_ABBREVIATION_LEGEND: 素材略号の凡例（μ/PET/AL/LLDPE/NY/VMPET/Kraft）
 * - getLegendForSpecification: 規格文字列から含まれる略号の凡例を抽出
 * - getPlainSpecSummary: 素材IDから平易な一言説明を返す
 */

import {
  MATERIAL_ABBREVIATION_LEGEND,
  getLegendForSpecification,
  getPlainSpecSummary,
  MaterialType,
} from '../materialTypes'

// ========================================
// 1. MATERIAL_ABBREVIATION_LEGEND: 必須略号の網羅
// ========================================
describe('MATERIAL_ABBREVIATION_LEGEND: 素材略号凡例', () => {
  test('顧客が迷いやすい主要略号をすべて網羅', () => {
    const labels = MATERIAL_ABBREVIATION_LEGEND.map((item) => item.label)
    // 仕様書 L64 で明示された略号
    expect(labels).toContain('μ')
    expect(labels).toContain('PET')
    expect(labels).toContain('AL')
    expect(labels).toContain('LLDPE')
    // 他の規格で頻出する略号
    expect(labels).toContain('NY')
    expect(labels).toContain('VMPET')
    expect(labels).toContain('Kraft')
  })

  test('各略号が label / name / description を持つ（description は専門用語を避けた平易な説明）', () => {
    for (const item of MATERIAL_ABBREVIATION_LEGEND) {
      expect(item.label).toBeTruthy()
      expect(item.name).toBeTruthy()
      expect(item.description).toBeTruthy()
      // 説明が空でないこと（顧客向けなので必ず意味がある一文）
      expect(item.description.length).toBeGreaterThan(10)
    }
  })
})

// ========================================
// 2. getLegendForSpecification: 規格文字列からの凡例抽出
// ========================================
describe('getLegendForSpecification: 規格文字列から凡例を抽出', () => {
  test('PET+AL+LLDPE の規格 → 該当3略号を返す', () => {
    const spec = 'PET 12μ + AL 7μ + PET 12μ + LLDPE 50μ'
    const legend = getLegendForSpecification(spec)
    const labels = legend.map((item) => item.label)
    expect(labels).toContain('μ')
    expect(labels).toContain('PET')
    expect(labels).toContain('AL')
    expect(labels).toContain('LLDPE')
  })

  test('VMPET を含む規格 → VMPET を抽出', () => {
    const spec = 'PET 12μ + VMPET12μ + PET 12μ + LLDPE 50μ'
    const legend = getLegendForSpecification(spec)
    expect(legend.map((item) => item.label)).toContain('VMPET')
  })

  test('NY を含む規格 → NY を抽出', () => {
    const spec = 'PET 12μ + NY 16μ + AL 7μ + LLDPE 50μ'
    const legend = getLegendForSpecification(spec)
    expect(legend.map((item) => item.label)).toContain('NY')
  })

  test('Kraft を含む規格 → Kraft を抽出', () => {
    const spec = 'Kraft 80g/m² + VMPET 12μ + LLDPE 50μ'
    const legend = getLegendForSpecification(spec)
    expect(legend.map((item) => item.label)).toContain('Kraft')
  })

  test('空文字列・無効値 → 空配列', () => {
    expect(getLegendForSpecification('')).toEqual([])
    expect(getLegendForSpecification(undefined as unknown as string)).toEqual([])
  })

  test('未知の略号のみ → 空配列', () => {
    expect(getLegendForSpecification('UNKNOWN 10mm')).toEqual([])
  })
})

// ========================================
// 3. getPlainSpecSummary: 素材ID → 平易な一言説明
// ========================================
describe('getPlainSpecSummary: 素材IDの平易な説明', () => {
  test('全7素材が空でない平易な説明を持つ', () => {
    const allMaterials = [
      MaterialType.PET_AL,
      MaterialType.PET_VMPET,
      MaterialType.PET_LLDPE,
      MaterialType.PET_NY_AL,
      MaterialType.NY_LLDPE,
      MaterialType.KRAFT_VMPET_LLDPE,
      MaterialType.KRAFT_PET_LLDPE,
    ]
    for (const materialId of allMaterials) {
      const summary = getPlainSpecSummary(materialId)
      expect(summary).toBeTruthy()
      expect(summary.length).toBeGreaterThan(10)
    }
  })

  test('PET_AL は長期保存・遮断性を示す', () => {
    const summary = getPlainSpecSummary(MaterialType.PET_AL)
    expect(summary).toContain('長期保存')
  })

  test('PET_LLDPE は透明・基本仕様を示す', () => {
    const summary = getPlainSpecSummary(MaterialType.PET_LLDPE)
    expect(summary).toContain('透明')
  })

  test('NY_LLDPE は電子レンジ解凍を示す', () => {
    const summary = getPlainSpecSummary(MaterialType.NY_LLDPE)
    expect(summary).toContain('電子レンジ')
  })

  test('未知の素材ID → 空文字列', () => {
    expect(getPlainSpecSummary('nonexistent_material')).toBe('')
  })
})
