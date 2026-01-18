/**
 * 原反幅選定ロジック
 * docs/reports/tjfrP/原価計算.md 基づ
 *
 * 製品幅（印刷幅）に応じて適切な原反幅を選定
 *
 * 利用可能な原反幅:
 * - 590mm原反 → 印刷可能幅570mm（製品幅570mm以下向け）
 * - 760mm原反 → 印刷可能幅740mm（製品幅740mm以下向け）
 */

/**
 * 原反幅タイプ
 */
export type MaterialWidthType = 590 | 760;

/**
 * 原反幅情報
 */
export interface MaterialWidthInfo {
  materialWidth: MaterialWidthType;  // 実際の原反幅
  printableWidth: number;            // 印刷可能幅
  description: string;               // 説明
}

/**
 * 利用可能な原反幅定義
 */
export const AVAILABLE_MATERIAL_WIDTHS: Record<MaterialWidthType, MaterialWidthInfo> = {
  590: {
    materialWidth: 590,
    printableWidth: 570,
    description: '590mm原反（印刷可能幅570mm）'
  },
  760: {
    materialWidth: 760,
    printableWidth: 740,
    description: '760mm原反（印刷可能幅740mm）'
  }
};

/**
 * 製品幅に基づいて原反幅を選定
 *
 * @param productWidth 製品幅（mm） - ロールフィルムの幅
 * @returns 選定された原反幅
 *
 * @example
 * determineMaterialWidth(476); // returns 590 (476mm ≤ 570mm)
 * determineMaterialWidth(600); // returns 760 (600mm > 570mm but ≤ 740mm)
 */
export function determineMaterialWidth(productWidth: number): MaterialWidthType {
  if (productWidth <= 570) {
    return 590; // 590mm原反
  } else if (productWidth <= 740) {
    return 760; // 760mm原反
  } else {
    // 740mm超過は現在サポート外だが、760mmをデフォルト
    console.warn(`製品幅${productWidth}mmは740mmを超えています。760mm原反を使用します。`);
    return 760;
  }
}

/**
 * パウチ製品用のフィルム幅計算（参考情報）
 * ロールフィルムとは異なり、パウチは縦×横で計算
 *
 * @param pouchType パウチタイプ
 * @param dimensions パウチ寸法
 * @param columns 列数（1 or 2）
 * @returns 必要なフィルム幅
 */
export function calculatePouchFilmWidth(
  pouchType: string,
  dimensions: { width: number; height: number; depth?: number },
  columns: 1 | 2
): number {
  const { width, height, depth = 0 } = dimensions;

  switch (pouchType) {
    case 'flat_3_side':
      // 三方袋: H × 2 + 余白
      return columns === 1 ? (height * 2) + 41 : (height * 4) + 71;

    case 'stand_up':
      // スタンドアップ: 1列: (H × 2) + G + 35, 2列: (H × 4) + (G × 2) + 40
      // 2列では各列にマチが必要なためG×2
      return columns === 1 ? (height * 2) + depth + 35 : (height * 4) + (depth * 2) + 40;

    case 'center_seal':
      // 合掌袋: W × 2 + 余白
      return columns === 1 ? (width * 2) + 22 : (width * 4) + 44;

    case 'box_pouch':
      // ボックス型: (G + W) × 2 + 余白
      return columns === 1 ? (depth + width) * 2 + 32 : ((depth + width) * 2 + 15) * 2 + 30;

    default:
      // デフォルトは三方袋
      return columns === 1 ? (height * 2) + 41 : (height * 4) + 71;
  }
}

/**
 * パウチ製品用の原反幅選定
 *
 * @param pouchType パウチタイプ
 * @param dimensions パウチ寸法
 * @returns 選定された原反幅
 */
export function determineMaterialWidthForPouch(
  pouchType: string,
  dimensions: { width: number; height: number; depth?: number }
): MaterialWidthType {
  // まず2列で計算してみる
  const filmWidth2Columns = calculatePouchFilmWidth(pouchType, dimensions, 2);

  // 2列が740mm以下で可能なら2列採用（760mm原反）
  if (filmWidth2Columns <= 740) {
    return 760;
  }

  // 2列不可なら1列で計算
  const filmWidth1Column = calculatePouchFilmWidth(pouchType, dimensions, 1);

  // 1列幅に応じて原反選定
  return determineMaterialWidth(filmWidth1Column);
}
