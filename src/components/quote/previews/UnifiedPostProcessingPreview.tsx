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
  ChevronLeft,
  ChevronRight,
  Maximize2,
  AlertCircle,
  Package,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { ProcessingPreviewTrigger } from './ProcessingPreviewTrigger'
import { BeforeAfterPreview } from './BeforeAfterPreview'
import DetailedOptionModal from '../shared/DetailedOptionModal'
import {
  processingOptionsConfig,
  getProcessingOptionsByCompatibility,
  getProcessingOptionsByCategory,
  getProcessingCategories,
  calculateProcessingImpact,
  type ProcessingOptionConfig
} from '../shared/processingConfig'

interface PostProcessingOption {
  id: string
  name: string
  nameJa: string
  description: string
  descriptionJa: string
  image: string
  priceMultiplier: number
  features: string[]
  featuresJa: string[]
  compatibleWith: string[]
}

interface TooltipData {
  title: string
  titleJa: string
  content: string
  contentJa: string
  benefits: string[]
  benefitsJa: string[]
  applications: string[]
  applicationsJa: string[]
}

interface UnifiedPostProcessingPreviewProps {
  selectedProductType: string
  selectedOptions: string[]
  onOptionsChange: (options: string[]) => void
  onPriceUpdate: (multiplier: number) => void
  language?: 'en' | 'ja'
  variant?: 'full' | 'compact' | 'minimal' | 'classic'
  showAdvancedFilters?: boolean
  enableBatchSelection?: boolean
}

// Enhanced tooltip data for each processing option
const tooltipData: Record<string, TooltipData> = {
  'zipper-yes': {
    title: 'Resealable Zipper',
    titleJa: '再利用可能なジッパー',
    content: 'High-quality zipper closure that can be opened and closed multiple times, maintaining product freshness.',
    contentJa: '複数回開閉可能な高品質ジッパーで、製品の鮮度を維持します。',
    benefits: ['Extended shelf life', 'Consumer convenience', 'Premium perception', 'Reduced waste'],
    benefitsJa: ['賞味期限延長', '消費者の利便性', 'プレミアム感', '廃棄物削減'],
    applications: ['Coffee beans', 'Snack foods', 'Pet food', 'Health supplements'],
    applicationsJa: ['コーヒー豆', 'スナック食品', 'ペットフード', '健康サプリメント']
  },
  'glossy': {
    title: 'Glossy Finish',
    titleJa: '光沢仕上げ',
    content: 'High-gloss surface treatment that enhances visual appeal and color vibrancy.',
    contentJa: '視覚的な魅力と色彩の鮮やかさを高める高光沢表面処理。',
    benefits: ['Premium appearance', 'Color enhancement', 'Brand visibility', 'Professional look'],
    benefitsJa: ['プレミアム外観', '色彩強化', 'ブランド視認性', 'プロフェッショナルな見た目'],
    applications: ['Consumer goods', 'Retail products', 'Premium foods', 'Cosmetics'],
    applicationsJa: ['消費財', '小売製品', 'プレミアム食品', '化粧品']
  },
  'valve-yes': {
    title: 'Degassing Valve',
    titleJa: 'ガス抜きバルブ',
    content: 'One-way valve that allows gases to escape without letting air in, essential for fresh products.',
    contentJa: 'ガスを逃がし外気を入れない一方弁で、新鮮な製品に不可欠です。',
    benefits: ['Freshness preservation', 'Bag bloating prevention', 'Extended shelf life', 'Aroma retention'],
    benefitsJa: ['鮮度保持', '袋膨張防止', '賞味期限延長', '香り保持'],
    applications: ['Coffee beans', 'Fresh roasted products', 'Fermented foods', 'Specialty teas'],
    applicationsJa: ['コーヒー豆', '新鮮な焙煎製品', '発酵食品', '特殊茶葉']
  }
}

/**
 * 統一後加工プレビューコンポーネント
 *
 * PostProcessingPreviewとEnhancedPostProcessingPreviewの機能を統合
 * - classic: 元のPostProcessingPreviewのシンプルなUI
 * - full/compact/minimal: EnhancedPostProcessingPreviewの高度な機能
 */
