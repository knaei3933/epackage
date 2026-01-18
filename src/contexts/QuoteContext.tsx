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
} from '@/components/quote/postProcessingLimits';
import type { ProcessingOptionConfig } from '@/components/quote/processingConfig';

// Quote state interface
export interface QuoteState {
  bagTypeId: string;
  materialId: string;
  width: number;
  height: number;
  depth: number;
  quantities: number[]; // Multiple quantity patterns
  quantity: number; // Selected quantity for calculation
  isUVPrinting: boolean;
  postProcessingOptions: string[];
  postProcessingMultiplier: number;
  postProcessingLimit: PostProcessingLimitState;
  postProcessingValidationError?: PostProcessingValidationError;
  thicknessSelection?: string;
  printingType?: 'digital' | 'gravure';
  printingColors?: number;
  doubleSided?: boolean;
  deliveryLocation?: 'domestic' | 'international';
  urgency?: 'standard' | 'express';
  spoutPosition?: 'top-left' | 'top-right' | 'center-left' | 'center-right' | 'bottom-left' | 'bottom-right';
  // Roll film specific fields
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
  skuNames?: string[];            // Optional design names for each SKU
  quantityMode: 'single' | 'sku'; // Single quantity vs SKU-specific mode
  useSKUCalculation: boolean;     // Enable SKU-based cost calculation
}

// Action types
type QuoteAction =
  | { type: 'SET_BASIC_SPECS'; payload: Partial<Pick<QuoteState, 'bagTypeId' | 'materialId' | 'width' | 'height' | 'depth' | 'thicknessSelection'>> }
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
  | { type: 'UPDATE_SKU_NAME'; payload: { index: number; name: string } }
  | { type: 'SET_QUANTITY_MODE'; payload: 'single' | 'sku' }
  | { type: 'TOGGLE_SKU_CALCULATION'; payload: boolean };

// Helper function to get default film layers based on material ID
// Default LLDPE thickness is 90μm (standard selection)
function getDefaultFilmLayers(materialId: string): Array<{ materialId: string; thickness: number }> {
  const layerMap: Record<string, Array<{ materialId: string; thickness: number }>> = {
    'pet_al': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 90 }
    ],
    'pet_ny': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'NY', thickness: 15 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 90 }
    ],
    'kp_pe': [
      { materialId: 'KP', thickness: 12 },
      { materialId: 'PE', thickness: 60 }
    ],
    'pet': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 90 }
    ],
    'pet_al_pet': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 90 }
    ]
  };

  return layerMap[materialId] || layerMap['pet_al']; // Default to pet_al
}

// Initial state
const initialState: QuoteState = {
  bagTypeId: 'flat_3_side',
  materialId: 'pet_al',
  width: 200,
  height: 300,
  depth: 0,
  quantities: [500, 1000, 2000, 5000, 10000], // Default quantity patterns
  quantity: 500,
  isUVPrinting: false,
  postProcessingOptions: [],
  postProcessingMultiplier: 1.0,
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
  totalLength: undefined,
  rollCount: undefined,
  distributedQuantities: undefined,
  editableQuantities: undefined,
  materialWidth: determineMaterialWidth(200), // 幅200mmに基づいて動的に決定（590mm）
  filmLayers: getDefaultFilmLayers('pet_al'), // Default film layers
  // SKU-related fields (新增: SKU別原価計算対応)
  skuCount: 1,
  skuQuantities: [500],
  skuNames: [],
  quantityMode: 'single',
  useSKUCalculation: false
};

// DEBUG: Log initial state to verify
console.log('[QuoteContext] initialState created:', {
  materialWidth: initialState.materialWidth,
  filmLayers: initialState.filmLayers,
  filmLayersCount: initialState.filmLayers?.length
});

