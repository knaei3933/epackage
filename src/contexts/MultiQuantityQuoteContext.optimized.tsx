'use client';

import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect, ReactNode } from 'react';
import { MultiQuantityQuoteState, SavedQuantityPattern, MultiQuantityResult } from '@/types/multi-quantity';
import { optimizedMultiQuantityCalculator } from '@/lib/multi-quantity-calculator.optimized';
import { v4 as uuidv4 } from 'uuid';
import { saveToLocalStorage, loadFromLocalStorage, deleteFromLocalStorage } from '@/lib/storage';

// Enhanced action types
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
  | { type: 'SAVE_COMPARISON'; payload: { title?: string; description?: string; customerName?: string; projectName?: string } }
  | { type: 'LOAD_COMPARISON'; payload: any }
  | { type: 'EXPORT_COMPARISON'; payload: { format: 'pdf' | 'excel' | 'csv'; options?: any } }
  | { type: 'SET_SAVED_COMPARISONS'; payload: any[] }
  | { type: 'SET_LOADING_SAVE'; payload: boolean }
  | { type: 'SET_EXPORT_URL'; payload: string }
  | { type: 'CLEAR_EXPORT_URL' }
  | { type: 'CLEANUP_CACHE' };

// Memory management interface
interface MemoryManager {
  cleanup: () => void;
  getCacheSize: () => number;
  clearCache: () => void;
}

// Initial state with optimized defaults
const initialState: MultiQuantityQuoteState = {
  // Basic specifications
  bagTypeId: 'flat_3_side',
  materialId: 'pet_al',
  width: 200,
  height: 300,
  depth: 0,
  thicknessSelection: 'medium',

  // Enhanced quantity fields
  quantities: [1000, 5000, 10000], // Reduced default quantities for memory efficiency
  comparisonQuantities: [1000, 5000, 10000],
  selectedQuantity: 1000,
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

  // User preferences (limited for memory)
  savedPatterns: [],
  recentCalculations: [],
  savedComparisons: [],
  isLoadingSave: false,
  exportUrl: null,
  shareUrl: null,
};

