'use client'

import React from 'react'
import { Download, FileText, BookOpen, Settings } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import type { ProductDownload } from '@/types/product-content'

interface ProductDownloadsProps {
  downloads: ProductDownload[]
  locale?: 'ja' | 'en'
}

/**
 * ProductDownloads コンポーネント
 *
 * ダウンロードセクションを表示
 * - PDFアイコンとファイルサイズ表示
 * - カタログ、仕様書、技術ガイドの区分
 */
export function ProductDownloads({ downloads, locale = 'ja' }: ProductDownloadsProps) {
  // タイプ別にグループ化
  const grouped: Record<string, ProductDownload[]> = {
    catalog: [],
    spec_sheet: [],
    technical_guide: [],
  }

  for (const download of downloads) {
    if (grouped[download.type]) {
      grouped[download.type].push(download)
    }
  }

  // タイプ情報の取得
  const getTypeInfo = (type: string) => {
    const info: Record<string, { icon: any; label: string; labelEn: string; color: string }> = {
      catalog: {
        icon: BookOpen,
        label: '製品カタログ',
        labelEn: 'Product Catalog',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      spec_sheet: {
        icon: FileText,
        label: '技術仕様書',
        labelEn: 'Technical Specs',
        color: 'bg-green-50 text-green-700 border-green-200',
      },
      technical_guide: {
        icon: Settings,
        label: '技術ガイド',
        labelEn: 'Technical Guide',
        color: 'bg-purple-50 text-purple-700 border-purple-200',
      },
    }
    return info[type] || info.catalog
  }

  return (
    <Card className="p-8">
      <div className="space-y-8">
        {/* ヘッダー */}
        <div className="flex items-center">
          <Download className="w-6 h-6 mr-2 text-brixa-600" />
          <h3 className="text-xl font-bold text-gray-900">
            {locale === 'ja' ? 'ダウンロード資料' : 'Downloads'}
          </h3>
        </div>

        {/* タイプ別セクション */}
        {Object.entries(grouped).map(([type, items], groupIndex) => {
          if (items.length === 0) return null

          const typeInfo = getTypeInfo(type)
          const Icon = typeInfo.icon

          return (
            <div key={type} className="space-y-4">
              <div className="flex items-center space-x-2">
                <Icon className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">
                  {locale === 'ja' ? typeInfo.label : typeInfo.labelEn}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((download, index) => (
                  <MotionWrapper key={index} delay={groupIndex * 0.1 + index * 0.05}>
                    <a
                      href={download.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <div className="border border-gray-200 rounded-lg p-4 hover:border-brixa-600 hover:shadow-md transition-all">
                        {/* アイコンとタイトル */}
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                            <Download className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 group-hover:text-brixa-700 transition-colors line-clamp-2">
                              {locale === 'ja' ? download.title_ja : download.title_en}
                            </p>
                          </div>
                        </div>

                        {/* ファイルサイズとタイプバッジ */}
                        <div className="flex items-center justify-between mt-3">
                          {download.size && (
                            <span className="text-xs text-gray-500">{download.size}</span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(download.type, locale)}
                          </Badge>
                        </div>
                      </div>
                    </a>
                  </MotionWrapper>
                ))}
              </div>
            </div>
          )
        })}

        {/* ダウンロードがない場合 */}
        {downloads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {locale === 'ja'
              ? '現在ダウンロード可能な資料はありません。'
              : 'No downloads available.'}
          </div>
        )}

        {/* 注意書き */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            {locale === 'ja'
              ? '※PDFファイルをご覧になるには、Adobe Acrobat Readerが必要です。'
              : '※Adobe Acrobat Reader is required to view PDF files.'}
          </p>
        </div>
      </div>
    </Card>
  )
}

/**
 * タイプリストラベルを取得
 */
function getTypeLabel(type: string, locale: 'ja' | 'en'): string {
  const labels: Record<string, { ja: string; en: string }> = {
    catalog: { ja: 'カタログ', en: 'Catalog' },
    spec_sheet: { ja: '仕様書', en: 'Specs' },
    technical_guide: { ja: 'ガイド', en: 'Guide' },
  }

  return labels[type]?.[locale] || type
}
