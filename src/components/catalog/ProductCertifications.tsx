'use client'

import React, { useState } from 'react'
import {
  Shield,
  Award,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import type { ProductCertification } from '@/types/product-content'

interface ProductCertificationsProps {
  certifications: ProductCertification[]
  locale?: 'ja' | 'en'
}

/**
 * ProductCertifications コンポーネント
 *
 * 認証・規格情報を表示
 * - ISO、FDA、食品衛生法などの認証バッジ
 * - ツールチップで詳細情報表示
 * - グリッドレイアウト
 */
export function ProductCertifications({
  certifications,
  locale = 'ja'
}: ProductCertificationsProps) {
  const [hoveredCert, setHoveredCert] = useState<string | null>(null)
  const [expandedCerts, setExpandedCerts] = useState<Set<string>>(new Set())

  if (!certifications || certifications.length === 0) {
    return null
  }

  // 認証のタイプを取得
  const getCertType = (name: string) => {
    if (name.includes('ISO')) return 'iso'
    if (name.includes('FDA')) return 'fda'
    if (name.includes('食品') || name.includes('Food')) return 'food'
    if (name.includes('FSSC')) return 'fssc'
    return 'general'
  }

  // 認証のスタイルを取得
  const getCertStyle = (name: string) => {
    const type = getCertType(name)
    const styles: Record<string, { bg: string; border: string; text: string; icon: any }> = {
      iso: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: Shield,
      },
      fda: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: CheckCircle,
      },
      food: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        icon: Award,
      },
      fssc: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        icon: Shield,
      },
      general: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        icon: Award,
      },
    }
    return styles[type] || styles.general
  }

  // 詳細の開閉
  const toggleExpand = (name: string) => {
    const newExpanded = new Set(expandedCerts)
    if (newExpanded.has(name)) {
      newExpanded.delete(name)
    } else {
      newExpanded.add(name)
    }
    setExpandedCerts(newExpanded)
  }

  return (
    <Card className="p-8">
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center">
          <Shield className="w-6 h-6 mr-2 text-brixa-600" />
          <h3 className="text-xl font-bold text-gray-900">
            {locale === 'ja' ? '認証・規格' : 'Certifications & Standards'}
          </h3>
        </div>

        {/* 認証バッジグリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((cert, index) => {
            const style = getCertStyle(cert.name)
            const Icon = style.icon
            const isExpanded = expandedCerts.has(cert.name)
            const isHovered = hoveredCert === cert.name

            return (
              <MotionWrapper key={index} delay={index * 0.05}>
                <div
                  onMouseEnter={() => setHoveredCert(cert.name)}
                  onMouseLeave={() => setHoveredCert(null)}
                  className={`${style.bg} ${style.border} border rounded-lg p-4 hover:shadow-md transition-all`}
                >
                  {/* 認証名とアイコン */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${style.text}`} />
                      <div>
                        <p className={`font-semibold ${style.text}`}>
                          {cert.name}
                        </p>
                        <p className="text-xs text-gray-500">{cert.issuer}</p>
                      </div>
                    </div>

                    {/* 詳細情報開閉ボタン */}
                    {cert.description && (
                      <button
                        onClick={() => toggleExpand(cert.name)}
                        className={`p-1 hover:bg-white/50 rounded transition-colors ${style.text}`}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* 説明（ホバーまたは展開時） */}
                  {cert.description && (isExpanded || isHovered) && (
                    <div className="mt-3 pt-3 border-t border-current/10">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {cert.description}
                      </p>
                    </div>
                  )}

                  {/* 画像がある場合 */}
                  {cert.image_url && isExpanded && (
                    <div className="mt-3">
                      <img
                        src={cert.image_url}
                        alt={cert.name}
                        className="w-full h-auto rounded"
                      />
                    </div>
                  )}
                </div>
              </MotionWrapper>
            )
          })}
        </div>

        {/* 認証に関する注意書き */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">
                {locale === 'ja' ? '認証について' : 'About Certifications'}
              </p>
              <p>
                {locale === 'ja'
                  ? '表示されている認証は、当社製品が取得または準拠している規格・認証です。詳細についてはお問い合わせください。'
                  : 'The certifications shown are standards and certifications obtained or complied with by our products. For more details, please contact us.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

/**
 * 認証バッジの簡易版（タブ内で使用）
 */
export function CertificationBadges({
  certifications,
  locale = 'ja',
}: ProductCertificationsProps) {
  if (!certifications || certifications.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {certifications.map((cert, index) => (
        <Badge
          key={index}
          variant="outline"
          className="text-sm px-3 py-1"
        >
          {cert.name}
        </Badge>
      ))}
    </div>
  )
}
