'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Grid as GridIcon,
  List,
  Package,
  X,
  Check,
  BarChart3
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Grid } from '@/components/ui/Grid'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { LoadingState } from '@/components/ui/LoadingState'
import { EnhancedProductCard } from '@/components/catalog/EnhancedProductCard'
import { ProductListItem } from '@/components/catalog/ProductListItem'
import Link from 'next/link'
import { PRODUCT_CATEGORIES, getAllProducts } from '@/lib/product-data'
import { Product, ProductBase } from '@/types/database'

interface FilterState {
  viewMode: 'grid' | 'list'
  sortBy: string
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
  const [selectedProduct, setSelectedProduct] = useState<ProductBase | null>(null)
  const [useDBFiltering, setUseDBFiltering] = useState(false)

  console.log('[Catalog] State:', { isLoading, productsLength: products.length, filteredLength: filteredProducts.length })

  // Calculate initial filter state
  const getInitialFilterState = (): FilterState => {
    return {
      sortBy: 'name',
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

  // Sort products only
  useEffect(() => {
    let sorted = filteredProducts && Array.isArray(filteredProducts) ? filteredProducts : []

    // Sort products
    sorted = [...sorted].sort((a, b) => {
      if (!a || !b) return 0

      switch (filterState.sortBy) {
        case 'name':
          return (a.name_ja || '').localeCompare(b.name_ja || '', 'ja')
        case 'leadTime':
          return (a.lead_time_days || 0) - (b.lead_time_days || 0)
        case 'price':
          const aPrice = (a.pricing_formula as any)?.base_cost || 0
          const bPrice = (b.pricing_formula as any)?.base_cost || 0
          return aPrice - bPrice
        default:
          // Default sort: Use sort_order to maintain the correct product sequence
          return (a.sort_order || 0) - (b.sort_order || 0)
      }
    })

    setFilteredProducts(sorted)
  }, [filterState.sortBy])

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
        <main className="w-full">
            {/* Sort and View Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-lg font-medium text-text-primary">
                  {isLoading ? '読み込み中...' : `${filteredProducts.length}件の製品`}
                </p>
                <Badge>全 {products.length} 種類の製品</Badge>
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
                  value={filterState.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                  className="h-10 rounded-md border border-border-strong bg-bg-primary px-3 text-sm font-medium text-text-primary focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                >
                  <option value="name">名前順</option>
                  <option value="leadTime">納期順</option>
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
                  {filteredProducts && Array.isArray(filteredProducts) ? filteredProducts.map((product, index) => (
                    <EnhancedProductCard
                      key={product?.id || index}
                      product={product as any}
                      index={index}
                      onSelect={() => product && setSelectedProduct(product)}
                    />
                  )) : []}
                </Grid>
              ) : (
                <div className="space-y-4">
                  {filteredProducts && Array.isArray(filteredProducts) && filteredProducts.map((product, index) => (
                    <ProductListItem
                      key={product?.id || index}
                      product={product as any}
                      index={index}
                      onSelect={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
              )}
            </LoadingState>

            {/* No Results */}
            {!isLoading && (!filteredProducts || filteredProducts.length === 0) && (
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
          </main>
      </Container>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-primary rounded-container max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <ProductDetailModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

// Product Card Component
function ProductCard({ product, index, onSelect }: {
  product: Product;
  index: number;
  onSelect: () => void;
}) {
  const category = PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]

  return (
    <MotionWrapper delay={index * 0.1}>
      <Card className="group overflow-hidden hover:shadow-low cursor-pointer" onClick={onSelect}>
        <div className="relative">
          {/* Product Image */}
          <div className="aspect-square bg-bg-secondary flex items-center justify-center overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name_ja}
                className="w-full h-full object-contain transition-transform duration-300"
                onError={(e) => {
                  // Fallback to placeholder on error
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <Package className={`w-16 h-16 text-text-muted ${product.image ? 'hidden' : ''}`} />
          </div>

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-bg-primary">
              {category?.name_ja || 'その他'}
            </Badge>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-text-primary mb-1 group-hover:text-brand transition-colors">
              {product.name_ja}
            </h3>
            <p className="text-sm text-text-secondary line-clamp-2">
              {product.description_ja}
            </p>
          </div>

          {/* Features - showing material info instead */}
          <div className="flex flex-wrap gap-1 mb-4">
            {(product.materials || []).slice(0, 3).map((material, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {material}
              </Badge>
            ))}
          </div>

          {/* Specs */}
          <div className="text-sm text-text-secondary mb-4 space-y-1">
            <div className="flex justify-between">
              <span>最小注文数:</span>
              <span className="font-medium">{product.min_order_quantity.toLocaleString()}{product.id === 'roll-film-001' || product.name_ja === 'ロールフィルム' ? 'M' : '枚'}</span>
            </div>
            <div className="flex justify-between">
              <span>納期:</span>
              <span className="font-medium">{product.lead_time_days}日</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-1 sm:gap-2">
            <Link href="/samples" className="col-span-1">
              <Button variant="outline" className="w-full flex-col py-2 sm:py-3 h-auto min-h-[50px] sm:min-h-[60px] px-1 sm:px-2">
                <Package className="w-3 h-3 sm:w-4 sm:h-4 mb-1" />
                <span className="text-[10px] sm:text-xs">サンプル</span>
              </Button>
            </Link>
            <Link href="/quote-simulator" className="col-span-1">
              <Button variant="primary" className="w-full flex-col py-2 sm:py-3 h-auto min-h-[50px] sm:min-h-[60px] px-1 sm:px-2">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mb-1" />
                <span className="text-[10px] sm:text-xs">見積もり</span>
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </MotionWrapper>
  )
}


// Product Detail Modal Component
function ProductDetailModal({ product, onClose }: {
  product: ProductBase;
  onClose: () => void;
}) {
  const category = PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'faq' | 'downloads' | 'cases' | 'certifications'>('overview')

  // Get extended product data with Phase 1 content
  const extendedProduct = getAllProducts(null, 'ja').find(p => p.id === product.id)

  // Convert materials array to display string
  const getMaterialDisplay = (materials: string[]) => {
    const materialMap: Record<string, string> = {
      'PE': 'PE',
      'PP': 'PP',
      'PET': 'PET',
      'ALUMINUM': 'AL',
      'NYLON': 'NY',
      'PAPER': '紙'
    }
    return materials.map(m => materialMap[m] || m).join(', ')
  }

  return (
    <div className="relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        aria-label="閉じる" className="absolute top-4 right-4 h-9 w-9 max-sm:h-11 max-sm:w-11 border border-border-strong bg-bg-primary hover:bg-bg-secondary rounded-full flex items-center justify-center z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Product Header */}
      <div className="bg-bg-secondary p-6 border-b border-border-medium">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-text-primary">{product.name_ja}</h2>
              <Badge variant="secondary">{category?.name_ja}</Badge>
            </div>
            <p className="text-text-secondary">{product.description_ja}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto">
        {[
          { id: 'overview' as const, label: '概要' },
          { id: 'specifications' as const, label: '仕様' },
          { id: 'faq' as const, label: 'FAQ' },
          { id: 'downloads' as const, label: '見積シミュレーター' },
          { id: 'cases' as const, label: '導入事例' },
          { id: 'certifications' as const, label: '認証' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-brand text-brand'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 max-h-[60vh] overflow-y-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Grid xs={1} lg={2} gap={6}>
              {/* Left Column - Image and Basic Info */}
              <div className="space-y-4">
                {/* Product Image */}
                <div className="aspect-square bg-bg-secondary rounded-inner flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name_ja}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <Package className={`w-24 h-24 text-text-muted ${product.image ? 'hidden' : ''}`} />
                </div>

                {/* Quick Specs */}
                <Card className="p-4">
                  <h3 className="font-semibold text-text-primary mb-3">基本仕様</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">最小注文数:</span>
                      <span className="font-medium">{product.min_order_quantity.toLocaleString()}{product.id === 'roll-film-001' || product.name_ja === 'ロールフィルム' ? 'M' : '枚'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">納期:</span>
                      <span className="font-medium">{product.lead_time_days}日</span>
                    </div>
                  </div>
                </Card>

                {/* Materials */}
                <Card className="p-4">
                  <h3 className="font-semibold text-text-primary mb-3">素材</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.materials.map((material, idx) => (
                      <Badge key={idx} variant="outline">{material}</Badge>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Column - Features and Applications */}
              <div className="space-y-4">
                {/* Features */}
                <Card className="p-4">
                  <h3 className="font-semibold text-text-primary mb-3">特徴</h3>
                  <ul className="space-y-2">
                    {extendedProduct?.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Applications */}
                <Card className="p-4">
                  <h3 className="font-semibold text-text-primary mb-3">用途</h3>
                  <div className="flex flex-wrap gap-2">
                    {extendedProduct?.applications?.map((app, idx) => (
                      <Badge key={idx} variant="secondary">{app}</Badge>
                    ))}
                  </div>
                </Card>

                {/* Tags */}
                <Card className="p-4">
                  <h3 className="font-semibold text-text-primary mb-3">タグ</h3>
                  <div className="flex flex-wrap gap-2">
                    {extendedProduct?.tags?.map((tag, idx) => (
                      <Badge key={idx} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </Grid>
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === 'specifications' && (
          <Card className="p-4">
            <h3 className="font-semibold text-text-primary mb-3">技術仕様</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(product.specifications as any).map(([key, value]) => {
                const keyMap: Record<string, string> = {
                  'width_range': '幅',
                  'height_range': '高さ',
                  'depth_range': '奥行き',
                  'thickness_range': '厚さ',
                  'materials': '素材',
                  'capacity_range': '容量',
                  'length_range': '長さ'
                }
                const displayKey = keyMap[key] || key

                // Special handling for materials field
                let displayValue: string
                if (key === 'materials' && Array.isArray(value)) {
                  displayValue = 'PET, AL, NY, VMPET, CPP, 透明蒸着PET'
                } else {
                  displayValue = Array.isArray(value) ? value.join(', ') : String(value)
                }

                return (
                  <div key={key} className="flex justify-between border-b pb-2">
                    <span className="text-text-secondary">{displayKey}:</span>
                    <span className="font-medium">{displayValue}</span>
                  </div>
                )
              })}
              {/* Additional materials row */}
              <div className="flex justify-between border-b pb-2">
                <span className="text-text-secondary">対応素材:</span>
                <span className="font-medium">PET, AL, NY, VMPET, CPP, 透明蒸着PET</span>
              </div>
            </div>
          </Card>
        )}

        {/* FAQ Tab - Extended */}
        {activeTab === 'faq' && extendedProduct?.faq && extendedProduct.faq.length > 0 && (
          <div className="space-y-3">
            {extendedProduct.faq.map((faq, idx) => (
              <Card key={idx} className="p-4">
                <h4 className="font-medium text-text-primary mb-2">{faq.question_ja}</h4>
                <p className="text-sm text-text-secondary">{faq.answer_ja}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Downloads Tab - Quote Simulator */}
        {activeTab === 'downloads' && (
          <Card className="p-6 text-center">
            <div className="space-y-4">
              <BarChart3 className="mx-auto h-8 w-8 text-brand" />
              <h3 className="text-lg font-semibold text-text-primary">見積シミュレーター</h3>
              <p className="text-sm text-text-secondary mb-4">
                製品の仕様を入力して、お見積もりを算出できます。<br />
                希望するサイズ、数量、印刷などの詳細をご入力ください。
              </p>
              <Link href="/quote-simulator" className="inline-block">
                <Button variant="primary" size="lg" icon={<BarChart3 className="w-4 h-4" aria-hidden="true" />}>
                  見積シミュレーターへ
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Cases Tab - Archives Link */}
        {activeTab === 'cases' && (
          <Card className="p-6 text-center">
            <div className="space-y-4">
              <Package className="mx-auto h-8 w-8 text-brand" />
              <h3 className="text-lg font-semibold text-text-primary">導入事例アーカイブ</h3>
              <p className="text-sm text-text-secondary mb-4">
                実際の導入事例をご覧いただけます。<br />
                業界別の活用事例、効果、お客様の声を確認できます。
              </p>
              {/* 一時的に無効化（ページが存在しないため404エラー） */}
              {/* <Link href="/archives" className="inline-block">
                <Button variant="primary" size="lg" icon={<Package className="w-4 h-4" aria-hidden="true" />}>
                  アーカイブページへ
                </Button>
              </Link> */}
            </div>
          </Card>
        )}

        {/* Certifications Tab - Phase 1 */}
        {activeTab === 'certifications' && extendedProduct?.certifications && extendedProduct.certifications.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {extendedProduct.certifications.map((cert, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-brand-muted rounded-inner">
                    <Check className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{cert.name}</p>
                    <p className="text-sm text-text-secondary">{cert.issuer}</p>
                    {cert.description && <p className="text-xs text-text-muted mt-1">{cert.description}</p>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-6 pt-0 border-t mt-6">
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={onClose} className="flex-col py-2 h-auto min-h-[50px]">
            <X className="w-4 h-4 mb-1" />
            <span className="text-xs">閉じる</span>
          </Button>
          <Link href="/samples" className="col-span-1">
            <Button variant="outline" className="w-full flex-col py-2 h-auto min-h-[50px]">
              <Package className="w-4 h-4 mb-1" />
              <span className="text-xs">サンプル</span>
            </Button>
          </Link>
          <Link href="/quote-simulator" className="col-span-1">
            <Button variant="primary" className="w-full flex-col py-2 h-auto min-h-[50px]">
              <BarChart3 className="w-4 h-4 mb-1" />
              <span className="text-xs">見積もり</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}