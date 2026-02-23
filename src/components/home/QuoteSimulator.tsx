'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { CurrencyBadge } from '@/components/ui/Badge'
import {
  Calculator,
  Package,
  TrendingUp,
  Clock,
  Truck,
  CheckCircle,
  ArrowRight,
  FileText,
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { PostProcessingPreview } from '@/components/quote/previews/PostProcessingPreview'

interface QuoteFormData {
  productType: string
  quantity: string
  size: string
  printing: string
  material: string
  timeline: string
  name: string
  email: string
  phone: string
  company: string
}

interface QuoteResult {
  estimatedPrice: number
  unitPrice: number
  leadTime: string
  moq: number
  recommendations: string[]
  postProcessingOptions: string[]
}

export function QuoteSimulator() {
  const [formData, setFormData] = useState<QuoteFormData>({
    productType: '',
    quantity: '',
    size: '',
    printing: '',
    material: '',
    timeline: '',
    name: '',
    email: '',
    phone: '',
    company: ''
  })

  const [result, setResult] = useState<QuoteResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedPostProcessing, setSelectedPostProcessing] = useState<string[]>([])
  const [postProcessingMultiplier, setPostProcessingMultiplier] = useState(1.0)

  const productTypes = [
    { value: 'stand_up', label: 'スタンディングパウチ', description: '底マチ付きで安定性が高い' },
    { value: 'flat_3_side', label: '三方シール平袋', description: 'コスト効率に優れた基本形状' },
    { value: 'flat_with_zip', label: 'チャック付き平袋', description: '反復使用可能な便利な形状' },
    { value: 'gusset', label: 'ガゼットパウチ', description: '容量拡張可能な大型対応' },
    { value: 'box', label: 'ガゼットパウチ', description: '立体形状で高級感を演出' },
    { value: 'soft_pouch', label: 'ソフトパウチ', description: '柔軟性の高い液体向け' },
    { value: 'special', label: '特殊仕様', description: '完全オーダーメイド対応' }
  ]

  const quantityOptions = [
    { value: 'small', label: '小ロット', range: '1,000〜5,000枚', basePrice: 50 },
    { value: 'medium', label: '中ロット', range: '5,001〜20,000枚', basePrice: 30 },
    { value: 'large', label: '大ロット', range: '20,001〜50,000枚', basePrice: 20 },
    { value: 'enterprise', label: 'エンタープライズ', range: '50,001枚以上', basePrice: 15 }
  ]

  const sizeOptions = [
    { value: 'small', label: '小サイズ', multiplier: 1.0, example: '100x150mm' },
    { value: 'medium', label: '中サイズ', multiplier: 1.5, example: '150x200mm' },
    { value: 'large', label: '大サイズ', multiplier: 2.0, example: '200x300mm' },
    { value: 'xl', label: '特大サイズ', multiplier: 2.5, example: '300x400mm' }
  ]

  const calculateQuote = async () => {
    setIsCalculating(true)

    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const quantityOption = quantityOptions.find(q => q.value === formData.quantity)
    const sizeOption = sizeOptions.find(s => s.value === formData.size)
    const productType = productTypes.find(p => p.value === formData.productType)

    if (!quantityOption || !sizeOption || !productType) {
      setIsCalculating(false)
      return
    }

    // Base calculation
    const basePrice = quantityOption.basePrice
    const sizeMultiplier = sizeOption.multiplier
    const printingMultiplier = formData.printing === 'full' ? 1.5 : formData.printing === 'spot' ? 1.2 : 1.0
    const materialMultiplier = formData.material === 'premium' ? 1.3 : formData.material === 'standard' ? 1.0 : 0.9
    const timelineMultiplier = formData.timeline === 'urgent' ? 1.4 : formData.timeline === 'standard' ? 1.0 : 0.9

    const unitPrice = basePrice * sizeMultiplier * printingMultiplier * materialMultiplier * timelineMultiplier * postProcessingMultiplier
    const estimatedPrice = unitPrice * 1000 // Base on 1000 units

    // Generate recommendations
    const recommendations = []

    if (formData.quantity === 'small') {
      recommendations.push('大ロット生産で単価を30%削減できます')
    }

    if (formData.printing === 'full') {
      recommendations.push('スポット印刷にすることでコストを20%削減できます')
    }

    if (formData.timeline === 'standard') {
      recommendations.push('納期を2週間延長することで10%コスト削減が可能です')
    }

    if (formData.material === 'premium') {
      recommendations.push('標準仕様で同等の品質を維持しつつコストを削減できます')
    }

    if (selectedPostProcessing.length > 0) {
      recommendations.push(`選択された${selectedPostProcessing.length}個の後加工オプションで製品価値が向上します`)
    }

    setResult({
      estimatedPrice: Math.round(estimatedPrice),
      unitPrice: Math.round(unitPrice * 10) / 10,
      leadTime: formData.timeline === 'urgent' ? '1〜2週間' : formData.timeline === 'express' ? '2〜3週間' : '3〜4週間',
      moq: formData.quantity === 'small' ? 1000 : formData.quantity === 'medium' ? 5000 : formData.quantity === 'large' ? 20000 : 50000,
      recommendations,
      postProcessingOptions: selectedPostProcessing
    })

    setIsCalculating(false)
    setStep(formData.productType ? 3 : 4)
  }

  const resetForm = () => {
    setFormData({
      productType: '',
      quantity: '',
      size: '',
      printing: '',
      material: '',
      timeline: '',
      name: '',
      email: '',
      phone: '',
      company: ''
    })
    setResult(null)
    setStep(1)
    setSelectedPostProcessing([])
    setPostProcessingMultiplier(1.0)
  }

  const handleInputChange = (field: keyof QuoteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (step < 2) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-navy-50 via-white to-brixa-50">
      <Container size="4xl">
        {/* Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-navy-700 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Calculator className="w-4 h-4" />
              <span>AI見積もりシミュレーター</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              30秒でわかる包装材費用
              <span className="block text-navy-700 mt-2">正確なお見積もりを即時計算</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              製品仕様を入力するだけで、最適な価格と納期を算出します。
              業界最安水準の価格設定で、コストを可視化。
            </p>
          </div>
        </MotionWrapper>

        {/* Progress Bar */}
        <MotionWrapper delay={0.2}>
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-navy-700' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-navy-700 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="text-sm font-medium">基本仕様</span>
              </div>
              <div className={`w-16 h-1 rounded ${step >= 2 ? 'bg-navy-700' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-navy-700' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-navy-700 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="text-sm font-medium">詳細設定</span>
              </div>
              <div className={`w-16 h-1 rounded ${step >= 3 ? 'bg-navy-700' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-navy-700' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 3 ? 'bg-navy-700 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="text-sm font-medium">後加工オプション</span>
              </div>
              <div className={`w-16 h-1 rounded ${step >= 4 ? 'bg-navy-700' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center space-x-2 ${step >= 4 ? 'text-navy-700' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 4 ? 'bg-navy-700 text-white' : 'bg-gray-200'}`}>
                  4
                </div>
                <span className="text-sm font-medium">結果と提案</span>
              </div>
            </div>
          </div>
        </MotionWrapper>

        <div className="max-w-4xl mx-auto">
          {step === 1 && (
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
                      {productTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleInputChange('productType', type.value)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            formData.productType === type.value
                              ? 'border-navy-600 bg-navy-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-semibold text-gray-900">{type.label}</div>
                          <div className="text-sm text-gray-600 mt-1">{type.description}</div>
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
                              ? 'border-navy-600 bg-navy-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-semibold text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600 mt-1">{option.range}</div>
                          <div className="text-sm font-medium text-navy-700 mt-2">
                            ¥{option.basePrice}/枚〜
                          </div>
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
                              ? 'border-navy-600 bg-navy-50'
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

          {step === 2 && (
            <MotionWrapper delay={0.3}>
              <Card className="p-8">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    ステップ2：詳細設定
                  </CardTitle>
                  <p className="text-gray-600">
                    印刷や素材、納期などの詳細を設定してください
                  </p>
                </CardHeader>

                <CardContent className="space-y-8">
                  {/* Printing */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      印刷仕様 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <button
                        onClick={() => handleInputChange('printing', 'none')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.printing === 'none'
                            ? 'border-navy-600 bg-navy-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">印刷なし</div>
                        <div className="text-sm text-gray-600 mt-1">無地シンプル仕様</div>
                      </button>
                      <button
                        onClick={() => handleInputChange('printing', 'spot')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.printing === 'spot'
                            ? 'border-navy-600 bg-navy-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">スポット印刷</div>
                        <div className="text-sm text-gray-600 mt-1">1〜2色シンプル印刷</div>
                      </button>
                      <button
                        onClick={() => handleInputChange('printing', 'full')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.printing === 'full'
                            ? 'border-navy-600 bg-navy-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">フルカラー印刷</div>
                        <div className="text-sm text-gray-600 mt-1">写真・グラデーション対応</div>
                      </button>
                    </div>
                  </div>

                  {/* Material */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      素材仕様 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                      <button
                        onClick={() => handleInputChange('material', 'economy')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.material === 'economy'
                            ? 'border-navy-600 bg-navy-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">エコノミー</div>
                        <div className="text-sm text-gray-600 mt-1">コスト重視の基本仕様</div>
                      </button>
                      <button
                        onClick={() => handleInputChange('material', 'standard')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.material === 'standard'
                            ? 'border-navy-600 bg-navy-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">スタンダード</div>
                        <div className="text-sm text-gray-600 mt-1">バランスの取れた一般仕様</div>
                      </button>
                      <button
                        onClick={() => handleInputChange('material', 'premium')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.material === 'premium'
                            ? 'border-navy-600 bg-navy-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">プレミアム</div>
                        <div className="text-sm text-gray-600 mt-1">高バリア性・高機能仕様</div>
                      </button>
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
                            ? 'border-navy-600 bg-navy-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">至急</div>
                        <div className="text-sm text-gray-600 mt-1">1〜2週間（費用+40%）</div>
                      </button>
                      <button
                        onClick={() => handleInputChange('timeline', 'standard')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.timeline === 'standard'
                            ? 'border-navy-600 bg-navy-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">標準</div>
                        <div className="text-sm text-gray-600 mt-1">2〜3週間（標準費用）</div>
                      </button>
                      <button
                        onClick={() => handleInputChange('timeline', 'flexible')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          formData.timeline === 'flexible'
                            ? 'border-navy-600 bg-navy-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">柔軟</div>
                        <div className="text-sm text-gray-600 mt-1">3〜4週間（費用-10%）</div>
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      お客様情報 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <input
                          type="text"
                          placeholder="お名前"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="メールアドレス"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          placeholder="電話番号"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="会社名"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={prevStep} className="px-8">
                      戻る
                    </Button>
                    <Button
                      variant="primary"
                      onClick={calculateQuote}
                      disabled={!formData.printing || !formData.material || !formData.timeline || !formData.name || !formData.email}
                      className="px-8"
                    >
                      {isCalculating ? '計算中...' : '見積もり計算'}
                      <Calculator className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </MotionWrapper>
          )}

          {/* Step 3: Post-Processing Options */}
          {step === 3 && formData.productType && (
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
                  戻る
                </Button>
                <Button
                  variant="primary"
                  onClick={calculateQuote}
                  disabled={!formData.printing || !formData.material || !formData.timeline || !formData.name || !formData.email}
                  className="px-8"
                >
                  {isCalculating ? '計算中...' : '見積もり計算'}
                  <Calculator className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </MotionWrapper>
          )}

          {step === 4 && result && (
            <MotionWrapper delay={0.3}>
              <div className="space-y-8">
                {/* Result Card */}
                <Card className="p-8 bg-gradient-to-br from-navy-50 to-brixa-50 border-navy-600">
                  <CardHeader className="text-center pb-6">
                    <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium mb-4">
                      <CheckCircle className="w-5 h-5" />
                      <span>見積もり計算完了</span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      あなた専用のお見積もり
                    </CardTitle>
                    <p className="text-gray-600">
                      入力された仕様に基づいた正確な費用試算
                    </p>
                  </CardHeader>

                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <Card className="p-6 bg-white border-gray-200">
                        <div className="text-center">
                          <CurrencyBadge
                            amount={result.estimatedPrice}
                            currency="JPY"
                            size="lg"
                            className="justify-center mb-2"
                          />
                          <p className="text-sm text-gray-600">見積総額（税別）</p>
                        </div>
                      </Card>
                      <Card className="p-6 bg-white border-gray-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-2">
                            ¥{result.unitPrice}
                          </div>
                          <p className="text-sm text-gray-600">単価（1枚あたり）</p>
                        </div>
                      </Card>
                      <Card className="p-6 bg-white border-gray-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-2">
                            {result.leadTime}
                          </div>
                          <p className="text-sm text-gray-600">納期</p>
                        </div>
                      </Card>
                    </div>

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          💡 コスト削減提案
                        </h3>
                        <div className="space-y-2">
                          {result.recommendations.map((rec, index) => (
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
                          <span className="text-gray-600">数量：</span>
                          <span className="font-medium text-gray-900 ml-2">
                            {quantityOptions.find(q => q.value === formData.quantity)?.label}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">最小ロット：</span>
                          <span className="font-medium text-gray-900 ml-2">{result.moq.toLocaleString()}枚</span>
                        </div>
                        {result.postProcessingOptions.length > 0 && (
                          <div className="col-span-3">
                            <span className="text-gray-600">後加工オプション：</span>
                            <span className="font-medium text-gray-900 ml-2">
                              {result.postProcessingOptions.length}個選択済み
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
                    <Button variant="outline" size="lg" onClick={resetForm} className="justify-center px-8">
                      <Calculator className="mr-2 h-5 w-5" />
                      再計算する
                    </Button>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center text-sm">
                    <a href="tel:050-1793-6500" className="flex items-center justify-center space-x-2 text-navy-700 hover:text-navy-600">
                      <Phone className="w-4 h-4" />
                      <span>050-1793-6500</span>
                    </a>
                    <a href="mailto:info@package-lab.com" className="flex items-center justify-center space-x-2 text-navy-700 hover:text-navy-600">
                      <Mail className="w-4 h-4" />
                      <span>info@package-lab.com</span>
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