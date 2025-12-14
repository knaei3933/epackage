'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  Package,
  TrendingUp,
  Info,
  Settings,
  Layers,
  DollarSign,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Mail,
  Star,
  Award,
  Zap,
  ChevronRight,
  HelpCircle,
  Plus,
  Minus,
  User,
  Phone,
  X,
  Send,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { CurrencyBadge } from '@/components/ui/Badge'
import { PostProcessingPreview } from '@/components/quote/PostProcessingPreview'
import { DataTemplateGuide } from '@/components/quote/DataTemplateGuide'
import Link from 'next/link'

// Form validation schema
const quoteSchema = z.object({
  name: z.string().min(1, 'お名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().min(1, '電話番号を入力してください'),
  company: z.string().optional(),
  projectDetails: z.string().optional(),
  consent: z.boolean().refine(val => val === true, '個人情報の取り扱いに同意が必要です')
})

type QuoteFormData = z.infer<typeof quoteSchema>

interface EnhancedPriceResult {
  unitPrice: number
  totalPrice: number
  setupCost: number
  totalCost: number
  savings: number
  savingsRate: number
  priceBreak: string
  leadTime: number
  recommendedQuantity: number
  priceTrend: 'increasing' | 'decreasing' | 'stable'
  bulkDiscount: number
  roi: {
    paybackPeriod: number
    totalSavings: number
    efficiency: number
  }
  recommendations: string[]
  postProcessingOptions: string[]
}

interface MaterialOption {
  id: string
  name: string
  nameJa: string
  description: string
  descriptionJa: string
  multiplier: number
  features: string[]
  featuresJa: string[]
  popular?: boolean
  ecoFriendly?: boolean
}

interface PrintingOption {
  id: string
  name: string
  nameJa: string
  description: string
  descriptionJa: string
  costPerUnit: number
  setupCost: number
  features: string[]
  featuresJa: string[]
}

const productTypes = [
  { value: 'stand_up', label: 'スタンディングパウチ', description: '底マチ付きで安定性が高い' },
  { value: 'flat_3_side', label: '三方シール平袋', description: 'コスト効率に優れた基本形状' },
  { value: 'flat_with_zip', label: 'チャック付き平袋', description: '反復使用可能な便利な形状' },
  { value: 'gusset', label: 'ガゼットパウチ', description: '容量拡張可能な大型対応' },
  { value: 'box', label: 'BOX型パウチ', description: '立体形状で高級感を演出' },
  { value: 'soft_pouch', label: 'ソフトパウチ', description: '柔軟性の高い液体向け' },
  { value: 'special', label: '特殊仕様', description: '完全オーダーメイド対応' }
]

const materialOptions: MaterialOption[] = [
  {
    id: 'economy',
    name: 'Economy PET',
    nameJa: 'エコノミーPET',
    description: 'Cost-effective basic PET material',
    descriptionJa: 'コスト重視の基本PET素材',
    multiplier: 0.9,
    features: ['Standard barrier', 'Good clarity', 'Cost effective'],
    featuresJa: ['標準バリア性', '優れた透明性', 'コストパフォーマンス'],
    popular: false,
    ecoFriendly: false
  },
  {
    id: 'standard',
    name: 'Standard PET',
    nameJa: 'スタンダードPET',
    description: 'Balanced performance and cost',
    descriptionJa: 'バランスの取れた性能とコスト',
    multiplier: 1.0,
    features: ['Enhanced barrier', 'Good sealability', 'Wide compatibility'],
    featuresJa: ['強化バリア性', '優れた密封性', '広い互換性'],
    popular: true,
    ecoFriendly: false
  },
  {
    id: 'premium',
    name: 'Premium Multi-layer',
    nameJa: 'プレミアム多层',
    description: 'High-performance multi-layer structure',
    descriptionJa: '高性能多层構造',
    multiplier: 1.3,
    features: ['Maximum barrier', 'Extended shelf life', 'Premium appearance'],
    featuresJa: ['最大バリア性', '延長された賞味期限', 'プレミアム外観'],
    popular: false,
    ecoFriendly: true
  }
]

const printingOptions: PrintingOption[] = [
  {
    id: 'none',
    name: 'No Printing',
    nameJa: '印刷なし',
    description: 'Plain pouch without printing',
    descriptionJa: '印刷なしの無地パウチ',
    costPerUnit: 0,
    setupCost: 0,
    features: ['Lowest cost', 'Quick delivery'],
    featuresJa: ['最低コスト', '迅速な納品']
  },
  {
    id: 'spot',
    name: 'Spot Color',
    nameJa: 'スポットカラー',
    description: '1-2 color spot printing',
    descriptionJa: '1〜2色のスポット印刷',
    costPerUnit: 0.05,
    setupCost: 50000,
    features: ['Cost effective', 'Brand identity', 'Simple design'],
    featuresJa: ['コスト効率', 'ブランドアイデンティティ', 'シンプルなデザイン']
  },
  {
    id: 'full',
    name: 'Full Color',
    nameJa: 'フルカラー',
    description: 'CMYK full color printing',
    descriptionJa: 'CMYKフルカラー印刷',
    costPerUnit: 0.12,
    setupCost: 100000,
    features: ['Photo quality', 'Complex design', 'Marketing impact'],
    featuresJa: ['写真品質', '複雑なデザイン', 'マーケティング効果']
  }
]

const quantityOptions = [
  { value: 'small', label: '小ロット', range: '1,000〜5,000枚', basePrice: 50, multiplier: 1.2 },
  { value: 'medium', label: '中ロット', range: '5,001〜20,000枚', basePrice: 35, multiplier: 1.0 },
  { value: 'large', label: '大ロット', range: '20,001〜50,000枚', basePrice: 25, multiplier: 0.85 },
  { value: 'enterprise', label: 'エンタープライズ', range: '50,001枚以上', basePrice: 20, multiplier: 0.75 }
]

const sizeOptions = [
  { value: 'small', label: '小サイズ', multiplier: 1.0, example: '100x150mm' },
  { value: 'medium', label: '中サイズ', multiplier: 1.3, example: '150x200mm' },
  { value: 'large', label: '大サイズ', multiplier: 1.8, example: '200x300mm' },
  { value: 'xl', label: '特大サイズ', multiplier: 2.5, example: '300x400mm' }
]

export function EnhancedQuoteSimulator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [priceResult, setPriceResult] = useState<EnhancedPriceResult | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    productType: '',
    quantity: '',
    size: '',
    material: '',
    printing: '',
    timeline: 'standard'
  })

  const [selectedPostProcessing, setSelectedPostProcessing] = useState<string[]>([])
  const [postProcessingMultiplier, setPostProcessingMultiplier] = useState(1.0)

  // React Hook Form for contact info
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset: resetForm
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      projectDetails: '',
      consent: false
    }
  })

  const calculateEnhancedPrice = async () => {
    setIsCalculating(true)

    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const quantityOption = quantityOptions.find(q => q.value === formData.quantity)
    const sizeOption = sizeOptions.find(s => s.value === formData.size)
    const materialOption = materialOptions.find(m => m.id === formData.material)
    const printingOption = printingOptions.find(p => p.id === formData.printing)

    if (!quantityOption || !sizeOption || !materialOption || !printingOption) {
      setIsCalculating(false)
      return
    }

    // Base calculation
    const basePrice = quantityOption.basePrice
    const sizeMultiplier = sizeOption.multiplier
    const materialMultiplier = materialOption.multiplier
    const printingCost = printingOption.costPerUnit
    const printingSetup = printingOption.setupCost
    const timelineMultiplier = formData.timeline === 'urgent' ? 1.4 : formData.timeline === 'express' ? 1.2 : 1.0

    const baseUnitPrice = basePrice * sizeMultiplier * materialMultiplier * timelineMultiplier
    const unitPrice = (baseUnitPrice + printingCost) * postProcessingMultiplier
    const quantity = parseInt(formData.quantity) ? parseInt(formData.quantity) : 1000

    const totalPrice = unitPrice * quantity
    const setupCost = printingSetup * postProcessingMultiplier
    const totalCost = totalPrice + setupCost

    // Calculate savings
    const standardTotal = quantityOption.basePrice * sizeMultiplier * quantity + printingSetup
    const savings = Math.max(0, standardTotal - totalCost)
    const savingsRate = (savings / standardTotal) * 100

    // Calculate ROI
    const monthlySavings = savings * 12 / quantity
    const paybackPeriod = totalCost / monthlySavings
    const efficiency = materialOption.ecoFriendly ? 15 : 0

    // Generate recommendations
    const recommendations = []

    if (formData.quantity === 'small') {
      recommendations.push('中ロット生産で単価を20%削減し、ROIを向上させましょう')
    }

    if (formData.material === 'standard' && formData.quantity === 'large') {
      recommendations.push('エコノミー素材でコストを削減し、環境に配慮した製品を')
    }

    if (selectedPostProcessing.length > 0) {
      recommendations.push(`選択された後加工オプションで製品価値が向上し、顧客満足度を改善`)
    }

    const result: EnhancedPriceResult = {
      unitPrice: Math.round(unitPrice * 10) / 10,
      totalPrice: Math.round(totalPrice),
      setupCost: Math.round(setupCost),
      totalCost: Math.round(totalCost),
      savings: Math.round(savings),
      savingsRate: Math.round(savingsRate * 10) / 10,
      priceBreak: quantityOption.range,
      leadTime: formData.timeline === 'urgent' ? 7 : formData.timeline === 'express' ? 14 : 21,
      recommendedQuantity: quantity * 1.5,
      priceTrend: formData.quantity === 'small' ? 'decreasing' : formData.quantity === 'enterprise' ? 'stable' : 'increasing',
      bulkDiscount: Math.round((1 - quantityOption.multiplier) * 100),
      roi: {
        paybackPeriod: Math.round(paybackPeriod * 10) / 10,
        totalSavings: Math.round(monthlySavings * 12),
        efficiency: efficiency + Math.round(savingsRate * 0.2)
      },
      recommendations,
      postProcessingOptions: selectedPostProcessing
    }

    setPriceResult(result)
    setCurrentStep(5)
    setIsCalculating(false)
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetQuoteForm = () => {
    setFormData({
      productType: '',
      quantity: '',
      size: '',
      material: '',
      printing: '',
      timeline: 'standard'
    })
    setPriceResult(null)
    setSelectedPostProcessing([])
    setPostProcessingMultiplier(1.0)
    setCurrentStep(1)
    resetForm()
  }

  const onSubmitContact = async (data: QuoteFormData) => {
    // Here you would send the data to your backend
    console.log('Quote submission:', { ...data, ...formData, ...priceResult })
    // Handle submission logic
  }

  return (
    <section className="py-20 bg-gradient-to-br from-brixa-50 via-white to-navy-50">
      <Container size="4xl">
        {/* Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-brixa-600 to-navy-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Calculator className="w-4 h-4" />
              <span>AI強化見積もりシミュレーター</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              30秒でわかる包装材費用
              <span className="block text-brixa-600 mt-2">ROI分析付き正確なお見積もり</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              製品仕様を入力するだけで、最適な価格とROIを算出します。
              AIによるコスト削減提案と投資効果分析を含む完全なソリューション。
            </p>
          </div>
        </MotionWrapper>

        {/* Progress Bar */}
        <MotionWrapper delay={0.2}>
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-brixa-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep >= 1 ? 'bg-brixa-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="text-sm font-medium">基本仕様</span>
              </div>
              <div className={`w-16 h-1 rounded ${currentStep >= 2 ? 'bg-brixa-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-brixa-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep >= 2 ? 'bg-brixa-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="text-sm font-medium">詳細設定</span>
              </div>
              <div className={`w-16 h-1 rounded ${currentStep >= 3 ? 'bg-brixa-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-brixa-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep >= 3 ? 'bg-brixa-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="text-sm font-medium">後加工オプション</span>
              </div>
              <div className={`w-16 h-1 rounded ${currentStep >= 4 ? 'bg-brixa-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center space-x-2 ${currentStep >= 4 ? 'text-brixa-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep >= 4 ? 'bg-brixa-600 text-white' : 'bg-gray-200'}`}>
                  4
                </div>
                <span className="text-sm font-medium">お客様情報</span>
              </div>
              <div className={`w-16 h-1 rounded ${currentStep >= 5 ? 'bg-brixa-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center space-x-2 ${currentStep >= 5 ? 'text-brixa-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep >= 5 ? 'bg-brixa-600 text-white' : 'bg-gray-200'}`}>
                  5
                </div>
                <span className="text-sm font-medium">結果とROI分析</span>
              </div>
            </div>
          </div>
        </MotionWrapper>

        {/* Data Template Preparation Section */}
        <MotionWrapper delay={0.25}>
          <Card className="p-6 mb-8 bg-gradient-to-r from-navy-50 to-navy-100 border-navy-600">
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-navy-600 text-navy-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Settings className="w-4 h-4" />
                  <span>見積もり前の準備</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  デザインテンプレートで準備を整えましょう
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  正確なお見積りのため、製品タイプに合ったデザインテンプレートをダウンロードして、
                  デザインデータをご準備ください
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Download className="w-6 h-6 text-navy-700" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">テンプレートをダウンロード</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    製品タイプに合ったプロ仕様テンプレート
                  </p>
                  <Link href="/data-templates">
                    <Button variant="outline" size="sm" className="w-full">
                      テンプレートを見る
                    </Button>
                  </Link>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HelpCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">デザインサポート</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    プロのデザイナーが完成データを作成
                  </p>
                  <Link href="/contact">
                    <Button variant="outline" size="sm" className="w-full">
                      サポートを依頼
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionWrapper>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Basic Specifications */}
          {currentStep === 1 && (
            <MotionWrapper delay={0.3}>
              <Card className="p-8">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    ステップ1：基本仕様を選択
                  </CardTitle>
                  <p className="text-gray-600">
                    まず製品の基本仕様を選択してください
                  </p>
                </CardHeader>

                <CardContent className="space-y-8">
                  {/* Product Type */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      製品タイプ <span className="text-red-500">*</span>
                    </label>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {productTypes.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleInputChange('productType', option.value)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            formData.productType === option.value
                              ? 'border-brixa-600 bg-brixa-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-semibold text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      生産数量 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {quantityOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleInputChange('quantity', option.value)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            formData.quantity === option.value
                              ? 'border-brixa-600 bg-brixa-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-semibold text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600 mt-1">{option.range}</div>
                          <Badge variant="outline" className="mt-2 text-xs">
                            x{option.multiplier.toFixed(2)}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      サイズ <span className="text-red-500">*</span>
                    </label>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {sizeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleInputChange('size', option.value)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            formData.size === option.value
                              ? 'border-brixa-600 bg-brixa-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-semibold text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600 mt-1">{option.example}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-end pt-6">
                    <Button
                      variant="primary"
                      onClick={nextStep}
                      disabled={!formData.productType || !formData.quantity || !formData.size}
                      className="px-8"
                    >
                      次へ進む
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </MotionWrapper>
          )}

          {/* Step 2: Detailed Settings */}
          {currentStep === 2 && (
            <MotionWrapper delay={0.3}>
              <Card className="p-8">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    ステップ2：詳細設定
                  </CardTitle>
                  <p className="text-gray-600">
                    素材、印刷、納期などの詳細を設定してください
                  </p>
                </CardHeader>

                <CardContent className="space-y-8">
                  {/* Material */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      素材仕様 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                      {materialOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleInputChange('material', option.id)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            formData.material === option.id
                              ? 'border-brixa-600 bg-brixa-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-gray-900">{option.nameJa}</div>
                            {option.popular && (
                              <Badge variant="metallic" className="text-xs">人気</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{option.descriptionJa}</div>
                          <div className="flex flex-wrap gap-1">
                            {option.featuresJa.slice(0, 2).map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              x{option.multiplier.toFixed(2)}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Printing */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      印刷仕様 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                      {printingOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleInputChange('printing', option.id)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            formData.printing === option.id
                              ? 'border-brixa-600 bg-brixa-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-semibold text-gray-900">{option.nameJa}</div>
                          <div className="text-sm text-gray-600 mt-1">{option.descriptionJa}</div>
                          <div className="mt-2">
                            <div className="text-xs text-gray-500">
                              印刷コスト: ¥{option.costPerUnit.toFixed(2)}/枚
                            </div>
                            {option.setupCost > 0 && (
                              <div className="text-xs text-gray-500">
                                セ版コスト: ¥{option.setupCost.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      納期希望 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <button
                        onClick={() => handleInputChange('timeline', 'urgent')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.timeline === 'urgent'
                            ? 'border-brixa-600 bg-brixa-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">至急</div>
                        <div className="text-sm text-gray-600 mt-1">1週間（+40%）</div>
                      </button>
                      <button
                        onClick={() => handleInputChange('timeline', 'standard')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.timeline === 'standard'
                            ? 'border-brixa-600 bg-brixa-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">標準</div>
                        <div className="text-sm text-gray-600 mt-1">2〜3週間（標準）</div>
                      </button>
                      <button
                        onClick={() => handleInputChange('timeline', 'flexible')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.timeline === 'flexible'
                            ? 'border-brixa-600 bg-brixa-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">柔軟</div>
                        <div className="text-sm text-gray-600 mt-1">3〜4週間（-10%）</div>
                      </button>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={prevStep} className="px-8">
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      戻る
                    </Button>
                    <Button variant="primary" onClick={nextStep} className="px-8">
                      次へ進む
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </MotionWrapper>
          )}

          {/* Step 3: Post-Processing Options */}
          {currentStep === 3 && formData.productType && (
            <MotionWrapper delay={0.3}>
              <PostProcessingPreview
                selectedProductType={formData.productType}
                selectedOptions={selectedPostProcessing}
                onOptionsChange={setSelectedPostProcessing}
                onPriceUpdate={setPostProcessingMultiplier}
                language="ja"
              />

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={prevStep} className="px-8">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  戻る
                </Button>
                <Button variant="primary" onClick={nextStep} className="px-8">
                  次へ進む
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </MotionWrapper>
          )}

          {/* Step 4: Contact Information */}
          {currentStep === 4 && (
            <MotionWrapper delay={0.3}>
              <Card className="p-8">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    ステップ4：お客様情報
                  </CardTitle>
                  <p className="text-gray-600">
                    お見積もり結果をメールでお送りします
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit(onSubmitContact)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          お名前 <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('name', { required: true })}
                          type="text"
                          placeholder="山田 太郎"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          メールアドレス <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('email', { required: true })}
                          type="email"
                          placeholder="taro.yamada@company.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          電話番号 <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('phone', { required: true })}
                          type="tel"
                          placeholder="03-1234-5678"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          会社名
                        </label>
                        <input
                          {...register('company')}
                          type="text"
                          placeholder="株式会社サンプル"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        プロジェクト詳細
                      </label>
                      <textarea
                        {...register('projectDetails')}
                        rows={4}
                        placeholder="製品の目的や特別なご要望など"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register('consent', { required: true })}
                        type="checkbox"
                        id="consent"
                        className="h-4 w-4 text-brixa-600 focus:ring-brixa-500 border-gray-300 rounded"
                      />
                      <label htmlFor="consent" className="ml-2 text-sm text-gray-700">
                        個人情報の取り扱いに同意します
                      </label>
                    </div>
                    {errors.consent && (
                      <p className="text-red-500 text-sm mt-1">{errors.consent.message}</p>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-6">
                      <Button variant="outline" onClick={prevStep} className="px-8">
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        戻る
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8"
                      >
                        {isSubmitting ? '送信中...' : '見積もり計算'}
                        <Calculator className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </MotionWrapper>
          )}

          {/* Step 5: Results and ROI Analysis */}
          {currentStep === 5 && priceResult && (
            <MotionWrapper delay={0.3}>
              <div className="space-y-8">
                {/* Enhanced Result Card */}
                <Card className="p-8 bg-gradient-to-br from-brixa-50 to-navy-50 border-brixa-200">
                  <CardHeader className="text-center pb-6">
                    <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium mb-4">
                      <CheckCircle className="w-5 h-5" />
                      <span>AI分析完了</span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      あなた専用のお見積もりとROI分析
                    </CardTitle>
                    <p className="text-gray-600">
                      入力された仕様に基づいた正確な費用試算と投資効果分析
                    </p>
                  </CardHeader>

                  <CardContent>
                    {/* Price Summary */}
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                      <Card className="p-6 bg-white border-gray-200">
                        <div className="text-center">
                          <CurrencyBadge
                            amount={priceResult.totalCost}
                            currency="JPY"
                            size="lg"
                            className="justify-center mb-2"
                          />
                          <p className="text-sm text-gray-600">総費用（税別）</p>
                        </div>
                      </Card>
                      <Card className="p-6 bg-white border-gray-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-2">
                            ¥{priceResult.unitPrice.toLocaleString()}
                          </div>
                          <p className="text-sm text-gray-600">単価（1枚あたり）</p>
                        </div>
                      </Card>
                      <Card className="p-6 bg-white border-gray-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            ¥{priceResult.savings.toLocaleString()}
                          </div>
                          <p className="text-sm text-gray-600">節約額</p>
                          <p className="text-xs text-green-600">({priceResult.savingsRate}%)</p>
                        </div>
                      </Card>
                      <Card className="p-6 bg-white border-gray-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-navy-700 mb-2">
                            {priceResult.leadTime}日
                          </div>
                          <p className="text-sm text-gray-600">納期</p>
                        </div>
                      </Card>
                    </div>

                    {/* ROI Analysis */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 text-navy-700 mr-2" />
                        ROI分析
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-navy-50 rounded-lg">
                          <div className="text-xl font-bold text-navy-700 mb-1">
                            {priceResult.roi.paybackPeriod}ヶ月
                          </div>
                          <p className="text-sm text-gray-600">投資回収期間</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-xl font-bold text-green-600 mb-1">
                            ¥{priceResult.roi.totalSavings.toLocaleString()}
                          </div>
                          <p className="text-sm text-gray-600">年間節約額</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-xl font-bold text-purple-600 mb-1">
                            {priceResult.roi.efficiency}%
                          </div>
                          <p className="text-sm text-gray-600">効率改善</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    {priceResult.recommendations.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          💡 AIによる最適化提案
                        </h3>
                        <div className="space-y-2">
                          {priceResult.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                              <span className="text-green-800">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Spec Summary */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">仕様概要</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">製品タイプ：</span>
                          <span className="font-medium text-gray-900 ml-2">
                            {productTypes.find(p => p.value === formData.productType)?.label}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">生産数量：</span>
                          <span className="font-medium text-gray-900 ml-2">
                            {quantityOptions.find(q => q.value === formData.quantity)?.label}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">素材：</span>
                          <span className="font-medium text-gray-900 ml-2">
                            {materialOptions.find(m => m.id === formData.material)?.nameJa}
                          </span>
                        </div>
                        {priceResult.postProcessingOptions.length > 0 && (
                          <div className="col-span-3">
                            <span className="text-gray-600">後加工オプション：</span>
                            <span className="font-medium text-gray-900 ml-2">
                              {priceResult.postProcessingOptions.length}個選択済み
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA Section */}
                <Card className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    詳細見積もりと専門相談
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    この試算結果を基に、専門家がより詳細なお見積もりを作成します。
                    最適なソリューションをご提案させてください。
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact">
                      <Button variant="primary" size="lg" className="justify-center px-8">
                        <Mail className="mr-2 h-5 w-5" />
                        詳細見積もり依頼
                      </Button>
                    </Link>
                    <Button variant="outline" size="lg" onClick={resetQuoteForm} className="justify-center px-8">
                      <Calculator className="mr-2 h-5 w-5" />
                      再計算する
                    </Button>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center text-sm">
                    <a href="tel:03-1234-5678" className="flex items-center justify-center space-x-2 text-navy-700 hover:text-navy-600">
                      <Phone className="w-4 h-4" />
                      <span>03-1234-5678</span>
                    </a>
                    <a href="mailto:info@epackage-lab.com" className="flex items-center justify-center space-x-2 text-navy-700 hover:text-navy-600">
                      <Mail className="w-4 h-4" />
                      <span>info@epackage-lab.com</span>
                    </a>
                  </div>
                </Card>
              </div>
            </MotionWrapper>
          )}
        </div>
      </Container>
    </section>
  )
}