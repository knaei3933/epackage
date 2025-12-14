'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  Settings
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  MAX_POST_PROCESSING_ITEMS,
  calculateRemainingSlots,
  isSelectionLimitReached,
  getSelectionVisualFeedback,
  type PostProcessingLimitState
} from './postProcessingLimits'

interface PostProcessingSelectionCounterProps {
  selectedCount: number
  onClearAll?: () => void
  showControls?: boolean
  language?: 'en' | 'ja'
  className?: string
}

export function PostProcessingSelectionCounter({
  selectedCount,
  onClearAll,
  showControls = true,
  language = 'ja',
  className = ''
}: PostProcessingSelectionCounterProps) {
  const remainingSlots = calculateRemainingSlots(selectedCount)
  const isAtLimit = isSelectionLimitReached(selectedCount)
  const visualFeedback = getSelectionVisualFeedback(selectedCount)

  // Calculate progress percentage
  const progressPercentage = (selectedCount / MAX_POST_PROCESSING_ITEMS) * 100

  return (
    <Card className={`${className} ${visualFeedback.bgColor} ${visualFeedback.borderColor} border-2`}>
      <CardContent className="p-4">
        {/* Header with icon and count */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${visualFeedback.bgColor}`}>
              {selectedCount === 0 && <Package className={`w-5 h-5 ${visualFeedback.color}`} />}
              {selectedCount > 0 && selectedCount < MAX_POST_PROCESSING_ITEMS && <Settings className={`w-5 h-5 ${visualFeedback.color}`} />}
              {selectedCount === MAX_POST_PROCESSING_ITEMS && <CheckCircle className={`w-5 h-5 ${visualFeedback.color}`} />}
            </div>

            <div>
              <p className={`text-sm font-medium ${visualFeedback.color}`}>
                {language === 'ja' ? '選択オプション' : 'Selected Options'}
              </p>
              <p className={`text-2xl font-bold ${visualFeedback.color}`}>
                {selectedCount} / {MAX_POST_PROCESSING_ITEMS}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <Badge
            className={`${visualFeedback.bgColor} ${visualFeedback.borderColor} ${visualFeedback.color} border-2`}
          >
            {visualFeedback.status === 'limit' && (language === 'ja' ? '最大' : 'MAX')}
            {visualFeedback.status === 'optimal' && selectedCount > 0 && (language === 'ja' ? '最適' : 'OPTIMAL')}
            {visualFeedback.status === 'optimal' && selectedCount === 0 && (language === 'ja' ? '未選択' : 'NONE')}
            {visualFeedback.status === 'warning' && (language === 'ja' ? '警告' : 'WARNING')}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-all duration-300 ${
                visualFeedback.status === 'limit'
                  ? 'bg-green-500'
                  : visualFeedback.status === 'warning'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div className={`text-sm ${visualFeedback.color} mb-3 flex items-center space-x-2`}>
          {visualFeedback.status === 'warning' && <AlertTriangle className="w-4 h-4" />}
          <span>{visualFeedback.messageJa || visualFeedback.message}</span>
        </div>

        {/* Remaining Slots Indicator */}
        {remainingSlots > 0 && (
          <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg mb-3">
            <span className="text-sm text-gray-600">
              {language === 'ja' ? '残りスロット' : 'Remaining Slots'}
            </span>
            <div className="flex items-center space-x-1">
              {[...Array(remainingSlots)].map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 bg-blue-400 rounded-full"
                />
              ))}
            </div>
          </div>
        )}

        {/* Limit Reached Message */}
        {isAtLimit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-green-100 border border-green-300 rounded-lg mb-3"
          >
            <p className="text-sm text-green-800 font-medium flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>
                {language === 'ja'
                  ? '最大選択数に達しました。オプションを交換する場合は、既存の項目を削除してください。'
                  : 'Maximum selection reached. Remove existing items to swap options.'
                }
              </span>
            </p>
          </motion.div>
        )}

        {/* Control Buttons */}
        {showControls && selectedCount > 0 && onClearAll && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="flex-1"
            >
              {language === 'ja' ? 'すべてクリア' : 'Clear All'}
            </Button>

            {remainingSlots > 0 && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Plus className="w-4 h-4" />
                <span>{remainingSlots}</span>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {selectedCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <p className="text-gray-500">
                  {language === 'ja' ? '使用率' : 'Usage'}
                </p>
                <p className="font-semibold text-gray-900">
                  {Math.round(progressPercentage)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">
                  {language === 'ja' ? '残り' : 'Left'}
                </p>
                <p className="font-semibold text-gray-900">
                  {remainingSlots}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface PostProcessingLimitIndicatorProps {
  isAtLimit: boolean
  selectedCount: number
  attemptedSelection?: string
  language?: 'en' | 'ja'
  onReplaceItem?: (itemId: string) => void
  onCancelSelection?: () => void
}

export function PostProcessingLimitIndicator({
  isAtLimit,
  selectedCount,
  attemptedSelection,
  language = 'ja',
  onReplaceItem,
  onCancelSelection
}: PostProcessingLimitIndicatorProps) {
  if (!isAtLimit) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-yellow-100 rounded-full">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800 mb-1">
            {language === 'ja' ? '選択制限に達しました' : 'Selection Limit Reached'}
          </h3>

          <p className="text-sm text-yellow-700 mb-3">
            {language === 'ja'
              ? `後加工オプションは最大${MAX_POST_PROCESSING_ITEMS}個まで選択可能です。新しい項目を追加するには、既存の項目を削除してください。`
              : `You can select up to ${MAX_POST_PROCESSING_ITEMS} post-processing options. Remove an existing item to add a new one.`
            }
          </p>

          <div className="flex items-center space-x-2">
            <Badge className="bg-yellow-600 text-white">
              {selectedCount} / {MAX_POST_PROCESSING_ITEMS}
            </Badge>

            {attemptedSelection && (
              <span className="text-sm text-yellow-600">
                {language === 'ja' ? '追加試行:' : 'Attempted to add:'} {attemptedSelection}
              </span>
            )}
          </div>
        </div>

        {onCancelSelection && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancelSelection}
            className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
          >
            {language === 'ja' ? 'キャンセル' : 'Cancel'}
          </Button>
        )}
      </div>
    </motion.div>
  )
}