'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import {
  TrendingUp,
  Users,
  Target,
  Award,
  ChevronRight,
  Quote,
  Calendar,
  MapPin,
  Building
} from 'lucide-react'

interface CaseStudySectionProps {
  className?: string
}

export function CaseStudySection({ className = '' }: CaseStudySectionProps) {
  const [selectedCase, setSelectedCase] = useState<number>(0)

  const caseStudies = [
    {
      id: 'case-001',
      company: '株式会社化粧品ジャパン',
      industry: '化粧品製造',
      location: '大阪府',
      date: '2024年1月',
      equipment: '真空乳化撹拌機 (Vacuum Emulsifying Mixer)',
      challenge: '従来の設備では生産能力が限界に達し、品質のばらつきが課題でした。',
      solution: '最新の真空乳化撹拌機を導入し、全自動化プロセスを構築。',
      results: [
        { metric: '300%', description: '生産効率向上' },
        { metric: '99.8%', description: '品質安定化' },
        { metric: '40%', description: '人件費削減' },
        { metric: '50%', description: '不良率削減' }
      ],
      testimonial: '韓国製設備への当初の懸念は、導入後の品質とパフォーマンスで完全に払拭されました。日本のサポート体制も万全で、大変満足しています。',
      testimonialPerson: '製造部長 田中様',
      images: [
        '/images/cases/cosmetic-factory-1.jpg',
        '/images/cases/cosmetic-factory-2.jpg'
      ],
      tags: ['化粧品', '真空乳化', '品質改善', '自動化']
    },
    {
      id: 'case-002',
      company: 'ファーマメディカル株式会社',
      industry: '医薬品製造',
      location: '東京都',
      date: '2023年11月',
      equipment: '錠剤包装機 (Tablet Packaging Machine)',
      challenge: 'GMP基準の厳格な要求に対応できる包装設備が必要でした。',
      solution: 'GMP準拠の錠剤包装機を導入し、トレーサビリティシステムを統合。',
      results: [
        { metric: '100%', description: 'GMP基準適合' },
        { metric: '250%', description: '包装速度向上' },
        { metric: '0', description: '品質チェックエラー' },
        { metric: '24時間', description: '連続運転可能' }
      ],
      testimonial: '医薬品製造に不可欠な信頼性と正確性を両立した設備です。導入から1年、トラブルゼロで運用できています。',
      testimonialPerson: '品質保証部長 山田様',
      images: [
        '/images/cases/pharma-packaging-1.jpg',
        '/images/cases/pharma-packaging-2.jpg'
      ],
      tags: ['医薬品', 'GMP', '錠剤包装', '信頼性']
    },
    {
      id: 'case-003',
      company: 'フードテック株式会社',
      industry: '食品製造',
      location: '愛知県',
      date: '2024年3月',
      equipment: 'チューブ充填シーリング機 (Tube Filling & Sealing Machine)',
      challenge: '多種多様な製品を柔軟に対応できる充填システムが必要でした。',
      solution: 'マルチ対応の充填シーリング機を導入し、段取り替え時間を大幅短縮。',
      results: [
        { metric: '15分', description: '段取り替え時間' },
        { metric: '200%', description: '生産品種数増加' },
        { metric: '85%', description: '段取り替え工数削減' },
        { metric: '99.5%', description: '充填精度' }
      ],
      testimonial: '1台で多品種に対応できるため、設備投資を抑えつつ生産性を向上できました。メンテナンスも簡単で重宝しています。',
      testimonialPerson: '工場長 佐藤様',
      images: [
        '/images/cases/food-filling-1.jpg',
        '/images/cases/food-filling-2.jpg'
      ],
      tags: ['食品', '多品種対応', '生産性向上', '柔軟性']
    }
  ]

  const stats = [
    {
      number: '150+',
      label: '導入実績',
      description: '日本国内の導入企業様'
    },
    {
      number: '98%',
      label: '顧客満足度',
      description: '導入後の満足度評価'
    },
    {
      number: '24時間',
      label: 'サポート体制',
      description: '365日対応可能'
    },
    {
      number: '15業界',
      label: '対応業界',
      description: '様々な産業に対応'
    }
  ]

  const currentCase = caseStudies[selectedCase]

  return (
    <section className={`py-16 lg:py-24 bg-gray-50 ${className}`}>
      <Container size="6xl">
        {/* Section Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              導入事例
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              実際に韓国産業機器を導入された企業様の成功事例。
              どのような課題を解決し、どのような成果を出したかをご紹介します。
            </p>
          </div>
        </MotionWrapper>

        {/* Success Stats */}
        <MotionWrapper delay={0.2}>
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl md:text-4xl font-bold text-navy-700 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </MotionWrapper>

        {/* Case Study Selector */}
        <MotionWrapper delay={0.3}>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {caseStudies.map((caseStudy, index) => (
              <Button
                key={caseStudy.id}
                variant={selectedCase === index ? "primary" : "outline"}
                size="lg"
                onClick={() => setSelectedCase(index)}
                className="px-6 py-3"
              >
                {caseStudy.industry}
              </Button>
            ))}
          </div>
        </MotionWrapper>

        {/* Main Case Study */}
        <MotionWrapper delay={0.4}>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Case Study Header */}
            <div className="bg-gradient-to-r from-navy-700 to-navy-600 text-white p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <Building className="h-5 w-5" />
                    <span className="text-navy-600">{currentCase.industry}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">
                    {currentCase.company}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-navy-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{currentCase.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{currentCase.date}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 md:mt-0">
                  <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2 text-sm">
                    {currentCase.equipment}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Case Study Content */}
            <div className="p-8 md:p-12">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Left Column - Story */}
                <div className="space-y-8">
                  {/* Challenge */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Target className="h-5 w-5 text-red-500 mr-2" />
                      課題
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {currentCase.challenge}
                    </p>
                  </div>

                  {/* Solution */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                      ソリューション
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {currentCase.solution}
                    </p>
                  </div>

                  {/* Testimonial */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <Quote className="h-8 w-8 text-navy-600 mb-4" />
                    <blockquote className="text-gray-700 leading-relaxed mb-4">
                      {currentCase.testimonial}
                    </blockquote>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-navy-600 rounded-full flex items-center justify-center mr-3">
                        <Users className="h-6 w-6 text-navy-700" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {currentCase.testimonialPerson}
                        </div>
                        <div className="text-sm text-gray-600">
                          {currentCase.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Results & Images */}
                <div className="space-y-8">
                  {/* Results */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Award className="h-5 w-5 text-yellow-500 mr-2" />
                      成果
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {currentCase.results.map((result, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-navy-700 mb-1">
                            {result.metric}
                          </div>
                          <div className="text-sm text-gray-600">
                            {result.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-6">
                      導入現場の様子
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {currentCase.images.map((image, index) => (
                        <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                          <Image
                            src={image}
                            alt={`${currentCase.company} - 導入事例${index + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {currentCase.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionWrapper>

        {/* Other Cases */}
        <MotionWrapper delay={0.5}>
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
              その他の導入事例
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {caseStudies.map((caseStudy, index) => (
                <Card
                  key={caseStudy.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedCase(index)}
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                    <Image
                      src={caseStudy.images[0]}
                      alt={caseStudy.company}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge variant="secondary" className="mb-2">
                        {caseStudy.industry}
                      </Badge>
                      <h4 className="text-white font-bold text-lg">
                        {caseStudy.company}
                      </h4>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-gray-600 mb-3">
                      {caseStudy.equipment}
                    </div>
                    <div className="flex items-center text-navy-700 font-medium group-hover:text-navy-600 transition-colors">
                      詳細を見る
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </MotionWrapper>

        {/* CTA */}
        <MotionWrapper delay={0.6}>
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-navy-700 to-navy-600 rounded-2xl p-8 md:p-12 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                次はお客様の番です
              </h3>
              <p className="text-navy-600 mb-8 max-w-2xl mx-auto text-lg">
                同じような課題を抱えていませんか？専門家が無料で相談に乗ります。
                お気軽にお問い合わせください。
              </p>
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-navy-700 hover:bg-gray-50 px-8 py-3 font-semibold"
              >
                無料相談を申し込む
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  )
}