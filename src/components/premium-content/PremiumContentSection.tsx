'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Download, X, CheckCircle, Mail, User, Building, Phone, Briefcase, FileText, Folder, BookOpen } from 'lucide-react'
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
          <div className="bg-bg-primary rounded-container max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-high">
            {/* Modal Header */}
            <div className="sticky top-0 bg-bg-primary border-b border-border-medium p-6 rounded-t-container">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-text-primary">
                    {content.title}
                  </h3>
                  <p className="text-text-secondary mt-1">
                    無料でダウンロード（要メールアドレス登録）
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  aria-label="閉じる" className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {submitStatus === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-success-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-success" />
                  </div>
                  <h4 className="text-2xl font-bold text-text-primary mb-4">
                    ありがとうございます！
                  </h4>
                  <p className="text-text-secondary mb-2">
                    ダウンロード情報を登録しました。
                  </p>
                  <p className="text-text-muted">
                    まもなくダウンロードが開始されます...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Error Message */}
                  {submitStatus === 'error' && (
                    <div className="p-4 bg-error-muted border border-error rounded-container">
                      <p className="text-on-error-muted">
                        送信エラーが発生しました: {errorMessage}
                      </p>
                    </div>
                  )}

                  {/* Content Info */}
                  <div className="bg-brand-muted border border-brand-soft rounded-container p-4">
                    <h4 className="font-semibold text-on-brand-muted mb-2">ダウンロード内容</h4>
                    <div className="text-sm text-on-brand-muted space-y-1">
                      <p className="flex items-center gap-2"><FileText className="h-4 w-4 shrink-0" aria-hidden="true" />{content.title}</p>
                      <p className="flex items-center gap-2"><Folder className="h-4 w-4 shrink-0" aria-hidden="true" />形式: {content.format} | サイズ: {content.fileSize}</p>
                      <p className="flex items-center gap-2"><BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />ページ数: {content.pageCount}ページ</p>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div>
                    <h4 className="font-semibold text-text-primary mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-text-secondary" />
                      お客様情報
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center text-sm font-medium text-text-primary mb-2">
                          お名前 <span className="text-error ml-1">*</span>
                        </label>
                        <input
                          {...register('name')}
                          type="text"
                          className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                          placeholder="山田 太郎"
                        />
                        {errors.name && (
                          <p className="text-error text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-text-primary mb-2">
                          <Building className="w-4 h-4 mr-2" />
                          会社名
                        </label>
                        <input
                          {...register('company')}
                          type="text"
                          className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                          placeholder="株式会社サンプル"
                        />
                        {errors.company && (
                          <p className="text-error text-sm mt-1">{errors.company.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="flex items-center text-sm font-medium text-text-primary mb-2">
                          <Mail className="w-4 h-4 mr-2" />
                          メールアドレス <span className="text-error ml-1">*</span>
                        </label>
                        <input
                          {...register('email')}
                          type="email"
                          className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                          placeholder="example@company.com"
                        />
                        {errors.email && (
                          <p className="text-error text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-text-primary mb-2">
                          <Phone className="w-4 h-4 mr-2" />
                          電話番号
                        </label>
                        <input
                          {...register('phone')}
                          type="tel"
                          className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                          placeholder="03-1234-5678"
                        />
                        {errors.phone && (
                          <p className="text-error text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h4 className="font-semibold text-text-primary mb-4 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-text-secondary" />
                      職業情報
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-text-primary mb-2 block">
                          業種 <span className="text-error ml-1">*</span>
                        </label>
                        <select
                          {...register('industry')}
                          className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                        >
                          <option value="">選択してください</option>
                          {industries.map(industry => (
                            <option key={industry.value} value={industry.value}>
                              {industry.label}
                            </option>
                          ))}
                        </select>
                        {errors.industry && (
                          <p className="text-error text-sm mt-1">{errors.industry.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-text-primary mb-2 block">
                          役職 <span className="text-error ml-1">*</span>
                        </label>
                        <select
                          {...register('role')}
                          className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                        >
                          <option value="">選択してください</option>
                          {roles.map(role => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        {errors.role && (
                          <p className="text-error text-sm mt-1">{errors.role.message}</p>
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
                        className="mt-1 w-4 h-4 accent-brand border-border-strong rounded focus-visible:ring-2 focus-visible:ring-brand"
                      />
                      <label htmlFor="consent" className="ml-3 text-sm text-text-primary">
                        <span className="text-error">*</span> 個人情報の取り扱いに同意します
                        <div className="text-sm text-text-muted mt-1">
                          お預かりした情報は、コンテンツ提供および弊社サービスのご案内にのみ使用いたします。
                        </div>
                      </label>
                    </div>
                    {errors.consent && (
                      <p className="text-error text-sm">{errors.consent.message}</p>
                    )}

                    <div className="flex items-start">
                      <input
                        {...register('newsletter')}
                        type="checkbox"
                        id="newsletter"
                        className="mt-1 w-4 h-4 accent-brand border-border-strong rounded focus-visible:ring-2 focus-visible:ring-brand"
                      />
                      <label htmlFor="newsletter" className="ml-3 text-sm text-text-primary">
                        最新情報やお得な情報をメールで受け取る
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {isSubmitting ? '送信中...' : '無料でダウンロードする'}
                    </Button>
                  </div>

                  <div className="text-center text-sm text-text-muted">
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