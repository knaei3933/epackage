// Material Types Standardization
// English notation for all material types

import { getMaterialById } from './materialData';
import type { FilmStructureLayer } from '@/lib/film-cost-calculator';

export enum MaterialType {
  PET_AL = 'pet_al',
  PET_VMPET = 'pet_vmpet',
  PET_LLDPE = 'pet_ldpe',
  PET_NY_AL = 'pet_ny_al',
  NY_LLDPE = 'ny_lldpe',
  KRAFT_VMPET_LLDPE = 'kraft_vmpet_lldpe',
  KRAFT_PET_LLDPE = 'kraft_pet_lldpe',
  PET_NY = 'pet_ny',
  KP_PE = 'kp_pe'
}

export const MATERIAL_TYPE_LABELS = {
  [MaterialType.PET_AL]: 'PET AL',
  [MaterialType.PET_VMPET]: 'PET VMPET',
  [MaterialType.PET_LLDPE]: 'PET LLDPE',
  [MaterialType.PET_NY_AL]: 'PET NY AL',
  [MaterialType.NY_LLDPE]: 'NY LLDPE',
  [MaterialType.KRAFT_VMPET_LLDPE]: 'Kraft VMPET LLDPE',
  [MaterialType.KRAFT_PET_LLDPE]: 'Kraft PET LLDPE',
  [MaterialType.PET_NY]: 'PET NY PET LLDPE',
  [MaterialType.KP_PE]: 'KP PE'
} as const;

export const MATERIAL_TYPE_LABELS_JA = {
  [MaterialType.PET_AL]: 'PET AL',
  [MaterialType.PET_VMPET]: 'PET VMPET',
  [MaterialType.PET_LLDPE]: 'PET LLDPE',
  [MaterialType.PET_NY_AL]: 'PET NY AL',
  [MaterialType.NY_LLDPE]: 'NY LLDPE',
  [MaterialType.KRAFT_VMPET_LLDPE]: 'クラフト VMPET LLDPE',
  [MaterialType.KRAFT_PET_LLDPE]: 'クラフト PET LLDPE',
  [MaterialType.PET_NY]: 'PET NY PET LLDPE',
  [MaterialType.KP_PE]: 'KP/PE'
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
  },
  [MaterialType.PET_NY]: {
    en: 'High strength transparent film with nylon reinforcement',
    ja: 'ナイロン補強による高強度透明フィルム'
  },
  [MaterialType.KP_PE]: {
    en: 'PVDC coated high barrier with PE seal layer',
    ja: 'PVDCコートによる高バリア性とポリエチレンシール層'
  }
} as const;

// Thickness types standardization
export enum ThicknessType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  STANDARD = 'standard',
  HEAVY = 'heavy',
  ULTRA = 'ultra'
}

export const THICKNESS_TYPE_LABELS = {
  [ThicknessType.LIGHT]: '軽量タイプ',
  [ThicknessType.MEDIUM]: '標準タイプ',
  [ThicknessType.STANDARD]: 'レギュラータイプ',
  [ThicknessType.HEAVY]: '高耐久タイプ',
  [ThicknessType.ULTRA]: '超耐久タイプ'
} as const;

export const THICKNESS_WEIGHT_RANGES = {
  [ThicknessType.LIGHT]: '~100g',
  [ThicknessType.MEDIUM]: '~500g',
  [ThicknessType.STANDARD]: '~500g',
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

/**
 * フィルム実構成ラベルを返す（単一データソース: materialData.ts の specificationEn）。
 *
 * フォールバック順:
 *  1. MATERIALS_DATA[materialId].thicknessOptions から thicknessSelection で該当キーを引き specificationEn を返す
 *  2. thicknessOptions が存在するが thicknessSelection 非該当 → 最初の thicknessOptions[0].specificationEn
 *  3. thicknessOptions 未定義 → filmLayers[] から "素材 μ"（grammage は "素材 g/m²"）形式で組み立て
 *  4. materialId 自体が MATERIALS_DATA に存在しない → getMaterialLabel(materialId)
 *
 * 計画: .omc/plans/film-structure-display-unification.md Step1
 *
 * @param materialId - 素材ID（例: 'pet_al', 'pet_vmpet'）
 * @param thicknessSelection - 厚さ選択キー（例: 'light', 'standard', 'standard_70'）。省略時は thicknessOptions[0]
 */
export const getFilmStructureLabel = (materialId: string, thicknessSelection?: string): string => {
  const material = getMaterialById(materialId);
  if (!material) {
    return getMaterialLabel(materialId);
  }

  // 1. thicknessOptions から該当キーで specificationEn を引く
  if (material.thicknessOptions && material.thicknessOptions.length > 0) {
    let option = thicknessSelection
      ? material.thicknessOptions.find((o) => o.id === thicknessSelection)
      : undefined;
    // 系統B接尾辞（standard_70 等）のフォールバック: 前前方一致でなく完全一致優先・非該当時は先頭
    if (!option) {
      option = material.thicknessOptions[0];
    }
    if (option?.specificationEn) {
      return option.specificationEn;
    }
  }

  // 2. filmLayers から "素材 μ" 形式で組み立て
  if (material.thicknessOptions && material.thicknessOptions.length > 0) {
    const layers = material.thicknessOptions[0].filmLayers;
    if (layers && layers.length > 0) {
      return layers
        .map((layer: FilmStructureLayer) => formatFilmLayer(layer))
        .join(' + ');
    }
  }

  // 3. 最終フォールバック
  return getMaterialLabel(materialId);
};

/**
 * FilmStructureLayer を表示文字列に整形する。
 * - thickness を持つ層: "PET 12μ"
 * - grammage を持つ層（Kraft 等）: "Kraft 80g/m²"
 */
const formatFilmLayer = (layer: FilmStructureLayer): string => {
  if (typeof layer.grammage === 'number') {
    return `${layer.materialId} ${layer.grammage}g/m²`;
  }
  return `${layer.materialId} ${layer.thickness}μ`;
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
