'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Award, Shield, TrendingDown, Clock, Download, FileText, BarChart } from 'lucide-react'

export function FoodManufacturingContent() {
  const [activeFeature, setActiveFeature] = useState('hygiene')

  const features = [
    {
      id: 'hygiene',
      title: '食品衛生法対応',
      description: '食品衛生法の全ての要件を満たす専門的パッケージングソリューション',
      icon: Shield,
      benefits: [
        '食品衛生法第11条完全対応',
        'HACCP認証取得済み資材',
        '異物混入防止設計',
        '清掃・殺菌しやすい構造'
      ],
      certifications: ['ISO 22000', 'HACCP', '食品衛生法認証']
    },
    {
      id: 'preservation',
      title: '鮮度保持技術',
      description: '製品の鮮度と品質を長期間保持する革新的包装技術',
      icon: TrendingDown,
      benefits: [
        '酸素透過率99%低減',
        '鮮保持続期間2倍延長',
        '温度変化への耐性強化',
        '風味・香り保持技術'
      ],
      certifications: ['保鲜技術特許', '品質保持認証']
    },
    {
      id: 'cost',
      title: 'コスト削減',
      description: '従来のコストを30%削減する効率的な包装ソリューション',
      icon: TrendingDown,
      benefits: [
        '材料費25%削減',
        'ラベリングコスト15%削減',
        '保管・輸送効率30%向上',
        '廃棄物削減によるコスト低減'
      ],
      certifications: ['コスト削減認証', '効率化認証']
    }
  ]

  const caseStudies = [
    {
      company: 'A食品株式会社',
      industry: '惣菜メーカー',
      challenge: '賞味期限の短縮と包装コストの高騰',
      solution: '鮮度保持パッケージングシステム導入',
      result: {
        shelfLife: '14日 → 21日',
        costReduction: '32%',
        wasteReduction: '45%',
        satisfaction: '98%'
      }
    },
    {
      company: 'Bベーカリー',
      industry: 'パン製造',
      challenge: 'パンの硬化と輸送中の破損',
      solution: '特殊ガス封止・衝撃吸収パッケージ',
      result: {
        shelfLife: '3日 → 7日',
        damageRate: '8% → 0.5%',
        costReduction: '28%',
        satisfaction: '99%'
      }
    },
    {
      company: 'Cスイーツ',
      industry: 'デザート製造',
      challenge: 'デリケートな製品の保護とブランディング',
      solution: '高級感包装デザイン・保護機能強化',
      result: {
        brandValue: '35%向上',
        damageRate: '12% → 1%',
        customerRetention: '25%増加',
        satisfaction: '97%'
      }
    }
  ]

  const technicalSpecs = {
    materials: [
      '食品接触用PE（ポリエチレン）',
      '食品接触用PP（ポリプロピレン）',
      'アルミ箔複合材',
      '抗菌性樹脂'
    ],
    certifications: [
      '食品衛生法適合',
      'FDA認証',
      'EU食品接触物質規則',
      'HACCP認証'
    ],
    features: [
      'マイクロ波対応',
      '冷凍耐性',
      '熱シール性',
      '印刷対応'
    ]
  }

  return (
    <div className="space-y-12">
      {/* Hero Content */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">
          食品製造業の課題を解決する
          <span className="text-green-600">専門ソリューション</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          食品衛生法対応、鮮度保持技術、コスト削減を実現。
          150社以上の食品メーカーが導入済みの実績あるパッケージングソリューション。
        </p>
      </div>

      {/* Feature Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card
            key={feature.id}
            className={`cursor-pointer transition-all duration-300 ${
              activeFeature === feature.id
                ? 'ring-2 ring-green-500 bg-green-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setActiveFeature(feature.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <feature.icon className="w-8 h-8 text-green-600" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {feature.benefits.slice(0, 2).map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Feature Content */}
      <div className="bg-gray-50 rounded-xl p-8">
        {(() => {
          const feature = features.find(f => f.id === activeFeature)!
          return (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <feature.icon className="w-10 h-10 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
              </div>

              <p className="text-lg text-gray-700">{feature.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">主な利点</h4>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">関連認証</h4>
                  <div className="flex flex-wrap gap-2">
                    {feature.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Case Studies */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3">
          <Award className="w-8 h-8 text-green-600" />
          <h3 className="text-2xl font-bold text-gray-900">導入事例</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {caseStudies.map((caseStudy, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{caseStudy.company}</CardTitle>
                <CardDescription>{caseStudy.industry}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">課題</h4>
                  <p className="text-sm text-gray-600">{caseStudy.challenge}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">ソリューション</h4>
                  <p className="text-sm text-gray-600">{caseStudy.solution}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3">実績</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-green-700">賞味期限延長:</span>
                      <br />
                      <span className="text-green-900 font-semibold">{caseStudy.result.shelfLife}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">コスト削減:</span>
                      <br />
                      <span className="text-green-900 font-semibold">{caseStudy.result.costReduction}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">廃棄物削減:</span>
                      <br />
                      <span className="text-green-900 font-semibold">{caseStudy.result.wasteReduction}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">満足度:</span>
                      <br />
                      <span className="text-green-900 font-semibold">{caseStudy.result.satisfaction}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="bg-gray-50 rounded-xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-8 h-8 text-green-600" />
          <h3 className="text-2xl font-bold text-gray-900">技術仕様</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-gray-900">使用材料</h4>
            <ul className="space-y-2">
              {technicalSpecs.materials.map((material, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">{material}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">認証・規格</h4>
            <div className="flex flex-wrap gap-2">
              {technicalSpecs.certifications.map((cert, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">特徴機能</h4>
            <ul className="space-y-2">
              {technicalSpecs.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">導入で得られる価値</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">30%+</div>
            <div>コスト削減</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">2倍</div>
            <div>鮮保持続期間</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">150+</div>
            <div>導入実績</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-green-800 hover:bg-gray-100 font-semibold px-8 py-4">
            <Download className="w-5 h-5 mr-2" />
            詳細資料ダウンロード
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-800 font-semibold px-8 py-4">
            <BarChart className="w-5 h-5 mr-2" />
            ROIシミュレーション
          </Button>
        </div>
      </div>
    </div>
  )
}