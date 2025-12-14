'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import type { Product } from '@/types/database'

// Comparison state type
interface ComparisonState {
  compareMode: boolean
  selectedProducts: Product[]
  maxSelection: number
  isCompared: boolean
}

// Action types
type ComparisonAction =
  | { type: 'TOGGLE_COMPARE_MODE' }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_COMPARED'; payload: boolean }

// Initial state
const initialState: ComparisonState = {
  compareMode: false,
  selectedProducts: [],
  maxSelection: 4,
  isCompared: false
}

// Comparison reducer
function comparisonReducer(state: ComparisonState, action: ComparisonAction): ComparisonState {
  switch (action.type) {
    case 'TOGGLE_COMPARE_MODE':
      return {
        ...state,
        compareMode: !state.compareMode,
        // If turning off mode, clear selection
        selectedProducts: !state.compareMode ? [] : state.selectedProducts,
        isCompared: false
      }

    case 'ADD_PRODUCT': {
      // Check if product already selected
      const isSelected = state.selectedProducts.some(p => p.id === action.payload.id)
      if (isSelected) {
        // Remove if already selected
        return {
          ...state,
          selectedProducts: state.selectedProducts.filter(p => p.id !== action.payload.id)
        }
      }

      // Check max selection limit
      if (state.selectedProducts.length >= state.maxSelection) {
        return state
      }

      return {
        ...state,
        selectedProducts: [...state.selectedProducts, action.payload],
        isCompared: false
      }
    }

    case 'REMOVE_PRODUCT':
      return {
        ...state,
        selectedProducts: state.selectedProducts.filter(p => p.id !== action.payload),
        isCompared: state.selectedProducts.length <= 1 ? false : state.isCompared
      }

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedProducts: [],
        isCompared: false
      }

    case 'SET_COMPARED':
      return {
        ...state,
        isCompared: action.payload
      }

    default:
      return state
  }
}

// Context
const ComparisonContext = createContext<{
  state: ComparisonState
  toggleCompareMode: () => void
  toggleProductSelection: (product: Product) => void
  isProductSelected: (productId: string) => boolean
  removeProduct: (productId: string) => void
  clearSelection: () => void
  setCompared: (compared: boolean) => void
  canAddMore: boolean
  getRemainingSlots: number
} | null>(null)

// Provider component
export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(comparisonReducer, initialState)

  const toggleCompareMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_COMPARE_MODE' })
  }, [])

  const toggleProductSelection = useCallback((product: Product) => {
    dispatch({ type: 'ADD_PRODUCT', payload: product })
  }, [])

  const isProductSelected = useCallback((productId: string) => {
    return state.selectedProducts.some(p => p.id === productId)
  }, [state.selectedProducts])

  const removeProduct = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_PRODUCT', payload: productId })
  }, [])

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' })
  }, [])

  const setCompared = useCallback((compared: boolean) => {
    dispatch({ type: 'SET_COMPARED', payload: compared })
  }, [])

  const canAddMore = state.selectedProducts.length < state.maxSelection
  const getRemainingSlots = state.maxSelection - state.selectedProducts.length

  const value = {
    state,
    toggleCompareMode,
    toggleProductSelection,
    isProductSelected,
    removeProduct,
    clearSelection,
    setCompared,
    canAddMore,
    getRemainingSlots
  }

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  )
}

// Hook to use comparison context
export function useComparison() {
  const context = useContext(ComparisonContext)
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider')
  }
  return context
}

// Utility functions for comparison
export const getComparisonScore = (product: Product, criteria: string[]): number => {
  let score = 0
  const maxScore = criteria.length

  criteria.forEach(criterion => {
    switch (criterion) {
      case 'price':
        // Lower base cost is better (0-10 scale)
        const priceScore = Math.max(0, 10 - (((product.pricing_formula as any)?.base_cost || 0) / 5000))
        score += priceScore
        break

      case 'lead_time':
        // Faster lead time is better (0-10 scale)
        const leadTimeScore = Math.max(0, 10 - (product.lead_time_days / 3))
        score += leadTimeScore
        break

      case 'min_quantity':
        // Lower minimum quantity is better for flexibility
        const quantityScore = Math.max(0, 10 - (product.min_order_quantity / 1000))
        score += quantityScore
        break

      case 'features':
        // More features is better (0-10 scale)
        const featureScore = Math.min(10, (product.materials?.length || 0) * 2)
        score += featureScore
        break

      case 'versatility':
        // More applications is better
        const versatilityScore = Math.min(10, (product.materials?.length || 0) * 1.5)
        score += versatilityScore
        break

      case 'materials':
        // More material options is better
        const materialScore = Math.min(10, product.materials.length * 2)
        score += materialScore
        break
    }
  })

  return Math.round((score / maxScore) * 100)
}

export const compareProducts = (products: Product[]): {
  overallBest: Product | null
  priceBest: Product | null
  speedBest: Product | null
  flexibleBest: Product | null
} => {
  if (products.length < 2) {
    return {
      overallBest: null,
      priceBest: null,
      speedBest: null,
      flexibleBest: null
    }
  }

  const criteria = ['price', 'lead_time', 'min_quantity', 'features', 'versatility', 'materials']

  const scoredProducts = products.map(product => ({
    product,
    overallScore: getComparisonScore(product, criteria),
    priceScore: getComparisonScore(product, ['price']),
    speedScore: getComparisonScore(product, ['lead_time']),
    flexibilityScore: getComparisonScore(product, ['min_quantity'])
  }))

  const overallBest = scoredProducts
    .sort((a, b) => b.overallScore - a.overallScore)[0].product

  const priceBest = scoredProducts
    .sort((a, b) => b.priceScore - a.priceScore)[0].product

  const speedBest = scoredProducts
    .sort((a, b) => b.speedScore - a.speedScore)[0].product

  const flexibleBest = scoredProducts
    .sort((a, b) => b.flexibilityScore - a.flexibilityScore)[0].product

  return {
    overallBest,
    priceBest,
    speedBest,
    flexibleBest
  }
}

export const getUniqueMaterials = (products: Product[]): string[] => {
  const allMaterials = products.flatMap(p => p.materials || [])
  return Array.from(new Set(allMaterials))
}