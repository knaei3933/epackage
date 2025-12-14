'use client'

import { useState, useEffect, useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCatalog } from '@/contexts/CatalogContext'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Flex, FlexItem } from '@/components/ui/Flex'
import { catalogProducts } from '@/data/catalogData'
import type { PackageType } from '@/types/catalog'

export function CatalogFilters() {
  const { language, t, tn } = useLanguage()
  const { filters, sort, updateFilters, updateSort, resetFilters } = useCatalog()
  const [isExpanded, setIsExpanded] = useState(false)

  // Get unique values for filters
  const { uniqueMaterials, uniqueSizes, uniqueIndustries, priceRange } = useMemo(() => {
    const materials = new Set<string>()
    const sizes = new Set<string>()
    const industries = new Set<string>()
    let minPrice = Infinity
    let maxPrice = 0

    catalogProducts.forEach(product => {
      product.category.material.forEach(material => materials.add(material))
      product.category.size.forEach(size => sizes.add(size))
      product.category.industry.forEach(industry => industries.add(industry))

      if (product.pricing.basePrice > 0) {
        minPrice = Math.min(minPrice, product.pricing.basePrice)
        maxPrice = Math.max(maxPrice, product.pricing.basePrice)
      }
    })

    return {
      uniqueMaterials: Array.from(materials).sort(),
      uniqueSizes: Array.from(sizes).sort(),
      uniqueIndustries: Array.from(industries).sort(),
      priceRange: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice }
    }
  }, [])

  const packageTypeOptions: Array<{ value: string; label: string }> = [
    { value: 'standard', label: tn('catalog', 'packageTypes.standard') },
    { value: 'premium', label: tn('catalog', 'packageTypes.premium') },
    { value: 'eco', label: tn('catalog', 'packageTypes.eco') },
    { value: 'luxury', label: tn('catalog', 'packageTypes.luxury') },
    { value: 'industrial', label: tn('catalog', 'packageTypes.industrial') },
    { value: 'custom', label: tn('catalog', 'packageTypes.custom') }
  ]

  const sortOptions: Array<{ value: string; label: string }> = [
    { value: 'relevance', label: tn('catalog', 'sortByRelevance') },
    { value: 'price', label: tn('catalog', 'sortByPrice') },
    { value: 'popularity', label: tn('catalog', 'sortByPopularity') }
  ]

  const handleSearchChange = (value: string) => {
    updateFilters({ search: value })
  }

  const handleTypeChange = (values: string[]) => {
    updateFilters({ type: values as PackageType[] })
  }

  const handleMaterialChange = (values: string[]) => {
    updateFilters({ materials: values })
  }

  const handleSizeChange = (values: string[]) => {
    updateFilters({ sizes: values })
  }

  const handleIndustryChange = (values: string[]) => {
    updateFilters({ industries: values })
  }

  const handlePriceChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0
    updateFilters({
      priceRange: {
        ...filters.priceRange,
        [field]: numValue
      }
    })
  }

  const handleSortChange = (value: string) => {
    const [key, order] = value.split('-')
    updateSort({
      key: key as 'relevance' | 'price' | 'popularity',
      order: order as 'asc' | 'desc'
    })
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.type.length > 0) count++
    if (filters.materials.length > 0) count++
    if (filters.sizes.length > 0) count++
    if (filters.industries.length > 0) count++
    if (filters.priceRange.min > 0 || filters.priceRange.max > 0) count++
    return count
  }, [filters])

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="w-full">
        <Input
          placeholder={tn('catalog', 'searchPlaceholder')}
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Quick Filters and Sort */}
      <Flex className="items-center gap-4 flex-wrap">
        {/* Package Type Filter */}
        <div className="flex-1 min-w-[200px]">
          <Select
            placeholder={tn('catalog', 'category.type')}
            onChange={() => {}}
            options={packageTypeOptions}
          />
        </div>

        {/* Sort */}
        <div className="min-w-[150px]">
          <Select
            placeholder={tn('catalog', 'sortBy')}
            value={`${sort.key}-${sort.order}`}
            onChange={handleSortChange}
            options={sortOptions.map(option => [
              { value: `${option.value}-desc`, label: `${option.label} ↓` },
              { value: `${option.value}-asc`, label: `${option.value} ↑` }
            ]).flat()}
          />
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative"
        >
          {t('common').filter}
          {activeFilterCount > 0 && (
            <Badge
              variant="default"
              size="sm"
              className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Reset Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            size="sm"
          >
            {t('common').reset}
          </Button>
        )}
      </Flex>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Material Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tn('catalog', 'category.material')}
              </label>
              <Select
                placeholder={tn('catalog', 'allCategories')}
                onChange={() => {}}
                options={uniqueMaterials.map(material => ({
                  value: material,
                  label: material
                }))}
                                size="sm"
              />
            </div>

            {/* Size Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tn('catalog', 'category.size')}
              </label>
              <Select
                placeholder={tn('catalog', 'allCategories')}
                onChange={() => {}}
                options={uniqueSizes.map(size => ({
                  value: size,
                  label: size
                }))}
                                size="sm"
              />
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tn('catalog', 'category.industry')}
              </label>
              <Select
                placeholder={tn('catalog', 'allCategories')}
                onChange={() => {}}
                options={uniqueIndustries.map(industry => ({
                  value: industry,
                  label: industry
                }))}
                                size="sm"
              />
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {tn('catalog', 'category.type')} {tn('catalog', 'details.price')}
              </label>
              <Flex className="gap-2">
                <Input
                  type="number"
                  placeholder="最小"
                  value={filters.priceRange.min || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  size="sm"
                />
                <span className="self-center text-gray-500">-</span>
                <Input
                  type="number"
                  placeholder="最大"
                  value={filters.priceRange.max || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  size="sm"
                />
              </Flex>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="secondary" size="sm">
                    {t('common').search}: {filters.search}
                  </Badge>
                )}
                {filters.type.map(type => (
                  <Badge key={type} variant="secondary" size="sm">
                    {tn('catalog', 'category.type')}: {packageTypeOptions.find(opt => opt.value === type)?.label}
                  </Badge>
                ))}
                {filters.materials.map(material => (
                  <Badge key={material} variant="secondary" size="sm">
                    {tn('catalog', 'category.material')}: {material}
                  </Badge>
                ))}
                {filters.sizes.map(size => (
                  <Badge key={size} variant="secondary" size="sm">
                    {tn('catalog', 'category.size')}: {size}
                  </Badge>
                ))}
                {filters.industries.map(industry => (
                  <Badge key={industry} variant="secondary" size="sm">
                    {tn('catalog', 'category.industry')}: {industry}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}