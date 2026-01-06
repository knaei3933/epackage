'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { MultiQuantityQuoteState, SavedQuantityPattern, MultiQuantityResult } from '@/types/multi-quantity';
import { multiQuantityCalculator } from '@/lib/multi-quantity-calculator';
import { v4 as uuidv4 } from 'uuid';
import { saveToLocalStorage, loadFromLocalStorage, deleteFromLocalStorage } from '@/lib/storage';

// Enhanced action types for multi-quantity functionality
type MultiQuoteAction =
  | { type: 'SET_BASIC_SPECS'; payload: { bagTypeId: string; materialId: string; width: number; height: number; depth: number; thicknessSelection?: string } }
  | { type: 'SET_QUANTITIES'; payload: { quantities: number[] } }
  | { type: 'ADD_QUANTITY'; payload: number }
  | { type: 'REMOVE_QUANTITY'; payload: number }
  | { type: 'SET_SELECTED_QUANTITY'; payload: number | null }
  | { type: 'SET_COMPARISON_QUANTITIES'; payload: number[] }
  | { type: 'SET_PRINTING_OPTIONS'; payload: { isUVPrinting: boolean; printingType?: 'digital' | 'gravure'; printingColors?: number; doubleSided?: boolean } }
  | { type: 'SET_POST_PROCESSING'; payload: { options: string[]; multiplier: number } }
  | { type: 'SET_DELIVERY'; payload: { location: 'domestic' | 'international'; urgency: 'standard' | 'express' } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MULTI_QUANTITY_RESULTS'; payload: MultiQuantityResult }
  | { type: 'ADD_SAVED_PATTERN'; payload: SavedQuantityPattern }
  | { type: 'REMOVE_SAVED_PATTERN'; payload: string }
  | { type: 'SET_DEFAULT_PATTERN'; payload: string }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof MultiQuantityQuoteState; value: any } }
  | { type: 'RESET_QUOTE' }
  // Save/Load functionality
  | { type: 'SAVE_COMPARISON'; payload: { title?: string; description?: string; customerName?: string; projectName?: string } }
  | { type: 'LOAD_COMPARISON'; payload: any }
  | { type: 'EXPORT_COMPARISON'; payload: { format: 'pdf' | 'excel' | 'csv'; options?: any } }
  | { type: 'SET_SAVED_COMPARISONS'; payload: any[] }
  | { type: 'SET_LOADING_SAVE'; payload: boolean }
  | { type: 'SET_EXPORT_URL'; payload: string }
  | { type: 'CLEAR_EXPORT_URL' };

// Initial state with multi-quantity support
const initialState: MultiQuantityQuoteState = {
  // Basic specifications
  bagTypeId: 'flat_3_side',
  materialId: 'pet_al',
  width: 200,
  height: 300,
  depth: 0,
  thicknessSelection: 'medium',

  // Enhanced quantity fields
  quantities: [1000, 2000, 5000, 10000], // Default selected quantities - 수정사항.md 예시와 일치
  comparisonQuantities: [1000, 2000, 5000, 10000], // All quantities to compare - 수정사항.md 예시와 일치
  selectedQuantity: 1000, // Currently selected for detailed view
  multiQuantityResults: new Map(),
  comparison: null,
  isLoading: false,
  error: null,

  // Printing options
  isUVPrinting: false,
  printingType: 'digital',
  printingColors: 1,
  doubleSided: false,

  // Post-processing
  postProcessingOptions: [],
  postProcessingMultiplier: 1.0,

  // Delivery
  deliveryLocation: 'domestic',
  urgency: 'standard',

  // User preferences
  savedPatterns: [],
  recentCalculations: [],
  // Save/Load state
  savedComparisons: [],
  isLoadingSave: false,
  exportUrl: null,
  shareUrl: null,
};

