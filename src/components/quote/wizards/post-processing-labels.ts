/**
 * Post-processing option labels
 */

export function getPostProcessingLabel(optionId: string): string {
  const postProcessingLabels: Record<string, string> = {
    'zipper-yes': 'ジッパー付き',
    'zipper-no': 'ジッパーなし',
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
    'valve-yes': 'バルブ付き',
    'valve-no': 'バルブなし',
    'top-open': '上端開封',
    'bottom-open': '下端開封'
  };
  return postProcessingLabels[optionId] || optionId.replace(/-/g, ' ');
}
