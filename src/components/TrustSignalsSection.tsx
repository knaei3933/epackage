'use client'

import React from 'react'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Building,
  Award,
  TrendingUp,
  Users,
  Star,
  CheckCircle,
  Target,
  BarChart3,
  Globe,
  Clock,
  Shield,
  Sparkles,
  ChevronRight,
  Quote,
  DollarSign,
  Lightbulb,
  Rocket,
  Download
} from 'lucide-react'

interface TrustSignalsSectionProps {
  className?: string
}

interface Company {
  name: string
  industry: string
  logo: string
  testimonial: string
  results: string[]
  representative: string
  position: string
}

interface Partner {
  name: string
  type: string
  description: string
  logo: string
  since: number
}

interface CaseStudy {
  title: string
  industry: string
  challenge: string
  solution: string
  roi: string
  timeline: string
  company: string
}

export function TrustSignalsSection({ className = '' }: TrustSignalsSectionProps) {
  const featuredCompanies: Company[] = [
    {
      name: '株式会社ABC製薬',
      industry: '医薬品',
      logo: '/logos/abc-pharma.png',
      testimonial: '韓国製包装材への当初の懸念は、品質とコストパフォーマンスで完全に払拭されました。法規制準拠の徹底と迅速な対応体制が信頼の基盤です。',
      results: [
        '包装コスト35%削減',
        '納期60%短縮',
        '品質合格率99.9%',
        '内部稟議審議2週間短縮'
      ],
      representative: '山田太郎',
      position: '購買部長'
    },
    {
      name: ' DEFフーズ株式会社',
      industry: '食品',
      logo: '/logos/def-foods.png',
      testimonial: '食品安全基準への対応が非常に丁寧で、法規制変化にも柔軟に対応してくれます。長期的なパートナーとして非常に満足しています。',
      results: [
        '食品安全事故ゼロ',
        '環境負荷40%削減',
        '廃棄物25%削減',
        'サプライチェーン透明化'
      ],
      representative: '佐藤花子',
      position: '品質管理部長'
    },
    {
      name: 'GHIコスメティクス株式会社',
      industry: '化粧品',
      logo: '/logos/ghi-cosmetics.png',
      testimonial: '食品安全規格対応の証明書が整備されており、新規製品開発の稟議がスムーズに進みました。技術サポートも非常に充実しています。',
      results: [
        '開発期間30%短縮',
        '包装デザイン自由度向上',
        '環境配慮材料導入',
        'サンプル作成期間50%短縮'
      ],
      representative: '鈴木一郎',
      position: '製品開発部長'
    },
    {
      name: 'JKLテクノロジー株式会社',
      industry: '電子機器',
      logo: '/logos/jkl-tech.png',
      testimonial: '精密電子部品の包装要求に対して、高度な技術力で対応してくれました。トレーサビリティシステムも万全で安心感があります。',
      results: [
        '静電気対策100%対応',
        '精度管理±0.1mm',
        '梱包損傷ゼロ',
        '在庫管理効率化'
      ],
      representative: '高橋美咲',
      position: '生産技術部長'
    }
  ]

  const partners: Partner[] = [
    {
      name: '日本包装技術協会',
      type: '業界団体',
      description: '包装技術の標準化と品質向上に貢献',
      logo: '/logos/jpta.png',
      since: 2020
    },
    {
      name: '食品安全推進機構',
      type: '認証機関',
      description: '食品安全マネジメントシステムの認証',
      logo: '/logos/fsf.png',
      since: 2021
    },
    {
      name: '環境経営システム協会',
      type: '環境団体',
      description: '環境負荷の低減とサステナビリティ推進',
      logo: '/logos/emsa.png',
      since: 2022
    },
    {
      name: '医薬品品質協議会',
      type: '業界団体',
      description: '医薬品品質の向上と規制準拠支援',
      logo: '/logos/dqma.png',
      since: 2023
    },
    {
      name: '物流システム技術協会',
      type: '技術団体',
      description: '物流効率化と包装技術の革新',
      logo: '/logos/lsta.png',
      since: 2021
    },
    {
      name: '国際包装学会',
      type: '学術団体',
      description: '包装科学技術の国際的発展',
      logo: '/logos/iap.png',
      since: 2022
    }
  ]

  const caseStudies: CaseStudy[] = [
    {
      title: '大手医薬品メーカーの包装コスト改革',
      industry: '医薬品',
      challenge: '従来の高価格な国内包装材からコスト削減しつつ、薬機法規制を遵守',
      solution: '韓国の最先端包装技術と日本法規制準拠の組み合わせによる最適化',
      roi: '年間2.8億円のコスト削減効果',
      timeline: '6ヶ月',
      company: 'TOP製薬株式会社'
    },
    {
      title: '食品スーパーチェーンの環境負荷削減',
      industry: '食品',
      challenge: 'SDGs目標達成のため、包装材の環境負荷を削減しつつ食品安全を確保',
      solution: 'リサイクル可能素材と環境配慮型包装設計の導入',
      roi: '環境負荷40%削減、年間1.5億円のコスト削減',
      timeline: '8ヶ月',
      company: 'フレッシュフードチェーン'
    },
    {
      title: '化粧品メーカーのグローバル展開支援',
      industry: '化粧品',
      challenge: '各国の異なる規制基準を満たしつつ、ブランドイメージを維持',
      solution: 'グローバル対応の多規格パッケージングシステム',
      roi: '新興市場参入3ヶ月で黒字化、年間3.2億円の売上増',
      timeline: '4ヶ月',
      company: 'グローバルコスメ株式会社'
    }
  ]

  const stats = [
    {
      value: '500+',
      label: '日本企業取引実績',
      description: '医薬品・食品・化粧品業界を中心',
      icon: Users
    },
    {
      value: '100%',
      label: '法規制準拠率',
      description: '日本全ての関連法規を完全準拠',
      icon: Shield
    },
    {
      value: '35%',
      label: '平均コスト削減',
      description: 'クオリティを維持しつつのコスト最適化',
      icon: TrendingUp
    },
    {
      value: '24h',
      label: '問題対応時間',
      description: '緊急時でも迅速な対応体制',
      icon: Clock
    },
    {
      value: '99.9%',
      label: '品質合格率',
      description: '厳格な品質管理の結果',
      icon: CheckCircle
    },
    {
      value: '0',
      label: '安全インシデント',
      description: '重大安全事故の発生ゼロ',
      icon: Target
    }
  ]

  return (
    <section className={`py-16 lg:py-24 bg-white ${className}`}>
      <Container size="6xl">
        {/* Section Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              500+ 日本企業の信頼
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              様々な業界の日本企業から選ばれる理由。
              実績とデータが証明する品質と信頼性。
            </p>
          </div>
        </MotionWrapper>

        {/* Trust Statistics */}
        <MotionWrapper delay={0.2}>
          <div className="mb-20">
            <div className="bg-gradient-to-r from-navy-700 to-navy-600 rounded-3xl p-8 md:p-12 text-white">
              <div className="grid md:grid-cols-3 gap-8">
                {stats.slice(0, 3).map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div key={index} className="text-center">
                      <div className="text-4xl md:text-5xl font-bold text-white mb-3">
                        {stat.value}
                      </div>
                      <div className="text-xl font-semibold text-navy-600 mb-2">
                        {stat.label}
                      </div>
                      <p className="text-navy-600 text-sm">
                        {stat.description}
                      </p>
                      <div className="mt-4">
                        <Icon className="h-8 w-8 text-navy-400 mx-auto" />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="grid md:grid-cols-3 gap-8 mt-8 pt-8 border-t border-navy-500">
                {stats.slice(3).map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div key={index} className="text-center">
                      <div className="text-4xl md:text-5xl font-bold text-white mb-3">
                        {stat.value}
                      </div>
                      <div className="text-xl font-semibold text-navy-600 mb-2">
                        {stat.label}
                      </div>
                      <p className="text-navy-600 text-sm">
                        {stat.description}
                      </p>
                      <div className="mt-4">
                        <Icon className="h-8 w-8 text-navy-400 mx-auto" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </MotionWrapper>

        {/* Featured Companies */}
        <MotionWrapper delay={0.3}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              主要顧客企業の声
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredCompanies.map((company, index) => (
                <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building className="h-8 w-8 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{company.name}</h4>
                      <Badge variant="outline" className="mt-1">
                        {company.industry}
                      </Badge>
                    </div>
                  </div>

                  <blockquote className="border-l-4 border-navy-600 pl-4 mb-6">
                    <p className="text-gray-700 italic leading-relaxed">
                      {company.testimonial}
                    </p>
                  </blockquote>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {company.results.map((result, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {result}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {company.representative}
                      </p>
                      <p className="text-sm text-gray-500">
                        {company.position}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 text-navy-700">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </MotionWrapper>

        {/* Case Studies */}
        <MotionWrapper delay={0.4}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              成功事例 - ROIと成果
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {caseStudies.map((study, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {study.industry}
                    </Badge>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {study.roi}
                      </div>
                      <div className="text-xs text-gray-500">
                        {study.timeline}
                      </div>
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-gray-900 mb-3">
                    {study.title}
                  </h4>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        課題
                      </p>
                      <p className="text-sm text-gray-700">
                        {study.challenge}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        解決策
                      </p>
                      <p className="text-sm text-gray-700">
                        {study.solution}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                      {study.company}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </MotionWrapper>

        {/* Partners */}
        <MotionWrapper delay={0.5}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              業界パートナー
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {partners.map((partner, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Building className="h-8 w-8 text-gray-600" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">
                    {partner.name}
                  </h4>
                  <Badge variant="outline" className="text-xs mb-2">
                    {partner.type}
                  </Badge>
                  <p className="text-xs text-gray-500">
                    {partner.since}年〜
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </MotionWrapper>

        {/* CTA for Trust */}
        <MotionWrapper delay={0.6}>
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-3xl p-8 md:p-12 text-white">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-6">
                500+ 日本企業が選んだ理由
              </h3>
              <p className="text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                法規制準拠の徹底から品質管理、技術サポートまで、
                日本企業の要求に完璧に応える体制を整えています。
                あなたのビジネスにも実績と信頼をご提供します。
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                    専門性
                  </div>
                  <p className="text-sm text-gray-300">
                    日本の法規制とビジネス慣習を完全理解
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    <Rocket className="h-8 w-8 mx-auto mb-2 text-navy-500" />
                    迅速性
                  </div>
                  <p className="text-sm text-gray-300">
                    即日対応と短期納期で開発を加速
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-400" />
                    ROI
                  </div>
                  <p className="text-sm text-gray-300">
                    平均35%のコスト削減を実現
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                実績資料をダウンロード
                <Download className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  )
}