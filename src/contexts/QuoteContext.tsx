'use client';

import React, { createContext, useContext, useReducer, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { UnifiedQuoteResult } from '@/lib/unified-pricing-engine';
import { safeMap } from '@/lib/array-helpers';
import { BAG_TYPE_JA, MATERIAL_TYPE_JA, THICKNESS_TYPE_JA, PRINTING_TYPE_JA, UNIT_JA, LABEL_JA, POST_PROCESSING_JA, translateBagType, translateMaterialType, translateToJapanese } from '@/constants/enToJa';
import type { FilmStructureLayer } from '@/lib/film-cost-calculator';
import { distributeLengthEvenly } from '@/lib/roll-film-utils';
import { determineMaterialWidth } from '@/lib/material-width-selector';
import {
  MAX_POST_PROCESSING_ITEMS,
  calculateRemainingSlots,
  isSelectionLimitReached,
  validatePostProcessingSelection,
  type PostProcessingLimitState,
  type PostProcessingValidationError
} from '@/components/quote/shared/postProcessingLimits';
import type { ProcessingOptionConfig } from '@/components/quote/shared/processingConfig';
import {
  processingOptionsConfig,
  getDefaultPostProcessingOptions,
  validateCategorySelection
} from '@/components/quote/shared/processingConfig';
import { getAvailableGussetSizes, getDefaultGussetSize, validateWidthStep } from '@/lib/gusset-data';

// Quote state interface
export interface QuoteState {
  bagTypeId: string;
  materialId: string;
  width: number | undefined;
  height: number | undefined;
  depth: number | undefined;
  sideWidth?: number; // Side width (よこめん) - for center_seal and box_pouch
  quantities: number[]; // Multiple quantity patterns
  quantity: number; // Selected quantity for calculation
  isUVPrinting: boolean;
  postProcessingOptions: string[];
  postProcessingMultiplier: number;
  postProcessingLimit: PostProcessingLimitState;
  postProcessingValidationError?: PostProcessingValidationError;
  thicknessSelection?: string;
  // Internal flag to force recalculation when post-processing options change
  _forceRecalculate?: boolean;
  printingType?: 'digital' | 'gravure';
  printingColors?: number;
  doubleSided?: boolean;
  deliveryLocation?: 'domestic' | 'international';
  urgency?: 'standard' | 'express';
  spoutPosition?: 'top-left' | 'top-right' | 'center-left' | 'center-right' | 'bottom-left' | 'bottom-right';
  // Roll film specific fields
  pitch?: number;                 // Design pitch/repeat (mm) - for roll_film (デザインの繰り返し周期)
  totalLength?: number;           // Total length (m) - for roll_film
  rollCount?: number;             // Number of rolls - for roll_film
  distributedQuantities?: number[]; // Auto-distributed lengths per roll
  editableQuantities?: number[];   // User-modified lengths per roll
  materialWidth?: number;         // Film material width (540 or 740mm) - for roll_film
  filmLayers?: Array<{           // Film structure layers - for roll_film
    materialId: string;
    thickness: number;
  }>;
  // SKU-related fields (新增: SKU別原価計算対応)
  skuCount: number;               // Number of SKUs (1-100)
  skuQuantities: number[];        // Quantity for each SKU [500, 500] for 2 SKUs
  quantityMode: 'single' | 'sku'; // Single quantity vs SKU-specific mode
  useSKUCalculation: boolean;     // Enable SKU-based cost calculation
  // 2列生産オプション適用情報 (オプション適用後の価格を保持)
  twoColumnOptionApplied?: 'same' | 'double' | null;
  discountedUnitPrice?: number;   // オプション適用後の単価
  discountedTotalPrice?: number;  // オプション適用後の合計価格
  originalUnitPrice?: number;     // オプション適用前の元の単価
  fixedTotalQuantity?: number;     // 2列生産オプション適用後の固定総数量（SKU数量変更時に維持）
  sealWidth?: string;              // Seal width option ('5mm', '7.5mm', '10mm')
  // 내용물 (Contents) 필드 - 기본값 없음 (사용자 선택 필수)
  productCategory?: 'food' | 'health_supplement' | 'cosmetic' | 'quasi_drug' | 'drug' | ''; // 제품 유형
  contentsType?: 'solid' | 'powder' | 'liquid' | ''; // 내용물 형태
  mainIngredient?: 'general_neutral' | 'oil_surfactant' | 'acidic_salty' | 'volatile_fragrance' | 'other' | ''; // 주요성분
  distributionEnvironment?: 'general_roomTemp' | 'light_oxygen_sensitive' | 'refrigerated' | 'high_temp_sterilized' | 'other' | ''; // 유통환경
}

// Action types
type QuoteAction =
  | { type: 'SET_BASIC_SPECS'; payload: Partial<Pick<QuoteState, 'bagTypeId' | 'materialId' | 'width' | 'height' | 'depth' | 'sideWidth' | 'thicknessSelection' | 'pitch'>> }
  | { type: 'SET_QUANTITY_OPTIONS'; payload: Partial<Pick<QuoteState, 'quantities' | 'quantity' | 'isUVPrinting' | 'printingType' | 'printingColors' | 'doubleSided'>> & { isUVPrinting?: boolean } }
  | { type: 'SET_POST_PROCESSING'; payload: { options: string[]; multiplier: number } }
  | { type: 'SET_DELIVERY'; payload: { location: 'domestic' | 'international'; urgency: 'standard' | 'express' } }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof QuoteState; value: any } }
  | { type: 'ADD_QUANTITY_PATTERN'; payload: number }
  | { type: 'REMOVE_QUANTITY_PATTERN'; payload: number }
  | { type: 'ADD_POST_PROCESSING_OPTION'; payload: { optionId: string; allOptions?: Array<{ id: string; category: string; compatibility?: string[]; priority: number; impact: number }> } }
  | { type: 'REMOVE_POST_PROCESSING_OPTION'; payload: string }
  | { type: 'REPLACE_POST_PROCESSING_OPTION'; payload: { oldOptionId: string; newOptionId: string } }
  | { type: 'CLEAR_POST_PROCESSING_VALIDATION_ERROR' }
  | { type: 'SET_ROLL_FILM_QUANTITY'; payload: { totalLength: number; rollCount: number } }
  | { type: 'SET_DISTRIBUTED_QUANTITIES'; payload: number[] }
  | { type: 'UPDATE_SINGLE_QUANTITY'; payload: { index: number; value: number } }
  | { type: 'RESET_QUOTE' }
  // SKU-related actions (新增: SKU別原価計算対応)
  | { type: 'SET_SKU_COUNT'; payload: number }
  | { type: 'SET_SKU_QUANTITIES'; payload: number[] }
  | { type: 'UPDATE_SKU_QUANTITY'; payload: { index: number; value: number } }
  | { type: 'SET_QUANTITY_MODE'; payload: 'single' | 'sku' }
  | { type: 'TOGGLE_SKU_CALCULATION'; payload: boolean }
  // 新規: 推奨機能関連
  | { type: 'CLEAR_RECOMMENDATION_CACHE' }
  | { type: 'APPLY_TWO_COLUMN_OPTION'; payload: { optionType: 'same' | 'double'; unitPrice: number; totalPrice: number; originalUnitPrice: number; quantity: number } }
  | { type: 'APPLY_SKU_SPLIT'; payload: { skuCount: number; quantities: number[] } }
  | { type: 'CLEAR_APPLIED_OPTION' } // 옵션 적용 상태를 클리어
  | { type: 'SET_SEAL_WIDTH'; payload: string } // Seal width setting
  | { type: 'SET_CONTENTS'; payload: { productCategory: QuoteState['productCategory']; contentsType: QuoteState['contentsType']; mainIngredient: QuoteState['mainIngredient']; distributionEnvironment: QuoteState['distributionEnvironment'] } }; // 내용물 설정

// Helper function to get default film layers based on material ID and thickness selection
// LLDPE thickness varies based on thicknessSelection: light=50, medium=70, standard=90, heavy=100, ultra=110
function getDefaultFilmLayers(materialId: string, thicknessSelection: string = 'standard'): Array<{ materialId: string; thickness: number }> {
  // LLDPE base thickness for each thickness selection - 50, 70, 90, 100, 110μm
  const lldpeBaseThickness: Record<string, number> = {
    'light': 50,
    'medium': 70,
    'standard': 90,
    'heavy': 100,
    'ultra': 110
  };

  const lldpeThickness = lldpeBaseThickness[thicknessSelection] ?? 90;

  const layerMap: Record<string, (lldpe: number) => Array<{ materialId: string; thickness: number }>> = {
    'pet_al': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'pet_vmpet': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'VMPET', thickness: 12 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'pet_ny': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'NY', thickness: 15 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'pet_ny_al': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'NY', thickness: 16 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'pet_ldpe': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'kp_pe': () => [
      { materialId: 'KP', thickness: 12 },
      { materialId: 'PE', thickness: 60 }
    ],
    'pet': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'pet_al_pet': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ]
  };

  const layersFn = layerMap[materialId] || layerMap['pet_al'];
  return layersFn(lldpeThickness);
}

