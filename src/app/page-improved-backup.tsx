'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Package, Zap, Shield, Globe } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Grid, GridItem } from '@/components/ui/Grid'
import { Card } from '@/components/ui/Card'

// Enhanced Hero Section Component
function HeroSection() {
  const { tn } = useTranslation()

  return (
    <section className="relative overflow-hidden gradient-hero">
      <Container size="6xl" className="relative z-10 py-20 lg:py-32">
        <Grid cols={1} xs={1} lg={2} gap="xl" align="center">
          <GridItem className="animate-fade-in-up">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-tight japanese-text text-shadow-premium">
                  {tn('header', 'tagline')}
                </h1>
                <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  {tn('header', 'description')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link href="/contact" className="inline-flex">
                  <Button
                    variant="primary"
                    size="lg"
                    className="btn-premium justify-center group hover-lift"
                  >
                    {tn('header', 'cta')}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/services" className="inline-flex">
                  <Button
                    variant="outline"
                    size="lg"
                    className="justify-center hover-lift focus-premium"
                  >
                    サービスを見る
                  </Button>
                </Link>
              </div>

              {/* Enhanced Trust Indicators */}
              <div className="flex items-center space-x-8 pt-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center space-x-2 group hover-lift">
                  <div className="p-2 rounded-lg bg-success-50 group-hover:bg-success-100 transition-colors">
                    <Shield className="h-5 w-5 text-success-500" />
                  </div>
                  <span className="text-sm font-medium text-text-secondary">安心保証</span>
                </div>
                <div className="flex items-center space-x-2 group hover-lift">
                  <div className="p-2 rounded-lg bg-briixa-50 group-hover:bg-briixa-100 transition-colors">
                    <Globe className="h-5 w-5 text-briixa-600" />
                  </div>
                  <span className="text-sm font-medium text-text-secondary">全球対応</span>
                </div>
                <div className="flex items-center space-x-2 group hover-lift">
                  <div className="p-2 rounded-lg bg-warning-50 group-hover:bg-warning-100 transition-colors">
                    <Zap className="h-5 w-5 text-warning-500" />
                  </div>
                  <span className="text-sm font-medium text-text-secondary">迅速納品</span>
                </div>
              </div>
            </div>
          </GridItem>

          <GridItem className="relative animate-slide-in-right">
            <div className="relative">
              {/* Enhanced Hero Image */}
              <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden card-premium p-8 flex items-center justify-center hover-lift">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="relative z-10">
                  <Package className="h-32 w-32 text-briixa-300" />
                  <div className="text-center mt-4">
                    <p className="text-briixa-600 font-semibold">パッケージングの未来</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 border border-border-medium card-premium animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 bg-success-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-text-primary">プロジェクト完了</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-6 border border-border-medium card-premium animate-fade-in-up" style={{ animationDelay: '1s' }}>
                <div className="text-center">
                  <div className="text-3xl font-bold text-brixa-600">99%</div>
                  <div className="text-sm text-text-secondary font-medium">顧客満足度</div>
                </div>
              </div>
            </div>
          </GridItem>
        </Grid>
      </Container>

      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-grid-pattern"></div>
        <div className="absolute inset-0 bg-dots-pattern"></div>
      </div>
    </section>
  )
}

// Enhanced Features Section Component
function FeaturesSection() {
  const features = [
    {
      icon: Package,
      title: 'パッケージデザイン',
      description: 'ブランド価値を高める革新的なパッケージデザインを提供します。最新のトレンドと技術を融合し、お客様の製品を際立たせます。',
      color: 'text-briixa-600',
      bgColor: 'bg-briixa-50',
    },
    {
      icon: Zap,
      title: '迅速な納品',
      description: '最短24時間で対応可能な迅速な生産・納品体制。国内外のどこへでも、高品質な製品をお届けします。',
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      icon: Shield,
      title: '品質保証',
      description: '厳格な品質管理基準による信頼性の高い製品提供。ISO認証取得の工場で一貫した品質を実現します。',
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      icon: Globe,
      title: '全球対応',
      description: '世界中のクライアントに対応する国際的なサービスネットワーク。多言語サポートで円滑なコミュニケーションを保証します。',
      color: 'text-info-600',
      bgColor: 'bg-info-50',
    },
  ]

  return (
    <section className="py-20 bg-bg-secondary section-premium">
      <Container size="6xl">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6 japanese-heading text-shadow-premium">
            なぜ Epackage Lab なのか
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed">
            最新技術と豊富な経験で、お客様のニーズに最適なパッケージングソリューションを提供します。
            品質、速度、 innovation で業界をリードし続けます。
          </p>
        </div>

        <div className="section-divider"></div>

        <Grid cols={1} xs={1} md={2} lg={4} gap="lg">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                variant="default"
                className={`card-premium p-8 text-center hover-lift group animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-20 h-20 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-10 w-10 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-4 japanese-heading">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            )
          })}
        </Grid>
      </Container>
    </section>
  )
}

// Enhanced CTA Section Component
function CTASection() {
  const { tn } = useTranslation()

  return (
    <section className="py-20 gradient-cta relative overflow-hidden">
      <Container size="4xl" className="text-center relative z-10">
        <div className="space-y-8 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow-strong japanese-heading">
            次のプロジェクトを始めましょう
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            無料相談をご利用いただき、どのようにお客様のビジネスを支援できるか見つけましょう。
            専門家が最適なソリューションをご提案します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex">
              <Button
                variant="secondary"
                size="lg"
                className="btn-premium justify-center bg-white text-brixa-600 hover:bg-gray-50 hover-lift group"
              >
                {tn('header', 'cta')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/portfolio" className="inline-flex">
              <Button
                variant="outline"
                size="lg"
                className="justify-center border-white text-white hover:bg-white hover:text-brixa-600 hover-lift focus-premium"
              >
                事例を見る
              </Button>
            </Link>
          </div>
        </div>
      </Container>

      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
      </div>
    </section>
  )
}

// Enhanced Main Home Page Component
export default function Home() {
  return (
    <Layout>
      <div className="min-h-screen">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </div>
    </Layout>
  )
}