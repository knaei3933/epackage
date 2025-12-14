'use client'

import React, { useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { MessageSquare, Upload, Building, AlertTriangle, TrendingDown, Users } from 'lucide-react'

export default function AdditionalInfoStep() {
  const {
    register,
    formState: { errors },
    watch
  } = useFormContext()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const watchMessage = watch('message', '')

  return (
    <div className="space-y-6">
      {/* Current Supplier */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Building className="w-4 h-4 mr-2" />
          現在のパウチサプライヤー
        </label>
        <input
          {...register('currentSupplier')}
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
          placeholder="現在ご利用のパウチメーカーがございましたらご記入ください"
        />
        {errors.currentSupplier && (
          <p className="text-red-600 text-sm">{String(errors.currentSupplier.message)}</p>
        )}
        <p className="text-xs text-gray-500">
          現在の課題や改善点を理解するための参考情報として利用いたします
        </p>
      </div>

      {/* Challenges */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <AlertTriangle className="w-4 h-4 mr-2" />
          現在の課題や改善したい点
        </label>
        <textarea
          {...register('challenges')}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent resize-none"
          placeholder="現在のパッケージングにおける課題や改善したい点についてお聞かせください&#10;例：コスト削減、品質改善、デザイン変更、機能追加など"
        />
        {errors.challenges && (
          <p className="text-red-600 text-sm">{String(errors.challenges.message)}</p>
        )}
      </div>

      {/* Decision Maker */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Users className="w-4 h-4 mr-2" />
          意思決定者情報
        </label>
        <textarea
          {...register('decisionMaker')}
          rows={2}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent resize-none"
          placeholder="最終的な意思決定者（役職や部署）についてお聞かせください"
        />
        {errors.decisionMaker && (
          <p className="text-red-600 text-sm">{String(errors.decisionMaker.message)}</p>
        )}
        <p className="text-xs text-gray-500">
          効率的なご提案のための参考情報として利用いたします
        </p>
      </div>

      {/* Competitor Analysis */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <TrendingDown className="w-4 h-4 mr-2" />
          競合製品・ベンチマーク
        </label>
        <textarea
          {...register('competitorAnalysis')}
          rows={2}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent resize-none"
          placeholder="参考にしている競合製品や理想のパッケージがございましたらご記入ください"
        />
        {errors.competitorAnalysis && (
          <p className="text-red-600 text-sm">{String(errors.competitorAnalysis.message)}</p>
        )}
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Upload className="w-4 h-4 mr-2" />
          技術資料・仕様書
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-navy-500 transition-colors">
          <input
            {...register('fileAttachment')}
            type="hidden"
            ref={fileInputRef}
          />
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">
            技術仕様書、設計図、既存パッケージ画像など
          </p>
          <p className="text-sm text-gray-500">
            現在はファイル名をテキストでご入力ください（後ほど本格的なファイルアップロード機能を実装予定）
          </p>
          <input
            type="text"
            placeholder="ファイル名や内容をご記入ください"
            className="mt-4 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent"
            {...register('fileAttachment')}
          />
        </div>
        {errors.fileAttachment && (
          <p className="text-red-600 text-sm">{String(errors.fileAttachment.message)}</p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-4">
        <label className="flex items-center text-lg font-medium text-gray-900">
          <MessageSquare className="w-5 h-5 mr-2" />
          お問い合わせ内容 <span className="text-red-500 ml-2">*</span>
        </label>
        <textarea
          {...register('message')}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent resize-none text-base"
          placeholder="パウチ包装についてのご要望やご質問を詳しくお聞かせください。&#10;&#10;例：&#10;・具体的な製品用途と特徴&#10;・重視する点（コスト、品質、デザイン、機能など）&#10;・過去のパウチ導入経験&#10;・期待する効果や目標&#10;・その他ご要望"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>10文字以上1000文字以内</span>
          <span>{watchMessage?.length || 0}/1000</span>
        </div>
        {errors.message && (
          <p className="text-red-600 text-sm">{String(errors.message.message)}</p>
        )}
      </div>

      {/* Summary Help */}
      <div className="bg-navy-50 border border-navy-600 rounded-lg p-4">
        <div className="flex items-start">
          <div className="w-5 h-5 bg-navy-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-navy-600 font-bold text-xs">i</span>
          </div>
          <div className="ml-3">
            <h4 className="font-semibold text-navy-600 mb-1">最終確認</h4>
            <p className="text-sm text-navy-600">
              これまでの入力内容に加え、上記の詳細情報をご提供いただくことで、
              より精度の高いご提案が可能になります。特に現状の課題や期待効果について
              詳しくお聞かせください。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}