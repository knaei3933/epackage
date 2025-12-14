'use client'

import React, { useState, useEffect } from 'react'
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
  Minus
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface PriceResult {
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
}

interface MaterialOption {
  id: string
  name: string
  description: string
  multiplier: number
  features: string[]
  popular?: boolean
  ecoFriendly?: boolean
}

interface PrintingOption {
  id: string
  name: string
  description: string
  costPerUnit: number
  setupCost: number
  features: string[]
}

export function AdvancedPouchPriceCalculator() {
  const [selectedPouch, setSelectedPouch] = useState('stand-up')
  const [size, setSize] = useState({ width: 120, height: 200 })
  const [quantity, setQuantity] = useState(5000)
  const [material, setMaterial] = useState('standard')
  const [printing, setPrinting] = useState('digital')
  const [addFeatures, setAddFeatures] = useState<string[]>([])
  const [urgency, setUrgency] = useState('standard')
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null)
  const [comparisonMode, setComparisonMode] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const pouchTypes = [
    {
      id: 'soft-3seal',
      name: 'ソフトパウチ（3シール）',
      basePrice: 15,
      description: '最も一般的なパウチ形状',
      icon: Package,
      features: ['コストパフォーマンス最優', '多用途対応', '迅速生産'],
      popularity: 'high'
    },
    {
      id: 'stand-up',
      name: 'スタンディングパウチ',
      basePrice: 25,
      description: '自立するチャック付きパウチ',
      icon: TrendingUp,
      features: ['陳列性に優れる', '再封可能', '高級感'],
      popularity: 'very-high'
    },
    {
      id: 'gusset',
      name: 'ガゼットパウチ',
      basePrice: 22,
      description: 'マチ付きで容量アップ',
      icon: Layers,
      features: ['大容量対応', '自立安定性', '底部マチ'],
      popularity: 'medium'
    },
    {
      id: 'pillow',
      name: 'ピローパウチ',
      basePrice: 16,
      description: '定番の枕型パウチ',
      icon: Package,
      features: ['定番デザイン', '製造容易', 'コスト安価'],
      popularity: 'medium'
    },
    {
      id: 'triangle',
      name: '三角パウチ',
      basePrice: 20,
      description: '液体・粉末包装に最適',
      icon: Settings,
      features: ['液体対応', '注ぎ口設計', '密封性高い'],
      popularity: 'low'
    }
  ]

  const materials: MaterialOption[] = [
    {
      id: 'standard',
      name: 'PE（ポリエチレン）',
      description: '標準素材で安価',
      multiplier: 1.0,
      features: ['透明性高い', '柔軟性', '熱密封可能'],
      popular: true
    },
    {
      id: 'pet',
      name: 'PET（ポリエステル）',
      description: '強度と透明性',
      multiplier: 1.3,
      features: ['強度高い', 'ガスバリア性', '印刷適性'],
      popular: true
    },
    {
      id: 'aluminum',
      name: 'アルミラミネート',
      description: '遮光性とバリア性',
      multiplier: 1.8,
      features: ['完全遮光', 'ガスバリア性', '長期保存'],
      ecoFriendly: false
    },
    {
      id: 'kraft',
      name: 'クラフト紙',
      description: '自然な質感',
      multiplier: 1.4,
      features: ['自然な質感', '環境対応', '印刷適性'],
      ecoFriendly: true
    },
    {
      id: 'bio',
      name: '生分解性素材',
      description: '環境配慮型',
      multiplier: 1.6,
      features: ['生分解性', '環境対応', '持続可能性'],
      ecoFriendly: true
    }
  ]

  const printingOptions: PrintingOption[] = [
    {
      id: 'none',
      name: '印刷なし',
      description: '無印刷',
      costPerUnit: 0,
      setupCost: 0,
      features: ['最安価格', '納期最短']
    },
    {
      id: 'digital',
      name: 'デジタル印刷',
      description: '小ロット対応',
      costPerUnit: 2,
      setupCost: 5000,
      features: ['フルカラー', '版代不要', '1枚から対応']
    },
    {
      id: 'flexo',
      name: 'フレキソ印刷',
      description: '大ロット向け',
      costPerUnit: 0.8,
      setupCost: 30000,
      features: ['高品質', '大ロット安価', '企業ロゴ対応']
    },
    {
      id: 'gravure',
      name: 'グラビア印刷',
      description: '最高品質',
      costPerUnit: 1.2,
      setupCost: 50000,
      features: ['最高品質', '写真品質', '長期保存']
    }
  ]

  const additionalFeatures = [
    { id: 'zipper', name: 'ジッパー付き', cost: 2000, description: '再封可能' },
    { id: 'valve', name: 'エアバルブ', cost: 1500, description: 'ガス抜き' },
    { id: 'tear-notch', name: 'ティアノッチ', cost: 500, description: '開封容易' },
    { id: 'hanging-hole', name: '吊り穴', cost: 800, description: '陳列用' },
    { id: 'clear-window', name: '透明窓', cost: 3000, description: '内容物見える' }
  ]

  const urgencyOptions = [
    {
      id: 'standard',
      name: '標準納期',
      multiplier: 1.0,
      days: 7,
      description: '7営業日'
    },
    {
      id: 'express',
      name: '優先納期',
      multiplier: 1.2,
      days: 4,
      description: '4営業日'
    },
    {
      id: 'urgent',
      name: '緊急対応',
      multiplier: 1.4,
      days: 2,
      description: '2営業日'
    }
  ]

  useEffect(() => {
    calculatePrice()
  }, [selectedPouch, size, quantity, material, printing, addFeatures, urgency])

  const calculatePrice = () => {
    const pouch = pouchTypes.find(p => p.id === selectedPouch)
    const materialOption = materials.find(m => m.id === material)
    const printingOption = printingOptions.find(p => p.id === printing)
    const urgencyOption = urgencyOptions.find(u => u.id === urgency)

    if (!pouch || !materialOption || !printingOption || !urgencyOption) return

    // 基本価格計算
    const baseArea = 15000 // 基準サイズ 100x150
    const actualArea = size.width * size.height
    const sizeMultiplier = actualArea / baseArea

    // 素材価格
    const materialMultiplier = materialOption.multiplier

    // 数量割引
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

    // 基本単価計算
    const baseUnitPrice = pouch.basePrice * sizeMultiplier * materialMultiplier
    const discountedUnitPrice = baseUnitPrice * (1 - discountRate)

    // 印刷コスト
    const printingUnitCost = printingOption.costPerUnit
    const printingSetupCost = printingOption.setupCost

    // 追加機能コスト
    const featuresCost = addFeatures.reduce((total, featureId) => {
      const feature = additionalFeatures.find(f => f.id === featureId)
      return total + (feature?.cost || 0)
    }, 0)

    // 単価計算
    const unitPrice = (discountedUnitPrice + printingUnitCost) * urgencyOption.multiplier

    // セットアップコスト
    const setupCost = printingSetupCost + featuresCost

    // 総コスト
    const totalPrice = unitPrice * quantity
    const totalCost = totalPrice + setupCost

    // 節約額計算
    const standardPrice = baseUnitPrice * quantity + setupCost
    const savings = standardPrice - totalCost
    const savingsRate = (savings / standardPrice) * 100

    // おすすめ数量計算
    const recommendedQuantity = quantity >= 10000 ? quantity :
                               quantity >= 5000 ? 10000 : 5000

    const result: PriceResult = {
      unitPrice: Math.round(unitPrice),
      totalPrice: Math.round(totalPrice),
      setupCost: Math.round(setupCost),
      totalCost: Math.round(totalCost),
      savings: Math.round(savings),
      savingsRate: Math.round(savingsRate),
      priceBreak,
      leadTime: urgencyOption.days,
      recommendedQuantity,
      priceTrend: quantity >= 10000 ? 'decreasing' : 'stable',
      bulkDiscount: Math.round(discountRate * 100)
    }

    setPriceResult(result)
  }

  const handleFeatureToggle = (featureId: string) => {
    setAddFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    )
  }

  const getQuantityPresets = () => [
    { label: '500', value: 500 },
    { label: '1,000', value: 1000 },
    { label: '5,000', value: 5000 },
    { label: '10,000', value: 10000 },
    { label: '20,000', value: 20000 },
    { label: '50,000+', value: 50000 }
  ]

  const SizeControls = () => (
    <div className="space-y-4">
      <div>
        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
          横幅 (mm)
          <span className="text-brixa-700 font-semibold">{size.width}mm</span>
        </label>
        <input
          type="range"
          min="50"
          max="400"
          value={size.width}
          onChange={(e) => setSize(prev => ({ ...prev, width: parseInt(e.target.value) }))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brixa-700"
        />
      </div>
      <div>
        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
          高さ (mm)
          <span className="text-brixa-700 font-semibold">{size.height}mm</span>
        </label>
        <input
          type="range"
          min="80"
          max="600"
          value={size.height}
          onChange={(e) => setSize(prev => ({ ...prev, height: parseInt(e.target.value) }))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brixa-700"
        />
      </div>
      <div className="text-center">
        <Badge variant="secondary" className="bg-navy-600 text-navy-600">
          面積: {(size.width * size.height).toLocaleString()}mm²
        </Badge>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* パウチタイプ選択 */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Package className="w-5 h-5 text-brixa-700 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">パウチタイプ</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {pouchTypes.map((pouch) => (
            <motion.button
              key={pouch.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPouch(pouch.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedPouch === pouch.id
                  ? 'border-brixa-600 bg-brixa-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <pouch.icon className={`w-8 h-8 mx-auto mb-2 ${
                selectedPouch === pouch.id ? 'text-brixa-700' : 'text-gray-400'
              }`} />
              <h4 className="font-medium text-sm text-gray-900 mb-1">{pouch.name}</h4>
              <p className="text-xs text-gray-600 mb-2">{pouch.description}</p>
              {pouch.popularity === 'very-high' && (
                <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                  人気No.1
                </Badge>
              )}
            </motion.button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側 - 設定 */}
        <div className="space-y-6">
          {/* サイズ設定 */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 text-brixa-700 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">サイズ設定</h3>
            </div>
            <SizeControls />
          </Card>

          {/* 数量設定 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Layers className="w-5 h-5 text-brixa-700 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">数量</h3>
              </div>
              <span className="text-2xl font-bold text-brixa-700">{quantity.toLocaleString()}</span>
            </div>
            <div className="space-y-4">
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brixa-700"
              />
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {getQuantityPresets().map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setQuantity(preset.value)}
                    className={`py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                      quantity === preset.value
                        ? 'bg-brixa-700 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* 素材選択 */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Layers className="w-5 h-5 text-brixa-700 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">素材</h3>
            </div>
            <div className="space-y-3">
              {materials.map((mat) => (
                <motion.div
                  key={mat.id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    material === mat.id
                      ? 'border-brixa-600 bg-brixa-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setMaterial(mat.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{mat.name}</h4>
                        {mat.popular && (
                          <Badge variant="secondary" className="text-xs">人気</Badge>
                        )}
                        {mat.ecoFriendly && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            エコ
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{mat.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {mat.features.map((feature, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        ×{mat.multiplier}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* 印刷オプション */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Zap className="w-5 h-5 text-brixa-700 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">印刷</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {printingOptions.map((option) => (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    printing === option.id
                      ? 'border-brixa-600 bg-brixa-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPrinting(option.id)}
                >
                  <h4 className="font-medium text-gray-900 mb-1">{option.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                  <div className="text-xs text-gray-700">
                    <div>単価: +¥{option.costPerUnit}</div>
                    <div>セットアップ: ¥{option.setupCost.toLocaleString()}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* 右側 - 結果と詳細設定 */}
        <div className="space-y-6">
          {/* 価格計算結果 */}
          {priceResult && (
            <Card className="p-6 bg-gradient-to-br from-brixa-50 to-brixa-100 border-brixa-600">
              <div className="flex items-center mb-4">
                <Calculator className="w-6 h-6 text-brixa-700 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">価格計算結果</h3>
              </div>

              <div className="space-y-4">
                {/* 主要価格表示 */}
                <div className="text-center py-4 bg-white rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">単価</div>
                  <div className="text-4xl font-bold text-brixa-700">
                    ¥{priceResult.unitPrice.toLocaleString()}
                  </div>
                  {priceResult.bulkDiscount > 0 && (
                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                      {priceResult.bulkDiscount}%割引適用
                    </Badge>
                  )}
                </div>

                {/* 詳細価格 */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">製品価格 ({quantity.toLocaleString()}個)</span>
                    <span className="font-semibold">¥{priceResult.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">セットアップ費用</span>
                    <span className="font-semibold">¥{priceResult.setupCost.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">総額</span>
                      <span className="text-2xl font-bold text-brixa-700">
                        ¥{priceResult.totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 節約額 */}
                {priceResult.savings > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-green-800 font-medium">節約額</span>
                      </div>
                      <span className="text-green-800 font-bold">
                        ¥{priceResult.savings.toLocaleString()} ({priceResult.savingsRate}%)
                      </span>
                    </div>
                  </div>
                )}

                {/* おすすめ */}
                {quantity < priceResult.recommendedQuantity && (
                  <div className="bg-navy-50 border border-navy-600 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-navy-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-navy-600 font-medium">おすすめ数量</div>
                        <div className="text-navy-600 text-sm">
                          {priceResult.recommendedQuantity.toLocaleString()}個にすると単価がさらに下がります
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 納期 */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-gray-700">納期</span>
                  </div>
                  <span className="font-semibold text-gray-900">{priceResult.leadTime}営業日</span>
                </div>
              </div>
            </Card>
          )}

          {/* 追加機能 */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Plus className="w-5 h-5 text-brixa-700 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">追加機能</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {additionalFeatures.map((feature) => (
                <motion.div
                  key={feature.id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    addFeatures.includes(feature.id)
                      ? 'border-brixa-600 bg-brixa-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleFeatureToggle(feature.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.name}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                    <div className="flex items-center">
                      {addFeatures.includes(feature.id) && (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-1" />
                      )}
                      <span className="text-sm font-semibold text-gray-900">
                        +¥{feature.cost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* 緊急度 */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Zap className="w-5 h-5 text-brixa-700 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">納期</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {urgencyOptions.map((option) => (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    urgency === option.id
                      ? 'border-brixa-600 bg-brixa-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setUrgency(option.id)}
                >
                  <h4 className="font-medium text-gray-900 mb-1">{option.name}</h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                  <div className="text-xs text-brixa-700 mt-1">
                    ×{option.multiplier}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col md:flex-row gap-4">
        <Button
          variant="primary"
          size="lg"
          className="flex-1 bg-brixa-700 hover:bg-brixa-600"
          onClick={() => setShowDetails(!showDetails)}
        >
          <Mail className="mr-2 h-5 w-5" />
          詳細見積もりを依頼
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
        >
          <Download className="mr-2 h-5 w-5" />
          見積もりをPDFで保存
        </Button>
      </div>

      {/* 詳細情報 */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-navy-50 border-navy-600">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">見積もり詳細</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">仕様概要</h5>
                  <div className="space-y-1 text-sm">
                    <div>パウチタイプ: {pouchTypes.find(p => p.id === selectedPouch)?.name}</div>
                    <div>サイズ: {size.width}mm × {size.height}mm</div>
                    <div>数量: {quantity.toLocaleString()}個</div>
                    <div>素材: {materials.find(m => m.id === material)?.name}</div>
                    <div>印刷: {printingOptions.find(p => p.id === printing)?.name}</div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">特徴</h5>
                  <div className="space-y-1 text-sm">
                    <div>価格帯: {priceResult?.priceBreak}</div>
                    <div>数量割引: {priceResult?.bulkDiscount}%</div>
                    <div>納期: {priceResult?.leadTime}営業日</div>
                    {addFeatures.length > 0 && (
                      <div>追加機能: {addFeatures.length}個</div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}