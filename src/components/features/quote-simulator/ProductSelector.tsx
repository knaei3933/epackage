'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Package, Calculator, ChevronDown, Check, ShoppingBag, Box, Archive, FileText, Settings, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Grid } from '@/components/ui/Grid'
import { Badge } from '@/components/ui/Badge'
import { PRODUCT_CATEGORIES } from '@/app/api/products/route'
import { QuoteCalculationParams } from '@/lib/pricing-engine'
import { Product } from '@/types/database'
import { db } from '@/lib/supabase'
import { PricingEngine } from '@/lib/pricing-engine'

// Icon mapping for category icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'shopping-bag': ShoppingBag,
  'package': Package,
  'box': Box,
  'archive': Archive,
  'file': FileText,
  'settings': Settings
}

interface ProductSelectorProps {
  products: QuoteCalculationParams[]
  onChange: (products: QuoteCalculationParams[]) => void
  onNext: (data: { products: QuoteCalculationParams[] }) => void
  errors: Record<string, string>
  isLoading?: boolean
}

interface ProductFormData {
  category: Product['category']
  quantity: number
  specifications: {
    width: number
    height: number
    thickness: number
    materialType: 'PE' | 'PP' | 'PET' | 'ALUMINUM' | 'PAPER_LAMINATE'
    printingColors: number
    specialFeatures?: string[]
  }
  customOptions?: {
    printing?: {
      type: 'digital' | 'gravure'
      colors: number
      doubleSided?: boolean
    }
    specialFeatures?: string[]
    deliveryLocation?: string
    urgency?: 'standard' | 'express'
  }
}