// Reducer function
function quoteReducer(state: QuoteState, action: QuoteAction): QuoteState {
  switch (action.type) {
    case 'SET_BASIC_SPECS':
      const newMaterialId = action.payload.materialId ?? state.materialId;
      const materialIdChanged = newMaterialId !== state.materialId;
      const newWidth = action.payload.width ?? state.width;
      const widthChanged = newWidth !== state.width;
      const newBagTypeId = action.payload.bagTypeId ?? state.bagTypeId;

      // 幅変更またはbagTypeId変更時に原反幅を再計算
      let newMaterialWidth = state.materialWidth;
      if (widthChanged || (newBagTypeId !== state.bagTypeId && newBagTypeId === 'roll_film')) {
        newMaterialWidth = determineMaterialWidth(newWidth);
      }

      return {
        ...state,
        bagTypeId: newBagTypeId,
        materialId: newMaterialId,
        width: newWidth,
        height: action.payload.height ?? state.height,
        depth: action.payload.depth ?? state.depth,
        thicknessSelection: action.payload.thicknessSelection ?? state.thicknessSelection,
        materialWidth: newMaterialWidth,
        // Update filmLayers when materialId changes
        ...(materialIdChanged ? {
          filmLayers: getDefaultFilmLayers(newMaterialId)
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
      const newOptions = action.payload.options;
      const updatedLimitState = {
        selectedItems: newOptions,
        isAtLimit: isSelectionLimitReached(newOptions.length),
        remainingSlots: calculateRemainingSlots(newOptions.length)
      };
      return {
        ...state,
        postProcessingOptions: newOptions,
        postProcessingMultiplier: action.payload.multiplier,
        postProcessingLimit: updatedLimitState
      };

    case 'ADD_POST_PROCESSING_OPTION':
      const { optionId, allOptions = [] } = action.payload;
      const currentOptions = state.postProcessingOptions;

      // Check if already selected
      if (currentOptions.includes(optionId)) {
        return state;
      }

      // Validate selection - only use proper validation if allOptions has correct structure
      const isValidProcessingOptionsArray = allOptions.length > 0 &&
        'name' in allOptions[0] && 'nameJa' in allOptions[0];

      const validation = isValidProcessingOptionsArray
        ? validatePostProcessingSelection(currentOptions, optionId, allOptions as unknown as ProcessingOptionConfig[])
        : { isValid: currentOptions.length < MAX_POST_PROCESSING_ITEMS };

      if (!validation.isValid && validation.error) {
        return {
          ...state,
          postProcessingValidationError: validation.error
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

      return {
        ...state,
        postProcessingOptions: updatedOptions,
        postProcessingLimit: newLimitState,
        postProcessingValidationError: undefined
      };

    case 'REMOVE_POST_PROCESSING_OPTION':
      const optionToRemove = action.payload;
      const optionsAfterRemoval = state.postProcessingOptions.filter(id => id !== optionToRemove);
      const limitAfterRemoval = {
        selectedItems: optionsAfterRemoval,
        isAtLimit: isSelectionLimitReached(optionsAfterRemoval.length),
        remainingSlots: calculateRemainingSlots(optionsAfterRemoval.length)
      };

      return {
        ...state,
        postProcessingOptions: optionsAfterRemoval,
        postProcessingLimit: limitAfterRemoval,
        postProcessingValidationError: undefined
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

      return {
        ...state,
        postProcessingOptions: optionsAfterReplacement,
        postProcessingLimit: limitAfterReplacement,
        postProcessingValidationError: undefined
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
      return {
        ...state,
        [action.payload.field]: action.payload.value
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

    case 'UPDATE_SKU_NAME': {
      const { index, name } = action.payload;
      const currentNames = state.skuNames || [];
      // Ensure array is long enough for the index
      const newSkuNames = [...currentNames];
      while (newSkuNames.length <= index) {
        newSkuNames.push(''); // Fill with empty string
      }
      newSkuNames[index] = name;
      console.log('[UPDATE_SKU_NAME] Updated SKU names:', newSkuNames);
      return {
        ...state,
        skuNames: newSkuNames
      };
    }

    case 'SET_QUANTITY_MODE': {
      return {
        ...state,
        quantityMode: action.payload,
        useSKUCalculation: action.payload === 'sku'
      };
    }

    default:
      return state;
  }
}

// Context interface - only functions, no state
interface QuoteContextType {
  dispatch: React.Dispatch<QuoteAction>;
  updateBasicSpecs: (specs: Partial<Pick<QuoteState, 'bagTypeId' | 'materialId' | 'width' | 'height' | 'depth' | 'thicknessSelection'>>) => void;
  updateQuantityOptions: (options: Partial<Pick<QuoteState, 'quantities' | 'quantity' | 'isUVPrinting' | 'printingType' | 'printingColors' | 'doubleSided'>> & { isUVPrinting?: boolean }) => void;
  updatePostProcessing: (options: string[], multiplier: number) => void;
  updateDelivery: (location: 'domestic' | 'international', urgency: 'standard' | 'express') => void;
  updateField: (field: keyof QuoteState, value: any) => void;
  resetQuote: () => void;
  addPostProcessingOption: (optionId: string, allOptions?: Array<{ id: string; category: string; compatibility?: string[]; priority: number; impact: number }>) => boolean;
  removePostProcessingOption: (optionId: string) => void;
  replacePostProcessingOption: (oldOptionId: string, newOptionId: string) => void;
  clearPostProcessingValidationError: () => void;
  // SKU-related helpers (新增: SKU別原価計算対応)
  setSKUCount: (count: number) => void;
  setSKUQuantities: (quantities: number[]) => void;
  updateSKUQuantity: (index: number, value: number) => void;
  updateSKUName: (index: number, name: string) => void;
  setQuantityMode: (mode: 'single' | 'sku') => void;
  toggleSKUCalculation: (enabled: boolean) => void;
}

// Helper functions that need state access - accept state as parameter
export function checkStepComplete(state: QuoteState, step: string): boolean {
  switch (step) {
    case 'specs':
      const hasBasicSpecs = !!(state.bagTypeId && state.materialId && state.width > 0);
      // roll_film doesn't require height input
      const requiresHeight = state.bagTypeId !== 'roll_film';
      const hasHeight = !requiresHeight || state.height > 0;
      const materialsWithThickness = ['pet_al', 'pet_vmpet', 'pet_ldpe', 'pet_ny_al'];
      const requiresThickness = materialsWithThickness.includes(state.materialId);
      const hasThickness = !!state.thicknessSelection;
      return hasBasicSpecs && hasHeight && (!requiresThickness || hasThickness);
    case 'sku-selection':
      // SKU selection is complete if at least one SKU has valid quantity
      return state.skuQuantities.length > 0 && state.skuQuantities.every(qty => qty >= 100);
    case 'sku-quantity':
      // Unified SKU & Quantity step - check based on mode
      if (state.quantityMode === 'sku') {
        // SKU mode: all SKUs must have valid quantities
        return state.skuCount > 0 &&
               state.skuQuantities.length === state.skuCount &&
               state.skuQuantities.every(qty => qty >= 100);
      }
      // Single quantity mode
      return state.quantity >= 100;
    case 'quantity':
      return state.quantity >= 100;
    case 'post-processing':
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
  return !isSelectionLimitReached(state.postProcessingOptions.length);
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

      // 롤 필름: 폭만 표시, 길이는 quantity 단계에서 입력
      if (state.bagTypeId === 'roll_film') {
        return (
          <div className="text-sm space-y-1">
            <div><span className="font-medium">{LABEL_JA['Type:']}</span> {translateBagType(state.bagTypeId)}</div>
            <div><span className="font-medium">{LABEL_JA['Material:']}</span> {translateMaterialType(state.materialId)}</div>
            <div><span className="font-medium">幅:</span> {state.width}mm</div>
            <div><span className="font-medium">フィルム構造:</span> {filmLayerDisplay}</div>
          </div>
        );
      }

      // 일반 파우치: 사이즈와 필름 구조 상세 표시
      return (
        <div className="text-sm space-y-1">
          <div><span className="font-medium">{LABEL_JA['Type:']}</span> {translateBagType(state.bagTypeId)}</div>
          <div><span className="font-medium">{LABEL_JA['Material:']}</span> {translateMaterialType(state.materialId)}</div>
          <div><span className="font-medium">{LABEL_JA['Size:']}</span> {state.width} × {state.height} {state.depth > 0 && `× ${state.depth}`} mm</div>
          {/* 필름 구조 상세 표시 (모든 파우치 공통) */}
          <div><span className="font-medium">フィルム構造:</span> {filmLayerDisplay}</div>
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
  const updateBasicSpecs = useCallback((specs: Partial<Pick<QuoteState, 'bagTypeId' | 'materialId' | 'width' | 'height' | 'depth' | 'thicknessSelection'>>) => {
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
    allOptions?: Array<{ id: string; category: string; compatibility?: string[]; priority: number; impact: number }>
  ): boolean => {
    dispatch({
      type: 'ADD_POST_PROCESSING_OPTION',
      payload: { optionId, allOptions }
    });
    return true; // Simplified - validation happens in reducer
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

  const updateSKUName = useCallback((index: number, name: string) => {
    dispatch({
      type: 'UPDATE_SKU_NAME',
      payload: { index, name }
    });
  }, []);

  const setQuantityMode = useCallback((mode: 'single' | 'sku') => {
    dispatch({
      type: 'SET_QUANTITY_MODE',
      payload: mode
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
    updateSKUName,
    setQuantityMode,
    toggleSKUCalculation
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