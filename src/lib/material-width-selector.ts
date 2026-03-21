/**
 * 原反幅選定ロジック
 * docs/reports/tjfrP/原価計算.md 基づ
 *
 * 製品幅（印刷幅）に応じて適切な原反幅を選定
 *
 * 利用可能な原反幅:
 * - 通常材料: 590mm原反 → 印刷可能幅570mm、760mm原反 → 印刷可能幅740mm
 * - クラフト材料: 780mm原反 → 印刷可能幅760mm、1190mm原反 → 印刷可能幅1170mm
 */

/**
 * 原反幅タイプ
 */
export type MaterialWidthType = 590 | 760 | 780 | 1190;

/**
 * 原反幅情報
 */
export interface MaterialWidthInfo {
  materialWidth: MaterialWidthType;  // 実際の原反幅
  printableWidth: number;            // 印刷可能幅
  description: string;               // 説明
  isKraftMaterial?: boolean;         // クラフト材料フラグ
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
  },
  780: {
    materialWidth: 780,
    printableWidth: 760,
    description: '780mm原反（クラフト紙・印刷可能幅760mm）',
    isKraftMaterial: true
  },
  1190: {
    materialWidth: 1190,
    printableWidth: 1170,
    description: '1190mm原反（クラフト紙・印刷可能幅1170mm）',
    isKraftMaterial: true
  }
};

/**
 * 製品幅に基づいて原反幅を選定
 * クラフト材料専用の幅選定もサポート
 *
 * @param productWidth 製品幅（mm） - ロールフィルムの幅
 * @param materialId 素材ID（オプション）- クラフト材料判定用
 * @returns 選定された原反幅
 *
 * @example
 * determineMaterialWidth(476); // returns 590 (476mm ≤ 570mm)
 * determineMaterialWidth(600); // returns 760 (600mm > 570mm but ≤ 740mm)
 * determineMaterialWidth(600, 'kraft_pet_lldpe'); // returns 780 (クラフト材料)
 * determineMaterialWidth(800, 'kraft_pet_lldpe'); // returns 1190 (クラフト材料)
 */
export function determineMaterialWidth(productWidth: number, materialId?: string): MaterialWidthType {
  // クラフト材料判定
  const isKraftMaterial = materialId === 'kraft_vmpet_lldpe' || materialId === 'kraft_pet_lldpe'

  if (isKraftMaterial) {
    // クラフト材料: 780mmまたは1190mm
    if (productWidth <= 760) {
      return 780; // クラフト紙小型
    } else {
      return 1190; // クラフト紙大型
    }
  }

  // 通常材料: 590mmまたは760mm
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
  dimensions: { width: number; height: number; depth?: number; sideWidth?: number },
  columns: 1 | 2
): number {
  const { width, height, depth = 0, sideWidth = 0 } = dimensions;

  switch (pouchType) {
    case 'flat_3_side':
      // 三方袋: H × 2 + 余白
      return columns === 1 ? (height * 2) + 41 : (height * 4) + 71;

    case 'stand_up':
      // スタンドアップ: 1列: (H × 2) + G + 35, 2列: (H × 4) + (G × 2) + 40
      // 2列では各列にマチが必要なためG×2
      return columns === 1 ? (height * 2) + depth + 35 : (height * 4) + (depth * 2) + 40;

    case 'lap_seal':
      // 合掌袋: W × 2 + 余白(ドキュメント: 02-필름폭_계산공식.md)
      return columns === 1 ? (width * 2) + 22 : (width * 2) + 22 + 20 + (width * 2) + 22;

    case 'box_pouch':
      // ボックス型: (G + W) × 2 + 側面×2 + 余白
      return columns === 1 ? (depth + width) * 2 + (sideWidth * 2) + 32 : ((depth + width) * 2 + (sideWidth * 2) + 15) * 2 + 30;

    default:
      // デフォルトは三方袋
      return columns === 1 ? (height * 2) + 41 : (height * 4) + 71;
  }
}

/**
 * パウチ製品用の原反幅選定
 * インク印刷幅（パウチ幅）に基づいて原反幅を選定
 *
 * @param pouchType パウチタイプ
 * @param dimensions パウチ寸法
 * @returns 選定された原反幅
 *
 * ルール：
 * - 印刷幅（パウチ幅）が 570mm 以下 → 590mm原反を使用
 * - 印刷幅（パウチ幅）が 570mm 超過 → 760mm原反を使用
 */
export function determineMaterialWidthForPouch(
  pouchType: string,
  dimensions: { width: number; height: number; depth?: number }
): MaterialWidthType {
  // インク印刷幅（パウチ幅）に基づいて原反選定
  // dimensions.width はパウチの幅（インク印刷幅）
  return determineMaterialWidth(dimensions.width);
}
