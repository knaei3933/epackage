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
  ChevronDown
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProcessingPreviewTrigger } from '../previews/ProcessingPreviewTrigger'
import { BeforeAfterPreview } from '../previews/BeforeAfterPreview'
import {
  processingOptionsConfig,
  getProcessingOptionsByCompatibility,
  calculateProcessingImpact,
  type ProcessingOptionConfig
} from '../shared/processingConfig'

// User-centric category structure
interface UserCentricCategory {
  id: 'visual' | 'functional' | 'convenience' | 'retail'
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
    id: 'visual',
    name: 'Visual Appeal',
    nameJa: 'ビジュアル仕上げ',
    description: 'Surface finish and visual presentation',
    descriptionJa: '表面仕上げと視覚的プレゼンテーション',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    priority: 1
  },
  {
    id: 'functional',
    name: 'Functional Features',
    nameJa: '機能性',
    description: 'Essential functionality and protection',
    descriptionJa: '基本的な機能と保護',
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    priority: 2
  },
  {
    id: 'convenience',
    name: 'User Convenience',
    nameJa: '利便性',
    description: 'Easy opening and handling features',
    descriptionJa: '簡単な開封と取り扱い機能',
    icon: <Package className="w-6 h-6" />,
    color: 'bg-green-100 text-green-700 border-green-200',
    priority: 3
  },
  {
    id: 'retail',
    name: 'Retail Display',
    nameJa: '小売表示',
    description: 'Retail merchandising and display options',
    descriptionJa: '小売販売と表示オプション',
    icon: <ShoppingBag className="w-6 h-6" />,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    priority: 4
  }
]

// Map processing options to user-centric categories
const getOptionsByUserCategory = (categoryId: UserCentricCategory['id'], compatibleOptions: ProcessingOptionConfig[]) => {
  const categoryMap: Record<string, string[]> = {
    visual: ['glossy', 'matte'],
    functional: ['zipper-yes', 'valve-yes', 'corner-round'],
    convenience: ['notch-yes', 'top-open', 'bottom-open'],
    retail: ['hang-hole-yes']
  }

  const optionIds = categoryMap[categoryId] || []
  return compatibleOptions.filter(option => optionIds.includes(option.id))
}

interface ModernPostProcessingSelectorProps {
  selectedProductType: string
  selectedOptions: string[]
  onOptionsChange: (options: string[]) => void
  onPriceUpdate: (multiplier: number) => void
  language?: 'en' | 'ja'
  className?: string
}

