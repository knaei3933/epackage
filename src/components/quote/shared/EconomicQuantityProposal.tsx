'use client'

import React from 'react'
import { AlertCircle, TrendingUp, DollarSign, Package } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'

/**
 * 経済的生産数量提案表示用コンポーネント
 */

// 多列生産オプション（ロールフィルム用）
export interface MultiColumnOption {
  columnCount: number
  columnWidth: number
  quantity: number
  unitPrice: number
  totalPrice: number
  savingsRate: number
}

export interface EconomicQuantitySuggestionData {
  orderQuantity: number
  minimumOrderQuantity: number
  minimumFilmUsage: number
  pouchesPerMeter: number
  economicQuantity: number
  economicFilmUsage: number
  efficiencyImprovement: number
  unitCostAtOrderQty: number
  unitCostAtEconomicQty: number
  costSavings: number
  costSavingsRate: number
  recommendedQuantity: number
  recommendationReason: string
  // 2列生産オプション（パウチ用）
  twoColumnProductionOptions?: {
    sameQuantity: {
      quantity: number
      unitPrice: number
      totalPrice: number
      savingsRate: number // 15%
    }
    doubleQuantity: {
      quantity: number
      unitPrice: number
      totalPrice: number
      savingsRate: number // 30%
    }
    // ロールフィルム用多列オプション
    multiColumn?: MultiColumnOption[]
  }
}

interface EconomicQuantityProposalProps {
  suggestion: EconomicQuantitySuggestionData
  onAcceptRecommendation?: () => void
  onApplyTwoColumnOption?: (optionType: 'same' | 'double' | number) => void // 列数も受け取れるように
  appliedOption?: 'same' | 'double' | number | null
  isRollFilm?: boolean
}