// Initial state
const initialState: QuoteState = {
  bagTypeId: 'flat_3_side',
  materialId: 'pet_al',
  width: 200,
  height: 300,
  depth: 0,
  sideWidth: undefined, // Side width (よこめん) - for center_seal and box_pouch
  quantities: [500, 1000, 2000, 5000, 10000], // Default quantity patterns
  quantity: 500,
  isUVPrinting: false,
  postProcessingOptions: getDefaultPostProcessingOptions('flat_3_side'), // デフォルト値を設定（processingConfig.tsから）
  postProcessingMultiplier: 1.0, // 初期値は1.0（PostProcessingStepで更新）
  postProcessingLimit: {
    selectedItems: [],
    isAtLimit: false,
    remainingSlots: MAX_POST_PROCESSING_ITEMS
  },
  thicknessSelection: 'medium',
  printingType: 'digital',
  printingColors: 1,
  doubleSided: false,
  deliveryLocation: 'domestic',
  urgency: 'standard',
  // Roll film specific fields
  pitch: undefined,               // Design pitch (mm) - 入力必須
  totalLength: undefined,
  rollCount: undefined,
  distributedQuantities: undefined,
  editableQuantities: undefined,
  materialWidth: determineMaterialWidth(200), // 幅200mmに基づいて動的に決定（590mm）
  filmLayers: getDefaultFilmLayers('pet_al', 'medium'), // Default film layers with medium thickness (70μ)
  // SKU-related fields (新增: SKU別原価計算対応)
  skuCount: 1,
  skuQuantities: [0], // デフォルトは数量未入力
  quantityMode: 'single',
  useSKUCalculation: false,
  sealWidth: '5mm', // Seal width default
  // 내용물 (Contents) - 기본값 없음 (사용자 선택 필수)
  productCategory: '', // 선택 필수
  contentsType: '', // 선택 필수
  mainIngredient: '', // 선택 필수
  distributionEnvironment: '' // 선택 필수
};

// DEBUG: Log initial state to verify
console.log('[QuoteContext] initialState created:', {
  materialWidth: initialState.materialWidth,
  filmLayers: initialState.filmLayers,
  filmLayersCount: initialState.filmLayers?.length
});

/**
 * 後加工オプション配列から乗数を計算
 * processingConfig.tsのpriceMultiplierを使用
 *
 * 注意: glossyとmatteは価格乘数ではなく追加費用として計算されるため除外
 * - 表面処理費用 = フィルム幅 × 単価 × 長さ
 */
function calculatePostProcessingMultiplier(options: string[]): number {
  console.log('[calculatePostProcessingMultiplier] Input options:', options);

  if (!options || options.length === 0) {
    console.log('[calculatePostProcessingMultiplier] No options, returning 1.0');
    return 1.0
  }

  // 価格乘数計算から除外するオプション（追加費用として計算されるもの）
  const EXCLUDED_FROM_MULTIPLIER = ['glossy', 'matte'];

  let multiplier = 1.0
  const details: Array<{ id: string; name: string; priceMultiplier: number }> = []

  for (const optionId of options) {
    // glossyとmatteは乘数計算から除外
    if (EXCLUDED_FROM_MULTIPLIER.includes(optionId)) {
      console.log(`[calculatePostProcessingMultiplier] ${optionId} excluded from multiplier (calculated as additional cost)`);
      continue;
    }

    const option = processingOptionsConfig.find(opt => opt.id === optionId)
    if (option) {
      const before = multiplier
      multiplier *= option.priceMultiplier
      details.push({ id: option.id, name: option.name, priceMultiplier: option.priceMultiplier })
      console.log(`[calculatePostProcessingMultiplier] ${option.id} (${option.name}): ${option.priceMultiplier}, ${before} * ${option.priceMultiplier} = ${multiplier}`)
    } else {
      console.warn(`[calculatePostProcessingMultiplier] Option not found: ${optionId}`)
    }
  }

  console.log('[calculatePostProcessingMultiplier] Final multiplier:', multiplier, 'Details:', details);
  return multiplier
}

