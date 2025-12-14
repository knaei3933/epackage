'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  Package,
  Settings,
  Truck,
  Clock,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Info,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Grid } from '@/components/ui/Grid'
import { Badge } from '@/components/ui/Badge'
import { QuoteCalculationParams } from '@/lib/pricing-engine'
import { Product } from '@/types/database'
import { PricingEngine, QuoteResult } from '@/lib/pricing-engine'

interface ConfigurationPanelProps {
  products: QuoteCalculationParams[]
  onChange: (products: QuoteCalculationParams[]) => void
  onNext: (data: { products: QuoteCalculationParams[] }) => void
  onBack: () => void
  errors: Record<string, string>
  isLoading?: boolean
}

interface CalculatedQuote {
  index: number
  product: QuoteCalculationParams
  result: QuoteResult
  isExpanded: boolean
}

const MATERIAL_OPTIONS = [
  {
    value: 'PE',
    label: 'PE',
    labelJa: 'ポリエチレン',
    description: '柔軟性が高い、コストパフォーマンスに優れる',
    costFactor: 1
  },
  {
    value: 'PP',
    label: 'PP',
    labelJa: 'ポリプロピレン',
    description: '耐熱性、耐薬品性に優れる',
    costFactor: 1.2
  },
  {
    value: 'PET',
    label: 'PET',
    labelJa: 'PET',
    description: '透明性、強度に優れる',
    costFactor: 1.8
  },
  {
    value: 'ALUMINUM',
    label: 'アルミ',
    labelJa: 'アルミ',
    description: 'バリア性、光遮蔽性に優れる',
    costFactor: 4.8
  },
  {
    value: 'PAPER_LAMINATE',
    label: 'ラミネート紙',
    labelJa: 'ラミネート紙',
    description: '印刷適性、環境配慮に優れる',
    costFactor: 1.5
  }
] as const

const PRINTING_TYPES = [
  {
    value: 'digital',
    label: 'デジタル印刷',
    labelJa: 'デジタル印刷',
    description: '小ロット対応、短納期',
    setupFee: 10000,
    perColorCost: 5,
    minQuantity: 100
  },
  {
    value: 'gravure',
    label: 'グラビア印刷',
    labelJa: 'グラビア印刷',
    description: '大ロットに適応、高品質',
    setupFee: 50000,
    perColorCost: 2,
    minQuantity: 1000
  }
] as const

const SPECIAL_FEATURES = [
  {
    value: 'zip_lock',
    label: 'チャック付き',
    labelJa: 'チャック付き',
    cost: 2000
  },
  {
    value: 'tear_notch',
    label: 'テアノッチ',
    labelJa: 'テアノッチ',
    cost: 500
  },
  {
    value: 'hang_hole',
    label: 'ハングホール',
    labelJa: 'ハングホール',
    cost: 1000
  },
  {
    value: 'uv_coating',
    label: 'UVコーティング',
    labelJa: 'UVコーティング',
    cost: 3000
  },
  {
    value: 'embossing',
    label: 'エンボス加工',
    labelJa: 'エンボス加工',
    cost: 5000
  }
] as const

