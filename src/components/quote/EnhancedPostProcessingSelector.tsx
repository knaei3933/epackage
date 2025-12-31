'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  ShoppingBag,
  Package,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronDown,
  Settings,
  BarChart3,
  Grid3X3,
  List,
  RotateCcw
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProcessingPreviewTrigger } from './ProcessingPreviewTrigger'
import { BeforeAfterPreview } from './BeforeAfterPreview'
import {
  PostProcessingSelectionCounter,
  PostProcessingLimitIndicator
} from './PostProcessingSelectionCounter'
import { PostProcessingComparisonTable } from './PostProcessingComparisonTable'
import { PostProcessingItemReplacement } from './PostProcessingItemReplacement'
import { PostProcessingCostImpact } from './PostProcessingCostImpact'
import { useQuote, useQuoteState, canAddPostProcessingOptionForState, getPostProcessingLimitStatusForState } from '@/contexts/QuoteContext'
import {
  processingOptionsConfig,
  getProcessingOptionsByCompatibility,
  calculateProcessingImpact,
  type ProcessingOptionConfig
} from './processingConfig'
import {
  MAX_POST_PROCESSING_ITEMS,
  validatePostProcessingSelection,
  type PostProcessingValidationError
} from './postProcessingLimits'

// User-centric category structure (Updated to match 수정사항.md requirements)
interface UserCentricCategory {
  id: 'opening-sealing' | 'surface-treatment' | 'shape-structure' | 'functionality'
  name: string
  nameJa: string
  description: string
  descriptionJa: string
  icon: React.ReactNode
  color: string
  priority: number
}

const userCentricCategories: UserCentricCategory[] = [
  {
    id: 'opening-sealing',
    name: '개봉/파지 기능',
    nameJa: '開封/密閉機能',
    description: 'Package opening and sealing functionality',
    descriptionJa: 'パッケージの開封と密閉機能',
    icon: <Package className="w-5 h-5" />,
    color: 'blue',
    priority: 1
  },
  {
    id: 'surface-treatment',
    name: '표면 처리',
    nameJa: '表面処理',
    description: 'Surface treatment finishes',
    descriptionJa: '表面仕上げ処理',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'purple',
    priority: 2
  },
  {
    id: 'shape-structure',
    name: '형태/구조',
    nameJa: '形状/構造',
    description: 'Shape and structural modifications',
    descriptionJa: '形状と構造の修正',
    icon: <Settings className="w-5 h-5" />,
    color: 'green',
    priority: 3
  },
  {
    id: 'functionality',
    name: '기능성',
    nameJa: '機能性',
    description: 'Additional functional capabilities',
    descriptionJa: '追加機能性',
    icon: <Zap className="w-5 h-5" />,
    color: 'orange',
    priority: 4
  }
]

interface EnhancedPostProcessingSelectorProps {
  selectedProductType: string
  language?: 'en' | 'ja'
  onPriceUpdate: (multiplier: number) => void
  quantities?: number[]
  basePrice?: number
}

