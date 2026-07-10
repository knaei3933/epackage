/**
 * Specification helper functions for QuotationDetailClient
 */

import { translateBagType, translateMaterialType, translatePostProcessing, BAG_TYPE_JA } from '@/constants/enToJa';
import { getMaterialSpecification } from '@/lib/unified-pricing-engine';
import { getFilmStructureLabel } from '@/constants/materialTypes';
import { formatContentsDisplay } from '@/constants/contentsData';
import { getPrintingLabelJa } from '@/lib/product-display-name';

export function getBagTypeName(bagTypeId: string): string {
  // 標準定義を優先使用し、不足分のみフォールバック
  const fallbackNames: Record<string, string> = {
    'flat_3_side': '三方シール平袋',
    'three_side_seal': '三方シール平袋',
    'lap_seal': '合掌袋',
    'stand_pouch': 'スタンドパウチ',
    'gusset_pouch': 'ガセットパウチ',
    'zipper_pouch': 'ジッパーパウチ',
    'roll-film': 'ロールフィルム',
  };
  return BAG_TYPE_JA[bagTypeId as keyof typeof BAG_TYPE_JA] || fallbackNames[bagTypeId] || bagTypeId || '-';
}

/**
 * 素材IDを日本語名に変換
 */
export function getMaterialName(materialId: string): string {
  // 標準定義を優先使用し、不足分のみフォールバック
  const fallbackNames: Record<string, string> = {
    'pet_al': 'PET/AL (アルミ箔ラミネート)',
    'pet_ny_al': 'PET/NY/AL',
    'pet_pe': 'PET/PE (透明ラミネート)',
    'pet_ldpe': 'PET/LLDPE',
    'ny_lldpe': 'NY/LLDPE',
    'pet_vmpet': 'PET/VMPET',
    'kraft_vmpet_lldpe': 'クラフト/VMPET/LLDPE',
    'kraft_pet_lldpe': 'クラフト/PET/LLDPE',
    'kp': 'kraft (クラフト紙)',
    'kraft': 'クラフト紙',
    'ny_pe': 'NY/PE',
    'pet_ny': 'PET/NY',
  };
  // 標準定義のMATERIAL_TYPE_JAを優先
  return translateMaterialType(materialId) || fallbackNames[materialId] || materialId || '-';
}

/**
 * 厚さを材料構造で表示 (materialId + thicknessSelection から specification を取得)
 */
export function getThicknessName(materialId: string, thicknessSelection: string, fallbackThickness?: string): string {
  // materialId と thicknessSelection の組み合わせから specification を取得
  if (materialId && thicknessSelection) {
    const spec = getMaterialSpecification(materialId, thicknessSelection);
    if (spec !== '-') return spec;
  }

  // 非標準の thicknessSelection 値（light_50, standard_70など）のフォールバック
  let normalizedThickness = thicknessSelection;
  if (thicknessSelection) {
    // light_50 -> light, standard_70 -> standard, heavy_90 -> heavy などの変換
    if (thicknessSelection.includes('_')) {
      const parts = thicknessSelection.split('_');
      normalizedThickness = parts[0]; // 'light_50' -> 'light'
    }
  }

  // 正規化された値で再試行
  if (materialId && normalizedThickness && normalizedThickness !== thicknessSelection) {
    const spec = getMaterialSpecification(materialId, normalizedThickness);
    if (spec !== '-') return spec;
  }

  // 素材別のデフォルト仕様
  // kraft 系は仕様値（50g/80g）が未確定のため Phase 2 後退（現状維持）。
  // kraft 以外は getFilmStructureLabel（materialData.ts の specificationEn）で統合。
  if (materialId) {
    const isKraft = materialId === 'kraft_vmpet_lldpe' || materialId === 'kraft_pet_lldpe';
    if (isKraft) {
      const defaultThicknessSpec: Record<string, string> = {
        'kraft_vmpet_lldpe': 'Kraft 80g/m² + VMPET 12μ + LLDPE 90μ',
        'kraft_pet_lldpe': 'Kraft 80g/m² + PET 12μ + LLDPE 70μ',
      };
      const defaultSpec = defaultThicknessSpec[materialId];
      if (defaultSpec) return defaultSpec;
    } else {
      const label = getFilmStructureLabel(materialId, thicknessSelection);
      if (label && label !== materialId) return label;
    }
  }

  // フォールバック: 日本語変換
  const names: Record<string, string> = {
    'thin': '薄手',
    'standard': '標準',
    'medium': '中厚',
    'thick': '厚手',
    'extra_thick': '超厚手',
    'extra-thick': '超厚手',
    'light': '軽量',
    'light_50': '軽量 (~50g)',
    'standard_70': '標準 (~70g)',
    'heavy_90': '高耐久 (~90g)',
    'ultra_100': '超耐久 (~100g)',
    'heavy': '高耐久',
    'ultra': '超耐久',
  };
  return names[fallbackThickness || ''] || names[thicknessSelection] || names[normalizedThickness] || fallbackThickness || thicknessSelection || '-';
}

