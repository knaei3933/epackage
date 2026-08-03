/**
 * ResultStep Helper Functions
 *
 * Pure label/translation helpers extracted from ResultStep.
 */

import { MATERIAL_TYPE_LABELS_JA } from '@/constants/materialTypes';
import { translatePostProcessing } from '@/constants/enToJa';

export function getMaterialDescriptionJa(materialId: string): string {
  const descriptions: Record<string, string> = {
    'pet_al': 'PET+AL (高バリア)',
    'pet_vmpet': 'PET+VMPET (蒸着)',
    'pet_ldpe': 'PET+LLDPE (透明)',
    'pet_ny_al': 'PET+NY+AL (超高バリア)'
  };
  return descriptions[materialId] || materialId;
}

export function getMaterialLabelJa(materialId: string): string {
  return MATERIAL_TYPE_LABELS_JA[materialId as keyof typeof MATERIAL_TYPE_LABELS_JA] || materialId;
}

export function getBagTypeDescriptionJa(bagTypeId: string): string {
  const descriptions: Record<string, string> = {
    'flat_3_side': '三方シール平袋',
    'stand_up': 'スタンドパウチ',
    'box': 'ガゼットパウチ',
    'spout_pouch': 'スパウトパウチ',
    'roll_film': 'ロールフィルム'
  };
  return descriptions[bagTypeId] || bagTypeId;
}

export function getBagTypeLabel(bagTypeId: string): string {
  const labels: Record<string, string> = {
    'flat_3_side': '三方シール平袋',
    'stand_up': 'スタンドパウチ',
    'box': 'ガゼットパウチ',
    'spout_pouch': 'スパウトパウチ',
    'roll_film': 'ロールフィルム'
  };
  return labels[bagTypeId] || bagTypeId;
}

// 後加工ラベルは正系ソース（enToJa.ts）へ一元化。
// translatePostProcessing が全キー（バリエーション・sealing-width-* 動的処理含む）をカバー。
export const getPostProcessingLabel = translatePostProcessing;

export function translateSpoutPosition(position: string): string {
  const translations: Record<string, string> = {
    'top-center': '上端中央',
    'top-left': '上端左',
    'top-right': '上端右',
    'center': '中央',
    'bottom-center': '下端中央'
  };
  return translations[position] || position;
}

/**
 * Filter post-processing options for display.
 * For roll_film/spout_pouch, only show surface treatments (glossy/matte).
 */
export function getFilteredPostProcessingOptions(
  postProcessingOptions: string[] | undefined,
  bagTypeId: string | undefined
): string[] {
  if (!postProcessingOptions || postProcessingOptions.length === 0) {
    return [];
  }

  if (bagTypeId === 'roll_film' || bagTypeId === 'spout_pouch') {
    const allowedOptions = ['glossy', 'matte'];
    return postProcessingOptions.filter(opt => allowedOptions.includes(opt));
  }

  return postProcessingOptions;
}
