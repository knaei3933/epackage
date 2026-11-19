'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { User, Building, Mail, Phone, Users, Briefcase } from 'lucide-react'

export default function BasicInfoStep() {
  const {
    register,
    formState: { errors },
    watch
  } = useFormContext()

  return (
    <div className="space-y-6">
      {/* Name and Company */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-text-primary">
            <User className="w-4 h-4 mr-2" />
            担当者名 <span className="text-error ml-1">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="山田 太郎"
          />
          {errors.name && (
            <p className="text-error text-sm">{String(errors.name.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-text-primary">
            <Building className="w-4 h-4 mr-2" />
            会社名 <span className="text-error ml-1">*</span>
          </label>
          <input
            {...register('company')}
            type="text"
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="株式会社サンプル"
          />
          {errors.company && (
            <p className="text-error text-sm">{String(errors.company.message)}</p>
          )}
        </div>
      </div>

      {/* Department and Position */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-text-primary">
            <Users className="w-4 h-4 mr-2" />
            部署名
          </label>
          <input
            {...register('department')}
            type="text"
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="製造部"
          />
          {errors.department && (
            <p className="text-error text-sm">{String(errors.department.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-text-primary">
            <Briefcase className="w-4 h-4 mr-2" />
            役職
          </label>
          <input
            {...register('position')}
            type="text"
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="部長"
          />
          {errors.position && (
            <p className="text-error text-sm">{String(errors.position.message)}</p>
          )}
        </div>
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-text-primary">
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
            <p className="text-error text-sm">{String(errors.email.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-text-primary">
            <Phone className="w-4 h-4 mr-2" />
            電話番号 <span className="text-error ml-1">*</span>
          </label>
          <input
            {...register('phone')}
            type="tel"
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
            placeholder="03-1234-5678"
          />
          {errors.phone && (
            <p className="text-error text-sm">{String(errors.phone.message)}</p>
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-brand-muted border border-brand-soft rounded-container p-4">
        <div className="flex items-start">
          <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-on-brand font-bold text-xs">i</span>
          </div>
          <div className="ml-3">
            <h4 className="font-semibold text-on-brand-muted mb-1">個人情報の取り扱いについて</h4>
            <p className="text-sm text-on-brand-muted">
              ご入力いただいた個人情報は、お問い合わせへの回答、および弊社サービスのご案内のみに使用いたします。
              第三者への提供はいたしません。詳しくは<a href="/privacy" className="underline hover:text-brand-pressed">プライバシーポリシー</a>をご覧ください。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}