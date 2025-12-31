'use client';

import React, { createContext, useContext, useReducer, useCallback, useState } from 'react';
import { SimulationState, QuotationResult, SimulationValidationError, EnhancedSimulationContextType } from '@/types/simulation';
import { validateStep, validateField, isFormComplete } from '@/lib/validation';
import { priceCalculator } from '@/lib/pricing';

// Initial state
const initialState: SimulationState = {
  orderType: 'new',
  contentsType: 'solid',
  bagType: 'flat_3_side',
  width: 0,
  height: 0,
  materialGenre: '',
  surfaceMaterial: '',
  materialComposition: '',
  quantities: [],
  deliveryDate: undefined,
};

// Action types
type SimulationAction =
  | { type: 'SET_ORDER_TYPE'; payload: 'new' | 'repeat' }
  | { type: 'SET_CONTENTS_TYPE'; payload: 'solid' | 'liquid' | 'powder' }
  | { type: 'SET_BAG_TYPE'; payload: 'flat_3_side' | 'stand_up' | 'gusset' }
  | { type: 'SET_WIDTH'; payload: number }
  | { type: 'SET_HEIGHT'; payload: number }
  | { type: 'SET_MATERIAL_GENRE'; payload: string }
  | { type: 'SET_SURFACE_MATERIAL'; payload: string }
  | { type: 'SET_MATERIAL_COMPOSITION'; payload: string }
  | { type: 'SET_QUANTITIES'; payload: number[] }
  | { type: 'SET_DELIVERY_DATE'; payload: Date | undefined }
  | { type: 'UPDATE_MULTIPLE_FIELDS'; payload: Partial<SimulationState> }
  | { type: 'RESET_FORM' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RESULTS'; payload: QuotationResult[] }
  | { type: 'SET_VALIDATION_ERRORS'; payload: SimulationValidationError[] };

// Reducer
function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'SET_ORDER_TYPE':
      return { ...state, orderType: action.payload };
    case 'SET_CONTENTS_TYPE':
      return { ...state, contentsType: action.payload };
    case 'SET_BAG_TYPE':
      return { ...state, bagType: action.payload };
    case 'SET_WIDTH':
      return { ...state, width: action.payload };
    case 'SET_HEIGHT':
      return { ...state, height: action.payload };
    case 'SET_MATERIAL_GENRE':
      return { ...state, materialGenre: action.payload };
    case 'SET_SURFACE_MATERIAL':
      return { ...state, surfaceMaterial: action.payload };
    case 'SET_MATERIAL_COMPOSITION':
      return { ...state, materialComposition: action.payload };
    case 'SET_QUANTITIES':
      return { ...state, quantities: action.payload };
    case 'SET_DELIVERY_DATE':
      return { ...state, deliveryDate: action.payload };
    case 'UPDATE_MULTIPLE_FIELDS':
      return { ...state, ...action.payload };
    case 'RESET_FORM':
      return initialState;
    default:
      return state;
  }
}


