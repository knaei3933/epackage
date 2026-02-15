'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Settings,
  Eye,
  Zap,
  Sparkles,
  Package,
  ShoppingCart,
  Clock,
  TrendingUp,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Share2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ModernPostProcessingSelector } from '../selectors/ModernPostProcessingSelector'
import { InteractiveProductPreview } from '../previews/InteractiveProductPreview'
import { SmartRecommendations } from './SmartRecommendations'
import {
  processingOptionsConfig,
  calculateProcessingImpact,
  type ProcessingOptionConfig
} from './processingConfig'

interface RedesignedPostProcessingWorkflowProps {
  selectedProductType: string
  selectedOptions: string[]
  onOptionsChange: (options: string[]) => void
  onPriceUpdate: (multiplier: number) => void
  onComplete?: (configuration: any) => void
  language?: 'en' | 'ja'
  budget?: number
  timeline?: 'express' | 'standard' | 'economy'
  useCase?: 'retail' | 'industrial' | 'food' | 'cosmetics' | 'medical'
  variant?: 'full' | 'compact' | 'minimal'
}

type WorkflowStep = 'welcome' | 'selection' | 'preview' | 'review' | 'complete'

interface StepConfig {
  id: WorkflowStep
  title: string
  titleJa: string
  description: string
  descriptionJa: string
  icon: React.ReactNode
  estimatedTime: string
  estimatedTimeJa: string
  required: boolean
}

const workflowSteps: StepConfig[] = [
  {
    id: 'welcome',
    title: 'Get Started',
    titleJa: '開始',
    description: 'Learn about post-processing options and their benefits',
    descriptionJa: '後加工オプションとその利点について学ぶ',
    icon: <Sparkles className="w-5 h-5" />,
    estimatedTime: '30 seconds',
    estimatedTimeJa: '30秒',
    required: false
  },
  {
    id: 'selection',
    title: 'Choose Options',
    titleJa: 'オプション選択',
    description: 'Select post-processing options based on your needs',
    descriptionJa: 'ニーズに基づいて後加工オプションを選択',
    icon: <Settings className="w-5 h-5" />,
    estimatedTime: '2-3 minutes',
    estimatedTimeJa: '2-3分',
    required: true
  },
  {
    id: 'preview',
    title: 'Preview & Customize',
    titleJa: 'プレビューとカスタマイズ',
    description: 'See how your product looks with selected options',
    descriptionJa: '選択したオプションでの製品見た目を確認',
    icon: <Eye className="w-5 h-5" />,
    estimatedTime: '1 minute',
    estimatedTimeJa: '1分',
    required: true
  },
  {
    id: 'review',
    title: 'Review Configuration',
    titleJa: '設定確認',
    description: 'Review your selections and finalize configuration',
    descriptionJa: '選択内容を確認し設定を最終化',
    icon: <CheckCircle2 className="w-5 h-5" />,
    estimatedTime: '1 minute',
    estimatedTimeJa: '1分',
    required: true
  },
  {
    id: 'complete',
    title: 'Complete',
    titleJa: '完了',
    description: 'Configuration saved and ready for production',
    descriptionJa: '設定が保存され、生産準備完了',
    icon: <Package className="w-5 h-5" />,
    estimatedTime: 'Complete',
    estimatedTimeJa: '完了',
    required: true
  }
]

