/**
 * 英語-日本語マッピング定数ファイル
 * 修正事項.md 7番要件: 英語表示を日本語で統一
 */

// 袋タイプマッピング
export const BAG_TYPE_JA = {
  'flat_3_side': '三方シール平袋',
  'stand_up': 'スタンドパウチ',
  'box': 'ガゼットパウチ',
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
  'standard': 'レギュラータイプ',
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

// 後加工オプションマッピング（全ページ一元化の正系ソース）
// 表記は多数派（光沢仕上げ/Vノッチ/ガス抜きバルブ 等）に統一
export const POST_PROCESSING_JA = {
  // ジッパー
  'zipper-yes': 'ジッパー付き',
  'zipper-no': 'ジッパーなし',
  'zipper-position-any': 'ジッパー位置: お任せ',
  'zipper-position-specified': 'ジッパー位置: 指定',
  // 印刷仕上げ
  'glossy': '光沢仕上げ',
  'matte': 'マット仕上げ',
  // ノッチ
  'notch-yes': 'Vノッチ',
  'notch-straight': '直線ノッチ',
  'notch-no': 'ノッチなし',
  // 吊り下げ穴
  'hang-hole-4mm': '吊り下げ穴 (4mm)',
  'hang-hole-6mm': '吊り下げ穴 (6mm)',
  'hang-hole-8mm': '吊り下げ穴 (8mm)',
  'hang-hole-10mm': '吊り下げ穴 (10mm)',
  'hang-hole-no': '吊り穴なし',
  // 角
  'corner-round': '角丸',
  'corner-square': '角直角',
  // バルブ・開封
  'valve-yes': 'ガス抜きバルブ',
  'valve-no': 'バルブなし',
  'top-open': '上端開封',
  'bottom-open': '下端開封',
  'top-sealed': '上部密封',
  // マチ印刷
  'machi-printing-yes': 'マチ印刷あり',
  'machi-printing-no': 'マチ印刷なし',
  // その他
  'spout': 'スパウト',
  'easy_tear': 'イージーティア',
  'slider': 'スライダー',
  'hole_punching': '穴あけ',
  // バリエーションキー（アンダースコア表記・古い命名・レガシー対応）
  'hanging_hole-4mm': '吊り下げ穴 (4mm)',
  'hanging_hole-6mm': '吊り下げ穴 (6mm)',
  'hanging_hole-8mm': '吊り下げ穴 (8mm)',
  'hanging_hole-10mm': '吊り下げ穴 (10mm)',
  'zipper-position-delegate': 'ジッパー位置: お任せ',
  'zipper-position-specify': 'ジッパー位置: 指定',
  // API レスポンス用バリエーション（spout-yes/no・top-closed）
  'spout-yes': 'スパウト付き',
  'spout-no': 'スパウトなし',
  'top-closed': 'トップクローズ'
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
  // sealing-width-* / sealing width * / sealing_width * は動的に「シール幅 Xmm」へ変換
  // 例: sealing-width-5mm, sealing width 7.5mm, sealing-width-7-5mm → シール幅 Xmm
  const sealingMatch = option.match(/^sealing[\s_-]width[\s_-](.+?)mm$/i);
  if (sealingMatch) {
    // 7-5 → 7.5 のようなハイフン/スペース区切り小数を正規化
    const mm = sealingMatch[1].replace(/(\d)[\s_-]+(\d)/, '$1.$2').trim();
    return `シール幅 ${mm}mm`;
  }
  return POST_PROCESSING_JA[option as keyof typeof POST_PROCESSING_JA] || option;
};