export function ConfigurationPanel({
  products,
  onChange,
  onNext,
  onBack,
  errors,
  isLoading
}: ConfigurationPanelProps) {
  const [calculatedQuotes, setCalculatedQuotes] = useState<CalculatedQuote[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['specifications']))

  // Initialize calculated quotes when products change
  useEffect(() => {
    const initialQuotes: CalculatedQuote[] = products.map((product, index) => ({
      index,
      product,
      result: {} as QuoteResult,
      isExpanded: true
    }))
    setCalculatedQuotes(initialQuotes)
    calculateAllPrices()
  }, [])

  // Calculate prices for all products
  const calculateAllPrices = useCallback(async () => {
    setIsCalculating(true)
    try {
      const newCalculatedQuotes = [...calculatedQuotes]

      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        if (product.product && product.specifications) {
          try {
            const result = await PricingEngine.calculateQuote(product)
            newCalculatedQuotes[i] = {
              ...newCalculatedQuotes[i],
              product,
              result
            }
          } catch (error) {
            console.error(`Calculation error for product ${i}:`, error)
          }
        }
      }

      setCalculatedQuotes(newCalculatedQuotes)
    } catch (error) {
      console.error('Batch calculation error:', error)
    } finally {
      setIsCalculating(false)
    }
  }, [products, calculatedQuotes])

  // Update product specifications
  const updateProductSpec = useCallback((index: number, field: string, value: any) => {
    const newProducts = [...products]
    const product = newProducts[index]

    if (field.startsWith('specifications.')) {
      const specField = field.replace('specifications.', '')
      ;(product.specifications as any)[specField] = value
    } else if (field.startsWith('customOptions.')) {
      const optionField = field.replace('customOptions.', '')
      if (!product.customOptions) {
        product.customOptions = {}
      }

      if (optionField.includes('.')) {
        const [main, sub] = optionField.split('.')
        if (!(product.customOptions as any)[main]) {
          ;(product.customOptions as any)[main] = {}
        }
        ;(product.customOptions as any)[main][sub] = value
      } else {
        ;(product.customOptions as any)[optionField] = value
      }
    } else {
      ;(product as any)[field as keyof typeof product] = value
    }

    onChange(newProducts)

    // Recalculate prices after a short delay
    setTimeout(calculateAllPrices, 500)
  }, [products, onChange, calculateAllPrices])

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }, [expandedSections])

  // Toggle product expansion
  const toggleProductExpansion = useCallback((index: number) => {
    const newQuotes = calculatedQuotes.map((quote, i) =>
      i === index ? { ...quote, isExpanded: !quote.isExpanded } : quote
    )
    setCalculatedQuotes(newQuotes)
  }, [calculatedQuotes])

  // Add new product
  const addProduct = useCallback(() => {
    // Find a product that's not already selected
    const availableCategories = ['flat_3_side', 'stand_up', 'gusset', 'box', 'flat_with_zip', 'special'] as const
    const usedCategories = products.map(p => p.product.category)
    const availableCategory = availableCategories.find(cat => !usedCategories.includes(cat))

    if (availableCategory) {
      // This would need to fetch actual product data
      console.log('Adding new product with category:', availableCategory)
    }
  }, [products])

  // Remove product
  const removeProduct = useCallback((index: number) => {
    const newProducts = products.filter((_, i) => i !== index)
    onChange(newProducts)
  }, [products, onChange])

  const totalPrice = calculatedQuotes.reduce((sum, quote) => sum + (quote.result?.totalPrice || 0), 0)
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">仕様設定</h2>
        <p className="text-gray-600">製品の仕様と数量を詳細に設定してください</p>
      </div>

      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card variant="error" className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-red-900">エラーがあります</p>
                <ul className="mt-1 text-sm text-red-700">
                  {Object.entries(errors).map(([key, message]) => (
                    <li key={key}>• {message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Products Configuration */}
      <div className="space-y-6">
        {products.map((product, index) => {
          const calculatedQuote = calculatedQuotes[index]
          const isExpanded = calculatedQuote?.isExpanded ?? true

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                {/* Product Header */}
                <div
                  className="p-6 bg-gradient-to-r from-brixa-50 to-brixa-100 border-b border-brixa-600 cursor-pointer"
                  onClick={() => toggleProductExpansion(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-brixa-600 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.product?.name_ja || `製品 ${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {product.product?.description_ja || '製品仕様を設定してください'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-brixa-700">
                          ¥{calculatedQuote?.result?.totalPrice?.toLocaleString() || '---'}
                        </p>
                        <p className="text-sm text-gray-600">
                          @¥{calculatedQuote?.result?.unitPrice?.toLocaleString() || '---'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      {products.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeProduct(index)
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 space-y-6">
                        {/* Basic Specifications */}
                        <div>
                          <div
                            className="flex items-center justify-between mb-4 cursor-pointer"
                            onClick={() => toggleSection(`specifications-${index}`)}
                          >
                            <h4 className="text-lg font-semibold flex items-center">
                              <Calculator className="w-5 h-5 mr-2 text-brixa-600" />
                              基本仕様
                            </h4>
                            {expandedSections.has(`specifications-${index}`) ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </div>

                          {expandedSections.has(`specifications-${index}`) && (
                            <Grid xs={1} sm={2} lg={4} gap={4}>
                              {/* Width */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  幅 (mm) <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={product.specifications?.width || ''}
                                  onChange={(e) => updateProductSpec(index, 'specifications.width', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                                  placeholder="例: 100"
                                  min="10"
                                  max="1000"
                                />
                                {errors[`product_${index}_width`] && (
                                  <p className="mt-1 text-sm text-red-600">{errors[`product_${index}_width`]}</p>
                                )}
                              </div>

                              {/* Height */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  高さ (mm) <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={product.specifications?.height || ''}
                                  onChange={(e) => updateProductSpec(index, 'specifications.height', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                                  placeholder="例: 150"
                                  min="10"
                                  max="1000"
                                />
                                {errors[`product_${index}_height`] && (
                                  <p className="mt-1 text-sm text-red-600">{errors[`product_${index}_height`]}</p>
                                )}
                              </div>

                              {/* Thickness */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  厚さ (μm) <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={product.specifications?.thickness || ''}
                                  onChange={(e) => updateProductSpec(index, 'specifications.thickness', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                                  placeholder="例: 100"
                                  min="10"
                                  max="500"
                                />
                                {errors[`product_${index}_thickness`] && (
                                  <p className="mt-1 text-sm text-red-600">{errors[`product_${index}_thickness`]}</p>
                                )}
                              </div>

                              {/* Quantity */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  数量 <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  value={product.quantity || ''}
                                  onChange={(e) => updateProductSpec(index, 'quantity', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                                  placeholder="例: 1000"
                                  min={product.product?.min_order_quantity || 100}
                                />
                                {errors[`product_${index}_quantity`] && (
                                  <p className="mt-1 text-sm text-red-600">{errors[`product_${index}_quantity`]}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                  最低注文数量: {product.product?.min_order_quantity || 100}個
                                </p>
                              </div>
                            </Grid>
                          )}
                        </div>

                        {/* Material Selection */}
                        <div>
                          <div
                            className="flex items-center justify-between mb-4 cursor-pointer"
                            onClick={() => toggleSection(`material-${index}`)}
                          >
                            <h4 className="text-lg font-semibold flex items-center">
                              <Package className="w-5 h-5 mr-2 text-navy-600" />
                              素材選択
                            </h4>
                            {expandedSections.has(`material-${index}`) ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </div>

                          {expandedSections.has(`material-${index}`) && (
                            <div className="grid grid-cols-1 sm:2 lg:3 gap-4">
                              {MATERIAL_OPTIONS.map((material) => {
                                const isSelected = product.specifications?.materialType === material.value
                                const isAvailable = product.product?.materials.includes(material.value)

                                return (
                                  <div
                                    key={material.value}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                      isSelected
                                        ? 'border-brixa-600 bg-brixa-50 ring-2 ring-brixa-600'
                                        : isAvailable
                                        ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                    }`}
                                    onClick={() => {
                                      if (isAvailable) {
                                        updateProductSpec(index, 'specifications.materialType', material.value)
                                      }
                                    }}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h5 className="font-medium text-gray-900">{material.labelJa}</h5>
                                        <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                                      </div>
                                      {isSelected && (
                                        <Check className="w-5 h-5 text-brixa-600 mt-1" />
                                      )}
                                    </div>
                                    <div className="mt-2">
                                      <Badge variant={isSelected ? 'metallic' : 'secondary'}>
                                        コスト係数: {material.costFactor}
                                      </Badge>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {/* Printing Options */}
                        <div>
                          <div
                            className="flex items-center justify-between mb-4 cursor-pointer"
                            onClick={() => toggleSection(`printing-${index}`)}
                          >
                            <h4 className="text-lg font-semibold flex items-center">
                              <Settings className="w-5 h-5 mr-2 text-purple-500" />
                              印刷オプション
                            </h4>
                            {expandedSections.has(`printing-${index}`) ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </div>

                          {expandedSections.has(`printing-${index}`) && (
                            <div className="space-y-4">
                              {/* Printing Type */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  印刷方式
                                </label>
                                <div className="grid grid-cols-1 sm:2 gap-4">
                                  {PRINTING_TYPES.map((printing) => {
                                    const isSelected = product.customOptions?.printing?.type === printing.value

                                    return (
                                      <div
                                        key={printing.value}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                          isSelected
                                            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                        onClick={() => {
                                          updateProductSpec(index, 'customOptions.printing.type', printing.value)
                                          updateProductSpec(index, 'customOptions.printing.colors', 1)
                                        }}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <h5 className="font-medium text-gray-900">{printing.labelJa}</h5>
                                            <p className="text-sm text-gray-600 mt-1">{printing.description}</p>
                                            <div className="mt-2 space-y-1">
                                              <p className="text-xs text-gray-500">
                                                セットアップ費用: ¥{printing.setupFee.toLocaleString()}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                色1色あたり: ¥{printing.perColorCost}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                最低数量: {printing.minQuantity}個
                                              </p>
                                            </div>
                                          </div>
                                          {isSelected && (
                                            <Check className="w-5 h-5 text-purple-500 mt-1" />
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Color Selection */}
                              {product.customOptions?.printing?.type && (
                                <Grid xs={1} sm={2} lg={4} gap={4}>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      印刷色数
                                    </label>
                                    <select
                                      value={product.customOptions?.printing?.colors || 1}
                                      onChange={(e) => updateProductSpec(index, 'customOptions.printing.colors', parseInt(e.target.value))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                        <option key={num} value={num}>{num}色</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="flex items-end">
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={product.customOptions?.printing?.doubleSided || false}
                                        onChange={(e) => updateProductSpec(index, 'customOptions.printing.doubleSided', e.target.checked)}
                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                      />
                                      <span className="text-sm text-gray-700">両面印刷</span>
                                    </label>
                                  </div>
                                </Grid>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Special Features */}
                        <div>
                          <div
                            className="flex items-center justify-between mb-4 cursor-pointer"
                            onClick={() => toggleSection(`features-${index}`)}
                          >
                            <h4 className="text-lg font-semibold flex items-center">
                              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                              特殊機能
                            </h4>
                            {expandedSections.has(`features-${index}`) ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </div>

                          {expandedSections.has(`features-${index}`) && (
                            <div className="grid grid-cols-1 sm:2 lg:3 gap-4">
                              {SPECIAL_FEATURES.map((feature) => {
                                const isSelected = product.customOptions?.specialFeatures?.includes(feature.value)

                                return (
                                  <div
                                    key={feature.value}
                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                      isSelected
                                        ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-500'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                    onClick={() => {
                                      const currentFeatures = product.customOptions?.specialFeatures || []
                                      const newFeatures = isSelected
                                        ? currentFeatures.filter(f => f !== feature.value)
                                        : [...currentFeatures, feature.value]
                                      updateProductSpec(index, 'customOptions.specialFeatures', newFeatures)
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-900">{feature.labelJa}</span>
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="secondary">
                                          +¥{feature.cost.toLocaleString()}
                                        </Badge>
                                        {isSelected && (
                                          <Check className="w-4 h-4 text-yellow-500" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {/* Delivery Options */}
                        <div>
                          <div
                            className="flex items-center justify-between mb-4 cursor-pointer"
                            onClick={() => toggleSection(`delivery-${index}`)}
                          >
                            <h4 className="text-lg font-semibold flex items-center">
                              <Truck className="w-5 h-5 mr-2 text-green-500" />
                              配送オプション
                            </h4>
                            {expandedSections.has(`delivery-${index}`) ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </div>

                          {expandedSections.has(`delivery-${index}`) && (
                            <Grid xs={1} sm={2} lg={4} gap={4}>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  配送先住所
                                </label>
                                <input
                                  type="text"
                                  value={product.customOptions?.deliveryLocation || ''}
                                  onChange={(e) => updateProductSpec(index, 'customOptions.deliveryLocation', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="東京都千代田区丸の内1-1"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  納期
                                </label>
                                <select
                                  value={product.customOptions?.urgency || 'standard'}
                                  onChange={(e) => updateProductSpec(index, 'customOptions.urgency', e.target.value as 'standard' | 'express')}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                  <option value="standard">通常納期（14-21日）</option>
                                  <option value="express">急ぎ納期（7-10日）</option>
                                </select>
                              </div>
                            </Grid>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Add Product Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={addProduct}
          disabled={products.length >= 6}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>製品を追加（最大6個）</span>
        </Button>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-brixa-50 to-brixa-100 border-brixa-600">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">見積サマリー</h3>
          <div className="grid grid-cols-1 sm:2 lg:4 gap-6">
            <div>
              <p className="text-sm text-gray-600">合計数量</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalQuantity.toLocaleString()}個
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">見積金額</p>
              <p className="text-2xl font-bold text-brixa-700">
                ¥{totalPrice.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">単価平均</p>
              <p className="text-2xl font-bold text-gray-900">
                ¥{totalQuantity > 0 ? Math.round(totalPrice / totalQuantity).toLocaleString() : 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">算定状態</p>
              <div className="flex items-center space-x-2">
                {isCalculating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-brixa-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-brixa-700">計算中...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">計算完了</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <span>戻る</span>
        </Button>

        <Button
          variant="primary"
          onClick={() => onNext({ products })}
          disabled={isLoading || isCalculating || products.length === 0}
          className="flex items-center space-x-2"
        >
          <span>お客様情報へ</span>
          <Calculator className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}