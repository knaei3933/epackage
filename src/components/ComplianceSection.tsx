'use client'

import React from 'react'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Shield,
  Award,
  CheckCircle,
  FileText,
  Scale,
  BookOpen,
  Users,
  Building,
  Download,
  Eye,
  Shield as CheckShield,
  File as Certificate,
  Globe,
  Clock
} from 'lucide-react'

interface ComplianceSectionProps {
  className?: string
}

export function ComplianceSection({ className = '' }: ComplianceSectionProps) {
  const japaneseRegulations = [
    {
      icon: Scale,
      title: '食品衛生法',
      description: '食品包装材としての安全性と衛生基準を完全準拠',
      details: [
        '食品衛生法第11条適合',
        'ポリオレフィン系材質使用',
        '移行試験合格',
        '食品安全委員会基準遵守'
      ],
      status: 'compliant',
      certificate: '食品衛生証明書'
    },
    {
      icon: BookOpen,
      title: '薬機法',
      description: '医薬品・医療機器包装材としての規格を完全満たし',
      details: [
        '医薬品専用包装材指定',
        '無菌包装仕様対応',
        'PTP包装適合',
        '医師薬局向けパッケージ'
      ],
      status: 'certified',
      certificate: '薬機法適合証明書'
    },
    {
      icon: Certificate,
      title: 'JIS規格',
      description: '日本工業規格に準拠した品質保証体制',
      details: [
        'JIS Z 1707 (包装材一般)',
        'JIS S 3011 (洗浄剤包装)',
        'JIS Z 1530 (印刷適性)',
        'JIS K 6721 (材質試験)'
      ],
      status: 'certified',
      certificate: 'JIS認証書'
    },
    {
      icon: CheckShield,
      title: 'PL法',
      description: '製品責任法に基づいた安全管理体制と保険完備',
      details: [
        '製造物責任保険加入',
        '安全設計基準適用',
        'リスク管理体制',
        'インシデント対応手順'
      ],
      status: 'compliant',
      certificate: 'PL保険証券'
    }
  ]

  const qualitySystem = [
    {
      step: 1,
      title: '品質設計',
      description: '設計段階の品質保証',
      process: [
        'FMEA実施',
        '品質機能展開',
        '設計レビュー',
        '設計書確定'
      ],
      icon: FileText
    },
    {
      step: 2,
      title: 'サプライヤー管理',
      description: '材料サプライヤーの厳格な品質管理',
      process: [
        'サプライヤー認証',
        '材料検査',
        '納入証明書',
        'トレーサビリティ'
      ],
      icon: Users
    },
    {
      step: 3,
      title: '製造管理',
      description: '製造工程の品質管理',
      process: [
        '作業標準書',
        '工程管理',
        '中間検査',
        '記録保存'
      ],
      icon: Building
    },
    {
      step: 4,
      title: '出荷検査',
      description: '製品出荷前の最終検証',
      process: [
        '機能試験',
        '外観検査',
        '数量確認',
        '出荷許可'
      ],
      icon: CheckCircle
    }
  ]

  const complianceDocuments = [
    {
      title: '品質マニュアル',
      description: 'ISO 9001:2015 品質マネジメントシステムマニュアル',
      size: '2.5MB',
      format: 'PDF',
      category: '品質管理'
    },
    {
      title: '食品安全手順書',
      description: '食品衛生法対応の安全管理手順書',
      size: '1.8MB',
      format: 'PDF',
      category: '食品安全'
    },
    {
      title: 'トレーサビリティシステム',
      description: '製品トレーサビリティ管理システム仕様書',
      size: '3.2MB',
      format: 'PDF',
      category: 'トレーサビリティ'
    },
    {
      title: '医薬品包装適合証明',
      description: '薬機法医薬品包装材適合証明書',
      size: '1.5MB',
      format: 'PDF',
      category: '医薬品'
    }
  ]

  const trustIndicators = [
    {
      value: '500+',
      label: '日本企業取引実績',
      description: '日本の優良企業との実績と信頼',
      icon: Users
    },
    {
      value: '100%',
      label: '法規制準拠率',
      description: '全ての日本法規制を完全準拠',
      icon: Shield
    },
    {
      value: '0',
      label: '安全事件',
      description: '重大安全事故の発生ゼロ',
      icon: CheckCircle
    },
    {
      value: '24h',
      label: '問題対応時間',
      description: '即時対応の迅速な問題解決体制',
      icon: Clock
    }
  ]

  return (
    <section className={`py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-navy-50 ${className}`}>
      <Container size="6xl">
        {/* Section Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Shield className="h-12 w-12 text-navy-700" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                日本規制準拠と信頼構築
              </h2>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              日本の厳格な法規制を完全準拠し、日本企業の信頼を得るための
              詳細な準拠証明と品質保証体制をご提供します。
            </p>
            <div className="flex items-center justify-center space-x-4 mt-6">
              <Badge variant="success" className="bg-green-100 text-green-700 px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-1" />
                日本法規制完全準拠
              </Badge>
              <Badge variant="info" className="bg-navy-600 text-navy-600 px-4 py-2">
                <Award className="h-4 w-4 mr-1" />
                500+ 日本企業実績
              </Badge>
            </div>
          </div>
        </MotionWrapper>

        {/* Japanese Regulations */}
        <MotionWrapper delay={0.2}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              日本の主要法規制準拠状況
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              {japaneseRegulations.map((reg, index) => {
                const Icon = reg.icon
                return (
                  <Card
                    key={index}
                    className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-navy-600"
                  >
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                      reg.status === 'certified' ? 'bg-green-100' : 'bg-navy-600'
                    }`}>
                      <Icon className={`h-10 w-10 ${
                        reg.status === 'certified' ? 'text-green-600' : 'text-navy-700'
                      }`} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      {reg.title}
                    </h4>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {reg.description}
                    </p>
                    <div className="space-y-3 mb-6">
                      {reg.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center justify-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {detail}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Badge
                        variant={reg.status === 'certified' ? 'success' : 'info'}
                        className="text-xs"
                      >
                        {reg.status === 'certified' ? '認証済み' : '準拠'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {reg.certificate}
                      </Badge>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </MotionWrapper>

        {/* Trust Indicators */}
        <MotionWrapper delay={0.3}>
          <div className="mb-20">
            <div className="bg-gradient-to-r from-navy-700 to-navy-600 rounded-3xl p-8 md:p-12 text-white">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
                信頼の証明
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                {trustIndicators.map((indicator, index) => {
                  const Icon = indicator.icon
                  return (
                    <div key={index} className="text-center">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4">
                        <div className="text-3xl font-bold text-white mb-2">
                          {indicator.value}
                        </div>
                        <div className="text-sm font-medium text-navy-600 mb-1">
                          {indicator.label}
                        </div>
                        <div className="flex items-center justify-center">
                          <Icon className="h-5 w-5 text-navy-400" />
                        </div>
                      </div>
                      <p className="text-sm text-navy-600">
                        {indicator.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </MotionWrapper>

        {/* Quality System */}
        <MotionWrapper delay={0.4}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              品質保証システム
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {qualitySystem.map((sys, index) => {
                const Icon = sys.icon
                return (
                  <div key={index} className="relative">
                    <Card className="p-6 h-full hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-navy-600 rounded-xl flex items-center justify-center">
                          <Icon className="h-6 w-6 text-navy-700" />
                        </div>
                        <div className="w-8 h-8 bg-navy-700 text-white rounded-full flex items-center justify-center font-bold">
                          {sys.step}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">
                        {sys.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        {sys.description}
                      </p>
                      <div className="space-y-2">
                        {sys.process.map((process, idx) => (
                          <div key={idx} className="flex items-center text-xs text-gray-700">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {process}
                          </div>
                        ))}
                      </div>
                    </Card>
                    {index < qualitySystem.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-navy-400 transform -translate-y-1/2"></div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </MotionWrapper>

        {/* Compliance Documents */}
        <MotionWrapper delay={0.5}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              法規制準拠証明書・ダウンロード資料
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {complianceDocuments.map((doc, index) => (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg transition-all duration-300"
                >
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
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {doc.size}
                      </div>
                      <div className="text-xs text-gray-400">
                        {doc.format}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {doc.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>プレビュー</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex items-center space-x-2"
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

        {/* Business Support */}
        <MotionWrapper delay={0.6}>
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-3xl p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-6">
                  日本企業向けビジネスサポート
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  日本企業の購買プロセスに合わせた詳細な資料と
                  決裁プロセスを支援する各種資料をご提供します。
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span>内部審査用資料セット</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span>稟議書フォーマット</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span>技術仕様比較表</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span>導入事例詳細資料</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100"
                >
                  詳細資料をダウンロード
                  <Download className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h4 className="text-xl font-bold mb-6 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-navy-500" />
                  導入企業様の声
                </h4>
                <div className="space-y-4">
                  <div className="text-sm">
                    <p className="text-gray-300 italic mb-2">
                      「法規制準拠証明が完備されており、
                      稟議審議がスムーズに進みました」
                    </p>
                    <p className="text-navy-500 text-xs">
                      - 医薬品メーカー 企画部長
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-300 italic mb-2">
                      「品質保証体制が整っていると感じ、
                      長期的なパートナーとして選定」
                    </p>
                    <p className="text-navy-500 text-xs">
                      - 食品メーカー 購買部長
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  )
}