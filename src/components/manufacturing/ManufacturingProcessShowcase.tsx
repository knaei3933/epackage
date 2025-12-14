'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import {
  Zap,
  Shield,
  Settings,
  CheckCircle,
  Cpu,
  Palette
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ProcessStep {
  id: string
  title: string
  titleJa: string
  description: string
  descriptionJa: string
  image: string
  icon: React.ReactNode
  features: string[]
  featuresJa: string[]
  technical: string[]
  technicalJa: string[]
}

const manufacturingSteps: ProcessStep[] = [
  {
    id: 'digital-printing',
    title: 'Digital Printing Technology',
    titleJa: 'デジタル印刷技術',
    description: 'On-demand digital printing with no plate costs, ideal for small lot production',
    descriptionJa: '版代不要、小ロット生産に最適なオンデマンドデジタル印刷',
    image: '/images/flow/process-1-digital-printing.png',
    icon: <Palette className="w-6 h-6" />,
    features: [
      'No plate costs required',
      'Small lot production from 1 piece',
      'Cost-effective for short runs',
      'Quick turnaround time'
    ],
    featuresJa: [
      '版代不要',
      '1個単位からの小ロット生産',
      '短い納期でコスト削減',
      '迅速な生産対応'
    ],
    technical: [
      'Equipment: HP Indigo 25000',
      'Print width: Up to 750mm',
      'Variable data printing',
      '720 x 720 dpi resolution'
    ],
    technicalJa: [
      '設備: HP Indigo 25000',
      '印刷幅: 最大750mm',
      '可変データ印刷対応',
      '解像度: 720 x 720 dpi'
    ]
  },
  {
    id: 'eco-manufacturing',
    title: 'Eco-Friendly Manufacturing',
    titleJa: '環境配慮型製造',
    description: 'Sustainable manufacturing process using NON-VOC, solvent-free technology',
    descriptionJa: 'NON-VOC、溶剤フリー技術による環境に優しいサスティナブル製造プロセス',
    image: '/images/flow/process-2-laminating.png',
    icon: <Shield className="w-6 h-6" />,
    features: [
      'NON-VOC compliant',
      'Solvent-free process',
      'Reduced environmental impact',
      'Sustainable materials'
    ],
    featuresJa: [
      'NON-VOC対応',
      '溶剤フリー製造',
      '環境負荷低減',
      'サスティナブル素材'
    ],
    technical: [
      'Equipment: NORDMECCNICA Simplex SL',
      'Zero VOC emissions',
      'Energy efficient operation',
      'Green manufacturing certified'
    ],
    technicalJa: [
      '設備: NORDMECCNICA Simplex SL',
      'VOC排出ゼロ',
      '省エネルギー運用',
      'グリーン製造認証'
    ]
  },
  {
    id: 'precision-processing',
    title: 'High-Precision Processing',
    titleJa: '高精度加工技術',
    description: 'Advanced precision processing equipment ensuring perfect product specifications',
    descriptionJa: '完璧な製品仕様を保証する最先端の高精度加工設備',
    image: '/images/flow/process-3-slitting.png',
    icon: <Settings className="w-6 h-6" />,
    features: [
      'Micron-level accuracy',
      'Consistent quality',
      'Complex shape processing',
      'Automated quality control'
    ],
    featuresJa: [
      'ミクロン単位の精度',
      '均一な品質',
      '複雑形状の加工',
      '自動品質管理'
    ],
    technical: [
      'Slitting: KARLVILLE SLIT-HS-Classic-1300',
      'Bag making: TOTANI BH-60DLLC',
      'Processing accuracy: ±0.05mm',
      'Production speed: 200 pieces/min'
    ],
    technicalJa: [
      'スリッター: KARLVILLE SLIT-HS-Classic-1300',
      '製袋機: TOTANI BH-60DLLC',
      '加工精度: ±0.05mm',
      '生産速度: 200個/分'
    ]
  },
  {
    id: 'integrated-production',
    title: 'Integrated Production Line',
    titleJa: '一貫生産システム',
    description: 'Complete in-house production from printing to processing ensuring quality control',
    descriptionJa: '印刷から加工まで完全自社工場で一貫管理し品質を保証',
    image: '/images/flow/process-4-pouch-forming.jpg',
    icon: <Cpu className="w-6 h-6" />,
    features: [
      'End-to-end in-house production',
      'Strict quality control',
      'Fast lead times',
      'Flexible production planning'
    ],
    featuresJa: [
      '印刷から加工まで完全内製化',
      '厳格な品質管理',
      '短リードタイム',
      '柔軟な生産計画'
    ],
    technical: [
      'Complete production integration',
      'Quality assurance at each stage',
      '30-day standard delivery',
      'Custom specification support'
    ],
    technicalJa: [
      '生産プロセス完全統合',
      '各工程での品質保証',
      '標準納期30日',
      '特注仕様に対応'
    ]
  }
]

interface ManufacturingProcessShowcaseProps {
  language?: 'en' | 'ja'
}

