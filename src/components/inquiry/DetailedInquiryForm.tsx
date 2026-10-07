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
        <Card className="p-12 text-center bg-green-50 border-green-200">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-4xl font-bold text-green-800 mb-6">
            詳細お問い合わせありがとうございます
          </h2>
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 リードスコア</h3>
              <div className="text-3xl font-bold text-navy-700 mb-2">{leadScore}/100点</div>
              <p className="text-gray-600">
                {leadScore >= 70 ? '高品質リード' : leadScore >= 40 ? '標準リード' : '低品質リード'}
              </p>
            </div>
            <p className="text-green-700 text-lg mb-6">
              専門スタッフが24時間以内にご連絡いたします。<br />
              詳細なヒアリングと最適なソリューションをご提案します。
            </p>
            <div className="text-left bg-white rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">次のステップ</h4>
              <ul className="text-gray-600 space-y-2">
                <li>✓ 24時間以内に専門担当者よりご連絡</li>
                <li>✓ 詳細なヒアリングと要件確認</li>
                <li>✓ 無料サンプルのご提案</li>
                <li>✓ 詳細お見積もり作成</li>
              </ul>
            </div>
          </div>
          <p className="text-green-600">
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
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
          詳細お問い合わせフォーム
        </h1>
        <p className="text-xl text-gray-600 text-center mb-8">
          5ステップで最適なパウチソリューションをご提案します
        </p>

        {/* Step Progress */}
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
            <div
              className="h-full bg-navy-700 transition-all duration-300"
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      status === 'active'
                        ? 'bg-navy-700 text-white ring-4 ring-navy-600'
                        : status === 'completed' || isComplete
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {status === 'completed' || isComplete ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      getStepIcon(index)
                    )}
                  </button>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">ステップ {index + 1}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lead Score Indicator */}
      <div className="mb-6">
        <Card className="p-4 bg-navy-50 border-navy-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-navy-700 mr-2" />
              <span className="font-semibold text-navy-600">リードスコア</span>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-navy-700 mr-2">{leadScore}</span>
              <span className="text-navy-600">/100点</span>
            </div>
          </div>
          {leadScore >= 70 && (
            <div className="mt-2 text-sm text-navy-600">
              🎯 高品質リードです！優先的なご対応を予定しております。
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
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-800">送信エラーが発生しました: {errorMessage}</p>
                </div>
              </div>
            )}

            {/* Current Step */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                {getStepIcon(currentStep)}
                <h2 className="text-2xl font-bold text-gray-900 ml-3">
                  {formSteps[currentStep].title}
                </h2>
              </div>
              <p className="text-gray-600">
                {formSteps[currentStep].description}
              </p>
              {currentStep === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-800">
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
            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
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

              <div className="text-sm text-gray-500">
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
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>ご不明な点がございましたら、お気軽にご連絡ください。</p>
        <p className="mt-1">電話: 050-3613-9673 | メール: info@package-lab.com</p>
      </div>
    </div>
  )
}