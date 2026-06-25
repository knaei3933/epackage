/**
 * グラビア印刷 純粋計算モジュール（ウォンを返す）
 * 仕様: docs/gravure-pricing-calculation-formula.md §5,6,9,11 準拠
 *
 * 【設計原則】
 * - 本モジュールは「グラビア原価（ウォン）」のみを返す純粋計算。
 * - 円変換（×0.12・マージン・関税）は集約レイヤー（Phase 1b/1c）で統一。
 * - 既存のデジタル計算（unified-pricing-engine.ts / film-cost-calculator.ts）には無侵入。
 * - ロス500mは呼び出し側（Phase 1c）で製作長に含めて渡す前提（本モジュールは純粋計算）。
 *
 * 【単位体系】（仕様§5 検証済み）
 *   層費用(₫) = 厚み(mm) × 原反幅(m) × 製作長(m) × 比重 × 単価(₫/kg)
 *   ※ MATERIAL_PRICES_KRW.density（例: PET=1.40）をそのまま比重として使用
 */

import { GRAVURE_CONSTANTS, GravureLaminationType, MATERIAL_PRICES_KRW } from './pricing/core/constants'
import type { FilmStructureLayer } from './pricing/core/types'
import { calculateSingleColumnFilmWidth as calculateSingleColumnFilmWidthImported } from './gravure-material-width'

// ========================================
// 材料費（§5）
// ========================================

/**
 * グラビア 原材料費計算（仕様§5）
 *
 * 各層ごとに計算し合計する:
 *   層費用(₫) = 厚み(mm) × 原反幅(m) × 製作長(m) × 比重 × 単価(₫/kg)
 *
 * 最終熱シール層（配列の最後の層）は 原反幅 + 10mm で計算（仕様§5）。
 *
 * @param layers フィルム構造レイヤー配列。最終要素が熱シール層扱い
 * @param materialWidthMm 原反幅 (mm)
 * @param productionMeters 製作長 (m)。ロス500m込み
 * @returns 原材料費合計 (ウォン)
 */
export function calculateGravureMaterialCost(
  layers: FilmStructureLayer[],
  materialWidthMm: number,
  productionMeters: number,
): number {
  if (!layers || layers.length === 0) {
    return 0
  }

  const { FINAL_LAYER_WIDTH_EXTRA_MM } = GRAVURE_CONSTANTS
  const lastLayerIndex = layers.length - 1

  return layers.reduce((total, layer, index) => {
    const priceConfig = MATERIAL_PRICES_KRW[layer.materialId]
    if (!priceConfig) {
      throw new Error(
        `グラビア材料費計算: 未知の材料ID '${layer.materialId}'。MATERIAL_PRICES_KRW に登録が必要です。`,
      )
    }

    const thicknessMm = resolveThicknessMm(layer)
    if (thicknessMm <= 0) {
      throw new Error(
        `グラビア材料費計算: 材料 '${layer.materialId}' の厚みが不正です (thickness=${layer.thickness}, grammage=${layer.grammage})。`,
      )
    }

    // 最終熱シール層は原反幅 + 10mm（仕様§5）
    const isFinalHeatSealLayer = index === lastLayerIndex
    const effectiveWidthMm = isFinalHeatSealLayer ? materialWidthMm + FINAL_LAYER_WIDTH_EXTRA_MM : materialWidthMm
    const widthM = effectiveWidthMm / 1000

    // 層費用(₫) = 厚み(mm) × 幅(m) × 長さ(m) × 比重 × 単価(₫/kg)
    const layerCost = thicknessMm * widthM * productionMeters * priceConfig.density * priceConfig.unitPrice

    return total + layerCost
  }, 0)
}

/**
 * レイヤー厚みを mm に解決。thickness(µm) 優先、なければ grammage(g/m²) から推定。
 * グラビア標準材料は thickness 指定を前提とする。
 */
function resolveThicknessMm(layer: FilmStructureLayer): number {
  if (typeof layer.thickness === 'number' && layer.thickness > 0) {
    // µm → mm
    return layer.thickness / 1000
  }
  // grammage 指定（Kraft等）は グラビア標準材料では非想定。
  // 呼び出し側で thickness を渡すことを推奨。0 を返すと上位で検証エラー。
  if (typeof layer.grammage === 'number' && layer.grammage > 0) {
    // 比重が不明なため mm 換算不能。0 を返し、呼び出し側で thickness 指定を促す。
    return 0
  }
  return 0
}

// ========================================
// 印刷費（§6.1）
// ========================================