// Reducer function with multi-quantity support
function multiQuoteReducer(state: MultiQuantityQuoteState, action: MultiQuoteAction): MultiQuantityQuoteState {
  switch (action.type) {
    case 'SET_BASIC_SPECS':
      return {
        ...state,
        bagTypeId: action.payload.bagTypeId ?? state.bagTypeId,
        materialId: action.payload.materialId ?? state.materialId,
        width: action.payload.width ?? state.width,
        height: action.payload.height ?? state.height,
        depth: action.payload.depth ?? state.depth,
        thicknessSelection: action.payload.thicknessSelection ?? state.thicknessSelection,
        // Clear previous results when specs change
        multiQuantityResults: new Map(),
        comparison: null,
        error: null
      };

    case 'SET_QUANTITIES':
      return {
        ...state,
        quantities: action.payload.quantities,
        comparisonQuantities: action.payload.quantities,
        // Clear previous results when quantities change
        multiQuantityResults: new Map(),
        comparison: null,
        error: null
      };

    case 'ADD_QUANTITY':
      if (state.quantities.includes(action.payload)) {
        return state; // Quantity already exists
      }
      const newQuantities = [...state.quantities, action.payload].sort((a, b) => a - b);
      return {
        ...state,
        quantities: newQuantities,
        comparisonQuantities: newQuantities,
        multiQuantityResults: new Map(),
        comparison: null,
        error: null
      };

    case 'REMOVE_QUANTITY':
      const filteredQuantities = state.quantities.filter(q => q !== action.payload);
      const newSelectedQuantity = state.selectedQuantity === action.payload
        ? (filteredQuantities.length > 0 ? filteredQuantities[0] : null)
        : state.selectedQuantity;

      return {
        ...state,
        quantities: filteredQuantities,
        comparisonQuantities: filteredQuantities,
        selectedQuantity: newSelectedQuantity,
        multiQuantityResults: new Map(),
        comparison: null,
        error: null
      };

    case 'SET_SELECTED_QUANTITY':
      return {
        ...state,
        selectedQuantity: action.payload
      };

    case 'SET_COMPARISON_QUANTITIES':
      return {
        ...state,
        comparisonQuantities: action.payload,
        multiQuantityResults: new Map(),
        comparison: null,
        error: null
      };

    case 'SET_PRINTING_OPTIONS':
      return {
        ...state,
        isUVPrinting: action.payload.isUVPrinting,
        printingType: action.payload.printingType || state.printingType,
        printingColors: action.payload.printingColors || state.printingColors,
        doubleSided: action.payload.doubleSided !== undefined ? action.payload.doubleSided : state.doubleSided,
        // Clear previous results when printing options change
        multiQuantityResults: new Map(),
        comparison: null,
        error: null
      };

    case 'SET_POST_PROCESSING':
      return {
        ...state,
        postProcessingOptions: action.payload.options,
        postProcessingMultiplier: action.payload.multiplier,
        multiQuantityResults: new Map(),
        comparison: null,
        error: null
      };

    case 'SET_DELIVERY':
      return {
        ...state,
        deliveryLocation: action.payload.location,
        urgency: action.payload.urgency,
        multiQuantityResults: new Map(),
        comparison: null,
        error: null
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'SET_MULTI_QUANTITY_RESULTS':
      return {
        ...state,
        multiQuantityResults: action.payload.calculations,
        comparison: action.payload.comparison,
        // Add to recent calculations
        recentCalculations: [
          action.payload,
          ...state.recentCalculations.slice(0, 4) // Keep only last 5
        ],
        isLoading: false,
        error: null
      };

    case 'ADD_SAVED_PATTERN':
      return {
        ...state,
        savedPatterns: [...state.savedPatterns, action.payload]
      };

    case 'REMOVE_SAVED_PATTERN':
      return {
        ...state,
        savedPatterns: state.savedPatterns.filter(p => p.id !== action.payload)
      };

    case 'SET_DEFAULT_PATTERN':
      return {
        ...state,
        savedPatterns: state.savedPatterns.map(p => ({
          ...p,
          isDefault: p.id === action.payload
        }))
      };

    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.payload.field]: action.payload.value,
        // Clear results when important fields change
        multiQuantityResults: ['quantities', 'comparisonQuantities', 'bagTypeId', 'materialId'].includes(action.payload.field)
          ? new Map()
          : state.multiQuantityResults,
        comparison: ['quantities', 'comparisonQuantities', 'bagTypeId', 'materialId'].includes(action.payload.field)
          ? null
          : state.comparison,
        error: null
      };

    case 'RESET_QUOTE':
      return {
        ...initialState,
        savedPatterns: state.savedPatterns, // Preserve saved patterns
        savedComparisons: state.savedComparisons, // Preserve saved comparisons
      };

    case 'SET_SAVED_COMPARISONS':
      return {
        ...state,
        savedComparisons: action.payload
      };

    case 'SET_LOADING_SAVE':
      return {
        ...state,
        isLoadingSave: action.payload
      };

    case 'SET_EXPORT_URL':
      return {
        ...state,
        exportUrl: action.payload
      };

    case 'CLEAR_EXPORT_URL':
      return {
        ...state,
        exportUrl: null
      };

    default:
      return state;
  }
}

