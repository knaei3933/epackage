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
  Search,
  ClipboardCheck,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  Globe
} from 'lucide-react'

interface QualitySectionProps {
  className?: string
}

export function QualitySection({ className = '' }: QualitySectionProps) {
  const qualityPrinciples = [
    {
      icon: Target,
      title: '品質第一主義',
      description: 'すべての工程で品質を最優先。妥協のない品質管理を実現します。',
      details: ['国際品質基準', '工程管理', '継続的改善']
    },
    {
      icon: Shield,
      title: '徹底した検査体制',
      description: '多段階にわたる品質検査で、完璧な製品をお届けします。',
      details: ['入荷検査', '工程検査', '出荷検査', '品質記録']
    },
    {
      icon: TrendingUp,
      title: '継続的改善',
      description: '常に改善を追求し、品質と効率の向上を続けます。',
      details: ['PDCAサイクル', '顧客フィードバック', '技術革新']
    }
  ]

  const inspectionProcess = [
    {
      step: 1,
      title: '設計段階',
      description: '設計品質の確保',
      checks: ['設計レビュー', 'FMEA分析', '品質要求定義'],
      icon: Search
    },
    {
      step: 2,
      title: '部材調達',
      description: 'サプライヤー品質管理',
      checks: ['サプライヤー監査', '入荷検査', '材料証明書'],
      icon: CheckCircle
    },
    {
      step: 3,
      title: '製造工程',
      description: '工程内品質管理',
      checks: ['工程能力評価', '中間検査', '作業標準化'],
      icon: Users
    },
    {
      step: 4,
      title: '最終検査',
      description: '製品品質保証',
      checks: ['機能試験', '外観検査', '文書確認'],
      icon: ClipboardCheck
    }
  ]

  const qualityMetrics = [
    {
      metric: '99.8%',
      label: '品質合格率',
      description: '厳格な検査基準をクリア',
      trend: 'up'
    },
    {
      metric: '0.2%',
      label: 'クレーム率',
      description: '業界トップクラスの低クレーム率',
      trend: 'down'
    },
    {
      metric: '24時間',
      label: '問題解決時間',
      description: '迅速な問題対応体制',
      trend: 'stable'
    },
    {
      metric: '100%',
      label: '検査記録保存',
      description: '完全なトレーサビリティ',
      trend: 'up'
    }
  ]

  const certifications = [
    {
      name: '食品安全規格',
      description: '日本の食品安全基準に対応',
      icon: Shield,
      status: 'active'
    },
    {
      name: '品質管理体制',
      description: '体系的な品質管理プロセス',
      icon: Award,
      status: 'active'
    },
    {
      name: '食品衛生法',
      description: '食品衛生法対応',
      icon: CheckCircle,
      status: 'compliant'
    },
    {
      name: '薬機法',
      description: '医薬品機器法対応',
      icon: ClipboardCheck,
      status: 'compliant'
    }
  ]

  const qualityTools = [
    {
      tool: '統計的工程管理(SPC)',
      description: 'データに基づく工程管理と異常検知'
    },
    {
      tool: '故障モード影響解析(FMEA)',
      description: '潜在的な問題の予防とリスク評価'
    },
    {
      tool: '測定システム分析(MSA)',
      description: '測定システムの信頼性評価'
    },
    {
      tool: '品質機能展開(QFD)',
      description: '顧客要求の製品開発への反映'
    },
    {
      tool: 'シックスシグマ',
      description: 'データ駆動型の品質改善手法'
    },
    {
      tool: 'リーン生産方式',
      description: '無駄の排除と効率化'
    }
  ]

  return (
    <section className={`py-16 lg:py-24 bg-white ${className}`}>
      <Container size="6xl">
        {/* Section Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              厳格な品質管理
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              品質はすべての基本。国際基準を満たす品質管理体制で、
              お客様に安心と信頼をお届けします。
            </p>
          </div>
        </MotionWrapper>

        {/* Quality Principles */}
        <MotionWrapper delay={0.2}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              品質管理の基本原則
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {qualityPrinciples.map((principle, index) => {
                const Icon = principle.icon
                return (
                  <Card
                    key={index}
                    className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-navy-600"
                  >
                    <div className="w-16 h-16 bg-navy-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-8 w-8 text-navy-700" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      {principle.title}
                    </h4>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {principle.description}
                    </p>
                    <div className="space-y-2">
                      {principle.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center justify-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {detail}
                        </div>
                      ))}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </MotionWrapper>

        {/* Quality Metrics */}
        <MotionWrapper delay={0.3}>
          <div className="mb-20">
            <div className="bg-gradient-to-r from-navy-50 to-navy-600 rounded-3xl p-8 md:p-12">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
                品質パフォーマンス
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                {qualityMetrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                      <div className="text-3xl font-bold text-navy-700 mb-2">
                        {metric.metric}
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {metric.label}
                      </div>
                      <div className="flex items-center justify-center">
                        {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {metric.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                        {metric.trend === 'stable' && <div className="h-4 w-4 bg-navy-600 rounded-full" />}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {metric.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MotionWrapper>

        {/* Inspection Process */}
        <MotionWrapper delay={0.4}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              品質検査プロセス
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {inspectionProcess.map((process, index) => {
                const Icon = process.icon
                return (
                  <div key={index} className="relative">
                    <Card className="p-6 h-full hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-navy-600 rounded-xl flex items-center justify-center">
                          <Icon className="h-6 w-6 text-navy-700" />
                        </div>
                        <div className="w-8 h-8 bg-navy-700 text-white rounded-full flex items-center justify-center font-bold">
                          {process.step}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">
                        {process.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        {process.description}
                      </p>
                      <div className="space-y-2">
                        {process.checks.map((check, idx) => (
                          <div key={idx} className="flex items-center text-xs text-gray-700">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {check}
                          </div>
                        ))}
                      </div>
                    </Card>
                    {index < inspectionProcess.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-navy-400 transform -translate-y-1/2"></div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </MotionWrapper>

        {/* Certifications */}
        <MotionWrapper delay={0.5}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              品質認証と規格
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {certifications.map((cert, index) => {
                const Icon = cert.icon
                return (
                  <Card
                    key={index}
                    className="p-6 text-center hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`w-16 h-16 ${
                      cert.status === 'active' ? 'bg-green-100' :
                      cert.status === 'compliant' ? 'bg-navy-600' : 'bg-gray-100'
                    } rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`h-8 w-8 ${
                        cert.status === 'active' ? 'text-green-600' :
                        cert.status === 'compliant' ? 'text-navy-700' : 'text-gray-600'
                      }`} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {cert.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {cert.description}
                    </p>
                    {cert.status === 'active' && (
                      <Badge variant="success" className="mt-3 text-xs">
                        認証済み
                      </Badge>
                    )}
                    {cert.status === 'compliant' && (
                      <Badge variant="info" className="mt-3 text-xs">
                        準拠
                      </Badge>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        </MotionWrapper>

        {/* Quality Tools */}
        <MotionWrapper delay={0.6}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              品質管理ツール
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qualityTools.map((tool, index) => (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-navy-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="h-5 w-5 text-navy-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">
                        {tool.tool}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </MotionWrapper>

        {/* Quality Commitment */}
        <MotionWrapper delay={0.7}>
          <div className="bg-gradient-to-r from-navy-700 to-navy-600 rounded-3xl p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-6">
                  品質への誓い
                </h3>
                <div className="space-y-4">
                  <p className="text-navy-600 leading-relaxed">
                    私たちは品質を単なる基準としてではなく、
                    お客様への約束として捉えています。
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span>妥協のない品質追求</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span>透明性の高い品質管理</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span>継続的な品質改善</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span>お客様満足度の最大化</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h4 className="text-xl font-bold mb-6 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-400" />
                  品質問題報告
                </h4>
                <p className="text-navy-600 mb-6">
                  品質に関するご懸念や問題を発見された場合、
                  速やかに対応いたします。
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-navy-700 hover:bg-gray-50 w-full"
                >
                  品質担当者に連絡
                  <Clock className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  )
}