export function ModernPostProcessingSelector({
  selectedProductType,
  selectedOptions,
  onOptionsChange,
  onPriceUpdate,
  language = 'ja',
  className = ''
}: ModernPostProcessingSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<UserCentricCategory['id'] | null>(null)
  const [previewOption, setPreviewOption] = useState<ProcessingOptionConfig | null>(null)
  const [showComparison, setShowComparison] = useState<string[]>([])
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Get compatible options
  const compatibleOptions = useMemo(() => {
    return getProcessingOptionsByCompatibility(selectedProductType)
  }, [selectedProductType])

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
    const option = processingOptionsConfig.find(opt => opt.id === optionId)
    if (!option) return

    // Handle mutually exclusive options
    const exclusivePairs = [
      ['zipper-yes', 'zipper-no'],
      ['glossy', 'matte'],
      ['notch-yes', 'notch-no'],
      ['hang-hole-yes', 'hang-hole-no'],
      ['corner-round', 'corner-square'],
      ['valve-yes', 'valve-no']
    ]

    let newOptions = [...selectedOptions]

    for (const pair of exclusivePairs) {
      if (pair.includes(optionId)) {
        newOptions = newOptions.filter(id => !pair.includes(id))
      }
    }

    if (!newOptions.includes(optionId)) {
      newOptions.push(optionId)
    }

    onOptionsChange(newOptions)
  }, [selectedOptions, onOptionsChange])

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: UserCentricCategory['id']) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId)
  }, [activeCategory])

  // Get selected options count per category
  const getSelectedCount = useCallback((categoryId: UserCentricCategory['id']) => {
    const options = getOptionsByUserCategory(categoryId, compatibleOptions)
    return options.filter(option => selectedOptions.includes(option.id)).length
  }, [compatibleOptions, selectedOptions])

  // Toggle comparison mode
  const toggleComparison = useCallback((optionId: string) => {
    setShowComparison(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    )
  }, [])

  // Get recommendation based on product type
  const getRecommendations = useCallback(() => {
    const recommendations: ProcessingOptionConfig[] = []

    // Popular combinations based on product type
    const popularCombinations: Record<string, string[]> = {
      stand_up: ['zipper-yes', 'notch-yes', 'hang-hole-yes'],
      flat_3_side: ['glossy', 'notch-yes'],
      gusset: ['zipper-yes', 'valve-yes']
    }

    const recommended = popularCombinations[selectedProductType] || []
    return compatibleOptions.filter(option => recommended.includes(option.id))
  }, [selectedProductType, compatibleOptions])

  const recommendations = getRecommendations()

  return (
    <div className={`max-w-7xl mx-auto p-4 space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-200">
          <Sparkles className="w-4 h-4" />
          <span>{language === 'ja' ? '後加工オプション' : 'Post-Processing Options'}</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          {language === 'ja' ? '製品仕様をカスタマイズ' : 'Customize Your Product Specifications'}
        </h1>

        <p className="text-gray-600 max-w-2xl mx-auto">
          {language === 'ja'
            ? 'カテゴリーから選択して、製品に最適な後加工オプションを見つけましょう。'
            : 'Choose from categories to find the perfect post-processing options for your product.'}
        </p>
      </motion.div>

      {/* Selected Options Summary */}
      {selectedOptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                {language === 'ja' ? '選択されたオプション' : 'Selected Options'}
              </h3>

              <div className="flex flex-wrap gap-2">
                {selectedOptions.map(optionId => {
                  const option = processingOptionsConfig.find(opt => opt.id === optionId)
                  return option ? (
                    <Badge key={optionId} variant="secondary" className="text-xs">
                      {language === 'ja' ? option.nameJa : option.name}
                    </Badge>
                  ) : null
                })}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  x{processingImpact.multiplier.toFixed(2)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {processingImpact.processingTimeJa}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {processingImpact.minimumQuantity.toLocaleString()} {language === 'ja' ? '個から' : 'pieces'}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onOptionsChange([])}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              {language === 'ja' ? 'すべてクリア' : 'Clear All'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Category Navigation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {language === 'ja' ? 'カテゴリーから選択' : 'Choose by Category'}
          </h2>

          {recommendations.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-sm"
            >
              <Star className="w-4 h-4 text-yellow-500" />
              {language === 'ja' ? 'おすすめ' : 'Recommended'}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {userCentricCategories.map((category) => {
            const selectedCount = getSelectedCount(category.id)
            const categoryOptions = getOptionsByUserCategory(category.id, compatibleOptions)

            return (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 ${
                    activeCategory === category.id
                      ? 'ring-2 ring-green-500 shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className={`inline-flex p-3 rounded-lg ${category.color}`}>
                        {category.icon}
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900">
                          {language === 'ja' ? category.nameJa : category.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {language === 'ja' ? category.descriptionJa : category.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {categoryOptions.length} {language === 'ja' ? 'オプション' : 'options'}
                        </Badge>

                        {selectedCount > 0 && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            {selectedCount} {language === 'ja' ? '選択済み' : 'selected'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Active Category Options */}
      <AnimatePresence>
        {activeCategory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {userCentricCategories.find(cat => cat.id === activeCategory)?.[
                  language === 'ja' ? 'nameJa' : 'name'
                ]}
              </h3>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveCategory(null)}
                className="text-gray-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getOptionsByUserCategory(activeCategory, compatibleOptions).map((option) => {
                const isSelected = selectedOptions.includes(option.id)
                const isRecommended = recommendations.includes(option)
                const isComparing = showComparison.includes(option.id)

                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'ring-2 ring-green-500 bg-green-50'
                          : 'hover:shadow-md hover:border-green-200'
                      }`}
                      onClick={() => handleToggleOption(option.id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Visual Preview */}
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                            <img
                              src={option.thumbnail || option.afterImage}
                              alt={language === 'ja' ? option.nameJa : option.name}
                              className="w-full h-full object-cover"
                            />

                            {isRecommended && (
                              <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {language === 'ja' ? 'おすすめ' : 'Recommended'}
                              </div>
                            )}

                            {isSelected && (
                              <div className="absolute top-2 left-2 bg-green-600 text-white p-1 rounded-full">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          {/* Option Details */}
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-gray-900">
                                {language === 'ja' ? option.nameJa : option.name}
                              </h4>

                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <TrendingUp className="w-4 h-4" />
                                x{option.priceMultiplier.toFixed(2)}
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2">
                              {language === 'ja' ? option.descriptionJa : option.description}
                            </p>

                            {/* Key Features */}
                            <div className="flex flex-wrap gap-1">
                              {(language === 'ja' ? option.featuresJa : option.features)
                                .slice(0, 3)
                                .map((feature, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button
                                variant={isSelected ? "primary" : "outline"}
                                size="sm"
                                className="flex-1"
                              >
                                {isSelected
                                  ? language === 'ja' ? '選択済み' : 'Selected'
                                  : language === 'ja' ? '選択する' : 'Select'}
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPreviewOption(option)
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleComparison(option.id)
                                }}
                                className={isComparing ? 'text-blue-600' : ''}
                              >
                                <Filter className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendations Section */}
      {recommendations.length > 0 && !activeCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Star className="w-5 h-5 text-yellow-500" />
            {language === 'ja' ? 'おすすめの組み合わせ' : 'Popular Combinations'}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendations.map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  className="h-auto p-3 justify-start text-left hover:bg-yellow-100"
                  onClick={() => handleToggleOption(option.id)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={option.thumbnail || option.afterImage}
                      alt={language === 'ja' ? option.nameJa : option.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {language === 'ja' ? option.nameJa : option.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        x{option.priceMultiplier.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

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
            onClose={() => setPreviewOption(null)}
            language={language}
            showComparisonSlider={true}
            autoPlay={false}
          />
        )}
      </AnimatePresence>
    </div>
  )
}