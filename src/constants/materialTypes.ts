// Material Types Standardization
// English notation for all material types

export enum MaterialType {
  PET_AL = 'pet_al',
  PET_VMPET = 'pet_vmpet',
  PET_LLDPE = 'pet_ldpe',
  PET_NY_AL = 'pet_ny_al',
  NY_LLDPE = 'ny_lldpe',
  KRAFT_VMPET_LLDPE = 'kraft_vmpet_lldpe',
  KRAFT_PET_LLDPE = 'kraft_pet_lldpe'
}

export const MATERIAL_TYPE_LABELS = {
  [MaterialType.PET_AL]: 'PET AL',
  [MaterialType.PET_VMPET]: 'PET VMPET',
  [MaterialType.PET_LLDPE]: 'PET LLDPE',
  [MaterialType.PET_NY_AL]: 'PET NY AL',
  [MaterialType.NY_LLDPE]: 'NY LLDPE',
  [MaterialType.KRAFT_VMPET_LLDPE]: 'Kraft VMPET LLDPE',
  [MaterialType.KRAFT_PET_LLDPE]: 'Kraft PET LLDPE'
} as const;

export const MATERIAL_TYPE_LABELS_JA = {
  [MaterialType.PET_AL]: 'PET AL',
  [MaterialType.PET_VMPET]: 'PET VMPET',
  [MaterialType.PET_LLDPE]: 'PET LLDPE',
  [MaterialType.PET_NY_AL]: 'PET NY AL',
  [MaterialType.NY_LLDPE]: 'NY LLDPE',
  [MaterialType.KRAFT_VMPET_LLDPE]: 'クラフト VMPET LLDPE',
  [MaterialType.KRAFT_PET_LLDPE]: 'クラフト PET LLDPE'
} as const;

export const MATERIAL_DESCRIPTIONS = {
  [MaterialType.PET_AL]: {
    en: 'High barrier with aluminum foil lamination',
    ja: 'アルミ箔ラミネートによる高バリア性'
  },
  [MaterialType.PET_VMPET]: {
    en: 'Vapor deposited aluminum for premium barrier',
    ja: 'アルミ蒸着によるプレミアムバリア性能'
  },
  [MaterialType.PET_LLDPE]: {
    en: 'Transparent PET with LLDPE seal layer',
    ja: '透明性に優れるPETとLLDPEシール層'
  },
  [MaterialType.PET_NY_AL]: {
    en: 'High strength nylon with aluminum foil',
    ja: '高強度ナイロンとアルミ箔の組み合わせ'
  },
  [MaterialType.NY_LLDPE]: {
    en: 'Microwave defrostable, transparent window available',
    ja: '電子レンジ解凍可能、透明窓表現可能'
  },
  [MaterialType.KRAFT_VMPET_LLDPE]: {
    en: 'Natural kraft with vapor deposited PET barrier',
    ja: '自然素材風の外観、アルミ蒸着による優れたバリア性能'
  },
  [MaterialType.KRAFT_PET_LLDPE]: {
    en: 'Natural kraft paper appearance with short-term barrier',
    ja: '自然素材風の外観、短期バリア性能'
  }
} as const;

// Thickness types standardization
export enum ThicknessType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  ULTRA = 'ultra'
}

export const THICKNESS_TYPE_LABELS = {
  [ThicknessType.LIGHT]: '軽量タイプ',
  [ThicknessType.MEDIUM]: '標準タイプ',
  [ThicknessType.HEAVY]: '高耐久タイプ',
  [ThicknessType.ULTRA]: '超耐久タイプ'
} as const;

export const THICKNESS_WEIGHT_RANGES = {
  [ThicknessType.LIGHT]: '~100g',
  [ThicknessType.MEDIUM]: '~500g',
  [ThicknessType.HEAVY]: '~800g',
  [ThicknessType.ULTRA]: '800g~'
} as const;

// Helper functions
export const getMaterialLabel = (materialId: string): string => {
  return MATERIAL_TYPE_LABELS[materialId as MaterialType] || materialId;
};

export const getMaterialDescription = (materialId: string, language: 'en' | 'ja' = 'ja'): string => {
  const description = MATERIAL_DESCRIPTIONS[materialId as MaterialType];
  return description ? description[language] : '';
};

export const getThicknessLabel = (thicknessId: string): string => {
  return THICKNESS_TYPE_LABELS[thicknessId as ThicknessType] || thicknessId;
};

export const getWeightRange = (thicknessId: string): string => {
  return THICKNESS_WEIGHT_RANGES[thicknessId as ThicknessType] || '';
};