// Create context
const MultiQuantityQuoteContext = createContext<{
  state: MultiQuantityQuoteState;
  dispatch: React.Dispatch<MultiQuoteAction>;
  // Action helpers
  updateBasicSpecs: (specs: Partial<MultiQuantityQuoteState>) => void;
  setQuantities: (quantities: number[]) => void;
  addQuantity: (quantity: number) => void;
  removeQuantity: (quantity: number) => void;
  setSelectedQuantity: (quantity: number | null) => void;
  setComparisonQuantities: (quantities: number[]) => void;
  updatePrintingOptions: (options: Partial<MultiQuantityQuoteState>) => void;
  updatePostProcessing: (options: string[], multiplier: number) => void;
  updateDelivery: (location: 'domestic' | 'international', urgency: 'standard' | 'express') => void;
  calculateMultiQuantity: () => Promise<MultiQuantityResult | null>;
  saveQuantityPattern: (name: string, description: string) => void;
  loadQuantityPattern: (pattern: SavedQuantityPattern) => void;
  resetQuote: () => void;
  // Save/Load functionality
  saveComparison: (metadata?: { title?: string; description?: string; customerName?: string; projectName?: string }) => Promise<{ success: boolean; shareId?: string; shareUrl?: string; error?: string }>;
  loadComparison: (shareId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  exportComparison: (format: 'pdf' | 'excel' | 'csv', options?: any) => Promise<{ success: boolean; url?: string; error?: string }>;
  loadSavedComparisons: () => Promise<void>;
  deleteComparison: (shareId: string) => Promise<{ success: boolean; error?: string }>;
  shareComparison: (shareId: string, options?: { password?: string; expiryDays?: number; allowDownload?: boolean }) => Promise<{ success: boolean; shareUrl?: string; error?: string }>;
  // Validation helpers
  isStepComplete: (step: string) => boolean;
  getStepSummary: (step: string) => React.ReactNode;
  canCalculateMultiQuantity: () => boolean;
} | undefined>(undefined);

// Provider component
interface MultiQuantityQuoteProviderProps {
  children: ReactNode;
}

export function MultiQuantityQuoteProvider({ children }: MultiQuantityQuoteProviderProps) {
  const [state, dispatch] = useReducer(multiQuoteReducer, initialState);

  // Load saved comparisons from localStorage on mount
  const loadSavedComparisons = useCallback(async () => {
    try {
      // Load from localStorage first
      const localComparisons = loadFromLocalStorage();
      if (localComparisons.length > 0) {
        dispatch({
          type: 'SET_SAVED_COMPARISONS',
          payload: localComparisons.map(comp => ({
            id: comp.id,
            title: comp.title || `比較結果 ${new Date(comp.createdAt).toLocaleDateString()}`,
            description: comp.description,
            createdAt: comp.createdAt,
            expiresAt: comp.expiresAt,
            viewCount: comp.viewCount || 0,
            shareId: comp.shareId,
            shareUrl: comp.shareUrl,
            customerName: comp.customerName,
            projectName: comp.projectName,
          })),
        });
      }

      // Also try to load from API for latest data
      try {
        const response = await fetch('/api/comparison/save');
        const result = await response.json();

        if (result.success) {
          dispatch({
            type: 'SET_SAVED_COMPARISONS',
            payload: result.data,
          });
        }
      } catch (apiError) {
        // If API fails, we still have localStorage data
        console.log('API unavailable, using localStorage data');
      }
    } catch (error) {
      console.error('Load saved comparisons error:', error);
    }
  }, []);

  useEffect(() => {
    loadSavedComparisons();
  }, []); // Only run once on mount since loadSavedComparisons is stable

  // Action helpers - wrapped in useCallback for stable references
  const updateBasicSpecs = useCallback((specs: Partial<Pick<MultiQuantityQuoteState, 'bagTypeId' | 'materialId' | 'width' | 'height' | 'depth' | 'thicknessSelection'>>) => {
    dispatch({
      type: 'SET_BASIC_SPECS',
      payload: specs
    });
  }, []); // Empty deps - reducer handles defaults via nullish coalescing

  const setQuantities = useCallback((quantities: number[]) => {
    dispatch({ type: 'SET_QUANTITIES', payload: { quantities } });
  }, []);

  const addQuantity = useCallback((quantity: number) => {
    if (quantity >= 500 && quantity <= 1000000) {
      dispatch({ type: 'ADD_QUANTITY', payload: quantity });
    }
  }, []);

  const removeQuantity = useCallback((quantity: number) => {
    dispatch({ type: 'REMOVE_QUANTITY', payload: quantity });
  }, []);

  const setSelectedQuantity = useCallback((quantity: number | null) => {
    dispatch({ type: 'SET_SELECTED_QUANTITY', payload: quantity });
  }, []);

  const setComparisonQuantities = useCallback((quantities: number[]) => {
    dispatch({ type: 'SET_COMPARISON_QUANTITIES', payload: quantities });
  }, []);

  const updatePrintingOptions = useCallback((options: Partial<MultiQuantityQuoteState>) => {
    dispatch({
      type: 'SET_PRINTING_OPTIONS',
      payload: {
        isUVPrinting: options.isUVPrinting !== undefined ? options.isUVPrinting : state.isUVPrinting,
        printingType: options.printingType,
        printingColors: options.printingColors,
        doubleSided: options.doubleSided
      }
    });
  }, [state]);

  const updatePostProcessing = useCallback((options: string[], multiplier: number) => {
    dispatch({ type: 'SET_POST_PROCESSING', payload: { options, multiplier } });
  }, []);

  const updateDelivery = useCallback((location: 'domestic' | 'international', urgency: 'standard' | 'express') => {
    dispatch({ type: 'SET_DELIVERY', payload: { location, urgency } });
  }, []);

  const calculateMultiQuantity = useCallback(async (): Promise<MultiQuantityResult | null> => {
    console.log('[calculateMultiQuantity] Starting calculation with state:', {
      comparisonQuantities: state.comparisonQuantities,
      bagTypeId: state.bagTypeId,
      materialId: state.materialId,
      width: state.width,
      height: state.height
    });

    if (!canCalculateMultiQuantity()) {
      console.error('[calculateMultiQuantity] Cannot calculate - requirements not met');
      dispatch({ type: 'SET_ERROR', payload: 'Required specifications not complete' });
      return null;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('[calculateMultiQuantity] Calling calculator with:', {
        baseParams: {
          bagTypeId: state.bagTypeId,
          materialId: state.materialId,
          width: state.width,
          height: state.height,
          depth: state.depth,
          thicknessSelection: state.thicknessSelection,
          isUVPrinting: state.isUVPrinting,
          printingType: state.printingType,
          printingColors: state.printingColors,
          doubleSided: state.doubleSided,
          postProcessingOptions: state.postProcessingOptions,
          deliveryLocation: state.deliveryLocation,
          urgency: state.urgency
        },
        quantities: state.comparisonQuantities
      });

      const result = await multiQuantityCalculator.calculateMultiQuantity({
        baseParams: {
          bagTypeId: state.bagTypeId,
          materialId: state.materialId,
          width: state.width,
          height: state.height,
          depth: state.depth,
          thicknessSelection: state.thicknessSelection,
          isUVPrinting: state.isUVPrinting,
          printingType: state.printingType,
          printingColors: state.printingColors,
          doubleSided: state.doubleSided,
          postProcessingOptions: state.postProcessingOptions,
          deliveryLocation: state.deliveryLocation,
          urgency: state.urgency
        },
        quantities: state.comparisonQuantities,
        comparisonMode: 'price',
        includeRecommendations: true
      });

      console.log('[calculateMultiQuantity] Calculation completed:', {
        calculationsSize: result.calculations.size,
        hasComparison: !!result.comparison
      });

      // Dispatch state update
      dispatch({ type: 'SET_MULTI_QUANTITY_RESULTS', payload: result });

      // Also return result for immediate use
      return result;
    } catch (error) {
      console.error('[calculateMultiQuantity] Error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to calculate multi-quantity quotes' });
      return null;
    }
  }, [state]); // This needs state dependencies for the calculation

  const saveQuantityPattern = useCallback((name: string, description: string) => {
    const pattern: SavedQuantityPattern = {
      id: Date.now().toString(),
      name,
      description,
      quantities: [...state.quantities],
      createdAt: new Date(),
      lastUsed: new Date(),
      isDefault: false
    };

    dispatch({ type: 'ADD_SAVED_PATTERN', payload: pattern });
  }, [state.quantities]);

  const loadQuantityPattern = useCallback((pattern: SavedQuantityPattern) => {
    setQuantities(pattern.quantities);
    // Update last used time
    const updatedPattern = { ...pattern, lastUsed: new Date() };
    dispatch({
      type: 'UPDATE_FIELD',
      payload: {
        field: 'savedPatterns',
        value: state.savedPatterns.map(p =>
          p.id === pattern.id ? updatedPattern : p
        )
      }
    });
  }, [state.savedPatterns, setQuantities]);

  const resetQuote = useCallback(() => {
    dispatch({ type: 'RESET_QUOTE' });
  }, []);

  // Validation helpers - wrapped in useCallback
  const isStepComplete = useCallback((step: string): boolean => {
    switch (step) {
      case 'specs':
        const hasBasicSpecs = !!(state.bagTypeId && state.materialId && state.width > 0 && state.height > 0);
        const materialsWithThickness = ['pet_al', 'pet_vmpet', 'pet_ldpe', 'pet_ny_al'];
        const requiresThickness = materialsWithThickness.includes(state.materialId);
        const hasThickness = !!state.thicknessSelection;
        return hasBasicSpecs && (!requiresThickness || hasThickness);
      case 'quantity':
        return state.comparisonQuantities.length > 0 && state.comparisonQuantities.every(q => q >= 500);
      case 'post-processing':
        return true; // Post-processing is optional
      case 'delivery':
        return !!(state.deliveryLocation && state.urgency);
      default:
        return false;
    }
  }, [state]);

  const getStepSummary = useCallback((step: string): React.ReactNode => {
    switch (step) {
      case 'specs':
        return (
          <div className="text-sm space-y-1">
            <div><span className="font-medium">袋タイプ:</span> {state.bagTypeId}</div>
            <div><span className="font-medium">素材:</span> {state.materialId}</div>
            <div><span className="font-medium">サイズ:</span> {state.width} × {state.height} {state.depth > 0 && `× ${state.depth}`} mm</div>
            {state.thicknessSelection && (
              <div><span className="font-medium">厚さ:</span> {state.thicknessSelection}</div>
            )}
          </div>
        );
      case 'quantity':
        return (
          <div className="text-sm space-y-1">
            <div><span className="font-medium">比較数量:</span> {state.comparisonQuantities.length}個</div>
            <div><span className="font-medium">印刷:</span> {state.isUVPrinting ? 'UV Digital' : state.printingType}</div>
            {state.printingColors && (
              <div><span className="font-medium">色数:</span> {state.printingColors} {state.doubleSided && '（両面印刷）'}</div>
            )}
          </div>
        );
      case 'post-processing':
        return (
          <div className="text-sm space-y-1">
            {state.postProcessingOptions.length > 0 ? (
              <>
                <div><span className="font-medium">後加工:</span> {state.postProcessingOptions.length}個選択</div>
                <div><span className="font-medium">倍率:</span> ×{state.postProcessingMultiplier.toFixed(2)}</div>
              </>
            ) : (
              <div><span className="font-medium">後加工:</span> なし</div>
            )}
          </div>
        );
      default:
        return null;
    }
  }, [state]);

  const canCalculateMultiQuantity = useCallback((): boolean => {
    return !!(state.bagTypeId &&
            state.materialId &&
            state.width > 0 &&
            state.height > 0 &&
            state.comparisonQuantities.length > 0 &&
            state.comparisonQuantities.every(q => q >= 500 && q <= 1000000));
  }, [state]);

  // Save/Load functionality implementations
  const saveComparison = async (metadata: {
    title?: string;
    description?: string;
    customerName?: string;
    projectName?: string;
  } = {}) => {
    if (!state.comparison || state.multiQuantityResults.size === 0) {
      return { success: false, error: '保存できる比較結果がありません' };
    }

    dispatch({ type: 'SET_LOADING_SAVE', payload: true });

    try {
      const response = await fetch('/api/comparison/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseParams: {
            bagTypeId: state.bagTypeId,
            materialId: state.materialId,
            width: state.width,
            height: state.height,
            depth: state.depth,
            thicknessSelection: state.thicknessSelection,
            isUVPrinting: state.isUVPrinting,
            printingType: state.printingType,
            printingColors: state.printingColors,
            doubleSided: state.doubleSided,
            postProcessingOptions: state.postProcessingOptions,
            deliveryLocation: state.deliveryLocation,
            urgency: state.urgency,
          },
          quantities: state.comparisonQuantities,
          calculations: Object.fromEntries(state.multiQuantityResults),
          comparison: state.comparison,
          metadata: {
            title: metadata.title || `比較結果 ${new Date().toLocaleDateString()}`,
            description: metadata.description,
            customerName: metadata.customerName,
            projectName: metadata.projectName,
            validityDays: 30,
          },
          userPreferences: {
            includeBreakdown: true,
            includeRecommendations: true,
            currency: 'JPY',
            locale: 'ja',
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update share URL
        dispatch({ type: 'SET_EXPORT_URL', payload: result.data.shareUrl });

        // Also save to localStorage for offline access
        const localStorageData = {
          id: result.data.shareId,
          shareId: result.data.shareId,
          title: metadata.title || `比較結果 ${new Date().toLocaleDateString()}`,
          description: metadata.description,
          customerName: metadata.customerName,
          projectName: metadata.projectName,
          createdAt: new Date().toISOString(),
          expiresAt: result.data.expiresAt,
          viewCount: 0,
          shareUrl: result.data.shareUrl,
          baseParams: {
            bagTypeId: state.bagTypeId,
            materialId: state.materialId,
            width: state.width,
            height: state.height,
            depth: state.depth,
            thicknessSelection: state.thicknessSelection,
            isUVPrinting: state.isUVPrinting,
            printingType: state.printingType,
            printingColors: state.printingColors,
            doubleSided: state.doubleSided,
            postProcessingOptions: state.postProcessingOptions,
            deliveryLocation: state.deliveryLocation,
            urgency: state.urgency,
          },
          quantities: state.comparisonQuantities,
          calculations: Object.fromEntries(state.multiQuantityResults),
          comparison: state.comparison,
          userPreferences: {
            includeBreakdown: true,
            includeRecommendations: true,
            currency: 'JPY',
            locale: 'ja',
          },
          metadata: {
            title: metadata.title,
            description: metadata.description,
            customerName: metadata.customerName,
            projectName: metadata.projectName,
            createdAt: new Date().toISOString(),
            expiresAt: result.data.expiresAt,
            isShared: false,
            viewCount: 0,
            lastViewed: null,
          },
        };

        saveToLocalStorage(localStorageData);

        // Reload saved comparisons
        await loadSavedComparisons();

        return {
          success: true,
          shareId: result.data.shareId,
          shareUrl: result.data.shareUrl,
        };
      } else {
        return {
          success: false,
          error: result.error?.message || '保存に失敗しました',
        };
      }
    } catch (error) {
      console.error('Save comparison error:', error);
      return {
        success: false,
        error: '保存中にエラーが発生しました',
      };
    } finally {
      dispatch({ type: 'SET_LOADING_SAVE', payload: false });
    }
  };

  const loadComparison = async (shareId: string) => {
    dispatch({ type: 'SET_LOADING_SAVE', payload: true });

    try {
      // Try API first
      const response = await fetch(`/api/comparison/save?shareId=${shareId}`, {
        method: 'GET',
      });

      const result = await response.json();

      if (result.success) {
        const data = result.data;

        // Load the comparison data into the context
        dispatch({ type: 'LOAD_COMPARISON', payload: data });

        return {
          success: true,
          data: result.data,
        };
      } else {
        // If API fails, try localStorage
        const localData = loadFromLocalStorage().find(comp => comp.shareId === shareId);
        if (localData) {
          dispatch({ type: 'LOAD_COMPARISON', payload: localData });
          return {
            success: true,
            data: localData,
          };
        }

        return {
          success: false,
          error: result.error?.message || '読み込みに失敗しました',
        };
      }
    } catch (error) {
      console.error('Load comparison error:', error);

      // Try localStorage as fallback
      const localData = loadFromLocalStorage().find(comp => comp.shareId === shareId);
      if (localData) {
        dispatch({ type: 'LOAD_COMPARISON', payload: localData });
        return {
          success: true,
          data: localData,
        };
      }

      return {
        success: false,
        error: '読み込み中にエラーが発生しました',
      };
    } finally {
      dispatch({ type: 'SET_LOADING_SAVE', payload: false });
    }
  };

  const exportComparison = async (format: 'pdf' | 'excel' | 'csv', options = {}) => {
    if (!state.comparison || state.multiQuantityResults.size === 0) {
      return { success: false, error: 'エクスポートできる比較結果がありません' };
    }

    try {
      // First save to get shareId
      const saveResult = await saveComparison();
      if (!saveResult.success) {
        return saveResult;
      }

      const response = await fetch('/api/comparison/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareId: saveResult.shareId,
          format,
          options: {
            includeBreakdown: true,
            includeRecommendations: true,
            includeCharts: true,
            language: 'ja',
            currency: 'JPY',
            ...options,
          },
        }),
      });

      if (format === 'pdf') {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comparison-${saveResult.shareId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return { success: true, url };
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comparison-${saveResult.shareId}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return { success: true, url };
      }
    } catch (error) {
      console.error('Export comparison error:', error);
      return {
        success: false,
        error: 'エクスポート中にエラーが発生しました',
      };
    }
  };

  
  const deleteComparison = async (shareId: string) => {
    try {
      const response = await fetch(`/api/comparison/save?shareId=${shareId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        const updatedComparisons = state.savedComparisons.filter(
          (comp: any) => comp.shareId !== shareId
        );
        dispatch({
          type: 'SET_SAVED_COMPARISONS',
          payload: updatedComparisons,
        });

        // Also delete from localStorage
        deleteFromLocalStorage(shareId);

        return { success: true };
      } else {
        return {
          success: false,
          error: result.error?.message || '削除に失敗しました',
        };
      }
    } catch (error) {
      console.error('Delete comparison error:', error);
      return {
        success: false,
        error: '削除中にエラーが発生しました',
      };
    }
  };

  const shareComparison = async (shareId: string, options = {}) => {
    try {
      const response = await fetch('/api/comparison/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareId,
          options: {
            expiryDays: 30,
            allowDownload: true,
            allowComment: false,
            language: 'ja',
            ...options,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          shareUrl: result.data.shareUrl,
        };
      } else {
        return {
          success: false,
          error: result.error?.message || '共有に失敗しました',
        };
      }
    } catch (error) {
      console.error('Share comparison error:', error);
      return {
        success: false,
        error: '共有中にエラーが発生しました',
      };
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  // ✅ FIXED: state is NOW in dependency array - critical for consumers to receive latest state
  const value = useMemo(() => ({
    state,
    dispatch,
    updateBasicSpecs,
    setQuantities,
    addQuantity,
    removeQuantity,
    setSelectedQuantity,
    setComparisonQuantities,
    updatePrintingOptions,
    updatePostProcessing,
    updateDelivery,
    calculateMultiQuantity,
    saveQuantityPattern,
    loadQuantityPattern,
    resetQuote,
    saveComparison,
    loadComparison,
    exportComparison,
    loadSavedComparisons,
    deleteComparison,
    shareComparison,
    isStepComplete,
    getStepSummary,
    canCalculateMultiQuantity
  }), [state]); // ✅ state in deps - ensures consumers always receive latest state

  return (
    <MultiQuantityQuoteContext.Provider value={value}>
      {children}
    </MultiQuantityQuoteContext.Provider>
  );
}

// Hook to use the context
export function useMultiQuantityQuote() {
  const context = useContext(MultiQuantityQuoteContext);
  if (context === undefined) {
    throw new Error('useMultiQuantityQuote must be used within a MultiQuantityQuoteProvider');
  }
  return context;
}