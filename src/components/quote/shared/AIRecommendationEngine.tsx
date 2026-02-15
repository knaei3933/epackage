'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Sparkles,
  TrendingUp,
  Award,
  Target,
  Lightbulb,
  Clock,
  DollarSign,
  Package,
  Users,
  Zap,
  ChevronRight,
  Info,
  X,
  Check,
  AlertCircle,
  Star,
  Brain,
  BarChart3,
  Leaf,
  Filter,
  Eye,
  Settings,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import {
  processingOptionsConfig,
  getProcessingOptionsByCompatibility,
  calculateProcessingImpact,
  type ProcessingOptionConfig
} from './processingConfig'

interface RecommendationScore {
  optionId: string
  score: number
  reasoning: string[]
  reasoningJa: string[]
  confidence: number
  category: string
}

interface UserProfile {
  industry?: string
  targetMarket?: string
  budgetLevel?: 'low' | 'medium' | 'high'
  volumeSize?: 'small' | 'medium' | 'large'
  priorityFactors?: ('cost' | 'quality' | 'speed' | 'sustainability')[]
  previousSelections?: string[]
}

interface AIRecommendationEngineProps {
  selectedProductType: string
  selectedOptions: string[]
  onOptionsChange: (options: string[]) => void
  language?: 'en' | 'ja'
  userProfile?: UserProfile
}

