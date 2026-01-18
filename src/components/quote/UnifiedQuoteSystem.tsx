'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Calculator,
  Package,
  Settings,
  Layers,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Mail,
  Star,
  Award,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Target,
  Plus,
  Minus,
  User,
  Phone,
  X,
  Send
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { CurrencyBadge } from '@/components/ui/Badge'
import { EnhancedPostProcessingPreview } from '@/components/quote/EnhancedPostProcessingPreview'
import { PostProcessingPreview } from '@/components/quote-simulator/PostProcessingPreview'
import { InteractiveQuoteSystem } from '@/components/quote/InteractiveQuoteSystem'
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

interface PriceResult {
  unitPrice: number
  totalPrice: number
  setupCost: number
  totalCost: number
  priceBreak: string
  leadTime: number
  recommendedQuantity: number
  priceTrend: 'increasing' | 'decreasing' | 'stable'
  bulkDiscount: number
  leadScore: number
  recommendations: string[]
  postProcessingOptions: string[]
  quantityQuotes?: Array<{
    quantity: number
    unitPrice: number
    totalPrice: number
    setupCost: number
    totalCost: number
    discountRate: number
    priceBreak: string
    minimumPriceApplied?: boolean
  }>
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
  thicknessOptions?: ThicknessOption[]
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

// Only 5 actual product types as per requirements
const productTypes = [
  { value: 'flat_3_side', label: '三方シール平袋', description: '基本形状のパウチ', basePrice: 15 },
  { value: 'stand_up', label: 'スタンドパウチ', description: '底マチ付きで安定性が高い', basePrice: 25 },
  { value: 'box', label: 'BOX型パウチ', description: '箱型形状で保護性に優れる', basePrice: 30 },
  { value: 'spout_pouch', label: 'スパウトパウチ', description: '液体製品に最適な注ぎ口付き', basePrice: 35 },
  { value: 'roll_film', label: 'ロールフィルム', description: '自動包装機対応のフィルム', basePrice: 8 }
]

// Thickness configuration interface
interface ThicknessOption {
  id: string
  name: string
  specification: string
  weightRange: string
  multiplier: number
}

// Complex material selection system as per requirements
const materialOptions: MaterialOption[] = [
  {
    id: 'pet_al',
    name: 'PET + アルミ箔',
    nameJa: 'PET + アルミ箔',
    description: 'High barrier with aluminum foil lamination',
    descriptionJa: 'アルミ箔ラミネートによる高バリア性',
    multiplier: 1.5,
    features: ['高バリア性能', '遮光性に優れる', '酸素透過率が低い', '長期保存に適する'],
    featuresJa: ['高バリア性能', '遮光性に優れる', '酸素透過率が低い', '長期保存に適する'],
    popular: true,
    ecoFriendly: false,
    thicknessOptions: [
      {
        id: 'light',
        name: '軽量タイプ (~100g)',
        specification: 'PET12μ+AL７μ+PET12μ+LLDPE60μ',
        weightRange: '~100g',
        multiplier: 0.9
      },
      {
        id: 'medium',
        name: '標準タイプ (~500g)',
        specification: 'PET12μ+AL７μ+PET12μ+LLDPE80μ',
        weightRange: '~500g',
        multiplier: 1.0
      },
      {
        id: 'heavy',
        name: '高耐久タイプ (~800g)',
        specification: 'PET12μ+AL７μ+PET12μ+LLDPE100μ',
        weightRange: '~800g',
        multiplier: 1.1
      },
      {
        id: 'ultra',
        name: '超耐久タイプ (800g~)',
        specification: 'PET12μ+AL７μ+PET12μ+LLDPE110μ',
        weightRange: '800g~',
        multiplier: 1.2
      }
    ]
  },
  {
    id: 'pet_vmpet',
    name: 'PET + アルミ蒸着',
    nameJa: 'PET + アルミ蒸着',
    description: 'Vapor deposited aluminum for premium barrier',
    descriptionJa: 'アルミ蒸着によるプレミアムバリア性能',
    multiplier: 1.4,
    features: ['薄肉設計', '蒸着処理によるバリア性', 'フレキシブル対応', 'コストパフォーマンス'],
    featuresJa: ['薄肉設計', '蒸着処理によるバリア性', 'フレキシブル対応', 'コストパフォーマンス'],
    popular: false,
    ecoFriendly: false,
    thicknessOptions: [
      {
        id: 'light',
        name: '軽量タイプ (~100g)',
        specification: 'PET12μ+VMPET７μ+PET12μ+LLDPE60μ',
        weightRange: '~100g',
        multiplier: 0.9
      },
      {
        id: 'medium',
        name: '標準タイプ (~500g)',
        specification: 'PET12μ+VMPET７μ+PET12μ+LLDPE80μ',
        weightRange: '~500g',
        multiplier: 1.0
      },
      {
        id: 'heavy',
        name: '高耐久タイプ (~800g)',
        specification: 'PET12μ+VMPET７μ+PET12μ+LLDPE100μ',
        weightRange: '~800g',
        multiplier: 1.1
      },
      {
        id: 'ultra',
        name: '超耐久タイプ (800g~)',
        specification: 'PET12μ+VMPET７μ+PET12μ+LLDPE110μ',
        weightRange: '800g~',
        multiplier: 1.2
      }
    ]
  },
  {
    id: 'pet_ldpe',
    name: 'PET+LLDPE(透明)',
    nameJa: 'PET+LLDPE(透明)',
    description: 'Transparent PET with LLDPE seal layer',
    descriptionJa: '透明性に優れるPETとLLDPEシール層',
    multiplier: 1.0,
    features: ['透明性に優れる', '中身が見える', 'シール性良好', 'コスト経済的'],
    featuresJa: ['透明性に優れる', '中身が見える', 'シール性良好', 'コスト経済的'],
    popular: false,
    ecoFriendly: false,
    thicknessOptions: [
      {
        id: 'medium',
        name: '標準タイプ (~500g)',
        specification: 'PET12+LLDPE110μ',
        weightRange: '~500g',
        multiplier: 1.0
      },
      {
        id: 'heavy',
        name: '高耐久タイプ (~800g)',
        specification: 'PET12+LLDPE120μ',
        weightRange: '~800g',
        multiplier: 1.1
      },
      {
        id: 'ultra',
        name: '超耐久タイプ (800g~)',
        specification: 'PET12+LLDPE130μ',
        weightRange: '800g~',
        multiplier: 1.2
      }
    ]
  },
  {
    id: 'pet_ny_al',
    name: 'PET+ナイロン+アルミ箔',
    nameJa: 'PET+ナイロン+アルミ箔',
    description: 'High strength nylon with aluminum foil',
    descriptionJa: '高強度ナイロンとアルミ箔の組み合わせ',
    multiplier: 1.6,
    features: ['高強度・高バリア', '耐ピンホール性', 'ガスバリア性最高', '重包装に最適'],
    featuresJa: ['高強度・高バリア', '耐ピンホール性', 'ガスバリア性最高', '重包装に最適'],
    popular: false,
    ecoFriendly: false,
    thicknessOptions: [
      {
        id: 'light',
        name: '軽量タイプ (~100g)',
        specification: 'PET12+NY16+AL7+LLDPE60μ',
        weightRange: '~100g',
        multiplier: 0.9
      },
      {
        id: 'medium',
        name: '標準タイプ (~500g)',
        specification: 'PET12+NY16+AL7+LLDPE80μ',
        weightRange: '~500g',
        multiplier: 1.0
      },
      {
        id: 'heavy',
        name: '高耐久タイプ (~800g)',
        specification: 'PET12+NY16+AL7+LLDPE100μ',
        weightRange: '~800g',
        multiplier: 1.1
      },
      {
        id: 'ultra',
        name: '超耐久タイプ (800g~)',
        specification: 'PET12+NY16+AL7+LLDPE110μ',
        weightRange: '800g~',
        multiplier: 1.2
      }
    ]
  }
]

// Simplified delivery options as per requirements
const urgencyOptions = [
  {
    id: 'standard',
    name: '標準納期',
    multiplier: 1.0,
    days: 28, // 4 weeks
    description: '4週間'
  },
  {
    id: 'urgent',
    name: '緊急対応',
    multiplier: 1.3,
    days: 21, // 3 weeks
    description: '3週間'
  }
]

export function UnifiedQuoteSystem() {
  const [currentStep, setCurrentStep] = useState(1)
  const [step1Data, setStep1Data] = useState<{
    productType: string
    size: { width: number; height: number }
    material: string
    thickness?: string
    quantities: number[]
  } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null)

