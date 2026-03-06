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
