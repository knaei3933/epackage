'use client'

import React, { useState, useCallback } from 'react'
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User, Building, Mail, Phone, Package, Calculator, Settings,
  MessageSquare, ChevronLeft, ChevronRight, CheckCircle, Upload,
  FileText, TrendingUp, AlertCircle, Info
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { detailedInquirySchema, formSteps, calculateLeadScore, DetailedInquiryFormData } from '@/types/inquiry'

// Import step components
import BasicInfoStep from './steps/BasicInfoStep'
import CompanyInfoStep from './steps/CompanyInfoStep'
import ProjectRequirementsStep from './steps/ProjectRequirementsStep'
import TechnicalRequirementsStep from './steps/TechnicalRequirementsStep'
import AdditionalInfoStep from './steps/AdditionalInfoStep'

interface DetailedInquiryFormProps {
  onSubmit?: (data: DetailedInquiryFormData, leadScore: number) => void
}

export default function DetailedInquiryForm({ onSubmit }: DetailedInquiryFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [leadScore, setLeadScore] = useState(0)

  const methods = useForm<DetailedInquiryFormData>({
    resolver: zodResolver(detailedInquirySchema),
    mode: 'onChange'
  })

  const { trigger, getValues, formState: { isValid, errors, touchedFields } } = methods

  // Calculate lead score whenever form data changes
  React.useEffect(() => {
    const formData = getValues()
    const score = calculateLeadScore(formData)
    setLeadScore(score)
  }, [getValues])

  const validateCurrentStep = useCallback(async () => {
    const currentStepData = formSteps[currentStep]
    const fieldsToValidate = currentStepData.fields as any[]

    // Create a partial schema for current step validation
    const stepSchema = currentStepData.schema

    const result = await trigger(fieldsToValidate, { shouldFocus: true })
    return result
  }, [currentStep, trigger])

  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, formSteps.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async (data: DetailedInquiryFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const calculatedScore = calculateLeadScore(data)

      const response = await fetch('/api/inquiry/detailed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          leadScore: calculatedScore
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '送信に失敗しました')
      }

      setSubmitStatus('success')

      if (onSubmit) {
        onSubmit(data, calculatedScore)
      }

      // Redirect to thank you page after 3 seconds
      setTimeout(() => {
        window.location.href = '/inquiry/thank-you'
      }, 3000)

    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : '予期せぬエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepIcon = (stepIndex: number) => {
    const icons = [User, Building, Package, Settings, MessageSquare]
    const Icon = icons[stepIndex] || User
    return <Icon className="w-5 h-5" />
  }

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'active'
    return 'pending'
  }

  const isStepComplete = (stepIndex: number) => {
    const stepFields = formSteps[stepIndex].fields as string[]
    return stepFields.every(field => {
      const value = methods.getValues(field as any)
      return value !== undefined && value !== '' &&
             (!Array.isArray(value) || value.length > 0)
    })
  }

  if (submitStatus === 'success') {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card variant="success" className="p-12 text-center">
          <div className="w-24 h-24 bg-bg-primary rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-on-success-muted mb-6">
            詳細お問い合わせありがとうございます
          </h2>
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-bg-primary rounded-container p-6 mb-6 border border-border-medium">
              <h3 className="text-xl font-bold text-text-primary mb-4">リードスコア</h3>
              <div className="text-3xl font-bold text-brand mb-2">{leadScore}/100点</div>
              <p className="text-text-secondary">
                {leadScore >= 70 ? '高品質リード' : leadScore >= 40 ? '標準リード' : '低品質リード'}
              </p>
            </div>
            <p className="text-on-success-muted text-lg mb-6">
              専門スタッフが24時間以内にご連絡いたします。<br />
              詳細なヒアリングと最適なソリューションをご提案します。
            </p>
            <div className="text-left bg-bg-primary rounded-container p-6 border border-border-medium">
              <h4 className="font-bold text-text-primary mb-3">次のステップ</h4>
              <ul className="text-text-secondary space-y-2">
                <li>✓ 24時間以内に専門担当者よりご連絡</li>
                <li>✓ 詳細なヒアリングと要件確認</li>
                <li>✓ 無料サンプルのご提案</li>
                <li>✓ 詳細お見積もり作成</li>
              </ul>
            </div>
          </div>
          <p className="text-on-success-muted">
            まもなくリダイレクトします...
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <h2 className="font-heading text-2xl md:text-[2rem] leading-[1.4] text-text-primary mb-4 text-center [word-break:keep-all] [overflow-wrap:anywhere]">
          詳細お問い合わせフォーム
        </h2>
        <p className="text-text-secondary text-center mb-8">
          5ステップで最適なパウチソリューションをご提案します
        </p>

        {/* Step Progress */}
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-1 bg-bg-subtle -z-10">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${((currentStep + 1) / formSteps.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between">
            {formSteps.map((step, index) => {
              const status = getStepStatus(index)
              const isComplete = isStepComplete(index)

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <button
                    onClick={() => setCurrentStep(index)}
                    className={`w-10 h-10 max-sm:w-11 max-sm:h-11 rounded-full flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                      status === 'active'
                        ? 'bg-brand text-on-brand ring-2 ring-brand ring-offset-2'
                        : status === 'completed' || isComplete
                        ? 'bg-brand text-on-brand'
                        : 'bg-bg-subtle text-text-secondary hover:bg-bg-muted border border-border-strong'
                    }`}
                  >
                    {status === 'completed' || isComplete ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      getStepIcon(index)
                    )}
                  </button>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium text-text-primary">{step.title}</div>
                    <div className="text-[13px] text-text-muted">ステップ {index + 1}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lead Score Indicator */}
      <div className="mb-6">
        <Card variant="brixa" className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-brand mr-2" />
              <span className="font-semibold text-text-primary">リードスコア</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-brand mr-2">{leadScore}</span>
              <span className="text-text-secondary">/100点</span>
            </div>
          </div>
          {leadScore >= 70 && (
            <div className="mt-2 text-sm text-text-primary">
              高品質リードです！優先的なご対応を予定しております。
            </div>
          )}
        </Card>
      </div>

      {/* Form Content */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Card className="p-8">
            {/* Error Message */}
            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-error-muted border border-error rounded-container">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-error mr-2" />
                  <p className="text-on-error-muted">送信エラーが発生しました: {errorMessage}</p>
                </div>
              </div>
            )}

            {/* Current Step */}
            <div className="mb-8">
              <div className="flex items-center mb-4 text-brand">
                {getStepIcon(currentStep)}
                <h2 className="text-xl md:text-2xl font-bold text-text-primary ml-3">
                  {formSteps[currentStep].title}
                </h2>
              </div>
              <p className="text-text-secondary">
                {formSteps[currentStep].description}
              </p>
              {currentStep === 0 && (
                <div className="mt-4 p-4 bg-warning-muted border border-warning rounded-container">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-warning mr-2 mt-0.5" />
                    <div className="text-sm text-on-warning-muted">
                      <strong>所要時間:</strong> 約3分 |
                      <strong> 必須項目:</strong> 姓、メール、電話番号
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step Components */}
            <div className="min-h-[400px]">
              {currentStep === 0 && <BasicInfoStep />}
              {currentStep === 1 && <CompanyInfoStep />}
              {currentStep === 2 && <ProjectRequirementsStep />}
              {currentStep === 3 && <TechnicalRequirementsStep />}
              {currentStep === 4 && <AdditionalInfoStep />}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-border-medium">
              <Button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>

              <div className="text-sm text-text-muted">
                ステップ {currentStep + 1} / {formSteps.length}
              </div>

              {currentStep < formSteps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center"
                >
                  次へ
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="flex items-center px-8"
                  size="lg"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  {isSubmitting ? '送信中...' : 'お問い合わせを送信'}
                </Button>
              )}
            </div>
          </Card>
        </form>
      </FormProvider>

      {/* Form Help */}
      <div className="mt-8 text-center text-sm text-text-muted">
        <p>ご不明な点がございましたら、お気軽にご連絡ください。</p>
        <p className="mt-1">電話: 050-3613-9673 | メール: info@package-lab.com</p>
      </div>
    </div>
  )
}