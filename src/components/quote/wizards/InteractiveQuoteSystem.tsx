'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Calculator,
  Package,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  X,
  HelpCircle,
  Target,
  Star,
  Award,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'

// Types
interface ProductType {
  value: string
  label: string
  description: string
  basePrice: number
  popular?: boolean
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

interface ThicknessOption {
  id: string
  name: string
  specification: string
  weightRange: string
  multiplier: number
}

interface SizePreset {
  name: string
  width: number
  height: number
  description: string
}

interface QuickQuote {
  quantity: number
  unitPrice: number
  totalPrice: number
  discountRate: number
}

interface ValidationState {
  productType: boolean
  size: boolean
  material: boolean
  thickness: boolean
  quantity: boolean
  isValid: boolean
}

interface InteractiveQuoteSystemProps {
  onStepComplete?: (data: {
    productType: string
    size: { width: number; height: number }
    material: string
    thickness?: string
    quantities: number[]
  }) => void
  initialData?: Partial<{
    productType: string
    size: { width: number; height: number }
    material: string
    thickness: string
    quantities: number[]
  }>
}

// Data
const productTypes: ProductType[] = [
  { value: 'flat_3_side', label: '三方シール平袋', description: '基本形状のパウチ', basePrice: 15, popular: true },
  { value: 'stand_up', label: 'スタンドパウチ', description: '底マチ付きで安定性が高い', basePrice: 25, popular: true },
  { value: 'box', label: 'BOX型パウチ', description: '箱型形状で保護性に優れる', basePrice: 30 },
  { value: 'spout_pouch', label: 'スパウトパウチ', description: '液体製品に最適な注ぎ口付き', basePrice: 35 },
  { value: 'roll_film', label: 'ロールフィルム', description: '自動包装機対応のフィルム', basePrice: 8 }
]

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
    thicknessOptions: [
      { id: 'light', name: '軽量タイプ', specification: 'PET12μ+AL７μ+PET12μ+LLDPE60μ', weightRange: '~100g', multiplier: 0.9 },
      { id: 'medium', name: '標準タイプ', specification: 'PET12μ+AL７μ+PET12μ+LLDPE80μ', weightRange: '~500g', multiplier: 1.0 },
      { id: 'heavy', name: '高耐久タイプ', specification: 'PET12μ+AL７μ+PET12μ+LLDPE100μ', weightRange: '~800g', multiplier: 1.1 },
      { id: 'ultra', name: '超耐久タイプ', specification: 'PET12μ+AL７μ+PET12μ+LLDPE110μ', weightRange: '800g~', multiplier: 1.2 }
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
    thicknessOptions: [
      { id: 'light', name: '軽量タイプ', specification: 'PET12μ+VMPET７μ+PET12μ+LLDPE60μ', weightRange: '~100g', multiplier: 0.9 },
      { id: 'medium', name: '標準タイプ', specification: 'PET12μ+VMPET７μ+PET12μ+LLDPE80μ', weightRange: '~500g', multiplier: 1.0 },
      { id: 'heavy', name: '高耐久タイプ', specification: 'PET12μ+VMPET７μ+PET12μ+LLDPE100μ', weightRange: '~800g', multiplier: 1.1 },
      { id: 'ultra', name: '超耐久タイプ', specification: 'PET12μ+VMPET７μ+PET12μ+LLDPE110μ', weightRange: '800g~', multiplier: 1.2 }
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
    thicknessOptions: [
      { id: 'medium', name: '標準タイプ', specification: 'PET12+LLDPE110μ', weightRange: '~500g', multiplier: 1.0 },
      { id: 'heavy', name: '高耐久タイプ', specification: 'PET12+LLDPE120μ', weightRange: '~800g', multiplier: 1.1 },
      { id: 'ultra', name: '超耐久タイプ', specification: 'PET12+LLDPE130μ', weightRange: '800g~', multiplier: 1.2 }
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
    thicknessOptions: [
      { id: 'light', name: '軽量タイプ', specification: 'PET12+NY16+AL7+LLDPE60μ', weightRange: '~100g', multiplier: 0.9 },
      { id: 'medium', name: '標準タイプ', specification: 'PET12+NY16+AL7+LLDPE80μ', weightRange: '~500g', multiplier: 1.0 },
      { id: 'heavy', name: '高耐久タイプ', specification: 'PET12+NY16+AL7+LLDPE100μ', weightRange: '~800g', multiplier: 1.1 },
      { id: 'ultra', name: '超耐久タイプ', specification: 'PET12+NY16+AL7+LLDPE110μ', weightRange: '800g~', multiplier: 1.2 }
    ]
  }
]

const sizePresets: SizePreset[] = [
  { name: '小サイズ', width: 60, height: 80, description: 'サンプル・小容量向け' },
  { name: '中サイズ', width: 120, height: 160, description: '一般的な製品サイズ' },
  { name: '大サイズ', width: 200, height: 250, description: '大容量・業務用向け' }
]

const quantityPresets = [500, 1000, 2000, 5000, 10000, 20000]

export function InteractiveQuoteSystem({ onStepComplete, initialData }: InteractiveQuoteSystemProps) {
  // State Management
  const [formData, setFormData] = useState({
    productType: initialData?.productType || '',
    size: initialData?.size || { width: 120, height: 160 },
    material: initialData?.material || '',
    thickness: initialData?.thickness || '',
    quantities: initialData?.quantities || [1000, 2000, 5000]
  })

  const [pricePreview, setPricePreview] = useState<QuickQuote[]>([])
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  // Validation State
  const validation: ValidationState = useMemo(() => {
    const productTypeValid = !!formData.productType
    const sizeValid = formData.size.width >= 50 && formData.size.height >= 50
    const materialValid = !!formData.material
    const selectedMaterial = materialOptions.find(m => m.id === formData.material)
    const thicknessValid = !selectedMaterial?.thicknessOptions || !!formData.thickness
    const quantityValid = formData.quantities.filter(q => q >= 500).length > 0

    return {
      productType: productTypeValid,
      size: sizeValid,
      material: materialValid,
      thickness: thicknessValid,
      quantity: quantityValid,
      isValid: productTypeValid && sizeValid && materialValid && thicknessValid && quantityValid
    }
  }, [formData])

  // Get product image
  const getProductImage = (productType: string) => {
    const imageMap: Record<string, string> = {
      'flat_3_side': '/images/processing-icons/flat-3-side.png',
      'stand_up': '/images/processing-icons/flat-3-side-stand.png',
      'box': '/images/processing-icons/box-pouch.png',
      'spout_pouch': '/images/processing-icons/spout.png',
      'roll_film': '/images/processing-icons/roll-film.png'
    }
    return imageMap[productType] || '/images/processing-icons/flat-3-side.png'
  }

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }

      // Reset thickness when material changes
      if (field === 'material') {
        newData.thickness = ''
      }

      return newData
    })
  }

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    setFormData(prev => ({
      ...prev,
      size: { ...prev.size, [dimension]: Math.max(50, value) }
    }))
  }

  const applySizePreset = (preset: SizePreset) => {
    setFormData(prev => ({
      ...prev,
      size: { width: preset.width, height: preset.height }
    }))
  }

  const applyQuantityPreset = (quantity: number) => {
    setFormData(prev => {
      const newQuantities = [...prev.quantities]
      const emptyIndex = newQuantities.findIndex(q => q < 500)

      if (emptyIndex !== -1) {
        newQuantities[emptyIndex] = quantity
      } else {
        newQuantities.push(quantity)
      }

      return { ...prev, quantities: newQuantities }
    })
  }

  const addQuantityField = () => {
    setFormData(prev => ({
      ...prev,
      quantities: [...prev.quantities, Math.max(500, Math.max(...prev.quantities) + 1000)]
    }))
  }

  const removeQuantityField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      quantities: prev.quantities.filter((_, i) => i !== index)
    }))
  }

  // Calculate real-time price preview
  useEffect(() => {
    if (validation.isValid) {
      const productType = productTypes.find(p => p.value === formData.productType)
      const material = materialOptions.find(m => m.id === formData.material)
      const thicknessOption = material?.thicknessOptions?.find(t => t.id === formData.thickness)

      if (productType && material) {
        const baseArea = 15000 // Base reference size
        const actualArea = formData.size.width * formData.size.height
        const sizeMultiplier = actualArea / baseArea

        const thicknessMultiplier = thicknessOption?.multiplier || 1.0
        const baseUnitPrice = productType.basePrice * sizeMultiplier * material.multiplier * thicknessMultiplier

        const quotes: QuickQuote[] = formData.quantities
          .filter(q => q >= 500)
          .slice(0, 3)
          .map(quantity => {
            let discountRate = 0

            if (quantity >= 20000) discountRate = 0.4
            else if (quantity >= 10000) discountRate = 0.3
            else if (quantity >= 5000) discountRate = 0.2
            else if (quantity >= 2000) discountRate = 0.1

            const discountedPrice = baseUnitPrice * (1 - discountRate)

            return {
              quantity,
              unitPrice: Math.round(discountedPrice),
              totalPrice: Math.round(discountedPrice * quantity),
              discountRate: Math.round(discountRate * 100)
            }
          })

        setPricePreview(quotes)
      }
    } else {
      setPricePreview([])
    }
  }, [formData, validation.isValid])

  const handleSubmit = () => {
    if (validation.isValid && onStepComplete) {
      onStepComplete(formData)
    }
  }

  return (
    <Container size="4xl">
      <MotionWrapper delay={0.1}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-brixa-600 to-navy-600 text-white px-6 py-3 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            <span>統合仕様選択システム</span>
            <Badge className="ml-2 bg-white/20 text-white border-white/30">Step 1/3</Badge>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            製品仕様の総合設定
          </h2>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            製品タイプ、サイズ、素材、厚さを一つの画面で選択。
            リアルタイムで価格が計算され、最適な仕様が簡単に見つかります。
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-center space-x-2 text-sm mb-8">
          {[
            { key: 'productType', label: '製品タイプ', valid: validation.productType },
            { key: 'size', label: 'サイズ', valid: validation.size },
            { key: 'material', label: '素材', valid: validation.material },
            { key: 'thickness', label: '厚さ', valid: validation.thickness }
          ].map((step, index) => (
            <React.Fragment key={step.key}>
              <span className={`px-3 py-1 rounded-full font-medium transition-all ${
                step.valid
                  ? 'bg-green-100 text-green-800 border-2 border-green-200'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent'
              }`}>
                {step.valid && <CheckCircle className="w-3 h-3 inline mr-1" />}
                {step.label}
              </span>
              {index < 3 && <span className="text-gray-300">→</span>}
            </React.Fragment>
          ))}
        </div>

        {/* Main Content */}
        <Card className="p-8 shadow-xl">
          <CardContent className="space-y-10">
            {/* Product Type & Material Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Product Type Selection */}
              <div>
                <label className="flex items-center justify-between text-lg font-semibold text-gray-900 mb-4">
                  <span>製品タイプ</span>
                  <span className="text-red-500">*</span>
                  {validation.productType && (
                    <Badge variant="success" className="text-xs ml-2">
                      ✓ 選択済み
                    </Badge>
                  )}
                </label>

                <div className="grid gap-3">
                  {productTypes.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange('productType', option.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 group ${
                        formData.productType === option.value
                          ? 'border-brixa-600 bg-brixa-50 shadow-lg scale-[1.02]'
                          : 'border-gray-200 hover:border-brixa-300 hover:bg-gray-50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={getProductImage(option.value)}
                            alt={option.label}
                            fill
                            className="object-contain group-hover:scale-110 transition-transform"
                            sizes="64px"
                          />
                        </div>
                        <div className="text-left flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="font-semibold text-gray-900 text-sm">{option.label}</div>
                            {option.popular && <Badge variant="metallic" className="text-xs">人気</Badge>}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                          <div className="text-xs text-brixa-700 font-medium mt-1">
                            基本価格: ¥{option.basePrice}~
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Selection */}
              <div>
                <label className="flex items-center justify-between text-lg font-semibold text-gray-900 mb-4">
                  <span>素材仕様</span>
                  <span className="text-red-500">*</span>
                  {validation.material && (
                    <Badge variant="success" className="text-xs ml-2">
                      ✓ 選択済み
                    </Badge>
                  )}
                </label>

                <div className="grid gap-3">
                  {materialOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleInputChange('material', option.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        formData.material === option.id
                          ? 'border-brixa-600 bg-brixa-50 shadow-lg'
                          : 'border-gray-200 hover:border-brixa-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="font-semibold text-gray-900">{option.nameJa}</div>
                          {option.popular && <Badge variant="metallic" className="text-xs">人気</Badge>}
                        </div>
                        <div className="text-sm text-brixa-700 font-medium">
                          ×{option.multiplier}
                        </div>
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
            </div>

            {/* Thickness Selection - Conditional */}
            <AnimatePresence>
              {formData.material && materialOptions.find(m => m.id === formData.material)?.thicknessOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <label className="flex items-center justify-between text-lg font-semibold text-gray-900 mb-4">
                      <span>厚さ仕様</span>
                      <span className="text-red-500">*</span>
                      {validation.thickness && (
                        <Badge variant="success" className="text-xs ml-2">
                          ✓ 選択済み
                        </Badge>
                      )}
                    </label>

                    <div className="text-sm text-gray-600 mb-4">
                      内容量や耐久性に応じて最適な厚さを選択してください。
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {materialOptions.find(m => m.id === formData.material)?.thicknessOptions?.map((thickness) => (
                        <button
                          key={thickness.id}
                          onClick={() => handleInputChange('thickness', thickness.id)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 group ${
                            formData.thickness === thickness.id
                              ? 'border-brixa-600 bg-brixa-50 shadow-lg scale-[1.02]'
                              : 'border-gray-200 hover:border-brixa-300 hover:bg-gray-50 hover:shadow-md'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-semibold text-gray-900 mb-2 group-hover:text-brixa-700 transition-colors">
                              {thickness.name}
                            </div>
                            <div className="text-xs text-gray-600 mb-2 font-mono bg-gray-100 p-2 rounded group-hover:bg-brixa-50 transition-colors">
                              {thickness.specification}
                            </div>
                            <div className="text-xs font-medium">
                              {thickness.multiplier < 1.0 && (
                                <span className="text-green-600">コストダウン</span>
                              )}
                              {thickness.multiplier === 1.0 && (
                                <span className="text-gray-600">標準</span>
                              )}
                              {thickness.multiplier > 1.0 && (
                                <span className="text-orange-600">高耐久</span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {formData.thickness && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-3 bg-brixa-50 border border-brixa-200 rounded-lg"
                        >
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-brixa-600 mr-2 flex-shrink-0" />
                            <div className="text-sm text-brixa-800">
                              選択された厚さ：{
                                materialOptions.find(m => m.id === formData.material)
                                  ?.thicknessOptions?.find(t => t.id === formData.thickness)?.specification
                              }
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Size & Configuration */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Size Configuration */}
              <div>
                <label className="flex items-center justify-between text-lg font-semibold text-gray-900 mb-4">
                  <span>サイズ設定</span>
                  <span className="text-red-500">*</span>
                  {validation.size && (
                    <Badge variant="success" className="text-xs ml-2">
                      ✓ 設定完了
                    </Badge>
                  )}
                </label>

                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    最小サイズ: 50mm × 50mm
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                        横幅 (mm)
                        <span className="text-xs text-gray-500">最小: 50mm</span>
                      </label>
                      <input
                        type="number"
                        min="50"
                        value={formData.size.width}
                        onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 50)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent transition-colors ${
                          validation.size
                            ? 'border-green-300 bg-green-50'
                            : 'border-red-300 bg-red-50'
                        }`}
                        placeholder="50以上の数値を入力"
                      />
                      {!validation.size && formData.size.width < 50 && (
                        <div className="text-xs text-red-600 mt-1 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          横幅は50mm以上で入力してください
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                        高さ (mm)
                        <span className="text-xs text-gray-500">最小: 50mm</span>
                      </label>
                      <input
                        type="number"
                        min="50"
                        value={formData.size.height}
                        onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 50)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent transition-colors ${
                          validation.size
                            ? 'border-green-300 bg-green-50'
                            : 'border-red-300 bg-red-50'
                        }`}
                        placeholder="50以上の数値を入力"
                      />
                      {!validation.size && formData.size.height < 50 && (
                        <div className="text-xs text-red-600 mt-1 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          高さは50mm以上で入力してください
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Size Presets */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">よく使われるサイズ</div>
                    <div className="grid grid-cols-3 gap-2">
                      {sizePresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => applySizePreset(preset)}
                          className={`py-3 px-3 text-sm font-medium rounded-lg transition-all hover:scale-105 ${
                            formData.size.width === preset.width && formData.size.height === preset.height
                              ? 'bg-brixa-700 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title={preset.description}
                        >
                          {preset.name}
                          <div className="text-xs opacity-75">
                            {preset.width}×{preset.height}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-r from-brixa-50 to-navy-50 rounded-lg border border-brixa-200">
                    <div className="flex items-center justify-center space-x-2">
                      <Calculator className="w-5 h-5 text-brixa-600" />
                      <span className="font-medium text-gray-900">
                        面積: {(formData.size.width * formData.size.height).toLocaleString()}mm²
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity Configuration */}
              <div>
                <label className="flex items-center justify-between text-lg font-semibold text-gray-900 mb-4">
                  <span>生産数量</span>
                  <span className="text-red-500">*</span>
                  {validation.quantity && (
                    <Badge variant="success" className="text-xs ml-2">
                      ✓ {formData.quantities.filter(q => q >= 500).length}パターン
                    </Badge>
                  )}
                </label>

                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    最低500個から複数の数量で価格比較
                  </div>

                  {formData.quantities.map((quantity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <input
                          type="number"
                          min="500"
                          value={quantity}
                          onChange={(e) => {
                            const newQuantities = [...formData.quantities]
                            newQuantities[index] = Math.max(500, parseInt(e.target.value) || 500)
                            handleInputChange('quantities', newQuantities)
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent transition-colors ${
                            quantity >= 500
                              ? 'border-green-300 bg-green-50'
                              : 'border-red-300 bg-red-50'
                          }`}
                          placeholder="500"
                        />
                      </div>
                      {formData.quantities.length > 1 && (
                        <button
                          onClick={() => removeQuantityField(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="削除"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={addQuantityField}
                    className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-brixa-400 hover:text-brixa-700 transition-colors hover:bg-brixa-50"
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    数量パターンを追加
                  </button>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {quantityPresets.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => applyQuantityPreset(preset)}
                        className={`py-2 px-3 text-sm font-medium rounded-lg transition-all hover:scale-105 ${
                          formData.quantities.includes(preset)
                            ? 'bg-brixa-700 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {preset >= 1000 ? `${preset/1000}k` : preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Price Preview */}
            <AnimatePresence>
              {pricePreview.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6 bg-gradient-to-r from-brixa-50 via-navy-50 to-purple-50 border border-brixa-200 rounded-xl"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-brixa-600" />
                    リアルタイム価格試算
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {pricePreview.map((quote, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">
                            {quote.quantity.toLocaleString()}枚
                          </div>
                          <div className="text-2xl font-bold text-brixa-700 mb-1">
                            ¥{quote.unitPrice.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            単価（税別）
                          </div>
                          {quote.discountRate > 0 && (
                            <Badge variant="success" className="text-xs">
                              {quote.discountRate}%引
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {validation.isValid ? (
                  <span className="text-green-600 font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    すべての項目が入力完了しました
                  </span>
                ) : (
                  <span className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    必須項目をすべて入力してください
                  </span>
                )}
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={!validation.isValid}
                className="px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次のステップへ：詳細設定
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </MotionWrapper>
    </Container>
  )
}