// Reducer function
function quoteReducer(state: QuoteState, action: QuoteAction): QuoteState {
  switch (action.type) {
    case 'SET_BASIC_SPECS':
      const newMaterialId = action.payload.materialId ?? state.materialId;
      const materialIdChanged = newMaterialId !== state.materialId;
      let newWidth = 'width' in action.payload ? action.payload.width : state.width;
      const widthChanged = newWidth !== state.width;
      const newBagTypeId = action.payload.bagTypeId ?? state.bagTypeId;
      const newThicknessSelection = action.payload.thicknessSelection ?? state.thicknessSelection;

      // スタンドパウチ、ボックスパウチ、スパウトパウチの場合、幅を5mm単位に自動調整
      const needsWidthStep = ['stand_up', 'gusset', 'box', 't_shape', 'm_shape', 'lap_seal', 'spout'].includes(newBagTypeId);
      if (needsWidthStep && newWidth && newWidth >= 70) {
        const widthValidation = validateWidthStep(newWidth);
        if (!widthValidation.valid) {
          newWidth = widthValidation.suggestedWidth;
        }
      }
      const thicknessSelectionChanged = newThicknessSelection !== state.thicknessSelection;

      // 幅変更またはbagTypeId変更時に原反幅を再計算（ただし幅が有効な場合のみ）
      let newMaterialWidth = state.materialWidth;
      if ((widthChanged && newWidth >= 70) || (newBagTypeId !== state.bagTypeId && newBagTypeId === 'roll_film' && newWidth >= 70)) {
        newMaterialWidth = determineMaterialWidth(newWidth);
      }

      // 스탠드파ウチ/박스パウチ/合掌型に変更時、マチ（depth）を自動設定
      let newDepth = 'depth' in action.payload ? action.payload.depth : state.depth;
      const bagTypeIdChanged = newBagTypeId !== state.bagTypeId;
      const needsGusset = ['stand_up', 'gusset', 'box', 't_shape', 'm_shape', 'lap_seal', 'spout'].includes(newBagTypeId);

      if (bagTypeIdChanged && needsGusset) {
        // マッチが必要なタイプで、現在のdepthが0またはundefinedの場合
        if (!state.depth || state.depth === 0) {
          // 幅に基づいてデフォルトマッチサイズを取得
          if (newWidth >= 70) {
            newDepth = getDefaultGussetSize(newWidth);
          } else {
            newDepth = 30; // デフォルト
          }
        }
      } else if (bagTypeIdChanged && newBagTypeId === 'flat_3_side') {
        // 平袋に変更時はdepthを0に設定
        newDepth = 0;
      } else if (widthChanged && needsGusset && newWidth >= 70) {
        // マッチが必要なタイプで幅が変更された場合、現在のdepthが新しい幅のオプションに含まれていないか確認
        const currentGusset = state.depth || 0;
        const availableGussets = getAvailableGussetSizes(newWidth);
        if (availableGussets.length > 0 && !availableGussets.includes(currentGusset)) {
          newDepth = getDefaultGussetSize(newWidth);
        }
      }

      // ★製品タイプ変更時はSKU数量をリセット（ロールフィルム ↔ パウチ）
      if (bagTypeIdChanged) {
        console.log('[SET_BASIC_SPECS] Product type changed from', state.bagTypeId, 'to', newBagTypeId, '- resetting SKU quantities');
        const defaultQuantity = 500;

        // ロールフィルムとパウチの間の切り替え時にheight/pitchを適切に処理
        const isRollFilmNow = newBagTypeId === 'roll_film';
        const wasRollFilm = state.bagTypeId === 'roll_film';

        let newHeight = 'height' in action.payload ? action.payload.height : state.height;
        let newPitch = 'pitch' in action.payload ? action.payload.pitch : state.pitch;

        // パウチ→ロールフィルム: heightはリセット、pitchはundefined
        if (isRollFilmNow && !wasRollFilm) {
          newHeight = undefined;
          newPitch = undefined;
        }
        // ロールフィルム→パウチ: pitchはリセット、heightは維持
        else if (!isRollFilmNow && wasRollFilm) {
          newPitch = undefined;
        }

        // バッグタイプ変更時に投稿加工オプションを更新
        // ロールフィルムとスパウトパウチの場合は表面処理のみ
        // 既存のfinish設定（glossy/matte）を保持する
        const existingFinishOption = state.postProcessingOptions?.find(opt => opt === 'glossy' || opt === 'matte');
        const newPostProcessingOptions = (newBagTypeId === 'roll_film' || newBagTypeId === 'spout_pouch')
          ? (existingFinishOption ? [existingFinishOption] : ['glossy'])
          : getDefaultPostProcessingOptions(newBagTypeId);
        const newPostProcessingMultiplier = calculatePostProcessingMultiplier(newPostProcessingOptions);

        console.log('[SET_BASIC_SPECS] bagTypeId changed:', state.bagTypeId, '->', newBagTypeId);
        console.log('[SET_BASIC_SPECS] existingFinishOption:', existingFinishOption);
        console.log('[SET_BASIC_SPECS] Updating post-processing options:', newPostProcessingOptions);
        console.log('[SET_BASIC_SPECS] newPostProcessingMultiplier:', newPostProcessingMultiplier);

        // SKU数量を1個、デフォルト値にリセット
        return {
          ...state,
          bagTypeId: newBagTypeId,
          materialId: newMaterialId,
          width: newWidth,
          height: newHeight,
          depth: newDepth,
          sideWidth: action.payload.sideWidth ?? state.sideWidth,
          thicknessSelection: newThicknessSelection,
          materialWidth: newMaterialWidth,
          pitch: newPitch,
          // SKU数量をリセット
          skuCount: 1,
          skuQuantities: [defaultQuantity],
          quantityMode: 'single' as const,
          useSKUCalculation: false,
          // 割引関連状態も初期化
          twoColumnOptionApplied: false,
          appliedOption: null,
          fixedTotalQuantity: undefined,
          // 投稿加工オプションを更新
          postProcessingOptions: newPostProcessingOptions,
          postProcessingMultiplier: newPostProcessingMultiplier,
          // Update filmLayers when materialId or thicknessSelection changes
          ...(materialIdChanged || thicknessSelectionChanged ? {
            filmLayers: getDefaultFilmLayers(newMaterialId, newThicknessSelection)
          } : {})
        };
      }

      const newSideWidth = action.payload.sideWidth ?? state.sideWidth;
      console.log('[SET_BASIC_SPECS] No bagTypeId change. action.payload.sideWidth:', action.payload.sideWidth, 'state.sideWidth:', state.sideWidth, 'newSideWidth:', newSideWidth);
      return {
        ...state,
        bagTypeId: newBagTypeId,
        materialId: newMaterialId,
        width: newWidth,
        height: action.payload.height ?? state.height,
        depth: newDepth,
        sideWidth: newSideWidth,
        thicknessSelection: newThicknessSelection,
        materialWidth: newMaterialWidth,
        pitch: action.payload.pitch ?? state.pitch,
        // Update filmLayers when materialId or thicknessSelection changes
        ...(materialIdChanged || thicknessSelectionChanged ? {
          filmLayers: getDefaultFilmLayers(newMaterialId, newThicknessSelection)
        } : {})
      };

    case 'SET_QUANTITY_OPTIONS':
      return {
        ...state,
        quantities: action.payload.quantities ?? state.quantities,
        quantity: action.payload.quantity ?? state.quantity,
        isUVPrinting: action.payload.isUVPrinting ?? state.isUVPrinting,
        printingType: action.payload.printingType ?? state.printingType,
        printingColors: action.payload.printingColors ?? state.printingColors,
        doubleSided: action.payload.doubleSided ?? state.doubleSided
      };

    case 'ADD_QUANTITY_PATTERN':
      const newQuantities = [...state.quantities, action.payload].sort((a, b) => a - b);
      return {
        ...state,
        quantities: newQuantities
      };

    case 'REMOVE_QUANTITY_PATTERN':
      const filteredQuantities = state.quantities.filter(q => q !== action.payload);
      return {
        ...state,
        quantities: filteredQuantities,
        // If selected quantity was removed, select the first available one
        quantity: filteredQuantities.length > 0 ? filteredQuantities[0] : 500
      };

    case 'SET_POST_PROCESSING':
      let optionsToSet = action.payload.options;
      console.log('[SET_POST_PROCESSING] Action received. payload.options:', optionsToSet, 'payload.multiplier:', action.payload.multiplier);

      // カテゴリー別に1つのみ選択されるように強制
      // PostProcessingStep.tsxのOPTION_CATEGORIESと同じ定義を使用
      const OPTION_CATEGORIES_LOCAL: Record<string, string> = {
        'zipper-yes': 'zipper',
        'zipper-no': 'zipper',
        'glossy': 'finish',
        'matte': 'finish',
        'notch-yes': 'notch',
        'notch-no': 'notch',
        'hang-hole-6mm': 'hang-hole',
        'hang-hole-8mm': 'hang-hole',
        'hang-hole-no': 'hang-hole',
        'corner-round': 'corner',
        'corner-square': 'corner',
        'valve-yes': 'valve',
        'valve-no': 'valve',
        'top-open': 'open',
        'bottom-open': 'open',
        'zipper-position-any': 'zipper-position',
        'zipper-position-specified': 'zipper-position'
      };

      // 各カテゴリーから最初のオプションのみを保持
      const categorySeen = new Set<string>();
      const filteredOptions = optionsToSet.filter(optionId => {
        const category = OPTION_CATEGORIES_LOCAL[optionId];
        if (!category) return true; // カテゴリーがないオプションはそのまま保持
        if (categorySeen.has(category)) {
          console.log('[SET_POST_PROCESSING] Filtering out duplicate category option:', optionId, 'category:', category);
          return false;
        }
        categorySeen.add(category);
        return true;
      });

      if (filteredOptions.length !== optionsToSet.length) {
        console.log('[SET_POST_PROCESSING] Filtered options from', optionsToSet.length, 'to', filteredOptions.length);
        optionsToSet = filteredOptions;
      }

      const updatedLimitState = {
        selectedItems: optionsToSet,
        isAtLimit: isSelectionLimitReached(optionsToSet.length),
        remainingSlots: calculateRemainingSlots(optionsToSet.length)
      };
      // 自動的に乗数を計算（payload.multiplierは無視）
      const calculatedMultiplier = calculatePostProcessingMultiplier(optionsToSet);
      console.log('[SET_POST_PROCESSING] Calculated multiplier:', calculatedMultiplier, '(ignoring payload.multiplier:', action.payload.multiplier, ')');

      // 後工程オプション変更時に結果を無効化して再計算を強制
      // これにより、結果ページに移動する際に新しいオプションで計算される
      const currentMultiplier = state.postProcessingMultiplier || 1;
      const multiplierChanged = calculatedMultiplier !== currentMultiplier;

      // オプション配列が変更されたか確認（マット仕上げ変更時の再計算対応）
      const optionsChanged = JSON.stringify(optionsToSet.sort()) !== JSON.stringify(state.postProcessingOptions?.sort() ?? []);

      return {
        ...state,
        postProcessingOptions: optionsToSet,
        postProcessingMultiplier: calculatedMultiplier,
        postProcessingLimit: updatedLimitState,
        // 後工程変更時にフラグを設定（ ImprovedQuotingWizardで結果をクリアするために使用）
        // オプション配列が変更されたら常に再計算を強制（マット/光沢変更対応）
        _forceRecalculate: multiplierChanged || optionsChanged
      };

    case 'ADD_POST_PROCESSING_OPTION':
      const { optionId, allOptions = [] } = action.payload;
      const currentOptions = state.postProcessingOptions;

      // Check if already selected
      if (currentOptions.includes(optionId)) {
        return state;
      }

      // カテゴリ別に1つのみ選択可能
      const validation = validateCategorySelection(currentOptions, optionId);
      if (!validation.valid && validation.conflictingOption) {
        // 同じカテゴリの既存オプションを置き換え
        const updatedOptions = currentOptions.filter(opt => opt !== validation.conflictingOption);
        const finalOptions = [...updatedOptions, optionId];

        const newLimitState = {
          selectedItems: finalOptions,
          isAtLimit: isSelectionLimitReached(finalOptions.length),
          remainingSlots: calculateRemainingSlots(finalOptions.length),
          lastSelectedItem: optionId
        };

        console.log('[ADD_POST_PROCESSING_OPTION] Category conflict resolved, replaced:', validation.conflictingOption, 'with:', optionId);

        // 自動的に乗数を再計算
        const newMultiplier = calculatePostProcessingMultiplier(finalOptions);

        return {
          ...state,
          postProcessingOptions: finalOptions,
          postProcessingMultiplier: newMultiplier,
          postProcessingLimit: newLimitState,
          _forceRecalculate: true
        };
      }

      // Check limit (basic check - category exclusion is handled in pre-validation)
      if (currentOptions.length >= MAX_POST_PROCESSING_ITEMS) {
        return {
          ...state,
          postProcessingValidationError: {
            type: 'limit_exceeded',
            message: `Maximum ${MAX_POST_PROCESSING_ITEMS} post-processing options allowed.`,
            messageJa: `後加工オプションは最大${MAX_POST_PROCESSING_ITEMS}個までです。`,
            suggestedAction: 'Remove an existing option to add a new one',
            suggestedActionJa: '既存のオプションを削除して新しいオプションを追加してください',
            itemsToRemove: [],
            itemsToAdd: [optionId]
          }
        };
      }

      // Add the option
      const updatedOptions = [...currentOptions, optionId];
      const newLimitState = {
        selectedItems: updatedOptions,
        isAtLimit: isSelectionLimitReached(updatedOptions.length),
        remainingSlots: calculateRemainingSlots(updatedOptions.length),
        lastSelectedItem: optionId
      };

      console.log('[ADD_POST_PROCESSING_OPTION] Adding option, updatedOptions:', updatedOptions);

      // 自動的に乗数を再計算
      const newMultiplier = calculatePostProcessingMultiplier(updatedOptions);

      return {
        ...state,
        postProcessingOptions: updatedOptions,
        postProcessingMultiplier: newMultiplier,
        postProcessingLimit: newLimitState,
        postProcessingValidationError: undefined,
        // オプション追加時に再計算を強制
        _forceRecalculate: true
      };

    case 'REMOVE_POST_PROCESSING_OPTION':
      const optionToRemove = action.payload;
      const optionsAfterRemoval = state.postProcessingOptions.filter(id => id !== optionToRemove);
      const limitAfterRemoval = {
        selectedItems: optionsAfterRemoval,
        isAtLimit: isSelectionLimitReached(optionsAfterRemoval.length),
        remainingSlots: calculateRemainingSlots(optionsAfterRemoval.length)
      };

      // 自動的に乗数を再計算
      const newMultiplierAfterRemoval = calculatePostProcessingMultiplier(optionsAfterRemoval);

      return {
        ...state,
        postProcessingOptions: optionsAfterRemoval,
        postProcessingMultiplier: newMultiplierAfterRemoval,
        postProcessingLimit: limitAfterRemoval,
        postProcessingValidationError: undefined,
        // オプション削除時に再計算を強制
        _forceRecalculate: true
      };

    case 'REPLACE_POST_PROCESSING_OPTION':
      const { oldOptionId, newOptionId } = action.payload;
      const optionsAfterReplacement = safeMap(state.postProcessingOptions,
        id => id === oldOptionId ? newOptionId : id);

      const limitAfterReplacement = {
        selectedItems: optionsAfterReplacement,
        isAtLimit: isSelectionLimitReached(optionsAfterReplacement.length),
        remainingSlots: calculateRemainingSlots(optionsAfterReplacement.length),
        lastSelectedItem: newOptionId
      };

      // 自動的に乗数を再計算
      const newMultiplierAfterReplacement = calculatePostProcessingMultiplier(optionsAfterReplacement);

      return {
        ...state,
        postProcessingOptions: optionsAfterReplacement,
        postProcessingMultiplier: newMultiplierAfterReplacement,
        postProcessingLimit: limitAfterReplacement,
        postProcessingValidationError: undefined,
        // オプション置換時に再計算を強制（光沢↔マット変更対応）
        _forceRecalculate: true
      };

    case 'SET_POST_PROCESSING_VALIDATION_ERROR':
      return {
        ...state,
        postProcessingValidationError: action.payload
      };

    case 'CLEAR_POST_PROCESSING_VALIDATION_ERROR':
      return {
        ...state,
        postProcessingValidationError: undefined
      };

    case 'SET_DELIVERY':
      return {
        ...state,
        deliveryLocation: action.payload.location,
        urgency: action.payload.urgency
      };

    case 'UPDATE_FIELD':
      // 基本仕様を変更した場合は結果をクリアして再計算を強制
      const fieldsThatRequireRecalculation = [
        'bagTypeId',
        'materialId',
        'width',
        'height',
        'depth',
        'thicknessSelection',
        'materialWidth',
        'filmLayers'
      ];

      const shouldRecalculate = fieldsThatRequireRecalculation.includes(action.payload.field);

      return {
        ...state,
        [action.payload.field]: action.payload.value,
        // 基本仕様を変更した場合は再計算を強制
        _forceRecalculate: shouldRecalculate
      };

    case 'RESET_QUOTE':
      return initialState;

    case 'SET_ROLL_FILM_QUANTITY': {
      const { totalLength, rollCount } = action.payload;
      const distributed = distributeLengthEvenly(totalLength, rollCount);
      return {
        ...state,
        totalLength,
        rollCount,
        distributedQuantities: distributed,
        editableQuantities: [...distributed],
        quantities: distributed,
        quantity: distributed[0] || 0,
      };
    }

    case 'SET_DISTRIBUTED_QUANTITIES':
      return {
        ...state,
        distributedQuantities: action.payload,
        editableQuantities: [...action.payload],
        quantities: action.payload,
        quantity: action.payload[0] || state.quantity,
      };

    case 'UPDATE_SINGLE_QUANTITY': {
      const { index, value } = action.payload;
      const newEditable = [...(state.editableQuantities || state.quantities || [])];
      newEditable[index] = value;
      return {
        ...state,
        editableQuantities: newEditable,
        quantities: newEditable,
        quantity: newEditable[0] || state.quantity,
      };
    }

    // SKU-related actions (新增: SKU別原価計算対応)
    case 'SET_SKU_COUNT': {
      const newCount = action.payload;
      const currentQuantities = state.skuQuantities || [state.quantity];
      console.log('[SET_SKU_COUNT] Changing SKU count from', state.skuCount, 'to', newCount);
      console.log('[SET_SKU_COUNT] Current quantities:', currentQuantities);
      console.log('[SET_SKU_COUNT] Current quantities length:', currentQuantities.length);

      // CRITICAL FIX: If quantities array already matches new count, preserve it exactly
      // This prevents the reducer from overwriting quantities set by copySKUToAddNew
      if (currentQuantities.length === newCount) {
        console.log('[SET_SKU_COUNT] Quantities array already matches new count, preserving as-is');
        return {
          ...state,
          skuCount: newCount,
          skuQuantities: currentQuantities, // Preserve exact array
          // When SKU count > 1, automatically enable SKU mode
          quantityMode: newCount > 1 ? 'sku' : state.quantityMode,
          useSKUCalculation: newCount > 1 ? true : state.useSKUCalculation
        };
      }

      // Preserve existing quantities when increasing count
      let newSkuQuantities: number[];
      if (newCount > currentQuantities.length) {
        // Find the last valid quantity (>= 100) to use for new SKUs
        const lastValidQuantity = currentQuantities.slice().reverse().find(q => q >= 100) || 100;
        console.log('[SET_SKU_COUNT] Last valid quantity to fill new SKUs:', lastValidQuantity);
        newSkuQuantities = [
          ...currentQuantities,
          ...Array(newCount - currentQuantities.length).fill(lastValidQuantity)
        ];
      } else {
        // Reduce to new count
        newSkuQuantities = currentQuantities.slice(0, newCount);
      }
      console.log('[SET_SKU_COUNT] New quantities:', newSkuQuantities);
      return {
        ...state,
        skuCount: newCount,
        skuQuantities: newSkuQuantities,
        // When SKU count > 1, automatically enable SKU mode
        quantityMode: newCount > 1 ? 'sku' : state.quantityMode,
        useSKUCalculation: newCount > 1 ? true : state.useSKUCalculation
      };
    }

    case 'SET_SKU_QUANTITIES': {
      const quantities = action.payload;
      console.log('[SET_SKU_QUANTITIES] Setting quantities:', quantities);
      console.log('[SET_SKU_QUANTITIES] Current skuCount:', state.skuCount);

      // CRITICAL FIX: If quantities array is longer than skuCount, update skuCount to match
      // This allows copySKUToAddNew to work correctly by setting quantities first
      const newSkuCount = Math.max(state.skuCount, quantities.length);
      console.log('[SET_SKU_QUANTITIES] New skuCount will be:', newSkuCount);

      // Only fill with 100s if quantities array is shorter than new skuCount
      const adjustedQuantities = quantities.length < newSkuCount
        ? [...quantities, ...Array(newSkuCount - quantities.length).fill(100)]
        : quantities;

      console.log('[SET_SKU_QUANTITIES] Adjusted quantities:', adjustedQuantities);
      return {
        ...state,
        skuCount: newSkuCount,
        skuQuantities: adjustedQuantities,
        // Auto-enable SKU mode if count > 1
        quantityMode: newSkuCount > 1 ? 'sku' : state.quantityMode,
        useSKUCalculation: newSkuCount > 1 ? true : state.useSKUCalculation
      };
    }

    case 'UPDATE_SKU_QUANTITY': {
      const { index, value } = action.payload;
      const currentQuantities = state.skuQuantities || [];
      console.log('[UPDATE_SKU_QUANTITY] Updating index:', index, 'to value:', value);
      console.log('[UPDATE_SKU_QUANTITY] Current quantities:', currentQuantities);
      // Ensure array is long enough for the index
      const newSkuQuantities = [...currentQuantities];
      while (newSkuQuantities.length <= index) {
        newSkuQuantities.push(100); // Fill with default quantity
      }
      newSkuQuantities[index] = value;
      console.log('[UPDATE_SKU_QUANTITY] New quantities:', newSkuQuantities);
      return {
        ...state,
        skuQuantities: newSkuQuantities
      };
    }

    case 'TOGGLE_SKU_CALCULATION': {
      return {
        ...state,
        useSKUCalculation: action.payload
      };
    }

    // ★제품 타입 변경 시 SKU 수량 초기화 (롤 ↔ 파우치 전환)
    case 'RESET_SKU_QUANTITIES_ON_PRODUCT_CHANGE': {
      const { defaultQuantity } = action.payload;
      console.log('[RESET_SKU_QUANTITIES_ON_PRODUCT_CHANGE] Resetting SKU quantities to default:', defaultQuantity);
      return {
        ...state,
        skuCount: 1,
        skuQuantities: [defaultQuantity],
        quantityMode: 'single',
        useSKUCalculation: false,
        // 할인 관련 상태도 초기화
        twoColumnOptionApplied: false,
        appliedOption: null,
        fixedTotalQuantity: undefined
      };
    }

    case 'SET_QUANTITY_MODE': {
      return {
        ...state,
        quantityMode: action.payload,
        useSKUCalculation: action.payload === 'sku'
      };
    }

    case 'CLEAR_RECOMMENDATION_CACHE': {
      // 推奨キャッシュクリア
      return {
        ...state,
        _forceRecalculate: true
      };
    }

    case 'APPLY_TWO_COLUMN_OPTION': {
      // 2列生産オプション適用
      // SKU数を維持し、総数量のみを推奨数量に変更
      const { optionType, unitPrice, totalPrice, originalUnitPrice, quantity, preserveSKUCount = true } = action.payload;
      console.log('[APPLY_TWO_COLUMN_OPTION] Applied option:', action.payload);

      // 重要：originalUnitPriceは常に初期価格を保持する
      // 既にoriginalUnitPriceが設定されている場合は、現在の値（initialUnitPrice）を保持
      // 初回適用時のみ、originalUnitPriceを設定
      const effectiveOriginalUnitPrice = state.originalUnitPrice || originalUnitPrice;

      if (preserveSKUCount && state.skuCount > 1) {
        // 複数SKUの場合：総数量を均等分割
        // 各SKUの数量を100単位に丸める
        const quantityPerSKU = Math.floor(quantity / state.skuCount / 100) * 100;

        // 最小数量チェック（パウチ: 500個、ロールフィルム: 300m）
        const minQuantityPerSku = state.bagTypeId === 'roll_film' ? 300 : 500;
        const adjustedQuantityPerSKU = Math.max(quantityPerSKU, minQuantityPerSku);

        // 調整後の総数量を計算
        const adjustedTotalQuantity = adjustedQuantityPerSKU * state.skuCount;

        // 調整された数量配列を作成
        const adjustedQuantities = Array(state.skuCount).fill(adjustedQuantityPerSKU);

        // 調整された総数量に基づいて価格を再計算（単価は維持）
        const adjustedTotalPrice = Math.round(unitPrice * adjustedTotalQuantity);

        console.log('[APPLY_TWO_COLUMN_OPTION] Adjusted for multiple SKUs:', {
          originalTotalQuantity: quantity,
          skuCount: state.skuCount,
          quantityPerSKU: adjustedQuantityPerSKU,
          adjustedTotalQuantity,
          adjustedTotalPrice,
          effectiveOriginalUnitPrice
        });

        return {
          ...state,
          twoColumnOptionApplied: optionType,
          discountedUnitPrice: unitPrice,
          discountedTotalPrice: adjustedTotalPrice,
          originalUnitPrice: effectiveOriginalUnitPrice, // 既存の値を保持
          unitPrice: unitPrice,
          quantity: adjustedTotalQuantity,
          skuCount: state.skuCount, // SKU数を維持
          skuQuantities: adjustedQuantities, // 均等分割された数量
          quantityMode: 'sku',
          fixedTotalQuantity: adjustedTotalQuantity, // 総数量を固定
          _forceRecalculate: false
        };
      }

      // 単一SKUの場合：従来通り
      console.log('[APPLY_TWO_COLUMN_OPTION] Single SKU:', {
        effectiveOriginalUnitPrice,
        optionType,
        unitPrice,
        totalPrice
      });

      return {
        ...state,
        twoColumnOptionApplied: optionType,
        discountedUnitPrice: unitPrice,
        discountedTotalPrice: totalPrice,
        originalUnitPrice: effectiveOriginalUnitPrice, // 既存の値を保持
        unitPrice: unitPrice,
        quantity: quantity,
        skuCount: 1,
        skuQuantities: [quantity],
        quantityMode: 'sku',
        fixedTotalQuantity: quantity, // 総数量を固定
        _forceRecalculate: false
      };
    }

    case 'CLEAR_APPLIED_OPTION': {
      // オプション適用状態をクリア（元の単価に戻す）
      console.log('[CLEAR_APPLIED_OPTION] Clearing applied option');
      return {
        ...state,
        twoColumnOptionApplied: null,
        discountedUnitPrice: undefined,
        discountedTotalPrice: undefined,
        originalUnitPrice: undefined,
        fixedTotalQuantity: undefined, // 固定総数量もクリア
        _forceRecalculate: true // 再計算を強制
      };
    }

    case 'APPLY_SKU_SPLIT': {
      // SKU分割適用
      const { skuCount, quantities } = action.payload;
      console.log('[APPLY_SKU_SPLIT] Applying SKU split:', { skuCount, quantities });
      return {
        ...state,
        skuCount,
        skuQuantities: quantities,
        quantityMode: 'sku',
        _forceRecalculate: true
      };
    }

    case 'SET_SEAL_WIDTH': {
      // シーラー幅を設定
      console.log('[SET_SEAL_WIDTH] Setting seal width to:', action.payload);
      return {
        ...state,
        sealWidth: action.payload,
        _forceRecalculate: true // 再計算を強制
      };
    }

    case 'SET_CONTENTS': {
      // 내용물 설정 (제품 카테고리, 내용물 형태, 주요성분, 유통환경)
      console.log('[SET_CONTENTS] Setting contents:', action.payload);
      return {
        ...state,
        productCategory: action.payload.productCategory,
        contentsType: action.payload.contentsType,
        mainIngredient: action.payload.mainIngredient,
        distributionEnvironment: action.payload.distributionEnvironment
      };
    }

    default:
      return state;
  }
}

