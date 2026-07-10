/**
 * Processing utility functions
 */

import { processingOptionsConfig, PROCESSING_CATEGORIES, getProcessingOptionById, getProcessingOptionsByCategory, getProcessingOptionsByCompatibility } from '../processingConfig';
import type { ProcessingOptionConfig } from '../processingConfig';

export const getDefaultPostProcessingOptions = (bagTypeId?: string): string[] => {
  // 各カテゴリーの最初のオプションをデフォルトとして返す
  // 並び順（PostProcessingStep.tsxのOPTION_CATEGORIES順）:
  // 1. zipper → zipper-yes
  // 2. finish → glossy
  // 3. notch → notch-yes
  // 4. hang-hole → hang-hole-6mm
  // 5. corner → corner-round
  // 6. valve → valve-no
  // 7. open → top-open
  // 8. sealing-width → sealing-width-5mm (コメントアウト、自動選択しない)
  // 9. machi-printing → machi-printing-no

  // 合掌袋・ガゼットパウチはジッパー・角加工非対応
  const isExcludedZipperCorner = bagTypeId === 'lap_seal' || bagTypeId === 'box';

  // スパウトパウチは表面処理のみ対応
  const isSpoutPouch = bagTypeId === 'spout_pouch';

  // ロールフィルムは表面処理のみ対応
  const isRollFilm = bagTypeId === 'roll_film';

  const allDefaults = [
    'zipper-yes',      // ジッパー付き
    'glossy',          // 光沢仕上げ
    'notch-yes',       // Vノッチ
    'hang-hole-6mm',   // 吊り穴(6mm)
    'corner-round',    // 角丸
    'valve-no',        // バルブなし
    'top-open',        // 上端開封
    // 'sealing-width-5mm', // シール幅は自動選択しない（別途制御）
    'machi-printing-no' // マチ印刷なし
  ];

  // スパウトパウチ: 表面処理のみ
  if (isSpoutPouch) {
    const spoutDefaults = ['glossy'];
    console.log('[getDefaultPostProcessingOptions] bagTypeId:', bagTypeId, 'isSpoutPouch:', true, 'Returning defaults:', spoutDefaults);
    return spoutDefaults;
  }

  // ロールフィルム: 表面処理のみ
  if (isRollFilm) {
    const rollFilmDefaults = ['glossy'];
    console.log('[getDefaultPostProcessingOptions] bagTypeId:', bagTypeId, 'isRollFilm:', true, 'Returning defaults:', rollFilmDefaults);
    return rollFilmDefaults;
  }

  // 合掌袋・ガゼットパウチ: ジッパーと角加工を除外
  let defaults = allDefaults;
  if (isExcludedZipperCorner) {
    defaults = allDefaults.filter(id => id !== 'zipper-yes' && id !== 'corner-round');
  }

  console.log('[getDefaultPostProcessingOptions] bagTypeId:', bagTypeId, 'isExcludedZipperCorner:', isExcludedZipperCorner, 'Returning defaults:', defaults);
  return defaults;
};

/**
 * 後加工オプション配列から乗数を計算
 * processingConfig.tsのpriceMultiplierを使用
 *
 * 注意: glossyとmatteは価格乘数ではなく追加費用として計算されるため除外
 */
export const calculatePostProcessingMultiplier = (options: string[]): number => {
  if (!options || options.length === 0) {
    return 1.0;
  }

  // 価格乘数計算から除外するオプション（追加費用として計算されるもの）
  const EXCLUDED_FROM_MULTIPLIER = ['glossy', 'matte'];

  let multiplier = 1.0;

  for (const optionId of options) {
    // glossyとmatteは乘数計算から除外
    if (EXCLUDED_FROM_MULTIPLIER.includes(optionId)) {
      continue;
    }

    const option = processingOptionsConfig.find(opt => opt.id === optionId);
    if (option) {
      multiplier *= option.priceMultiplier;
    }
  }

  return multiplier;
};

/**
 * カテゴリ別に1つのみ選択可能かチェック
 * 同じカテゴリで複数選択されている場合はfalseを返す
 */
export const validateCategorySelection = (
  selectedOptions: string[],
  selectedOptionId: string
): { valid: boolean; conflictingOption?: string } => {
  const newOption = processingOptionsConfig.find(opt => opt.id === selectedOptionId);
  if (!newOption) return { valid: true };

  // 同じカテゴリで選択されている他のオプションをチェック
  const conflictingOption = selectedOptions.find(optionId => {
    if (optionId === selectedOptionId) return false;
    const existingOption = processingOptionsConfig.find(opt => opt.id === optionId);
    return existingOption?.category === newOption.category;
  });

  if (conflictingOption) {
    return { valid: false, conflictingOption };
  }

  return { valid: true };
};

/**
 * Calculate processing impact from selected options
 */
export const calculateProcessingImpact = (selectedOptions: string[]) => {
  const multiplier = calculatePostProcessingMultiplier(selectedOptions)

  // Calculate additional processing time
  const selectedOptionsData = selectedOptions
    .map(id => getProcessingOptionById(id))
    .filter((opt): opt is ProcessingOptionConfig => opt !== undefined)

  const maxProcessingTime = selectedOptionsData.reduce((max, opt) => {
    const timeValue = parseInt(opt.processingTimeJa.match(/\d+/)?.[0] || '0')
    return Math.max(max, timeValue)
  }, 0)

  const minQuantity = Math.max(...selectedOptionsData.map(opt => opt.minimumQuantity))

  return {
    multiplier,
    processingTimeJa: maxProcessingTime > 0 ? `+${maxProcessingTime}営業日` : '標準生産時間',
    minimumQuantity: minQuantity || 500
  }
}

// getProcessingCategories moved back to processingConfig.ts to avoid circular import
