'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { BookOpen, Calendar, Building2, ArrowRight, ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { sampleRecords } from '@/lib/archive-data'
import type { TradeRecord } from '@/types/archives'
import type { Product } from '@/types/database'

interface ProductRelatedCasesProps {
  product: Product
  locale?: 'ja' | 'en'
}

/**
 * ProductRelatedCases コンポーネント
 *
 * 関連導入事例をカード形式で表示
 * - archive-data.tsのsampleRecordsを活用
 * - 同カテゴリ・業界の事例を表示
 */
export function ProductRelatedCases({ product, locale = 'ja' }: ProductRelatedCasesProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)

  // 関連事例の取得
  const relatedCases = React.useMemo(() => {
    if (!product.related_case_studies || product.related_case_studies.length === 0) {
      // 関連事例IDがない場合、カテゴリから推測
      return getCasesByCategory(product.category)
    }

    return sampleRecords.filter(record =>
      product.related_case_studies?.includes(record.id)
    )
  }, [product.related_case_studies, product.category])

  if (relatedCases.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center py-8 text-gray-500">
          {locale === 'ja'
            ? '現在関連する導入事例はありません。'
            : 'No related case studies available.'}
        </div>
      </Card>
    )
  }

  // 業界ラベルを取得
  const getIndustryLabel = (industry: string) => {
    const labels: Record<string, { ja: string; en: string }> = {
      cosmetics: { ja: '化粧品', en: 'Cosmetics' },
      food: { ja: '食品', en: 'Food' },
      pharmaceutical: { ja: '医薬品', en: 'Pharmaceutical' },
    }
    return labels[industry]?.[locale] || industry
  }

  // プロジェクトタイプラベルを取得
  const getProjectTypeLabel = (type: string) => {
    const labels: Record<string, { ja: string; en: string }> = {
      custom_manufacturing: { ja: 'カスタム製造', en: 'Custom Manufacturing' },
      standard_product: { ja: '標準製品', en: 'Standard Product' },
    }
    return labels[type]?.[locale] || type
  }

  return (
    <>
      <Card className="p-8">
        <div className="space-y-6">
          {/* ヘッダー */}
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-brixa-600" />
            <h3 className="text-xl font-bold text-gray-900">
              {locale === 'ja' ? '関連導入事例' : 'Related Case Studies'}
            </h3>
          </div>

          {/* 事例カードグリッド */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCases.map((record, index) => (
              <MotionWrapper key={record.id} delay={index * 0.1}>
                <button
                  onClick={() => setSelectedCaseId(record.id)}
                  className="group w-full text-left"
                >
                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-brixa-600 hover:shadow-lg transition-all h-full flex flex-col">
                    {/* 画像 */}
                    {record.images && record.images.length > 0 ? (
                      <div className="relative aspect-video bg-gray-100">
                        <Image
                          src={record.images.find(img => img.isMain)?.url || record.images[0].url}
                          alt={record.images.find(img => img.isMain)?.alt || record.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-white text-sm font-medium line-clamp-2">
                            {record.title}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    {/* 内容 */}
                    <div className="p-4 flex-1 flex flex-col">
                      {/* 顧客名 */}
                      <p className="text-sm text-gray-500 mb-2">{record.clientName}</p>

                      {/* 説明 */}
                      <p className="text-sm text-gray-700 line-clamp-3 mb-4 flex-1">
                        {record.description}
                      </p>

                      {/* バッジ */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          <Building2 className="w-3 h-3 mr-1" />
                          {getIndustryLabel(record.industry)}
                        </Badge>
                        {record.startDate && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(record.startDate).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'short',
                            })}
                          </Badge>
                        )}
                      </div>

                      {/* 結果タグ */}
                      {record.results && record.results.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {record.results.slice(0, 2).map((result, i) => (
                            <span
                              key={i}
                              className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded"
                            >
                              ✓ {result}
                            </span>
                          ))}
                          {record.results.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{record.results.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* 詳細へボタン */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="text-sm text-brixa-600 font-medium flex items-center group-hover:text-brixa-700">
                          {locale === 'ja' ? '詳細を見る' : 'View Details'}
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </MotionWrapper>
            ))}
          </div>

          {/* アーカイブページへのリンク - 一時的に無効化（ページが存在しないため404エラー） */}
          {/* <div className="text-center pt-4">
            <a
              href="/archives"
              className="inline-flex items-center text-brixa-600 hover:text-brixa-700 font-medium transition-colors"
            >
              {locale === 'ja' ? 'すべての導入事例を見る' : 'View All Case Studies'}
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div> */}
        </div>
      </Card>

      {/* 詳細モーダル（簡易版） */}
      {selectedCaseId && (
        <CaseDetailModal
          record={sampleRecords.find(r => r.id === selectedCaseId)!}
          onClose={() => setSelectedCaseId(null)}
          locale={locale}
        />
      )}
    </>
  )
}

/**
 * カテゴリから導入事例を取得
 */
function getCasesByCategory(category: string): TradeRecord[] {
  const categoryMap: Record<string, string[]> = {
    stand_up: ['cosmetics', 'food', 'pharmaceutical'],
    spout_pouch: ['food'],
    box: ['pharmaceutical', 'cosmetics'],
    roll_film: ['food'],
    flat_3_side: ['cosmetics'],
    gassho: ['food'],
  }

  const industries = categoryMap[category] || []
  if (industries.length === 0) return []

  return sampleRecords.filter(record =>
    industries.includes(record.industry)
  ).slice(0, 6)
}

/**
 * 事例詳細モーダル（簡易版）
 */
function CaseDetailModal({
  record,
  onClose,
  locale,
}: {
  record: TradeRecord
  onClose: () => void
  locale: 'ja' | 'en'
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{record.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* メタデータ */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="text-sm text-gray-600">{record.clientName}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">{record.industry}</span>
            {record.startDate && record.endDate && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600">
                  {new Date(record.startDate).toLocaleDateString('ja-JP')} - {new Date(record.endDate).toLocaleDateString('ja-JP')}
                </span>
              </>
            )}
          </div>

          {/* 説明 */}
          <p className="text-gray-700 mb-6">{record.description}</p>

          {/* 技術仕様 */}
          {record.technicalSpec && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {locale === 'ja' ? '技術仕様' : 'Technical Specifications'}
              </h3>
              <p className="text-sm text-gray-600">{record.technicalSpec}</p>
            </div>
          )}

          {/* 結果 */}
          {record.results && record.results.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {locale === 'ja' ? '導入効果' : 'Results'}
              </h3>
              <ul className="space-y-1">
                {record.results.map((result, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {result}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* コンテンツ */}
          {record.content && (
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: record.content }} />
            </div>
          )}
        </div>

        {/* フッター - 一時的に無効化（ページが存在しないため404エラー） */}
        {/* <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
          <a
            href={`/archives#${record.id}`}
            className="px-4 py-2 bg-brixa-600 text-white rounded-lg hover:bg-brixa-700 transition-colors"
          >
            {locale === 'ja' ? 'アーカイブで見る' : 'View in Archives'}
          </a>
        </div> */}
      </div>
    </div>
  )
}