// Context interface - only functions, no state
interface QuoteContextType {
  dispatch: React.Dispatch<QuoteAction>;
  updateBasicSpecs: (specs: Partial<Pick<QuoteState, 'bagTypeId' | 'materialId' | 'width' | 'height' | 'depth' | 'sideWidth' | 'pitch' | 'thicknessSelection'>>) => void;
  updateQuantityOptions: (options: Partial<Pick<QuoteState, 'quantities' | 'quantity' | 'isUVPrinting' | 'printingType' | 'printingColors' | 'doubleSided'>> & { isUVPrinting?: boolean }) => void;
  updatePostProcessing: (options: string[], multiplier: number) => void;
  updateDelivery: (location: 'domestic' | 'international', urgency: 'standard' | 'express') => void;
  updateField: (field: keyof QuoteState, value: any) => void;
  resetQuote: () => void;
  addPostProcessingOption: (optionId: string, allOptions?: ProcessingOptionConfig[], currentOptions?: string[]) => boolean;
  removePostProcessingOption: (optionId: string) => void;
  replacePostProcessingOption: (oldOptionId: string, newOptionId: string) => void;
  clearPostProcessingValidationError: () => void;
  // SKU-related helpers (新增: SKU別原価計算対応)
  setSKUCount: (count: number) => void;
  setSKUQuantities: (quantities: number[]) => void;
  updateSKUQuantity: (index: number, value: number) => void;
  setQuantityMode: (mode: 'single' | 'sku') => void;
  toggleSKUCalculation: (enabled: boolean) => void;
  // 新規: 推奨機能関連
  clearRecommendationCache: () => void;
  applyTwoColumnOption: (optionType: 'same' | 'double', unitPrice: number, totalPrice: number, originalUnitPrice: number, quantity: number) => void;
  applySKUSplit: (skuCount: number, quantities: number[]) => void;
  clearAppliedOption: () => void; // オプション適用をクリア
  setSealWidth: (width: string) => void; // シーラー幅設定
  setContents: (productCategory: QuoteState['productCategory'], contentsType: QuoteState['contentsType'], mainIngredient: QuoteState['mainIngredient'], distributionEnvironment: QuoteState['distributionEnvironment']) => void; // 内容量設定（4つのフィールド対応）
}

