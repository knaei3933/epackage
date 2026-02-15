/**
 * 英語-日本語マッピング定数ファイル
 * 修正事項.md 7番要件: 英語表示を日本語で統一
 */

// 袋タイプマッピング
export const BAG_TYPE_JA = {
  'flat_3_side': '三方シール平袋',
  'stand_up': 'スタンドパウチ',
  'box': 'BOX型パウチ',
  'spout_pouch': 'スパウトパウチ',
  'roll_film': 'ロールフィルム',
  'flat_gusset': 'ガセット平袋',
  'flat_with_zip': 'ジッパー付き平袋',
  '3_side': '三方シール',
  '4_side': '四方シール',
  'gusset': 'ガセット',
  'bottom_gusset': '底ガセット'
} as const;

// 素材タイプマッピング
export const MATERIAL_TYPE_JA = {
  'pet_al': 'PET+AL',
  'pet_vmpet': 'PET+VMPET',
  'pet_ldpe': 'PET+LLDPE',
  'pet_ny_al': 'PET+NY+AL',
  'pet': 'PET',
  'nylon': 'ナイロン',
  'aluminum': 'アルミニウム',
  'cpp': 'CPP',
  'pe': 'PE',
  'paper': '紙'
} as const;

// 厚さタイプマッピング
export const THICKNESS_TYPE_JA = {
  'light': '軽量タイプ',
  'medium': '標準タイプ',
  'heavy': '高耐久タイプ',
  'ultra': '超耐久タイプ'
} as const;

// 印刷タイプマッピング
export const PRINTING_TYPE_JA = {
  'digital': 'デジタル',
  'gravure': 'グラビア'
} as const;

// 単位マッピング
export const UNIT_JA = {
  'units': '個',
  'pieces': '個',
  'mm': 'mm',
  'cm': 'cm',
  'g': 'g',
  'kg': 'kg'
} as const;

// ラベルマッピング
export const LABEL_JA = {
  'Type:': 'タイプ:',
  'Material:': '素材:',
  'Size:': 'サイズ:',
  'Thickness:': '厚さ:',
  'Quantity:': '数量:',
  'Colors:': '色数:',
  'Ink Type:': 'インク種類:',
  'Post-Processing:': '後加工:',
  'Delivery Location:': '配達先:',
  'Urgency:': '納期:',
  'Price:': '価格:',
  'Total:': '合計:'
} as const;

// 後加工オプションマッピング
export const POST_PROCESSING_JA = {
  'zipper-yes': 'ジッパー付き',
  'zipper-no': 'ジッパーなし',
  'zipper-position-any': 'ジッパー位置: お任せ',
  'zipper-position-specified': 'ジッパー位置: 指定',
  'glossy': '光沢仕上げ',
  'matte': 'マット仕上げ',
  'notch-yes': 'ノッチ付き',
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
} as const;

// ユーティリティ関数
export const translateToJapanese = (text: string): string => {
  return Object.entries(LABEL_JA).reduce((translated, [enKey, jaValue]) => {
    return translated.replace(enKey, jaValue);
  }, text);
};

export const translateBagType = (bagType: string): string => {
  return BAG_TYPE_JA[bagType as keyof typeof BAG_TYPE_JA] || bagType;
};

export const translateMaterialType = (material: string): string => {
  return MATERIAL_TYPE_JA[material as keyof typeof MATERIAL_TYPE_JA] || material;
};

export const translatePostProcessing = (option: string): string => {
  return POST_PROCESSING_JA[option as keyof typeof POST_PROCESSING_JA] || option;
};