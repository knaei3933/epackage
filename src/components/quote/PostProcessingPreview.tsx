'use client'

import React, { useState, useCallback, useMemo } from 'react'
import DetailedOptionModal from './DetailedOptionModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Settings,
  CheckCircle,
  Info,
  Zap,
  Maximize2,
  AlertCircle,
  TrendingUp,
  Package
} from 'lucide-react'

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

const postProcessingOptions: PostProcessingOption[] = [
  {
    id: 'zipper-yes',
    name: 'With Zipper',
    nameJa: 'ジッパー付き',
    description: 'Resealable zipper for multiple uses',
    descriptionJa: '再利用可能なジッパー付き',
    image: '/images/post-processing/1.지퍼 있음.png',
    priceMultiplier: 1.15,
    features: ['Resealable', 'Freshness preservation', 'Consumer friendly'],
    featuresJa: ['再封可能', '鮮度保持', '消費者に優しい'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset']
  },
  {
    id: 'zipper-no',
    name: 'Without Zipper',
    nameJa: 'ジッパーなし',
    description: 'Standard sealed top for single use',
    descriptionJa: '一回使用のシールトップ',
    image: '/images/post-processing/1.지퍼 없음.png',
    priceMultiplier: 1.00,
    features: ['Simple seal', 'Cost effective', 'Secure closure'],
    featuresJa: ['シンプルなシール', 'コスト効率', '安全な閉鎖'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset']
  },
  {
    id: 'zipper-position-any',
    name: 'Zipper Position: Any',
    nameJa: 'ジッパー位置: お任せ',
    description: 'Manufacturer determines optimal zipper placement',
    descriptionJa: 'メーカーが最適なジッパー位置を決定',
    image: '/images/post-processing/1.지퍼 있음.png',
    priceMultiplier: 1.15,
    features: ['Optimal placement', 'Cost efficient', 'Professional decision'],
    featuresJa: ['最適な配置', 'コスト効率', 'プロの判断'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset']
  },
  {
    id: 'zipper-position-specified',
    name: 'Zipper Position: Specified',
    nameJa: 'ジッパー位置: 指定',
    description: 'Customer specifies exact zipper position',
    descriptionJa: 'お客様がジッパーの正確な位置を指定',
    image: '/images/post-processing/1.지퍼 있음.png',
    priceMultiplier: 1.18,
    features: ['Custom placement', 'Customer control', 'Precise positioning'],
    featuresJa: ['カスタム配置', '顧客コントロール', '正確な位置決め'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset']
  },
  {
    id: 'glossy',
    name: 'Glossy Finish',
    nameJa: '光沢仕上げ',
    description: 'High-gloss premium finish',
    descriptionJa: '高光沢のプレミアム仕上げ',
    image: '/images/post-processing/2.유광.png',
    priceMultiplier: 1.08,
    features: ['Premium look', 'Vibrant colors', 'Professional appearance'],
    featuresJa: ['プレミアム外観', '鮮やかな色彩', 'プロフェッショナルな見た目'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset']
  },
  {
    id: 'matte',
    name: 'Matte Finish',
    nameJa: 'マット仕上げ',
    description: 'Elegant non-glossy surface',
    descriptionJa: '光沢のないエレガントな表面',
    image: '/images/post-processing/2.무광.png',
    priceMultiplier: 1.05,
    features: ['Elegant appearance', 'Reduced glare', 'Sophisticated look'],
    featuresJa: ['エレガントな外観', 'グレア軽減', '洗練された見た目'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset']
  },
  {
    id: 'notch-yes',
    name: 'With Notch',
    nameJa: 'ノッチ付き',
    description: 'Easy-tear notch for convenient opening',
    descriptionJa: '開封しやすいノッチ付き',
    image: '/images/post-processing/3.노치 있음.png',
    priceMultiplier: 1.03,
    features: ['Easy opening', 'No tools required', 'Clean tear'],
    featuresJa: ['簡単な開封', '工具不要', 'きれいな切断'],
    compatibleWith: ['stand_up', 'flat_3_side', 'flat_with_zip', 'gusset']
  },
  {
    id: 'notch-no',
    name: 'Without Notch',
    nameJa: 'ノッチなし',
    description: 'Clean edge without tear notch',
    descriptionJa: 'ノッチなしのクリーンエッジ',
    image: '/images/post-processing/3.노치 없음.png',
    priceMultiplier: 1.00,
    features: ['Clean design', 'Simple edge', 'Standard finish'],
    featuresJa: ['クリーンなデザイン', 'シンプルなエッジ', '標準仕上げ'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset']
  },
  {
    id: 'hang-hole-6mm',
    name: '6mm Hang Hole',
    nameJa: '吊り下げ穴 (6mm)',
    description: 'Small 6mm hanging hole for light products',
    descriptionJa: '軽量製品用の6mm小さな吊り穴',
    image: '/images/post-processing/4.걸이타공 있음.png',
    priceMultiplier: 1.03,
    features: ['Small size', 'Light products', 'Precise hanging'],
    featuresJa: ['小さいサイズ', '軽量製品', '正確な吊り'],
    compatibleWith: ['stand_up', 'flat_3_side', 'soft_pouch']
  },
  {
    id: 'hang-hole-8mm',
    name: '8mm Hang Hole',
    nameJa: '吊り下げ穴 (8mm)',
    description: 'Large 8mm hanging hole for standard products',
    descriptionJa: '標準製品用の8mm大きな吊り穴',
    image: '/images/post-processing/4.걸이타공 있음.png',
    priceMultiplier: 1.04,
    features: ['Standard size', 'Versatile use', 'Easy hanging'],
    featuresJa: ['標準サイズ', '多用途', '簡単な吊り'],
    compatibleWith: ['stand_up', 'flat_3_side', 'soft_pouch']
  },
  {
    id: 'hang-hole-no',
    name: 'Without Hang Hole',
    nameJa: '吊り穴なし',
    description: 'No hanging hole - clean design',
    descriptionJa: '吊り穴なしのクリーンなデザイン',
    image: '/images/post-processing/4.걸이타공 없음.png',
    priceMultiplier: 1.00,
    features: ['Clean appearance', 'Simple design', 'Standard finish'],
    featuresJa: ['クリーンな外観', 'シンプルなデザイン', '標準仕上げ'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset']
  },
  {
    id: 'corner-round',
    name: 'Rounded Corner',
    nameJa: '角丸',
    description: 'Safe and modern rounded corners',
    descriptionJa: '安全でモダンな角丸加工',
    image: '/images/post-processing/5.모서리_둥근.png',
    priceMultiplier: 1.06,
    features: ['Safe handling', 'Modern look', 'User friendly'],
    featuresJa: ['安全な取り扱い', 'モダンな外観', 'ユーザーフレンドリー'],
    compatibleWith: ['stand_up', 'flat_3_side', 'soft_pouch']
  },
  {
    id: 'corner-square',
    name: 'Square Corner',
    nameJa: '角直角',
    description: 'Traditional square corner design',
    descriptionJa: '伝統的な直角デザイン',
    image: '/images/post-processing/5.모서리_직각.png',
    priceMultiplier: 1.00,
    features: ['Traditional look', 'Maximum space', 'Classic design'],
    featuresJa: ['伝統的な外観', '最大スペース', 'クラシックデザイン'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset']
  },
  {
    id: 'valve-yes',
    name: 'With Degassing Valve',
    nameJa: 'バルブ付き',
    description: 'One-way valve for fresh coffee products',
    descriptionJa: 'コーヒー製品用の一方弁付き',
    image: '/images/post-processing/밸브 있음.png',
    priceMultiplier: 1.08,
    features: ['Extends shelf life', 'Preserves aroma', 'Prevents bag bloating'],
    featuresJa: ['賞味期限延長', '香り保持', '袋膨張防止'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset']
  },
  {
    id: 'valve-no',
    name: 'Without Valve',
    nameJa: 'バルブなし',
    description: 'Standard pouch without degassing valve',
    descriptionJa: 'バルブなしの標準パウチ',
    image: '/images/post-processing/밸브 없음.png',
    priceMultiplier: 1.00,
    features: ['Simple construction', 'Cost effective', 'Standard design'],
    featuresJa: ['シンプルな構造', 'コスト効率', '標準デザイン'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset']
  },
  {
    id: 'top-open',
    name: 'Top Opening',
    nameJa: '上端開封',
    description: 'Easy open top seal for convenient access',
    descriptionJa: '使いやすい上端開封シール',
    image: '/images/post-processing/6.상단 오픈.png',
    priceMultiplier: 1.02,
    features: ['Easy access', 'Convenient dispensing', 'User friendly'],
    featuresJa: ['アクセスしやすい', '便利な分配', 'ユーザーフレンドリー'],
    compatibleWith: ['stand_up', 'flat_3_side', 'gusset', 'flat_with_zip']
  },
  {
    id: 'bottom-open',
    name: 'Bottom Opening',
    nameJa: '下端開封',
    description: 'Bottom opening for complete product dispensing',
    descriptionJa: '製品を完全に排出する下端開封',
    image: '/images/post-processing/6.하단 오픈.png',
    priceMultiplier: 1.03,
    features: ['Complete emptying', 'No waste', 'Industrial use'],
    featuresJa: ['完全な空にする', '無駄なし', '産業用途'],
    compatibleWith: ['stand_up', 'gusset', 'soft_pouch']
  }
]

interface PostProcessingPreviewProps {
  selectedProductType: string
  selectedOptions: string[]
  onOptionsChange: (options: string[]) => void
  onPriceUpdate: (multiplier: number) => void
  language?: 'en' | 'ja'
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

export function PostProcessingPreview({
  selectedProductType,
  selectedOptions,
  onOptionsChange,
  onPriceUpdate,
  language = 'ja'
}: PostProcessingPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showPreview, setShowPreview] = useState(true)
  const [selectedModalOption, setSelectedModalOption] = useState<PostProcessingOption | null>(null)
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)

  // Initialize image loading state
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}
    postProcessingOptions.forEach(option => {
      initialState[option.id] = true
    })
    return initialState
  })

  // Memoize compatible options for performance
  const compatibleOptions = useMemo(() =>
    postProcessingOptions.filter(option =>
      option.compatibleWith.includes(selectedProductType)
    ), [selectedProductType]
  )

  const currentOption = compatibleOptions[currentIndex]

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
      'notch-yes': ['notch-no'],
      'notch-no': ['notch-yes'],
      'valve-yes': ['valve-no'],
      'valve-no': ['valve-yes'],
      'top-open': ['bottom-open'],
      'bottom-open': ['top-open']
    }
    return exclusiveGroups[optionId] || []
  }, [])

  // Memoize toggle option callback with mutual exclusivity
  const toggleOption = useCallback((optionId: string) => {
    let newOptions: string[]

    if (selectedOptions.includes(optionId)) {
      // If deselecting, simply remove the option
      newOptions = selectedOptions.filter(id => id !== optionId)
    } else {
      // If selecting, remove mutually exclusive options first
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
    // Fallback to default image
  }, [])

  // Modal handlers
  const openModal = useCallback((option: PostProcessingOption) => {
    setSelectedModalOption(option)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedModalOption(null)
  }, [])

  if (compatibleOptions.length === 0) {
    return (
      <Card className="p-6 bg-gray-50 border-gray-200">
        <CardContent className="text-center">
          <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {language === 'ja' ? '選択した製品タイプでは後加工オプションは利用できません' : 'No post-processing options available for this product type'}
          </p>
        </CardContent>
      </Card>
    )
  }

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
                {/* Enhanced Image with Lazy Loading */}
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

                  {/* Enhanced Navigation */}
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

                  {/* Enhanced Page indicator */}
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

                  {/* Expand button */}
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

                  {/* Compatibility */}
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

      {/* Enhanced Option Selection with Tooltips */}
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
                  onClick={() => {
                    onOptionsChange([])
                    onPriceUpdate(1.0)
                  }}
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