export function ProductSelector({ products, onChange, onNext, errors, isLoading }: ProductSelectorProps) {
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Product['category'] | null>(null)
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  // Load products on mount
  React.useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = useCallback(async () => {
    try {
      const products = await db.getProducts()
      setAvailableProducts(products)
    } catch (error) {
      console.error('Failed to load products:', error)
      // Fallback to empty array
      setAvailableProducts([])
    }
  }, [])

  const addProduct = useCallback(() => {
    if (!selectedCategory) return

    const newProduct: QuoteCalculationParams = {
      product: {
        id: `${selectedCategory}-${Date.now()}`,
        category: selectedCategory,
        name_ja: PRODUCT_CATEGORIES[selectedCategory].name_ja,
        name_en: PRODUCT_CATEGORIES[selectedCategory].name_en,
        description_ja: PRODUCT_CATEGORIES[selectedCategory].description_ja,
        description_en: PRODUCT_CATEGORIES[selectedCategory].description_en,
        specifications: {},
        materials: ['PE', 'PP', 'PET', 'ALUMINUM'],
        pricing_formula: {},
        min_order_quantity: 1000,
        lead_time_days: 14,
        sort_order: 0,
        is_active: true
      } as Product,
      quantity: 1000,
      specifications: {
        width: 100,
        height: 150,
        thickness: 50,
        materialType: 'PE',
        printingColors: 1
      },
      customOptions: {
        printing: {
          type: 'digital',
          colors: 1
        }
      }
    }

    const updatedProducts = [...products, newProduct]
    onChange(updatedProducts)
    setExpandedProducts(new Set(expandedProducts).add(newProduct.product.id))
  }, [selectedCategory, products, onChange])

  const updateProduct = useCallback((index: number, updates: Partial<ProductFormData>) => {
    if (index < 0 || index >= products.length) return

    const updatedProducts = [...products]
    updatedProducts[index] = {
      ...updatedProducts[index],
      specifications: {
        ...updatedProducts[index].specifications,
        ...updates.specifications
      },
      customOptions: {
        ...updatedProducts[index].customOptions,
        ...updates.customOptions
      }
    }
    onChange(updatedProducts)
  }, [products, onChange])

  const removeProduct = useCallback((index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index)
    onChange(updatedProducts)
  }, [products, onChange])

  const calculateQuote = useCallback(async (index: number) => {
    const product = products[index]
    try {
      PricingEngine.validateQuoteParams(product)
      await PricingEngine.calculateQuote(product)
      // Individual calculation successful
    } catch (error) {
      throw new Error(`Product ${index + 1} calculation error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [products])

  const calculateAllQuotes = useCallback(async () => {
    if (products.length === 0) return

    try {
      const quotes = []
      for (let i = 0; i < products.length; i++) {
        await calculateQuote(i)
      }
      onNext({ products })
    } catch (error) {
      console.error('Quote calculation error:', error)
      // Error is handled in parent component
    }
  }, [products, calculateQuote, onNext])

  const totalEstimatedCost = products.reduce((sum, product) => {
    try {
      const baseCost = 15000 // Setup cost estimate
      const unitCost = 5 // Base unit cost
      return sum + baseCost + (unitCost * product.quantity)
    } catch {
      return sum
    }
  }, 0)

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">製品カテゴリー選択</h3>
        <Grid cols={3} gap="md">
          {Object.entries(PRODUCT_CATEGORIES).map(([category, info]) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(category as Product['category'])}
              className={`relative p-6 border-2 rounded-lg text-left transition-all ${
                selectedCategory === category
                  ? 'border-brixa-600 bg-brixa-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full ${info.icon === 'package' ? 'bg-navy-600' : info.icon === 'shopping-bag' ? 'bg-green-100' : 'bg-purple-100'} flex items-center justify-center`}>
                  {(() => {
                    const IconComponent = iconMap[info.icon] || Package
                    return <IconComponent className="w-5 h-5 text-navy-700" />
                  })()}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{info.name_ja}</h4>
                  <p className="text-sm text-gray-600 mt-1">{info.description_ja}</p>
                </div>
              </div>
              {selectedCategory === category && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-brixa-600 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </motion.button>
          ))}
        </Grid>
      </div>

      {/* Selected Products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            見定製品 ({products.length}点)
          </h3>
          <div className="text-sm text-gray-600">
            見定推定コスト: ¥{totalEstimatedCost.toLocaleString()}
          </div>
        </div>

        <AnimatePresence>
          {products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">製品を追加してください</p>
            </motion.div>
          ) : (
            <motion.div className="space-y-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-navy-600 rounded-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-navy-700" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{product.product.name_ja}</h4>
                            <p className="text-sm text-gray-600">{product.product.name_en}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(index)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {/* Expand/Collapse Toggle */}
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedProducts)
                          if (newExpanded.has(product.product.id)) {
                            newExpanded.delete(product.product.id)
                          } else {
                            newExpanded.add(product.product.id)
                          }
                          setExpandedProducts(newExpanded)
                        }}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-sm font-medium">詳細設定</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedProducts.has(product.product.id) ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Expanded Configuration */}
                      <AnimatePresence>
                        {expandedProducts.has(product.product.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                          >
                            <Grid cols={2} gap="md">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  幅 (mm)
                                </label>
                                <input
                                  type="number"
                                  value={product.specifications.width}
                                  onChange={(e) =>
                                    updateProduct(index, {
                                      specifications: {
                                        ...product.specifications,
                                        width: parseInt(e.target.value) || 0
                                      }
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                                  placeholder="100"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  高さ (mm)
                                </label>
                                <input
                                  type="number"
                                  value={product.specifications.height}
                                  onChange={(e) =>
                                    updateProduct(index, {
                                      specifications: {
                                        ...product.specifications,
                                        height: parseInt(e.target.value) || 0
                                      }
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                                  placeholder="150"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  厚さ (μm)
                                </label>
                                <input
                                  type="number"
                                  value={product.specifications.thickness}
                                  onChange={(e) =>
                                    updateProduct(index, {
                                      specifications: {
                                        ...product.specifications,
                                        thickness: parseInt(e.target.value) || 0
                                      }
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                                  placeholder="50"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  素材
                                </label>
                                <select
                                  value={product.specifications.materialType}
                                  onChange={(e) =>
                                    updateProduct(index, {
                                      specifications: {
                                        ...product.specifications,
                                        materialType: e.target.value as ProductFormData['specifications']['materialType']
                                      }
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                                >
                                  <option value="PE">PE (ポリエチレン)</option>
                                  <option value="PP">PP (ポリプロピレン)</option>
                                  <option value="PET">PET (ポリエチレンテレフタレート)</option>
                                  <option value="ALUMINUM">アルミニウム</option>
                                  <option value="PAPER_LAMINATE">紙ラミネート</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  印刷色数
                                </label>
                                <input
                                  type="number"
                                  value={product.specifications.printingColors}
                                  onChange={(e) =>
                                    updateProduct(index, {
                                      specifications: {
                                        ...product.specifications,
                                        printingColors: parseInt(e.target.value) || 0
                                      }
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                                  placeholder="1"
                                  min="0"
                                  max="8"
                                />
                              </div>
                            </Grid>

                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-3">印刷オプション</h5>
                              <Grid cols={2} gap="md">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    印刷方式
                                  </label>
                                  <select
                                    value={product.customOptions?.printing?.type}
                                    onChange={(e) =>
                                      updateProduct(index, {
                                      customOptions: {
                                        ...product.customOptions,
                                        printing: {
                                          ...product.customOptions?.printing,
                                          type: e.target.value as 'digital' | 'gravure',
                                          colors: product.customOptions?.printing?.colors || 1
                                        }
                                      }
                                    })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                                  >
                                    <option value="digital">デジタル印刷</option>
                                    <option value="gravure">グラビア印刷</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    色数
                                  </label>
                                  <input
                                    type="number"
                                    value={product.customOptions?.printing?.colors || 1}
                                    onChange={(e) =>
                                      updateProduct(index, {
                                      customOptions: {
                                        ...product.customOptions,
                                        printing: {
                                          ...product.customOptions?.printing,
                                          colors: parseInt(e.target.value) || 1,
                                          type: product.customOptions?.printing?.type || 'digital'
                                        }
                                      }
                                    })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                                    placeholder="1"
                                    min="1"
                                    max="8"
                                  />
                                </div>
                              </Grid>

                            </div>

                            {/* Quantity */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                数量 <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                value={product.quantity}
                                onChange={(e) =>
                                  updateProduct(index, {
                                  quantity: parseInt(e.target.value) || 0
                                })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                                placeholder="1000"
                                min="100"
                                max="100000"
                              />
                              {errors[`product_${index}_quantity`] && (
                                <p className="mt-1 text-sm text-red-600">
                                  {errors[`product_${index}_quantity`]}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Product Button */}
        <div className="flex justify-center">
          <Button
            onClick={addProduct}
            disabled={!selectedCategory}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>製品を追加</span>
          </Button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            合計 {products.length}製品
          </div>
          <Button
            variant="primary"
            onClick={calculateAllQuotes}
            disabled={products.length === 0 || isLoading}
            className="flex items-center space-x-2"
          >
            <Calculator className="w-4 h-4" />
            <span>{isLoading ? '計算中...' : '見積計算へ'}</span>
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <Card variant="error" className="p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-medium text-red-900">入力エラーがあります</p>
              <ul className="mt-1 text-sm text-red-700">
                {Object.entries(errors).map(([key, message]) => (
                  <li key={key}>• {message}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}