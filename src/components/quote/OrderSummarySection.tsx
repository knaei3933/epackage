'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Package, Printer, Settings, Calendar, Edit2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { QuoteState } from '@/contexts/QuoteContext'
import { UnifiedQuoteResult } from '@/lib/unified-pricing-engine'
import { safeMap } from '@/lib/array-helpers'
import { MATERIAL_TYPE_LABELS_JA, getMaterialDescription } from '@/constants/materialTypes'

interface OrderSummarySectionProps {
  state: QuoteState
  result: UnifiedQuoteResult
  onEditQuantity?: () => void
  initialQuantity?: number
  initialSkuQuantities?: number[]
}

/**
 * 주문 내용 확인 섹션 컴포넌트
 * 현재 선택한 사양을 세련된 카드 형태로 표시
 */
export function OrderSummarySection({ state, result, onEditQuantity, initialQuantity, initialSkuQuantities }: OrderSummarySectionProps) {
  // 제품 타입 라벨
  const getBagTypeLabel = (bagTypeId: string): string => {
    const labels: Record<string, string> = {
      'roll_film': 'ロールフィルム',
      'flat_pouch': '平袋',
      'stand_pouch': 'スタンドパウチ',
      'zipper_pouch': 'チャック付パウチ',
      't_shape': '合掌パウチ',
      'm_shape': 'M字パウチ',
      'pouch': 'パウチ'
    }
    return labels[bagTypeId] || bagTypeId
  }

  // 후加工 라벨
  const getPostProcessingLabel = (optionId: string): string => {
    const labels: Record<string, string> = {
      'zipper-yes': 'チャック付',
      'zipper-no': 'チャックなし',
      'valve-yes': 'エアバルブ',
      'hole-yes': '穴あけ',
      'tear-notch': 'テアノッチ',
      'hanging-hole': '吊り穴'
    }
    return labels[optionId] || optionId.replace(/-/g, ' ')
  }

  // 수량 표시 (롤 필름은 m, 파우치는 개) - 초기 수량을 사용
  const quantityDisplay = () => {
    // initialResult에는 quantity 프로퍼티가 없으므로 initialQuantity를 사용
    const baseQuantity = initialQuantity ?? Math.round(result.totalPrice / result.unitPrice)
    const unit = state.bagTypeId === 'roll_film' ? 'm' : '個'

    // SKU 모드인 경우 - initialSkuQuantities를 사용
    if (initialSkuQuantities && initialSkuQuantities.length > 0) {
      const total = initialSkuQuantities.reduce((sum, qty) => sum + (qty || 0), 0)
      return {
        display: `${total.toLocaleString()}${unit}`,
        details: initialSkuQuantities.map((qty, idx) => `SKU${idx + 1}: ${qty?.toLocaleString() || 0}${unit}`)
      }
    }

    return {
      display: `${baseQuantity.toLocaleString()}${unit}`,
      details: []
    }
  }

  // 印刷タイプ表示を日本語に変換
  const getPrintingTypeLabel = (printingType: string, isUVPrinting: boolean): string => {
    if (isUVPrinting) return 'UVデジタル印刷'
    if (printingType === 'digital' || printingType === 'flexographic' || printingType === 'gravure') {
      return 'デジタル印刷'
    }
    return printingType
  }

  // 色数表示を「フルカラー」に変換
  const getPrintingColorsLabel = (colors: number, doubleSided: boolean): string => {
    return 'フルカラー'
  }

  const quantityInfo = quantityDisplay()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* 현재 선택 카드 */}
      <div className="bg-gradient-to-br from-navy-50 to-white rounded-xl shadow-sm border-2 border-navy-200 p-6 mb-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-navy-600 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">現在の選択</h3>
              <p className="text-sm text-gray-600">お見積もり内容</p>
            </div>
          </div>
        </div>

        {/* 내용 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 기본 사양 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Package className="w-4 h-4 mr-2 text-navy-600" />
              基本仕様
            </h4>
            <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">製品タイプ</span>
                <span className="font-medium text-gray-900">{getBagTypeLabel(state.bagTypeId)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">サイズ</span>
                <span className="font-medium text-gray-900">
                  {state.bagTypeId === 'roll_film'
                    ? `幅: ${state.width} mm`
                    : `${state.width} × ${state.height}${state.depth > 0 ? ` × ${state.depth}` : ''} mm`
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">素材</span>
                <span className="font-medium text-gray-900">{getMaterialDescription(state.materialId, 'ja')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">厚さ</span>
                <span className="font-medium text-gray-900">
                  {state.filmLayers && state.filmLayers.length > 0
                    ? state.filmLayers.map(layer => {
                        const materialLabels: Record<string, string> = {
                          'PET': 'PET',
                          'AL': 'AL',
                          'LLDPE': 'LLDPE',
                          'LDPE': 'LDPE',
                          'PP': 'PP',
                          'CPP': 'CPP',
                          'PA': 'NY',
                          'EVOH': 'EVOH'
                        }
                        return `${materialLabels[layer.materialId] || layer.materialId} ${layer.thickness}μ`
                      }).join(' / ')
                    : (state.thicknessSelection === 'light' ? '薄手' : state.thicknessSelection === 'medium' ? '並厚' : state.thicknessSelection === 'heavy' ? '厚手' : '超厚手')
                  }
                </span>
              </div>
            </div>
          </div>

          {/* 수량 & 인쇄 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-navy-600" />
              数量・印刷
            </h4>
            <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">数量</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg text-navy-600">{quantityInfo.display}</span>
                  {onEditQuantity && (
                    <button
                      onClick={onEditQuantity}
                      className="text-gray-400 hover:text-navy-600 transition-colors"
                      title="数量を変更"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {quantityInfo.details.length > 0 && (
                <div className="ml-4 space-y-1 text-xs text-gray-600">
                  {quantityInfo.details.map((detail, idx) => (
                    <div key={idx}>{detail}</div>
                  ))}
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">印刷</span>
                <span className="font-medium text-gray-900">
                  {getPrintingTypeLabel(state.printingType, state.isUVPrinting)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">色数</span>
                <span className="font-medium text-gray-900">
                  {getPrintingColorsLabel(state.printingColors, state.doubleSided)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 후加工 */}
        {state.postProcessingOptions && state.postProcessingOptions.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 flex items-center mb-2">
              <Settings className="w-4 h-4 mr-2 text-navy-600" />
              後加工
            </h4>
            <div className="bg-white rounded-lg p-3 flex flex-wrap gap-2">
              {safeMap(state.postProcessingOptions, option => (
                <span
                  key={option}
                  className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                >
                  {getPostProcessingLabel(option)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 가격 요약 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">単価</p>
              <p className="text-lg font-bold text-navy-600">
                ¥{result.unitPrice.toLocaleString()}/{state.bagTypeId === 'roll_film' ? 'm' : '個'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">数量</p>
              <p className="text-lg font-bold text-gray-900">
                {(result.quantity || state.quantity).toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-navy-600 to-navy-700 rounded-lg p-3">
              <p className="text-xs text-navy-200 mb-1">合計</p>
              <p className="text-lg font-bold text-white">
                ¥{result.totalPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
