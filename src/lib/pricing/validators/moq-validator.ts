import { PRICING_CONSTANTS } from '../core/constants';

/**
 * MOQルール定義
 * 単一の真実のソース（Single Source of Truth）
 */
export const MOQ_RULES = {
  kraft_roll_film: {
    materials: ['kraft_vmpet_lldpe', 'kraft_pet_lldpe'] as string[],
    bagType: 'roll_film',
    minQuantity: PRICING_CONSTANTS.KRAFT_MIN_QUANTITY_METERS, // 1000m
    unit: 'm',
    appliesTo: 'total' as const // 合計数量に適用
  }
} as const;

/**
 * MOQ検証関数
 *
 * @param materialId - 材料ID
 * @param bagTypeId - 袋タイプID
 * @param quantity - 数量（単一SKUまたは合計数量）
 * @returns 検証結果
 */
export function validateMOQ(
  materialId: string,
  bagTypeId: string,
  quantity: number
): { valid: boolean; error?: string; minQuantity?: number } {
  // Kraft + ロールフィルム
  if (MOQ_RULES.kraft_roll_film.materials.includes(materialId) &&
      bagTypeId === 'roll_film') {
    const minQty = MOQ_RULES.kraft_roll_film.minQuantity;
    if (quantity < minQty) {
      return {
        valid: false,
        error: `Kraft材料の最小注文数量は${minQty}mです`,
        minQuantity: minQty
      };
    }
  }

  return { valid: true };
}

/**
 * Kraft材料かどうかを判定
 */
export function isKraftMaterial(materialId: string): boolean {
  return MOQ_RULES.kraft_roll_film.materials.includes(materialId);
}
