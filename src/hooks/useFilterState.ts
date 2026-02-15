'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface FilterState {
  searchQuery: string
  selectedCategory: string
  selectedMaterials: string[]
  priceRange: [number, number]
  selectedMOQ: string[]
  selectedLeadTime: string[]
  sortBy: 'name' | 'price' | 'leadTime' | 'rating'
  viewMode: 'grid' | 'list'
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  selectedCategory: 'all',
  selectedMaterials: [],
  priceRange: [0, 100000],
  selectedMOQ: [],
  selectedLeadTime: [],
  sortBy: 'name',
  viewMode: 'grid'
}

export function useFilterState(initialPriceRange: [number, number] = [0, 100000]) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Initialize state from URL or defaults
  const getInitialState = useCallback((): FilterState => {
    const urlFilters: Partial<FilterState> = {}

    // Parse search params
    const query = searchParams.get('q')
    if (query) urlFilters.searchQuery = query

    const category = searchParams.get('category')
    if (category) urlFilters.selectedCategory = category

    const materials = searchParams.get('materials')
    if (materials) urlFilters.selectedMaterials = materials.split(',')

    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice || maxPrice) {
      urlFilters.priceRange = [
        minPrice ? parseInt(minPrice) : initialPriceRange[0],
        maxPrice ? parseInt(maxPrice) : initialPriceRange[1]
      ]
    }

    const moq = searchParams.get('moq')
    if (moq) urlFilters.selectedMOQ = moq.split(',')

    const leadTime = searchParams.get('leadTime')
    if (leadTime) urlFilters.selectedLeadTime = leadTime.split(',')

    const sortBy = searchParams.get('sort')
    if (sortBy) urlFilters.sortBy = sortBy as FilterState['sortBy']

    const viewMode = searchParams.get('view')
    if (viewMode) urlFilters.viewMode = viewMode as FilterState['viewMode']

    return {
      ...DEFAULT_FILTERS,
      priceRange: initialPriceRange,
      ...urlFilters
    }
  }, [searchParams, initialPriceRange])

  const [filters, setFilters] = useState<FilterState>(getInitialState)

  // Update URL when filters change
  const updateURL = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams()

    // Only add non-default values to URL
    if (newFilters.searchQuery) params.set('q', newFilters.searchQuery)
    if (newFilters.selectedCategory !== 'all') params.set('category', newFilters.selectedCategory)
    if (newFilters.selectedMaterials.length > 0) params.set('materials', newFilters.selectedMaterials.join(','))
    if (newFilters.priceRange[0] !== initialPriceRange[0]) params.set('minPrice', newFilters.priceRange[0].toString())
    if (newFilters.priceRange[1] !== initialPriceRange[1]) params.set('maxPrice', newFilters.priceRange[1].toString())
    if (newFilters.selectedMOQ.length > 0) params.set('moq', newFilters.selectedMOQ.join(','))
    if (newFilters.selectedLeadTime.length > 0) params.set('leadTime', newFilters.selectedLeadTime.join(','))
    if (newFilters.sortBy !== DEFAULT_FILTERS.sortBy) params.set('sort', newFilters.sortBy)
    if (newFilters.viewMode !== DEFAULT_FILTERS.viewMode) params.set('view', newFilters.viewMode)

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname

    router.push(newUrl, { scroll: false })
  }, [router, pathname, initialPriceRange])

  // Update filters and URL
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    updateURL(updatedFilters)
  }, [filters, updateURL])

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      ...DEFAULT_FILTERS,
      priceRange: initialPriceRange
    }
    setFilters(clearedFilters)
    updateURL(clearedFilters)
  }, [updateURL, initialPriceRange])

  // Update URL state when browser navigation occurs
  useEffect(() => {
    const currentState = getInitialState()
    setFilters(currentState)
  }, [searchParams, getInitialState])

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.searchQuery) count++
    if (filters.selectedCategory !== 'all') count++
    count += filters.selectedMaterials.length
    count += filters.selectedMOQ.length
    count += filters.selectedLeadTime.length
    if (filters.priceRange[0] !== initialPriceRange[0] || filters.priceRange[1] !== initialPriceRange[1]) count++
    return count
  }, [filters, initialPriceRange])

  return {
    filters,
    updateFilters,
    clearFilters,
    activeFilterCount
  }
}

// Import useMemo for the hook
import { useMemo } from 'react'