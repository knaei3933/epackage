/**
 * スタンドパウチ、ボックスパウチ、スパウトパウチのマチ（底）サイズデータ
 *
 * docs/밑지.md 基準
 * パウチの幅（mm）ごとに選択可能なマチサイズを定義
 */

/**
 * 幅別の使用可能なマチサイズ（mm）
 */
export const GUSSET_SIZES_BY_WIDTH: Record<number, number[]> = {
  80: [25],
  90: [25],
  95: [25],
  100: [30],
  105: [30, 45],
  110: [40],
  120: [30, 35, 40],
  130: [30, 35, 37.5, 40, 45],
  135: [35],
  140: [30, 40],
  150: [30, 35, 40, 42.5, 45],
  155: [40, 45],
  160: [30, 42.5, 50],
  165: [37.5, 45],
  170: [37.5, 45, 50],
  175: [37.5],
  180: [30, 35, 40, 45, 50],
  190: [35, 45],
  200: [30, 42.5, 50, 55, 60],
  210: [50],
  220: [35, 40, 50, 55],
  230: [40, 50, 70],
  240: [40, 50, 60],
  250: [30, 50, 60],
  260: [60],
  270: [40],
  280: [50, 60, 62.5, 75],
  290: [62.5],
  330: [60]
};

/**
 * 利用可能な幅のリスト（昇順）
 */
export const AVAILABLE_WIDTHS = Object.keys(GUSSET_SIZES_BY_WIDTH)
  .map(Number)
  .sort((a, b) => a - b);

/**
 * 指定された幅に対して利用可能なマチサイズを取得
 * @param width パウチの幅（mm）
 * @returns 利用可能なマチサイズの配列。該当するデータがない場合はデフォルト[30]を返す
 */
export function getAvailableGussetSizes(width: number): number[] {
  // 完全一致を探す
  if (GUSSET_SIZES_BY_WIDTH[width]) {
    return GUSSET_SIZES_BY_WIDTH[width];
  }

  // 近い幅を探す（±5mm以内）
  const closestWidth = AVAILABLE_WIDTHS.find(w => Math.abs(w - width) <= 5);
  if (closestWidth) {
    return GUSSET_SIZES_BY_WIDTH[closestWidth];
  }

  // 該当するデータがない場合はデフォルト[30]を返す
  return [30];
}

/**
 * 指定された幅に対して推奨されるデフォルトマチサイズを取得
 * @param width パウチの幅（mm）
 * @returns デフォルトマチサイズ（mm）
 */
export function getDefaultGussetSize(width: number): number {
  const availableSizes = getAvailableGussetSizes(width);
  // 最小値をデフォルトとして返す
  return Math.min(...availableSizes);
}

/**
 * 幅が5の倍数であるかをチェック
 * @param width パウチの幅（mm）
 * @returns 5の倍数の場合はtrue、それ以外は最も近い5の倍数を返す
 */
export function validateWidthStep(width: number): { valid: boolean; suggestedWidth: number } {
  if (width % 5 === 0) {
    return { valid: true, suggestedWidth: width };
  }
  const suggestedWidth = Math.round(width / 5) * 5;
  return { valid: false, suggestedWidth };
}
