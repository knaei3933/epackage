'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Download, X, CheckCircle, Mail, User, Building, Phone, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { premiumContentSchema, PremiumContentFormData, PremiumContent } from '@/types/premium-content'

interface PremiumContentSectionProps {
  content: PremiumContent
  compact?: boolean
}

export default function PremiumContentSection({ content, compact = false }: PremiumContentSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<PremiumContentFormData>({
    resolver: zodResolver(premiumContentSchema),
    defaultValues: {
      contentId: content.id,
      newsletter: true
    }
  })

  const industries = [
    { value: 'food', label: '食品' },
    { value: 'cosmetics', label: '化粧品' },
    { value: 'medical', label: '医療・医薬品' },
    { value: 'retail', label: '小売・流通' },
    { value: 'electronics', label: '電子機器' },
    { value: 'agriculture', label: '農業' },
    { value: 'chemical', label: '化学工業' },
    { value: 'automotive', label: '自動車' },
    { value: 'other', label: 'その他' }
  ]

  const roles = [
    { value: 'president', label: '社長' },
    { value: 'manager', label: '部長・マネージャー' },
    { value: 'engineer', label: '技術担当' },
    { value: 'purchasing', label: '購買担当' },
    { value: 'marketing', label: 'マーケティング担当' },
    { value: 'other', label: 'その他' }
  ]

  const onSubmit = async (data: PremiumContentFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/premium-content/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '送信に失敗しました')
      }

      setSubmitStatus('success')

      // Trigger download after successful submission
      setTimeout(() => {
        window.location.href = result.downloadUrl
        setIsModalOpen(false)
        reset()
        setSubmitStatus('idle')
      }, 2000)

    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : '予期せぬエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const DownloadButton = ({ className = "" }: { className?: string }) => (
    <Button
      onClick={() => setIsModalOpen(true)}
      className={`${compact ? 'w-full' : ''} ${className}`}
      variant={compact ? 'outline' : 'primary'}
      size={compact ? 'sm' : 'md'}
    >
      <Download className="w-4 h-4 mr-2" />
      {compact ? 'DL' : '無料でダウンロード'}
    </Button>
  )

  if (compact) {
    return <DownloadButton />
  }

  return (
    <>
      <DownloadButton />

      {/* Download Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {content.title}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    無料でダウンロード（要メールアドレス登録）
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {submitStatus === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">
                    ありがとうございます！
                  </h4>
                  <p className="text-gray-600 mb-2">
                    ダウンロード情報を登録しました。
                  </p>
                  <p className="text-gray-500">
                    まもなくダウンロードが開始されます...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Error Message */}
                  {submitStatus === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800">
                        送信エラーが発生しました: {errorMessage}
                      </p>
                    </div>
                  )}

                  {/* Content Info */}
                  <div className="bg-navy-50 border border-navy-600 rounded-lg p-4">
                    <h4 className="font-semibold text-navy-600 mb-2">ダウンロード内容</h4>
                    <div className="text-sm text-navy-600 space-y-1">
                      <p>📄 {content.title}</p>
                      <p>📁 形式: {content.format} | サイズ: {content.fileSize}</p>
                      <p>📖 ページ数: {content.pageCount}ページ</p>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-gray-600" />
                      お客様情報
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          お名前 <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          {...register('name')}
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                          placeholder="山田 太郎"
                        />
                        {errors.name && (
                          <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <Building className="w-4 h-4 mr-2" />
                          会社名
                        </label>
                        <input
                          {...register('company')}
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                          placeholder="株式会社サンプル"
                        />
                        {errors.company && (
                          <p className="text-red-600 text-sm mt-1">{errors.company.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <Mail className="w-4 h-4 mr-2" />
                          メールアドレス <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          {...register('email')}
                          type="email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                          placeholder="example@company.com"
                        />
                        {errors.email && (
                          <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <Phone className="w-4 h-4 mr-2" />
                          電話番号
                        </label>
                        <input
                          {...register('phone')}
                          type="tel"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                          placeholder="03-1234-5678"
                        />
                        {errors.phone && (
                          <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-gray-600" />
                      職業情報
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          業種 <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          {...register('industry')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                        >
                          <option value="">選択してください</option>
                          {industries.map(industry => (
                            <option key={industry.value} value={industry.value}>
                              {industry.label}
                            </option>
                          ))}
                        </select>
                        {errors.industry && (
                          <p className="text-red-600 text-sm mt-1">{errors.industry.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          役職 <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          {...register('role')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
                        >
                          <option value="">選択してください</option>
                          {roles.map(role => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        {errors.role && (
                          <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Privacy and Newsletter */}
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <input
                        {...register('consent')}
                        type="checkbox"
                        id="consent"
                        className="mt-1 w-4 h-4 text-navy-700 border-gray-300 rounded focus:ring-navy-600"
                      />
                      <label htmlFor="consent" className="ml-3 text-sm text-gray-700">
                        <span className="text-red-500">*</span> 個人情報の取り扱いに同意します
                        <div className="text-xs text-gray-500 mt-1">
                          お預かりした情報は、コンテンツ提供および弊社サービスのご案内にのみ使用いたします。
                        </div>
                      </label>
                    </div>
                    {errors.consent && (
                      <p className="text-red-600 text-sm">{errors.consent.message}</p>
                    )}

                    <div className="flex items-start">
                      <input
                        {...register('newsletter')}
                        type="checkbox"
                        id="newsletter"
                        className="mt-1 w-4 h-4 text-navy-700 border-gray-300 rounded focus:ring-navy-600"
                      />
                      <label htmlFor="newsletter" className="ml-3 text-sm text-gray-700">
                        最新情報やお得な情報をメールで受け取る
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 text-lg font-semibold"
                      size="lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {isSubmitting ? '送信中...' : '無料でダウンロードする'}
                    </Button>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    <p>ダウンロード後、自動的に確認メールをお送りします</p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}