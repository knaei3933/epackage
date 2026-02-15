'use client'

import React from 'react'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { Button } from '@/components/ui/Button'
import {
  TrendingUp,
  Award,
  Globe,
  Users,
  Settings,
  Shield,
  Clock,
  Target,
  ArrowRight
} from 'lucide-react'

interface WhyKoreaSectionProps {
  className?: string
}

export function WhyKoreaSection({ className = '' }: WhyKoreaSectionProps) {
  const benefits = [
    {
      icon: TrendingUp,
      title: '技術革新',
      description: '世界トップレベルの技術力と革新的なソリューション。常に最新技術を取り入れ、生産性の向上を支援します。',
      color: 'text-navy-700',
      bgColor: 'bg-navy-50'
    },
    {
      icon: Award,
      title: '優れた品質',
      description: '厳格な品質管理体制と国際基準認証。日本の品質基準を満たす高品質な設備を提供します。',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Globe,
      title: '世界的な実績',
      description: 'グローバルな供給実績と信頼性。世界各国の企業様に採用されている実績と信頼があります。',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  const advantages = [
    {
      icon: Users,
      title: '日本語完全対応',
      description: '現地日本人スタッフによる丁寧なサポート。言語の壁なく、スムーズなコミュニケーションを実現します。',
      features: ['技術相談', '設置サポート', 'メンテナンス対応', 'トレーニング']
    },
    {
      icon: Settings,
      title: 'カスタマイズ対応',
      description: 'お客様のニーズに合わせたオーダーメイド設計。生産ラインに最適な仕様で機器を提供します。',
      features: ['仕様変更', '機能追加', 'サイズ調整', 'オプション対応']
    },
    {
      icon: Shield,
      title: 'アフターサポート',
      description: '充実した保守・サポート体制。急なトラブルにも迅速対応し、生産停止を最小限に抑えます。',
      features: ['24時間365日対応', '予防保全', '緊急修理', '遠隔サポート']
    }
  ]

  const competitiveEdge = [
    {
      metric: '40%',
      label: 'コスト削減',
      description: '日本製より高コストパフォーマンス'
    },
    {
      metric: '3ヶ月',
      label: '短納期',
      description: '日本製より迅速な納品'
    },
    {
      metric: '15年',
      label: '信頼性',
      description: '長寿命・低メンテナンス設計'
    },
    {
      metric: '99%',
      label: '満足度',
      description: '顧客満足度実績'
    }
  ]

  return (
    <section className={`py-16 lg:py-24 bg-white ${className}`}>
      <Container size="6xl">
        {/* Section Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              なぜ韓国設備が選ばれるか？
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              技術力、品質、コストパフォーマンスの絶妙なバランス。
              韓国産業機器が世界で選ばれる理由をご紹介します。
            </p>
          </div>
        </MotionWrapper>

        {/* Core Benefits */}
        <MotionWrapper delay={0.2}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              韓国設備の核心的メリット
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <Card
                    key={index}
                    className="text-center p-8 border-2 border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-navy-600"
                  >
                    <div className={`w-20 h-20 ${benefit.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <Icon className={`h-10 w-10 ${benefit.color}`} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </Card>
                )
              })}
            </div>
          </div>
        </MotionWrapper>

        {/* Competitive Edge */}
        <MotionWrapper delay={0.3}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              数字で見る韓国設備の強み
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              {competitiveEdge.map((edge, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gradient-to-br from-navy-700 to-navy-600 text-white rounded-2xl p-6 mb-4">
                    <div className="text-3xl md:text-4xl font-bold mb-2">
                      {edge.metric}
                    </div>
                    <div className="text-sm font-medium">
                      {edge.label}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {edge.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </MotionWrapper>

        {/* Support Advantages */}
        <MotionWrapper delay={0.4}>
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              日本向け独自のサポート体制
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {advantages.map((advantage, index) => {
                const Icon = advantage.icon
                return (
                  <Card
                    key={index}
                    className="p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-navy-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-navy-700" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-3">
                          {advantage.title}
                        </h4>
                        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                          {advantage.description}
                        </p>
                        <div className="space-y-2">
                          {advantage.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 bg-navy-500 rounded-full mr-2"></div>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </MotionWrapper>

        {/* Quality Assurance */}
        <MotionWrapper delay={0.5}>
          <div className="bg-gradient-to-r from-gray-50 to-navy-50 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  品質保証へのこだわり
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">ISO 9001 認証取得</div>
                      <div className="text-sm text-gray-600">国際品質基準の完全準拠</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-navy-600 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-navy-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">厳格な検品体制</div>
                      <div className="text-sm text-gray-600">出荷前の完全品質検査</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">長期保証体制</div>
                      <div className="text-sm text-gray-600">安心のアフターサポート</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h4 className="text-lg font-bold text-gray-900 mb-6">
                  導入までの流れ
                </h4>
                <div className="space-y-4">
                  {[
                    'ご相談・ヒアリング',
                    '仕様確定・お見積り',
                    '製造・品質検査',
                    '輸送・設置',
                    '操作トレーニング',
                    'アフターサポート開始'
                  ].map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-navy-700 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </MotionWrapper>

        {/* CTA Section */}
        <MotionWrapper delay={0.6}>
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-navy-700 to-navy-600 rounded-2xl p-8 md:p-12 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                韓国設備導入を検討されませんか？
              </h3>
              <p className="text-navy-600 mb-8 max-w-2xl mx-auto text-lg">
                専門スタッフがお客様のニーズに合わせて最適なソリューションをご提案します。
                お気軽にお問い合わせください。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-navy-700 hover:bg-gray-50 px-8 py-3 font-semibold"
                >
                  無料ご相談はこちら
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-navy-700 px-8 py-3 font-semibold"
                >
                  資料請求
                </Button>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  )
}