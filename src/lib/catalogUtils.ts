import type { PackageProduct, CatalogFilters, SortOption, PackageType } from '@/types/catalog'

export function searchProducts(
  products: PackageProduct[],
  searchTerm: string
): PackageProduct[] {
  if (!searchTerm.trim()) return products

  const lowerSearchTerm = searchTerm.toLowerCase()

  return products.filter(product => {
    // Search in names (all languages)
    const nameMatch =
      product.name.toLowerCase().includes(lowerSearchTerm) ||
      product.nameEn.toLowerCase().includes(lowerSearchTerm) ||
      product.nameKo.toLowerCase().includes(lowerSearchTerm)

    // Search in descriptions
    const descriptionMatch =
      product.description.toLowerCase().includes(lowerSearchTerm) ||
      product.descriptionEn.toLowerCase().includes(lowerSearchTerm) ||
      product.descriptionKo.toLowerCase().includes(lowerSearchTerm)

    // Search in tags
    const tagsMatch = product.tags.some(tag =>
      tag.toLowerCase().includes(lowerSearchTerm)
    )

    // Search in materials
    const materialMatch = product.category.material.some(material =>
      material.toLowerCase().includes(lowerSearchTerm)
    )

    // Search in industries
    const industryMatch = product.category.industry.some(industry =>
      industry.toLowerCase().includes(lowerSearchTerm)
    )

    // Search in applications
    const applicationMatch = product.applications.some(app =>
      app.industry.toLowerCase().includes(lowerSearchTerm) ||
      app.useCase.toLowerCase().includes(lowerSearchTerm) ||
      app.productExamples.some(example =>
        example.toLowerCase().includes(lowerSearchTerm)
      )
    )

    return nameMatch || descriptionMatch || tagsMatch ||
           materialMatch || industryMatch || applicationMatch
  })
}

export function filterProducts(
  products: PackageProduct[],
  filters: CatalogFilters
): PackageProduct[] {
  let filtered = [...products]

  // Apply type filter
  if (filters.type.length > 0) {
    filtered = filtered.filter(product =>
      filters.type.includes(product.type)
    )
  }

  // Apply material filter
  if (filters.materials.length > 0) {
    filtered = filtered.filter(product =>
      product.category.material.some(material =>
        filters.materials.includes(material)
      )
    )
  }

  // Apply size filter
  if (filters.sizes.length > 0) {
    filtered = filtered.filter(product =>
      product.category.size.some(size =>
        filters.sizes.includes(size)
      )
    )
  }

  // Apply industry filter
  if (filters.industries.length > 0) {
    filtered = filtered.filter(product =>
      product.category.industry.some(industry =>
        filters.industries.includes(industry)
      )
    )
  }

  // Apply price range filter
  if (filters.priceRange.min > 0 || filters.priceRange.max > 0) {
    filtered = filtered.filter(product => {
      const price = product.pricing.basePrice
      return price >= filters.priceRange.min &&
             (filters.priceRange.max === 0 || price <= filters.priceRange.max)
    })
  }

  // Apply features filter
  if (filters.features.length > 0) {
    filtered = filtered.filter(product =>
      filters.features.every(feature => product.features[feature])
    )
  }

  return filtered
}

export function sortProducts(
  products: PackageProduct[],
  sortOption: SortOption
): PackageProduct[] {
  const sorted = [...products]

  switch (sortOption.key) {
    case 'relevance':
      // Default sort: Use predefined category order or sort_order if available
      return sorted.sort((a, b) => {
        // If products have sort_order field, use it
        if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
          return a.sortOrder - b.sortOrder
        }
        // Otherwise use popularity as fallback
        return sortOption.order === 'asc'
          ? a.popularity - b.popularity
          : b.popularity - a.popularity
      })

    case 'price':
      return sorted.sort((a, b) =>
        sortOption.order === 'asc'
          ? a.pricing.basePrice - b.pricing.basePrice
          : b.pricing.basePrice - a.pricing.basePrice
      )

    case 'popularity':
      return sorted.sort((a, b) =>
        sortOption.order === 'asc'
          ? a.popularity - b.popularity
          : b.popularity - a.popularity
      )

    case 'name':
      return sorted.sort((a, b) =>
        sortOption.order === 'asc'
          ? a.name.localeCompare(b.name, 'ja')
          : b.name.localeCompare(a.name, 'ja')
      )

    default:
      return sorted
  }
}

export function applyFiltersAndSorting(
  products: PackageProduct[],
  filters: CatalogFilters,
  sortOption: SortOption
): PackageProduct[] {
  let result = [...products]

  // Apply search
  if (filters.search) {
    result = searchProducts(result, filters.search)
  }

  // Apply filters
  result = filterProducts(result, filters)

  // Apply sorting
  result = sortProducts(result, sortOption)

  return result
}

export function getPriceRange(products: PackageProduct[]): { min: number; max: number } {
  const prices = products
    .filter(product => product.pricing.basePrice > 0)
    .map(product => product.pricing.basePrice)

  if (prices.length === 0) return { min: 0, max: 0 }

  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  }
}

export function getUniqueValues<T>(
  products: PackageProduct[],
  getter: (product: PackageProduct) => T[]
): T[] {
  const values = new Set<T>()
  products.forEach(product => {
    getter(product).forEach(value => values.add(value))
  })
  return Array.from(values).sort()
}

export function createQueryString(filters: CatalogFilters, sort: SortOption): string {
  const params = new URLSearchParams()

  // Add search term
  if (filters.search) {
    params.set('search', filters.search)
  }

  // Add type filters
  if (filters.type.length > 0) {
    params.set('type', filters.type.join(','))
  }

  // Add material filters
  if (filters.materials.length > 0) {
    params.set('materials', filters.materials.join(','))
  }

  // Add size filters
  if (filters.sizes.length > 0) {
    params.set('sizes', filters.sizes.join(','))
  }

  // Add industry filters
  if (filters.industries.length > 0) {
    params.set('industries', filters.industries.join(','))
  }

  // Add price range
  if (filters.priceRange.min > 0) {
    params.set('minPrice', filters.priceRange.min.toString())
  }
  if (filters.priceRange.max > 0) {
    params.set('maxPrice', filters.priceRange.max.toString())
  }

  // Add sort options
  params.set('sort', sort.key)
  params.set('order', sort.order)

  return params.toString()
}

export function parseQueryString(queryString: string): {
  filters: Partial<CatalogFilters>
  sort: SortOption
} {
  const params = new URLSearchParams(queryString)

  const filters: Partial<CatalogFilters> = {
    search: params.get('search') || '',
    type: (params.get('type')?.split(',') || []) as PackageType[],
    materials: params.get('materials')?.split(',') || [],
    sizes: params.get('sizes')?.split(',') || [],
    industries: params.get('industries')?.split(',') || [],
    priceRange: {
      min: parseInt(params.get('minPrice') || '0'),
      max: parseInt(params.get('maxPrice') || '0')
    },
    features: []
  }

  const sort: SortOption = {
    key: (params.get('sort') as SortOption['key']) || 'relevance',
    order: (params.get('order') as SortOption['order']) || 'desc'
  }

  return { filters, sort }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}