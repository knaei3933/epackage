'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Settings, Palette, Wrench, FileText } from 'lucide-react'
import { materialOptions, featureOptions } from '@/types/inquiry'

export default function TechnicalRequirementsStep() {
  const {
    register,
    formState: { errors },
    watch,
    setValue
  } = useFormContext()

  const selectedMaterials = watch('materials') || []
  const selectedFeatures = watch('features') || []

  const handleMaterialChange = (value: string) => {
    const currentMaterials = selectedMaterials as string[] || []
    if (currentMaterials.includes(value)) {
      setValue('materials', currentMaterials.filter(material => material !== value))
    } else {
      setValue('materials', [...currentMaterials, value])
    }
  }

  const handleFeatureChange = (value: string) => {
    const currentFeatures = selectedFeatures as string[] || []
    if (currentFeatures.includes(value)) {
      setValue('features', currentFeatures.filter(feature => feature !== value))
    } else {
      setValue('features', [...currentFeatures, value])
    }
  }

  return (
    <div className="space-y-6">
      {/* Materials Selection */}
      <div className="space-y-4">
        <label className="flex items-center text-lg font-medium text-gray-900">
          <Settings className="w-5 h-5 mr-2" />
          素材の希望
        </label>
        <p className="text-sm text-gray-600 mb-4">
          複数選択可能です。使用したい素材や特性をお選びください。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materialOptions.map(material => (
            <div key={material.value} className="relative">
              <input
                {...register('materials')}
                type="checkbox"
                id={`material-${material.value}`}
                value={material.value}
                checked={selectedMaterials.includes(material.value)}
                onChange={() => handleMaterialChange(material.value)}
                className="sr-only peer"
              />
              <label
                htmlFor={`material-${material.value}`}
                className="block p-4 border-2 rounded-lg cursor-pointer transition-all peer-checked:border-brixa-600 peer-checked:bg-brixa-50 hover:border-brixa-400 border-gray-200 bg-white"
              >
                <div className="font-medium text-gray-900">{material.label}</div>
                <div className="mt-2">
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    スコア: +{material.score}
                  </span>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Printing Requirements */}
      <div className="space-y-4">
        <label className="flex items-center text-lg font-medium text-gray-900">
          <Palette className="w-5 h-5 mr-2" />
          印刷要件 <span className="text-red-500 ml-2">*</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">印刷タイプ</label>
            <select
              {...register('printing.type')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
            >
              <option value="">選択してください</option>
              <option value="none">印刷なし（透明フィルム）</option>
              <option value="simple">1〜2色シンプル印刷</option>
              <option value="complex">多色印刷（〜6色）</option>
              <option value="full-color">フルカラー印刷</option>
            </select>
            {errors.printing?.type && (
              <p className="text-red-600 text-sm">{typeof errors.printing?.type === 'object' && errors.printing.type?.message ? String(errors.printing.type.message) : String(errors.printing?.type)}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">色数（おおよそ）</label>
            <input
              {...register('printing.colors')}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
              placeholder="例：4色印刷"
            />
            {errors['printing.colors'] && (
              <p className="text-red-600 text-sm">{String(errors['printing.colors'].message || '印刷色数にエラーがあります')}</p>
            )}
            <p className="text-xs text-gray-500">
              プロセス印刷、特色印刷など具体的なご要望がございましたらご記入ください
            </p>
          </div>
        </div>
      </div>

      {/* Features Selection */}
      <div className="space-y-4">
        <label className="flex items-center text-lg font-medium text-gray-900">
          <Wrench className="w-5 h-5 mr-2" />
          付加機能・特殊仕様
        </label>
        <p className="text-sm text-gray-600 mb-4">
          必要な機能や特殊仕様をお選びください（複数選択可）
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {featureOptions.map(feature => (
            <div key={feature.value} className="relative">
              <input
                {...register('features')}
                type="checkbox"
                id={`feature-${feature.value}`}
                value={feature.value}
                checked={selectedFeatures.includes(feature.value)}
                onChange={() => handleFeatureChange(feature.value)}
                className="sr-only peer"
              />
              <label
                htmlFor={`feature-${feature.value}`}
                className="block p-3 border-2 rounded-lg cursor-pointer transition-all peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:border-purple-300 border-gray-200 bg-white text-center"
              >
                <div className="text-sm font-medium text-gray-900">{feature.label}</div>
                <div className="mt-1">
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    +{feature.score}
                  </span>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Special Requirements */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <FileText className="w-4 h-4 mr-2" />
          特殊要件・その他
        </label>
        <textarea
          {...register('specialRequirements')}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent resize-none"
          placeholder="特殊な耐性要件（耐熱、耐寒、耐油など）、規制対応、輸出仕様など特別なご要望がございましたらご記入ください。"
        />
        {errors.specialRequirements && (
          <p className="text-red-600 text-sm">{String(errors.specialRequirements.message)}</p>
        )}
      </div>

      {/* Technical Info Help */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-purple-800 font-bold text-xs">?</span>
          </div>
          <div className="ml-3">
            <h4 className="font-semibold text-purple-900 mb-1">技術仕様について</h4>
            <p className="text-sm text-purple-700">
              すべての項目にチェックを入れる必要はありません。
              ご要望に近いものをお選びください。不明な点は専門担当者がヒアリングいたします。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}