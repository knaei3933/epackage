'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import type { CatalogState, PackageProduct, CatalogFilters, SortOption } from '@/types/catalog'
import { catalogProducts } from '@/data/catalogData'
import { applyFiltersAndSorting, parseQueryString, createQueryString, debounce } from '@/lib/catalogUtils'

interface CatalogContextType extends CatalogState {
  updateFilters: (filters: Partial<CatalogFilters>) => void
  updateSort: (sort: SortOption) => void
  selectProduct: (product: PackageProduct | null) => void
  openModal: (product: PackageProduct, imageIndex?: number) => void
  closeModal: () => void
  setCurrentImageIndex: (index: number) => void
  resetFilters: () => void
  updateURL: () => void
}

type CatalogAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PRODUCTS'; payload: PackageProduct[] }
  | { type: 'UPDATE_FILTERS'; payload: Partial<CatalogFilters> }
  | { type: 'UPDATE_SORT'; payload: SortOption }
  | { type: 'SELECT_PRODUCT'; payload: PackageProduct | null }
  | { type: 'OPEN_MODAL'; payload: { product: PackageProduct; imageIndex?: number } }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SET_IMAGE_INDEX'; payload: number }
  | { type: 'RESET_FILTERS' }
  | { type: 'APPLY_FILTERS_AND_SORTING' }

const initialState: CatalogState = {
  products: catalogProducts,
  filteredProducts: catalogProducts,
  filters: {
    search: '',
    type: [],
    materials: [],
    sizes: [],
    industries: [],
    priceRange: { min: 0, max: 0 },
    features: []
  },
  sort: {
    key: 'relevance',
    order: 'desc'
  },
  isLoading: false,
  selectedProduct: null,
  modalOpen: false,
  currentImageIndex: 0
}

function catalogReducer(state: CatalogState, action: CatalogAction): CatalogState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }

    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
        filteredProducts: action.payload
      }

    case 'UPDATE_FILTERS':
      const updatedFilters = { ...state.filters, ...action.payload }
      return {
        ...state,
        filters: updatedFilters
      }

    case 'UPDATE_SORT':
      return {
        ...state,
        sort: action.payload
      }

    case 'SELECT_PRODUCT':
      return {
        ...state,
        selectedProduct: action.payload
      }

    case 'OPEN_MODAL':
      return {
        ...state,
        selectedProduct: action.payload.product,
        modalOpen: true,
        currentImageIndex: action.payload.imageIndex || 0
      }

    case 'CLOSE_MODAL':
      return {
        ...state,
        modalOpen: false,
        selectedProduct: null,
        currentImageIndex: 0
      }

    case 'SET_IMAGE_INDEX':
      return {
        ...state,
        currentImageIndex: action.payload
      }

    case 'RESET_FILTERS':
      return {
        ...state,
        filters: {
          search: '',
          type: [],
          materials: [],
          sizes: [],
          industries: [],
          priceRange: { min: 0, max: 0 },
          features: []
        },
        sort: {
          key: 'relevance',
          order: 'desc'
        }
      }

    case 'APPLY_FILTERS_AND_SORTING':
      const filteredAndSorted = applyFiltersAndSorting(
        state.products,
        state.filters,
        state.sort
      )
      return {
        ...state,
        filteredProducts: filteredAndSorted
      }

    default:
      return state
  }
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined)

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(catalogReducer, initialState)

  // Apply filters and sorting whenever they change
  useEffect(() => {
    dispatch({ type: 'APPLY_FILTERS_AND_SORTING' })
  }, [state.filters, state.sort])

  // Load filters from URL on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryString = window.location.search.substring(1)
      if (queryString) {
        const { filters: urlFilters, sort: urlSort } = parseQueryString(queryString)

        if (Object.keys(urlFilters).length > 0) {
          dispatch({ type: 'UPDATE_FILTERS', payload: urlFilters })
        }

        dispatch({ type: 'UPDATE_SORT', payload: urlSort })
      }
    }
  }, [])

  const updateFilters = useCallback((filters: Partial<CatalogFilters>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters })
  }, [])

  const updateSort = useCallback((sort: SortOption) => {
    dispatch({ type: 'UPDATE_SORT', payload: sort })
  }, [])

  const selectProduct = useCallback((product: PackageProduct | null) => {
    dispatch({ type: 'SELECT_PRODUCT', payload: product })
  }, [])

  const openModal = useCallback((product: PackageProduct, imageIndex?: number) => {
    dispatch({ type: 'OPEN_MODAL', payload: { product, imageIndex } })
  }, [])

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' })
  }, [])

  const setCurrentImageIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_IMAGE_INDEX', payload: index })
  }, [])

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' })
  }, [])

  const debouncedUpdateURL = useMemo(() => debounce(() => {
    if (typeof window !== 'undefined') {
      const queryString = createQueryString(state.filters, state.sort)
      const newUrl = queryString ? `/catalog?${queryString}` : '/catalog'
      window.history.replaceState(null, '', newUrl)
    }
  }, 300), [state.filters, state.sort])

  const updateURL = useCallback(() => {
    debouncedUpdateURL()
  }, [debouncedUpdateURL])

  // Update URL whenever filters or sort change
  useEffect(() => {
    updateURL()
  }, [state.filters, state.sort, updateURL])

  const value: CatalogContextType = {
    ...state,
    updateFilters,
    updateSort,
    selectProduct,
    openModal,
    closeModal,
    setCurrentImageIndex,
    resetFilters,
    updateURL
  }

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  )
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (context === undefined) {
    throw new Error('useCatalog must be used within a CatalogProvider')
  }
  return context
}