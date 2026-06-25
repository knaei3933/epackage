/**
 * グラビア印刷 原反幅決定モジュール
 * 仕様: docs/gravure-pricing-calculation-formula.md §3 準拠
 *
 * グラビアの原反幅は固定ではなく、パウチ仕様から計算し、
 * 必要な幅に合わせて10mm単位で製作する（無駄を最小化）。
 * 最小500mm・最大1,100mm。
 *
 * ※ 本モジュールは純粋計算（number 戻り型）。MaterialWidthType 制約には縛られない。
 *   既存のデジタル向け material-width-selector とは独立。
 */

import { GRAVURE_CONSTANTS } from './pricing/core/constants'

/** グラビア計算対応パウチタイプ（仕様§3 公式の分類） */
export type GravurePouchType =
  | 'flat_3_side' // 平袋（三封）: (H×2)+41
  | 'stand_up' // スタンド: (H×2)+(G×2)+35
  | 't_shape' // 合掌（T封）: (W×2)+22
  | 'm_shape' // ガゼット（M封）: (G+W)×2+32

/**
 * パウチタイプ別の 1列フィルム幅（mm）を計算（仕様§3 公式）
 *
 * | タイプ | 1列フィルム幅公式 | 寸法の意味 | 印刷配向 |
 * |--------|------------------|-----------|----------|
 * | 平袋（三封） | (H×2)+41 | H=長さ | 横向き |
 * | スタンド | (H×2)+(G×2)+35 | H=長さ、G=マチ(片面) | 横向き |
 * | 合掌（T封） | (W×2)+22 | W=幅 | 展開図 |
 * | ガゼット（M封） | (G+W)×2+32 | G=側面、W=幅 | 展開図 |
 *
 * @param pouchType パウチタイプ
 * @param height パウチ長さ H (mm)
 * @param width パウチ幅 W (mm)
 * @param gusset マチ G (mm)。平袋・合掌では不要
 */
export function calculateSingleColumnFilmWidth(
  pouchType: GravurePouchType,
  height: number,
  width: number,
  gusset = 0,
): number {
  switch (pouchType) {
    case 'flat_3_side':
      // 平袋（三封）: (H×2)+41
      return height * 2 + 41
    case 'stand_up':
      // スタンド: (H×2)+(G×2)+35
      return height * 2 + gusset * 2 + 35
    case 't_shape':
      // 合掌（T封）: (W×2)+22
      return width * 2 + 22
    case 'm_shape':
      // ガゼット（M封）: (G+W)×2+32
      return (gusset + width) * 2 + 32
    default: {
      // 型安全のための網羅性チェック
      const _exhaustive: never = pouchType
      return _exhaustive
    }
  }
}

/**
 * 10mm単位への丸め（仕様§3: 10mm単位で製作）
 * 端数が出る場合は切り上げて製作幅を確保する。
 *
 * 注意: 仕様§11B の計算例では 1列幅×列数 = 355×3 = 1,065mm を
 * そのまま原反幅として採用（10mm単位丸めなし）。
 * これは「10mm単位で製作」が製造工程上の目安であり、
 * 計算上の原反幅は公式結果をそのまま使用することを示す。
 * 従ってパウチ原反幅の算出では本関数を使用せず、
 * MIN/MAX 制約のみを適用する（§11B 計算例との整合）。
 * ロールフィルムなど仕様幅が与えられる場合は使用可。
 */
export function roundUpToStep(mm: number, step: number): number {
  return Math.ceil(mm / step) * step
}

/**
 * グラビア原反幅を決定する（仕様§3 / §11B 準拠）
 *
 * 算出ステップ:
 * 1. 1列フィルム幅をタイプ別公式で計算
 * 2. 列数 = floor(1,100mm ÷ 1列フィルム幅) （最低1列）
 * 3. 原反幅 = MAX(1列フィルム幅 × 列数, 500mm)
 * 4. 最大1,100mmでクランプ
 *
 * ※ 10mm単位の丸めは適用しない（仕様§11B: 355×3=1,065mm をそのまま採用）。
 *   公式の端数定数(+41/+35/+22/+32)が既に10mm系の実務値を反映済みであり、
 *   計算結果の原反幅を更に丸めると§11B検証値と乖離するため。
 *
 * @returns 原反幅 (mm)。最終熱シール層の +10mm は含まない（材料費計算時に別途加算）
 */
export function determineGravureMaterialWidth(
  pouchType: GravurePouchType,
  height: number,
  width: number,
  gusset = 0,
): number {
  const { MATERIAL_WIDTH_MIN_MM, MATERIAL_WIDTH_MAX_MM } = GRAVURE_CONSTANTS

  const singleColumnWidth = calculateSingleColumnFilmWidth(pouchType, height, width, gusset)

  // 列数 = floor(最大幅 ÷ 1列幅)。最低1列保証
  const columnCount = Math.max(1, Math.floor(MATERIAL_WIDTH_MAX_MM / singleColumnWidth))

  // 原反幅 = MAX(1列幅×列数, 最小500mm) → 最大1,100mmでクランプ
  const rawWidth = Math.max(singleColumnWidth * columnCount, MATERIAL_WIDTH_MIN_MM)

  return Math.min(rawWidth, MATERIAL_WIDTH_MAX_MM)
}

/**
 * ロールフィルム（袋加工なし）の原反幅決定（仕様§3 ロール）
 *
 * ロールは顧客指定の仕様幅 + 端代を基準とする。
 * ロールは製造上10mm単位での丸めが想定されるため、STEP丸めを適用。
 *
 * @param specificationWidthMm ロール仕様幅 (mm)
 * @returns 原反幅 (mm)。MIN500/MAX1100/STEP10 適用済み
 */
export function determineGravureRollMaterialWidth(specificationWidthMm: number): number {
  const { MATERIAL_WIDTH_MIN_MM, MATERIAL_WIDTH_MAX_MM, MATERIAL_WIDTH_STEP_MM } = GRAVURE_CONSTANTS
  const rawWidth = Math.max(specificationWidthMm, MATERIAL_WIDTH_MIN_MM)
  const steppedWidth = roundUpToStep(rawWidth, MATERIAL_WIDTH_STEP_MM)
  return Math.min(steppedWidth, MATERIAL_WIDTH_MAX_MM)
}
