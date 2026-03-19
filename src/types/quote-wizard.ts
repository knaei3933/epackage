/**
 * Quote Wizard Types
 * 共通型定義 - ImprovedQuotingWizardと関連コンポーネントで使用
 */

import type { FilmStructureLayer } from '@/lib/film-cost-calculator';

// ============= バッグタイプ関連 =============

export interface BagTypeOption {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  descriptionJa: string;
  basePrice: number;
  image: string;
}

export const BAG_TYPE_OPTIONS: BagTypeOption[] = [
  {
    id: 'flat_3_side',
    name: '平袋',
    nameJa: '平袋',
    description: '基本的な平たい袋タイプ',
    descriptionJa: '最も一般的な平袋タイプ。三方をシールし、一方は開口部',
    basePrice: 15,
    image: '/images/processing-icons/flat-3-side.png'
  },
  {
    id: 'stand_up',
    name: 'スタンドパウチ',
    nameJa: 'スタンドパウチ',
    description: '底が広がり自立するタイプ',
    descriptionJa: '底部がガセット構造で自立可能。陳列効果に優れる',
    basePrice: 25,
    image: '/images/processing-icons/flat-3-side-stand.png'
  },
  {
    id: 'lap_seal',
    name: '合掌袋',
    nameJa: '合掌袋',
    description: '両サイドを合掌シールした袋',
    descriptionJa: '両サイドを合掌状にシールし、底部は平らな構造',
    basePrice: 17,
    image: '/images/processing-icons/gusset.png'
  },
  {
    id: 'box',
    name: 'ガゼットパウチ',
    nameJa: 'ガゼットパウチ',
    description: '箱型形状で保護性に優れる',
    descriptionJa: '立体的な箱型形状で内容物を保護。高級感のあるデザイン',
    basePrice: 30,
    image: '/images/processing-icons/box-pouch.png'
  },
  {
    id: 'spout_pouch',
    name: 'スパウトパウチ',
    nameJa: 'スパウトパウチ',
    description: '液体製品に最適な注ぎ口付き',
    descriptionJa: '液体・粉末製品向けの注ぎ口付き。注ぎやすく再密閉可能',
    basePrice: 35,
    image: '/images/processing-icons/spout.png'
  },
  {
    id: 'roll_film',
    name: 'ロールフィルム',
    nameJa: 'ロールフィルム',
    description: '自動包装機対応のフィルム',
    descriptionJa: '自動包装機向けロール状フィルム。大量生産に最適',
    basePrice: 8,
    image: '/images/processing-icons/roll-film.png'
  }
];

export const getBagTypeLabel = (bagTypeId: string): string => {
  const bagTypeLabels: Record<string, string> = {
    'flat_3_side': '三方シール平袋',
    'stand_up': 'スタンドパウチ',
    'lap_seal': '合掌袋',
    'box': 'ガゼットパウチ',
    'spout_pouch': 'スパウトパウチ',
    'roll_film': 'ロールフィルム',
    'gusset': 'ガゼットパウチ'
  };
  return bagTypeLabels[bagTypeId] || bagTypeId;
};

// ============= スパウト位置 =============

export interface SpoutPositionOption {
  id: string;
  label: string;
  labelJa: string;
}

export const SPOUT_POSITION_OPTIONS: SpoutPositionOption[] = [
  { id: 'top-left', label: '左上', labelJa: '左上' },
  { id: 'top-center', label: '上中央', labelJa: '上中央' },
  { id: 'top-right', label: '右上', labelJa: '右上' }
];

// ============= 素材カテゴリー =============

export interface MaterialCategory {
  id: string;
  nameJa: string;
  descriptionJa: string;
  colorClass: string;
  headerBg: string;
}

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  {
    id: 'transparent',
    nameJa: '🪟 透明タイプ',
    descriptionJa: '中身が見える、窓付き表現可能',
    colorClass: 'from-sky-50 to-blue-50 border-sky-200',
    headerBg: 'bg-gradient-to-r from-sky-500 to-blue-500'
  },
  {
    id: 'high_barrier',
    nameJa: '🛡️ 高バリアタイプ',
    descriptionJa: '長期保存に最適、最高の遮断性',
    colorClass: 'from-amber-50 to-orange-50 border-amber-200',
    headerBg: 'bg-gradient-to-r from-amber-500 to-orange-500'
  },
  {
    id: 'kraft',
    nameJa: '🌿 クラフトタイプ',
    descriptionJa: '自然素材風、環境に優しい',
    colorClass: 'from-emerald-50 to-green-50 border-emerald-200',
    headerBg: 'bg-gradient-to-r from-emerald-500 to-green-500'
  }
];