// Helper functions that need state access - accept state as parameter
export function checkStepComplete(state: QuoteState, step: string): boolean {
  console.log('[checkStepComplete] Called with step:', step, 'state:', {
    bagTypeId: state.bagTypeId,
    materialId: state.materialId,
    width: state.width,
    height: state.height,
    pitch: state.pitch,
    thicknessSelection: state.thicknessSelection,
    // 내용물 필드 추가
    productCategory: state.productCategory,
    contentsType: state.contentsType,
    mainIngredient: state.mainIngredient,
    distributionEnvironment: state.distributionEnvironment
  });

  switch (step) {
    case 'specs':
      // Size requirement: width >= 70mm, height between 70-300mm
      const hasValidWidth = state.width >= 70;
      const requiresHeight = state.bagTypeId !== 'roll_film';
      const hasValidHeight = !requiresHeight || (state.height >= 70 && state.height <= 300);
      const hasBasicSpecs = !!(state.bagTypeId && state.materialId && hasValidWidth);
      const materialsWithThickness = ['pet_al', 'pet_vmpet', 'pet_ldpe', 'pet_ny_al'];
      const requiresThickness = materialsWithThickness.includes(state.materialId);
      const hasThickness = !!state.thicknessSelection;
      // ロールフィルムの場合はピッチ（50-1000mm）も必須
      const isRollFilm = state.bagTypeId === 'roll_film';
      const hasValidPitch = !isRollFilm || (state.pitch && state.pitch >= 50 && state.pitch <= 1000);

      // 내용물 필수 선택 확인
      const hasContents = !!(
        state.productCategory &&
        state.contentsType &&
        state.mainIngredient &&
        state.distributionEnvironment
      );

      const result = hasBasicSpecs && hasValidHeight && hasValidPitch && (!requiresThickness || hasThickness) && hasContents;
      console.log('[checkStepComplete] specs result:', {
        hasValidWidth,
        requiresHeight,
        hasValidHeight,
        hasBasicSpecs,
        requiresThickness,
        hasThickness,
        isRollFilm,
        hasValidPitch,
        hasContents,
        finalResult: result
      });
      return result;
    case 'sku-selection':
      // SKU selection is complete if at least one SKU has valid quantity
      return state.skuQuantities.length > 0 && state.skuQuantities.every(qty => qty >= 100);
    case 'sku-quantity':
      // Unified SKU & Quantity step - check based on mode
      console.log('[checkStepComplete] sku-quantity step check:', {
        quantityMode: state.quantityMode,
        skuCount: state.skuCount,
        skuQuantities: state.skuQuantities,
        quantity: state.quantity
      });
      if (state.quantityMode === 'sku') {
        // SKU mode: all SKUs must have valid quantities
        const isValid = state.skuCount > 0 &&
               state.skuQuantities.length === state.skuCount &&
               state.skuQuantities.every(qty => qty >= 100);
        console.log('[checkStepComplete] sku-quantity SKU mode valid:', isValid);
        return isValid;
      }
      // Single quantity mode
      const singleValid = state.quantity >= 100;
      console.log('[checkStepComplete] sku-quantity single mode valid:', singleValid);
      return singleValid;
    case 'quantity':
      return state.quantity >= 100;
    case 'post-processing':
      // 後加工はすべてのグループから1つずつ選択必須
      // 各グループの定義
      const postProcessingGroups = {
        zipper: ['zipper-yes', 'zipper-no'],
        finish: ['glossy', 'matte'],
        notch: ['notch-yes', 'notch-straight', 'notch-no'],
        'hang-hole': ['hang-hole-6mm', 'hang-hole-8mm', 'hang-hole-no'],
        corner: ['corner-round', 'corner-square'],
        valve: ['valve-yes', 'valve-no'],
        opening: ['top-open', 'bottom-open']
      };

      // ロールフィルム/スパウトパウチの場合、finishグループのみ必須（他は不要）
      const optionalGroups = (state.bagTypeId === 'roll_film' || state.bagTypeId === 'spout_pouch')
        ? ['zipper', 'notch', 'hang-hole', 'corner', 'valve', 'opening']
        : [];

      // 各グループから選択されているオプションをチェック
      const selectedCount = Object.entries(postProcessingGroups).reduce((count, [groupName, options]) => {
        // オプショングループの場合はカウントしない
        if (optionalGroups.includes(groupName)) {
          return count;
        }
        const hasSelection = options.some(opt => state.postProcessingOptions?.includes(opt));
        return hasSelection ? count + 1 : count;
      }, 0);

      // すべての必須グループから選択されている必要
      const requiredGroups = Object.keys(postProcessingGroups).length - optionalGroups.length;
      if (selectedCount < requiredGroups) {
        console.log('[checkStepComplete] post-processing incomplete:', {
          selectedCount,
          requiredGroups,
          optionalGroups,
          isRollFilm: state.bagTypeId === 'roll_film',
          currentOptions: state.postProcessingOptions
        });
        return false;
      }

      console.log('[checkStepComplete] post-processing complete:', {
        selectedCount,
        requiredGroups,
        optionalGroups,
        isRollFilm: state.bagTypeId === 'roll_film'
      });

      // バルブが選択されている場合、数量チェック
      if (state.postProcessingOptions.includes('valve-yes')) {
        // SKUモードの場合
        if (state.quantityMode === 'sku' && state.skuQuantities.length > 0) {
          const totalQuantity = state.skuQuantities.reduce((sum, qty) => sum + (qty || 0), 0);
          return totalQuantity >= 40000;
        }
        // 単一数量モードの場合
        return state.quantity >= 40000;
      }

      return true;
    case 'delivery':
      return !!(state.deliveryLocation && state.urgency);
    default:
      return false;
  }
}

