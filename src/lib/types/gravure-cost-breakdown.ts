/**
 * グラビア見積もり cost_breakdown JSONB 契約（Phase 4a 凍結）
 *
 * 仕様: .omc/plans/gravure-integration-consensus.md Phase 4a / AC-22
 * 計算元: src/lib/unified-pricing-engine.ts `performGravureSKUCalculation` (L1890-2041)
 *
 * 本契約は Phase 4b（quotations/sku_quotes テーブルへ printing_type カラム追加 + cost_breakdown 永続化）
 * の前提となる。Phase 4b 実装者は本型に従い JSONB へ格納・読出を行うこと。
 *
 * 【設計原則】
 * - 円(JPY)フィールドと ウォン(KRW) フィールドを明示分離（AC-22: 円変換は convertKRWtoJPY 集約層で統一）
 * - 円フィールド: 既存デジタル breakdown と同名・同型（後方互換性。デジタル/グラビアで共通参照可能）
 * - ウォンフィールド: グラビア専用。原価の透明性確保（Excel 式との照合用）
 * - 全フィールド Math.round 済みの整数（unified-pricing-engine.ts の設定箇所と一致）
 *
 * 【通貨不変条件】
 * - KRW フィールド群の合計 = gravureFilmValueKRW + gravureCopperPlateCostKRW（ウォン原価）
 * - JPY フィールド群は baseCost から マージン40% + 関税5% + 配送 + 販売マージン20% で導出
 *   （performGravureSKUCalculation L1953-1981 と一致）
 * - baseCost(JPY) === convertKRWtoJPY(gravureFilmValueKRW + gravureCopperPlateCostKRW)
 */

// ========================================
// グラビア原反値の内訳（ウォン・gravure-cost-calculator.ts と一致）
// ========================================

/**
 * グラビア原反値の内訳（ウォン）
 * 出典: src/lib/gravure-cost-calculator.ts `calculateGravureFilmValue` 戻り値
 */
export interface GravureFilmValueBreakdownKRW {
  /** 原材料費（ウォン）= Σ(厚み×幅×長さ×比重×単価) */
  materialCost: number
  /** 印刷費（ウォン）= 原反幅(m) × 製作長(m) × 色数 × 19₫/m */
  printingCost: number
  /** ラミネート費（ウォン）= 幅(m) × 長さ(m) × ラミ回数 × 単価(75/65/55) */
  laminationCost: number
  /** 原反値合計（ウォン）= materialCost + printingCost + laminationCost */
  total: number
}

// ========================================
// cost_breakdown JSONB 契約（メイン）
// ========================================

/**
 * グラビア見積もりの cost_breakdown JSONB 契約（Phase 4a 凍結）
 *
 * unified-pricing-engine.ts `performGravureSKUCalculation` が構築する
 * `UnifiedQuoteResult.breakdown` オブジェクトと完全一致する構造。
 *
 * フィールドは3グループに分類:
 * 1. 共通フィールド（デジタルと同名・円）: 既存 quotations/sku_quotes の cost_breakdown と互換
 * 2. マージン・関税フィールド（円）: 製造者マージン40% / 関税5% / 販売マージン20%
 * 3. グラビア専用フィールド（ウォン + メタ）: 原価透明性・Excel 式照合用
 *
 * 永続化: Phase 4b で quotations.cost_breakdown / sku_quotes.cost_breakdown (JSONB) へ格納。
 * 読込: printing_type='gravure' の行は本構造として parse すること。
 */
export interface GravureCostBreakdown {
  // ========================================
  // グループ1: 共通フィールド（円・デジタル breakdown と同名）
  // ========================================
  /** フィルム素材費（円）= convertKRWtoJPY(gravureMaterialCostKRW) */
  filmCost?: number
  /** ラミネーション費（円）= convertKRWtoJPY(gravureLaminationCostKRW) */
  laminationCost?: number
  /** スリッター費（円）。グラビアでは現在未使用（0 の場合あり） */
  slitterCost?: number
  /** 素材費合計（円）。グラビアでは materialCost 相当 */
  material: number
  /** 加工費（円）。グラビア原反値には加工費含まず（0・Phase 3 でパウチ加工は別途） */
  processing: number
  /** 印刷費（円）= convertKRWtoJPY(gravurePrintingCostKRW) */
  printing: number
  /** 設定費（円）= convertKRWtoJPY(gravureCopperPlateCostKRW)〔銅版費〕 */
  setup: number
  /** 割引（円・グラビアでは通常 0） */
  discount: number
  /** 配送料（円）= calculateDeliveryCost の戻り値 */
  delivery: number