/**
 * 内容量物情報を日本語で変換
 */
export function getContentsDisplay(specs: Record<string, unknown> | undefined): string {
  if (!specs) return '-';

  const productCategoryMap: Record<string, string> = {
    'food': '食品',
    'health_supplement': '健康補助食品',
    'cosmetic': '化粧品',
    'quasi_drug': '医薬部外品',
    'drug': '医薬品',
  };
  const contentsTypeMap: Record<string, string> = {
    'solid': '固形',
    'powder': '粉体',
    'liquid': '液体',
  };
  const mainIngredientMap: Record<string, string> = {
    'general_neutral': '一般・中性',
    'oil_surfactant': '油性・界面活性剤',
    'acidic_salty': '酸性・塩分',
    'volatile_fragrance': '揮発性・香料',
    'other': 'その他',
  };
  const distributionEnvironmentMap: Record<string, string> = {
    'general_roomTemp': '一般（常温）',
    'light_oxygen_sensitive': '光・酸素敏感',
    'refrigerated': '冷蔵',
    'high_temp_sterilized': '高温殺菌',
    'other': 'その他',
  };

  const contents = [
    specs?.productCategory ? productCategoryMap[specs.productCategory as string] : null,
    specs?.contentsType ? contentsTypeMap[specs.contentsType as string] : null,
    specs?.mainIngredient ? mainIngredientMap[specs.mainIngredient as string] : null,
    specs?.distributionEnvironment ? distributionEnvironmentMap[specs.distributionEnvironment as string] : null,
  ].filter(Boolean).join('、');

  return contents || '-';
}

/**
 * Map database specifications to PDF template format
 */
