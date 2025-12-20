'use client'

import { useMemo } from 'react'
import {
  X,
  Search,
  Package,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PRODUCT_CATEGORIES } from '@/lib/product-data'
import { Product } from '@/types/database'

export interface FilterState {
  searchQuery: string
  selectedCategory: string
  sortBy: 'name' | 'leadTime'
  viewMode: 'grid' | 'list'
}

interface AdvancedFiltersProps {
  products: Product[]
  filterState: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  onClearAll: () => void
  filteredProductsCount: number
  isMobile?: boolean
  onClose?: () => void
}

export function AdvancedFilters({
  products,
  filterState,
  onFilterChange,
  onClearAll,
  filteredProductsCount,
  isMobile = false,
  onClose
}: AdvancedFiltersProps) {
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filterState.searchQuery) count++
    if (filterState.selectedCategory !== 'all') count++
    return count
  }, [filterState])

  return (
    <div className={`${isMobile ? 'fixed inset-0 z-50 bg-white' : 'bg-white rounded-lg border'} ${isMobile ? 'flex flex-col' : ''}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">フィルター</h2>
          {activeFilterCount > 0 && (
            <Badge variant="metallic" className="text-xs">
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
              className="text-gray-600 hover:text-gray-900"
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
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="製品名、特徴、用途で検索..."
              value={filterState.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-900">カテゴリー</span>
            {filterState.selectedCategory !== 'all' && (
              <Badge variant="secondary" className="text-xs">1</Badge>
            )}
          </div>
          <div className="space-y-2">
            <button
              onClick={() => onFilterChange({ selectedCategory: 'all' })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterState.selectedCategory === 'all'
                  ? 'bg-brixa-50 border border-brixa-600 text-brixa-600'
                  : 'hover:bg-gray-50 border border-transparent'
                }`}
            >
              <div className="flex items-center justify-between">
                <span>すべてのカテゴリー</span>
                <span className="text-xs text-gray-500">{products.length}</span>
              </div>
            </button>
            {Object.entries(PRODUCT_CATEGORIES).map(([key, category]) => {
              const count = products.filter(p => p.category === key).length
              if (count === 0) return null

              return (
                <button
                  key={key}
                  onClick={() => onFilterChange({ selectedCategory: key })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterState.selectedCategory === key
                      ? 'bg-brixa-50 border border-brixa-600 text-brixa-600'
                      : 'hover:bg-gray-50 border border-transparent'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-brixa-500" />
                      <span>{category.name_ja}</span>
                    </div>
                    <span className="text-xs text-gray-500">{count}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer - Mobile Only */}
      {isMobile && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">
              {filteredProductsCount}件の製品が見つかりました
            </span>
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              すべてクリア
            </Button>
          </div>
          <Button
            variant="primary"
            className="w-full"
            onClick={onClose}
          >
            結果を表示
          </Button>
        </div>
      )}
    </div>
  )
}