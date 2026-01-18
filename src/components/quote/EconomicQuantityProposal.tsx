'use client'

import React from 'react'
import { AlertCircle, TrendingUp, DollarSign, Package } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'

/**
 * 経済的生産数量提案表示用コンポーネント
 */
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
}

interface EconomicQuantityProposalProps {
  suggestion: EconomicQuantitySuggestionData
  onAcceptRecommendation?: () => void
}

export function EconomicQuantityProposal({
  suggestion,
  onAcceptRecommendation
}: EconomicQuantityProposalProps) {
  const {
    orderQuantity,
    recommendedQuantity,
    recommendationReason,
    unitCostAtOrderQty,
    unitCostAtEconomicQty,
    costSavings,
    costSavingsRate,
    pouchesPerMeter,
    economicQuantity,
    efficiencyImprovement
  } = suggestion

  const isRecommendationDifferent = recommendedQuantity !== orderQuantity
  const hasSignificantSavings = costSavingsRate > 10

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`p-6 ${
        hasSignificantSavings
          ? 'border-2 border-green-400 bg-gradient-to-br from-green-50 to-white'
          : 'border border-gray-200 bg-white'
      }`}>
        <div className="space-y-6">
          {/* ヘッダー */}
          <div className="flex items-start space-x-3">
            {hasSignificantSavings ? (
              <TrendingUp className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            ) : (
              <Package className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                経済的生産数量のご提案
              </h3>
              <p className="text-sm text-gray-700">{recommendationReason}</p>
            </div>
          </div>

          {/* 現在注文 vs 推奨数量 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 現在の注文 */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Package className="w-5 h-5 text-gray-600" />
                <h4 className="font-bold text-gray-900">現在の注文</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">数量</span>
                  <span className="text-sm font-bold text-gray-900">
                    {orderQuantity.toLocaleString()}個
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">単価</span>
                  <span className="text-sm font-bold text-gray-900">
                    ¥{unitCostAtOrderQty.toLocaleString()}/個
                  </span>
                </div>
              </div>
            </div>

            {/* 推奨数量 */}
            <div className={`rounded-lg p-4 border ${
              hasSignificantSavings
                ? 'bg-green-50 border-green-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                <DollarSign className={`w-5 h-5 ${
                  hasSignificantSavings ? 'text-green-600' : 'text-blue-600'
                }`} />
                <h4 className={`font-bold ${
                  hasSignificantSavings ? 'text-green-900' : 'text-blue-900'
                }`}>
                  推奨数量
                </h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">数量</span>
                  <span className={`text-sm font-bold ${
                    hasSignificantSavings ? 'text-green-900' : 'text-blue-900'
                  }`}>
                    {recommendedQuantity.toLocaleString()}個
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">単価</span>
                  <span className={`text-sm font-bold ${
                    hasSignificantSavings ? 'text-green-900' : 'text-blue-900'
                  }`}>
                    ¥{unitCostAtEconomicQty.toLocaleString()}/個
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 節減額・節減率 */}
          {hasSignificantSavings && (
            <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 font-bold text-lg">
                    💰 コスト削減
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    {costSavingsRate.toFixed(1)}%節減（¥{costSavings.toLocaleString()}/個安くなります）
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-900 text-2xl font-bold">
                    {costSavingsRate.toFixed(0)}%
                  </p>
                  <p className="text-green-700 text-sm">OFF</p>
                </div>
              </div>
            </div>
          )}

          {/* 効率改善 */}
          {efficiencyImprovement > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-blue-900 font-bold">フィルム効率改善</p>
                  <p className="text-blue-700 text-sm">
                    {efficiencyImprovement.toFixed(1)}%の効率向上
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 詳細情報 */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-3">生産効率の詳細</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">1mあたり生産可能数</span>
                <span className="font-bold text-gray-900">
                  {pouchesPerMeter.toFixed(2)}個/m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最小発注量（フィルム）</span>
                <span className="font-bold text-gray-900">
                  {economicFilmUsage.toLocaleString()}m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最小発注可能数量</span>
                <span className="font-bold text-gray-900">
                  {economicQuantity.toLocaleString()}個
                </span>
              </div>
            </div>
          </div>

          {/* 注意事項 */}
          {isRecommendationDifferent && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-bold mb-1">ご注意ください</p>
                  <p>
                    推奨数量は{recommendedQuantity.toLocaleString()}個ですが、
                    実際に必要な数量に応じて選択してください。
                    フィルムの無駄を最小限に抑えるための参考情報としてご活用ください。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          {onAcceptRecommendation && isRecommendationDifferent && (
            <button
              onClick={onAcceptRecommendation}
              className="w-full py-3 px-6 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-all"
            >
              推奨数量（{recommendedQuantity.toLocaleString()}個）で見積もりを再計算
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