  // ========================================
  // グループ2: マージン・関税フィールド（円）
  // ========================================
  /** 製造者マージン（円）= baseCostJPY × manufacturerMargin(0.3) */
  manufacturingMargin?: number
  /** 関税（円）= manufacturerPriceJPY × dutyRate(0.05) */
  duty?: number
  /** 販売マージン（円）= subtotalWithDeliveryJPY × salesMargin(0.2) */
  salesMargin?: number
  /** 表面処理費（円・グラビアでは現在未使用） */
  surfaceTreatmentCost?: number
  /** 小計（円）= 輸入原価 + 配送料（販売マージン乗算前） */
  subtotal: number
  /** 最終総額（円・後加工乗数適用済み） */
  total: number
  /** 基礎原価（円）= convertKRWtoJPY(gravureFilmValueKRW + gravureCopperPlateCostKRW) */
  baseCost?: number
  /** パウチ加工費（円・グラビアでは現在未使用） */
  pouchProcessingCost?: number
  /** SKU追加料金（円・(skuCount-1)×¥10,000）。グラビアでは現在未設定 */
  skuSurcharge?: number

  // ========================================
  // グループ3: グラビア専用フィールド（ウォン + メタ情報）
  // 後方互換性: これらのキーが存在する場合のみグラビア見積もりとして扱う
  // ========================================
  /** グラビア原反値（ウォン）= 原材+印刷+ラミ の合計。GravureFilmValueBreakdownKRW.total と一致 */
  gravureFilmValueKRW?: number
  /** グラビア原材料費（ウォン） */
  gravureMaterialCostKRW?: number
  /** グラビア印刷費（ウォン） */
  gravurePrintingCostKRW?: number
  /** グラビアラミネート費（ウォン） */
  gravureLaminationCostKRW?: number
  /** 銅版費（ウォン・別途計上）。仕様§9。copperPlateType='none' の場合は 0 */
  gravureCopperPlateCostKRW?: number
  /** グラビア製作長 (m・ロス500m込み)。既定 STANDARD_LOT_METERS=6000 */
  gravureProductionMeters?: number
  /** グラビア原反幅 (mm) */
  gravureMaterialWidthMM?: number
}

// ========================================
// 補助: グラビア見積もりの DB 行仕様（Phase 4b で参照）
// ========================================

/**
 * グラビア見積もり1行の DB 仕様（Phase 4b 実装指針）
 *
 * quotations / sku_quotes テーブル:
 * - printing_type TEXT NOT NULL DEFAULT 'digital' CHECK IN ('digital','gravure')
 *   （Phase 4b で追加。グラビア見積もりは 'gravure' を設定）
 * - cost_breakdown JSONB（本 GravureCostBreakdown 構造を格納）
 *
 * グラビア見積もり判定: printing_type='gravure' または cost_breakdown.gravureFilmValueKRW が存在
 */
export const GRAVURE_BREAKDOWN_DISCRIMINATOR = 'gravureFilmValueKRW' as const

/**
 * cost_breakdown がグラビア契約か判定する型ガード（Phase 4b 読込パスで使用）
 *
 * @param breakdown DB から読み込んだ cost_breakdown（unknown）
 * @returns グラビア契約の場合 true
 */
export function isGravureCostBreakdown(
  breakdown: unknown
): breakdown is GravureCostBreakdown {
  if (typeof breakdown !== 'object' || breakdown === null) {
    return false
  }
  // 判別子フィールドの存在でグラビア契約を識別
  return GRAVURE_BREAKDOWN_DISCRIMINATOR in breakdown
}
