'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Star, TrendingDown, Zap } from 'lucide-react'
import { Card } from '@/components/ui/Card'

/**
 * 수량 옵션 인터페이스
 */
export interface QuantityOption {
  id: string
  quantity: number
  label: string
  unitPrice: number
  totalPrice: number
  savings?: {
    amount: number
    rate: number
  }
  isCurrent: boolean
  isRecommended: boolean
  reason: string
  details: string[]
  // 事前計算された結果（並行生産などの最適化を含む）
  result?: any
}

interface QuantityOptionsGridProps {
  options: QuantityOption[]
  currentQuantity: number
  currentUnitPrice: number
  bagTypeId: string
  onSelectOption: (option: QuantityOption) => void
}

/**
 * 수량 옵션 그리드 컴포넌트
 * 현재 선택 1개 + 추천 1~2개로 최대 3개까지만 표시
 */
export function QuantityOptionsGrid({
  options,
  currentQuantity,
  currentUnitPrice,
  bagTypeId,
  onSelectOption
}: QuantityOptionsGridProps) {
  // 최대 3개까지만 표시 (현재 선택 + 추천 1~2개)
  const displayOptions = options.slice(0, 3)

  if (displayOptions.length === 0) {
    return null
  }

  const unitLabel = bagTypeId === 'roll_film' ? 'm' : '個'

  // 옵션 개수에 따른 그리드 클래스
  const getGridClass = () => {
    if (displayOptions.length === 1) {
      return 'grid grid-cols-1 max-w-md mx-auto'
    } else if (displayOptions.length === 2) {
      return 'grid grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto'
    } else {
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mt-6"
    >
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-600" />
          数量オプションを選択
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          お得な数量を選んでお見積もりを再計算できます
        </p>
      </div>

      {/* 그리드 레이아웃 - 옵션 개수에 따라 중앙 정렬 */}
      <div className={getGridClass()}>
        {displayOptions.map((option, index) => (
          <OptionCard
            key={option.id}
            option={option}
            index={index}
            unitLabel={unitLabel}
            currentUnitPrice={currentUnitPrice}
            onSelect={() => onSelectOption(option)}
          />
        ))}
      </div>
    </motion.div>
  )
}

interface OptionCardProps {
  option: QuantityOption
  index: number
  unitLabel: string
  currentUnitPrice: number
  onSelect: () => void
}

function OptionCard({ option, index, unitLabel, currentUnitPrice, onSelect }: OptionCardProps) {
  // 현재 선택인지 추천인지에 따른 스타일
  const isCurrent = option.isCurrent
  const isRecommended = option.isRecommended && !isCurrent

  // 카드 스타일
  const cardStyle = isCurrent
    ? 'border-2 border-green-400 bg-gradient-to-br from-green-50 to-white'
    : isRecommended
    ? 'border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-white'
    : 'border border-gray-200 bg-white hover:border-gray-300'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={`p-5 ${cardStyle} transition-all h-full`}>
        <div className="space-y-4">
          {/* 헤더 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {isCurrent ? (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              ) : isRecommended ? (
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                </div>
              )}
              <div>
                <h4 className="font-bold text-gray-900 text-sm">
                  {isCurrent ? '現在の選択' : isRecommended ? '⭐ 推奨' : `オプション${index + 1}`}
                </h4>
                <p className="text-xs text-gray-600">{option.label}</p>
              </div>
            </div>
          </div>

          {/* 수량 & 단가 */}
          <div className="space-y-2">
            <div className="text-center py-3 bg-white rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-900">
                {option.quantity.toLocaleString()}
                <span className="text-base ml-1">{unitLabel}</span>
              </p>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">単価</span>
                <span className={`font-bold ${isRecommended ? 'text-yellow-700' : 'text-gray-900'}`}>
                  ¥{option.unitPrice.toLocaleString()}/{unitLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">合計</span>
                <span className={`font-bold ${isRecommended ? 'text-yellow-700' : 'text-gray-900'}`}>
                  ¥{option.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 절감 정보 */}
          {option.savings && option.savings.rate > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="text-green-800 font-bold text-sm">
                    {option.savings.rate.toFixed(0)}%節約
                  </span>
                </div>
                <span className="text-green-700 text-xs">
                  ¥{option.savings.amount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* 세부 정보 */}
          {option.details.length > 0 && (
            <div className="space-y-1 text-xs text-gray-600">
              {option.details.map((detail, idx) => (
                <div key={idx} className="flex items-center">
                  <span className="mr-1">•</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          )}

          {/* 버튼 */}
          <button
            onClick={onSelect}
            disabled={isCurrent}
            className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
              isCurrent
                ? 'bg-green-600 text-white cursor-default'
                : isRecommended
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {isCurrent ? '✓ 選択中' : 'このオプションを選択'}
          </button>
        </div>
      </Card>
    </motion.div>
  )
}