// ============= 厚さオプション =============

export interface MaterialThicknessOption {
  id: string;
  name: string;
  nameJa: string;
  specification: string;
  specificationEn: string;
  weightRange: string;
  multiplier: number;
  filmLayers: FilmStructureLayer[];
}

// ============= 内容物ラベル =============

export const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  'food': '食品',
  'health_supplement': '健康食品',
  'cosmetic': '化粧品',
  'quasi_drug': '医薬部外品',
  'drug': '医薬品',
  'other': 'その他'
};

export const CONTENTS_TYPE_LABELS: Record<string, string> = {
  'solid': '固体',
  'powder': '粉体',
  'liquid': '液体'
};

export const MAIN_INGREDIENT_LABELS: Record<string, string> = {
  'general_neutral': '一般/中性',
  'oil_surfactant': 'オイル/界面活性剤',
  'acidic_salty': '酸性/塩分',
  'volatile_fragrance': '揮発性/香料',
  'other': 'その他'
};

export const DISTRIBUTION_ENVIRONMENT_LABELS: Record<string, string> = {
  'general_roomTemp': '一般/常温',
  'light_oxygen_sensitive': '光/酸素敏感',
  'refrigerated': '冷凍保管',
  'high_temp_sterilized': '高温殺菌',
  'other': 'その他'
};

export const getContentsDisplay = (
  productCategory: string,
  contentsType: string,
  mainIngredient: string,
  distributionEnvironment: string
): string => {
  const categoryLabel = PRODUCT_CATEGORY_LABELS[productCategory] || '';
  const typeLabel = CONTENTS_TYPE_LABELS[contentsType] || '';
  const ingredientLabel = MAIN_INGREDIENT_LABELS[mainIngredient] || '';
  const environmentLabel = DISTRIBUTION_ENVIRONMENT_LABELS[distributionEnvironment] || '';

  if (categoryLabel && typeLabel && ingredientLabel && environmentLabel) {
    return `${categoryLabel}（${typeLabel}） / ${ingredientLabel} / ${environmentLabel}`;
  }
  return '';
};

// ============= ステップ定義 =============

export interface WizardStep {
  id: string;
  title: string;
  icon: any;
  description: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 'specs', title: '基本仕様', icon: 'Package', description: 'サイズ・素材・厚さ' },
  { id: 'post-processing', title: '後加工', icon: 'Settings', description: '追加仕様' },
  { id: 'sku-quantity', title: 'SKU・数量', icon: 'Layers', description: 'SKU数と数量設定' },
  { id: 'result', title: '見積結果', icon: 'Calendar', description: '価格詳細' }
];

// ============= バリデーション =============

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// バリデーション関数
export const validateHeight = (
  height: number,
  bagTypeId: string,
  width?: number,
  depth?: number
): string => {
  // 平袋(平袋): 最大高さ 360mm
  if (bagTypeId === 'flat_3_side' && height > 360) {
    return '高さは360mm以下で入力してください';
  }

  // スタンドパウチ: 展開サイズ (高さ×2＋底) 690mm以下
  if (bagTypeId === 'stand_up' && height && depth) {
    const expandedSize = (height * 2) + depth;
    if (expandedSize > 690) {
      return `展開サイズ（高さ×2＋底）は690mm以下（現在: ${expandedSize}mm）`;
    }
  }

  // ガゼットパウチ: 横＋側面 350mm以下（側面＝depth/2）
  if (bagTypeId === 'box' && width && depth) {
    const widthWithSide = width + (depth / 2);
    if (widthWithSide > 350) {
      return `横＋側面は350mm以下（現在: ${width}mm＋${depth / 2}mm＝${widthWithSide}mm）`;
    }
  }

  return '';
};

// ガゼット表示判定
export const shouldShowGusset = (bagTypeId: string): boolean => {
  return bagTypeId === 'stand_up' || bagTypeId === 'gusset';
};