export function RedesignedPostProcessingWorkflow({
  selectedProductType,
  selectedOptions,
  onOptionsChange,
  onPriceUpdate,
  onComplete,
  language = 'ja',
  budget,
  timeline = 'standard',
  useCase = 'retail',
  variant = 'full'
}: RedesignedPostProcessingWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('welcome')
  const [completedSteps, setCompletedSteps] = useState<WorkflowStep[]>([])
  const [showTips, setShowTips] = useState(true)
  const [configurationSummary, setConfigurationSummary] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Calculate processing impact
  const processingImpact = useMemo(() => {
    return calculateProcessingImpact(selectedOptions)
  }, [selectedOptions])

  // Update price when selection changes
  useEffect(() => {
    onPriceUpdate(processingImpact.multiplier)
  }, [processingImpact.multiplier, onPriceUpdate])

  // Get current step index
  const currentStepIndex = workflowSteps.findIndex(step => step.id === currentStep)

  // Check if step can be advanced
  const canAdvanceStep = useCallback(() => {
    switch (currentStep) {
      case 'welcome':
        return true // Optional step
      case 'selection':
        return selectedOptions.length > 0
      case 'preview':
        return true // Always can advance from preview
      case 'review':
        return selectedOptions.length > 0
      default:
        return false
    }
  }, [currentStep, selectedOptions])

  // Advance to next step
  const advanceStep = useCallback(() => {
    if (currentStepIndex < workflowSteps.length - 1 && canAdvanceStep()) {
      const nextStep = workflowSteps[currentStepIndex + 1].id
      setCompletedSteps(prev => [...prev, currentStep])
      setCurrentStep(nextStep)
    }
  }, [currentStepIndex, canAdvanceStep])

  // Go back to previous step
  const goBackStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const previousStep = workflowSteps[currentStepIndex - 1].id
      setCurrentStep(previousStep)
      setCompletedSteps(prev => prev.filter(step => step !== previousStep))
    }
  }, [currentStepIndex])

  // Jump to specific step
  const jumpToStep = useCallback((step: WorkflowStep) => {
    const stepIndex = workflowSteps.findIndex(s => s.id === step)
    const isStepAccessible = stepIndex <= currentStepIndex || completedSteps.includes(workflowSteps[currentStepIndex - 1]?.id)

    if (isStepAccessible) {
      setCurrentStep(step)
    }
  }, [currentStepIndex, completedSteps])

  // Complete workflow
  const completeWorkflow = useCallback(async () => {
    setIsProcessing(true)

    // Generate configuration summary
    const summary = {
      productType: selectedProductType,
      selectedOptions: selectedOptions.map(id =>
        processingOptionsConfig.find(opt => opt.id === id)
      ).filter(Boolean),
      processingImpact,
      timeline: new Date(Date.now() + processingImpact.processingTimeDays * 24 * 60 * 60 * 1000).toISOString(),
      estimatedCost: processingImpact.multiplier,
      budget,
      useCase
    }

    setConfigurationSummary(summary)

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Move to complete step
    setCompletedSteps(prev => [...prev, currentStep])
    setCurrentStep('complete')
    setIsProcessing(false)

    // Call completion handler
    if (onComplete) {
      onComplete(summary)
    }
  }, [selectedOptions, selectedProductType, processingImpact, budget, useCase, currentStep, onComplete])

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    setCurrentStep('welcome')
    setCompletedSteps([])
    setConfigurationSummary(null)
  }, [])

  // Get step progress
  const getStepProgress = useCallback(() => {
    const totalSteps = workflowSteps.filter(step => step.required).length
    const completedRequiredSteps = workflowSteps.filter(step =>
      step.required && (completedSteps.includes(step.id) || step.id === currentStep)
    ).length
    return (completedRequiredSteps / totalSteps) * 100
  }, [completedSteps, currentStep])

  // Render step navigation
  const renderStepNavigation = () => (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {language === 'ja' ? '進行状況' : 'Progress'}
          </span>
          <span className="font-medium text-gray-900">
            {Math.round(getStepProgress())}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brixa-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getStepProgress()}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {workflowSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = step.id === currentStep
          const isAccessible = index <= currentStepIndex

          return (
            <button
              key={step.id}
              onClick={() => jumpToStep(step.id)}
              disabled={!isAccessible && !isCompleted}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                isCurrent
                  ? 'bg-green-100 text-green-700'
                  : isCompleted
                  ? 'bg-gray-100 text-gray-700'
                  : isAccessible
                  ? 'text-gray-500 hover:bg-gray-50'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                isCurrent
                  ? 'border-green-500 bg-green-500 text-white'
                  : isCompleted
                  ? 'border-gray-400 bg-gray-400 text-white'
                  : isAccessible
                  ? 'border-gray-300 bg-white'
                  : 'border-gray-200 bg-gray-50'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  step.icon
                )}
              </div>
              <span className="text-xs font-medium text-center max-w-20">
                {language === 'ja' ? step.titleJa : step.title}
              </span>
              {step.required && (
                <span className="text-xs text-red-500">*</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goBackStep}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'ja' ? '戻る' : 'Back'}
        </Button>

        <div className="text-sm text-gray-500">
          {workflowSteps[currentStepIndex]?.[
            language === 'ja' ? 'estimatedTimeJa' : 'estimatedTime'
          ]}
        </div>

        <Button
          onClick={currentStep === 'review' ? completeWorkflow : advanceStep}
          disabled={!canAdvanceStep() || isProcessing}
          className="flex items-center gap-2"
        >
          {isProcessing ? (
            <RotateCw className="w-4 h-4 animate-spin" />
          ) : currentStep === 'review' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          {isProcessing
            ? language === 'ja' ? '処理中...' : 'Processing...'
            : language === 'ja' ? '次へ' : 'Next'}
        </Button>
      </div>
    </div>
  )

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'ja'
                  ? '後加工オプションを選択しましょう'
                  : 'Let\'s Choose Post-Processing Options'}
              </h2>

              <p className="text-gray-600 max-w-2xl mx-auto">
                {language === 'ja'
                  ? 'このウィザードでは、製品に最適な後加工オプションを簡単に選択できます。各オプションの特徴と価格影響を確認しながら、理想の構成を見つけましょう。'
                  : 'This wizard will help you choose the perfect post-processing options for your product. See features and pricing impact as you build your ideal configuration.'}
              </p>
            </div>

            {/* Quick Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-blue-900">
                      {language === 'ja' ? 'クイックヒント' : 'Quick Tips'}
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• {language === 'ja' ? 'カテゴリーごとにオプションを比較できます' : 'Compare options by category'}</li>
                      <li>• {language === 'ja' ? 'リアルタイムで価格影響を確認' : 'See price impact in real-time'}</li>
                      <li>• {language === 'ja' ? 'インタラクティブなプレビューで最終仕様を確認' : 'Interactive preview shows final result'}</li>
                      <li>• {language === 'ja' ? 'いつでも設定を調整可能' : 'Adjust settings anytime'}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Type Display */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {language === 'ja' ? '製品タイプ' : 'Product Type'}
                    </h3>
                    <p className="text-gray-600 capitalize">{selectedProductType}</p>
                  </div>
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            {/* Start Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={advanceStep}
                className="flex items-center gap-2 px-8"
              >
                {language === 'ja' ? '開始する' : 'Get Started'}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )

      case 'selection':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Smart Recommendations */}
            <SmartRecommendations
              selectedProductType={selectedProductType}
              selectedOptions={selectedOptions}
              onOptionsChange={onOptionsChange}
              language={language}
              budget={budget}
              timeline={timeline}
              useCase={useCase}
            />

            {/* Main Selection Component */}
            <ModernPostProcessingSelector
              selectedProductType={selectedProductType}
              selectedOptions={selectedOptions}
              onOptionsChange={onOptionsChange}
              onPriceUpdate={onPriceUpdate}
              language={language}
            />
          </motion.div>
        )

      case 'preview':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {language === 'ja' ? 'インタラクティブプレビュー' : 'Interactive Preview'}
              </h2>
              <p className="text-gray-600">
                {language === 'ja'
                  ? '選択したオプションでの製品の見た目を確認できます'
                  : 'See how your product looks with selected options'}
              </p>
            </div>

            <InteractiveProductPreview
              selectedProductType={selectedProductType}
              selectedOptions={selectedOptions}
              onOptionToggle={handleOptionToggle}
              language={language}
            />
          </motion.div>
        )

      case 'review':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {language === 'ja' ? '設定の確認' : 'Review Configuration'}
              </h2>
              <p className="text-gray-600">
                {language === 'ja'
                  ? '最終設定を確認して完了しましょう'
                  : 'Review your final configuration before completing'}
              </p>
            </div>

            {/* Configuration Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {language === 'ja' ? '構成サマリー' : 'Configuration Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      {language === 'ja' ? '製品情報' : 'Product Information'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {language === 'ja' ? '製品タイプ' : 'Product Type'}
                        </span>
                        <span className="font-medium">{selectedProductType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {language === 'ja' ? '用途' : 'Use Case'}
                        </span>
                        <span className="font-medium">{useCase}</span>
                      </div>
                      {budget && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {language === 'ja' ? '予算' : 'Budget'}
                          </span>
                          <span className="font-medium">${budget.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Processing Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      {language === 'ja' ? '後加工情報' : 'Processing Information'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {language === 'ja' ? '選択オプション数' : 'Selected Options'}
                        </span>
                        <span className="font-medium">{selectedOptions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {language === 'ja' ? '価格乗数' : 'Price Multiplier'}
                        </span>
                        <span className="font-medium">x{processingImpact.multiplier.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {language === 'ja' ? '追加生産時間' : 'Additional Time'}
                        </span>
                        <span className="font-medium">{processingImpact.processingTimeJa}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {language === 'ja' ? '最小数量' : 'Minimum Quantity'}
                        </span>
                        <span className="font-medium">
                          {processingImpact.minimumQuantity.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Options List */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    {language === 'ja' ? '選択されたオプション' : 'Selected Options'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedOptions.map(optionId => {
                      const option = processingOptionsConfig.find(opt => opt.id === optionId)
                      return option ? (
                        <div
                          key={option.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={option.thumbnail || option.afterImage}
                              alt={language === 'ja' ? option.nameJa : option.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium text-sm">
                                {language === 'ja' ? option.nameJa : option.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                x{option.priceMultiplier.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOptionsChange(
                              selectedOptions.filter(id => id !== optionId)
                            )}
                            className="text-red-500 hover:text-red-600"
                          >
                            ×
                          </Button>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>

                {/* Estimated Timeline */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <div>
                        <h4 className="font-semibold text-yellow-900">
                          {language === 'ja' ? '納期目安' : 'Estimated Delivery'}
                        </h4>
                        <p className="text-sm text-yellow-800">
                          {language === 'ja'
                            ? `標準生産時間 + ${processingImpact.processingTimeJa}`
                            : `Standard production time + ${processingImpact.processingTime}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 'complete':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'ja' ? '設定完了' : 'Configuration Complete!'}
              </h2>
              <p className="text-gray-600">
                {language === 'ja'
                  ? '後加工オプションの設定が完了しました。生産準備が整いました。'
                  : 'Your post-processing configuration is complete and ready for production.'}
              </p>
            </div>

            {/* Success Details */}
            {configurationSummary && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-green-700">
                        {selectedOptions.length}
                      </div>
                      <p className="text-sm text-green-600">
                        {language === 'ja' ? 'オプション選択済み' : 'Options Selected'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-green-700">
                        x{processingImpact.multiplier.toFixed(2)}
                      </div>
                      <p className="text-sm text-green-600">
                        {language === 'ja' ? '価格乗数' : 'Price Multiplier'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-green-700">
                        {processingImpact.minimumQuantity.toLocaleString()}
                      </div>
                      <p className="text-sm text-green-600">
                        {language === 'ja' ? '最小数量' : 'Minimum Quantity'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={resetWorkflow}
                className="flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                {language === 'ja' ? '新しい設定' : 'New Configuration'}
              </Button>
              <Button
                onClick={() => {
                  navigator.share?.({
                    title: language === 'ja' ? '製品設定' : 'Product Configuration',
                    text: JSON.stringify(configurationSummary, null, 2)
                  })
                }}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                {language === 'ja' ? '設定を共有' : 'Share Configuration'}
              </Button>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  // Create wrapper for InteractiveProductPreview
  const handleOptionToggle = useCallback((optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      onOptionsChange(selectedOptions.filter(id => id !== optionId))
    } else {
      onOptionsChange([...selectedOptions, optionId])
    }
  }, [selectedOptions, onOptionsChange])

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Step Navigation */}
      {renderStepNavigation()}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Floating Help Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowTips(!showTips)}
        className="fixed bottom-4 right-4 rounded-full p-3 shadow-lg"
      >
        <Info className="w-5 h-5" />
      </Button>
    </div>
  )
}