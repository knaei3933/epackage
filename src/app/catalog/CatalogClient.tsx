'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Grid as GridIcon,
  List,
  Package,
  BarChart3
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Grid } from '@/components/ui/Grid'
import { Badge } from '@/components/ui/Badge'
import { LoadingState } from '@/components/ui/LoadingState'
import { EnhancedProductCard } from '@/components/catalog/EnhancedProductCard'
import { ProductListItem } from '@/components/catalog/ProductListItem'
import { CompareLink } from '@/components/comparison'
import { useCatalog } from '@/contexts/CatalogContext'
import Link from 'next/link'
import { getAllProducts } from '@/lib/product-data'
import { ProductBase } from '@/types/database'

interface FilterState {
  viewMode: 'grid' | 'list'
  searchQuery: string
  selectedCategory: string
  // Advanced filters
  materials?: string[]
  priceRange?: [number, number]
  features?: string[]
  applications?: string[]
  tags?: string[]
  minOrderQuantity?: number
  maxLeadTime?: number
}

export function CatalogClient() {
  console.log('[Catalog] CatalogClient component rendering')

  const [products, setProducts] = useState<ProductBase[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductBase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // 並べ替えは CatalogContext（URL の ?sort= と同じ状態）を正とする。表示と URL が食い違わない。
  const { sort, updateSort } = useCatalog()
  const sortBy: 'relevance' | 'name' = sort.key === 'name' ? 'name' : 'relevance'
  const [useDBFiltering, setUseDBFiltering] = useState(false)

  console.log('[Catalog] State:', { isLoading, productsLength: products.length, filteredLength: filteredProducts.length })

  // Calculate initial filter state
  const getInitialFilterState = (): FilterState => {
    return {
      viewMode: 'grid',
      searchQuery: '',
      selectedCategory: 'all'
    }
  }

  const [filterState, setFilterState] = useState<FilterState>(getInitialFilterState())

  // Fetch products on mount
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    console.log('[Catalog] fetchProducts: Setting isLoading=true')
    setIsLoading(true)
    try {
      // Try to fetch from database first
      if (useDBFiltering) {
        const response = await fetch('/api/products')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            console.log('[Catalog] DB fetch success:', result.data.length)
            setProducts(result.data)
            setFilteredProducts(result.data)
            setIsLoading(false)
            return
          }
        }
      }

      // Fallback to static data
      const safeProducts = getAllProducts(null, 'ja') as ProductBase[]
      console.log('[Catalog] Loaded products:', safeProducts.length, safeProducts)
      console.log('[Catalog] Setting products state:', safeProducts.length)
      setProducts(safeProducts)
      console.log('[Catalog] Setting filteredProducts state:', safeProducts.length)
      setFilteredProducts(safeProducts)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      // Fallback to static data on error
      const safeProducts = getAllProducts(null, 'ja') as ProductBase[]
      console.log('[Catalog] Error fallback products:', safeProducts.length, safeProducts)
      setProducts(safeProducts)
      setFilteredProducts(safeProducts)
    } finally {
      console.log('[Catalog] fetchProducts: Setting isLoading=false')
      setIsLoading(false)
    }
  }

  // Apply filters using database API
  const applyDBFilters = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/products/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: filterState.selectedCategory,
          materials: filterState.materials,
          priceRange: filterState.priceRange,
          features: filterState.features,
          applications: filterState.applications,
          tags: filterState.tags,
          minOrderQuantity: filterState.minOrderQuantity,
          maxLeadTime: filterState.maxLeadTime,
          searchQuery: filterState.searchQuery
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setFilteredProducts(result.data)
          return
        }
      }

      // Fallback to client-side filtering
      applyClientSideFilters()
    } catch (error) {
      console.error('DB filter error:', error)
      // Fallback to client-side filtering
      applyClientSideFilters()
    } finally {
      setIsLoading(false)
    }
  }

  // Client-side filtering fallback
  const applyClientSideFilters = () => {
    console.log('[Catalog] applyClientSideFilters called', { productsLength: products.length, filteredLength: filteredProducts.length, category: filterState.selectedCategory })
    let filtered = products

    // Category filter
    if (filterState.selectedCategory && filterState.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterState.selectedCategory)
    }

    // Search query filter
    if (filterState.searchQuery) {
      const query = filterState.searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name_ja?.toLowerCase().includes(query) ||
        p.name_en?.toLowerCase().includes(query) ||
        p.description_ja?.toLowerCase().includes(query) ||
        p.description_en?.toLowerCase().includes(query)
      )
    }

    // Materials filter
    if (filterState.materials && filterState.materials.length > 0) {
      filtered = filtered.filter(p =>
        filterState.materials!.some(m => p.materials?.includes(m))
      )
    }

    // Features filter
    if (filterState.features && filterState.features.length > 0) {
      filtered = filtered.filter(p =>
        filterState.features!.some(f => p.features?.includes(f))
      )
    }

    // Applications filter
    if (filterState.applications && filterState.applications.length > 0) {
      filtered = filtered.filter(p =>
        filterState.applications!.some(a => p.applications?.includes(a))
      )
    }

    // Price range filter
    if (filterState.priceRange) {
      const [min, max] = filterState.priceRange
      filtered = filtered.filter(p => {
        const baseCost = (p.pricing_formula as any)?.base_cost || 0
        return baseCost >= min && baseCost <= max
      })
    }

    // Max lead time filter
    if (filterState.maxLeadTime) {
      filtered = filtered.filter(p => p.lead_time_days <= filterState.maxLeadTime!)
    }

    console.log('[Catalog] Filtering result:', { inputLength: products.length, outputLength: filtered.length, category: filterState.selectedCategory })
    console.log('[Catalog] Setting filteredProducts:', filtered.length)
    setFilteredProducts(filtered)
    // Note: Don't manage isLoading here - it's handled by fetchProducts and applyDBFilters
  }

  // Get unique materials from products
  const availableMaterials = Array.from(new Set(
    (products && Array.isArray(products) ? products.flatMap(product => product.materials || []) : [])
  ))

  // 並べ替え（おすすめ順は製品の並び順 sort_order、名前順は五十音）
  const sortedProducts = useMemo(() => {
    const list = Array.isArray(filteredProducts) ? filteredProducts.filter(Boolean) : []
    return [...list].sort((a, b) =>
      sortBy === 'name'
        ? (a.name_ja || '').localeCompare(b.name_ja || '', 'ja')
        : (a.sort_order || 0) - (b.sort_order || 0)
    )
  }, [filteredProducts, sortBy])

  // Handle filter changes - apply client-side filtering for non-DB mode
  useEffect(() => {
    if (!useDBFiltering && products.length > 0) {
      applyClientSideFilters()
    } else if (!useDBFiltering && products.length === 0) {
      // No products loaded yet, keep filteredProducts empty
      setFilteredProducts([])
    }
  }, [
    products,
    filterState.searchQuery,
    filterState.selectedCategory,
    filterState.materials,
    filterState.priceRange,
    filterState.features,
    filterState.applications,
    filterState.maxLeadTime
  ])

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...newFilters }))
  }

  // Handle clear all filters
  const handleClearAll = () => {
    setFilterState(getInitialFilterState())
    setFilteredProducts(products)
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <PageHeader
        title="パウチ製品カタログ"
        lead={
          <>
            最適な包装ソリューションを見つけましょう。<br className="hidden md:block" />
            あらゆるニーズに対応する6種類のパウチ製品を取り揃えました。
          </>
        }
        actions={
          <>
            <Link href="/samples" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              <Package className="h-5 w-5 shrink-0" aria-hidden="true" />
              サンプルご依頼
            </Link>
            <Link href="/quote-simulator" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              <BarChart3 className="h-5 w-5 shrink-0" aria-hidden="true" />
              見積もり
            </Link>
          </>
        }
      />

      <Container size="6xl" className="py-8">
        {/* Main Content */}
        <div className="w-full">
            {/* Sort and View Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-lg font-medium text-text-primary">
                  {isLoading ? '読み込み中...' : `${sortedProducts.length}件の製品`}
                </p>
                {!isLoading && products.length > 0 && <Badge>全 {products.length} 種類の製品</Badge>}
                <CompareLink />
              </div>

              {/* View and Sort Controls */}
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="グリッド表示"
                    aria-pressed={filterState.viewMode === 'grid'}
                    onClick={() => handleFilterChange({ viewMode: 'grid' })}
                    className={`w-10 max-sm:w-11 ${filterState.viewMode === 'grid' ? 'border-brand bg-brand-subtle' : ''}`}
                  >
                    <GridIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="リスト表示"
                    aria-pressed={filterState.viewMode === 'list'}
                    onClick={() => handleFilterChange({ viewMode: 'list' })}
                    className={`w-10 max-sm:w-11 ${filterState.viewMode === 'list' ? 'border-brand bg-brand-subtle' : ''}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Sort */}
                <select
                  aria-label="並べ替え"
                  value={sortBy}
                  onChange={(e) =>
                    updateSort(
                      e.target.value === 'name'
                        ? { key: 'name', order: 'asc' }
                        : { key: 'relevance', order: 'desc' }
                    )
                  }
                  className="h-10 rounded-md border border-border-strong bg-bg-primary px-3 text-sm font-medium text-text-primary focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                >
                  <option value="relevance">おすすめ順</option>
                  <option value="name">名前順</option>
                </select>
              </div>
            </div>

            {/* Products */}
            <LoadingState
              isLoading={isLoading}
              message="製品を読み込み中..."
              loadingComponent={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <div className="aspect-square bg-bg-muted"></div>
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-bg-muted rounded w-full"></div>
                        <div className="h-3 bg-bg-muted rounded w-5/6"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              }
            >
              {filterState.viewMode === 'grid' ? (
                <Grid xs={1} sm={2} lg={3} gap={6}>
                  {sortedProducts.map((product, index) => (
                    <EnhancedProductCard
                      key={product?.id || index}
                      product={product as any}
                      index={index}
                    />
                  ))}
                </Grid>
              ) : (
                <div className="space-y-4">
                  {sortedProducts.map((product, index) => (
                    <ProductListItem
                      key={product?.id || index}
                      product={product as any}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </LoadingState>

            {/* No Results */}
            {!isLoading && sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  製品が見つかりませんでした
                </h3>
                <p className="text-text-secondary">
                  現在利用可能な製品がありません
                </p>
              </div>
            )}
          </div>
      </Container>
    </div>
  )
}