export function UnifiedPostProcessingPreview({
  selectedProductType,
  selectedOptions,
  onOptionsChange,
  onPriceUpdate,
  language = 'ja',
  variant = 'classic',
  showAdvancedFilters = true,
  enableBatchSelection = false
}: UnifiedPostProcessingPreviewProps) {
  // State for enhanced mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showPreview, setShowPreview] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'popularity'>('popularity')
  const [showOnlyCompatible, setShowOnlyCompatible] = useState(true)
  const [previewOption, setPreviewOption] = useState<ProcessingOptionConfig | null>(null)
  const [batchSelection, setBatchSelection] = useState<string[]>([])

  // State for classic mode
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedModalOption, setSelectedModalOption] = useState<PostProcessingOption | null>(null)
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)

  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}
    processingOptionsConfig.forEach(option => {
      initialState[option.id] = true
    })
    return initialState
  })

  // Convert processingOptionsConfig to PostProcessingOption format
  const postProcessingOptions: PostProcessingOption[] = useMemo(() =>
    processingOptionsConfig.map(opt => ({
      id: opt.id,
      name: opt.name,
      nameJa: opt.nameJa,
      description: opt.description,
      descriptionJa: opt.descriptionJa,
      image: opt.afterImage || opt.thumbnail || '/images/post-processing/default.png',
      priceMultiplier: opt.priceMultiplier,
      features: opt.features,
      featuresJa: opt.featuresJa,
      compatibleWith: opt.compatibleWith
    })),
    []
  )

  // Filter and sort options
  const filteredAndSortedOptions = useMemo(() => {
    if (variant === 'classic') {
      return postProcessingOptions.filter(option =>
        option.compatibleWith.includes(selectedProductType)
      )
    }

    let options = processingOptionsConfig

    if (showOnlyCompatible) {
      options = getProcessingOptionsByCompatibility(selectedProductType)
    }

    if (selectedCategory !== 'all') {
      options = options.filter(option => option.category === selectedCategory)
    }

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

    options.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return language === 'ja' ? a.nameJa.localeCompare(b.nameJa) : a.name.localeCompare(b.name)
        case 'price':
          return a.priceMultiplier - b.priceMultiplier
        case 'popularity':
          const aScore = (a.priceMultiplier - 1) * 10 + a.features.length
          const bScore = (b.priceMultiplier - 1) * 10 + b.features.length
          return bScore - aScore
        default:
          return 0
      }
    })

    return options
  }, [selectedProductType, selectedCategory, searchQuery, sortBy, showOnlyCompatible, language, variant, postProcessingOptions])

  const compatibleOptions = useMemo(() =>
    postProcessingOptions.filter(option =>
      option.compatibleWith.includes(selectedProductType)
    ),
    [postProcessingOptions, selectedProductType]
  )

  const currentOption = compatibleOptions[currentIndex]

  // Calculate processing impact
  const processingImpact = useMemo(() => {
    return calculateProcessingImpact(selectedOptions)
  }, [selectedOptions])

  // Update price when selection changes
  useEffect(() => {
    onPriceUpdate(processingImpact.multiplier)
  }, [processingImpact.multiplier, onPriceUpdate])

  // Helper function to handle mutually exclusive options
  const getMutuallyExclusiveOptions = useCallback((optionId: string): string[] => {
    const exclusiveGroups: Record<string, string[]> = {
      'hang-hole-6mm': ['hang-hole-8mm', 'hang-hole-no'],
      'hang-hole-8mm': ['hang-hole-6mm', 'hang-hole-no'],
      'hang-hole-no': ['hang-hole-6mm', 'hang-hole-8mm'],
      'zipper-position-any': ['zipper-position-specified'],
      'zipper-position-specified': ['zipper-position-any'],
      'corner-round': ['corner-square'],
      'corner-square': ['corner-round'],
      'glossy': ['matte'],
      'matte': ['glossy'],
      'notch-yes': ['notch-no', 'notch-straight'],
      'notch-no': ['notch-yes', 'notch-straight'],
      'notch-straight': ['notch-yes', 'notch-no'],
      'valve-yes': ['valve-no'],
      'valve-no': ['valve-yes'],
      'top-open': ['bottom-open'],
      'bottom-open': ['top-open'],
      'sealing-width-5mm': ['sealing-width-7-5mm', 'sealing-width-10mm'],
      'sealing-width-7-5mm': ['sealing-width-5mm', 'sealing-width-10mm'],
      'sealing-width-10mm': ['sealing-width-5mm', 'sealing-width-7-5mm'],
      'machi-printing-no': ['machi-printing-yes'],
      'machi-printing-yes': ['machi-printing-no']
    }
    return exclusiveGroups[optionId] || []
  }, [])

  // Memoize toggle option callback with mutual exclusivity
  const toggleOption = useCallback((optionId: string) => {
    let newOptions: string[]

    if (selectedOptions.includes(optionId)) {
      newOptions = selectedOptions.filter(id => id !== optionId)
    } else {
      const exclusiveOptions = getMutuallyExclusiveOptions(optionId)
      newOptions = [
        ...selectedOptions.filter(id => !exclusiveOptions.includes(id)),
        optionId
      ]
    }

    onOptionsChange(newOptions)

    // Calculate new price multiplier
    const multiplier = 1 + compatibleOptions
      .filter(opt => newOptions.includes(opt.id))
      .reduce((total, opt) => total + (opt.priceMultiplier - 1), 0)

    onPriceUpdate(multiplier)
  }, [selectedOptions, compatibleOptions, onOptionsChange, onPriceUpdate, getMutuallyExclusiveOptions])

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

  // Navigation callbacks with bounds checking
  const nextOption = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % compatibleOptions.length)
  }, [compatibleOptions.length])

  const prevOption = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + compatibleOptions.length) % compatibleOptions.length)
  }, [compatibleOptions.length])

  // Image loading optimization
  const handleImageLoad = useCallback((optionId: string) => {
    setImageLoading(prev => ({ ...prev, [optionId]: false }))
  }, [])

  const handleImageError = useCallback((optionId: string) => {
    setImageLoading(prev => ({ ...prev, [optionId]: false }))
  }, [])

  // Modal handlers
  const openModal = useCallback((option: PostProcessingOption) => {
    setSelectedModalOption(option)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedModalOption(null)
  }, [])

  // Preview handlers
  const handlePreview = useCallback((option: ProcessingOptionConfig) => {
    setPreviewOption(option)
  }, [])

  const closePreview = useCallback(() => {
    setPreviewOption(null)
  }, [])

  // Empty state
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
          {variant !== 'classic' && (
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
          )}
        </CardContent>
      </Card>
    )
  }

  // Classic variant render
  if (variant === 'classic') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-brixa-100 text-brixa-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Settings className="w-4 h-4" />
              <span>{language === 'ja' ? '後加工オプション' : 'Post-Processing Options'}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {language === 'ja' ? '仕上げ加工をお選びください' : 'Select Finishing Options'}
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'ja'
                ? '製品の機能性と魅力を向上させる後加工オプションをお選びいただけます'
                : 'Enhance your product functionality and appeal with post-processing options'}
            </p>
          </div>
        </MotionWrapper>

        {/* Preview Toggle */}
        <MotionWrapper delay={0.2}>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPreview
                ? (language === 'ja' ? 'プレビューを隠す' : 'Hide Preview')
                : (language === 'ja' ? 'プレビューを表示' : 'Show Preview')
              }</span>
            </Button>
          </div>
        </MotionWrapper>

        {showPreview && currentOption && (
          <MotionWrapper delay={0.3}>
            <Card className="overflow-hidden border-2 border-brixa-200">
              <CardHeader className="bg-gradient-to-r from-brixa-50 to-brixa-100">
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {language === 'ja' ? currentOption.nameJa : currentOption.name}
                    </h4>
                    <p className="text-gray-600 mt-1">
                      {language === 'ja' ? currentOption.descriptionJa : currentOption.description}
                    </p>
                  </div>
                  <Badge variant="metallic" className="text-sm">
                    {language === 'ja' ? '価格x' : 'Price'} {currentOption.priceMultiplier.toFixed(2)}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image with Navigation */}
                  <div className="relative group">
                    <div className="relative overflow-hidden rounded-lg">
                      {imageLoading[currentOption.id] !== false && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <img
                        src={currentOption.image}
                        alt={language === 'ja' ? currentOption.nameJa : currentOption.name}
                        className="w-full h-48 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onLoad={() => handleImageLoad(currentOption.id)}
                        onError={(e) => {
                          handleImageError(currentOption.id)
                          e.currentTarget.src = '/images/products/stand-pouch.jpg'
                        }}
                        style={{ opacity: imageLoading[currentOption.id] === false ? 1 : 0 }}
                      />
                    </div>

                    <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={prevOption}
                        className="bg-white/90 hover:bg-white shadow-lg"
                        disabled={compatibleOptions.length <= 1}
                        aria-label={language === 'ja' ? '前のオプション' : 'Previous option'}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={nextOption}
                        className="bg-white/90 hover:bg-white shadow-lg"
                        disabled={compatibleOptions.length <= 1}
                        aria-label={language === 'ja' ? '次のオプション' : 'Next option'}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="flex space-x-1 bg-black/30 px-2 py-1 rounded-full">
                        {compatibleOptions.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => openModal(currentOption)}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      aria-label={language === 'ja' ? '詳細を表示' : 'View details'}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">
                        {language === 'ja' ? '主な特徴' : 'Key Features'}
                      </h5>
                      <div className="space-y-2">
                        {(language === 'ja' ? currentOption.featuresJa : currentOption.features).map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">
                        {language === 'ja' ? '対応製品タイプ' : 'Compatible Product Types'}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {currentOption.compatibleWith.map((type, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionWrapper>
        )}

        {/* Option Selection with Tooltips */}
        <MotionWrapper delay={0.4}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compatibleOptions.map((option) => {
              const isSelected = selectedOptions.includes(option.id)
              const hasTooltip = tooltipData[option.id]
              const isHovered = hoveredOption === option.id
              const exclusiveOptions = getMutuallyExclusiveOptions(option.id)
              const hasConflicts = exclusiveOptions.some(opt => selectedOptions.includes(opt))

              return (
                <div key={option.id} className="relative">
                  {hasConflicts && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                        {language === 'ja' ? '競合' : 'Conflict'}
                      </div>
                    </div>
                  )}
                  <Card
                    className={`cursor-pointer transition-all duration-300 border-2 group ${
                      isSelected
                        ? 'border-brixa-500 bg-brixa-50/50 shadow-md'
                        : hasConflicts
                        ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
                        : 'border-gray-200 hover:border-brixa-300 hover:shadow-lg hover:-translate-y-1'
                    }`}
                    onClick={() => toggleOption(option.id)}
                    onMouseEnter={() => setHoveredOption(option.id)}
                    onMouseLeave={() => setHoveredOption(null)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isSelected ? 'bg-brixa-600 text-white scale-110' :
                            hasConflicts ? 'bg-amber-500 text-white' :
                            'bg-gray-100 text-gray-600 group-hover:bg-brixa-100'
                          }`}>
                            <Zap className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-brixa-700 transition-colors">
                              {language === 'ja' ? option.nameJa : option.name}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {language === 'ja' ? option.descriptionJa : option.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {hasTooltip && (
                            <div className="relative">
                              <AlertCircle className="w-4 h-4 text-gray-400 group-hover:text-brixa-600 transition-colors" />
                            </div>
                          )}
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-brixa-600 animate-scale-in" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={isSelected ? "metallic" : hasConflicts ? "warning" : "outline"} className="text-xs">
                            x{option.priceMultiplier.toFixed(2)}
                          </Badge>
                          {option.priceMultiplier > 1.0 && (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          )}
                        </div>

                        <span className={`text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                          isSelected
                            ? 'bg-brixa-100 text-brixa-700'
                            : hasConflicts
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-brixa-50 group-hover:text-brixa-700'
                        }`}>
                          {isSelected
                            ? (language === 'ja' ? '選択済み' : 'Selected')
                            : hasConflicts
                            ? (language === 'ja' ? '排他選択' : 'Exclusive')
                            : (language === 'ja' ? 'クリックして選択' : 'Click to select')
                          }
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tooltip */}
                  {hasTooltip && isHovered && (
                    <div className="absolute z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-xl -top-2 left-full ml-2 animate-fade-in">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">
                          {language === 'ja' ? tooltipData[option.id].titleJa : tooltipData[option.id].title}
                        </h5>
                        <Badge variant="outline" className="text-xs">
                          x{option.priceMultiplier.toFixed(2)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {language === 'ja' ? tooltipData[option.id].contentJa : tooltipData[option.id].content}
                      </p>

                      <div className="space-y-2">
                        <div>
                          <h6 className="text-xs font-semibold text-gray-700 mb-1">
                            {language === 'ja' ? '主な利点' : 'Key Benefits'}
                          </h6>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {(language === 'ja' ? tooltipData[option.id].benefitsJa : tooltipData[option.id].benefits).map((benefit, idx) => (
                              <li key={idx} className="flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h6 className="text-xs font-semibold text-gray-700 mb-1">
                            {language === 'ja' ? '主な用途' : 'Applications'}
                          </h6>
                          <div className="flex flex-wrap gap-1">
                            {(language === 'ja' ? tooltipData[option.id].applicationsJa : tooltipData[option.id].applications).map((app, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {app}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </MotionWrapper>

        {/* Selected Options Summary */}
        {selectedOptions.length > 0 && (
          <MotionWrapper delay={0.5}>
            <Card className="bg-gradient-to-r from-brixa-50 to-brixa-100 border-brixa-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {language === 'ja' ? '選択された後加工オプション' : 'Selected Post-Processing'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedOptions.length} {language === 'ja' ? '個のオプション' : 'options'} selected
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllSelections}
                  >
                    {language === 'ja' ? 'すべてクリア' : 'Clear All'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </MotionWrapper>
        )}

        {/* Detailed Option Modal */}
        {selectedModalOption && (
          <DetailedOptionModal
            option={selectedModalOption}
            onClose={closeModal}
            language={language}
          />
        )}
      </div>
    )
  }

  // Enhanced variant render (full/compact/minimal)
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
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {filteredAndSortedOptions.map((option) => {
            const isSelected = selectedOptions.includes(option.id)
            const categoryInfo = getProcessingCategories.find(cat => cat.id === option.category)

            return (
              <ProcessingPreviewTrigger
                key={option.id}
                option={option}
                isSelected={isSelected}
                onToggle={toggleOption}
                onPreview={(optionId) => {
                  const opt = processingOptionsConfig.find(o => o.id === optionId)
                  if (opt) handlePreview(opt)
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

export default UnifiedPostProcessingPreview