// Context provider
const SimulationContext = createContext<EnhancedSimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(simulationReducer, initialState);
  const [results, setResults] = useState<QuotationResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<SimulationValidationError[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Real-time price calculation with debouncing
  const calculatePrices = useCallback(async (currentState: SimulationState) => {
    if (!currentState.width || !currentState.height || !currentState.materialGenre ||
        !currentState.surfaceMaterial || currentState.quantities.length === 0) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const calculationResults = await priceCalculator.calculate(currentState, 150); // 150ms debounce
      setResults(calculationResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : '価格計算中にエラーが発生しました。');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    const validation = validateStep(currentStep, state);

    if (validation.success) {
      setValidationErrors([]);
      return true;
    }

    const errors: SimulationValidationError[] = validation.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    setValidationErrors(errors);
    return false;
  }, [currentStep, state]);

  // Field-specific validation
  const validateFieldRealtime = useCallback((field: string, value: unknown) => {
    const validation = validateField(
      field as keyof typeof state,
      value,
      state.bagType
    );

    if (!validation.isValid) {
      setValidationErrors(prev => [
        ...prev.filter(err => err.field !== field),
        { field, message: validation.message }
      ]);
    } else {
      setValidationErrors(prev => prev.filter(err => err.field !== field));
    }

    return validation.isValid;
  }, [state.bagType]);

  // Update state with automatic validation and price calculation
  const updateState = useCallback((updates: Partial<SimulationState>) => {
    dispatch({ type: 'UPDATE_MULTIPLE_FIELDS', payload: updates });

    // Validate updated fields
    Object.entries(updates).forEach(([field, value]) => {
      validateFieldRealtime(field, value);
    });

    // Trigger price calculation for relevant field changes
    const priceRelevantFields = [
      'bagType', 'width', 'height', 'materialGenre', 'surfaceMaterial', 'quantities', 'orderType'
    ];

    if (priceRelevantFields.some(field => updates[field as keyof SimulationState] !== undefined)) {
      const newState = { ...state, ...updates };
      calculatePrices(newState);
    }
  }, [state, validateFieldRealtime, calculatePrices]);

  // Individual field setters with validation
  const setOrderType = useCallback((orderType: 'new' | 'repeat') => {
    dispatch({ type: 'SET_ORDER_TYPE', payload: orderType });
    calculatePrices({ ...state, orderType });
  }, [state, calculatePrices]);

  const setContentType = useCallback((contentsType: 'solid' | 'liquid' | 'powder') => {
    dispatch({ type: 'SET_CONTENTS_TYPE', payload: contentsType });
  }, []);

  const setBagType = useCallback((bagType: 'flat_3_side' | 'stand_up' | 'gusset') => {
    dispatch({ type: 'SET_BAG_TYPE', payload: bagType });
    validateFieldRealtime('bagType', bagType);
    calculatePrices({ ...state, bagType });
  }, [state, validateFieldRealtime, calculatePrices]);

  const setSize = useCallback((width: number, height: number) => {
    dispatch({ type: 'SET_WIDTH', payload: width });
    dispatch({ type: 'SET_HEIGHT', payload: height });

    validateFieldRealtime('width', width);
    validateFieldRealtime('height', height);

    if (width > 0 && height > 0 && state.bagType) {
      calculatePrices({ ...state, width, height });
    }
  }, [state, validateFieldRealtime, calculatePrices]);

  const setWidth = useCallback((width: number) => {
    dispatch({ type: 'SET_WIDTH', payload: width });
    validateFieldRealtime('width', width);
    if (width > 0 && state.height > 0 && state.bagType) {
      calculatePrices({ ...state, width });
    }
  }, [state, validateFieldRealtime, calculatePrices]);

  const setHeight = useCallback((height: number) => {
    dispatch({ type: 'SET_HEIGHT', payload: height });
    validateFieldRealtime('height', height);
    if (state.width > 0 && height > 0 && state.bagType) {
      calculatePrices({ ...state, height });
    }
  }, [state, validateFieldRealtime, calculatePrices]);

  const setMaterialGenre = useCallback((materialGenre: string) => {
    dispatch({ type: 'SET_MATERIAL_GENRE', payload: materialGenre });
    validateFieldRealtime('materialGenre', materialGenre);
    if (materialGenre && state.surfaceMaterial) {
      calculatePrices({ ...state, materialGenre });
    }
  }, [state, validateFieldRealtime, calculatePrices]);

  const setSurfaceMaterial = useCallback((surfaceMaterial: string) => {
    dispatch({ type: 'SET_SURFACE_MATERIAL', payload: surfaceMaterial });
    validateFieldRealtime('surfaceMaterial', surfaceMaterial);
    if (state.materialGenre && surfaceMaterial) {
      calculatePrices({ ...state, surfaceMaterial });
    }
  }, [state, validateFieldRealtime, calculatePrices]);

  const setMaterialComposition = useCallback((materialComposition: string) => {
    dispatch({ type: 'SET_MATERIAL_COMPOSITION', payload: materialComposition });
    validateFieldRealtime('materialComposition', materialComposition);
  }, [validateFieldRealtime]);

  const setQuantities = useCallback((quantities: number[]) => {
    dispatch({ type: 'SET_QUANTITIES', payload: quantities });
    validateFieldRealtime('quantities', quantities);
    if (quantities.length > 0 && state.width > 0 && state.height > 0) {
      calculatePrices({ ...state, quantities });
    }
  }, [state, validateFieldRealtime, calculatePrices]);

  const setDeliveryDate = useCallback((deliveryDate: Date | undefined) => {
    dispatch({ type: 'SET_DELIVERY_DATE', payload: deliveryDate });
    validateFieldRealtime('deliveryDate', deliveryDate);
  }, [validateFieldRealtime]);

  // Navigation functions
  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  }, [validateCurrentStep]);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Utility functions
  const clearErrors = useCallback(() => {
    setValidationErrors([]);
    setError(null);
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
    setResults(null);
    setValidationErrors([]);
    setError(null);
    setCurrentStep(1);
    priceCalculator.clearCache();
  }, []);

  const calculate = useCallback(() => {
    calculatePrices(state);
  }, [state, calculatePrices]);

  // Calculate form validity
  const isFormValid = isFormComplete(state) && validationErrors.length === 0;

  // Context value
  const contextValue: EnhancedSimulationContextType = {
    state,
    updateState,
    calculate,
    results,
    isLoading,
    error,
    validationErrors,
    isFormValid,
    currentStep,
    clearErrors,
    validateCurrentStep,
    nextStep,
    previousStep,
    resetForm,
    setOrderType,
    setContentType,
    setBagType,
    setWidth,
    setHeight,
    setSize,
    setMaterialGenre,
    setSurfaceMaterial,
    setMaterialComposition,
    setQuantities,
    setDeliveryDate,
  };

  return (
    <SimulationContext.Provider value={contextValue}>
      {children}
    </SimulationContext.Provider>
  );
}

// Custom hook
export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}

// Additional hooks for specific use cases
export function useSimulationValidation() {
  const { validationErrors, isFormValid, validateCurrentStep, clearErrors } = useSimulation();

  const getFieldError = useCallback((field: string) => {
    return validationErrors.find(err => err.field === field)?.message || '';
  }, [validationErrors]);

  const hasFieldError = useCallback((field: string) => {
    return validationErrors.some(err => err.field === field);
  }, [validationErrors]);

  return {
    validationErrors,
    isFormValid,
    validateCurrentStep,
    clearErrors,
    getFieldError,
    hasFieldError,
  };
}

export function useSimulationPricing() {
  const { results, isLoading, error } = useSimulation();

  const getTotalPrice = useCallback(() => {
    if (!results || results.length === 0) return 0;
    return results[0].totalPrice; // First quantity total
  }, [results]);

  const getUnitPrice = useCallback(() => {
    if (!results || results.length === 0) return 0;
    return results[0].unitPrice;
  }, [results]);

  const getPriceRange = useCallback(() => {
    if (!results || results.length === 0) return { min: 0, max: 0 };
    const unitPrices = results.map(r => r.unitPrice);
    return {
      min: Math.min(...unitPrices),
      max: Math.max(...unitPrices),
    };
  }, [results]);

  return {
    results,
    isLoading,
    error,
    getTotalPrice,
    getUnitPrice,
    getPriceRange,
  };
}