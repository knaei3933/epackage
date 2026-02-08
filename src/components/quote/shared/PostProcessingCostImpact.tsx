'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Eye,
  EyeOff,
  Info,
  Calculator,
  Package,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { calculatePostProcessingComparison } from './postProcessingLimits'
import type { ProcessingOptionConfig } from './processingConfig'

interface PostProcessingCostImpactProps {
  selectedOptions: ProcessingOptionConfig[]
  basePrice: number
  quantities: number[]
  language?: 'en' | 'ja'
  showDetailedBreakdown?: boolean
  compact?: boolean
}

interface CostBreakdown {
  quantity: number
  baseCost: number
  processingCost: number
  totalCost: number
  costPerUnit: number
  impact: number
  impactPerUnit: number
}

interface OptionImpact {
  id: string
  name: string
  nameJa: string
  priceMultiplier: number
  costImpact: number
  impact: number
  category: string
  features: number
  benefits: number
  valueScore: number
}

export function PostProcessingCostImpact({
  selectedOptions,
  basePrice,
  quantities = [100, 500, 1000, 5000],
  language = 'ja',
  showDetailedBreakdown = false,
  compact = false
}: PostProcessingCostImpactProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'cards'>('chart')
  const [selectedQuantity, setSelectedQuantity] = useState(quantities[0])
  const [showComparison, setShowComparison] = useState(false)

  // Calculate comprehensive cost analysis
  const costAnalysis = useMemo(() => {
    const comparison = calculatePostProcessingComparison(selectedOptions)
    const totalMultiplier = comparison.combinedMultiplier

    // Calculate cost breakdown for each quantity
    const breakdowns: CostBreakdown[] = quantities.map(quantity => {
      const baseCost = basePrice * quantity
      const processingCost = baseCost * (totalMultiplier - 1)
      const totalCost = baseCost * totalMultiplier
      const costPerUnit = totalCost / quantity
      const impact = ((totalMultiplier - 1) * 100)
      const impactPerUnit = (costPerUnit - basePrice)

      return {
        quantity,
        baseCost,
        processingCost,
        totalCost,
        costPerUnit,
        impact,
        impactPerUnit
      }
    })

    // Calculate individual option impacts
    const optionImpacts: OptionImpact[] = comparison.items.map(item => {
      const valueScore = (item.features.length + item.benefits.length) / item.priceMultiplier
      return {
        id: item.id,
        name: item.name,
        nameJa: item.nameJa,
        priceMultiplier: item.priceMultiplier,
        costImpact: item.costImpact,
        impact: item.relativeImpact,
        category: item.category,
        features: selectedOptions.find(opt => opt.id === item.id)?.features.length || 0,
        benefits: selectedOptions.find(opt => opt.id === item.id)?.benefits.length || 0,
        valueScore
      }
    })

    return {
      totalMultiplier,
      totalImpact: comparison.totalCostImpact,
      breakdowns,
      optionImpacts,
      recommendedOptions: comparison.recommendedPriority,
      averageImpact: comparison.totalCostImpact / selectedOptions.length,
      bestValueOption: optionImpacts.sort((a, b) => b.valueScore - a.valueScore)[0],
      highestImpactOption: optionImpacts.sort((a, b) => b.impact - a.impact)[0]
    }
  }, [selectedOptions, basePrice, quantities])

  // Get selected breakdown
  const selectedBreakdown = costAnalysis.breakdowns.find(b => b.quantity === selectedQuantity)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ja' ? 'ja-JP' : 'en-US', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Get impact color
  const getImpactColor = (impact: number) => {
    if (impact < 5) return 'text-green-600 bg-green-50'
    if (impact < 15) return 'text-yellow-600 bg-yellow-50'
    if (impact < 30) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  // Get trend icon
  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-600" />
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  if (selectedOptions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {language === 'ja'
              ? 'コスト影響を分析するために後加工オプションを選択してください'
              : 'Select post-processing options to analyze cost impact'
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="w-5 h-5" />
              <span>
                {language === 'ja' ? 'コスト影響分析' : 'Cost Impact Analysis'}
              </span>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                {selectedOptions.length} {language === 'ja' ? 'アイテム' : 'items'}
              </Badge>
            </CardTitle>

            <div className="flex items-center space-x-2">
              {/* View Mode Selector */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'chart' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('chart')}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <PieChart className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                >
                  <Package className="w-4 h-4" />
                </Button>
              </div>

              {/* Quantity Selector */}
              <select
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                className="text-sm border rounded px-2 py-1"
              >
                {quantities.map(qty => (
                  <option key={qty} value={qty}>
                    {qty.toLocaleString()} {language === 'ja' ? '個' : 'units'}
                  </option>
                ))}
              </select>
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
                    {language === 'ja' ? '総コスト影響' : 'Total Impact'}
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    +{costAnalysis.totalImpact.toFixed(1)}%
                  </p>
                  <p className="text-xs text-blue-700">
                    x{costAnalysis.totalMultiplier.toFixed(2)}
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
                    {language === 'ja' ? '追加コスト' : 'Additional Cost'}
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(selectedBreakdown?.processingCost || 0)}
                  </p>
                  <p className="text-xs text-green-700">
                    {selectedQuantity.toLocaleString()} {language === 'ja' ? '個' : 'units'}
                  </p>
                </div>
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">
                    {language === 'ja' ? '単価' : 'Cost per Unit'}
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(selectedBreakdown?.costPerUnit || 0)}
                  </p>
                  <p className="text-xs text-purple-700">
                    +{formatCurrency(selectedBreakdown?.impactPerUnit || 0)}
                  </p>
                </div>
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">
                    {language === 'ja' ? '平均影響' : 'Avg Impact'}
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    +{costAnalysis.averageImpact.toFixed(1)}%
                  </p>
                  {costAnalysis.bestValueOption && (
                    <p className="text-xs text-orange-700 truncate">
                      {language === 'ja' ? costAnalysis.bestValueOption.nameJa : costAnalysis.bestValueOption.name}
                    </p>
                  )}
                </div>
                <Star className="w-6 h-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {/* Chart View */}
          {viewMode === 'chart' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Comparison Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'ja' ? '数量別コスト比較' : 'Cost Comparison by Quantity'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {costAnalysis.breakdowns.map((breakdown, index) => (
                      <div key={breakdown.quantity} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {breakdown.quantity.toLocaleString()} {language === 'ja' ? '個' : 'units'}
                          </span>
                          <span className="text-gray-600">
                            {formatCurrency(breakdown.totalCost)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div className="flex h-full">
                            <div
                              className="bg-blue-500 flex items-center justify-center text-white text-xs"
                              style={{ width: `${(breakdown.baseCost / breakdown.totalCost) * 100}%` }}
                            >
                              {language === 'ja' ? '基本' : 'Base'}
                            </div>
                            <div
                              className="bg-green-500 flex items-center justify-center text-white text-xs"
                              style={{ width: `${(breakdown.processingCost / breakdown.totalCost) * 100}%` }}
                            >
                              +{breakdown.impact.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Option Impact Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'ja' ? 'オプション別影響度' : 'Impact by Option'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {costAnalysis.optionImpacts.map((option) => (
                      <div key={option.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">
                              {language === 'ja' ? option.nameJa : option.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {option.category}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${getImpactColor(option.costImpact).split(' ')[0]}`}>
                              +{option.costImpact.toFixed(1)}%
                            </span>
                            {getTrendIcon(option.valueScore)}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <motion.div
                            className={`h-full ${
                              option.costImpact < 10 ? 'bg-green-500' :
                              option.costImpact < 20 ? 'bg-yellow-500' :
                              option.costImpact < 30 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(option.costImpact * 3, 100)}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {option.features + option.benefits} {language === 'ja' ? '機能' : 'features'}
                          </span>
                          <span>
                            {language === 'ja' ? '価値スコア:' : 'Value Score:'} {option.valueScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 font-semibold">
                          {language === 'ja' ? '数量' : 'Quantity'}
                        </th>
                        <th className="text-left p-3 font-semibold">
                          {language === 'ja' ? '基本コスト' : 'Base Cost'}
                        </th>
                        <th className="text-left p-3 font-semibold">
                          {language === 'ja' ? '加工コスト' : 'Processing Cost'}
                        </th>
                        <th className="text-left p-3 font-semibold">
                          {language === 'ja' ? '総コスト' : 'Total Cost'}
                        </th>
                        <th className="text-left p-3 font-semibold">
                          {language === 'ja' ? '単価' : 'Cost per Unit'}
                        </th>
                        <th className="text-left p-3 font-semibold">
                          {language === 'ja' ? '影響' : 'Impact'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {costAnalysis.breakdowns.map((breakdown) => (
                        <tr key={breakdown.quantity} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">
                            {breakdown.quantity.toLocaleString()}
                          </td>
                          <td className="p-3">
                            {formatCurrency(breakdown.baseCost)}
                          </td>
                          <td className="p-3">
                            <span className="text-green-600 font-medium">
                              +{formatCurrency(breakdown.processingCost)}
                            </span>
                          </td>
                          <td className="p-3 font-semibold">
                            {formatCurrency(breakdown.totalCost)}
                          </td>
                          <td className="p-3">
                            {formatCurrency(breakdown.costPerUnit)}
                          </td>
                          <td className="p-3">
                            <Badge className={getImpactColor(breakdown.impact)}>
                              +{breakdown.impact.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {costAnalysis.optionImpacts.map((option) => (
                <Card key={option.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        {language === 'ja' ? option.nameJa : option.name}
                      </h3>
                      <Badge variant="outline">{option.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">
                            {language === 'ja' ? '価格影響' : 'Price Impact'}
                          </p>
                          <p className="font-semibold">
                            +{option.costImpact.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            {language === 'ja' ? '乗数' : 'Multiplier'}
                          </p>
                          <p className="font-semibold">
                            x{option.priceMultiplier.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            {language === 'ja' ? '機能数' : 'Features'}
                          </p>
                          <p className="font-semibold">{option.features + option.benefits}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            {language === 'ja' ? '価値スコア' : 'Value Score'}
                          </p>
                          <p className="font-semibold">{option.valueScore.toFixed(1)}</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className={`h-full ${
                            option.costImpact < 10 ? 'bg-green-500' :
                            option.costImpact < 20 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(option.costImpact * 3, 100)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>

                      {costAnalysis.recommendedOptions[0] === option.id && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 w-full justify-center">
                          <Star className="w-3 h-3 mr-1" />
                          {language === 'ja' ? '推奨' : 'Recommended'}
                        </Badge>
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
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span>{language === 'ja' ? '基本コスト' : 'Base Cost'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span>{language === 'ja' ? '加工コスト' : 'Processing Cost'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{language === 'ja' ? '推奨オプション' : 'Recommended'}</span>
        </div>
      </div>
    </div>
  )
}