  // Form data with multi-quantity input system
  const [formData, setFormData] = useState({
    productType: '',
    quantities: [500, 1000, 2000], // Multiple quantity patterns, minimum 500
    size: { width: 120, height: 200 }, // Default size with manual input only
    material: '',
    thickness: '', // Thickness selection
    urgency: 'standard'
  })

  // Handle step 1 completion
  const handleStep1Complete = (data: typeof step1Data) => {
    if (data) {
      setStep1Data(data)
      setFormData(prev => ({
        ...prev,
        productType: data.productType,
        size: data.size,
        material: data.material,
        thickness: data.thickness || '',
        quantities: data.quantities
      }))
      setCurrentStep(2)
    }
  }

  const [selectedPostProcessing, setSelectedPostProcessing] = useState<string[]>([])
  const [postProcessingMultiplier, setPostProcessingMultiplier] = useState(1.0)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // React Hook Form for contact info
  const {
    register,
    handleSubmit,
    formState: { errors },
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

  // Get product image path
  const getProductImage = (productType: string) => {
    const imageMap: Record<string, string> = {
      'flat_3_side': '/images/processing-icons/三方.png',
      'stand_up': '/images/processing-icons/三方スタンド.png',
      'lap_seal': '/images/processing-icons/合掌.png',
      'box': '/images/processing-icons/ボックス型パウチ.png',
      'spout_pouch': '/images/processing-icons/スパウト.png',
      'roll_film': '/images/processing-icons/ロールフィルム.png'
    }
    return imageMap[productType] || '/images/processing-icons/三方.png'
  }

  // Calculate lead score
  const calculateLeadScore = () => {
    let score = 10 // Base score

    // Quantity scoring (using first valid quantity)
    const firstValidQuantity = formData.quantities.find(q => q >= 500)
    if (firstValidQuantity) {
      if (firstValidQuantity >= 50000) score += 30
      else if (firstValidQuantity >= 20000) score += 25
      else if (firstValidQuantity >= 10000) score += 20
      else if (firstValidQuantity >= 5000) score += 15
      else if (firstValidQuantity >= 1000) score += 10
    }

    // Material complexity
    if (formData.material === 'aluminum' || formData.material === 'premium') score += 15
    else if (formData.material === 'standard' || formData.material === 'kraft') score += 10
    else score += 5

    // Printing complexity (not implemented in current form)
    // if (formData.printing === 'gravure') score += 15
    // else if (formData.printing === 'flexo') score += 12
    // else if (formData.printing === 'digital') score += 8
    // else if (formData.printing === 'spot') score += 6
    // else score += 3
    // Default printing complexity score
    score += 5

    // Features scoring
    score += Math.min(selectedPostProcessing.length * 3, 15)

    // Urgency scoring
    if (formData.urgency === 'urgent') score += 10
    else if (formData.urgency === 'express') score += 7
    else score += 3

    return Math.min(score, 100)
  }

  // Calculate price whenever form data changes
  useEffect(() => {
    if (formData.productType && formData.material) {
      // Only calculate if thickness is selected or not required
      const materialOption = materialOptions.find(m => m.id === formData.material)
      if (!materialOption?.thicknessOptions || formData.thickness) {
        calculatePrice()
      }
    }
  }, [formData, selectedPostProcessing])

  const calculatePrice = () => {
    const productType = productTypes.find(p => p.value === formData.productType)
    const materialOption = materialOptions.find(m => m.id === formData.material)
    const urgencyOption = urgencyOptions.find(u => u.id === formData.urgency)

    // Validation: Ensure all required fields are selected
    if (!productType || !materialOption || !urgencyOption) return

    // Validation: Ensure thickness is selected if material requires it
    if (materialOption.thicknessOptions && !formData.thickness) {
      console.warn('Thickness selection required for material:', materialOption.nameJa)
      return
    }

    // Calculate based on actual area
    const baseArea = 15000 // Base reference size (100x150mm)
    const actualArea = formData.size.width * formData.size.height
    const sizeMultiplier = actualArea / baseArea

    // Get thickness multiplier
    let thicknessMultiplier = 1.0
    if (formData.material && formData.thickness && materialOption.thicknessOptions) {
      const thicknessOption = materialOption.thicknessOptions.find(t => t.id === formData.thickness)
      thicknessMultiplier = thicknessOption?.multiplier || 1.0
    }

    // Filter valid quantities (500+)
    const validQuantities = formData.quantities.filter(q => q >= 500)
    if (validQuantities.length === 0) return

    // Base unit price calculation with thickness
    const baseUnitPrice = productType.basePrice * sizeMultiplier * materialOption.multiplier * thicknessMultiplier

    // Add post-processing costs
    const featuresCost = 0 // PostProcessingPreview already handles this through multiplier

    // Calculate final unit price (no printing costs)
    const unitPrice = baseUnitPrice * urgencyOption.multiplier * postProcessingMultiplier

    // Generate price quotes for all valid quantities
    const quantityQuotes = validQuantities.map(quantity => {
      // Calculate quantity discount
      let discountRate = 0
      let priceBreak = '小ロット'

      if (quantity >= 50000) {
        discountRate = 0.4
        priceBreak = '大ロット'
      } else if (quantity >= 20000) {
        discountRate = 0.3
        priceBreak = '中ロット'
      } else if (quantity >= 10000) {
        discountRate = 0.2
        priceBreak = '標準ロット'
      } else if (quantity >= 5000) {
        discountRate = 0.1
        priceBreak = '小ロット'
      }

      const discountedUnitPrice = baseUnitPrice * (1 - discountRate)
      const finalUnitPrice = discountedUnitPrice * urgencyOption.multiplier * postProcessingMultiplier
      const totalPrice = finalUnitPrice * quantity

      // Minimum setup cost based on product complexity
      const baseSetupCost = 50000 // Base setup cost: 50,000円
      const complexityMultiplier = materialOption.multiplier // Material complexity affects setup
      const setupCost = Math.max(baseSetupCost * complexityMultiplier * postProcessingMultiplier, 160000 * 0.3) // Ensure setup cost is at least 30% of minimum order

      let totalCost = totalPrice + setupCost

      // Apply minimum order policy: Ensure total cost is at least 160,000円
      const minimumOrderValue = 160000
      if (totalCost < minimumOrderValue) {
        // Calculate additional setup cost needed to meet minimum
        const additionalSetupCost = minimumOrderValue - totalCost
        totalCost = minimumOrderValue

        // Recalculate unit price to reflect minimum order value
        const adjustedFinalUnitPrice = (totalCost - setupCost - additionalSetupCost) / quantity

        return {
          quantity,
          unitPrice: Math.round(adjustedFinalUnitPrice),
          totalPrice: Math.round(totalPrice),
          setupCost: Math.round(setupCost + additionalSetupCost),
          totalCost: Math.round(totalCost),
          discountRate: Math.round(discountRate * 100),
          priceBreak: totalCost >= minimumOrderValue ? `${priceBreak} (最低価格適用)` : priceBreak,
          minimumPriceApplied: true
        }
      }

      return {
        quantity,
        unitPrice: Math.round(finalUnitPrice),
        totalPrice: Math.round(totalPrice),
        setupCost: Math.round(setupCost),
        totalCost: Math.round(totalCost),
        discountRate: Math.round(discountRate * 100),
        priceBreak,
        minimumPriceApplied: false
      }
    })

    // Generate recommendations
    const recommendations = []
    const maxQuantity = Math.max(...validQuantities)

    // Check if minimum price policy is affecting the quotes
    const hasMinimumPriceApplied = quantityQuotes.some(quote => quote.minimumPriceApplied)
    if (hasMinimumPriceApplied) {
      recommendations.push('現在の最低価格（160,000円）が適用されています。より多くの数量でコストパフォーマンスを向上できます')
    }

    if (maxQuantity < 10000) {
      recommendations.push('中ロット生産（10,000個以上）で単価を20%削減できます')
    }
    if (materialOption.id === 'pet_aluminum' && maxQuantity < 20000) {
      recommendations.push('スタンダード素材でコストを削減し、大ロット生産でスケールメリットを')
    }
    if (selectedPostProcessing.length === 0) {
      recommendations.push('チャック追加などの機能で付加価値を向上し、顧客満足度を改善')
    }

    const result: PriceResult = {
      unitPrice: quantityQuotes[0].unitPrice, // Primary unit price
      totalPrice: quantityQuotes[0].totalCost, // Primary total cost
      setupCost: quantityQuotes[0].setupCost,
      totalCost: quantityQuotes[0].totalCost,
      priceBreak: quantityQuotes[0].priceBreak,
      leadTime: urgencyOption.days,
      recommendedQuantity: maxQuantity < 10000 ? 10000 : maxQuantity * 1.2,
      priceTrend: maxQuantity >= 10000 ? 'decreasing' : 'increasing',
      bulkDiscount: quantityQuotes[0].discountRate,
      leadScore: calculateLeadScore(),
      recommendations,
      postProcessingOptions: selectedPostProcessing,
      quantityQuotes: quantityQuotes // Multiple quantity quotes
    }

    setPriceResult(result)
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    setFormData(prev => ({
      ...prev,
      size: { ...prev.size, [dimension]: value }
    }))
  }

  
  const resetQuoteForm = () => {
    setFormData({
      productType: '',
      quantities: [500, 1000, 2000],
      size: { width: 120, height: 200 },
      material: '',
      thickness: '',
      urgency: 'standard'
    })
    setPriceResult(null)
    setSelectedPostProcessing([])
    setPostProcessingMultiplier(1.0)
    setCurrentStep(1)
    resetForm()
  }

  // Convert selected post-processing options to preview format
  const getPostProcessingPreviewOptions = () => {
    const previewOptions: {
      zipper?: boolean
      finish?: 'matte' | 'glossy'
      notch?: boolean
      punching?: boolean
      corner?: 'round' | 'square'
      opening?: 'top' | 'bottom'
      valve?: boolean
    } = {}

    selectedPostProcessing.forEach(option => {
      switch (option) {
        case 'zipper':
          previewOptions.zipper = true
          break
        case 'matte-finish':
          previewOptions.finish = 'matte'
          break
        case 'glossy-finish':
          previewOptions.finish = 'glossy'
          break
        case 'notch':
          previewOptions.notch = true
          break
        case 'hole-punching':
          previewOptions.punching = true
          break
        case 'round-corner':
          previewOptions.corner = 'round'
          break
        case 'square-corner':
          previewOptions.corner = 'square'
          break
        case 'top-opening':
          previewOptions.opening = 'top'
          break
        case 'bottom-opening':
          previewOptions.opening = 'bottom'
          break
        case 'valve':
          previewOptions.valve = true
          break
      }
    })

    return previewOptions
  }

  const onSubmitContact = async (data: QuoteFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/unified-quote/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          quoteData: formData,
          priceResult
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '送信に失敗しました')
      }

