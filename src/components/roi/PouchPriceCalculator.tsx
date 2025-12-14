'use client'

import React, { useState, useEffect } from 'react'
import { Calculator, Package, TrendingUp, Info } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface PriceResult {
  unitPrice: number
  totalPrice: number
  savings: number
  priceBreak: string
}

export function PouchPriceCalculator() {
  const [selectedPouch, setSelectedPouch] = useState('soft-3seal')
  const [size, setSize] = useState({ width: 100, height: 150 })
  const [quantity, setQuantity] = useState(5000)
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null)

  const pouchTypes = [
    {
      id: 'soft-3seal',
      name: 'ソフトパウチ（3シール）',
      basePrice: 15,
      description: '最も一般的なパウチ形状'
    },
    {
      id: 'soft-4seal',
      name: 'ソフトパウチ（4シール）',
      basePrice: 18,
      description: '背面シール付きで強度向上'
    },
    {
      id: 'standing',
      name: 'スタンディングパウチ',
      basePrice: 25,
      description: '自立するチャック付きパウチ'
    },
    {
      id: 'gusset',
      name: 'ガゼットパウチ',
      basePrice: 22,
      description: 'マチ付きで容量アップ'
    },
    {
      id: 'pillow',
      name: 'ピローパウチ',
      basePrice: 16,
      description: '定番の枕型パウチ'
    },
    {
      id: 'triangle',
      name: '三角パウチ',
      basePrice: 20,
      description: '液体・粉末包装に最適'
    }
  ]

  const calculatePrice = () => {
    const pouch = pouchTypes.find(p => p.id === selectedPouch)
    if (!pouch) return

    // 基本価格計算（サイズ × 基準単価）
    const sizeMultiplier = (size.width * size.height) / 15000 // 基準サイズ100x150
    const baseUnitPrice = pouch.basePrice * sizeMultiplier

    // 数量割引
    let discountRate = 0
    let priceBreak = '小ロット'

    if (quantity >= 50000) {
      discountRate = 0.35
      priceBreak = '大ロット'
    } else if (quantity >= 20000) {
      discountRate = 0.25
      priceBreak = '中ロット'
    } else if (quantity >= 10000) {
      discountRate = 0.15
      priceBreak = '標準ロット'
    } else if (quantity >= 5000) {
      discountRate = 0.08
      priceBreak = '小ロット'
    }

    const unitPrice = baseUnitPrice * (1 - discountRate)
    const totalPrice = unitPrice * quantity
    const savings = baseUnitPrice * quantity - totalPrice

    setPriceResult({
      unitPrice: Math.round(unitPrice),
      totalPrice: Math.round(totalPrice),
      savings: Math.round(savings),
      priceBreak
    })
  }

  useEffect(() => {
    calculatePrice()
  }, [selectedPouch, size, quantity])

  const commonSizes = [
    { name: '小型 (80x120)', width: 80, height: 120 },
    { name: '標準 (100x150)', width: 100, height: 150 },
    { name: '中型 (150x200)', width: 150, height: 200 },
    { name: '大型 (200x300)', width: 200, height: 300 }
  ]

  const commonQuantities = [1000, 5000, 10000, 20000, 50000]

  return (
    <Card className="p-8">
      <div className="space-y-8">
        {/* ヘッダー */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <Calculator className="w-6 h-6 mr-2 text-brixa-700" />
            パウチ価格計算
          </h3>
          <p className="text-gray-600">
            簡単な設定で参考価格を即座に計算
          </p>
        </div>

        {/* Step 1: パウチタイプ選択 */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="bg-brixa-600 text-brixa-600 text-sm font-bold px-2 py-1 rounded-full mr-2">
              1
            </span>
            パウチタイプを選択
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pouchTypes.map(pouch => (
              <div
                key={pouch.id}
                onClick={() => setSelectedPouch(pouch.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPouch === pouch.id
                    ? 'border-brixa-600 bg-brixa-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{pouch.name}</div>
                <div className="text-sm text-gray-600 mt-1">{pouch.description}</div>
                <div className="text-sm text-brixa-700 mt-2 font-semibold">
                  基準価格: {pouch.basePrice}円/枚
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: サイズ設定 */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="bg-brixa-600 text-brixa-600 text-sm font-bold px-2 py-1 rounded-full mr-2">
              2
            </span>
            サイズを設定
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {commonSizes.map(s => (
              <button
                key={s.name}
                onClick={() => setSize({ width: s.width, height: s.height })}
                className={`p-3 border rounded-lg text-sm transition-all ${
                  size.width === s.width && size.height === s.height
                    ? 'border-brixa-600 bg-brixa-50 text-brixa-600 font-medium'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {s.name}
                <br />
                {s.width}×{s.height}mm
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                幅 (mm)
              </label>
              <input
                type="number"
                value={size.width}
                onChange={(e) => setSize(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                min="50"
                max="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                高さ (mm)
              </label>
              <input
                type="number"
                value={size.height}
                onChange={(e) => setSize(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
                min="50"
                max="500"
              />
            </div>
          </div>
        </div>

        {/* Step 3: 数量設定 */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="bg-brixa-600 text-brixa-600 text-sm font-bold px-2 py-1 rounded-full mr-2">
              3
            </span>
            数量を設定
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {commonQuantities.map(q => (
              <button
                key={q}
                onClick={() => setQuantity(q)}
                className={`p-3 border rounded-lg text-center transition-all ${
                  quantity === q
                    ? 'border-brixa-600 bg-brixa-50 text-brixa-600 font-medium'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {q.toLocaleString()}枚
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カスタム数量
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
              min="100"
              max="100000"
            />
          </div>
        </div>

        {/* 計算結果 */}
        {priceResult && (
          <div className="bg-gradient-to-br from-green-50 to-navy-50 rounded-xl p-6 border border-green-200">
            <h4 className="text-xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center">
              <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
              見積結果
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brixa-700">
                  {priceResult.unitPrice.toLocaleString()}円
                </div>
                <div className="text-sm text-gray-600">単価（1枚あたり）</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-navy-700">
                  {priceResult.totalPrice.toLocaleString()}円
                </div>
                <div className="text-sm text-gray-600">合計金額</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {priceResult.savings.toLocaleString()}円
                </div>
                <div className="text-sm text-gray-600">数量割引</div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <span className="bg-white px-3 py-1 rounded-full">
                カテゴリ: {priceResult.priceBreak}
              </span>
              <span className="bg-white px-3 py-1 rounded-full">
                総面積: {((size.width * size.height * quantity) / 1000000).toFixed(2)}m²
              </span>
            </div>
          </div>
        )}

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-gray-900 mb-1">参考価格について</p>
              <p>
                表示された価格はあくまで参考価格です。実際の価格は素材の種類、印刷の有無、
                特殊加工、納期などの仕様によって変動します。正確なお見積もりはお問い合わせフォームからご相談ください。
              </p>
            </div>
          </div>
        </div>

        {/* CTAボタン */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-brixa-700 hover:bg-brixa-600 text-white px-8 py-3"
              onClick={() => window.location.href = '/contact'}
            >
              詳細お見積もりを依頼
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-brixa-700 text-brixa-700 hover:bg-brixa-50 px-8 py-3"
              onClick={() => window.location.href = '/samples'}
            >
              無料サンプルを請求
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}