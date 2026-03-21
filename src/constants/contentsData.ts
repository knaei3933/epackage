/**
 * Contents Dropdown Data Constants
 *
 * Product category, contents type, main ingredient, and distribution environment options
 * コンテンツ選択ドロップダウンのデータ定義
 */

export interface DropdownOption {
  value: string;
  label: string;
  labelJa: string;
  disabled?: boolean;
}

export const PRODUCT_CATEGORIES: readonly DropdownOption[] = [
  { value: '', label: 'Select', labelJa: '選択してください', disabled: true },
  { value: 'food', label: 'Food', labelJa: '食品' },
  { value: 'health_supplement', label: 'Health Supplement', labelJa: '健康食品' },
  { value: 'cosmetic', label: 'Cosmetic', labelJa: '化粧品' },
  { value: 'quasi_drug', label: 'Quasi Drug', labelJa: '医薬部外品' },
  { value: 'drug', label: 'Drug', labelJa: '医薬品' },
  { value: 'other', label: 'Other', labelJa: 'その他' },
] as const;

export const CONTENTS_TYPES: readonly DropdownOption[] = [
  { value: '', label: 'Select', labelJa: '選択してください', disabled: true },
  { value: 'solid', label: 'Solid', labelJa: '固体' },
  { value: 'powder', label: 'Powder', labelJa: '粉体' },
  { value: 'liquid', label: 'Liquid', labelJa: '液体' },
] as const;

export const MAIN_INGREDIENTS: readonly DropdownOption[] = [
  { value: '', label: 'Select', labelJa: '選択してください', disabled: true },
  { value: 'general_neutral', label: 'General/Neutral', labelJa: '一般/中性' },
  { value: 'oil_surfactant', label: 'Oil/Surfactant', labelJa: 'オイル/界面活性剤' },
  { value: 'acidic_salty', label: 'Acidic/Salty', labelJa: '酸性/塩分' },
  { value: 'volatile_fragrance', label: 'Volatile/Fragrance', labelJa: '揮発性/香料' },
  { value: 'other', label: 'Other', labelJa: 'その他' },
] as const;

export const DISTRIBUTION_ENVIRONMENTS: readonly DropdownOption[] = [
  { value: '', label: 'Select', labelJa: '選択してください', disabled: true },
  { value: 'general_roomTemp', label: 'General/Room Temperature', labelJa: '一般/常温' },
  { value: 'light_oxygen_sensitive', label: 'Light/Oxygen Sensitive', labelJa: '光/酸素敏感' },
  { value: 'refrigerated', label: 'Refrigerated', labelJa: '冷凍保管' },
  { value: 'high_temp_sterilized', label: 'High Temperature Sterilized', labelJa: '高温殺菌' },
  { value: 'other', label: 'Other', labelJa: 'その他' },
] as const;

/**
 * Type guards for dropdown values
 */
export type ProductCategory = typeof PRODUCT_CATEGORIES[number]['value'];
export type ContentsType = typeof CONTENTS_TYPES[number]['value'];
export type MainIngredient = typeof MAIN_INGREDIENTS[number]['value'];
export type DistributionEnvironment = typeof DISTRIBUTION_ENVIRONMENTS[number]['value'];

/**
 * Helper function to get label by value
 */
export function getProductCategoryLabel(value: ProductCategory): string {
  return PRODUCT_CATEGORIES.find(c => c.value === value)?.labelJa || '';
}

export function getContentsTypeLabel(value: ContentsType): string {
  return CONTENTS_TYPES.find(c => c.value === value)?.labelJa || '';
}

export function getMainIngredientLabel(value: MainIngredient): string {
  return MAIN_INGREDIENTS.find(c => c.value === value)?.labelJa || '';
}

export function getDistributionEnvironmentLabel(value: DistributionEnvironment): string {
  return DISTRIBUTION_ENVIRONMENTS.find(c => c.value === value)?.labelJa || '';
}

/**
 * Format contents display string
 */
export function formatContentsDisplay(
  productCategory: ProductCategory,
  contentsType: ContentsType,
  mainIngredient: MainIngredient,
  distributionEnvironment: DistributionEnvironment
): string {
  const parts = [
    getProductCategoryLabel(productCategory),
    getContentsTypeLabel(contentsType),
    getMainIngredientLabel(mainIngredient),
    getDistributionEnvironmentLabel(distributionEnvironment)
  ].filter(Boolean);

  return parts.join(' / ');
}