export function ManufacturingProcessShowcase({
  language = 'ja'
}: ManufacturingProcessShowcaseProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <Container size="6xl">
        {/* Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-brixa-100 text-brixa-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Cpu className="w-4 h-4" />
              <span>{language === 'ja' ? '最新鋭技術による高品質製造' : 'Advanced High-Quality Manufacturing'}</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              {language === 'ja' ? (
                <>
                  <span className="text-brixa-600">品質と信頼性</span>
                  <span className="block text-lg md:text-xl text-gray-600 mt-4">
                    印刷から加工までの一貫サービスで最高品質を実現
                  </span>
                </>
              ) : (
                <>
                  Japanese <span className="text-brixa-600">Quality & Reliability</span>
                  <span className="block text-lg md:text-xl text-gray-600 mt-4">
                    End-to-end service from printing to processing
                  </span>
                </>
              )}
            </h2>

            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {language === 'ja'
                ? '最新鋭設備と熟練の技術者が、最高品質の包装材を製造します。印刷、ラミネート、加工まで一貫した管理体制で、お客様のニーズに最適なソリューションを提供します。'
                : 'State-of-the-art equipment and skilled technicians produce the highest quality packaging materials. Our integrated management system from printing to processing delivers optimal solutions for your needs.'
              }
            </p>
          </div>
        </MotionWrapper>

        {/* Process Steps */}
        <div className="space-y-16 mb-16">
          {manufacturingSteps.map((step, index) => (
            <MotionWrapper key={step.id} delay={0.2 + index * 0.1}>
              <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-brixa-600 rounded-lg flex items-center justify-center text-white">
                        {step.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {language === 'ja' ? step.titleJa : step.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      {language === 'ja' ? step.descriptionJa : step.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {(language === 'ja' ? step.featuresJa : step.features).map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Technical Specifications */}
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-brixa-600" />
                        {language === 'ja' ? '技術仕様' : 'Technical Specifications'}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {(language === 'ja' ? step.technicalJa : step.technical).map((spec, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-brixa-600 rounded-full mt-2"></div>
                            <span className="text-sm text-gray-600">{spec}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Image */}
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <Card className="overflow-hidden shadow-2xl">
                    <div className="relative aspect-[4/3] bg-gray-100">
                      <Image
                        src={step.image}
                        alt={language === 'ja' ? step.titleJa : step.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Fallback for missing images
                          e.currentTarget.src = '/images/products/stand-pouch.jpg'
                        }}
                      />

                      {/* Overlay with step number */}
                      <div className="absolute top-4 left-4 w-12 h-12 bg-brixa-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </MotionWrapper>
          ))}
        </div>

        {/* Quality Assurance Section */}
        <MotionWrapper delay={0.6}>
          <Card className="p-8 bg-gradient-to-r from-brixa-600 to-navy-600 text-white">
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {language === 'ja' ? '品質保証システム' : 'Quality Assurance System'}
                </h3>
                <p className="text-white/90 text-lg max-w-2xl mx-auto">
                  {language === 'ja'
                    ? 'ISO 9001認証の品質管理システムで、一貫した高品質製品をお届けします。'
                    : 'ISO 9001 certified quality management system ensures consistent high-quality products.'
                  }
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">100%</div>
                  <div className="text-white/80 text-sm">
                    {language === 'ja' ? '品質検査' : 'Quality Inspection'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">ISO 9001</div>
                  <div className="text-white/80 text-sm">
                    {language === 'ja' ? '認証取得' : 'Certified'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">0.01%</div>
                  <div className="text-white/80 text-sm">
                    {language === 'ja' ? '不適合率' : 'Defect Rate'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionWrapper>

        {/* Technical Advantages Section */}
        <MotionWrapper delay={0.7}>
          <div className="text-center bg-gradient-to-r from-brixa-50 to-navy-50 rounded-2xl p-8 mt-16">
            <div className="max-w-3xl mx-auto space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {language === 'ja'
                  ? '技術による製造の強み'
                  : 'Manufacturing Excellence Through Technology'
                }
              </h3>
              <p className="text-gray-600">
                {language === 'ja'
                  ? '最新鋭設備と一貫生産システムで、最高品質の包装材を迅速にお届けします。'
                  : 'Delivering the highest quality packaging materials quickly through state-of-the-art equipment and integrated production systems.'
                }
              </p>
              <div className="grid md:grid-cols-4 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-brixa-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {language === 'ja' ? '高速生産' : 'High-Speed Production'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === 'ja' ? '最短30日納品' : '30-day delivery'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-brixa-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {language === 'ja' ? '環境配慮' : 'Eco-Friendly'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === 'ja' ? 'NON-VOC対応' : 'NON-VOC compliant'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-brixa-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {language === 'ja' ? '高精度加工' : 'Precision Processing'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === 'ja' ? '±0.05mm精度' : '±0.05mm accuracy'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-brixa-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Cpu className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {language === 'ja' ? '一貫生産' : 'Integrated Production'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {language === 'ja' ? '完全内製化' : 'Fully in-house'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  )
}