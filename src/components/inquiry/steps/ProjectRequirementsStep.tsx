'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Package, TrendingUp, Calendar, DollarSign, Box } from 'lucide-react'
import { pouchTypeOptions } from '@/types/inquiry'

export default function ProjectRequirementsStep() {
  const {
    register,
    formState: { errors },
    watch,
    setValue
  } = useFormContext()

  const selectedPouchTypes = watch('pouchTypes') || []

  const handlePouchTypeChange = (value: string) => {
    const currentTypes = selectedPouchTypes as string[] || []
    if (currentTypes.includes(value)) {
      setValue('pouchTypes', currentTypes.filter(type => type !== value))
    } else {
      setValue('pouchTypes', [...currentTypes, value])
    }
  }

  return (
    <div className="space-y-6">
      {/* Pouch Types Selection */}
      <div className="space-y-4">
        <label className="flex items-center text-lg font-medium text-text-primary">
          <Package className="w-5 h-5 mr-2" />
          お関心のあるパウチタイプ <span className="text-error ml-2">*</span>
        </label>
        <p className="text-sm text-text-secondary mb-4">
          複数選択可能です。該当するパウチタイプをすべて選択してください。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pouchTypeOptions.map(type => (
            <div key={type.value} className="relative">
              <input
                {...register('pouchTypes')}
                type="checkbox"
                id={`pouch-${type.value}`}
                value={type.value}
                checked={selectedPouchTypes.includes(type.value)}
                onChange={() => handlePouchTypeChange(type.value)}
                className="sr-only peer"
              />
              <label
                htmlFor={`pouch-${type.value}`}
                className="block p-4 border-2 rounded-container cursor-pointer transition-colors peer-checked:border-brand peer-checked:bg-brand-subtle peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2 hover:border-brand border-border-medium bg-bg-primary"
              >
                <div className="font-medium text-text-primary">{type.label}</div>
                <div className="text-sm text-text-secondary mt-1">{type.description}</div>
                <div className="mt-2">
                  <span className="inline-block bg-bg-muted text-text-secondary text-[13px] px-2 py-0.5 rounded-inner">
                    スコア: +{type.score}
                  </span>
                </div>
              </label>
            </div>
          ))}
        </div>
        {errors.pouchTypes && (
          <p className="text-error text-sm">{String(errors.pouchTypes.message)}</p>
        )}
      </div>

      {/* Product Type and Monthly Quantity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-text-primary">
            <Box className="w-4 h-4 mr-2" />
            包装する製品 <span className="text-error ml-1">*</span>
          </label>
          <select
            {...register('productType')}
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
          >
            <option value="">選択してください</option>
            <option value="food-solid">食品（固形物）</option>
            <option value="food-liquid">食品（液体）</option>
            <option value="food-powder">食品（粉体）</option>
            <option value="cosmetics-cream">化粧品（クリーム状）</option>
            <option value="cosmetics-liquid">化粧品（液体）</option>
            <option value="medical-solid">医療品（固形）</option>
            <option value="medical-liquid">医療品（液体）</option>
            <option value="electronics">電子部品</option>
            <option value="chemical">化学製品</option>
            <option value="agriculture">農産物</option>
            <option value="other">その他</option>
          </select>
          {errors.productType && (
            <p className="text-error text-sm">{String(errors.productType.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-text-primary">
            <TrendingUp className="w-4 h-4 mr-2" />
            月産数量 <span className="text-error ml-1">*</span>
          </label>
          <select
            {...register('monthlyQuantity')}
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
          >
            <option value="">選択してください</option>
            <option value="under-1000">1000個未満</option>
            <option value="1000-5000">1000〜5000個</option>
            <option value="5000-10000">5000〜10000個</option>
            <option value="10000-50000">10000〜50000個</option>
            <option value="50000-100000">50000〜100000個</option>
            <option value="100000+">100000個以上</option>
          </select>
          {errors.monthlyQuantity && (
            <p className="text-error text-sm">{String(errors.monthlyQuantity.message)}</p>
          )}
        </div>
      </div>

      {/* Timeline and Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-text-primary">
            <Calendar className="w-4 h-4 mr-2" />
            希望納期 <span className="text-error ml-1">*</span>
          </label>
          <select
            {...register('timeline')}
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
          >
            <option value="">選択してください</option>
            <option value="urgent-1month">1ヶ月以内（急ぎ）</option>
            <option value="normal-3months">3ヶ月以内</option>
            <option value="planned-6months">6ヶ月以内（計画的）</option>
            <option value="researching">検討段階（未定）</option>
          </select>
          {errors.timeline && (
            <p className="text-error text-sm">{String(errors.timeline.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-text-primary">
            <DollarSign className="w-4 h-4 mr-2" />
            予算規模 <span className="text-error ml-1">*</span>
          </label>
          <select
            {...register('budget')}
            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
          >
            <option value="">選択してください</option>
            <option value="under-500k">50万円未満</option>
            <option value="500k-1m">50万〜100万円</option>
            <option value="1m-5m">100万〜500万円</option>
            <option value="5m-10m">500万〜1000万円</option>
            <option value="10m-50m">1000万〜5000万円</option>
            <option value="50m+">5000万円以上</option>
            <option value="consultation">ご相談（予算未定）</option>
          </select>
          {errors.budget && (
            <p className="text-error text-sm">{String(errors.budget.message)}</p>
          )}
        </div>
      </div>

      {/* Lead Score Impact Info */}
      <div className="bg-brand-muted border border-brand-soft rounded-container p-4">
        <div className="flex items-start">
          <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-on-brand font-bold text-xs">★</span>
          </div>
          <div className="ml-3">
            <h4 className="font-semibold text-on-brand-muted mb-1">リードスコアに影響する項目</h4>
            <p className="text-sm text-on-brand-muted">
              月産数量、予算規模、希望納期はリードスコアに大きく影響します。
              詳細な情報をご提供いただくことで、より適切なご提案が可能になります。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}