// Film structure labels (in micrometers) for PDF display
export const FILM_STRUCTURE_LABELS: Record<string, Record<string, string>> = {
  pet_al: {
    light: 'PET 12 / AL 7',
    medium: 'PET 12 / AL 9',
    heavy: 'PET 12 / AL 12',
    ultra: 'PET 12 / AL 15'
  },
  pet_vmpet: {
    light: 'PET 12 / VMPET',
    medium: 'PET 12 / VMPET',
    heavy: 'PET 12 / VMPET',
    ultra: 'PET 12 / VMPET'
  },
  pet_ldpe: {
    light: 'PET 12 / LLDPE 50',
    medium: 'PET 12 / LLDPE 70',
    heavy: 'PET 12 / LLDPE 90',
    ultra: 'PET 12 / LLDPE 100'
  },
  pet_ny_al: {
    light: 'PET 12 / NY 15 / AL 7',
    medium: 'PET 12 / NY 15 / AL 9',
    heavy: 'PET 12 / NY 15 / AL 12',
    ultra: 'PET 12 / NY 15 / AL 15'
  },
  // NY+LLDPE: 2-layer structure
  ny_lldpe: {
    light_50: 'NY 15 / LLDPE 50',
    standard_70: 'NY 15 / LLDPE 70',
    heavy_90: 'NY 15 / LLDPE 90',
    ultra_100: 'NY 15 / LLDPE 100',
    maximum_110: 'NY 15 / LLDPE 110'
  },
  // Kraft+VMPET+LLDPE: 3-layer structure
  kraft_vmpet_lldpe: {
    light_50: 'Kraft 50g/m² / VMPET 12 / LLDPE 50',
    standard_70: 'Kraft 50g/m² / VMPET 12 / LLDPE 70',
    heavy_90: 'Kraft 50g/m² / VMPET 12 / LLDPE 90',
    ultra_100: 'Kraft 50g/m² / VMPET 12 / LLDPE 100',
    maximum_110: 'Kraft 50g/m² / VMPET 12 / LLDPE 110'
  },
  // Kraft+PET+LLDPE: 3-layer structure
  kraft_pet_lldpe: {
    light_50: 'Kraft 50g/m² / PET 12 / LLDPE 50',
    standard_70: 'Kraft 50g/m² / PET 12 / LLDPE 70',
    heavy_90: 'Kraft 50g/m² / PET 12 / LLDPE 90',
    ultra_100: 'Kraft 50g/m² / PET 12 / LLDPE 100',
    maximum_110: 'Kraft 50g/m² / PET 12 / LLDPE 110'
  }
};

export const getFilmStructureLabel = (materialId: string, thicknessId: string): string => {
  const structures = FILM_STRUCTURE_LABELS[materialId];
  return structures ? structures[thicknessId] || `${getMaterialLabel(materialId)} (${getThicknessLabel(thicknessId)})` : materialId;
};

/**
 * 素材略号の凡例（顧客向け平易化・C3）
 *
 * 規格表示（例 "PET 12μ + AL 7μ + PET 12μ + LLDPE 50μ"）に現れる略号を、
 * 専門知識のない顧客にも分かるよう説明する。コンポーネント3（見積UI改善）で
 * 厚さ選択UI・結果画面等の凡例として参照する。
 *
 * - `label`: 表示用略号（規格文字列内のトークンと一致）
 * - `name`: 一般名称
 * - `description`: 役割の平易な説明（顧客向け）
 */
export interface MaterialAbbreviationLegend {
  label: string;
  name: string;
  description: string;
}

export const MATERIAL_ABBREVIATION_LEGEND: MaterialAbbreviationLegend[] = [
  { label: 'μ', name: 'マイクロメートル', description: 'フィルム1層の厚さの単位。1μ＝1000分の1mm。数字が大きいほど分厚く・頑丈になります。' },
  { label: 'PET', name: 'ポリエステル', description: '外側の印刷面によく使う、丈夫で透明なフィルム。印刷が綺麗に乗ります。' },
  { label: 'AL', name: 'アルミ箔', description: '本物のアルミ箔の層。光・空気・湿気を完全に遮断し、長期保存に適します。' },
  { label: 'VMPET', name: 'アルミ蒸着PET', description: 'PETにアルミを薄く蒸着した層。ALより軽量・低コストで、ほどよい遮断性を持ちます。' },
  { label: 'NY', name: 'ナイロン', description: '引っ張り強度と耐衝撃性に優れた層。穴あき防止や電子レンジ解凍対応に有効です。' },
  { label: 'LLDPE', name: '直鎖状低密度ポリエチレン', description: '内側の熱シール（ヒートシール）層。袋の底や側面を熱で溶着して密封します。' },
  { label: 'Kraft', name: 'クラフト紙', description: '自然な紙の風合いの外装層。g/m²は紙1m²あたりの重さ（厚みの目安）。' },
];

/**
 * 規格文字列（例 "PET 12μ + AL 7μ"）から、含まれる略号の凡例を抽出する。
 * 表示用の凡例リストを動的に絞り込むのに使用する。
 */
export const getLegendForSpecification = (specification: string): MaterialAbbreviationLegend[] => {
  if (!specification) return [];
  return MATERIAL_ABBREVIATION_LEGEND.filter((item) => specification.includes(item.label));
};

/**
 * 素材IDから規格の分かりやすい一言説明を返す（顧客向け平易化・C3）
 *
 * 規格の専門文字列（"PET 12μ + AL 7μ ..."）の横に添える、用途・特徴の平易な補足。
 * 専門用語を使わず「何に向いているか」を一言で伝える。
 */
export const getPlainSpecSummary = (materialId: string): string => {
  switch (materialId) {
    case MaterialType.PET_AL:
      return 'アルミ箔入り4層構造。光・空気・湿気を完全に遮断し、長期保存に最適です。';
    case MaterialType.PET_VMPET:
      return 'アルミ蒸着4層構造。軽量で高バリア、本物のアルミ箔よりお求めやすい高級仕様です。';
    case MaterialType.PET_LLDPE:
      return '透明2層構造。中身が見え、軽量でコストパフォーマンスに優れた基本仕様です。';
    case MaterialType.PET_NY_AL:
      return 'ナイロン+アルミ箔4層構造。強度と保存性を両立し、重い内容物や長期保存向けです。';
    case MaterialType.NY_LLDPE:
      return 'ナイロン2層構造。電子レンジ解凍対応・透明窓が作れ、冷凍食品等に適します。';
    case MaterialType.KRAFT_VMPET_LLDPE:
      return 'クラフト紙+アルミ蒸着3層。紙の風合いと高い保存性を両立したエコな高級仕様です。';
    case MaterialType.KRAFT_PET_LLDPE:
      return 'クラフト紙+PET3層。紙の自然な風合いで、短期保存向けのコスト仕様です。';
    default:
      return '';
  }
};
