'use client'

import React from 'react'
import { CheckCircle2, Circle, TrendingDown, Zap } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'

/**
 * 並列生産オプション表示用インターフェース
 */
export interface ParallelProductionOption {
  optionNumber: number
  quantity: number
  materialWidth: 590 | 760
  parallelCount: number
  filmWidthUtilization: number
  estimatedUnitCost: number
  savingsRate: number
  isRecommended: boolean
  reason: string
}

interface ParallelProductionOptionsProps {
  options: ParallelProductionOption[]
  currentUnitCost: number
  onOptionSelect?: (option: ParallelProductionOption) => void
}

export function ParallelProductionOptions({
  options,
  currentUnitCost,
  onOptionSelect
}: ParallelProductionOptionsProps) {
  if (!options || options.length === 0) {
    return null
  }

  const recommendedOptions = options.filter(opt => opt.isRecommended)
  const otherOptions = options.filter(opt => !opt.isRecommended)

  return (
    <div className="space-y-6">
      {/* 推奨オプション */}
      {recommendedOptions.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-bold text-gray-900">
              おすすめの注文オプション
            </h3>
          </div>
          <div className="space-y-4">
            {recommendedOptions.map((option) => (
              <OptionCard
                key={option.optionNumber}
                option={option}
                currentUnitCost={currentUnitCost}
                onSelect={onOptionSelect}
                isRecommended
              />
            ))}
          </div>
        </div>
      )}

      {/* その他のオプション */}
      {otherOptions.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            その他のオプション
          </h3>
          <div className="space-y-4">
            {otherOptions.map((option) => (
              <OptionCard
                key={option.optionNumber}
                option={option}
                currentUnitCost={currentUnitCost}
                onSelect={onOptionSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* メモ */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 ポイント:</strong> 複数個まとめて注文すると、同じ原反を効率的に使用でき、
          単価が下がります。原反の無駄を減らし、コストも節約できます。
        </p>
      </div>
    </div>
  )
}

interface OptionCardProps {
  option: ParallelProductionOption
  currentUnitCost: number
  onSelect?: (option: ParallelProductionOption) => void
  isRecommended?: boolean
}

function OptionCard({ option, currentUnitCost, onSelect, isRecommended }: OptionCardProps) {
  const savingsAmount = currentUnitCost - option.estimatedUnitCost

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-6 ${
        isRecommended
          ? 'border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-white'
          : 'border border-gray-200 bg-white hover:border-gray-300'
      } transition-all`}>
        <div className="space-y-4">
          {/* ヘッダー */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {isRecommended ? (
                <CheckCircle2 className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-gray-900">
                    オプション{option.optionNumber}: {option.quantity}個注文
                  </h4>
                  {isRecommended && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-yellow-400 text-yellow-900 rounded-full">
                      ⭐ 推奨
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{option.reason}</p>
              </div>
            </div>
          </div>

          {/* 詳細情報 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {/* 原反情報 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">使用原反</span>
                <span className="text-sm font-bold text-gray-900">{option.materialWidth}mm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">並列生産数</span>
                <span className="text-sm font-bold text-gray-900">{option.parallelCount}本</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">原反効率</span>
                <span className={`text-sm font-bold ${
                  option.filmWidthUtilization >= 75 ? 'text-green-600' :
                  option.filmWidthUtilization >= 50 ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {option.filmWidthUtilization.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* コスト情報 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">現在単価</span>
                <span className="text-sm text-gray-900 line-through">
                  ¥{currentUnitCost.toLocaleString()}/m
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">見積単価</span>
                <span className="text-lg font-bold text-brixa-600">
                  ¥{option.estimatedUnitCost.toLocaleString()}/m
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">節減額</span>
                <span className="text-sm font-bold text-green-600 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  ¥{savingsAmount.toLocaleString()}/m
                </span>
              </div>
            </div>
          </div>

          {/* 節減率ハイライト */}
          {option.savingsRate > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-green-800 font-bold">
                  💰 {option.savingsRate.toFixed(0)}%節減（¥{savingsAmount.toLocaleString()}/m安くなります）
                </p>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          {onSelect && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => onSelect(option)}
                className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all ${
                  isRecommended
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-brixa-600 hover:bg-brixa-700'
                }`}
              >
                {option.quantity}個で注文する
              </button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
