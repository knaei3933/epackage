'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Replace,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  X,
  TrendingUp,
  TrendingDown,
  Star,
  ArrowLeft,
  ArrowRight,
  Info,
  Zap,
  Clock,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  MAX_POST_PROCESSING_ITEMS,
  generateReplacementSuggestions,
  type PostProcessingValidationError
} from './postProcessingLimits'
import type { ProcessingOptionConfig } from './processingConfig'

interface PostProcessingItemReplacementProps {
  currentSelection: ProcessingOptionConfig[]
  attemptedItem: ProcessingOptionConfig
  onReplaceItem: (oldItemId: string, newItemId: string) => void
  onCancelReplacement: () => void
  allOptions: ProcessingOptionConfig[]
  language?: 'en' | 'ja'
}

interface ReplacementOption {
  item: ProcessingOptionConfig
  impact: {
    priceDifference: number
    timeDifference: number
    featureDifference: number
    recommendation: 'high' | 'medium' | 'low'
  }
  reason: string
  reasonJa: string
}

export function PostProcessingItemReplacement({
  currentSelection,
  attemptedItem,
  onReplaceItem,
  onCancelReplacement,
  allOptions,
  language = 'ja'
}: PostProcessingItemReplacementProps) {
  const [selectedReplacement, setSelectedReplacement] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  // Calculate replacement suggestions
  const replacementSuggestions = useMemo(() => {
    const suggestions: ReplacementOption[] = currentSelection.map(item => {
      const priceDifference = attemptedItem.priceMultiplier - item.priceMultiplier
      const timeDifference = parseInt(attemptedItem.processingTime) - parseInt(item.processingTime)
      const featureDifference = attemptedItem.features.length + attemptedItem.benefits.length -
                               (item.features.length + item.benefits.length)

      let recommendation: 'high' | 'medium' | 'low' = 'medium'
      if (featureDifference > 2 && priceDifference < 0.2) recommendation = 'high'
      if (featureDifference < -2 || priceDifference > 0.5) recommendation = 'low'

      let reason = ''
      let reasonJa = ''

      if (priceDifference < -0.1) {
        reason = `Save ${Math.abs(priceDifference * 100).toFixed(1)}% cost`
        reasonJa = `${Math.abs(priceDifference * 100).toFixed(1)}%のコストを節約`
      } else if (priceDifference > 0.1) {
        reason = `Increase cost by ${(priceDifference * 100).toFixed(1)}%`
        reasonJa = `コストが${(priceDifference * 100).toFixed(1)}%増加`
      }

      if (featureDifference > 0) {
        reason += reason ? ` and +${featureDifference} features` : `+${featureDifference} features`
        reasonJa += reasonJa ? `、機能+${featureDifference}` : `機能+${featureDifference}`
      } else if (featureDifference < 0) {
        reason += reason ? ` and -${Math.abs(featureDifference)} features` : `-${Math.abs(featureDifference)} features`
        reasonJa += reasonJa ? `、機能-${Math.abs(featureDifference)}` : `機能-${Math.abs(featureDifference)}`
      }

      return {
        item,
        impact: {
          priceDifference,
          timeDifference,
          featureDifference,
          recommendation
        },
        reason: reason || 'Similar option',
        reasonJa: reasonJa || '類似オプション'
      }
    })

    // Sort by recommendation priority
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.impact.recommendation] - priorityOrder[a.impact.recommendation]
    })
  }, [currentSelection, attemptedItem])

  // Get recommendation color
  const getRecommendationColor = (recommendation: 'high' | 'medium' | 'low') => {
    switch (recommendation) {
      case 'high':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-red-100 text-red-700 border-red-200'
    }
  }

  // Get impact icon
  const getImpactIcon = (difference: number, isGood = true) => {
    if (Math.abs(difference) < 0.01) return null

    if (isGood) {
      return difference > 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-green-600" />
    } else {
      return difference > 0 ? <TrendingUp className="w-4 h-4 text-red-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />
    }
  }

  const handleReplace = (oldItemId: string) => {
    onReplaceItem(oldItemId, attemptedItem.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Replace className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-blue-900">
                {language === 'ja' ? 'アイテム交換が必要' : 'Item Replacement Required'}
              </CardTitle>
              <p className="text-sm text-blue-700">
                {language === 'ja'
                  ? `最大${MAX_POST_PROCESSING_ITEMS}個の選択制限に達しました。新しい項目を追加するには、既存の項目を交換してください。`
                  : `Maximum selection limit of ${MAX_POST_PROCESSING_ITEMS} reached. Replace an existing item to add this option.`
                }
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onCancelReplacement}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Attempted Item Preview */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">
                {language === 'ja' ? attemptedItem.nameJa : attemptedItem.name}
              </h3>
              <p className="text-sm text-green-700">
                {language === 'ja' ? attemptedItem.descriptionJa : attemptedItem.description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-green-600">{language === 'ja' ? '価格影響' : 'Price Impact'}</p>
              <p className="font-semibold text-green-900">
                +{((attemptedItem.priceMultiplier - 1) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-green-600">{language === 'ja' ? '処理時間' : 'Time'}</p>
              <p className="font-semibold text-green-900">
                {language === 'ja' ? attemptedItem.processingTimeJa : attemptedItem.processingTime}
              </p>
            </div>
            <div className="text-center">
              <p className="text-green-600">{language === 'ja' ? '機能' : 'Features'}</p>
              <p className="font-semibold text-green-900">
                {attemptedItem.features.length + attemptedItem.benefits.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-green-600">{language === 'ja' ? 'カテゴリ' : 'Category'}</p>
              <p className="font-semibold text-green-900">
                {attemptedItem.category}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replacement Options */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          <ArrowUpDown className="w-5 h-5" />
          <span>{language === 'ja' ? '交換候補' : 'Replacement Candidates'}</span>
          <Badge variant="outline">{replacementSuggestions.length}</Badge>
        </h3>

        <div className="grid gap-3">
          {replacementSuggestions.map((replacement, index) => (
            <motion.div
              key={replacement.item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`cursor-pointer transition-all hover:shadow-md ${
                selectedReplacement === replacement.item.id
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedReplacement(replacement.item.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Selection Status */}
                  <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                    {selectedReplacement === replacement.item.id && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium">
                        {language === 'ja' ? replacement.item.nameJa : replacement.item.name}
                      </h4>
                      <Badge className={getRecommendationColor(replacement.impact.recommendation)}>
                        {replacement.impact.recommendation === 'high' && (language === 'ja' ? '推奨' : 'Recommended')}
                        {replacement.impact.recommendation === 'medium' && (language === 'ja' ? '標準' : 'Standard')}
                        {replacement.impact.recommendation === 'low' && (language === 'ja' ? '非推奨' : 'Not Recommended')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {language === 'ja' ? replacement.reasonJa : replacement.reason}
                    </p>
                  </div>

                  {/* Impact Indicators */}
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        {getImpactIcon(replacement.impact.priceDifference, replacement.impact.priceDifference < 0)}
                        <span className={`text-sm font-medium ${
                          replacement.impact.priceDifference < 0 ? 'text-green-600' :
                          replacement.impact.priceDifference > 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {(replacement.impact.priceDifference * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4 text-gray-400" />
                        {getImpactIcon(replacement.impact.featureDifference, true)}
                        <span className={`text-sm font-medium ${
                          replacement.impact.featureDifference > 0 ? 'text-green-600' :
                          replacement.impact.featureDifference < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {replacement.impact.featureDifference > 0 ? '+' : ''}{replacement.impact.featureDifference}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Comparison (when selected) */}
                <AnimatePresence>
                  {selectedReplacement === replacement.item.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2 text-sm text-gray-700">
                            {language === 'ja' ? '現在の選択' : 'Current Selection'}
                          </h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">{language === 'ja' ? '価格' : 'Price'}:</span>
                              <span>x{replacement.item.priceMultiplier.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{language === 'ja' ? '時間' : 'Time'}:</span>
                              <span>{language === 'ja' ? replacement.item.processingTimeJa : replacement.item.processingTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{language === 'ja' ? '機能数' : 'Features'}:</span>
                              <span>{replacement.item.features.length + replacement.item.benefits.length}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium mb-2 text-sm text-gray-700">
                            {language === 'ja' ? '新しい選択' : 'New Selection'}
                          </h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">{language === 'ja' ? '価格' : 'Price'}:</span>
                              <span>x{attemptedItem.priceMultiplier.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{language === 'ja' ? '時間' : 'Time'}:</span>
                              <span>{language === 'ja' ? attemptedItem.processingTimeJa : attemptedItem.processingTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{language === 'ja' ? '機能数' : 'Features'}:</span>
                              <span>{attemptedItem.features.length + attemptedItem.benefits.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center space-x-3">
                        <Button
                          onClick={() => handleReplace(replacement.item.id)}
                          className="flex-1"
                        >
                          <Replace className="w-4 h-4 mr-2" />
                          {language === 'ja' ? 'このアイテムと交換' : 'Replace with This'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowComparison(!showComparison)}
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                  </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancelReplacement}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'ja' ? 'キャンセル' : 'Cancel'}
        </Button>

        {selectedReplacement && (
          <Button
            onClick={() => handleReplace(selectedReplacement)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {language === 'ja' ? '交換を実行' : 'Execute Replacement'}
          </Button>
        )}
      </div>
    </motion.div>
  )
}