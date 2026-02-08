'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Package,
  Star,
  Award,
  DollarSign,
  Zap,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Info,
  X,
  Replace,
  ArrowUpDown,
  Filter,
  Grid3X3,
  List,
  Eye,
  EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  MAX_POST_PROCESSING_ITEMS,
  calculatePostProcessingComparison,
  type PostProcessingComparison
} from './postProcessingLimits'
import type { ProcessingOptionConfig } from './processingConfig'

interface PostProcessingComparisonTableProps {
  selectedOptions: ProcessingOptionConfig[]
  onRemoveOption?: (optionId: string) => void
  onReplaceOption?: (oldOptionId: string, newOptionId: string) => void
  basePrice?: number
  quantities?: number[]
  language?: 'en' | 'ja'
  showActions?: boolean
  compact?: boolean
}

type SortOption = 'priority' | 'price' | 'time' | 'impact'
type ViewMode = 'table' | 'cards' | 'charts'

export function PostProcessingComparisonTable({
  selectedOptions,
  onRemoveOption,
  onReplaceOption,
  basePrice = 10000,
  quantities = [100, 500, 1000, 5000],
  language = 'ja',
  showActions = true,
  compact = false
}: PostProcessingComparisonTableProps) {
  const [sortBy, setSortBy] = useState<SortOption>('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showCostDetails, setShowCostDetails] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  // Calculate comparison data
  const comparisonData = useMemo(() => {
    return calculatePostProcessingComparison(selectedOptions)
  }, [selectedOptions])

  // Sort options based on current sort setting
  const sortedOptions = useMemo(() => {
    const options = [...comparisonData.items].map((item, index) => ({
      ...item,
      originalIndex: selectedOptions.findIndex(opt => opt.id === item.id)
    }))

    return options.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'priority':
          comparison = b.relativeImpact - a.relativeImpact
          break
        case 'price':
          comparison = a.priceMultiplier - b.priceMultiplier
          break
        case 'time':
          comparison = parseInt(a.processingTime) - parseInt(b.processingTime)
          break
        case 'impact':
          comparison = b.costImpact - a.costImpact
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })
  }, [comparisonData, sortBy, sortOrder])

  // Toggle row expansion
  const toggleRowExpansion = (index: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  // Get cost impact color
  const getCostImpactColor = (impact: number) => {
    if (impact < 10) return 'text-green-600 bg-green-50 border-green-200'
    if (impact < 25) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ja' ? 'ja-JP' : 'en-US', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (selectedOptions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {language === 'ja'
              ? '比較する後加工オプションが選択されていません'
              : 'No post-processing options selected for comparison'
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>
                {language === 'ja' ? '5アイテム比較分析' : '5-Item Comparison Analysis'}
              </span>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                {selectedOptions.length} / {MAX_POST_PROCESSING_ITEMS}
              </Badge>
            </CardTitle>

            <div className="flex items-center space-x-2">
              {/* View Mode Selector */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'table' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center space-x-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="priority">
                    {language === 'ja' ? '優先度' : 'Priority'}
                  </option>
                  <option value="price">
                    {language === 'ja' ? '価格' : 'Price'}
                  </option>
                  <option value="time">
                    {language === 'ja' ? '時間' : 'Time'}
                  </option>
                  <option value="impact">
                    {language === 'ja' ? '影響' : 'Impact'}
                  </option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>

              {/* Cost Details Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCostDetails(!showCostDetails)}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                {showCostDetails ? (language === 'ja' ? '非表示' : 'Hide') : (language === 'ja' ? '詳細' : 'Details')}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      {!compact && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    {language === 'ja' ? '総コスト影響' : 'Total Cost Impact'}
                  </p>
                  <p className="text-xl font-bold text-blue-900">
                    +{comparisonData.totalCostImpact.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">
                    {language === 'ja' ? '結合乗数' : 'Combined Multiplier'}
                  </p>
                  <p className="text-xl font-bold text-green-900">
                    x{comparisonData.combinedMultiplier.toFixed(2)}
                  </p>
                </div>
                <Zap className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">
                    {language === 'ja' ? '平均影響度' : 'Avg Impact'}
                  </p>
                  <p className="text-xl font-bold text-purple-900">
                    {(comparisonData.totalCostImpact / selectedOptions.length).toFixed(1)}%
                  </p>
                </div>
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">
                    {language === 'ja' ? '推奨優先度' : 'Top Priority'}
                  </p>
                  <p className="text-lg font-bold text-orange-900 truncate">
                    {sortedOptions[0]?.nameJa || sortedOptions[0]?.name}
                  </p>
                </div>
                <Award className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comparison Table */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {viewMode === 'table' && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 font-semibold">
                          {language === 'ja' ? 'オプション' : 'Option'}
                        </th>
                        <th className="text-left p-3 font-semibold">
                          {language === 'ja' ? 'カテゴリ' : 'Category'}
                        </th>
                        <th className="text-left p-3 font-semibold">
                          {language === 'ja' ? '価格影響' : 'Price Impact'}
                        </th>
                        <th className="text-left p-3 font-semibold">
                          {language === 'ja' ? '処理時間' : 'Processing Time'}
                        </th>
                        <th className="text-left p-3 font-semibold">
                          {language === 'ja' ? '機能・ベネフィット' : 'Features'}
                        </th>
                        {showActions && (
                          <th className="text-left p-3 font-semibold">
                            {language === 'ja' ? 'アクション' : 'Actions'}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedOptions.map((item, index) => (
                        <React.Fragment key={item.id}>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {language === 'ja' ? item.nameJa : item.name}
                                  </p>
                                  {comparisonData.recommendedPriority[0] === item.id && (
                                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 mt-1">
                                      <Star className="w-3 h-3 mr-1" />
                                      {language === 'ja' ? '推奨' : 'Recommended'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">{item.category}</Badge>
                            </td>
                            <td className="p-3">
                              <div className="space-y-1">
                                <Badge className={getCostImpactColor(item.costImpact)}>
                                  +{item.costImpact.toFixed(1)}%
                                </Badge>
                                <p className="text-xs text-gray-500">
                                  x{item.priceMultiplier.toFixed(2)}
                                </p>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{language === 'ja' ? item.processingTimeJa : item.processingTime}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{item.relativeImpact}</span>
                                <Zap className="w-3 h-3 text-orange-500" />
                              </div>
                            </td>
                            {showActions && (
                              <td className="p-3">
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleRowExpansion(index)}
                                  >
                                    {expandedRows.has(index) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </Button>
                                  {onRemoveOption && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onRemoveOption(item.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>

                          {/* Expanded Row Details */}
                          <AnimatePresence>
                            {expandedRows.has(index) && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <td colSpan={showActions ? 6 : 5} className="p-0">
                                  <div className="p-4 bg-gray-50 border-t">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-2">
                                          {language === 'ja' ? '機能' : 'Features'}
                                        </h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                          {selectedOptions[index]?.features.map((feature, i) => (
                                            <li key={i} className="flex items-center space-x-2">
                                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                              <span>{language === 'ja' ? feature : feature}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">
                                          {language === 'ja' ? 'ベネフィット' : 'Benefits'}
                                        </h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                          {selectedOptions[index]?.benefits.map((benefit, i) => (
                                            <li key={i} className="flex items-center space-x-2">
                                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                              <span>{language === 'ja' ? benefit : benefit}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>

                                    {showCostDetails && (
                                      <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h4 className="font-medium mb-2">
                                          {language === 'ja' ? 'コスト詳細' : 'Cost Details'}
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                          {quantities.map(qty => (
                                            <div key={qty} className="text-center">
                                              <p className="text-gray-500">{qty.toLocaleString()} {language === 'ja' ? '個' : 'units'}</p>
                                              <p className="font-semibold">
                                                {formatCurrency(basePrice * qty * item.priceMultiplier)}
                                              </p>
                                              <p className="text-xs text-green-600">
                                                +{((item.priceMultiplier - 1) * 100).toFixed(1)}%
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedOptions.map((item, index) => (
                <Card key={item.id} className="relative">
                  {comparisonData.recommendedPriority[0] === item.id && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        <Star className="w-3 h-3 mr-1" />
                        {language === 'ja' ? '推奨' : 'Top'}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {language === 'ja' ? item.nameJa : item.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {language === 'ja' ? '価格影響' : 'Price Impact'}
                        </span>
                        <Badge className={getCostImpactColor(item.costImpact)}>
                          +{item.costImpact.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {language === 'ja' ? '処理時間' : 'Processing Time'}
                        </span>
                        <div className="flex items-center space-x-1 text-sm">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{language === 'ja' ? item.processingTimeJa : item.processingTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {language === 'ja' ? '機能・ベネフィット' : 'Features'}
                        </span>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium">{item.relativeImpact}</span>
                          <Zap className="w-3 h-3 text-orange-500" />
                        </div>
                      </div>

                      {showActions && (
                        <div className="flex items-center space-x-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleRowExpansion(index)}
                            className="flex-1"
                          >
                            {expandedRows.has(index) ? (language === 'ja' ? '詳細を隠す' : 'Hide Details') : (language === 'ja' ? '詳細を見る' : 'View Details')}
                          </Button>
                          {onRemoveOption && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRemoveOption(item.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{language === 'ja' ? '推奨オプション' : 'Recommended'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-orange-500" />
          <span>{language === 'ja' ? '機能・ベネフィット数' : 'Feature Count'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <span>{language === 'ja' ? '処理時間' : 'Processing Time'}</span>
        </div>
      </div>
    </div>
  )
}