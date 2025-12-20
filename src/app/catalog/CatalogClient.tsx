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
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Grid } from '@/components/ui/Grid'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { EnhancedProductCard } from '@/components/catalog/EnhancedProductCard'
import { ProductListItem } from '@/components/catalog/ProductListItem'
import Link from 'next/link'
import { PRODUCT_CATEGORIES, getAllProducts } from '@/lib/product-data'
import { Product } from '@/types/database'

interface FilterState {
  viewMode: 'grid' | 'list'
  sortBy: string
}

export function CatalogClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Calculate initial filter state
  const getInitialFilterState = (): FilterState => {
    return {
      sortBy: 'name',
      viewMode: 'grid'
    }
  }

  const [filterState, setFilterState] = useState<FilterState>(getInitialFilterState())

  // Fetch products on mount
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      // Use static data for export compatibility
      const safeProducts = getAllProducts(null, 'ja') as unknown as Product[]
      setProducts(safeProducts)
      setFilteredProducts(safeProducts)
      // Initialize filter state after products are loaded
      setFilterState({
        sortBy: 'name',
        viewMode: 'grid'
      })
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique materials from products
  const availableMaterials = Array.from(new Set(
    (products && Array.isArray(products) ? products.flatMap(product => product.materials || []) : [])
  ))

  // Sort products only
  useEffect(() => {
    let sorted = products && Array.isArray(products) ? products : []

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
  }, [products, filterState.sortBy])

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...newFilters }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-brixa-500 via-brixa-600 to-navy-700 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.4%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>

        <Container size="6xl" className="py-20 relative">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-4">
                  <Package className="w-4 h-4 mr-2" />
                  6種類の高品質パウチ
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="block text-white/95">パウチ製品</span>
                  <span className="block text-2xl md:text-3xl lg:text-4xl mt-2 font-medium text-white">
                    カタログ
                  </span>
                </h1>
              </div>

              <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
                最適な包装ソリューションを見つけましょう。<br className="hidden md:block" />
                あらゆるニーズに対応する6種類のパウチ製品を取り揃えました。
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="bg-white/30 backdrop-blur-sm rounded-lg px-6 py-3 text-lg font-semibold text-white">
                  全 {products.length} 種類の製品
                </div>
                <Link href="/samples">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white/90 text-brixa-600 hover:bg-white hover:text-brixa-700 border-2 border-white/90 font-medium shadow-lg min-w-[120px] sm:min-w-[160px] flex-col py-3 sm:py-4 h-auto min-h-[70px] sm:min-h-[80px]"
                  >
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
                    <span className="text-xs sm:text-sm">サンプルご依頼</span>
                  </Button>
                </Link>
                <Link href="/roi-calculator/">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white/10 text-white border-2 border-white/80 hover:bg-white hover:text-brixa-600 font-medium min-w-[120px] sm:min-w-[160px] backdrop-blur-sm transition-all duration-300 flex-col py-3 sm:py-4 h-auto min-h-[70px] sm:min-h-[80px]"
                  >
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
                    <span className="text-xs sm:text-sm">見積もり</span>
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      <Container size="6xl" className="py-8">
        {/* Sort and View Controls */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-lg font-medium text-gray-900">
            {isLoading ? '読み込み中...' : `${filteredProducts.length}件の製品`}
          </p>

          {/* View and Sort Controls */}
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => handleFilterChange({ viewMode: 'grid' })}
                className={`p-2 rounded-md transition-all duration-200 ${filterState.viewMode === 'grid' ? 'bg-white shadow-sm text-brixa-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <GridIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFilterChange({ viewMode: 'list' })}
                className={`p-2 rounded-md transition-all duration-200 ${filterState.viewMode === 'list' ? 'bg-white shadow-sm text-brixa-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort */}
            <select
              value={filterState.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent text-sm font-medium bg-white shadow-sm"
            >
              <option value="name">名前順</option>
              <option value="price">価格順</option>
              <option value="leadTime">納期順</option>
            </select>
          </div>
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : filterState.viewMode === 'grid' ? (
          <Grid xs={1} sm={2} lg={3} gap={6}>
            {filteredProducts && Array.isArray(filteredProducts) ? filteredProducts.map((product, index) => (
              <EnhancedProductCard
                key={product?.id || index}
                product={product}
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
                product={product}
                index={index}
                onSelect={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && (!filteredProducts || filteredProducts.length === 0) && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              製品が見つかりませんでした
            </h3>
            <p className="text-gray-600">
              現在利用可能な製品がありません
            </p>
          </div>
        )}
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
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={onSelect}>
        <div className="relative">
          {/* Product Image */}
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name_ja}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  // Fallback to placeholder on error
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <Package className={`w-16 h-16 text-gray-400 ${product.image ? 'hidden' : ''}`} />
          </div>

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
              {category?.name_ja || 'その他'}
            </Badge>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-brixa-600 transition-colors">
              {product.name_ja}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description_ja}
            </p>
          </div>

          {/* Features - showing material info instead */}
          <div className="flex flex-wrap gap-1 mb-4">
            {product.materials.slice(0, 3).map((material, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {material}
              </Badge>
            ))}
          </div>

          {/* Specs */}
          <div className="text-sm text-gray-600 mb-4 space-y-1">
            <div className="flex justify-between">
              <span>最低注文数量:</span>
              <span className="font-medium">{product.min_order_quantity.toLocaleString()}個</span>
            </div>
            <div className="flex justify-between">
              <span>納期:</span>
              <span className="font-medium">{product.lead_time_days}日</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">初期費用</p>
              <p className="text-xl font-bold text-gray-900">
                ¥{(product.pricing_formula as any).base_cost.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">単価</p>
              <p className="text-lg font-medium text-gray-900">
                ¥{(product.pricing_formula as any).per_unit_cost}/個
              </p>
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
            <Link href="/roi-calculator/" className="col-span-1">
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
  product: Product;
  onClose: () => void;
}) {
  const category = PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]

  return (
    <div className="relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Product Header */}
      <div className="bg-gradient-to-r from-brixa-50 to-navy-50 p-6 border-b">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{product.name_ja}</h2>
              <Badge variant="secondary">{category?.name_ja}</Badge>
            </div>
            <p className="text-gray-600">{product.description_ja}</p>
            <p className="text-sm text-gray-500 mt-2">{product.description_en}</p>
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-6">
        <Grid xs={1} lg={2} gap={8}>
          {/* Left Column - Image and Basic Info */}
          <div className="space-y-6">
            {/* Product Image */}
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name_ja}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <Package className={`w-24 h-24 text-gray-400 ${product.image ? 'hidden' : ''}`} />
            </div>

            {/* Quick Specs */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">基本仕様</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">最低注文数量:</span>
                  <span className="font-medium">{product.min_order_quantity.toLocaleString()}個</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">納期:</span>
                  <span className="font-medium">{product.lead_time_days}日</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">素材:</span>
                  <span className="font-medium">{product.materials.join(', ')}</span>
                </div>
              </div>
            </Card>

            {/* Materials */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">素材</h3>
              <div className="space-y-2">
                {product.materials.map((material, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{material}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">価格情報</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">初期費用:</span>
                  <span className="text-xl font-bold text-brixa-600">
                    ¥{(product.pricing_formula as any).base_cost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">単価:</span>
                  <span className="text-lg font-medium">
                    ¥{(product.pricing_formula as any).per_unit_cost}/個
                  </span>
                </div>
              </div>
            </Card>

            {/* Specifications */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">技術仕様</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(product.specifications as any).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{key}:</span>
                    <span className="font-medium">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Grid>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Button variant="outline" onClick={onClose} className="flex-col py-2 sm:py-3 h-auto min-h-[50px] sm:min-h-[60px] px-1 sm:px-2">
              <X className="w-3 h-3 sm:w-4 sm:h-4 mb-1" />
              <span className="text-[10px] sm:text-xs">閉じる</span>
            </Button>
            <Link href="/samples" className="col-span-1">
              <Button variant="outline" className="w-full flex-col py-2 sm:py-3 h-auto min-h-[50px] sm:min-h-[60px] px-1 sm:px-2">
                <Package className="w-3 h-3 sm:w-4 sm:h-4 mb-1" />
                <span className="text-[10px] sm:text-xs">サンプルご依頼</span>
              </Button>
            </Link>
            <Link href={`/roi-calculator/`} className="col-span-1">
              <Button variant="primary" className="w-full flex-col py-2 sm:py-3 h-auto min-h-[50px] sm:min-h-[60px] px-1 sm:px-2">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mb-1" />
                <span className="text-[10px] sm:text-xs">パウチ見積もり</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}