/**
 * グラビア 印刷費計算（仕様§6.1）
 *
 *   印刷費(₫) = 原反幅(m) × 製作長(m) × 色数 × 印刷単価(19₫/m)
 *
 * ※ 無光(무광)/有光(유광) ともに 19₫/m（仕様§6.1）
 *
 * @param materialWidthMm 原反幅 (mm)
 * @param productionMeters 製作長 (m)。ロス500m込み
 * @param colors 印刷色数
 * @returns 印刷費 (ウォン)
 */
export function calculateGravurePrintingCost(
  materialWidthMm: number,
  productionMeters: number,
  colors: number,
): number {
  const widthM = materialWidthMm / 1000
  return widthM * productionMeters * colors * GRAVURE_CONSTANTS.PRINTING_COST_PER_M
}

// ========================================
// ラミネート費（§6.2）
// ========================================

/**
 * グラビア ラミネート費計算（仕様§6.2）
 *
 *   ラミ費(₫) = 原反幅(m) × 製作長(m) × ラミ回数 × ラミ単価(₫/m)
 *   ラミ回数 = 層数 - 1
 *
 * ラミ単価（仕様§6.2/§10.3）:
 *   - 2液型ハイ (2liquid_high): 75₫/m
 *   - 2液型セミ (2liquid_semi): 65₫/m
 *   - 無溶剤 (solventless): 55₫/m
 *
 * @param materialWidthMm 原反幅 (mm)。最終熱シール層の幅(+10mm)を想定
 * @param productionMeters 製作長 (m)。ロス500m込み
 * @param laminationType ラミネート種別
 * @param layerCount フィルム層数。省略時は2層(ラミ1回)扱い
 * @returns ラミネート費 (ウォン)
 */
export function calculateGravureLaminationCost(
  materialWidthMm: number,
  productionMeters: number,
  laminationType: GravureLaminationType,
  layerCount = 2,
): number {
  const unitCost = GRAVURE_CONSTANTS.LAMINATION_COST_PER_M[laminationType]
  // ラミ回数 = 層数 - 1（最低1回）
  const laminationPasses = Math.max(1, layerCount - 1)
  const widthM = materialWidthMm / 1000
  return widthM * productionMeters * laminationPasses * unitCost
}

// ========================================
// 銅版費（§9.2）★ cm基準
// ========================================

/**
 * グラビア 銅版費計算（仕様§9.2）
 *
 *   銅版幅 = 原反幅 + 100mm
 *   도당(1色あたり)(₫) = 銅版幅(cm) × 単価 × 外径(cm)
 *   銅版費(₫) = 色数 × 도당
 *
 * ★ cm基準で計算（mmで計算すると1000倍乖離する）。仕様§11 検証:
 *   3色 × 84cm(840mm) × 50 × 42cm(420mm) = 529,200₫ ✓
 *
 * 外径は仕様§9.1 の機械最小外径 420mm を採用（実務標準）。
 *
 * @param colors 印刷色数
 * @param materialWidthMm 原反幅 (mm)
 * @param isModify true=修正(수정,単価30) / false=新規(신규,単価50)
 * @returns 銅版費 (ウォン)
 */
export function calculateCopperPlateCost(
  colors: number,
  materialWidthMm: number,
  isModify = false,
): number {
  const { COPPER_PLATE } = GRAVURE_CONSTANTS

  // 銅版幅(mm) = 原反幅 + 100mm → cm 換算
  const plateWidthCm = (materialWidthMm + COPPER_PLATE.WIDTH_EXTRA_MM) / 10
  // 外径(mm) → cm 換換算
  const diameterCm = COPPER_PLATE.MIN_DIAMETER_MM / 10
  // 単価
  const unitPrice = isModify ? COPPER_PLATE.PRICE_MODIFY : COPPER_PLATE.PRICE_NEW

  // 銅版費 = 色数 × 銅版幅(cm) × 単価 × 外径(cm)
  return colors * plateWidthCm * unitPrice * diameterCm
}

// ========================================
// 原反値（§7 製造原価のフィルム部分）
// ========================================

/**
 * グラビア 原反値（フィルム値）計算（仕様§7）
 *
 *   原反値 = 原材料費 + 印刷費 + ラミネート費
 *
 * ※ 加工費（袋成形）・銅版費は別途。ロールフィルムは加工費不要。
 *
 * 検証（仕様§11）: PET12/AL7/PET12/LLDPE50、3色、6000m、原反幅740mm、2液セミ
 *   原材料費 = 1,654,284₫
 *   印刷費   = 0.74 × 6000 × 3 × 19 = 253,080₫
 *   ラミ費   = 0.75 × 6000 × 3 × 65 = 877,500₫ （最終層幅740+10=750mm、層数4→ラミ3回）
 *   原反値   = 2,784,864₫ ✓
 *
 * @returns 原反値 (ウォン)
 */
