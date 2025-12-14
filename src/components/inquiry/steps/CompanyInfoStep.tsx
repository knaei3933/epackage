'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Building, Users, DollarSign, Globe, MapPin } from 'lucide-react'

export default function CompanyInfoStep() {
  const {
    register,
    formState: { errors }
  } = useFormContext()

  return (
    <div className="space-y-6">
      {/* Industry and Employee Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Building className="w-4 h-4 mr-2" />
            業種 <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            {...register('industry')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
          >
            <option value="">選択してください</option>
            <option value="food">食品・飲料</option>
            <option value="cosmetics">化粧品・トイレタリー</option>
            <option value="medical">医療・医薬品</option>
            <option value="retail">小売・流通</option>
            <option value="electronics">電子機器・精密機器</option>
            <option value="agriculture">農業・畜産</option>
            <option value="chemical">化学工業</option>
            <option value="automotive">自動車・部品</option>
            <option value="other">その他</option>
          </select>
          {errors.industry && (
            <p className="text-red-600 text-sm">{String(errors.industry.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Users className="w-4 h-4 mr-2" />
            従業員数 <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            {...register('employeeCount')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
          >
            <option value="">選択してください</option>
            <option value="1-10">1〜10名</option>
            <option value="11-50">11〜50名</option>
            <option value="51-100">51〜100名</option>
            <option value="101-300">101〜300名</option>
            <option value="301-500">301〜500名</option>
            <option value="501-1000">501〜1000名</option>
            <option value="1000+">1000名以上</option>
          </select>
          {errors.employeeCount && (
            <p className="text-red-600 text-sm">{String(errors.employeeCount.message)}</p>
          )}
        </div>
      </div>

      {/* Annual Revenue and Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <DollarSign className="w-4 h-4 mr-2" />
            年商 <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            {...register('annualRevenue')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
          >
            <option value="">選択してください</option>
            <option value="under-100m">1億円未満</option>
            <option value="100m-1b">1億円〜10億円</option>
            <option value="1b-10b">10億円〜100億円</option>
            <option value="10b-100b">100億円〜1000億円</option>
            <option value="over-100b">1000億円以上</option>
          </select>
          {errors.annualRevenue && (
            <p className="text-red-600 text-sm">{String(errors.annualRevenue.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 mr-2" />
            所在地
          </label>
          <input
            {...register('location')}
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
            placeholder="東京都渋谷区"
          />
          {errors.location && (
            <p className="text-red-600 text-sm">{String(errors.location.message)}</p>
          )}
        </div>
      </div>

      {/* Website */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Globe className="w-4 h-4 mr-2" />
          ウェブサイト
        </label>
        <input
          {...register('website')}
          type="url"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
          placeholder="https://www.company.com"
        />
        {errors.website && (
          <p className="text-red-600 text-sm">{String(errors.website.message)}</p>
        )}
        <p className="text-xs text-gray-500">
          企業サイトや製品サイトがございましたらご記入ください
        </p>
      </div>

      {/* Information Help */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-amber-800 font-bold text-xs">!</span>
          </div>
          <div className="ml-3">
            <h4 className="font-semibold text-amber-900 mb-1">なぜこの情報が必要か？</h4>
            <p className="text-sm text-amber-700">
              業種や企業規模を理解することで、より適切なパウチソリューションをご提案できます。
              同じような課題を持つお客様の導入事例もご紹介可能です。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}