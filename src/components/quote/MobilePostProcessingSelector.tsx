'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
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
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  Filter,
  Search,
  X,
  Plus,
  Minus,
  Menu,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useQuote, useQuoteState, canAddPostProcessingOptionForState, getPostProcessingLimitStatusForState } from '@/contexts/QuoteContext'
import {
  processingOptionsConfig,
  getProcessingOptionsByCompatibility,
  calculateProcessingImpact,
  type ProcessingOptionConfig
} from './processingConfig'
import {
  MAX_POST_PROCESSING_ITEMS,
  calculateRemainingSlots,
  isSelectionLimitReached,
  getSelectionVisualFeedback,
  type PostProcessingLimitState
} from './postProcessingLimits'

// Mobile-optimized categories
interface MobileCategory {
  id: 'essential' | 'premium' | 'retail' | 'eco'
  name: string
  nameJa: string
  icon: React.ReactNode
  color: string
  options: string[]
}

const mobileCategories: MobileCategory[] = [
  {
    id: 'essential',
    name: 'Essential',
    nameJa: '必須',
    icon: <Package className="w-5 h-5" />,
    color: 'blue',
    options: ['zipper', 'tear_notch', 'hang_hole_6mm', 'hang_hole_8mm']
  },
  {
    id: 'premium',
    name: 'Premium',
    nameJa: 'プレミアム',
    icon: <Star className="w-5 h-5" />,
    color: 'purple',
    options: ['surface_finish', 'corner_style', 'metallic_print']
  },
  {
    id: 'retail',
    name: 'Retail Ready',
    nameJa: '小売対応',
    icon: <ShoppingBag className="w-5 h-5" />,
    color: 'orange',
    options: ['opening_position', 'valve', 'display_window']
  },
  {
    id: 'eco',
    name: 'Eco Friendly',
    nameJa: '環境対応',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'green',
    options: ['recyclable_material', 'biodegradable', 'eco_ink']
  }
]

interface MobilePostProcessingSelectorProps {
  selectedProductType: string
  language?: 'en' | 'ja'
  onPriceUpdate: (multiplier: number) => void
}

