'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { CurrencyBadge } from '@/components/ui/Badge'
import Link from 'next/link'
import {
  TrendingUp,
  Package,
  Users,
  Crown,
  CheckCircle,
  ArrowRight,
  Calculator,
  Star
} from 'lucide-react'

// Investment tiers based on the pricing guidelines
const investmentTiers = [
  {
    id: 1,
    tier: 'スタートアップ',
    tierEn: 'Startup',
    amount: 50000,
    currency: 'JPY',
    icon: Package,
    features: [
      '最小ロット：1,000枚',
      '標準デザインオプション',
      '納期：2-3週間',
      'メールサポート',
      '基本品質保証'
    ],
    badge: 'スターターパック',
    badgeVariant: 'secondary' as const,
    recommended: false,
    description: '小規模ビジネスや新製品ローンチに最適'
  },
  {
    id: 2,
    tier: 'ビジネス',
    tierEn: 'Business',
    amount: 200000,
    currency: 'JPY',
    icon: Users,
    features: [
      '最小ロット：5,000枚',
      'カスタムデザイン対応',
      '納期：2週間',
      '優先サポート',
      '拡張品質保証'
    ],
    badge: '人気選択',
    badgeVariant: 'success' as const,
    recommended: true,
    description: '成長中のビジネスに最適なコストパフォーマンス'
  },
  {
    id: 3,
    tier: 'エンタープライズ',
    tierEn: 'Enterprise',
    amount: 1000000,
    currency: 'JPY',
    icon: Crown,
    features: [
      '最小ロット：20,000枚',
      '完全カスタム設計',
      '納期：1-2週間',
      '専任担当者サポート',
      'プレミアム品質保証'
    ],
    badge: 'プレミアム',
    badgeVariant: 'metallic' as const,
    recommended: false,
    description: '大規模ビジネス向けの完全ソリューション'
  },
  {
    id: 4,
    tier: 'プレミアム',
    tierEn: 'Premium',
    amount: 5000000,
    currency: 'JPY',
    icon: Star,
    features: [
      '最小ロット：50,000枚',
      '独自金型開発対応',
      '最短納期：1週間',
      '24時間365日対応',
      '完全保証付き'
    ],
    badge: '要相談',
    badgeVariant: 'warning' as const,
    recommended: false,
    description: '特別プロジェクト・独占契約向け'
  }
]

const additionalBenefits = [
  {
    icon: CheckCircle,
    title: 'コスト透明性',
    description: 'すべての費用を事前に詳細提示。追加料金なし。'
  },
  {
    icon: TrendingUp,
    title: 'スケーラビリティ',
    description: '事業成長に合わせた段階的な価格設定。'
  },
  {
    icon: Package,
    title: '品質保証',
    description: '納品後も完全な品質サポートを提供。'
  }
]

export function PremiumPricingGuide() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <Container size="6xl">
        {/* Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-navy-700 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              <span>投資規模の目安</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              事業規模に合わせた最適なプラン
              <span className="block text-navy-700 mt-2">透明性の高い価格設定</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              スタートアップから大企業まで、あらゆる事業規模に対応した柔軟な価格設定をご用意。
              コストパフォーマンスと品質のバランスを最適化します。
            </p>
          </div>
        </MotionWrapper>

        {/* Investment Tiers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {investmentTiers.map((tier, index) => (
            <MotionWrapper key={tier.id} delay={0.2 + index * 0.1}>
              <Card className={`relative h-full transition-all duration-300 hover:shadow-2xl ${
                tier.recommended
                  ? 'ring-2 ring-brixa-600 ring-offset-4 bg-gradient-to-b from-brixa-50 to-white'
                  : 'bg-white'
              }`}>
                {/* Recommended Badge */}
                {tier.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge variant="success" className="px-4 py-2 font-semibold shadow-lg">
                      最人気選択
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    tier.recommended
                      ? 'bg-gradient-to-br from-brixa-600 to-brixa-700 text-white'
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                  }`}>
                    <tier.icon className="w-8 h-8" />
                  </div>

                  {/* Tier Name */}
                  <CardTitle className="text-xl font-bold text-gray-900 mb-1">
                    {tier.tier}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mb-3">{tier.tierEn}</p>

                  {/* Badge */}
                  <Badge variant={tier.badgeVariant} size="sm" className="mb-4">
                    {tier.badge}
                  </Badge>

                  {/* Price */}
                  <div className="text-center mb-4">
                    <CurrencyBadge
                      amount={tier.amount}
                      currency={tier.currency as "JPY" | "KRW" | "USD"}
                      size="lg"
                      className="justify-center"
                    />
                    <p className="text-xs text-gray-500 mt-2">最小注文より</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  <p className="text-sm text-gray-600 text-center">
                    {tier.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    {tier.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link href="/contact" className="block">
                    <Button
                      variant={tier.recommended ? "primary" : "outline"}
                      className="w-full justify-center font-medium"
                      size="sm"
                    >
                      {tier.id === 4 ? '詳細相談' : 'このプランで相談'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </MotionWrapper>
          ))}
        </div>

        {/* Additional Benefits */}
        <MotionWrapper delay={0.6}>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {additionalBenefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300 bg-white">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-navy-600 to-navy-600 rounded-full flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-navy-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </MotionWrapper>

        {/* CTA Section */}
        <MotionWrapper delay={0.7}>
          <Card className="bg-gradient-to-r from-navy-700 to-purple-600 text-white p-8 md:p-12 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold">
                正確なお見積もりを無料でご提供
              </h3>
              <p className="text-lg text-white/90 leading-relaxed">
                製品仕様、数量、納期をお聞かせください。
                業界最安水準の価格で高品質な包装材をご提案します。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="justify-center bg-white text-navy-700 hover:bg-gray-50 font-medium px-8"
                  >
                    <Calculator className="mr-2 h-5 w-5" />
                    無料お見積もり
                  </Button>
                </Link>
                <Link href="/catalog">
                  <Button
                    variant="outline"
                    size="lg"
                    className="justify-center border-white text-white hover:bg-white hover:text-navy-700 font-medium px-8"
                  >
                    <Package className="mr-2 h-5 w-5" />
                    価格例を見る
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </MotionWrapper>
      </Container>
    </section>
  )
}