export function calculateGravureFilmValue(
  layers: FilmStructureLayer[],
  materialWidthMm: number,
  productionMeters: number,
  colors: number,
  laminationType: GravureLaminationType,
): {
  materialCost: number
  printingCost: number
  laminationCost: number
  total: number
} {
  const materialCost = calculateGravureMaterialCost(layers, materialWidthMm, productionMeters)
  const printingCost = calculateGravurePrintingCost(materialWidthMm, productionMeters, colors)

  // ラミネート費は最終熱シール層の幅(原反幅+10mm)基準（仕様§11: 0.75m使用）
  const { FINAL_LAYER_WIDTH_EXTRA_MM } = GRAVURE_CONSTANTS
  const finalLayerWidthMm = materialWidthMm + FINAL_LAYER_WIDTH_EXTRA_MM
  const laminationCost = calculateGravureLaminationCost(
    finalLayerWidthMm,
    productionMeters,
    laminationType,
    layers.length,
  )

  return {
    materialCost,
    printingCost,
    laminationCost,
    total: materialCost + printingCost + laminationCost,
  }
}

// ========================================
// 加工個数（§6.4 / Critic Critical#2）
// ========================================

/**
 * グラビア袋加工の列数を計算（仕様§3）
 *
 * 列数 = floor(最大原反幅1,100mm ÷ 1列フィルム幅)。最低1列。
 * ※ gravure-material-width.ts の determineGravureMaterialWidth と同一ロジック。
 *
 * @param pouchType パウチタイプ
 * @param height パウチ長さ H (mm)
 * @param width パウチ幅 W (mm)
 * @param gusset マチ G (mm)
 */
export function calculateGravureColumnCount(
  pouchType: import('./gravure-material-width').GravurePouchType,
  height: number,
  width: number,
  gusset = 0,
): number {
  const singleColumnWidth = calculateSingleColumnFilmWidthImported(pouchType, height, width, gusset)
  const { MATERIAL_WIDTH_MAX_MM } = GRAVURE_CONSTANTS
  return Math.max(1, Math.floor(MATERIAL_WIDTH_MAX_MM / singleColumnWidth))
}

/**
 * パウチタイプ別のピッチ（mm）を取得（仕様§3）
 *
 * | タイプ | ピッチ |
 * |--------|--------|
 * | 三方・スタンド | パウチ幅 (W) |
 * | 合掌・ガゼット | パウチ長さ (H) |
 *
 * @param pouchType パウチタイプ
 * @param height パウチ長さ H (mm)
 * @param width パウチ幅 W (mm)
 */
export function getGravurePitchMm(
  pouchType: import('./gravure-material-width').GravurePouchType,
  height: number,
  width: number,
): number {
  switch (pouchType) {
    case 'flat_3_side':
    case 'stand_up':
      return width // パウチ幅
    case 't_shape':
    case 'm_shape':
      return height // パウチ長さ
    default: {
      const _exhaustive: never = pouchType
      return _exhaustive
    }
  }
}

/**
 * グラビア袋加工の加工個数を計算（仕様§6.4 / Critic Critical#2）
 *
 *   加工個数 = (顧客提供長5,500m ÷ ピッチ(m)) × 列数 × 0.93
 *
 * 【重要】Crittic Critical#2:
 * - 「6000m ÷ 数量」ではない。
 * - 製作6,000m（標準ロット）のうち、顧客提供5,500m（=6,000−ロス500m）分の
 *   フィルム長から、ピッチと列数で並べられる個数を計算。
 * - 0.93 = 袋成形歩留まり（ロス7%。ロス500mとは別適用）。
 * - ※ ロールフィルム（袋加工なし）の場合は本関数を使用しない。
 *
 * @param pouchType パウチタイプ
 * @param height パウチ長さ H (mm)
 * @param width パウチ幅 W (mm)
 * @param gusset マチ G (mm)
 * @returns 加工個数（1ロット6,000m製作あたりの袋数）
 */
export function calculateGravureProcessingCount(
  pouchType: import('./gravure-material-width').GravurePouchType,
  height: number,
  width: number,
  gusset = 0,
): number {
  const { CUSTOMER_PROVIDED_METERS } = GRAVURE_CONSTANTS // 5,500m
  const PROCESSING_YIELD = 0.93 // 袋成形歩留まり（§6.4）

  const pitchMm = getGravurePitchMm(pouchType, height, width)
  if (pitchMm <= 0) return 0

  const pitchM = pitchMm / 1000
  const columnCount = calculateGravureColumnCount(pouchType, height, width, gusset)

  const count = (CUSTOMER_PROVIDED_METERS / pitchM) * columnCount * PROCESSING_YIELD
  return Math.floor(count)
}