export function EnhancedPostProcessingSelector({
  selectedProductType,
  language = 'ja',
  onPriceUpdate,
  quantities = [100, 500, 1000, 5000, 10000],
  basePrice = 10000
}: EnhancedPostProcessingSelectorProps) {
  const state = useQuoteState();
  const {
    addPostProcessingOption,
    removePostProcessingOption,
    replacePostProcessingOption,
    clearPostProcessingValidationError
  } = useQuote();

  const canAddPostProcessingOption = () => canAddPostProcessingOptionForState(state);
  const getPostProcessingLimitStatus = () => getPostProcessingLimitStatusForState(state);

  const [selectedCategory, setSelectedCategory] = useState<UserCentricCategory | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'comparison'>('grid')
  const [showCostAnalysis, setShowCostAnalysis] = useState(false)
  const [replacementMode, setReplacementMode] = useState<{
    active: boolean
    attemptedOption: ProcessingOptionConfig | null
  }>({ active: false, attemptedOption: null })

  const [enlargedImage, setEnlargedImage] = useState<{
    option: ProcessingOptionConfig;
    type: 'before' | 'after' | 'thumbnail';
    beforeImage?: string;
    afterImage?: string;
  } | null>(null)

  // Get selected option details
  const selectedOptionDetails = useMemo(() => {
    return state.postProcessingOptions
      .map(id => processingOptionsConfig.find(opt => opt.id === id))
      .filter(Boolean) as ProcessingOptionConfig[]
  }, [state.postProcessingOptions])

  // Get limit status
  const limitStatus = getPostProcessingLimitStatus()

  // Filter options based on search and category
  const filteredOptions = useMemo(() => {
    let options = processingOptionsConfig

    // Filter by category
    if (selectedCategory) {
      options = options.filter(opt => {
        // Map user-centric categories to technical categories (Updated for 수정사항.md exact requirements)
        const categoryMap: Record<UserCentricCategory['id'], string[]> = {
          'opening-sealing': ['closure', 'opening'],    // 개봉/파지 기능: 지퍼, 밸브
          'surface-treatment': ['finish'],               // 표면 처리: 무광, 유광
          'shape-structure': ['structure', 'display'],   // 형태/구조: 노치, 모서리, 걸이타공
          'functionality': ['opening', 'display']         // 기능성: 개봉 위치, 걸이타공
        }
        return categoryMap[selectedCategory.id]?.includes(opt.category) || false
      })
    }

    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      options = options.filter(opt =>
        opt.name.toLowerCase().includes(lowerSearchTerm) ||
        opt.nameJa.toLowerCase().includes(lowerSearchTerm) ||
        opt.description.toLowerCase().includes(lowerSearchTerm) ||
        opt.descriptionJa.toLowerCase().includes(lowerSearchTerm)
      )
    }

    return options
  }, [selectedCategory, searchTerm])

  // Handle option selection with 5-item limit
  const handleOptionClick = useCallback((option: ProcessingOptionConfig) => {
    if (state.postProcessingOptions.includes(option.id)) {
      // Remove if already selected
      removePostProcessingOption(option.id)
      clearPostProcessingValidationError()
    } else {
      // Try to add new option
      if (!canAddPostProcessingOption()) {
        // Show replacement mode
        setReplacementMode({
          active: true,
          attemptedOption: option
        })
        return
      }

      // Add the option
      const allOptionsMapped = processingOptionsConfig.map(opt => ({
        id: opt.id,
        category: opt.category,
        compatibility: opt.compatibleWith,
        priority: 1,
        impact: opt.features.length + opt.benefits.length
      }))
      const success = addPostProcessingOption(option.id, allOptionsMapped)
      if (!success) {
        // Show replacement mode if validation failed
        setReplacementMode({
          active: true,
          attemptedOption: option
        })
      }
    }
  }, [state.postProcessingOptions, canAddPostProcessingOption, addPostProcessingOption, removePostProcessingOption, clearPostProcessingValidationError])

  // Handle replacement
  const handleReplaceOption = useCallback((oldOptionId: string, newOptionId: string) => {
    replacePostProcessingOption(oldOptionId, newOptionId)
    setReplacementMode({ active: false, attemptedOption: null })
    clearPostProcessingValidationError()
  }, [replacePostProcessingOption, clearPostProcessingValidationError])

  // Calculate processing impact
  const processingImpact = useMemo(() => {
    return calculateProcessingImpact(state.postProcessingOptions)
  }, [state.postProcessingOptions])

  // Update price when selection changes
  useEffect(() => {
    onPriceUpdate(processingImpact.multiplier)
  }, [processingImpact.multiplier, onPriceUpdate])

  // Close replacement mode when validation error is cleared
  useEffect(() => {
    if (!state.postProcessingValidationError && replacementMode.active) {
      setReplacementMode({ active: false, attemptedOption: null })
    }
  }, [state.postProcessingValidationError, replacementMode.active])

  return (
    <div className="space-y-6">
      {/* Header with Selection Counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-brixa-100 to-navy-100 text-brixa-700 px-4 py-2 rounded-full text-sm font-medium">
            <Package className="w-4 h-4" />
            <span>{language === 'ja' ? '後加工オプション' : 'Post-Processing Options'}</span>
          </div>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            {selectedOptionDetails.length} / {MAX_POST_PROCESSING_ITEMS}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Selector */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'comparison' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('comparison')}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCostAnalysis(!showCostAnalysis)}
          >
            <DollarSign className="w-4 h-4 mr-1" />
            {showCostAnalysis ? (language === 'ja' ? '非表示' : 'Hide') : (language === 'ja' ? 'コスト分析' : 'Cost Analysis')}
          </Button>
        </div>
      </div>

      {/* Selection Counter */}
      <PostProcessingSelectionCounter
        selectedCount={selectedOptionDetails.length}
        onClearAll={() => {
          state.postProcessingOptions.forEach(id => removePostProcessingOption(id))
        }}
        showControls={true}
        language={language}
      />

      {/* Validation Error Indicator */}
      <PostProcessingLimitIndicator
        isAtLimit={limitStatus.isAtLimit}
        selectedCount={selectedOptionDetails.length}
        attemptedSelection={replacementMode.attemptedOption?.id}
        language={language}
      />

      {/* Replacement Mode */}
      <AnimatePresence>
        {replacementMode.active && replacementMode.attemptedOption && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <PostProcessingItemReplacement
              currentSelection={selectedOptionDetails}
              attemptedItem={replacementMode.attemptedOption}
              onReplaceItem={handleReplaceOption}
              onCancelReplacement={() => {
                setReplacementMode({ active: false, attemptedOption: null })
                clearPostProcessingValidationError()
              }}
              allOptions={processingOptionsConfig}
              language={language}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cost Analysis */}
      <AnimatePresence>
        {showCostAnalysis && selectedOptionDetails.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PostProcessingCostImpact
              selectedOptions={selectedOptionDetails}
              basePrice={basePrice}
              quantities={quantities}
              language={language}
              showDetailedBreakdown={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      {viewMode === 'comparison' ? (
        <PostProcessingComparisonTable
          selectedOptions={selectedOptionDetails}
          onRemoveOption={removePostProcessingOption}
          onReplaceOption={handleReplaceOption}
          basePrice={basePrice}
          quantities={quantities}
          language={language}
          showActions={true}
        />
      ) : (
        <>
          {/* Category and Search Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-4">
                {/* Category Tabs */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  <Button
                    variant={!selectedCategory ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    {language === 'ja' ? 'すべて' : 'All'}
                  </Button>
                  {userCentricCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory?.id === category.id ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="flex items-center space-x-1 whitespace-nowrap"
                    >
                      {category.icon}
                      <span>{language === 'ja' ? category.nameJa : category.name}</span>
                    </Button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={language === 'ja' ? 'オプションを検索...' : 'Search options...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setSearchTerm('')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options Grid/List */}
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }>
            {filteredOptions.map((option) => {
              const isSelected = state.postProcessingOptions.includes(option.id)
              const canSelect = !isSelected && canAddPostProcessingOption()

              return (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected
                      ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50'
                      : canSelect
                      ? 'hover:border-blue-300'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-6">
                      {/* Enlarged Image */}
                      <div
                        className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative group cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEnlargedImage({
                            option,
                            type: 'thumbnail',
                            beforeImage: option.beforeImage,
                            afterImage: option.afterImage
                          })
                        }}
                      >
                        <img
                          src={option.thumbnail}
                          alt={language === 'ja' ? option.nameJa : option.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        {/* Hover indicator */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                            {language === 'ja' ? 'クリックして拡大' : 'Click to enlarge'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg truncate">
                            {language === 'ja' ? option.nameJa : option.name}
                          </h3>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          )}
                          {!isSelected && !canSelect && (
                            <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {language === 'ja' ? option.descriptionJa : option.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {option.category}
                          </Badge>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-green-600 font-medium">
                              +{((option.priceMultiplier - 1) * 100).toFixed(1)}%
                            </span>
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">
                              {language === 'ja' ? option.processingTimeJa : option.processingTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features Preview */}
                    {showAdvanced && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Zap className="w-3 h-3" />
                          <span>{option.features.length + option.benefits.length} {language === 'ja' ? '機能' : 'features'}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              )
            })}
          </div>

          {filteredOptions.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  {language === 'ja'
                    ? '該当するオプションが見つかりませんでした'
                    : 'No matching options found'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Advanced Toggle */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Settings className="w-4 h-4 mr-2" />
          {showAdvanced
            ? (language === 'ja' ? 'シンプル表示' : 'Simple View')
            : (language === 'ja' ? '詳細表示' : 'Advanced View')
          }
        </Button>
      </div>

      {/* Image Enlargement Modal */}
      <AnimatePresence>
        {enlargedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80"
            onClick={() => setEnlargedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-6xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {language === 'ja' ? enlargedImage.option.nameJa : enlargedImage.option.name}
                </h3>
                <button
                  onClick={() => setEnlargedImage(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Before/After Comparison */}
                {enlargedImage.beforeImage && enlargedImage.afterImage ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {language === 'ja' ? '加工前' : 'Before Processing'}
                      </h4>
                      <div className="bg-gray-100 rounded-lg p-4 inline-block">
                        <img
                          src={enlargedImage.beforeImage}
                          alt="Before"
                          className="max-w-full max-h-96 object-contain rounded"
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {language === 'ja' ? '加工後' : 'After Processing'}
                      </h4>
                      <div className="bg-gray-100 rounded-lg p-4 inline-block">
                        <img
                          src={enlargedImage.afterImage}
                          alt="After"
                          className="max-w-full max-h-96 object-contain rounded"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Single image view (3-4x enlarged)
                  <div className="text-center">
                    <div className="bg-gray-100 rounded-lg p-4 inline-block">
                      <img
                        src={enlargedImage.option.thumbnail}
                        alt={language === 'ja' ? enlargedImage.option.nameJa : enlargedImage.option.name}
                        className="w-auto h-auto max-w-full max-h-96 object-contain rounded"
                        style={{
                          width: 'auto',
                          height: 'auto',
                          minWidth: '384px', // 3x from 128px (w-32)
                          minHeight: '384px', // 3x from 128px (h-32)
                          maxWidth: '512px', // 4x from 128px
                          maxHeight: '512px'  // 4x from 128px
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Option Details */}
                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {language === 'ja' ? '説明' : 'Description'}
                    </h4>
                    <p className="text-gray-600">
                      {language === 'ja' ? enlargedImage.option.descriptionJa : enlargedImage.option.description}
                    </p>
                  </div>

  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {language === 'ja' ? '技術仕様' : 'Technical Specifications'}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {language === 'ja' ? enlargedImage.option.technicalNotesJa : enlargedImage.option.technicalNotes}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {language === 'ja' ? '費用影響' : 'Cost Impact'}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-blue-600">
                        +{((enlargedImage.option.priceMultiplier - 1) * 100).toFixed(1)}%
                      </span>
                      <span className="text-gray-500">
                        {language === 'ja' ? '追加費用' : 'additional cost'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}