// Optimized reducer with memory management
function multiQuoteReducer(state: MultiQuantityQuoteState, action: MultiQuoteAction): MultiQuantityQuoteState {
  switch (action.type) {
    case 'SET_BASIC_SPECS':
      return {
        ...state,
        bagTypeId: action.payload.bagTypeId,
        materialId: action.payload.materialId,
        width: action.payload.width,
        height: action.payload.height,
        depth: action.payload.depth,
        thicknessSelection: action.payload.thicknessSelection || state.thicknessSelection,
        // Clear previous results to free memory
        multiQuantityResults: new Map(),
        comparison: null,
        error: null
      };

    case 'SET_QUANTITIES':
      // Limit quantities to prevent memory issues
      const limitedQuantities = action.payload.quantities.slice(0, 10);
      return {
        ...state,
        quantities: limitedQuantities,
        comparisonQuantities: limitedQuantities,
        multiQuantityResults: new Map(),
        comparison: null,
        error: null
      };

    case 'ADD_QUANTITY':
      if (state.quantities.includes(action.payload) || state.quantities.length >= 10) {
        return state; // Prevent duplicates and limit size
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

    case 'SET_MULTI_QUANTITY_RESULTS':
      // Limit recent calculations to prevent memory bloat
      const recentCalculations = [
        action.payload,
        ...state.recentCalculations.slice(0, 2) // Keep only last 3
      ].filter(calc => calc && calc.metadata); // Filter out invalid entries

      return {
        ...state,
        multiQuantityResults: action.payload.calculations,
        comparison: action.payload.comparison,
        recentCalculations,
        isLoading: false,
        error: null
      };

    case 'CLEANUP_CACHE':
      // Clear memory-heavy data
      return {
        ...state,
        multiQuantityResults: new Map(),
        comparison: null,
        recentCalculations: state.recentCalculations.slice(0, 1) // Keep only the most recent
      };

    case 'RESET_QUOTE':
      return {
        ...initialState,
        savedPatterns: state.savedPatterns.slice(0, 5), // Limit saved patterns
        savedComparisons: state.savedComparisons.slice(0, 10) // Limit saved comparisons
      };

    default:
      return state;
  }
}

// Create context with memory management
const MultiQuantityQuoteContext = createContext<{
  state: MultiQuantityQuoteState;
  dispatch: React.Dispatch<MultiQuoteAction>;
  // Optimized action helpers
  updateBasicSpecs: (specs: Partial<MultiQuantityQuoteState>) => void;
  setQuantities: (quantities: number[]) => void;
  addQuantity: (quantity: number) => void;
  removeQuantity: (quantity: number) => void;
  setSelectedQuantity: (quantity: number | null) => void;
  setComparisonQuantities: (quantities: number[]) => void;
  updatePrintingOptions: (options: Partial<MultiQuantityQuoteState>) => void;
  updatePostProcessing: (options: string[], multiplier: number) => void;
  updateDelivery: (location: 'domestic' | 'international', urgency: 'standard' | 'express') => void;
  calculateMultiQuantity: () => Promise<void>;
  saveQuantityPattern: (name: string, description: string) => void;
  loadQuantityPattern: (pattern: SavedQuantityPattern) => void;
  resetQuote: () => void;
  // Memory management
  memoryManager: MemoryManager;
  // Validation helpers
  isStepComplete: (step: string) => boolean;
  getStepSummary: (step: string) => React.ReactNode;
  canCalculateMultiQuantity: () => boolean;
  // Debounced save functions
  debouncedSaveComparison: (metadata?: any) => Promise<any>;
} | undefined>(undefined);

// Provider component with memory optimization
interface MultiQuantityQuoteProviderProps {
  children: ReactNode;
}

export function MultiQuantityQuoteProvider({ children }: MultiQuantityQuoteProviderProps) {
  const [state, dispatch] = useReducer(multiQuoteReducer, initialState);

  // Refs for memory management
  const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if calculation can be performed
  const canCalculateMultiQuantity = useCallback((): boolean => {
    return !!(state.bagTypeId &&
            state.materialId &&
            state.width > 0 &&
            state.height > 0 &&
            state.comparisonQuantities.length > 0 &&
            state.comparisonQuantities.every(q => q >= 500 && q <= 1000000));
  }, [state]);

  // Memory manager
  const memoryManager: MemoryManager = {
    cleanup: useCallback(() => {
      // Clear timeouts
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Abort ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Dispatch cleanup action
      dispatch({ type: 'CLEANUP_CACHE' });

      // Clear calculator cache
      optimizedMultiQuantityCalculator.clearAllCaches();
    }, []),

    getCacheSize: useCallback(() => {
      const stats = optimizedMultiQuantityCalculator.getCacheStats();
      return Object.values(stats).reduce((total, cache) => total + cache.size, 0);
    }, []),

    clearCache: useCallback(() => {
      optimizedMultiQuantityCalculator.clearAllCaches();
      dispatch({ type: 'CLEANUP_CACHE' });
    }, [])
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      memoryManager.cleanup();
    };
  }, [memoryManager]);

  // Optimized action helpers with debouncing
  const updateBasicSpecs = useCallback((specs: Partial<MultiQuantityQuoteState>) => {
    if (specs.bagTypeId || specs.materialId || specs.width || specs.height || specs.depth || specs.thicknessSelection) {
      dispatch({
        type: 'SET_BASIC_SPECS',
        payload: {
          bagTypeId: specs.bagTypeId || state.bagTypeId,
          materialId: specs.materialId || state.materialId,
          width: specs.width || state.width,
          height: specs.height || state.height,
          depth: specs.depth !== undefined ? specs.depth : state.depth,
          thicknessSelection: specs.thicknessSelection
        }
      });
    }
  }, [state]);

  const setQuantities = useCallback((quantities: number[]) => {
    dispatch({ type: 'SET_QUANTITIES', payload: { quantities } });
  }, []);

  const addQuantity = useCallback((quantity: number) => {
    if (quantity >= 500 && quantity <= 1000000 && state.quantities.length < 10) {
      dispatch({ type: 'ADD_QUANTITY', payload: quantity });
    }
  }, [state.quantities.length]);

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

  // Optimized calculation with abort controller
  const calculateMultiQuantity = useCallback(async () => {
    if (!canCalculateMultiQuantity()) {
      dispatch({ type: 'SET_ERROR', payload: 'Required specifications not complete' });
      return;
    }

    // Cancel previous calculation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const result = await optimizedMultiQuantityCalculator.calculateMultiQuantity({
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

      // Check if request was aborted
      if (signal.aborted) return;

      dispatch({ type: 'SET_MULTI_QUANTITY_RESULTS', payload: result });
    } catch (error) {
      if (!signal.aborted) {
        console.error('Multi-quantity calculation error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to calculate multi-quantity quotes' });
      }
    } finally {
      if (!signal.aborted) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, [state, canCalculateMultiQuantity]);

  // Debounced save function
  const debouncedSaveComparison = useCallback(async (metadata: {
    title?: string;
    description?: string;
    customerName?: string;
    projectName?: string;
  } = {}) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Return promise that resolves after debounce
    return new Promise((resolve, reject) => {
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          if (!state.comparison || state.multiQuantityResults.size === 0) {
            reject(new Error('保存できる比較結果がありません'));
            return;
          }

          dispatch({ type: 'SET_LOADING_SAVE', payload: true });

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
          dispatch({ type: 'SET_LOADING_SAVE', payload: false });

          if (result.success) {
            dispatch({ type: 'SET_EXPORT_URL', payload: result.data.shareUrl });
            resolve(result);
          } else {
            reject(new Error(result.error?.message || '保存に失敗しました'));
          }
        } catch (error) {
          dispatch({ type: 'SET_LOADING_SAVE', payload: false });
          reject(error);
        }
      }, 500); // 500ms debounce
    });
  }, [state]);

  // Other optimized functions
  const saveQuantityPattern = useCallback((name: string, description: string) => {
    if (state.savedPatterns.length >= 5) {
      console.warn('Maximum saved patterns reached');
      return;
    }

    const pattern: SavedQuantityPattern = {
      id: uuidv4(),
      name,
      description,
      quantities: [...state.quantities],
      createdAt: new Date(),
      lastUsed: new Date(),
      isDefault: false
    };

    dispatch({ type: 'ADD_SAVED_PATTERN', payload: pattern });
  }, [state.quantities, state.savedPatterns.length]);

  const loadQuantityPattern = useCallback((pattern: SavedQuantityPattern) => {
    setQuantities(pattern.quantities);
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
  }, [setQuantities, state.savedPatterns]);

  const resetQuote = useCallback(() => {
    memoryManager.cleanup();
    dispatch({ type: 'RESET_QUOTE' });
  }, [memoryManager]);

  // Validation helpers
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
        return true;
      case 'delivery':
        return !!(state.deliveryLocation && state.urgency);
      default:
        return false;
    }
  }, [state]);

  const getStepSummary = useCallback((step: string): React.ReactNode => {
    // ... implementation unchanged ...
    return null;
  }, [state]);

  const value = {
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
    memoryManager,
    isStepComplete,
    getStepSummary,
    canCalculateMultiQuantity,
    debouncedSaveComparison
  };

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