export function MobilePostProcessingSelector({
  selectedProductType,
  language = 'ja',
  onPriceUpdate
}: MobilePostProcessingSelectorProps) {
  const state = useQuoteState();
  const {
    addPostProcessingOption,
    removePostProcessingOption
  } = useQuote();

  const canAddPostProcessingOption = () => canAddPostProcessingOptionForState(state);
  const getPostProcessingLimitStatus = () => getPostProcessingLimitStatusForState(state);

  const [selectedCategory, setSelectedCategory] = useState<MobileCategory | null>(null)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)

  // Get selected option details
  const selectedOptionDetails = useMemo(() => {
    return state.postProcessingOptions
      .map(id => processingOptionsConfig.find(opt => opt.id === id))
      .filter(Boolean) as ProcessingOptionConfig[]
  }, [state.postProcessingOptions])

  // Get limit status
  const limitStatus = getPostProcessingLimitStatus()
  const visualFeedback = getSelectionVisualFeedback(state.postProcessingOptions.length)

  // Filter options by category
  const getCategoryOptions = useCallback((category: MobileCategory) => {
    return category.options
      .map(id => processingOptionsConfig.find(opt => opt.id === id))
      .filter(Boolean) as ProcessingOptionConfig[]
  }, [])

  // Handle option selection with 5-item limit
  const handleOptionToggle = useCallback((option: ProcessingOptionConfig) => {
    if (state.postProcessingOptions.includes(option.id)) {
      removePostProcessingOption(option.id)
    } else if (canAddPostProcessingOption()) {
      // Pass full config and current options for proper category exclusion validation
      addPostProcessingOption(option.id, processingOptionsConfig, state.postProcessingOptions)
    }
  }, [state.postProcessingOptions, canAddPostProcessingOption, addPostProcessingOption, removePostProcessingOption, processingOptionsConfig])

  // Calculate processing impact
  const processingImpact = useMemo(() => {
    return calculateProcessingImpact(state.postProcessingOptions)
  }, [state.postProcessingOptions])

  // Update price when selection changes
  React.useEffect(() => {
    onPriceUpdate(processingImpact.multiplier)
  }, [processingImpact.multiplier, onPriceUpdate])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ja' ? 'ja-JP' : 'en-US', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-lg">
                {language === 'ja' ? '後加工オプション' : 'Post-Processing'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSummary(!showSummary)}
            >
              <Eye className="w-4 h-4 mr-1" />
              {showSummary ? 'Hide' : 'Show'}
            </Button>
          </div>

          {/* Mobile Selection Counter */}
          <div className={`p-3 rounded-lg ${visualFeedback.bgColor} ${visualFeedback.borderColor} border-2`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-full ${visualFeedback.bgColor}`}>
                  <Package className={`w-4 h-4 ${visualFeedback.color}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${visualFeedback.color}`}>
                    {language === 'ja' ? '選択済み' : 'Selected'}
                  </p>
                  <p className={`text-xl font-bold ${visualFeedback.color}`}>
                    {state.postProcessingOptions.length} / {MAX_POST_PROCESSING_ITEMS}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">
                  {language === 'ja' ? '価格乗数' : 'Multiplier'}
                </p>
                <p className="font-bold text-lg">
                  x{processingImpact.multiplier.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    visualFeedback.status === 'limit'
                      ? 'bg-green-500'
                      : visualFeedback.status === 'warning'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(state.postProcessingOptions.length / MAX_POST_PROCESSING_ITEMS) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Slide-up */}
      <AnimatePresence>
        {showSummary && selectedOptionDetails.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setShowSummary(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    {language === 'ja' ? '選択サマリー' : 'Selection Summary'}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowSummary(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto max-h-[50vh]">
                <div className="space-y-3">
                  {selectedOptionDetails.map((option) => (
                    <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={option.thumbnail}
                          alt={language === 'ja' ? option.nameJa : option.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-sm">
                            {language === 'ja' ? option.nameJa : option.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            +{((option.priceMultiplier - 1) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePostProcessingOption(option.id)}
                        className="text-red-600 border-red-200"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Selection */}
      <div className="p-4">
        <h3 className="font-medium text-lg mb-3">
          {language === 'ja' ? 'カテゴリ選択' : 'Choose Category'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {mobileCategories.map((category) => {
            const categoryOptions = getCategoryOptions(category)
            const selectedCount = categoryOptions.filter(opt =>
              state.postProcessingOptions.includes(opt.id)
            ).length

            return (
              <motion.div
                key={category.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedCategory?.id === category.id
                    ? `border-${category.color}-500 bg-${category.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-${category.color}-100 rounded-full`}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {language === 'ja' ? category.nameJa : category.name}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {selectedCount}/{categoryOptions.length} {language === 'ja' ? '選択済み' : 'selected'}
                    </p>
                  </div>
                  {selectedCount > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      {selectedCount}
                    </Badge>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Options within Category */}
      <AnimatePresence mode="wait">
        {selectedCategory && (
          <motion.div
            key={selectedCategory.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="text-gray-600"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {language === 'ja' ? '戻る' : 'Back'}
              </Button>
              <h3 className="font-medium text-lg">
                {language === 'ja' ? selectedCategory.nameJa : selectedCategory.name}
              </h3>
              <div className="w-16" />
            </div>

            <div className="space-y-3">
              {getCategoryOptions(selectedCategory).map((option) => {
                const isSelected = state.postProcessingOptions.includes(option.id)
                const canSelect = !isSelected && canAddPostProcessingOption()

                return (
                  <motion.div
                    key={option.id}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : canSelect
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-200 opacity-50'
                    }`}
                    onClick={() => handleOptionToggle(option)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={option.thumbnail}
                          alt={language === 'ja' ? option.nameJa : option.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-base">
                            {language === 'ja' ? option.nameJa : option.name}
                          </h4>
                          {isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-blue-500" />
                          ) : !canSelect ? (
                            <XCircle className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Plus className="w-5 h-5 text-green-500" />
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {language === 'ja' ? option.descriptionJa : option.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {option.category}
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <Clock className="w-3 h-3" />
                              <span>{language === 'ja' ? option.processingTimeJa : option.processingTime}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium text-green-600">
                              +{((option.priceMultiplier - 1) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {/* Expand Details */}
                        <AnimatePresence>
                          {showDetails === option.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3 border-t border-gray-200"
                            >
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs font-medium text-gray-700 mb-1">
                                    {language === 'ja' ? '機能' : 'Features'}
                                  </p>
                                  <ul className="text-xs text-gray-600 space-y-1">
                                    {option.features.slice(0, 3).map((feature, index) => (
                                      <li key={index} className="flex items-center space-x-1">
                                        <div className="w-1 h-1 bg-blue-400 rounded-full" />
                                        <span>{language === 'ja' ? feature : feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-700 mb-1">
                                    {language === 'ja' ? 'ベネフィット' : 'Benefits'}
                                  </p>
                                  <ul className="text-xs text-gray-600 space-y-1">
                                    {option.benefits.slice(0, 2).map((benefit, index) => (
                                      <li key={index} className="flex items-center space-x-1">
                                        <div className="w-1 h-1 bg-green-400 rounded-full" />
                                        <span>{language === 'ja' ? benefit : benefit}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Details Toggle */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 p-0 h-auto text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowDetails(showDetails === option.id ? null : option.id)
                          }}
                        >
                          {showDetails === option.id ? (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              {language === 'ja' ? '詳細を隠す' : 'Hide Details'}
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              {language === 'ja' ? '詳細を見る' : 'View Details'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Limit Reached Message */}
      {limitStatus.isAtLimit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-green-50 border-2 border-green-200"
        >
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm font-medium">
              {language === 'ja'
                ? `最大${MAX_POST_PROCESSING_ITEMS}個のオプションを選択しました。`
                : `You've selected the maximum of ${MAX_POST_PROCESSING_ITEMS} options.`
              }
            </p>
          </div>
        </motion.div>
      )}

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600">
              {language === 'ja' ? '価格乗数' : 'Total Multiplier'}
            </p>
            <p className="text-lg font-bold">
              x{processingImpact.multiplier.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">
              {language === 'ja' ? '追加コスト' : 'Additional Cost'}
            </p>
            <p className="text-lg font-bold text-green-600">
              +{((processingImpact.multiplier - 1) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}