export function getPostProcessingLimitStatusForState(state: QuoteState): PostProcessingLimitState {
  return {
    ...state.postProcessingLimit,
    selectedItems: state.postProcessingOptions,
    isAtLimit: isSelectionLimitReached(state.postProcessingOptions.length),
    remainingSlots: calculateRemainingSlots(state.postProcessingOptions.length)
  };
}

export function canAddPostProcessingOptionForState(state: QuoteState): boolean {
  const canAdd = !isSelectionLimitReached(state.postProcessingOptions.length);
  console.log('[canAddPostProcessingOptionForState] Called:', {
    currentCount: state.postProcessingOptions.length,
    isAtLimit: isSelectionLimitReached(state.postProcessingOptions.length),
    canAdd
  });
  return canAdd;
}

/**
 * Get film layers for a material and thickness selection
 * Used for displaying film structure in roll film specs
 * Patterns from MATERIAL_THICKNESS_OPTIONS in unified-pricing-engine.ts
 */
function getFilmLayersForMaterial(
  materialId: string,
  thicknessSelection?: string
): FilmStructureLayer[] {
  // LLDPE base thickness for each thickness selection - 50, 70, 90, 100, 110μm
  const lldpeBaseThickness: Record<string, number> = {
    'light': 50,
    'medium': 70,
    'standard': 90,
    'heavy': 100,
    'ultra': 110
  };
  const baseLldpeThickness = lldpeBaseThickness[thicknessSelection || 'standard'] || 90;

  // Default layers for each material type - matching MATERIAL_THICKNESS_OPTIONS
  const defaultLayers: Record<string, FilmStructureLayer[]> = {
    // PET+AL+PET+LLDPE (4 layers) - matching 'opp-alu-foil' pattern
    'pet_al': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    // PET+VMPET+PET+LLDPE (4 layers) - VMPET 12μm
    'pet_vmpet': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'VMPET', thickness: 12 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    // PET+LDPE+LLDPE (3 layers) or PET+LLDPE (2 layers for 'pet-transparent')
    'pet_ldpe': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LDPE', thickness: 7 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    // PET+NY+AL+LLDPE (4 layers)
    'pet_ny_al': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'NY', thickness: 15 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    // PET+LLDPE (2 layers) - matching 'pet-transparent' pattern
    'pet_transparent': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    // Kraft+PE (2 layers) - matching 'kraft-pe' pattern
    'kraft_pe': [
      { materialId: 'KRAFT', thickness: 80 }, // Kraft paper
      { materialId: 'PE', thickness: 40 }
    ]
  };

  // Get base layers
  const layers = defaultLayers[materialId] || defaultLayers['pet_al'];

  // Apply thickness multiplier (only affects LLDPE/LDPE layers) - 0.85, 0.95, 1.0, 1.1, 1.2
  const thicknessMultipliers: Record<string, number> = {
    'light': 0.85,
    'medium': 0.95,
    'standard': 1.0,
    'heavy': 1.1,
    'ultra': 1.2
  };
  const multiplier = thicknessMultipliers[thicknessSelection || 'standard'] || 1.0;

  // Only apply multiplier if not 1.0
  if (multiplier !== 1.0) {
    return layers.map(layer => {
      // Only apply to sealant layers (LLDPE, LDPE, PE)
      if (layer.materialId === 'LLDPE' || layer.materialId === 'LDPE' || layer.materialId === 'PE') {
        // Calculate based on base thickness for this selection
        if (layer.materialId === 'LLDPE' || layer.materialId === 'LDPE') {
          return { ...layer, thickness: baseLldpeThickness };
        }
      }
      return layer;
    });
  }

  return layers;
}

