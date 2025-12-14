// Material Types Standardization
// English notation for all material types

export enum MaterialType {
  PET_AL = 'pet_al',
  PET_VMPET = 'pet_vmpet',
  PET_LLDPE = 'pet_ldpe',
  PET_NY_AL = 'pet_ny_al'
}

export const MATERIAL_TYPE_LABELS = {
  [MaterialType.PET_AL]: 'PET AL',
  [MaterialType.PET_VMPET]: 'PET VMPET',
  [MaterialType.PET_LLDPE]: 'PET LLDPE',
  [MaterialType.PET_NY_AL]: 'PET NY AL'
} as const;

export const MATERIAL_TYPE_LABELS_JA = {
  [MaterialType.PET_AL]: 'PET AL',
  [MaterialType.PET_VMPET]: 'PET VMPET',
  [MaterialType.PET_LLDPE]: 'PET LLDPE',
  [MaterialType.PET_NY_AL]: 'PET NY AL'
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