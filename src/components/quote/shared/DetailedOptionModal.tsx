'use client'

import React from 'react'
import { X, Package, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'

interface DetailedOptionModalProps {
  option: {
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
  onClose: () => void
  language?: 'en' | 'ja'
}

export default function DetailedOptionModal({
  option,
  onClose,
  language = 'ja'
}: DetailedOptionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-brixa-50 to-navy-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'ja' ? option.nameJa : option.name}
              </h2>
              <p className="text-gray-600 mt-1">
                {language === 'ja' ? option.descriptionJa : option.description}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="metallic" className="text-sm">
                {language === 'ja' ? '価格' : 'Price'} x{option.priceMultiplier.toFixed(2)}
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={onClose}
                aria-label={language === 'ja' ? '閉じる' : 'Close'}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={option.image}
                  alt={language === 'ja' ? option.nameJa : option.name}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/products/stand-pouch.jpg'
                  }}
                />
              </div>

              {/* Before/After Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="relative rounded-lg overflow-hidden bg-gray-50 border-2 border-gray-200">
                    <div className="aspect-[4/3] flex items-center justify-center">
                      <div className="text-center p-4">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">
                          {language === 'ja' ? '加工前' : 'Before'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {language === 'ja' ? '標準仕様' : 'Standard specification'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="relative rounded-lg overflow-hidden bg-green-50 border-2 border-green-200">
                    <div className="aspect-[4/3] flex items-center justify-center">
                      <div className="text-center p-4">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-700">
                          {language === 'ja' ? '加工後' : 'After'}
                        </p>
                        <p className="text-xs text-green-600">
                          {language === 'ja' ? '適用完了' : 'Applied'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Key Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  {language === 'ja' ? '主な特徴' : 'Key Features'}
                </h3>
                <div className="space-y-3">
                  {(language === 'ja' ? option.featuresJa : option.features).map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Impact */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 text-brixa-600 mr-2" />
                  {language === 'ja' ? '価格への影響' : 'Price Impact'}
                </h3>
                <div className="p-4 bg-gradient-to-r from-brixa-50 to-brixa-100 rounded-lg border border-brixa-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'ja' ? '価格乗数' : 'Price Multiplier'}
                    </span>
                    <Badge variant="metallic">
                      x{option.priceMultiplier.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">
                    {option.priceMultiplier > 1.0
                      ? (language === 'ja'
                          ? `${((option.priceMultiplier - 1) * 100).toFixed(0)}%の価格上昇`
                          : `${((option.priceMultiplier - 1) * 100).toFixed(0)}% price increase`)
                      : (language === 'ja'
                          ? '価格変動なし'
                          : 'No price change')
                    }
                  </div>
                </div>
              </div>

              {/* Compatible Products */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'ja' ? '対応製品タイプ' : 'Compatible Product Types'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {option.compatibleWith.map((type, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Technical Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                  {language === 'ja' ? '技術情報' : 'Technical Information'}
                </h3>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>{language === 'ja' ? '施工期間: +1-2営業日' : 'Processing time: +1-2 business days'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>{language === 'ja' ? '最小ロット: 1,000枚' : 'Minimum order: 1,000 pieces'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>{language === 'ja' ? '保証期間: 6ヶ月' : 'Warranty: 6 months'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              {language === 'ja'
                ? '詳細については専門スタッフにお問い合わせください'
                : 'Contact our specialist for more details'
              }
            </div>
            <Button onClick={onClose}>
              {language === 'ja' ? '閉じる' : 'Close'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}