'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Calculator, Package, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProductSelector } from '../selectors/ProductSelector'
import { ConfigurationPanel } from '../selectors/ConfigurationPanel'
import { PriceBreakdown } from '../shared/PriceBreakdown'
import { PricingEngine, QuoteResult, QuoteCalculationParams } from '@/lib/pricing-engine'
import { Product } from '@/types/database'

interface QuoteWizardProps {
  onQuoteComplete: (quote: QuoteResult) => void
  initialData?: Partial<QuoteCalculationParams[]>
}

interface QuoteData {
  products: QuoteCalculationParams[]
  customerInfo: {
    companyName: string
    contactPerson: string
    email: string
    phone?: string
  }
  deliveryLocation?: string
  urgency?: 'standard' | 'express'
  notes?: string
}

export function QuoteWizard({ onQuoteComplete, initialData = [] }: QuoteWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [quoteData, setQuoteData] = useState<QuoteData>({
    products: [],
    customerInfo: {
      companyName: '',
      contactPerson: '',
      email: '',
      phone: ''
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [calculatedQuotes, setCalculatedQuotes] = useState<QuoteResult[]>([])

  const steps = [
    {
      title: '製品選択',
      description: '見積もれたい製品を選択してください',
      icon: Package,
      component: ProductSelector
    },
    {
      title: '仕様設定',
      description: '製品の仕様と数量を設定してください',
      icon: Calculator,
      component: ConfigurationPanel
    },
    {
      title: 'お客様情報',
      description: 'お客様の基本情報を入力してください',
      icon: Check,
      component: () => <CustomerInfoForm data={quoteData} onChange={setQuoteData} errors={errors} />
    },
    {
      title: '見積結果',
      description: '見積結果をご確認ください',
      icon: Check,
      component: () => (
        <PriceBreakdown
          quotes={calculatedQuotes}
          customerInfo={quoteData.customerInfo}
          onEdit={() => setCurrentStep(1)}
        />
      )
    }
  ]

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 0: // Product selection
        if (quoteData.products.length === 0) {
          newErrors.products = '少なくとも1つの製品を選択してください'
        }
        break

      case 1: // Configuration
        quoteData.products.forEach((product, index) => {
          if (!product.specifications) {
            newErrors[`product_${index}_specs`] = '製品仕様を設定してください'
          }
          if (!product.quantity || product.quantity < 100) {
            newErrors[`product_${index}_quantity`] = '数量は100以上で設定してください'
          }
        })
        break

      case 2: // Customer info
        if (!quoteData.customerInfo.companyName.trim()) {
          newErrors.companyName = '会社名を入力してください'
        }
        if (!quoteData.customerInfo.contactPerson.trim()) {
          newErrors.contactPerson = '担当者名を入力してください'
        }
        if (!quoteData.customerInfo.email.trim()) {
          newErrors.email = 'メールアドレスを入力してください'
        }
        if (quoteData.customerInfo.email && !quoteData.customerInfo.email.includes('@')) {
          newErrors.email = '有効なメールアドレスを入力してください'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [quoteData])

  const handleNext = useCallback(async (stepData: any) => {
    // Validate current step before proceeding
    if (!validateStep(currentStep)) {
      return
    }

    // Update quote data
    if (currentStep === 0) {
      // Product selection step
      setQuoteData(prev => ({ ...prev, products: stepData.products || [] }))
    } else if (currentStep === 1) {
      // Configuration step - calculate prices
      setQuoteData(prev => ({ ...prev, products: stepData.products || [] }))

      setIsLoading(true)
      try {
        const quotes: QuoteResult[] = []
        for (const product of stepData.products) {
          const result = await PricingEngine.calculateQuote(product)
          quotes.push(result)
        }
        setCalculatedQuotes(quotes)
      } catch (error) {
        setErrors({ calculation: `見積計算エラー: ${error instanceof Error ? error.message : String(error)}` })
        return
      } finally {
        setIsLoading(false)
      }
    } else if (currentStep === 2) {
      // Customer info step
      setQuoteData(prev => ({ ...prev, customerInfo: stepData.customerInfo }))
    }

    // Move to next step or complete
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Complete quote - submit to API
      await submitQuote()
    }
  }, [currentStep, validateStep, quoteData, calculatedQuotes])

  const handleBack = useCallback(() => {
    setErrors({})
    setCurrentStep(prev => Math.max(0, prev - 1))
  }, [])

  const submitQuote = useCallback(async () => {
    if (!validateStep(3)) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerInfo: quoteData.customerInfo,
          products: quoteData.products,
          deliveryLocation: quoteData.deliveryLocation,
          urgency: quoteData.urgency,
          notes: quoteData.notes
        })
      })

      const result = await response.json()

      if (result.success) {
        onQuoteComplete({
          breakdown: calculatedQuotes.reduce((acc, quote) => ({
            material: acc.material + quote.breakdown.material,
            processing: acc.processing + quote.breakdown.processing,
            printing: acc.printing + quote.breakdown.printing,
            setup: acc.setup + quote.breakdown.setup,
            discount: acc.discount + quote.breakdown.discount,
            delivery: acc.delivery + quote.breakdown.delivery,
            subtotal: acc.subtotal + quote.breakdown.subtotal,
            total: acc.total + quote.breakdown.total
          }), {
            material: 0,
            processing: 0,
            printing: 0,
            setup: 0,
            discount: 0,
            delivery: 0,
            subtotal: 0,
            total: 0
          }),
          unitPrice: result.quote.summary.total / quoteData.products.reduce((sum, p) => sum + p.quantity, 0),
          totalPrice: result.quote.summary.total,
          currency: result.quote.summary.currency,
          validUntil: new Date(result.quote.summary.validUntil),
          leadTimeDays: result.quote.summary.leadTimeDays,
          minOrderQuantity: Math.max(...quoteData.products.map(p => p.product.min_order_quantity))
        })
      } else {
        throw new Error(result.error || '見積送信に失敗しました')
      }
    } catch (error) {
      setErrors({ submit: `見積送信エラー: ${error instanceof Error ? error.message : String(error)}` })
    } finally {
      setIsLoading(false)
    }
  }, [quoteData, calculatedQuotes, validateStep, onQuoteComplete])

  // Handle ProductSelector changes (it only updates products)
  const handleProductSelectorChange = (products: QuoteCalculationParams[]) => {
    setQuoteData(prev => ({ ...prev, products }))
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            return (
              <div key={index} className="flex items-center flex-1">
                <div className="flex items-center justify-center">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      isActive
                        ? 'bg-brixa-600 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </motion.div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-brixa-700' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h3>
          <p className="text-sm text-gray-600">
            {steps[currentStep].description}
          </p>
        </div>
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

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 mb-6">
              {currentStep === 0 && (
              <ProductSelector
                products={quoteData.products}
                onChange={handleProductSelectorChange}
                onNext={handleNext}
                errors={errors}
                isLoading={isLoading}
              />
            )}
            {currentStep === 1 && (
              <ConfigurationPanel
                products={quoteData.products}
                onChange={handleProductSelectorChange}
                onNext={handleNext}
                onBack={handleBack}
                errors={errors}
                isLoading={isLoading}
              />
            )}
            {currentStep === 2 && (
              <PriceBreakdown
                quotes={calculatedQuotes}
                customerInfo={quoteData.customerInfo}
                onEdit={handleBack}
              />
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0 || isLoading}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>戻る</span>
        </Button>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            ステップ {currentStep + 1} / {steps.length}
          </div>
          <Button
            variant="primary"
            onClick={() => handleNext(quoteData)}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <span>次へ</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Customer Info Form Component
function CustomerInfoForm({
  data,
  onChange,
  errors
}: {
  data: QuoteData
  onChange: (data: QuoteData) => void
  errors: Record<string, string>
}) {
  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      customerInfo: {
        ...data.customerInfo,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            会社名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.customerInfo.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent ${
              errors.companyName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="株式会社〇〇"
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            担当者名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.customerInfo.contactPerson}
            onChange={(e) => updateField('contactPerson', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent ${
              errors.contactPerson ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="山田 太郎"
          />
          {errors.contactPerson && (
            <p className="mt-1 text-sm text-red-600">{errors.contactPerson}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.customerInfo.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="company@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            電話番号
          </label>
          <input
            type="tel"
            value={data.customerInfo.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
            placeholder="03-1234-5678"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          配送先住所
        </label>
        <input
          type="text"
          value={data.deliveryLocation || ''}
          onChange={(e) => onChange({ ...data, deliveryLocation: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
          placeholder="東京都千代田区丸の内1-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          希望納期
        </label>
        <select
          value={data.urgency || 'standard'}
          onChange={(e) => onChange({ ...data, urgency: e.target.value as 'standard' | 'express' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
        >
          <option value="standard">通常納期（14-21日）</option>
          <option value="express">急ぎ納期（7-10日）</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          備考
        </label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
          rows={4}
          placeholder="特記事項やご要望などがございましたらご記入ください"
        />
      </div>
    </div>
  )
}