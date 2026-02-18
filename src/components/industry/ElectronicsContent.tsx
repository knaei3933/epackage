'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Award, Zap, Shield, TrendingUp, TrendingDown, Globe, Users, Link, ArrowRight, X } from 'lucide-react'

export function ElectronicsContent() {
  const [activeFeature, setActiveFeature] = useState('esd')

  const features = [
    {
      id: 'esd',
      title: 'ESD防止',
      description: '静電気破損を防止する専門的な防静電包装ソリューション',
      icon: Zap,
      esdProtection: [
        '10^6〜10^9 Ωの表面抵抗率制御',
        '静電気放電（ESD）安全設計',
        '電荷分散・緩和構造',
        'IEC 61340-5-1準拠'
      ],
      materials: ['導電性ポリマー', '炭素添加素材', '金属蒸着フィルム', '導電性塗布']
    },
    {
      id: 'shock',
      title: '衝撃吸収',
      description: '精密電子部品を外部衝撃から保護する最適化包装',
      icon: Shield,
      shockAbsorption: [
        '段階的緩衝設計',
        '多重構造衝撃吸収',
        '部位別クッション強度調整',
        '落下試験20G耐性'
      ],
      testing: ['落下試験', '振動試験', '圧縮試験', '輸送シミュレーション']
    },
    {
      id: 'protection',
      title: '精密保護',
      description: '微細・高密度実装部品の保護を徹底した包装',
      icon: Shield,
      protectionTech: [
        '微間隙クッション技術',
        'ホコリ・異物侵入防止',
        '湿度・気密性管理',
        'マーキング保持性向上'
      ],
      precision: ['±0.1mm精度', '自動化対応', 'スキャン可能性', 'トレーサビリティ']
    }
  ]

  const supplyChainCases = [
    {
      company: '半導体製造大手',
      product: 'ロジックLSI',
      challenge: '輸送中の静電気破損と輸送コストの高騰',
      solution: 'ESD制御・効率化包装システム',
      results: {
        esdFailures: '0.5% → 0.01%',
        shippingCost: '35%削減',
        handlingTime: '40%短縮',
        inventoryTurnover: '25%向上'
      }
    },
    {
      company: 'スマートフォンメーカー',
      product: 'スマートフォン部品',
      challenge: '破損率の高さと納期遅延',
      solution: '精密保護・自動化包装ライン',
      results: {
        damageRate: '12% → 0.3%',
        onTimeDelivery: '85% → 98%',
        productionEfficiency: '50%向上',
        qualityScore: '9.5/10'
      }
    },
    {
      company: '自動車電子メーカー',
      product: '車載ECU',
      challenge: '厳しい環境条件での信頼性確保',
      solution: '環境耐久性包装・温湿度管理',
      results: {
        reliability: '99.99%達成',
        temperatureRange: '-40℃〜+85℃',
        humidityControl: '5%〜95%RH',
        lifespan: '15年延長'
      }
    }
  ]

  const globalStandards = [
    {
      standard: 'ESD S20.20',
      organization: 'ESD Association',
      description: '静電気放電制御プログラムの国際標準',
      compliance: ['静電気安全管理', '作業環境', '設備', 'トレーニング'],
      certification: 'ESD認証取得可能'
    },
    {
      standard: 'IEC 61340-5',
      organization: 'International Electrotechnical Commission',
      description: '電気・電子部品の静電気保護に関する国際規格',
      compliance: ['電気的条件', '静電気安全パッケージング', 'マーキング'],
      certification: '国際規格準拠'
    },
    {
      standard: 'MIL-STD-810',
      environment: '米国国防総省',
      description: '軍用機器の環境試験方法に関する規格',
      compliance: ['振動', '衝撃', '温度', '湿度', '塩霧'],
      certification: '軍用規格対応'
    }
  ]

  const technologies = {
    materials: [
      '導電性ポリスチレン',
      '炭素ナノチューブ複合材',
      '金属化フィルム',
      '導電性発泡体',
      '静電散乱材料'
    ],
    manufacturing: [
      'クリーンルーム生産',
      '精密金型成型',
      '自動化ラミネート',
      '品質自動検査',
      'トレーサビリティ管理'
    ],
    testing: [
      '抵抗率測定',
      '表面電位測定',
      '放電電流測定',
      '環境試験',
      '長期信頼性試験'
    ]
  }

  const supplyChainBenefits = [
    {
      metric: '破損率低減',
      improvement: '95%',
      impact: '輸送コスト大幅削減',
      roi: '280%'
    },
    {
      metric: '納期遵守率',
      improvement: '98%',
      impact: '生産スケジュール安定化',
      roi: '190%'
    },
    {
      metric: '品質安定性',
      improvement: '99.9%',
      impact: '顧客満足度向上',
      roi: '320%'
    },
    {
      metric: '在庫回転率',
      improvement: '40%向上',
      impact: '資金効率改善',
      roi: '150%'
    }
  ]

  return (
    <div className="space-y-12">
      {/* Hero Content */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">
          電子部品の価値を守る
          <span className="text-purple-600">先進的包装ソリューション</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          ESD防止、衝撃吸収、精密保護の3大機能で電子部品の品質と信頼性を徹底守る。
          120社以上の電子企業が導入済みの実績あるソリューション。
        </p>
      </div>

      {/* Feature Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card
            key={feature.id}
            className={`cursor-pointer transition-all duration-300 ${
              activeFeature === feature.id
                ? 'ring-2 ring-purple-500 bg-purple-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setActiveFeature(feature.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <feature.icon className="w-8 h-8 text-purple-600" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(() => {
                  const allFeatures = [
                    ...(feature.esdProtection?.slice(0, 2) || []),
                    ...(feature.shockAbsorption?.slice(0, 2) || []),
                    ...(feature.protectionTech?.slice(0, 2) || [])
                  ];
                  const validFeatures = allFeatures.filter(Boolean);
                  return validFeatures.slice(0, 4);
                })().map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Feature Content */}
      <div className="bg-gradient-to-br from-purple-50 to-navy-50 rounded-xl p-8">
        {(() => {
          const feature = features.find(f => f.id === activeFeature)!
          return (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <feature.icon className="w-10 h-10 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
              </div>

              <p className="text-lg text-gray-700">{feature.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">主要技術</h4>
                  <ul className="space-y-2">
                    {(feature.esdProtection || feature.shockAbsorption || feature.protectionTech).map((item, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-purple-500" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">関連素材・技術</h4>
                  <div className="flex flex-wrap gap-2">
                    {(feature.materials || feature.testing || feature.precision).map((item, index) => (
                      <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
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

      {/* Supply Chain Cases */}
      <div className="space-y-8">
        <div className="flex items-center space-x-3">
          <Award className="w-8 h-8 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">供給網安定化事例</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {supplyChainCases.map((case_, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-purple-200">
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

                <div className="bg-gradient-to-r from-purple-50 to-navy-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-3">実績</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(case_.results).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-purple-700">
                          {key === 'esdFailures' && 'ESD不良率: '}
                          {key === 'shippingCost' && '輸送コスト: '}
                          {key === 'handlingTime' && '取り扱い時間: '}
                          {key === 'inventoryTurnover' && '在庫回転率: '}
                          {key === 'damageRate' && '破損率: '}
                          {key === 'onTimeDelivery' && '納期遵守率: '}
                          {key === 'productionEfficiency' && '生産効率: '}
                          {key === 'qualityScore' && '品質評価: '}
                          {key === 'reliability' && '信頼性: '}
                          {key === 'temperatureRange' && '温度範囲: '}
                          {key === 'humidityControl' && '湿度管理: '}
                          {key === 'lifespan' && '寿命延長: '}
                        </span>
                        <span className="text-purple-900 font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Global Standards */}
      <div className="bg-gray-50 rounded-xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="w-8 h-8 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">国際規格対応</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {globalStandards.map((standard, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-purple-700">{standard.standard}</CardTitle>
                <CardDescription>{standard.organization}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{standard.description}</p>
                  <div>
                    <h4 className="font-semibold mb-1 text-gray-900">対応範囲</h4>
                    <ul className="text-sm space-y-1">
                      {standard.compliance.slice(0, 2).map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-1">
                          <CheckCircle className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Badge variant="outline" className="w-full justify-center text-xs">
                    {standard.certification}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white rounded-xl p-8 border border-purple-200">
        <div className="flex items-center space-x-3 mb-6">
          <Zap className="w-8 h-8 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">技術ポートフォリオ</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-gray-900">先進素材</h4>
            <ul className="space-y-2">
              {technologies.materials.map((material, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{material}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">製造技術</h4>
            <ul className="space-y-2">
              {technologies.manufacturing.map((tech, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{tech}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">検証技術</h4>
            <ul className="space-y-2">
              {technologies.testing.map((test, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{test}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Supply Chain Benefits */}
      <div className="bg-gradient-to-r from-purple-600 to-navy-700 rounded-xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">供給網安定化で実現価値</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {supplyChainBenefits.map((benefit, index) => (
            <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold mb-1">{benefit.improvement}</div>
              <div className="text-sm font-medium mb-2">{benefit.metric}</div>
              <div className="text-xs opacity-90">{benefit.impact}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-purple-800 hover:bg-gray-100 font-semibold px-8 py-4">
            <Link className="w-5 h-5 mr-2" />
            規格対応詳細
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-800 font-semibold px-8 py-4">
            <TrendingUp className="w-5 h-5 mr-2" />
            ROI分析レポート
          </Button>
        </div>
      </div>
    </div>
  )
}