/**
 * Get film layer display text (e.g., "PET 12μm + AL 7μm + LLDPE 80μm")
 */
function getFilmLayerDisplay(layers: FilmStructureLayer[]): string {
  return layers.map(layer => {
    const materialName = layer.materialId;
    return `${materialName} ${layer.thickness}μm`;
  }).join(' + ');
}

export function createStepSummary(state: QuoteState, getLimitStatus: () => PostProcessingLimitState, step: string): React.ReactNode {
  switch (step) {
    case 'specs':
      // 필름 구조를 가져와서 모든 파우치 타입에 상세 표시
      const filmLayers = getFilmLayersForMaterial(state.materialId, state.thicknessSelection);
      const filmLayerDisplay = getFilmLayerDisplay(filmLayers);

      // 내용물 라벨 매핑
      const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
        'food': '食品',
        'health_supplement': '健康食品',
        'cosmetic': '化粧品',
        'quasi_drug': '医薬部外品',
        'drug': '医薬品'
      };
      const CONTENTS_TYPE_LABELS: Record<string, string> = {
        'solid': '固体',
        'powder': '粉体',
        'liquid': '液体'
      };
      const MAIN_INGREDIENT_LABELS: Record<string, string> = {
        'general_neutral': '一般/中性',
        'oil_surfactant': 'オイル/界面活性剤',
        'acidic_salty': '酸性/塩分',
        'volatile_fragrance': '揮発性/香料'
      };
      const DISTRIBUTION_ENVIRONMENT_LABELS: Record<string, string> = {
        'general_roomTemp': '一般/常温',
        'light_oxygen_sensitive': '光/酸素敏感',
        'refrigerated': '冷凍保管',
        'high_temp_sterilized': '高温殺菌'
      };

      const productCategoryLabel = PRODUCT_CATEGORY_LABELS[state.productCategory || 'food'] || '食品';
      const contentsTypeLabel = CONTENTS_TYPE_LABELS[state.contentsType || 'solid'] || '固体';
      const mainIngredientLabel = MAIN_INGREDIENT_LABELS[state.mainIngredient || 'general_neutral'] || '一般/中性';
      const distributionEnvironmentLabel = DISTRIBUTION_ENVIRONMENT_LABELS[state.distributionEnvironment || 'general_roomTemp'] || '一般/常温';

      // 롤 필름: 폭만 표시, 길이는 quantity 단계에서 입력
      if (state.bagTypeId === 'roll_film') {
        return (
          <div className="text-sm space-y-1">
            <div><span className="font-medium">{LABEL_JA['Type:']}</span> {translateBagType(state.bagTypeId)}</div>
            <div><span className="font-medium">{LABEL_JA['Material:']}</span> {translateMaterialType(state.materialId)}</div>
            <div><span className="font-medium">幅:</span> {state.width}mm</div>
            <div><span className="font-medium">ピッチ:</span> {state.pitch}mm</div>
            <div><span className="font-medium">フィルム構造:</span> {filmLayerDisplay}</div>
            <div><span className="font-medium">内容物:</span> {productCategoryLabel}（{contentsTypeLabel}） / {mainIngredientLabel} / {distributionEnvironmentLabel}</div>
          </div>
        );
      }

      // 일반 파우치: 사이즈와 필름 구조 상세 표시
      return (
        <div className="text-sm space-y-1">
          <div><span className="font-medium">{LABEL_JA['Type:']}</span> {translateBagType(state.bagTypeId)}</div>
          <div><span className="font-medium">{LABEL_JA['Material:']}</span> {translateMaterialType(state.materialId)}</div>
          <div><span className="font-medium">{LABEL_JA['Size:']}</span> {state.width} × {state.height} {state.depth > 0 && `× ${state.depth}`}{state.sideWidth && ` × 側面${state.sideWidth}`} mm</div>
          {/* 필름 구조 상세 표시 (모든 파우치 공통) */}
          <div><span className="font-medium">フィルム構造:</span> {filmLayerDisplay}</div>
          <div><span className="font-medium">内容物:</span> {productCategoryLabel}（{contentsTypeLabel}） / {mainIngredientLabel} / {distributionEnvironmentLabel}</div>
        </div>
      );
    case 'quantity':
      return (
        <div className="text-sm space-y-1">
          <div><span className="font-medium">{LABEL_JA['Quantity:']}</span> {state.quantity.toLocaleString()} {UNIT_JA['units']}</div>
          <div><span className="font-medium">印刷:</span> {state.isUVPrinting ? 'UV Digital' : state.printingType}</div>
          {state.printingColors && (
            <div><span className="font-medium">{LABEL_JA['Colors:']}</span> {state.printingColors} {state.doubleSided && '（両面印刷）'}</div>
          )}
        </div>
      );
    case 'post-processing':
      const getOptionName = (optionId: string): string => {
        const optionNames: Record<string, string> = {
          'zipper': 'ジッパー',
          'surface_finish': '表面マット加工',
          'tear_notch': 'テアノッチ',
          'hang_hole_6mm': '吊り下げ穴 (6mm)',
          'hang_hole_8mm': '吊り下げ穴 (8mm)',
          'corner_style': '角R加工',
          'opening_position': '開封位置指定',
          'valve': 'エアバルブ',
          'zipper_position_any': 'ジッパー位置: お任せ',
          'zipper_position_specified': 'ジッパー位置: 指定'
        };
        return optionNames[optionId] || optionId.replace('_', ' ');
      };

      const limitStatus = getLimitStatus();

      return (
        <div className="text-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">オプション:</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              limitStatus.isAtLimit
                ? 'bg-red-100 text-red-700'
                : limitStatus.selectedItems.length > 0
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {limitStatus.selectedItems.length} / {MAX_POST_PROCESSING_ITEMS}
            </span>
          </div>
          {state.postProcessingOptions && state.postProcessingOptions.length > 0 ? (
            <>
              {safeMap(state.postProcessingOptions, option => (
                <div key={option} className="ml-2">• {getOptionName(option)}</div>
              ))}
              {limitStatus.isAtLimit && (
                <div className="ml-2 text-xs text-blue-600 font-medium">
                  最大選択数に達しました
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500">オプション未選択 (最大{MAX_POST_PROCESSING_ITEMS}個)</div>
          )}
        </div>
      );
    default:
      return null;
  }
}

// Create context
const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

// Create separate context for state to avoid re-rendering functions when state changes
const QuoteStateContext = createContext<QuoteState | undefined>(undefined);

// Export state context hook for components that only need state
export function useQuoteState() {
  const context = useContext(QuoteStateContext);
  if (context === undefined) {
    throw new Error('useQuoteState must be used within a QuoteProvider');
  }
  return context;
}

// Provider component
interface QuoteProviderProps {
  children: ReactNode;
}

export function QuoteProvider({ children }: QuoteProviderProps) {
  const [state, dispatch] = useReducer(quoteReducer, initialState);

  // DEBUG: Log state changes to track materialWidth and filmLayers
  useEffect(() => {
    console.log('[QuoteProvider] State updated:', {
      materialWidth: state.materialWidth,
      filmLayers: state.filmLayers,
      filmLayersCount: state.filmLayers?.length,
      materialId: state.materialId
    });
  }, [state.materialWidth, state.filmLayers, state.materialId]);

  // Action helpers - wrapped in useCallback with NO state dependencies
  // The reducer handles merging with existing state
  const updateBasicSpecs = useCallback((specs: Partial<Pick<QuoteState, 'bagTypeId' | 'materialId' | 'width' | 'height' | 'depth' | 'sideWidth' | 'thicknessSelection'>>) => {
    console.log('[updateBasicSpecs] Called with specs:', specs);
    console.log('[updateBasicSpecs] sideWidth in payload:', specs.sideWidth);
    dispatch({
      type: 'SET_BASIC_SPECS',
      payload: specs
    });
  }, []);

  const updateQuantityOptions = useCallback((options: Partial<Pick<QuoteState, 'quantities' | 'quantity' | 'isUVPrinting' | 'printingType' | 'printingColors' | 'doubleSided'>> & { isUVPrinting?: boolean }) => {
    dispatch({
      type: 'SET_QUANTITY_OPTIONS',
      payload: options
    });
  }, []);

  const updatePostProcessing = useCallback((options: string[], multiplier: number) => {
    dispatch({
      type: 'SET_POST_PROCESSING',
      payload: { options, multiplier }
    });
  }, []);

  // 5-item limit helper functions
  const addPostProcessingOption = useCallback((
    optionId: string,
    allOptions?: ProcessingOptionConfig[],
    currentOptions?: string[]
  ): boolean => {
    console.log('[addPostProcessingOption] Called with:', {
      optionId,
      hasAllOptions: !!allOptions,
      allOptionsCount: allOptions?.length,
      hasCurrentOptions: !!currentOptions,
      currentOptionsCount: currentOptions?.length,
      currentOptions: currentOptions
    });

    // Pre-validate before dispatching (for immediate UI feedback)
    if (currentOptions && allOptions) {
      console.log('[addPostProcessingOption] Both params provided, calling validatePostProcessingSelection');
      const validation = validatePostProcessingSelection(currentOptions, optionId, allOptions);
      console.log('[addPostProcessingOption] Validation result:', validation);
      if (!validation.isValid) {
        // Set validation error without adding the option
        console.log('[addPostProcessingOption] Validation failed, dispatching error:', validation.error);
        dispatch({
          type: 'SET_POST_PROCESSING_VALIDATION_ERROR',
          payload: validation.error
        });
        return false;
      }
      console.log('[addPostProcessingOption] Validation passed');
    } else {
      console.log('[addPostProcessingOption] Skipping validation - missing params:', {
        hasCurrentOptions: !!currentOptions,
        hasAllOptions: !!allOptions
      });
    }

    console.log('[addPostProcessingOption] Dispatching ADD_POST_PROCESSING_OPTION');
    dispatch({
      type: 'ADD_POST_PROCESSING_OPTION',
      payload: { optionId, allOptions }
    });
    return true;
  }, []);

  const removePostProcessingOption = useCallback((optionId: string) => {
    dispatch({
      type: 'REMOVE_POST_PROCESSING_OPTION',
      payload: optionId
    });
  }, []);

  const replacePostProcessingOption = useCallback((oldOptionId: string, newOptionId: string) => {
    dispatch({
      type: 'REPLACE_POST_PROCESSING_OPTION',
      payload: { oldOptionId, newOptionId }
    });
  }, []);

  const updateDelivery = useCallback((location: 'domestic' | 'international', urgency: 'standard' | 'express') => {
    dispatch({
      type: 'SET_DELIVERY',
      payload: { location, urgency }
    });
  }, []);

  const updateField = useCallback((field: keyof QuoteState, value: any) => {
    // ★제품 타입 변경 시 SKU 수량 초기화 (롤 ↔ 파우치 전환 시)
    if (field === 'bagTypeId') {
      console.log('[updateField] Product type changed, resetting SKU quantities');
      // SKU 수량을 1개, 기본 수량(롤: 500, 파우치: 500)로 초기화
      const defaultQuantity = value === 'roll_film' ? 500 : 500;
      dispatch({
        type: 'RESET_SKU_QUANTITIES_ON_PRODUCT_CHANGE',
        payload: { defaultQuantity }
      });
    }

    dispatch({
      type: 'UPDATE_FIELD',
      payload: { field, value }
    });
  }, []);

  const resetQuote = useCallback(() => {
    dispatch({ type: 'RESET_QUOTE' });
  }, []);

  const clearPostProcessingValidationError = useCallback(() => {
    dispatch({ type: 'CLEAR_POST_PROCESSING_VALIDATION_ERROR' });
  }, []);

  // SKU-related helper functions (新增: SKU別原価計算対応)
  const setSKUCount = useCallback((count: number) => {
    dispatch({
      type: 'SET_SKU_COUNT',
      payload: Math.min(100, Math.max(1, count)) // Limit to 1-100 SKUs
    });
  }, []);

  const setSKUQuantities = useCallback((quantities: number[]) => {
    dispatch({
      type: 'SET_SKU_QUANTITIES',
      payload: quantities
    });
  }, []);

  const updateSKUQuantity = useCallback((index: number, value: number) => {
    dispatch({
      type: 'UPDATE_SKU_QUANTITY',
      payload: { index, value }
    });
  }, []);

  const toggleSKUCalculation = useCallback((enabled: boolean) => {
    dispatch({
      type: 'TOGGLE_SKU_CALCULATION',
      payload: enabled
    });
  }, []);

  const setQuantityMode = useCallback((mode: 'single' | 'sku') => {
    dispatch({
      type: 'SET_QUANTITY_MODE',
      payload: mode
    });
  }, []);

  // 新規: 推奨機能関連ヘルパー関数
  const clearRecommendationCache = useCallback(() => {
    dispatch({ type: 'CLEAR_RECOMMENDATION_CACHE' });
  }, []);

  const applyTwoColumnOption = useCallback((optionType: 'same' | 'double', unitPrice: number, totalPrice: number, originalUnitPrice: number, quantity: number) => {
    dispatch({
      type: 'APPLY_TWO_COLUMN_OPTION',
      payload: { optionType, unitPrice, totalPrice, originalUnitPrice, quantity }
    });
  }, []);

  const applySKUSplit = useCallback((skuCount: number, quantities: number[]) => {
    dispatch({
      type: 'APPLY_SKU_SPLIT',
      payload: { skuCount, quantities }
    });
  }, []);

  const clearAppliedOption = useCallback(() => {
    dispatch({ type: 'CLEAR_APPLIED_OPTION' });
  }, []);

  const setSealWidth = useCallback((width: string) => {
    dispatch({ type: 'SET_SEAL_WIDTH', payload: width });
  }, []);

  const setContents = useCallback((
    productCategory: QuoteState['productCategory'],
    contentsType: QuoteState['contentsType'],
    mainIngredient: QuoteState['mainIngredient'],
    distributionEnvironment: QuoteState['distributionEnvironment']
  ) => {
    dispatch({
      type: 'SET_CONTENTS',
      payload: {
        productCategory,
        contentsType,
        mainIngredient,
        distributionEnvironment
      }
    });
  }, []);

  // Memoize the context value with ONLY functions - never changes
  const value: QuoteContextType = useMemo(() => ({
    dispatch,
    updateBasicSpecs,
    updateQuantityOptions,
    updatePostProcessing,
    updateDelivery,
    updateField,
    resetQuote,
    addPostProcessingOption,
    removePostProcessingOption,
    replacePostProcessingOption,
    clearPostProcessingValidationError,
    setSKUCount,
    setSKUQuantities,
    updateSKUQuantity,
    setQuantityMode,
    toggleSKUCalculation,
    applyTwoColumnOption,
    applySKUSplit,
    clearAppliedOption,
    setSealWidth,
    setContents
  }), []); // Empty dependency array - these functions NEVER change

  return (
    <QuoteStateContext.Provider value={state}>
      <QuoteContext.Provider value={value}>
        {children}
      </QuoteContext.Provider>
    </QuoteStateContext.Provider>
  );
}

// Hook to use the quote context (functions only)
export function useQuote() {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
}

// Combined hook for components that need both state and functions
export function useQuoteContext() {
  const state = useQuoteState();
  const functions = useQuote();
  return { state, ...functions };
}