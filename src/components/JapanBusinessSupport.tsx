'use client'

import React from 'react'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  FileText,
  Download,
  Eye,
  Building,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Target,
  Lightbulb,
  Handshake,
  Briefcase,
  BarChart3,
  Award,
  Star,
  ArrowRight,
  Calendar,
  DollarSign,
  Shield,
  Shield as CheckShield,
    Folder,
  Share2,
  MessageSquare,
  Package
} from 'lucide-react'

interface JapanBusinessSupportProps {
  className?: string
}

interface DocumentTemplate {
  id: string
  title: string
  description: string
  category: string
  format: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'zip'
  size: string
  downloadUrl: string
  previewUrl: string
  recommended: boolean
}

interface ProcessStep {
  step: number
  title: string
  description: string
  duration: string
  icon: React.ComponentType<any>
  benefits: string[]
}

interface CustomerSupport {
  type: string
  title: string
  description: string
  responseTime: string
  availability: string
  icon: React.ComponentType<any>
}

export function JapanBusinessSupport({ className = '' }: JapanBusinessSupportProps) {
  const documentTemplates: DocumentTemplate[] = [
    {
      id: 'internal-review',
      title: '内部審査用資料セット',
      description: '購買部門・品質管理部門向けの総合審査資料',
      category: '審査資料',
      format: 'zip',
      size: '12.5MB',
      downloadUrl: '/downloads/internal-review',
      previewUrl: '/preview/internal-review',
      recommended: true
    },
    {
      id: 'proposal-template',
      title: '稟議書フォーマット',
      description: '日本企業の稟議システムに最適化した提案書テンプレート',
      category: '提案書',
      format: 'docx',
      size: '2.1MB',
      downloadUrl: '/downloads/proposal-template',
      previewUrl: '/preview/proposal-template',
      recommended: true
    },
    {
      id: 'tech-spec',
      title: '技術仕様比較表',
      description: '従来包装材との詳細な技術仕様・コスト比較',
      category: '技術資料',
      format: 'xlsx',
      size: '3.8MB',
      downloadUrl: '/downloads/tech-spec',
      previewUrl: '/preview/tech-spec',
      recommended: true
    },
    {
      id: 'case-studies',
      title: '導入事例詳細資料',
      description: '業別・規模別の成功事例とROI分析',
      category: '事例研究',
      format: 'pdf',
      size: '8.2MB',
      downloadUrl: '/downloads/case-studies',
      previewUrl: '/preview/case-studies',
      recommended: false
    },
    {
      id: 'compliance-docs',
      title: '法規制準拠証明書',
      description: '全ての日本法規制対応証明書一覧',
      category: '法規制',
      format: 'pdf',
      size: '5.6MB',
      downloadUrl: '/downloads/compliance-docs',
      previewUrl: '/preview/compliance-docs',
      recommended: true
    },
    {
      id: 'quality-manual',
      title: '品質マニュアル日本語版',
      description: 'ISO 9001:2015の日本語完全対応版',
      category: '品質管理',
      format: 'pdf',
      size: '4.3MB',
      downloadUrl: '/downloads/quality-manual',
      previewUrl: '/preview/quality-manual',
      recommended: false
    }
  ]

  const businessProcess: ProcessStep[] = [
    {
      step: 1,
      title: '事前相談',
      description: '要件ヒアリングと最適ソリューションの提案',
      duration: '1-2週間',
      icon: MessageSquare,
      benefits: [
        '専門コンサルタントによる詳細なヒアリング',
        '具体的なソリューションの提案',
        '予算目安の提示',
        '競合比較分析'
      ]
    },
    {
      step: 2,
      title: '資料提供',
      description: '稟議審査用の資料を即日提供',
      duration: '即日',
      icon: FileText,
      benefits: [
        '即日対応の資料提供',
        '完全日本語の資料',
        '業別最適化された内容',
        '二次利用可能なテンプレート'
      ]
    },
    {
      step: 3,
      title: 'サンプル提供',
      description: '無料サンプルの迅速な手配',
      duration: '3-5営業日',
      icon: Package,
      benefits: [
        '最大5種類の無料サンプル',
        '実際の使用環境でのテスト',
        '技術仕様の詳細説明',
        'カスタマイズ提案'
      ]
    },
    {
      step: 4,
      title: '技術検討',
      description: '専門チームによる技術サポート',
      duration: '2-3週間',
      icon: Lightbulb,
      benefits: [
        '専門技術者による直接サポート',
        '詳細な技術仕様の検討',
        'カスタマイズ提案',
        'コスト最適化アドバイス'
      ]
    },
    {
      step: 5,
      title: '契約締結',
      description: '日本企業に最適化した契約条項',
      duration: '1週間',
      icon: Handshake,
      benefits: [
        '日本語契約書の提供',
        '日本法準拠の条項',
        'リスク管理条項の明確化',
        '柔軟な支払い条件'
      ]
    },
    {
      step: 6,
      title: '納入・サポート',
      description: '確実な納入と継続的なサポート',
      duration: '30日以内',
      icon: CheckShield,
      benefits: [
        '厳格な品質検査',
        '確実な納期保証',
        '現地での技術サポート',
        'アフターサービス体制'
      ]
    }
  ]

  const customerSupport: CustomerSupport[] = [
    {
      type: '専任担当者',
      title: '専任営業担当',
      description: '日本語での継続的なサポート',
      responseTime: '即時対応',
      availability: '24/365',
      icon: Users
    },
    {
      type: '専門チーム',
      title: '技術サポートチーム',
      description: '専門的な技術的質問に対応',
      responseTime: '2時間以内',
      availability: '営業日9:18時',
      icon: Lightbulb
    },
    {
      type: '緊急対応',
      title: '緊急対応窓口',
      description: '緊急時の迅速な問題解決',
      responseTime: '30分以内',
      availability: '24/365',
      icon: Shield
    },
    {
      type: '現地サポート',
      title: '現地技術サポート',
      description: '日本国内での技術サポート',
      responseTime: '当日対応',
      availability: '事前予約制',
      icon: Building
    }
  ]

  const businessBenefits = [
    {
      icon: BarChart3,
      title: '稟議審議スピードアップ',
      description: '完全な資料準備で審議期間を平均30%短縮',
      value: '30%',
      color: 'blue'
    },
    {
      icon: DollarSign,
      title: 'TCO削減',
      description: '初期投資から維持コストまでの総所有コスト削減',
      value: '35%',
      color: 'green'
    },
    {
      icon: Clock,
      title: '導入期間短縮',
      description: '日本企業の購買プロセスに最適化した迅速な導入',
      value: '50%',
      color: 'purple'
    },
    {
      icon: Target,
      title: 'リスク管理',
      description: '法規制から品質までの全てのリスクを網羅的カバー',
      value: '100%',
      color: 'orange'
    }
  ]

  return (
    <section className={`py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-navy-50 ${className}`}>
      <Container size="6xl">
        {/* Section Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Briefcase className="h-12 w-12 text-navy-700" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                日本企業向けビジネスサポート
              </h2>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              日本企業の購買プロセスに完全対応するための
              専門資料とサポート体制をご提供します。
            </p>
            <div className="flex items-center justify-center space-x-4 mt-6">
              <Badge variant="success" className="bg-green-100 text-green-700 px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-1" />
                日本企業500+実績
              </Badge>
              <Badge variant="info" className="bg-navy-600 text-navy-600 px-4 py-2">
                <Clock className="h-4 w-4 mr-1" />
                平均30日納期
              </Badge>
            </div>
          </div>
        </MotionWrapper>

        {/* Business Benefits */}
        <MotionWrapper delay={0.2}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              日本企業導入のメリット
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {businessBenefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300">
                    <div className={`w-16 h-16 bg-${benefit.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`h-8 w-8 text-${benefit.color}-600`} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {benefit.description}
                    </p>
                    <div className="text-2xl font-bold text-gray-900">
                      {benefit.value}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </MotionWrapper>

        {/* Document Templates */}
        <MotionWrapper delay={0.3}>
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">
                審査資料・テンプレート
              </h3>
              <Button variant="outline" size="sm">
                すべての資料を見る
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {documentTemplates.map((doc) => (
                <Card key={doc.id} className="p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-navy-600 rounded-xl flex items-center justify-center">
                        <FileText className="h-6 w-6 text-navy-700" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {doc.title}
                        </h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {doc.category}
                        </Badge>
                      </div>
                    </div>
                    {doc.recommended && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        おすすめ
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {doc.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{doc.format.toUpperCase()}</span>
                    <span>{doc.size}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>プレビュー</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Download className="h-4 w-4" />
                      <span>ダウンロード</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </MotionWrapper>

        {/* Business Process */}
        <MotionWrapper delay={0.4}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              日本企業向け導入プロセス
            </h3>
            <div className="relative">
              {/* Timeline */}
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-navy-400"></div>

              <div className="grid md:grid-cols-3 gap-8">
                {businessProcess.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <div key={step.step} className="relative">
                      {/* Card */}
                      <Card className="p-6 h-full hover:shadow-lg transition-all duration-300">
                        <div className="text-center mb-6">
                          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                            index % 2 === 0 ? 'bg-navy-600' : 'bg-green-100'
                          }`}>
                            <Icon className={`h-8 w-8 ${
                              index % 2 === 0 ? 'text-navy-700' : 'text-green-600'
                            }`} />
                          </div>
                          <div className="w-10 h-10 bg-navy-700 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                            {step.step}
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {step.title}
                          </h4>
                          <Badge variant="outline" className="text-xs mt-2">
                            {step.duration}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                          {step.description}
                        </p>

                        <div className="space-y-2">
                          {step.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center text-xs text-gray-700">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                      </Card>

                      {/* Connector */}
                      {index < businessProcess.length - 1 && (
                        <div className="hidden lg:block absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-navy-400"></div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </MotionWrapper>

        {/* Customer Support */}
        <MotionWrapper delay={0.5}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              専門サポート体制
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {customerSupport.map((support, index) => {
                const Icon = support.icon
                return (
                  <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300">
                    <div className="w-16 h-16 bg-navy-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-navy-700" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {support.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {support.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center text-xs text-gray-700">
                        <Clock className="h-3 w-3 mr-1" />
                        {support.responseTime}
                      </div>
                      <div className="flex items-center justify-center text-xs text-gray-700">
                        <Calendar className="h-3 w-3 mr-1" />
                        {support.availability}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </MotionWrapper>

        {/* Testimonials */}
        <MotionWrapper delay={0.6}>
          <div className="bg-gradient-to-r from-navy-700 to-navy-600 rounded-3xl p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-6">
                日本企業様の声
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    購買部門
                  </Badge>
                </div>
                <blockquote className="text-navy-600 italic mb-4">
                  「稟議書のフォーマットが完備されており、内部審査が非常にスムーズでした。
                  日本のビジネス慣習を深く理解していることが感じられました。」
                </blockquote>
                <div>
                  <p className="font-semibold text-white">山田 太郎</p>
                  <p className="text-sm text-navy-600">株式会社ABC製薬 購買部長</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    品質管理部門
                  </Badge>
                </div>
                <blockquote className="text-navy-600 italic mb-4">
                  「法規制準拠の資料が整備されており、品質管理のプロセスが非常に透明でした。
                  不安なく長期的なパートナーとして選定できました。」
                </blockquote>
                <div>
                  <p className="font-semibold text-white">佐藤 花子</p>
                  <p className="text-sm text-navy-600">株式会社DEFフーズ 品質管理部長</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-8">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-navy-700 hover:bg-gray-100"
              >
                専門担当者に相談する
                <MessageSquare className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  )
}