'use client';

import React, { createContext, useContext, useReducer, ReactNode, useMemo, useCallback } from 'react';
import { UnifiedQuoteResult } from '@/lib/unified-pricing-engine';
import { BAG_TYPE_JA, MATERIAL_TYPE_JA, THICKNESS_TYPE_JA, PRINTING_TYPE_JA, UNIT_JA, LABEL_JA, POST_PROCESSING_JA, translateBagType, translateMaterialType, translateToJapanese } from '@/constants/enToJa';
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
interface QuoteState {
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
  | { type: 'RESET_QUOTE' };

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
  urgency: 'standard'
};

// Reducer function
function quoteReducer(state: QuoteState, action: QuoteAction): QuoteState {
  switch (action.type) {
    case 'SET_BASIC_SPECS':
      return {
        ...state,
        bagTypeId: action.payload.bagTypeId ?? state.bagTypeId,
        materialId: action.payload.materialId ?? state.materialId,
        width: action.payload.width ?? state.width,
        height: action.payload.height ?? state.height,
        depth: action.payload.depth ?? state.depth,
        thicknessSelection: action.payload.thicknessSelection ?? state.thicknessSelection
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
      const optionsAfterReplacement = state.postProcessingOptions
        .map(id => id === oldOptionId ? newOptionId : id);

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
  resetQuote: () => void;
  addPostProcessingOption: (optionId: string, allOptions?: Array<{ id: string; category: string; compatibility?: string[]; priority: number; impact: number }>) => boolean;
  removePostProcessingOption: (optionId: string) => void;
  replacePostProcessingOption: (oldOptionId: string, newOptionId: string) => void;
  clearPostProcessingValidationError: () => void;
}

// Helper functions that need state access - accept state as parameter
export function checkStepComplete(state: QuoteState, step: string): boolean {
  switch (step) {
    case 'specs':
      const hasBasicSpecs = !!(state.bagTypeId && state.materialId && state.width > 0 && state.height > 0);
      const materialsWithThickness = ['pet_al', 'pet_vmpet', 'pet_ldpe', 'pet_ny_al'];
      const requiresThickness = materialsWithThickness.includes(state.materialId);
      const hasThickness = !!state.thicknessSelection;
      return hasBasicSpecs && (!requiresThickness || hasThickness);
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

export function createStepSummary(state: QuoteState, getLimitStatus: () => PostProcessingLimitState, step: string): React.ReactNode {
  switch (step) {
    case 'specs':
      return (
        <div className="text-sm space-y-1">
          <div><span className="font-medium">{LABEL_JA['Type:']}</span> {translateBagType(state.bagTypeId)}</div>
          <div><span className="font-medium">{LABEL_JA['Material:']}</span> {translateMaterialType(state.materialId)}</div>
          <div><span className="font-medium">{LABEL_JA['Size:']}</span> {state.width} × {state.height} {state.depth > 0 && `× ${state.depth}`} mm</div>
          {state.thicknessSelection && (
            <div><span className="font-medium">{LABEL_JA['Thickness:']}</span> {state.thicknessSelection}</div>
          )}
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
          {state.postProcessingOptions.length > 0 ? (
            <>
              {state.postProcessingOptions.map(option => (
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

  const resetQuote = useCallback(() => {
    dispatch({ type: 'RESET_QUOTE' });
  }, []);

  const clearPostProcessingValidationError = useCallback(() => {
    dispatch({ type: 'CLEAR_POST_PROCESSING_VALIDATION_ERROR' });
  }, []);

  // Memoize the context value with ONLY functions - never changes
  const value: QuoteContextType = useMemo(() => ({
    dispatch,
    updateBasicSpecs,
    updateQuantityOptions,
    updatePostProcessing,
    updateDelivery,
    resetQuote,
    addPostProcessingOption,
    removePostProcessingOption,
    replacePostProcessingOption,
    clearPostProcessingValidationError
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