export function mapSpecificationsToPDF(specs: Record<string, unknown> | undefined): Record<string, string | boolean | number> {
  if (!specs) return {};

  const bagTypeId = specs?.bagTypeId as string | undefined;
  const materialId = specs?.materialId as string | undefined;
  const postProcessingOptions = specs?.postProcessingOptions as string[] | undefined;
  const productCategory = specs?.productCategory as string | undefined;
  const contentsType = specs?.contentsType as string | undefined;
  const mainIngredient = specs?.mainIngredient as string | undefined;
  const distributionEnvironment = specs?.distributionEnvironment as string | undefined;
  const printingType = specs?.printingType as string | undefined;

  // サイズ表示 - ロールフィルムの場合は常に「幅: ○mm、ピッチ: ○mm」
  // 旧データ（二重ネスト）と新データ（修正後）の両方に対応
  const pitchValue = specs?.pitch || (specs?.specifications as any)?.pitch || 0;
  const sideWidth = specs?.sideWidth as number | undefined;
  let sizeDisplay = '';
  if (bagTypeId === 'roll_film' || bagTypeId === 'standup_pouch') {
    sizeDisplay = `幅: ${specs?.width || 0}mm${pitchValue ? `、ピッチ: ${pitchValue}mm` : ''}`;
  } else {
    // 既存のdimensionsがある場合はそれをベースに、なければ個別フィールドから構築
    const existingDimensions = specs?.dimensions as string;
    if (existingDimensions) {
      // 既存のdimensionsに側面が含まれていない場合、追加する
      if (sideWidth && !existingDimensions.includes('側面')) {
        // dimensionsの最後の"mm"の前に側面を追加
        sizeDisplay = existingDimensions.replace(' mm', `${sideWidth ? `×側面${sideWidth}` : ''} mm`);
      } else {
        sizeDisplay = existingDimensions;
      }
    } else {
      // dimensionsがない場合は個別フィールドから構築
      sizeDisplay = `${specs?.width || 0}×${specs?.height || 0}${((specs?.depth as number || 0) > 0 && bagTypeId !== 'lap_seal') ? `×${specs?.depth}` : ''}${sideWidth ? `×側面${sideWidth}` : ''}`;
    }
  }

  // ノッチ形状: postProcessingOptionsからマッピング
  let notchShape = 'V';
  if (postProcessingOptions?.includes('notch-straight')) {
    notchShape = '直線';
  } else if (postProcessingOptions?.includes('notch-no')) {
    notchShape = 'なし';
  }

  // 吊り下げ加工: postProcessingOptionsからマッピング
  let hanging = 'なし';
  let hangingPosition = '指定位置';
  if (postProcessingOptions?.includes('hang-hole-6mm')) {
    hanging = 'あり';
    hangingPosition = '6mm';
  } else if (postProcessingOptions?.includes('hang-hole-8mm')) {
    hanging = 'あり';
    hangingPosition = '8mm';
  }

  // シール幅: sealWidthフィールドまたはpostProcessingOptionsから抽出
  let sealWidth = '5mm'; // デフォルト値
  const sealWidthField = specs?.sealWidth as string | undefined;
  if (sealWidthField) {
    sealWidth = sealWidthField.replace('シール幅 ', '').replace('mm', '');
  } else {
    // postProcessingOptionsからシール幅を見つ
    const sealWidthOption = postProcessingOptions?.find((opt: string) => opt.startsWith('sealing-width-'));
    if (sealWidthOption) {
      const widthMatch = sealWidthOption.match(/sealing-width-(.+)$/);
      if (widthMatch) {
        sealWidth = widthMatch[1].replace('-', '.');
      }
    }
  }

  // シール方向 (デフォルト: 上端)
  const sealDirection = '上';

  // 厚さタイプ - thicknessSelectionを使用、なければデフォルト値
  const thicknessSelection = specs?.thicknessSelection as string | undefined;
  let thicknessType = '-';
  if (materialId && thicknessSelection) {
    thicknessType = getMaterialSpecification(materialId, thicknessSelection);
  }
  if (thicknessType === '-' && materialId) {
    // 素材別のデフォルト仕様
    // kraft 系は仕様値（50g/80g）が未確定のため Phase 2 後退（現状維持）。
    // kraft 以外は getFilmStructureLabel（materialData.ts の specificationEn）で統合。
    const isKraft = materialId === 'kraft_vmpet_lldpe' || materialId === 'kraft_pet_lldpe';
    if (isKraft) {
      const defaultThicknessSpec: Record<string, string> = {
        'kraft_vmpet_lldpe': 'Kraft 80g/m² + VMPET 12μ + LLDPE 90μ',
        'kraft_pet_lldpe': 'Kraft 80g/m² + PET 12μ + LLDPE 70μ',
      };
      thicknessType = defaultThicknessSpec[materialId] || '-';
    } else {
      const label = getFilmStructureLabel(materialId, thicknessSelection);
      thicknessType = (label && label !== materialId) ? label : '-';
    }
  }

  const result = {
    bagType: bagTypeId ? translateBagType(bagTypeId) : 'スタンドパウチ',
    contents: formatContentsDisplay(productCategory as any, contentsType as any, mainIngredient as any, distributionEnvironment as any) || '指定なし',
    size: sizeDisplay,
    material: materialId ? translateMaterialType(materialId) : 'PET+AL',
    thicknessType,
    sealWidth,
    sealDirection,
    notchShape,
    notchPosition: (postProcessingOptions?.includes('notch-yes') || postProcessingOptions?.includes('notch-straight')) ? '指定位置' : undefined,
    hanging,
    hangingPosition,
    zipperPosition: postProcessingOptions?.some(opt => opt.includes('zipper') || opt.includes('zip')) ? '指定位置' : 'なし',
    cornerR: postProcessingOptions?.includes('corner-round') ? 'R5' : postProcessingOptions?.includes('corner-square') ? 'R0' : 'R5',
    machiPrinting: postProcessingOptions?.includes('machi-printing-yes') ? 'あり' : 'なし',
    printingType: getPrintingLabelJa(printingType, undefined),
  };
  return result;
}

