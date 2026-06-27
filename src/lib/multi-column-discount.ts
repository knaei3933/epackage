/**
 * 多列生産（2/3/4列）割引 統一エントリポイント
 *
 * 計画: `.omc/plans/multi-column-gravure-unification.md`
 * 設計: Synthesis（ハイブリッド）方式 — 系統別に最適な方式を採用（Critic 指摘「DRY=単一エントリポイント」準拠）
 *
 * | 系統     | 方式               | 内容                                                       |
 * |----------|--------------------|------------------------------------------------------------|
 * | パウチ   | 率直掛け           | same=2列(15%) / double=3列(30%)、現行 0.85/0.70 と一致     |
 * | グラビア | 原価ベース(固定費除算) | 銅版費・セットアップ費を列数除算 → 15/30/40% に漸近    |
 * | ロール   | 別系（現状維持）   | noop・既存 2-7列 40-64% カーブ（UnifiedSKUQuantityStep）  |
 *
 * 顧客には統一率（2列15% / 3列30% / 4列40%）を提示するが、
 * 内部計算は系統別に最適化してマージン逆転を回避する。
 */

/** 統一表示用の多列割引率（2列15% / 3列30% / 4列40%） */
export const MULTI_COLUMN_DISCOUNT_RATES: Readonly<Record<number, number>> = {
  2: 0.15,
  3: 0.30,
  4: 0.40,
}

/** 割引対象の印刷系統 */
export type MultiColumnPrintType = 'pouch' | 'gravure' | 'roll'

/**
 * 多列割引の適用結果
 *
 * グラビア（原価ベース）は固定費除算を本体側で行うため、
 * このモジュールからは breakdown 参照用のメタ情報を返す。
 */
export interface MultiColumnDiscountResult {
  /** 適用後の最終コスト/単価 */
  finalCost: number
  /** 適用された割引率（小数）。未適用時は 0 */
  appliedRate: number
  /** 割引額（原価 - finalCost）。未適用時は 0 */
  discountAmount: number
  /** 適用された方式 */
  mode: 'rate' | 'cost-based' | 'noop'
  /** 適用された列数（1列または未適用時は入力値） */
  columnCount: number
}

/**
 * 多列割引を適用した後のコストを返す（単一エントリポイント）
 *
 * ## 系統別の挙動
 *
 * ### pouch（パウチ）: 率直掛け
 * 後方互換のため、same=2列相当(0.85係数) / double=3列相当(0.70係数) を再現。
 * columnCount=2 → rate=0.15 → finalCost = cost × 0.85
 * columnCount=3 → rate=0.30 → finalCost = cost × 0.70
 *
 * ### gravure（グラビア）: 原価ベース（固定費除算）
 * 本関数はグラビアの固定費除算そのものを行わない（本体 performGravureSKUCalculation 側で
 * 銅版費・セットアップ費を列数除算）。ただし「適用率」として統一率を返し、
 * AC3 の breakdown 開示で顧客向け表示に使用する。
 * 入力 cost をそのまま finalCost として返し、appliedRate に統一率を設定する。
 *
 * ### roll（ロール）: noop（現状維持）
 * ロールは別系（UnifiedSKUQuantityStep の既存カーブ）で処理されるため、
 * 本関数は何もせず cost をそのまま返す。
 *
 * @param printType 印刷系統
 * @param columnCount 列数（1=単列・2/3/4=多列）
 * @param cost 1列基準のコスト/単価
 */
export function applyMultiColumnDiscount(
  printType: MultiColumnPrintType,
  columnCount: number,
  cost: number,
): MultiColumnDiscountResult {
  // 1列または無効値は割引対象外
  if (!columnCount || columnCount <= 1) {
    return {
      finalCost: cost,
      appliedRate: 0,
      discountAmount: 0,
      mode: printType === 'roll' ? 'noop' : 'rate',
      columnCount: columnCount || 1,
    }
  }

  // ロールは別系（既存カーブで処理）→ 本関数は noop
  if (printType === 'roll') {
    return {
      finalCost: cost,
      appliedRate: 0,
      discountAmount: 0,
      mode: 'noop',
      columnCount,
    }
  }

  const rate = MULTI_COLUMN_DISCOUNT_RATES[columnCount] ?? 0

  // グラビア: 原価ベース（固定費除算は本体側で実施済の前提）。
  // 本関数は cost をそのまま返し、appliedRate は breakdown 表示用の参照値。
  if (printType === 'gravure') {
    return {
      finalCost: cost,
      appliedRate: rate,
      discountAmount: 0,
      mode: 'cost-based',
      columnCount,
    }
  }

  // パウチ: 率直掛け（後方互換: same=0.85 / double=0.70）
  const finalCost = cost * (1 - rate)
  return {
    finalCost,
    appliedRate: rate,
    discountAmount: cost - finalCost,
    mode: 'rate',
    columnCount,
  }
}

/**
 * 指定列数の統一表示用割引率を取得（UI表示・breakdown 用）
 *
 * @param columnCount 列数
 * @returns 割引率（小数）。1列または未定義は 0
 */
export function getMultiColumnDiscountRate(columnCount: number): number {
  if (!columnCount || columnCount <= 1) return 0
  return MULTI_COLUMN_DISCOUNT_RATES[columnCount] ?? 0
}
