'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  TrendingUp,
  DollarSign,
  Clock,
  Package,
  ChevronRight,
  Sparkles,
  Award,
  Zap,
  CheckCircle,
  Lightbulb,
  Target,
  Info
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  processingOptionsConfig,
  getProcessingOptionsByCompatibility,
  calculateProcessingImpact,
  type ProcessingOptionConfig
} from './processingConfig'

interface SmartRecommendationsProps {
  selectedProductType: string
  selectedOptions: string[]
  onOptionsChange: (options: string[]) => void
  language?: 'en' | 'ja'
  budget?: number
  timeline?: 'express' | 'standard' | 'economy'
  useCase?: 'retail' | 'industrial' | 'food' | 'cosmetics' | 'medical'
}

interface Recommendation {
  id: string
  title: string
  titleJa: string
  description: string
  descriptionJa: string
  options: string[]
  benefits: string[]
  benefitsJa: string[]
  priority: 'high' | 'medium' | 'low'
  priceImpact: number
  timeImpact: string
  timeImpactJa: string
  category: 'popular' | 'budget' | 'premium' | 'functional'
  reasoning: string
  reasoningJa: string
}

export function SmartRecommendations({
  selectedProductType,
  selectedOptions,
  onOptionsChange,
  language = 'ja',
  budget,
  timeline = 'standard',
  useCase = 'retail'
}: SmartRecommendationsProps) {
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Get compatible options
  const compatibleOptions = useMemo(() => {
    return getProcessingOptionsByCompatibility(selectedProductType)
  }, [selectedProductType])

  // Generate smart recommendations
  const generateRecommendations = useCallback((): Recommendation[] => {
    const recommendations: Recommendation[] = []

    // Popular combinations based on product type and use case
    const popularCombinations: Record<string, Record<string, string[]>> = {
      retail: {
        stand_up: ['zipper-yes', 'notch-yes', 'hang-hole-yes', 'glossy'],
        flat_3_side: ['glossy', 'notch-yes', 'hang-hole-yes'],
        gusset: ['zipper-yes', 'corner-round']
      },
      food: {
        stand_up: ['zipper-yes', 'valve-yes', 'notch-yes', 'matte'],
        flat_3_side: ['matte', 'notch-yes'],
        gusset: ['zipper-yes', 'valve-yes']
      },
      cosmetics: {
        stand_up: ['zipper-yes', 'glossy', 'corner-round', 'hang-hole-yes'],
        flat_3_side: ['glossy', 'corner-round'],
        gusset: ['zipper-yes', 'corner-round']
      },
      industrial: {
        stand_up: ['zipper-yes', 'bottom-open', 'corner-square'],
        flat_3_side: ['notch-no', 'corner-square'],
        gusset: ['valve-no', 'bottom-open']
      },
      medical: {
        stand_up: ['zipper-yes', 'notch-yes', 'matte'],
        flat_3_side: ['matte', 'notch-yes'],
        gusset: ['zipper-yes']
      }
    }

    const combinations = popularCombinations[useCase]?.[selectedProductType] || []

    if (combinations.length > 0) {
      const options = combinations.filter(id =>
        compatibleOptions.some(opt => opt.id === id)
      )

      if (options.length > 0) {
        const impact = calculateProcessingImpact(options)

        recommendations.push({
          id: 'popular-combo',
          title: language === 'ja' ? '人気の組み合わせ' : 'Popular Combination',
          titleJa: '人気の組み合わせ',
          description: language === 'ja'
            ? `${useCase}製品で最も人気のある後加工オプション`
            : `Most popular post-processing options for ${useCase} products`,
          descriptionJa: `${useCase}製品で最も人気のある後加工オプション`,
          options,
          benefits: [
            language === 'ja' ? '顧客満足度が高い' : 'High customer satisfaction',
            language === 'ja' ? '市場実績豊富' : 'Proven market performance',
            language === 'ja' ? 'バランスの取れた機能性' : 'Balanced functionality'
          ],
          benefitsJa: ['顧客満足度が高い', '市場実績豊富', 'バランスの取れた機能性'],
          priority: 'high',
          priceImpact: impact.multiplier - 1,
          timeImpact: impact.processingTime,
          timeImpactJa: impact.processingTimeJa,
          category: 'popular',
          reasoning: language === 'ja'
            ? `${useCase}製品の成功事例に基づく推奨`
            : `Based on successful ${useCase} product case studies`,
          reasoningJa: `${useCase}製品の成功事例に基づく推奨`
        })
      }
    }

    // Budget-conscious recommendation
    if (budget || timeline === 'economy') {
      const essentialOptions = compatibleOptions.filter(opt =>
        opt.priceMultiplier <= 1.05 && ['zipper-no', 'notch-no', 'corner-square'].includes(opt.id)
      )

      if (essentialOptions.length > 0) {
        recommendations.push({
          id: 'budget-friendly',
          title: language === 'ja' ? 'コスト重視' : 'Budget Friendly',
          titleJa: 'コスト重視',
          description: language === 'ja'
            ? '最低限の機能でコストを抑えた構成'
            : 'Essential features with minimal cost impact',
          descriptionJa: '最低限の機能でコストを抑えた構成',
          options: essentialOptions.map(opt => opt.id).slice(0, 2),
          benefits: [
            language === 'ja' ? 'コスト効率最大化' : 'Maximum cost efficiency',
            language === 'ja' ? '迅速な生産' : 'Fast production',
            language === 'ja' ? '基本的な機能確保' : 'Essential functionality'
          ],
          benefitsJa: ['コスト効率最大化', '迅速な生産', '基本的な機能確保'],
          priority: 'medium',
          priceImpact: 0.0,
          timeImpact: 'Standard production time',
          timeImpactJa: '標準生産時間',
          category: 'budget',
          reasoning: language === 'ja'
            ? '予算制約を考慮した最適な構成'
            : 'Optimal configuration considering budget constraints',
          reasoningJa: '予算制約を考慮した最適な構成'
        })
      }
    }

    // Premium recommendation
    if (timeline === 'standard' || useCase === 'cosmetics' || useCase === 'retail') {
      const premiumOptions = compatibleOptions.filter(opt =>
        opt.priceMultiplier >= 1.05 && ['glossy', 'zipper-yes', 'corner-round', 'hang-hole-yes'].includes(opt.id)
      )

      if (premiumOptions.length > 0) {
        const impact = calculateProcessingImpact(premiumOptions.slice(0, 3).map(opt => opt.id))

        recommendations.push({
          id: 'premium-package',
          title: language === 'ja' ? 'プレミアム仕様' : 'Premium Package',
          titleJa: 'プレミアム仕様',
          description: language === 'ja'
            ? '最高品質の仕上げとプレミアム機能'
            : 'Premium features and highest quality finish',
          descriptionJa: '最高品質の仕上げとプレミアム機能',
          options: premiumOptions.slice(0, 3).map(opt => opt.id),
          benefits: [
            language === 'ja' ? 'プレミアムな外観' : 'Premium appearance',
            language === 'ja' ? 'ブランド価値向上' : 'Enhanced brand value',
            language === 'ja' ? '製品差別化' : 'Product differentiation'
          ],
          benefitsJa: ['プレミアムな外観', 'ブランド価値向上', '製品差別化'],
          priority: 'medium',
          priceImpact: impact.multiplier - 1,
          timeImpact: impact.processingTime,
          timeImpactJa: impact.processingTimeJa,
          category: 'premium',
          reasoning: language === 'ja'
            ? '高付加価値製品向けの最高仕様'
            : 'Best-in-class specifications for high-value products',
          reasoningJa: '高付加価値製品向けの最高仕様'
        })
      }
    }

    // Functional recommendations based on missing features
    const currentOptions = selectedOptions.map(id =>
      processingOptionsConfig.find(opt => opt.id === id)
    ).filter(Boolean) as ProcessingOptionConfig[]

    const hasOpeningSealing = currentOptions.some(opt => opt.category === 'opening-sealing')
    const hasSurfaceTreatment = currentOptions.some(opt => opt.category === 'surface-treatment')

    if (!hasOpeningSealing && compatibleOptions.some(opt => opt.category === 'opening-sealing')) {
      const openingSealingOptions = compatibleOptions.filter(opt => opt.category === 'opening-sealing')
      recommendations.push({
        id: 'add-closure',
        title: language === 'ja' ? '閉鎖機能の追加' : 'Add Closure Feature',
        titleJa: '閉鎖機能の追加',
        description: language === 'ja'
          ? '再利用可能な閉鎖機能で利便性を向上'
          : 'Improve convenience with resealable closure',
        descriptionJa: '再利用可能な閉鎖機能で利便性を向上',
        options: [openingSealingOptions[0]?.id || 'zipper-yes'],
        benefits: [
          language === 'ja' ? '消費者の利便性' : 'Consumer convenience',
          language === 'ja' ? '製品鮮度維持' : 'Product freshness',
          language === 'ja' ? '再利用可能' : 'Resealable'
        ],
        benefitsJa: ['消費者の利便性', '製品鮮度維持', '再利用可能'],
        priority: 'high',
        priceImpact: 0.15,
        timeImpact: '+2-3 business days',
        timeImpactJa: '+2-3営業日',
        category: 'functional',
        reasoning: language === 'ja'
          ? '現在の選択に閉鎖機能がありません'
          : 'Current selection lacks closure functionality',
        reasoningJa: '現在の選択に閉鎖機能がありません'
      })
    }

    if (!hasSurfaceTreatment && compatibleOptions.some(opt => opt.category === 'surface-treatment')) {
      const surfaceTreatmentOptions = compatibleOptions.filter(opt => opt.category === 'surface-treatment')
      const recommendedSurfaceTreatment = surfaceTreatmentOptions.find(opt => opt.id === 'matte') || surfaceTreatmentOptions[0]

      recommendations.push({
        id: 'add-finish',
        title: language === 'ja' ? '表面仕上げの追加' : 'Add Surface Finish',
        titleJa: '表面仕上げの追加',
        description: language === 'ja'
          ? '製品の外観と質感を向上させる仕上げ'
          : 'Enhance product appearance and texture',
        descriptionJa: '製品の外観と質感を向上させる仕上げ',
        options: [recommendedSurfaceTreatment?.id || 'matte'],
        benefits: [
          language === 'ja' ? '視覚的魅力' : 'Visual appeal',
          language === 'ja' ? 'ブランドイメージ' : 'Brand image',
          language === 'ja' ? '質感向上' : 'Enhanced texture'
        ],
        benefitsJa: ['視覚的魅力', 'ブランドイメージ', '質感向上'],
        priority: 'medium',
        priceImpact: 0.05,
        timeImpact: '+1-2 business days',
        timeImpactJa: '+1-2営業日',
        category: 'functional',
        reasoning: language === 'ja'
          ? '表面仕上げで製品価値を向上'
          : 'Add surface finish to enhance product value',
        reasoningJa: '表面仕上げで製品価値を向上'
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }, [selectedProductType, compatibleOptions, language, useCase, budget, timeline, selectedOptions])

  const recommendations = generateRecommendations()

  // Get category styling
  const getCategoryStyle = (category: Recommendation['category']) => {
    const styles = {
      popular: 'bg-purple-50 text-purple-700 border-purple-200',
      budget: 'bg-green-50 text-green-700 border-green-200',
      premium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      functional: 'bg-blue-50 text-blue-700 border-blue-200'
    }
    return styles[category]
  }

  // Get category icon
  const getCategoryIcon = (category: Recommendation['category']) => {
    const icons = {
      popular: <Star className="w-5 h-5" />,
      budget: <DollarSign className="w-5 h-5" />,
      premium: <Award className="w-5 h-5" />,
      functional: <Target className="w-5 h-5" />
    }
    return icons[category]
  }

  // Apply recommendation
  const applyRecommendation = useCallback((recommendation: Recommendation) => {
    const newOptions = [...new Set([...selectedOptions, ...recommendation.options])]
    onOptionsChange(newOptions)
    setSelectedRecommendation(recommendation.id)
    setTimeout(() => setSelectedRecommendation(null), 2000)
  }, [selectedOptions, onOptionsChange])

  // Get recommendation details
  const getRecommendationDetails = useCallback((recommendation: Recommendation) => {
    const options = recommendation.options.map(id =>
      processingOptionsConfig.find(opt => opt.id === id)
    ).filter(Boolean) as ProcessingOptionConfig[]

    return {
      options,
      totalImpact: calculateProcessingImpact(recommendation.options)
    }
  }, [])

  if (recommendations.length === 0) {
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'ja' ? 'スマート推奨' : 'Smart Recommendations'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'ja'
                  ? '製品タイプと用途に基づく最適な組み合わせ'
                  : 'Optimal combinations based on product type and use case'}
              </p>
            </div>
          </div>

          {/* Recommendations List */}
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => {
              const isSelected = selectedRecommendation === recommendation.id
              const details = getRecommendationDetails(recommendation)

              return (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                  }`}
                  onClick={() => applyRecommendation(recommendation)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${getCategoryStyle(recommendation.category)}`}>
                          {getCategoryIcon(recommendation.category)}
                        </div>
                        <h4 className="font-semibold text-gray-900">
                          {language === 'ja' ? recommendation.titleJa : recommendation.title}
                        </h4>
                        {recommendation.priority === 'high' && (
                          <Badge variant="default" className="text-xs bg-red-500">
                            {language === 'ja' ? '推奨' : 'Recommended'}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600">
                        {language === 'ja' ? recommendation.descriptionJa : recommendation.description}
                      </p>

                      {/* Options Preview */}
                      <div className="flex flex-wrap gap-1">
                        {details.options.map((option) => (
                          <Badge key={option.id} variant="outline" className="text-xs">
                            {language === 'ja' ? option.nameJa : option.name}
                          </Badge>
                        ))}
                      </div>

                      {/* Benefits */}
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          {language === 'ja' ? recommendation.reasoningJa : recommendation.reasoning}
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="font-medium">
                          +{(recommendation.priceImpact * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="text-xs text-gray-500">
                        {language === 'ja' ? recommendation.timeImpactJa : recommendation.timeImpact}
                      </div>

                      <Button size="sm" className="mt-2">
                        {isSelected ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Help Text */}
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
            <Info className="w-3 h-3" />
            <span>
              {language === 'ja'
                ? '推奨事項は製品タイプ、用途、市場データに基づいて生成されます'
                : 'Recommendations are generated based on product type, use case, and market data'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}