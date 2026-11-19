'use client'

import { useMemo, useState } from 'react'
import {
  X,
  Search,
  Package,
  SlidersHorizontal,
  RotateCcw,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PRODUCT_CATEGORIES } from '@/lib/product-data'
import { Product } from '@/types/database'

export interface FilterState {
  searchQuery: string
  selectedCategory: string
  sortBy: 'name' | 'leadTime' | 'price'
  viewMode: 'grid' | 'list'
  // Advanced filters
  materials?: string[]
  priceRange?: [number, number]
  features?: string[]
  applications?: string[]
  tags?: string[]
  minOrderQuantity?: number
  maxLeadTime?: number
}

interface AdvancedFiltersProps {
  products: Product[]
  filterState: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  onClearAll: () => void
  onApplyFilters?: () => void
  filteredProductsCount: number
  isMobile?: boolean
  onClose?: () => void
  useDBFiltering?: boolean
}

export function AdvancedFilters({
  products,
  filterState,
  onFilterChange,
  onClearAll,
  onApplyFilters,
  filteredProductsCount,
  isMobile = false,
  onClose,
  useDBFiltering = false
}: AdvancedFiltersProps) {
  const [isApplying, setIsApplying] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Extract unique materials, features, and applications from products
  const availableMaterials = useMemo(() => {
    const materials = new Set<string>()
    products.forEach(product => {
      product.materials?.forEach(material => materials.add(material))
    })
    return Array.from(materials).sort()
  }, [products])

  const availableFeatures = useMemo(() => {
    const features = new Set<string>()
    products.forEach(product => {
      product.features?.forEach(feature => features.add(feature))
    })
    return Array.from(features).sort()
  }, [products])

  const availableApplications = useMemo(() => {
    const applications = new Set<string>()
    products.forEach(product => {
      product.applications?.forEach(app => applications.add(app))
    })
    return Array.from(applications).sort()
  }, [products])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filterState.searchQuery) count++
    if (filterState.selectedCategory !== 'all') count++
    if (filterState.materials && filterState.materials.length > 0) count++
    if (filterState.priceRange) count++
    if (filterState.features && filterState.features.length > 0) count++
    if (filterState.applications && filterState.applications.length > 0) count++
    if (filterState.minOrderQuantity) count++
    if (filterState.maxLeadTime) count++
    return count
  }, [filterState])

  const handleApplyFilters = async () => {
    if (useDBFiltering && onApplyFilters) {
      setIsApplying(true)
      try {
        await onApplyFilters()
      } finally {
        setIsApplying(false)
      }
    }
  }

  const handleMaterialToggle = (material: string) => {
    const currentMaterials = filterState.materials || []
    const newMaterials = currentMaterials.includes(material)
      ? currentMaterials.filter(m => m !== material)
      : [...currentMaterials, material]
    onFilterChange({ materials: newMaterials })
  }

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = filterState.features || []
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature]
    onFilterChange({ features: newFeatures })
  }

  const handleApplicationToggle = (application: string) => {
    const currentApplications = filterState.applications || []
    const newApplications = currentApplications.includes(application)
      ? currentApplications.filter(a => a !== application)
      : [...currentApplications, application]
    onFilterChange({ applications: newApplications })
  }

  return (
    <div className={`${isMobile ? 'fixed inset-0 z-50 bg-bg-primary' : 'bg-bg-primary rounded-container border'} ${isMobile ? 'flex flex-col' : ''}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-medium flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-5 h-5 text-text-secondary" />
          <h2 className="font-semibold text-text-primary">フィルター</h2>
          {activeFilterCount > 0 && (
            <Badge variant="default" className="text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-text-secondary hover:text-text-primary"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              クリア
            </Button>
          )}
          {isMobile && onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className={`${isMobile ? 'flex-1 overflow-y-auto' : ''}`}>
        {/* Search */}
        <div className="p-4 border-b border-border-medium">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="製品名、特徴、用途で検索..."
              value={filterState.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="h-10 w-full rounded-md border border-border-strong bg-bg-primary pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 border-b border-border-medium">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-text-muted" />
            <span className="font-medium text-text-primary">カテゴリー</span>
            {filterState.selectedCategory !== 'all' && (
              <Badge variant="secondary" className="text-xs">1</Badge>
            )}
          </div>
          <div className="space-y-2">
            <button
              onClick={() => onFilterChange({ selectedCategory: 'all' })}
              className={`w-full text-left px-3 py-2 rounded-container text-sm transition-colors ${filterState.selectedCategory === 'all'
                  ? 'bg-brand-muted border border-brand text-brand'
                  : 'hover:bg-bg-secondary border border-transparent'
                }`}
            >
              <div className="flex items-center justify-between">
                <span>すべてのカテゴリー</span>
                <span className="text-xs text-text-muted">{products.length}</span>
              </div>
            </button>
            {Object.entries(PRODUCT_CATEGORIES).map(([key, category]) => {
              const count = products.filter(p => p.category === key).length
              if (count === 0) return null

              return (
                <button
                  key={key}
                  onClick={() => onFilterChange({ selectedCategory: key })}
                  className={`w-full text-left px-3 py-2 rounded-container text-sm transition-colors ${filterState.selectedCategory === key
                      ? 'bg-brand-muted border border-brand text-brand'
                      : 'hover:bg-bg-secondary border border-transparent'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-brand" />
                      <span>{category.name_ja}</span>
                    </div>
                    <span className="text-xs text-text-muted">{count}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="p-4 border-b border-border-medium">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            <span>詳細フィルター</span>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </button>
        </div>

        {/* Advanced Filters Section */}
        {showAdvanced && (
          <div className="p-4 space-y-6">
            {/* Materials Filter */}
            {availableMaterials.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium text-text-primary text-sm">素材</span>
                  {filterState.materials && filterState.materials.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {filterState.materials.length}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {availableMaterials.map(material => (
                    <label key={material} className="flex items-center gap-2 cursor-pointer hover:bg-bg-secondary px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={filterState.materials?.includes(material) || false}
                        onChange={() => handleMaterialToggle(material)}
                        className="w-4 h-4 text-brand rounded focus:ring-brand"
                      />
                      <span className="text-sm text-text-secondary">{material}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Features Filter */}
            {availableFeatures.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium text-text-primary text-sm">特徴</span>
                  {filterState.features && filterState.features.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {filterState.features.length}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {availableFeatures.slice(0, 5).map(feature => (
                    <label key={feature} className="flex items-center gap-2 cursor-pointer hover:bg-bg-secondary px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={filterState.features?.includes(feature) || false}
                        onChange={() => handleFeatureToggle(feature)}
                        className="w-4 h-4 text-brand rounded focus:ring-brand"
                      />
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Applications Filter */}
            {availableApplications.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium text-text-primary text-sm">用途</span>
                  {filterState.applications && filterState.applications.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {filterState.applications.length}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {availableApplications.slice(0, 5).map(application => (
                    <label key={application} className="flex items-center gap-2 cursor-pointer hover:bg-bg-secondary px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={filterState.applications?.includes(application) || false}
                        onChange={() => handleApplicationToggle(application)}
                        className="w-4 h-4 text-brand rounded focus:ring-brand"
                      />
                      <span className="text-sm text-text-secondary">{application}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-medium text-text-primary text-sm">価格範囲</span>
                {filterState.priceRange && (
                  <Badge variant="secondary" className="text-xs">1</Badge>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="最小"
                    value={filterState.priceRange?.[0] || ''}
                    onChange={(e) => {
                      const minPrice = parseInt(e.target.value) || 0
                      const maxPrice = filterState.priceRange?.[1] || 100000
                      onFilterChange({ priceRange: [minPrice, maxPrice] })
                    }}
                    className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                  />
                  <span className="text-text-muted">-</span>
                  <input
                    type="number"
                    placeholder="最大"
                    value={filterState.priceRange?.[1] || ''}
                    onChange={(e) => {
                      const minPrice = filterState.priceRange?.[0] || 0
                      const maxPrice = parseInt(e.target.value) || 100000
                      onFilterChange({ priceRange: [minPrice, maxPrice] })
                    }}
                    className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                  />
                </div>
                <p className="text-xs text-text-muted">¥ (円)</p>
              </div>
            </div>

            {/* Lead Time Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-medium text-text-primary text-sm">最大納期</span>
                {filterState.maxLeadTime && (
                  <Badge variant="secondary" className="text-xs">1</Badge>
                )}
              </div>
              <div>
                <input
                  type="number"
                  placeholder="最大納期（日数）"
                  value={filterState.maxLeadTime || ''}
                  onChange={(e) => {
                    const maxLeadTime = parseInt(e.target.value) || undefined
                    onFilterChange({ maxLeadTime })
                  }}
                  className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                />
                <p className="text-xs text-text-muted mt-1">最大納期を日数で入力してください</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Desktop with Apply Button */}
      {!isMobile && useDBFiltering && (
        <div className="p-4 border-t border-border-medium">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleApplyFilters}
            disabled={isApplying}
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                適用中...
              </>
            ) : (
              'フィルター適用'
            )}
          </Button>
        </div>
      )}

      {/* Footer - Mobile Only */}
      {isMobile && (
        <div className="p-4 border-t border-border-medium">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">
              {filteredProductsCount}件の製品が見つかりました
            </span>
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              すべてクリア
            </Button>
          </div>
          {useDBFiltering ? (
            <Button
              variant="primary"
              className="w-full"
              onClick={async () => {
                await handleApplyFilters()
                onClose()
              }}
              disabled={isApplying}
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  適用中...
                </>
              ) : (
                'フィルター適用'
              )}
            </Button>
          ) : (
            <Button
              variant="primary"
              className="w-full"
              onClick={onClose}
            >
              結果を表示
            </Button>
          )}
        </div>
      )}
    </div>
  )
}