export function AIRecommendationEngine({
  selectedProductType,
  selectedOptions,
  onOptionsChange,
  language = 'ja',
  userProfile
}: AIRecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationScore | null>(null)
  const [aiMode, setAiMode] = useState<'smart' | 'budget' | 'premium' | 'eco'>('smart')

  // Industry-specific processing preferences
  const industryProfiles = useMemo(() => ({
    coffee: {
      recommendedOptions: ['valve-yes', 'zipper-yes', 'glossy', 'hang-hole-yes'],
      priorityFactors: ['quality', 'sustainability'],
      reasoning: 'Coffee requires valve for freshness, zipper for reusability, and premium finish for brand perception.',
      reasoningJa: 'コーヒーには鮮度維持のためのバルブ、再利用性のためのジッパー、ブランドイメージのためのプレミアム仕上げが必要です。'
    },
    snacks: {
      recommendedOptions: ['zipper-yes', 'notch-yes', 'hang-hole-yes', 'glossy'],
      priorityFactors: ['cost', 'speed'],
      reasoning: 'Snack foods benefit from resealability, easy opening, retail display, and attractive finish.',
      reasoningJa: 'スナック食品は再密封性、簡単な開封、店舗表示、魅力的な仕上げが利益になります。'
    },
    supplements: {
      recommendedOptions: ['zipper-yes', 'matte', 'corner-round', 'valve-yes'],
      priorityFactors: ['quality', 'sustainability'],
      reasoning: 'Health supplements need secure closure, premium appearance, safety features, and moisture protection.',
      reasoningJa: '健康サプリメントには安全な閉鎖、プレミアム外観、安全機能、湿気保護が必要です。'
    },
    pet_food: {
      recommendedOptions: ['zipper-yes', 'notch-yes', 'bottom-open', 'glossy'],
      priorityFactors: ['cost', 'quality'],
      reasoning: 'Pet food requires freshness preservation, easy opening, complete dispensing, and durability.',
      reasoningJa: 'ペットフードには鮮度保持、簡単な開封、完全な分配、耐久性が必要です。'
    }
  }), [])

  // Generate AI recommendations based on multiple factors
  const generateRecommendations = useCallback(async () => {
    setIsGenerating(true)

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const compatibleOptions = getProcessingOptionsByCompatibility(selectedProductType)
    const scores: RecommendationScore[] = []

    compatibleOptions.forEach(option => {
      let score = 0
      const reasoning: string[] = []
      const reasoningJa: string[] = []

      // Industry-specific scoring
      if (userProfile?.industry && industryProfiles[userProfile.industry as keyof typeof industryProfiles]) {
        const profile = industryProfiles[userProfile.industry as keyof typeof industryProfiles]
        if (profile.recommendedOptions.includes(option.id)) {
          score += 25
          reasoning.push('Industry standard for your product type')
          reasoningJa.push('あなたの製品タイプの業界標準')
        }
      }

      // Budget optimization scoring
      if (aiMode === 'budget' || userProfile?.budgetLevel === 'low') {
        if (option.priceMultiplier <= 1.05) {
          score += 20
          reasoning.push('Cost-effective solution')
          reasoningJa.push('コスト効率の良いソリューション')
        }
      } else if (aiMode === 'premium' || userProfile?.budgetLevel === 'high') {
        if (option.priceMultiplier >= 1.08) {
          score += 15
          reasoning.push('Premium quality option')
          reasoningJa.push('プレミアム品質オプション')
        }
      }

      // Priority factor alignment
      if (userProfile?.priorityFactors) {
        userProfile.priorityFactors.forEach(factor => {
          switch (factor) {
            case 'cost':
              if (option.priceMultiplier <= 1.05) score += 10
              break
            case 'quality':
              if (option.features.length >= 3) score += 10
              break
            case 'speed':
              if (option.processingTime.includes('Standard')) score += 10
              break
            case 'sustainability':
              if (option.benefits.some(b => b.toLowerCase().includes('waste') || b.toLowerCase().includes('sustainable'))) {
                score += 10
              }
              break
          }
        })
      }

      // Feature richness scoring
      score += Math.min(option.features.length * 3, 15)
      reasoning.push(`${option.features.length} key features`)
      reasoningJa.push(`${option.features.length}つの主要機能`)

      // Benefits scoring
      score += Math.min(option.benefits.length * 2, 10)

      // Compatibility scoring
      if (option.compatibleWith.includes(selectedProductType)) {
        score += 10
        reasoning.push('Perfect compatibility with selected product')
        reasoningJa.push('選択された製品との完全な互換性')
      }

      // Market trends scoring
      const trendingOptions = ['zipper-yes', 'matte', 'corner-round', 'valve-yes']
      if (trendingOptions.includes(option.id)) {
        score += 8
        reasoning.push('Currently trending in the market')
        reasoningJa.push('現在市場でトレンド中')
      }

      // Volume-based scoring
      if (userProfile?.volumeSize === 'large') {
        if (option.minimumQuantity <= 2000) {
          score += 5
          reasoning.push('Suitable for large volume orders')
          reasoningJa.push('大口注文に適しています')
        }
      } else if (userProfile?.volumeSize === 'small') {
        if (option.minimumQuantity <= 1000) {
          score += 5
          reasoning.push('Low minimum order quantity')
          reasoningJa.push('最小注文数量が少ない')
        }
      }

      // Previous selections learning
      if (userProfile?.previousSelections?.includes(option.id)) {
        score += 5
        reasoning.push('Previously selected option')
        reasoningJa.push('以前に選択したオプション')
      }

      // Complementarity with already selected options
      selectedOptions.forEach(selectedId => {
        const selectedOption = processingOptionsConfig.find(opt => opt.id === selectedId)
        if (selectedOption && selectedOption.category !== option.category) {
          score += 3
          reasoning.push(`Complements ${language === 'ja' ? selectedOption.nameJa : selectedOption.name}`)
          reasoningJa.push(`${language === 'ja' ? selectedOption.nameJa : selectedOption.name}を補完`)
        }
      })

      scores.push({
        optionId: option.id,
        score: Math.min(score, 100),
        reasoning,
        reasoningJa,
        confidence: Math.random() * 20 + 80, // 80-100% confidence
        category: option.category
      })
    })

    // Sort by score and take top recommendations
    const sortedScores = scores.sort((a, b) => b.score - a.score).slice(0, 6)
    setRecommendations(sortedScores)
    setIsGenerating(false)
  }, [selectedProductType, userProfile, aiMode, selectedOptions, language])

  // Generate recommendations on component mount and when dependencies change
  useEffect(() => {
    generateRecommendations()
  }, [generateRecommendations])

  // Apply recommendation
  const applyRecommendation = useCallback((recommendation: RecommendationScore) => {
    const newOptions = [...new Set([...selectedOptions, recommendation.optionId])]
    onOptionsChange(newOptions)
    setSelectedRecommendation(recommendation)
  }, [selectedOptions, onOptionsChange])

  // Apply all top recommendations
  const applyAllRecommendations = useCallback(() => {
    const topRecommendations = recommendations.slice(0, 3).map(r => r.optionId)
    const newOptions = [...new Set([...selectedOptions, ...topRecommendations])]
    onOptionsChange(newOptions)
  }, [recommendations, selectedOptions, onOptionsChange])

  const getOptionById = (id: string): ProcessingOptionConfig | undefined => {
    return processingOptionsConfig.find(opt => opt.id === id)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'closure': return <Package className="w-4 h-4" />
      case 'finish': return <Sparkles className="w-4 h-4" />
      case 'opening': return <Target className="w-4 h-4" />
      case 'display': return <Award className="w-4 h-4" />
      case 'structure': return <Settings className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <MotionWrapper delay={0.1}>
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full p-3">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {language === 'ja' ? 'AI 推薦エンジン' : 'AI Recommendation Engine'}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'ja'
                      ? '製品と要件に基づいたインテリジェントな後加工オプション推薦'
                      : 'Intelligent processing option recommendations based on your product and requirements'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* AI Mode Selector */}
                <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm">
                  <Button
                    variant={aiMode === 'smart' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setAiMode('smart')}
                    className="text-xs"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {language === 'ja' ? 'スマート' : 'Smart'}
                  </Button>
                  <Button
                    variant={aiMode === 'budget' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setAiMode('budget')}
                    className="text-xs"
                  >
                    <DollarSign className="w-3 h-3 mr-1" />
                    {language === 'ja' ? '予算' : 'Budget'}
                  </Button>
                  <Button
                    variant={aiMode === 'premium' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setAiMode('premium')}
                    className="text-xs"
                  >
                    <Award className="w-3 h-3 mr-1" />
                    {language === 'ja' ? 'プレミアム' : 'Premium'}
                  </Button>
                  <Button
                    variant={aiMode === 'eco' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setAiMode('eco')}
                    className="text-xs"
                  >
                    <Leaf className="w-3 h-3 mr-1" />
                    {language === 'ja' ? 'エコ' : 'Eco'}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateRecommendations}
                  disabled={isGenerating}
                  className="flex items-center space-x-1"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{language === 'ja' ? '再生成' : 'Regenerate'}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionWrapper>

      {/* Recommendations Loading */}
      {isGenerating && (
        <MotionWrapper delay={0.2}>
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Brain className="w-12 h-12 text-purple-600" />
                  <div className="absolute -top-1 -right-1">
                    <div className="w-4 h-4 bg-purple-600 rounded-full animate-ping" />
                  </div>
                </div>
                <p className="text-gray-600 font-medium">
                  {language === 'ja' ? 'AIが最適な推薦を分析中...' : 'AI analyzing optimal recommendations...'}
                </p>
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionWrapper>
      )}

      {/* Recommendations List */}
      {!isGenerating && recommendations.length > 0 && (
        <MotionWrapper delay={0.3}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">
                {language === 'ja' ? '推薦されたオプション' : 'Recommended Options'}
              </h4>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="flex items-center space-x-1"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>{language === 'ja' ? '理由を表示' : 'Show Reasoning'}</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={applyAllRecommendations}
                  className="flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'ja' ? '上位3つを適用' : 'Apply Top 3'}</span>
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {recommendations.map((recommendation, index) => {
                const option = getOptionById(recommendation.optionId)
                if (!option) return null

                const isSelected = selectedOptions.includes(recommendation.optionId)
                const isTopRecommendation = index === 0

                return (
                  <motion.div
                    key={recommendation.optionId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`transition-all duration-300 ${
                      isSelected ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-lg'
                    } ${isTopRecommendation ? 'border-2 border-purple-300 bg-purple-50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {/* Rank Badge */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                              isTopRecommendation ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-600'
                            }`}>
                              {index + 1}
                            </div>

                            {/* Option Info */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h5 className="font-semibold text-gray-900">
                                  {language === 'ja' ? option.nameJa : option.name}
                                </h5>
                                {isTopRecommendation && (
                                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    {language === 'ja' ? '最適推薦' : 'Top Pick'}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {getCategoryIcon(option.category)}
                                  <span className="ml-1">{option.category}</span>
                                </Badge>
                                {isSelected && (
                                  <Badge className="bg-green-500 text-white border-0 text-xs">
                                    <Check className="w-3 h-3 mr-1" />
                                    {language === 'ja' ? '選択済み' : 'Selected'}
                                  </Badge>
                                )}
                              </div>

                              <p className="text-sm text-gray-600 mb-2">
                                {language === 'ja' ? option.descriptionJa : option.description}
                              </p>

                              {/* Score Display */}
                              <div className="flex items-center space-x-4 mb-3">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">Score:</span>
                                  <div className="flex items-center space-x-1">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                                        style={{ width: `${recommendation.score}%` }}
                                      />
                                    </div>
                                    <span className="text-sm font-semibold text-purple-600">
                                      {recommendation.score}%
                                    </span>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  x{option.priceMultiplier.toFixed(2)}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {language === 'ja' ? option.processingTimeJa : option.processingTime}
                                </Badge>
                              </div>

                              {/* AI Reasoning */}
                              <AnimatePresence>
                                {showReasoning && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-3"
                                  >
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Brain className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-900">
                                          {language === 'ja' ? 'AI 分析' : 'AI Analysis'}
                                        </span>
                                        <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                                          {recommendation.confidence.toFixed(0)}% {language === 'ja' ? '確信度' : 'confidence'}
                                        </Badge>
                                      </div>
                                      <ul className="space-y-1">
                                        {(language === 'ja' ? recommendation.reasoningJa : recommendation.reasoning).map((reason, idx) => (
                                          <li key={idx} className="text-xs text-blue-800 flex items-start space-x-1">
                                            <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                            <span>{reason}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Features */}
                              <div className="flex flex-wrap gap-1">
                                {(language === 'ja' ? option.featuresJa : option.features).slice(0, 3).map((feature, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                                {(language === 'ja' ? option.featuresJa : option.features).length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{(language === 'ja' ? option.featuresJa : option.features).length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              variant={isSelected ? "outline" : "primary"}
                              size="sm"
                              onClick={() => applyRecommendation(recommendation)}
                              className="whitespace-nowrap"
                            >
                              {isSelected ? (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  {language === 'ja' ? '選択済み' : 'Selected'}
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="w-4 h-4 mr-1" />
                                  {language === 'ja' ? '適用' : 'Apply'}
                                </>
                              )}
                            </Button>

                            {option.beforeImage && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRecommendation(recommendation)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </MotionWrapper>
      )}

      {/* Selected Recommendation Detail Modal */}
      <AnimatePresence>
        {selectedRecommendation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedRecommendation(null)}
          >
            <Card
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <CardContent className="p-0">
                <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {language === 'ja' ? '推薦詳細' : 'Recommendation Details'}
                      </h3>
                      <p className="text-gray-600">
                        {selectedRecommendation.optionId} - Score: {selectedRecommendation.score}%
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedRecommendation(null)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Option Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        {language === 'ja' ? 'オプション詳細' : 'Option Details'}
                      </h4>
                      {(() => {
                        const option = getOptionById(selectedRecommendation.optionId)
                        return option ? (
                          <div className="space-y-3">
                            <img
                              src={option.afterImage || option.thumbnail}
                              alt={language === 'ja' ? option.nameJa : option.name}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <div>
                              <h5 className="font-medium">{language === 'ja' ? option.nameJa : option.name}</h5>
                              <p className="text-sm text-gray-600">{language === 'ja' ? option.descriptionJa : option.description}</p>
                            </div>
                          </div>
                        ) : null
                      })()}
                    </div>

                    {/* AI Insights */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        {language === 'ja' ? 'AI インサイト' : 'AI Insights'}
                      </h4>
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-purple-900">
                              {language === 'ja' ? '推薦スコア' : 'Recommendation Score'}
                            </span>
                            <Badge className="bg-purple-600 text-white">
                              {selectedRecommendation.score}%
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {(language === 'ja' ? selectedRecommendation.reasoningJa : selectedRecommendation.reasoning).map((reason, idx) => (
                              <div key={idx} className="flex items-start space-x-2">
                                <ChevronRight className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}