      setSubmitStatus('success')
      setTimeout(() => {
        setShowLeadModal(false)
        resetForm()
        setSubmitStatus('idle')
      }, 3000)

    } catch (error) {
      setSubmitStatus('error')
      console.error('Quote submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-brixa-50 via-white to-navy-50">
      <Container size="4xl">
        {/* Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-brixa-600 to-navy-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Calculator className="w-4 h-4" />
              <span>AI強化統合見積もりシステム</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              正確な見積もり
              <span className="block text-brixa-600 mt-2">ドラッグ＆マニュアル両対応</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              製品仕様を直感的に入力。最適な価格をリアルタイムに算出します。
              プロフェッショナル向けの詳細な分析と提案付き。
            </p>
          </div>
        </MotionWrapper>

        {/* Progress Bar */}
        <MotionWrapper delay={0.2}>
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-4">
              {[
                { step: 1, label: '基本仕様' },
                { step: 2, label: '詳細設定' },
                { step: 3, label: '結果と分析' }
              ].map((item, index) => (
                <React.Fragment key={item.step}>
                  <div className={`flex items-center space-x-2 ${currentStep >= item.step ? 'text-brixa-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      currentStep >= item.step ? 'bg-brixa-600 text-white' : 'bg-gray-200'
                    }`}>
                      {item.step}
                    </div>
                    <span className="text-sm font-medium hidden md:block">{item.label}</span>
                  </div>
                  {index < 2 && (
                    <div className={`w-8 md:w-16 h-1 rounded ${
                      currentStep > item.step ? 'bg-brixa-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </MotionWrapper>

        <div className="max-w-4xl mx-auto">
          {/* Lead Score Indicator */}
          {priceResult && priceResult.leadScore >= 50 && (
            <MotionWrapper delay={0.25}>
              <Card className="p-4 mb-8 bg-gradient-to-r from-purple-50 to-navy-100 border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-semibold text-purple-900">リード評価スコア</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-purple-600 mr-2">{priceResult.leadScore}</span>
                    <span className="text-purple-700">/100</span>
                    {priceResult.leadScore >= 70 && (
                      <Badge className="ml-3 bg-purple-600 text-white">
                        高品質見込み客
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            </MotionWrapper>
          )}

          {/* Step 1: Interactive Quote System */}
          {currentStep === 1 && (
            <InteractiveQuoteSystem
              onStepComplete={handleStep1Complete}
              initialData={step1Data || undefined}
            />
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
                    素材、納期などの詳細を設定してください
                  </p>
                </CardHeader>

                <CardContent className="space-y-8">
                  {/* Material */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      素材仕様 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            {option.ecoFriendly && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                エコ
                              </Badge>
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
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Thickness Selection - Conditional */}
                  {formData.material && materialOptions.find(m => m.id === formData.material)?.thicknessOptions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>
                        <label className="block text-lg font-semibold text-gray-900 mb-4">
                          厚さ仕様 <span className="text-red-500">*</span>
                        </label>
                        <div className="text-sm text-gray-600 mb-4">
                          選択した素材に基づいた厚さのオプションです。内容量や耐久性に応じてお選びください。
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {materialOptions.find(m => m.id === formData.material)?.thicknessOptions?.map((thickness) => (
                            <button
                              key={thickness.id}
                              onClick={() => handleInputChange('thickness', thickness.id)}
                              className={`p-4 rounded-lg border-2 transition-all duration-200 min-h-[140px] flex flex-col justify-between ${
                                formData.thickness === thickness.id
                                  ? 'border-brixa-600 bg-brixa-50 shadow-lg'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="text-center flex flex-col h-full">
                                <div className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
                                  {thickness.name}
                                </div>
                                <div className="text-xs text-gray-600 mb-2 font-mono bg-gray-100 p-2 rounded leading-relaxed break-words hyphens-auto flex-1 flex items-center justify-center min-h-[3rem]">
                                  <span className="text-center" title={thickness.specification}>
                                    {thickness.specification}
                                  </span>
                                </div>
                                <div className="text-xs text-brixa-700 font-medium mt-auto">
                                  {thickness.multiplier < 1.0 && 'コストダウン'}
                                  {thickness.multiplier === 1.0 && '標準'}
                                  {thickness.multiplier > 1.0 && '高耐久'}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                        {formData.thickness && (
                          <div className="mt-4 p-3 bg-brixa-50 border border-brixa-200 rounded-lg">
                            <div className="flex items-center">
                              <CheckCircle className="w-5 h-5 text-brixa-600 mr-2" />
                              <div className="text-sm text-brixa-800">
                                選択された厚さ：{
                                  materialOptions.find(m => m.id === formData.material)
                                    ?.thicknessOptions?.find(t => t.id === formData.thickness)?.specification
                                }
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}


                  {/* Timeline */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      納期希望 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                      {urgencyOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleInputChange('urgency', option.id)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            formData.urgency === option.id
                              ? 'border-brixa-600 bg-brixa-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-semibold text-gray-900">{option.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                          <div className="text-xs text-brixa-700 mt-2">
                            {option.days}営業日
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={prevStep} className="px-8">
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      戻る
                    </Button>
                    <Button
                      variant="primary"
                      onClick={nextStep}
                      className="px-8"
                      disabled={
                        !formData.material ||
                        !formData.urgency ||
                        (materialOptions.find(m => m.id === formData.material)?.thicknessOptions && !formData.thickness)
                      }
                    >
                      見積もりの実行
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
              <EnhancedPostProcessingPreview
                selectedProductType={formData.productType}
                selectedOptions={selectedPostProcessing}
                onOptionsChange={setSelectedPostProcessing}
                onPriceUpdate={setPostProcessingMultiplier}
                language="ja"
                variant="full"
                showAdvancedFilters={true}
                enableBatchSelection={false}
              />

              {/* Post-Processing Visual Preview */}
              {selectedPostProcessing.length > 0 && (
                <PostProcessingPreview
                  selectedOptions={getPostProcessingPreviewOptions()}
                  className="mt-6"
                />
              )}

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

          
          {/* Step 3: Results */}
          {currentStep === 3 && priceResult && (
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
                      お見積もり結果
                    </CardTitle>
                    <p className="text-gray-600">
                      入力された仕様に基づいた正確な費用試算
                    </p>
                  </CardHeader>

                  <CardContent>
                    {/* Minimum Price Policy Notice */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">最低注文価格ポリシー</h4>
                          <p className="text-sm text-blue-800">
                            すべてのご注文における最低価格は160,000円（税別）となります。
                            計算結果が最低価格に満たない場合、設定費用の調整により最低価格が適用されます。
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">数量別お見積もり</h3>
                      {priceResult.quantityQuotes && priceResult.quantityQuotes.length > 0 ? (
                        <div className="space-y-4">
                          {priceResult.quantityQuotes.map((quote, index) => (
                            <Card key={index} className={`p-6 border-2 ${
                              index === 0 ? 'border-brixa-600 bg-brixa-50' : 'border-gray-200 bg-white'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center space-x-3">
                                    <span className="text-lg font-semibold text-gray-900">
                                      {quote.quantity.toLocaleString()}枚
                                    </span>
                                    {index === 0 && (
                                      <Badge variant="secondary" className="bg-brixa-100 text-brixa-800">
                                        おすすめ
                                      </Badge>
                                    )}
                                    {quote.minimumPriceApplied && (
                                      <Badge variant="metallic" className="text-xs">
                                        最低価格適用
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    単価: ¥{quote.unitPrice.toLocaleString()}（税別）
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {quote.priceBreak} ({quote.discountRate}%引)
                                  </div>
                                  {quote.minimumPriceApplied && (
                                    <div className="text-sm text-orange-600 mt-2 font-medium">
                                      <AlertCircle className="w-4 h-4 inline mr-1" />
                                      最低注文価格（160,000円）が適用されました
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <CurrencyBadge
                                    amount={quote.totalCost}
                                    currency="JPY"
                                    size="lg"
                                    className="justify-center mb-2"
                                  />
                                  <p className="text-sm text-gray-600">総費用（税別）</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    内 設定費用: ¥{quote.setupCost.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-6">
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
                              <div className="text-2xl font-bold text-navy-700 mb-2">
                                {priceResult.leadTime}日
                              </div>
                              <p className="text-sm text-gray-600">納期</p>
                            </div>
                          </Card>
                        </div>
                      )}
                    </div>

                    
                    {/* AI Recommendations */}
                    {priceResult.recommendations.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          💡 最適化提案
                        </h3>
                        <div className="space-y-2">
                          {priceResult.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <Target className="w-5 h-5 text-green-600 flex-shrink-0" />
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
                          <span className="text-gray-600">サイズ：</span>
                          <span className="font-medium text-gray-900 ml-2">
                            {formData.size.width}×{formData.size.height}mm
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">数量パターン：</span>
                          <span className="font-medium text-gray-900 ml-2">
                            {formData.quantities.filter(q => q >= 500).map(q => q.toLocaleString()).join(', ')}枚
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">素材：</span>
                          <span className="font-medium text-gray-900 ml-2">
                            {materialOptions.find(m => m.id === formData.material)?.nameJa}
                          </span>
                        </div>
                        {formData.thickness && materialOptions.find(m => m.id === formData.material)?.thicknessOptions && (
                          <div>
                            <span className="text-gray-600">厚さ：</span>
                            <span className="font-medium text-gray-900 ml-2">
                              {materialOptions.find(m => m.id === formData.material)
                                ?.thicknessOptions?.find(t => t.id === formData.thickness)?.name}
                            </span>
                          </div>
                        )}
                        {priceResult.postProcessingOptions.length > 0 && (
                          <div className="col-span-3">
                            <span className="text-gray-600">後加工：</span>
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
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setShowLeadModal(true)}
                      className="justify-center px-8"
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      見積もり結果をメールで受け取る
                    </Button>
                    <Button variant="outline" size="lg" onClick={resetQuoteForm} className="justify-center px-8">
                      <Calculator className="mr-2 h-5 w-5" />
                      再計算する
                    </Button>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center text-sm">
                    <a href="tel:+81-80-6942-7235" className="flex items-center justify-center space-x-2 text-navy-700 hover:text-navy-600">
                      <Phone className="w-4 h-4" />
                      <span>+81-80-6942-7235</span>
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

      {/* Lead Capture Modal */}
      <AnimatePresence>
        {showLeadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    見積もり結果の送付
                  </h3>
                  <button
                    onClick={() => setShowLeadModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {priceResult && (
                  <div className="mb-6 p-4 bg-navy-50 border border-navy-600 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-navy-600">見積内容</span>
                      <span className="text-sm font-medium text-navy-600">合計: ¥{priceResult.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-navy-600 space-y-1">
                      <div>• {productTypes.find(p => p.value === formData.productType)?.label}</div>
                      <div>• サイズ: {formData.size.width} × {formData.size.height}mm</div>
                      <div>• 素材: {materialOptions.find(m => m.id === formData.material)?.nameJa}</div>
                      {formData.thickness && materialOptions.find(m => m.id === formData.material)?.thicknessOptions && (
                        <div>• 厚さ: {materialOptions.find(m => m.id === formData.material)
                          ?.thicknessOptions?.find(t => t.id === formData.thickness)?.name}</div>
                      )}
                      <div>• 数量: {formData.quantities[0].toLocaleString()}個</div>
                    </div>
                  </div>
                )}

                {submitStatus === 'success' ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-lg font-bold text-green-800 mb-2">
                      送信しました！
                    </h4>
                    <p className="text-green-700">
                      見積もり結果をメールでお送りしました。
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmitContact)} className="space-y-4">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 mr-1" />
                        お名前 <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                        placeholder="山田 太郎"
                      />
                      {errors.name && (
                        <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        会社名
                      </label>
                      <input
                        {...register('company')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                        placeholder="株式会社サンプル"
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 mr-1" />
                        メールアドレス <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                        placeholder="example@company.com"
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 mr-1" />
                        電話番号 <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                        placeholder="+81-80-6942-7235"
                      />
                      {errors.phone && (
                        <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="flex items-start">
                      <input
                        {...register('consent')}
                        type="checkbox"
                        id="consent"
                        className="mt-1 w-4 h-4 text-brixa-700 border-gray-300 rounded focus:ring-brixa-600"
                      />
                      <label htmlFor="consent" className="ml-3 text-sm text-gray-700">
                        <span className="text-red-500">*</span> 個人情報の取り扱いに同意します
                        <div className="text-xs text-gray-500 mt-1">
                          見積もりの送付とご案内のみに使用いたします
                        </div>
                      </label>
                    </div>
                    {errors.consent && (
                      <p className="text-red-600 text-sm">{errors.consent.message}</p>
                    )}

                    {submitStatus === 'error' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">
                          送信エラーが発生しました。時間をおいて再度お試しください。
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-brixa-700 hover:bg-brixa-600"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? '送信中...' : '見積もりを送付'}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}