export function EconomicQuantityProposal({
  suggestion,
  onAcceptRecommendation,
  onApplyTwoColumnOption,
  appliedOption,
  isRollFilm = false
}: EconomicQuantityProposalProps) {
  const {
    twoColumnProductionOptions
  } = suggestion

  // 2列生産オプションがある場合のみ表示
  const hasOptions = twoColumnProductionOptions

  // ロールフィルム用多列オプション
  const multiColumnOptions = twoColumnProductionOptions?.multiColumn || []

  if (!hasOptions) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-6 border-2 border-info-300 bg-gradient-to-br from-info-50 to-white">
        <div className="space-y-6">
          {/* ヘッダー */}
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-6 h-6 text-info-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {isRollFilm ? '多列生産お得オプション' : '2列生産お得オプション'}
              </h3>
              <p className="text-sm text-gray-700">現在の数量に基づいた最適な生産オプションを提案します</p>
            </div>
          </div>

          {/* 【新規】多列生産オプション（ロールフィルム用） */}
          {isRollFilm && multiColumnOptions.length > 0 && (
            <div className="bg-info-50 border-2 border-info-300 rounded-lg p-4">
              <h4 className="font-bold text-info-900 mb-3 flex items-center gap-2">
                <span>💎</span>
                <span>多列生産お得オプション（ロールフィルム）</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {multiColumnOptions.map((option) => (
                  <div
                    key={option.columnCount}
                    className={`rounded-lg p-4 transition-colors ${
                      appliedOption === option.columnCount
                        ? 'bg-green-50 border-2 border-green-400'
                        : 'bg-white border border-info-200 hover:border-info-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-info-900">
                        {option.columnCount}列生産
                      </span>
                      <div className="flex items-center gap-2">
                        {appliedOption === option.columnCount && (
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                            適用中
                          </span>
                        )}
                        <span className="text-xs bg-info-600 text-white px-2 py-1 rounded">
                          {option.savingsRate}% OFF
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">並列生産</span>
                        <span className="font-bold text-info-900">
                          {option.columnWidth}mm × {option.columnCount}個
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">長さ</span>
                        <span className="font-bold text-info-900">
                          {option.quantity.toLocaleString()}m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">単価</span>
                        <span className="font-bold text-info-900">
                          ¥{option.unitPrice.toLocaleString()}/m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">合計</span>
                        <span className="font-bold text-info-900">
                          ¥{option.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {onApplyTwoColumnOption && (
                      <button
                        onClick={() => onApplyTwoColumnOption(option.columnCount)}
                        className={`w-full py-2 px-4 rounded-lg font-bold transition-colors text-sm ${
                          appliedOption === option.columnCount
                            ? 'bg-green-600 text-white cursor-default'
                            : 'bg-info-600 text-white hover:bg-info-700'
                        }`}
                      >
                        {appliedOption === option.columnCount ? '適用済み' : `${option.savingsRate}% OFFを適用`}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 【既存】2列生産オプション（パウチ用） */}
          {!isRollFilm && twoColumnProductionOptions && (
            <div className="bg-info-50 border-2 border-info-300 rounded-lg p-4">
              <h4 className="font-bold text-info-900 mb-3 flex items-center gap-2">
                <span>💎</span>
                <span>2列生産お得オプション</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 15% OFF - 同数量 */}
                <div className={`rounded-lg p-4 transition-colors ${
                  appliedOption === 'same'
                    ? 'bg-green-50 border-2 border-green-400'
                    : 'bg-white border border-info-200 hover:border-info-400'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-info-900">同数量（15% OFF）</span>
                    <div className="flex items-center gap-2">
                      {appliedOption === 'same' && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          適用中
                        </span>
                      )}
                      <span className="text-xs bg-info-600 text-white px-2 py-1 rounded">
                        15% OFF
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">数量</span>
                      <span className="font-bold text-info-900">
                        {twoColumnProductionOptions.sameQuantity.quantity.toLocaleString()}個
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">単価</span>
                      <span className="font-bold text-info-900">
                        ¥{twoColumnProductionOptions.sameQuantity.unitPrice.toLocaleString()}/個
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">合計</span>
                      <span className="font-bold text-info-900">
                        ¥{twoColumnProductionOptions.sameQuantity.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {onApplyTwoColumnOption && (
                    <button
                      onClick={(e) => {
                        console.log('[EconomicQuantityProposal] 15% OFF button clicked', { event: e, appliedOption });
                        onApplyTwoColumnOption('same');
                      }}
                      className={`w-full py-2 px-4 rounded-lg font-bold transition-colors text-sm ${
                        appliedOption === 'same'
                          ? 'bg-green-600 text-white cursor-default'
                          : 'bg-info-600 text-white hover:bg-info-700'
                      }`}
                    >
                      {appliedOption === 'same' ? '適用済み' : '15% OFFを適用'}
                    </button>
                  )}
                </div>

                {/* 30% OFF - 2倍数量 */}
                <div className={`rounded-lg p-4 transition-colors ${
                  appliedOption === 'double'
                    ? 'bg-green-50 border-2 border-green-400'
                    : 'bg-white border border-info-200 hover:border-info-400'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-info-900">倍数量（30% OFF）</span>
                    <div className="flex items-center gap-2">
                      {appliedOption === 'double' && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          適用中
                        </span>
                      )}
                      <span className="text-xs bg-brixa-primary-600 text-white px-2 py-1 rounded">
                        30% OFF
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">数量</span>
                      <span className="font-bold text-info-900">
                        {twoColumnProductionOptions.doubleQuantity.quantity.toLocaleString()}個
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">単価</span>
                      <span className="font-bold text-info-900">
                        ¥{twoColumnProductionOptions.doubleQuantity.unitPrice.toLocaleString()}/個
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">合計</span>
                      <span className="font-bold text-info-900">
                        ¥{twoColumnProductionOptions.doubleQuantity.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {onApplyTwoColumnOption && (
                    <button
                      onClick={(e) => {
                        console.log('[EconomicQuantityProposal] 30% OFF button clicked', { event: e, appliedOption });
                        onApplyTwoColumnOption('double');
                      }}
                      className={`w-full py-2 px-4 rounded-lg font-bold transition-colors text-sm ${
                        appliedOption === 'double'
                          ? 'bg-green-600 text-white cursor-default'
                          : 'bg-brixa-primary-600 text-white hover:bg-brixa-primary-700'
                      }`}
                    >
                      {appliedOption === 'double' ? '適用済み' : '30% OFFを適用'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
