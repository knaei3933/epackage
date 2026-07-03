/**
 * グラビア多列生産の自動列数決定モジュール（C2 Followup #1）
 *
 * 顧客が列数を選ぶのではなく、製作数量（1列基準の製作長）に応じて
 * システムが最大列数を自動選定する。
 *
 * ルール（ユーザー指示 2026-06-28）:
 * 1. 1列基準の製作長 = パウチピッチ(mm) × 数量 ÷ 1000 (m)
 * 2. 製作長 > MULTI_COLUMN_PRODUCTION_THRESHOLD_METERS(1000m) → 物理可能な最大列数
 * 3. 製作長 ≤ 1000m → 1列（多列化のメリットが小さいため）
 *
 * 適用範囲: グラビア印刷・パウチ袋のみ。
 *   - デジタル: 枚数ベースで「製作長(m)」概念なし → 対象外
 *   - ロールフィルム: 既存カーブ（UnifiedSKUQuantityStep）で別処理 → 対象外
 *
 * 列数の効果: 銅版費を列数で除算（unified-pricing-engine）して単価を下げる。
 *   材料費・印刷費等は列数によらず一定（総面積 = 列数×1列幅×長さ = 一定のため）。
 */

import { GRAVURE_CONSTANTS } from './pricing/core/constants'
import {
  calculateSingleColumnFilmWidth,
  getAvailableColumnCounts,
  type GravurePouchType,
} from './gravure-material-width'
import { getGravurePitchMm } from './gravure-cost-calculator'

/**
 * 1列基準の製作長（m）を計算（閾値判定用の純粋値）
 *
 * = パウチピッチ(mm) × 数量 ÷ 1000
 * 1列で数量分を並べて製作した場合に必要なフィルム長。
 * 歩留まり・ロスは含まない（ユーザー例「1万個×130mm=1300m」との整合）。
 *
 * @param pouchType パウチタイプ
 * @param height パウチ長さ H (mm)
 * @param width パウチ幅 W (mm)
 * @param quantity 製作数量（個数）
 * @returns 1列基準の製作長 (m)。ピッチ不明・数量0時は 0
 */
export function calculateOneColumnProductionMeters(
  pouchType: GravurePouchType,
  height: number,
  width: number,
  quantity: number,
): number {
  if (!quantity || quantity <= 0) return 0
  const pitchMm = getGravurePitchMm(pouchType, height, width)
  if (pitchMm <= 0) return 0
  return (quantity * pitchMm) / 1000
}

/**
 * 製作数量に応じてグラビア多列生産の列数を自動決定（C2 Followup #1）
 *
 * 1列基準の製作長が閾値(1000m)超 → 物理可能な最大列数（パウチ袋=2列上限）
 * それ以外 → 1列
 *
 * @param pouchType パウチタイプ
 * @param height パウチ長さ H (mm)
 * @param width パウチ幅 W (mm)
 * @param quantity 製作数量（個数）
 * @param thresholdMeters 多列化開始閾値(m)。既定 GRAVURE_CONSTANTS.MULTI_COLUMN_PRODUCTION_THRESHOLD_METERS(=1000)
 * @returns 適用する列数（1 または availableCounts の最大値）
 */
export function determineAutoMultiColumnCount(
  pouchType: GravurePouchType,
  height: number,
  width: number,
  quantity: number,
  thresholdMeters: number = GRAVURE_CONSTANTS.MULTI_COLUMN_PRODUCTION_THRESHOLD_METERS,
): number {
  // 物理可能な列数候補（パウチ袋=2列上限で絞り込み済み）
  const oneColumnWidthMm = calculateSingleColumnFilmWidth(pouchType, height, width)
  const availableCounts = getAvailableColumnCounts(
    oneColumnWidthMm,
    GRAVURE_CONSTANTS.MATERIAL_WIDTH_MAX_MM,
    GRAVURE_CONSTANTS.DELIVERY_MAX_COLUMN_COUNT.pouch,
  )

  // 2列以上が物理不可なら1列固定
  if (availableCounts.length === 0) return 1

  // 1列基準の製作長が閾値超 → 最大列数、以外 → 1列
  const oneColumnMeters = calculateOneColumnProductionMeters(pouchType, height, width, quantity)
  return oneColumnMeters > thresholdMeters
    ? availableCounts[availableCounts.length - 1]
    : 1
}
