'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Filter,
  Zap,
  TrendingUp,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  Grid,
  List,
  Search,
  X,
  ChevronDown,
  Star,
  Award,
  Clock,
  Package,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { ProcessingPreviewTrigger } from './ProcessingPreviewTrigger'
import { BeforeAfterPreview } from './BeforeAfterPreview'
import {
  processingOptionsConfig,
  getProcessingOptionsByCompatibility,
  getProcessingOptionsByCategory,
  getProcessingCategories,
  calculateProcessingImpact,
  type ProcessingOptionConfig
} from './processingConfig'

interface EnhancedPostProcessingPreviewProps {
  selectedProductType: string
  selectedOptions: string[]
  onOptionsChange: (options: string[]) => void
  onPriceUpdate: (multiplier: number) => void
  language?: 'en' | 'ja'
  variant?: 'full' | 'compact' | 'minimal'
  showAdvancedFilters?: boolean
  enableBatchSelection?: boolean
}

export function EnhancedPostProcessingPreview({
  selectedProductType,
  selectedOptions,
  onOptionsChange,
  onPriceUpdate,
  language = 'ja',
  variant = 'full',
  showAdvancedFilters = true,
  enableBatchSelection = false
}: EnhancedPostProcessingPreviewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showPreview, setShowPreview] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'popularity'>('popularity')
  const [showOnlyCompatible, setShowOnlyCompatible] = useState(true)
  const [previewOption, setPreviewOption] = useState<ProcessingOptionConfig | null>(null)
  const [batchSelection, setBatchSelection] = useState<string[]>([])

  // Filter and sort options
  const filteredAndSortedOptions = useMemo(() => {
    let options = processingOptionsConfig

    // Filter by compatibility
    if (showOnlyCompatible) {
      options = getProcessingOptionsByCompatibility(selectedProductType)
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      options = options.filter(option => option.category === selectedCategory)
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      options = options.filter(option =>
        option.name.toLowerCase().includes(query) ||
        option.nameJa.toLowerCase().includes(query) ||
        option.description.toLowerCase().includes(query) ||
        option.descriptionJa.toLowerCase().includes(query) ||
        option.features.some(f => f.toLowerCase().includes(query)) ||
        option.featuresJa.some(f => f.toLowerCase().includes(query))
      )
    }

    // Sort options
    options.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return language === 'ja' ? a.nameJa.localeCompare(b.nameJa) : a.name.localeCompare(b.name)
        case 'price':
          return a.priceMultiplier - b.priceMultiplier
        case 'popularity':
          // Sort by price multiplier and features count as proxy for popularity
          const aScore = (a.priceMultiplier - 1) * 10 + a.features.length
          const bScore = (b.priceMultiplier - 1) * 10 + b.features.length
          return bScore - aScore
        default:
          return 0
      }
    })

    return options
  }, [selectedProductType, selectedCategory, searchQuery, sortBy, showOnlyCompatible, language])

  // Calculate processing impact
  const processingImpact = useMemo(() => {
    return calculateProcessingImpact(selectedOptions)
  }, [selectedOptions])

  // Update price when selection changes
  useEffect(() => {
    onPriceUpdate(processingImpact.multiplier)
  }, [processingImpact.multiplier, onPriceUpdate])

  // Handle option toggle
  const handleToggleOption = useCallback((optionId: string) => {
    const newOptions = selectedOptions.includes(optionId)
      ? selectedOptions.filter(id => id !== optionId)
      : [...selectedOptions, optionId]

    onOptionsChange(newOptions)
  }, [selectedOptions, onOptionsChange])

  // Handle batch selection
  const handleBatchSelect = useCallback((optionId: string) => {
    setBatchSelection(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    )
  }, [])

  // Apply batch selection
  const applyBatchSelection = useCallback(() => {
    const newOptions = [...new Set([...selectedOptions, ...batchSelection])]
    onOptionsChange(newOptions)
    setBatchSelection([])
  }, [selectedOptions, batchSelection, onOptionsChange])

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    onOptionsChange([])
    setBatchSelection([])
  }, [onOptionsChange])

  // Get category display info
  const getCategoryInfo = useCallback((categoryId: string) => {
    return getProcessingCategories.find(cat => cat.id === categoryId)
  }, [])

  // Handle preview
  const handlePreview = useCallback((option: ProcessingOptionConfig) => {
    setPreviewOption(option)
  }, [])

  const closePreview = useCallback(() => {
    setPreviewOption(null)
  }, [])

  // Responsive grid classes
  const getGridClasses = useCallback(() => {
    switch (variant) {
      case 'compact':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
      case 'minimal':
        return 'grid grid-cols-1 gap-2'
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
    }
  }, [variant])

  if (filteredAndSortedOptions.length === 0) {
    return (
      <Card className="p-6 bg-gray-50 border-gray-200">
        <CardContent className="text-center">
          <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {language === 'ja' ? 'オプションが見つかりません' : 'No options found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {language === 'ja'
              ? 'この製品タイプに利用可能な後加工オプションがありません。フィルターを調整してください。'
              : 'No post-processing options available for this product type. Try adjusting your filters.'}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory('all')
              setSearchQuery('')
              setShowOnlyCompatible(false)
            }}
          >
            {language === 'ja' ? 'フィルターをリセット' : 'Reset Filters'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <MotionWrapper delay={0.1}>
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-brixa-100 to-navy-100 text-brixa-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Settings className="w-4 h-4" />
            <span>{language === 'ja' ? '後加工オプション' : 'Post-Processing Options'}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'ja' ? '製品仕様をカスタマイズ' : 'Customize Your Product Specifications'}
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {language === 'ja'
              ? '機能性と魅力を向上させる後加工オプションを選択してください。視覚的なプレビューで結果を確認できます。'
              : 'Select post-processing options to enhance functionality and appeal. Preview results visually before making your decision.'}
          </p>
        </div>
      </MotionWrapper>

      {/* Processing Impact Summary */}
      {selectedOptions.length > 0 && (
        <MotionWrapper delay={0.2}>
          <Card className="bg-gradient-to-r from-brixa-50 to-navy-50 border-brixa-200">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {language === 'ja' ? '選択されたオプション' : 'Selected Options'}
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedOptions.map(optionId => {
                      const option = processingOptionsConfig.find(opt => opt.id === optionId)
                      return option ? (
                        <Badge key={optionId} variant="secondary" className="text-xs">
                          {language === 'ja' ? option.nameJa : option.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• {language === 'ja' ? '価格乗数' : 'Price Multiplier'}: x{processingImpact.multiplier.toFixed(2)}</div>
                    <div>• {language === 'ja' ? '追加生産時間' : 'Additional Processing Time'}: {processingImpact.processingTimeJa}</div>
                    <div>• {language === 'ja' ? '最小数量' : 'Minimum Quantity'}: {processingImpact.minimumQuantity.toLocaleString()} pieces</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {enableBatchSelection && batchSelection.length > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={applyBatchSelection}
                      className="flex items-center space-x-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{language === 'ja' ? `${batchSelection.length}個を追加` : `Add ${batchSelection.length}`}</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllSelections}
                  >
                    {language === 'ja' ? 'すべてクリア' : 'Clear All'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionWrapper>
      )}

      {/* Advanced Filters */}
      {showAdvancedFilters && variant === 'full' && (
        <MotionWrapper delay={0.3}>
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={language === 'ja' ? 'オプションを検索...' : 'Search options...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="lg:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
                  >
                    <option value="all">{language === 'ja' ? 'すべてのカテゴリ' : 'All Categories'}</option>
                    {getProcessingCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {language === 'ja' ? category.nameJa : category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="lg:w-48">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
                  >
                    <option value="popularity">{language === 'ja' ? '人気順' : 'Popularity'}</option>
                    <option value="name">{language === 'ja' ? '名前順' : 'Name'}</option>
                    <option value="price">{language === 'ja' ? '価格順' : 'Price'}</option>
                  </select>
                </div>

                {/* Toggle Compatibility Filter */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="compatible-only"
                    checked={showOnlyCompatible}
                    onChange={(e) => setShowOnlyCompatible(e.target.checked)}
                    className="w-4 h-4 text-brixa-600 border-gray-300 rounded focus:ring-brixa-500"
                  />
                  <label htmlFor="compatible-only" className="text-sm text-gray-700">
                    {language === 'ja' ? '互換性のみ' : 'Compatible Only'}
                  </label>
                </div>

                {/* View Mode */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionWrapper>
      )}

      {/* Options Grid/List */}
      <MotionWrapper delay={0.4}>
        <div className={viewMode === 'grid' ? getGridClasses() : 'space-y-3'}>
          {filteredAndSortedOptions.map((option) => {
            const isSelected = selectedOptions.includes(option.id)
            const isBatchSelected = enableBatchSelection && batchSelection.includes(option.id)
            const categoryInfo = getCategoryInfo(option.category)

            return (
              <ProcessingPreviewTrigger
                key={option.id}
                option={option}
                isSelected={isSelected}
                onToggle={handleToggleOption}
                onPreview={(optionId) => {
                  const option = processingOptionsConfig.find(opt => opt.id === optionId)
                  if (option) handlePreview(option)
                }}
                language={language}
                variant={variant === 'full' ? 'detailed' : variant}
                showPriceImpact={true}
                interactive={true}
              />
            )
          })}
        </div>
      </MotionWrapper>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewOption && (
          <BeforeAfterPreview
            beforeImage={previewOption.beforeImage}
            afterImage={previewOption.afterImage}
            beforeLabel="Before Processing"
            afterLabel="After Processing"
            beforeLabelJa="加工前"
            afterLabelJa="加工後"
            title={previewOption.name}
            titleJa={previewOption.nameJa}
            description={previewOption.description}
            descriptionJa={previewOption.descriptionJa}
            onClose={closePreview}
            language={language}
            showComparisonSlider={true}
            autoPlay={false}
          />
        )}
      </AnimatePresence>

      {/* Performance Stats - for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/50 text-white p-2 rounded text-xs">
          Options: {filteredAndSortedOptions.length} | Selected: {selectedOptions.length}
        </div>
      )}
    </div>
  )
}

// Helper function to get option by ID (re-export from config)
export const getProcessingOptionById = processingOptionsConfig.find.bind(processingOptionsConfig)