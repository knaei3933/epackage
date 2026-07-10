/**
 * ResultStep Helper Functions
 *
 * Pure label/translation helpers extracted from ResultStep.
 */

import { MATERIAL_TYPE_LABELS_JA } from '@/constants/materialTypes';

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

export function getPostProcessingLabel(optionId: string): string {
  const labels: Record<string, string> = {
    'zipper-yes': 'ジッパー付き',
    'zipper-no': 'ジッパーなし',
    'hanging_hole-6mm': '吊り下げ穴 (6mm)',
    'hanging_hole-8mm': '吊り下げ穴 (8mm)',
    'zipper-position-delegate': 'ジッパー位置 (お任せ)',
    'zipper-position-specify': 'ジッパー位置 (指定)',
    'zipper-position-any': 'ジッパー位置 (お任せ)',
    'zipper-position-specified': 'ジッパー位置 (指定)',
    'glossy': '光沢仕上げ',
    'matte': 'マット仕上げ',
    'notch-yes': 'Vノッチ',
    'notch-straight': '直線ノッチ',
    'notch-no': 'ノッチなし',
    'hang-hole-6mm': '吊り下げ穴 (6mm)',
    'hang-hole-8mm': '吊り下げ穴 (8mm)',
    'hang-hole-no': '吊り穴なし',
    'corner-round': '角丸',
    'corner-square': '角直角',
    'valve-yes': 'ガス抜きバルブ',
    'valve-no': 'バルブなし',
    'top-open': '上端開封',
    'bottom-open': '下端開封',
    'sealing-width-5mm': 'シール幅 5mm',
    'sealing-width-7.5mm': 'シール幅 7.5mm',
    'sealing-width-7-5mm': 'シール幅 7.5mm',
    'sealing-width-10mm': 'シール幅 10mm',
    'sealing width 5mm': 'シール幅 5mm',
    'sealing width 7.5mm': 'シール幅 7.5mm',
    'sealing width 10mm': 'シール幅 10mm',
    'machi-printing-yes': 'マチ印刷あり',
    'machi-printing-no': 'マチ印刷なし'
  };
  return labels[optionId] || optionId.replace(/[-_]/g, ' ');
}

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
