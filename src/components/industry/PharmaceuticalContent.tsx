'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Award, Shield, AlertTriangle, Heart, Users, FileCheck, Globe } from 'lucide-react'

export function PharmaceuticalContent() {
  const [activeFeature, setActiveFeature] = useState('gmp')

  const features = [
    {
      id: 'gmp',
      title: 'GMP準拠',
      description: '医薬品製造管理基準に完全準拠する専門包装ソリューション',
      icon: Shield,
      compliance: [
        '医薬品・医療機器等の品質、有効性及び安全性の確保等に関する法律（薬機法）対応',
        'GMP基準の全ての要件を満たす',
        'クリーンルーム環境での生産',
        '変更管理手順の完備'
      ],
      standards: ['PIC/S GMP', 'ISO 15378', '医療用ラベリング規格', '安定性試験基準']
    },
    {
      id: 'safety',
      title: '安全包装',
      description: '小児安全包装と防偽機能を実装した安心の包装',
      icon: AlertTriangle,
      safetyFeatures: [
        '小児安全キャップ（Combination Cap）',
        '成人用開封力確保',
        '簡易開封機能付き高密封',
        '複層構造による防偽性能'
      ],
      tests: ['落下試験', '振動試験', '温度変化試験', '経時安定性試験']
    },
    {
      id: 'protection',
      title: '保護機能',
      description: '医薬品の安定性と品質を保護する高度な包装技術',
      icon: Heart,
      protectionTech: [
        '遮光性包装（アルミ箔・金属蒸着）',
        '湿気防護（デシカント封入）',
        '酸素バリア（窒素充填）',
        '衝撃吸収（クッション材最適化）'
      ],
      stability: [
        '保存期間延長（2倍以上）',
        '品質劣化防止',
        '有効成分安定性維持',
        '物理化学的性質保持'
      ]
    }
  ]

  const implementationCases = [
    {
      company: '第一製薬株式会社',
      product: '慢性疾患治療薬',
      challenge: '輸送中の品質劣化と患者の服薬アドherence',
      solution: '複合機能包装システム導入',
      results: {
        stability: '18ヶ月 → 24ヶ月',
        compliance: '100%達成',
        patientAdherence: '35%向上',
        complaints: '80%減少'
      }
    },
    {
      company: '生物医薬品KK',
      product: 'バイオテクノロジー医薬品',
      challenge: '温度敏感性と輸送環境の厳しい管理',
      solution: '温制御包装・リアルタイムモニタリング',
      results: {
        temperatureControl: '±0.5℃',
        productLoss: '0%',
        shippingEfficiency: '45%向上',
        regulatoryApproval: '早期獲得'
      }
    },
    {
      company: 'ジェネリック医薬品社',
      product: 'ジェネリック製剤',
      challenge: 'コスト削減と品質バランスの確保',
      solution: '効率化包装設計・自動化生産',
      results: {
        costReduction: '28%',
        qualityScore: '9.8/10',
        productionEfficiency: '60%向上',
        marketShare: '15%拡大'
      }
    }
  ]

  const regulations = [
    {
      country: '日本',
      authority: '厚生労働省',
      mainLaw: '薬機法',
      requirements: [
        '医薬品医療機器等の品質、有効性及び安全性の確保等に関する法律',
        '包装基準適合',
        'ラベリング規格',
        '保管条件明記'
      ]
    },
    {
      country: '米国',
      authority: 'FDA',
      mainLaw: 'FD&C Act',
      requirements: [
        'Federal Food, Drug, and Cosmetic Act',
        'Current Good Manufacturing Practice (cGMP)',
        'Child Resistant Packaging',
        'Tamper-Evident Features'
      ]
    },
    {
      country: '欧州',
      authority: 'EMA',
      mainLaw: 'EU Directives',
      requirements: [
        'EU Directive 2001/83/EC',
        'Good Manufacturing Practice (GMP)',
        'Packaging Requirements',
        'Safety Features'
      ]
    }
  ]

  const qualitySystem = {
    documentation: [
      '包装設計書（DHF）',
      '品質リスク管理（QRM）',
      '変更管理（Change Control）',
      '偏差管理（Deviation Control）',
      'CAPAシステム'
    ],
    processes: [
      '設計プロセス',
      '検証プロセス',
      '生産プロセス',
      '検査プロセス',
      '放出プロセス'
    ],
    validations: [
      '包装設計検証（DQ）',
      '設備適合性検証（IQ/OQ/PQ）',
      'プロセス適合性検証（PQ）',
      'クリティカルパラメータ検証'
    ]
  }

  return (
    <div className="space-y-12">
      {/* Hero Content */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">
          医薬品業界の厳しい基準を
          <span className="text-navy-700">クリアする</span>
          <span className="text-navy-700">包装ソリューション</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          GMP準拠、安全包装、品質保護の3本柱で医薬品企業の信頼をサポート。
          60社以上の医薬品企業が実績のある専門ソリューション。
        </p>
      </div>

      {/* Feature Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card
            key={feature.id}
            className={`cursor-pointer transition-all duration-300 ${
              activeFeature === feature.id
                ? 'ring-2 ring-navy-600 bg-navy-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setActiveFeature(feature.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <feature.icon className="w-8 h-8 text-navy-700" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(() => {
                  const allFeatures = [
                    ...(feature.compliance?.slice(0, 2) || []),
                    ...(feature.safetyFeatures?.slice(0, 2) || []),
                    ...(feature.protectionTech?.slice(0, 2) || [])
                  ];
                  const validFeatures = allFeatures.filter(Boolean);
                  return validFeatures.slice(0, 4);
                })().map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-navy-600" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Feature Content */}
      <div className="bg-gradient-to-br from-navy-50 to-navy-100 rounded-xl p-8">
        {(() => {
          const feature = features.find(f => f.id === activeFeature)!
          return (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <feature.icon className="w-10 h-10 text-navy-700" />
                <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
              </div>

              <p className="text-lg text-gray-700">{feature.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">主要特性</h4>
                  <ul className="space-y-2">
                    {(feature.compliance || feature.safetyFeatures || feature.protectionTech).map((item, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-navy-600" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">認証・基準</h4>
                  <div className="flex flex-wrap gap-2">
                    {(feature.standards || feature.tests || feature.stability).map((item, index) => (
                      <Badge key={index} variant="secondary" className="bg-navy-600 text-navy-600">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Implementation Cases */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3">
          <Award className="w-8 h-8 text-navy-700" />
          <h3 className="text-2xl font-bold text-gray-900">導入事例</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {implementationCases.map((case_, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-navy-600">
              <CardHeader>
                <CardTitle className="text-lg">{case_.company}</CardTitle>
                <CardDescription>{case_.product}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">課題</h4>
                  <p className="text-sm text-gray-600">{case_.challenge}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">ソリューション</h4>
                  <p className="text-sm text-gray-600">{case_.solution}</p>
                </div>

                <div className="bg-gradient-to-r from-navy-50 to-navy-100 rounded-lg p-4">
                  <h4 className="font-semibold text-navy-600 mb-3">実績</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(case_.results).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-navy-600">
                          {key === 'stability' && '安定性期間: '}
                          {key === 'compliance' && 'コンプライアンス: '}
                          {key === 'patientAdherence' && '患者服薬アドherence: '}
                          {key === 'complaints' && 'クレーム減少: '}
                          {key === 'temperatureControl' && '温度管理精度: '}
                          {key === 'productLoss' && '製品ロス: '}
                          {key === 'shippingEfficiency' && '輸送効率: '}
                          {key === 'regulatoryApproval' && '規制承認: '}
                          {key === 'costReduction' && 'コスト削減: '}
                          {key === 'qualityScore' && '品質評価: '}
                          {key === 'productionEfficiency' && '生産効率: '}
                          {key === 'marketShare' && '市場シェア: '}
                        </span>
                        <span className="text-navy-600 font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Global Regulations */}
      <div className="bg-gray-50 rounded-xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="w-8 h-8 text-navy-700" />
          <h3 className="text-2xl font-bold text-gray-900">世界各国の規制対応</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {regulations.map((reg, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-navy-600">{reg.country}</CardTitle>
                <CardDescription>{reg.authority}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1 text-gray-900">主要法律</h4>
                    <p className="text-sm text-navy-700 font-medium">{reg.mainLaw}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-gray-900">主な要件</h4>
                    <ul className="text-sm space-y-1">
                      {reg.requirements.slice(0, 3).map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-start space-x-1">
                          <CheckCircle className="w-3 h-3 text-navy-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quality Management System */}
      <div className="bg-white rounded-xl p-8 border border-navy-600">
        <div className="flex items-center space-x-3 mb-6">
          <FileCheck className="w-8 h-8 text-navy-700" />
          <h3 className="text-2xl font-bold text-gray-900">品質マネジメントシステム</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-gray-900">文書管理</h4>
            <ul className="space-y-2">
              {qualitySystem.documentation.map((doc, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-navy-600" />
                  <span className="text-sm text-gray-700">{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">プロセス</h4>
            <ul className="space-y-2">
              {qualitySystem.processes.map((process, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-navy-600" />
                  <span className="text-sm text-gray-700">{process}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">検証活動</h4>
            <ul className="space-y-2">
              {qualitySystem.validations.map((validation, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-navy-600" />
                  <span className="text-sm text-gray-700">{validation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-navy-700 to-indigo-600 rounded-xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">医薬品包装で実現価値</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">99%</div>
            <div>コンプライアンス達成率</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">60+</div>
            <div>医薬品企業導入実績</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
            <div className="text-3xl font-bold mb-2">20%+</div>
            <div>品質安定性向上</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-navy-600 hover:bg-gray-100 font-semibold px-8 py-4">
            <FileCheck className="w-5 h-5 mr-2" />
            規格対応資料ダウンロード
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-navy-600 font-semibold px-8 py-4">
            <Users className="w-5 h-5 mr-2" />
            専門家相談を予約
          </Button>
        </div>
      </div>
    </div>
  )
}