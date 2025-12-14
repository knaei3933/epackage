'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, TrendingUp, Users, Award } from 'lucide-react'

interface CaseStudiesSectionProps {
  industry: string
}

export function CaseStudiesSection({ industry }: CaseStudiesSectionProps) {
  const caseStudies = {
    'food-manufacturing': [
      {
        company: 'A食品株式会社',
        industry: '惣菜メーカー',
        challenge: '賞味期限の短縮と包装コストの高騰',
        solution: '鮮度保持パッケージングシステム導入',
        results: {
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
        results: {
          shelfLife: '3日 → 7日',
          damageRate: '8% → 0.5%',
          costReduction: '28%',
          satisfaction: '99%'
        }
      }
    ],
    'cosmetics': [
      {
        brand: 'LUXE BEAUTY',
        category: 'プレミアムスキンケア',
        challenge: 'コモディティ化した市場での差別化不足',
        solution: '高級感包装とサステナビリティの融合',
        results: {
          brandValue: '85%向上',
          salesIncrease: '42%',
          customerLoyalty: '65%向上'
        }
      },
      {
        brand: 'NATURE GLOW',
        category: 'ナチュラルコスメ',
        challenge: '自然志向との一致した包装の不在',
        solution: 'バイオ素材使用・環境配慮デザイン',
        results: {
          ecoScore: 'A+評価',
          customerAcquisition: '38%増'
        }
      }
    ],
    'pharmaceutical': [
      {
        company: '第一製薬株式会社',
        product: '慢性疾患治療薬',
        challenge: '輸送中の品質劣化と患者の服薬アドherence',
        solution: '複合機能包装システム導入',
        results: {
          stability: '18ヶ月 → 24ヶ月',
          compliance: '100%達成',
          patientAdherence: '35%向上'
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
          shippingEfficiency: '45%向上'
        }
      }
    ],
    'electronics': [
      {
        company: '半導体製造大手',
        product: 'ロジックLSI',
        challenge: '輸送中の静電気破損と輸送コストの高騰',
        solution: 'ESD制御・効率化包装システム',
        results: {
          esdFailures: '0.5% → 0.01%',
          shippingCost: '35%削減',
          handlingTime: '40%短縮'
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
          productionEfficiency: '50%向上'
        }
      }
    ]
  }

  const cases = caseStudies[industry as keyof typeof caseStudies] || []

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Award className="w-8 h-8 text-navy-700" />
        <h3 className="text-2xl font-bold text-gray-900">導入事例</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cases.map((case_, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{'company' in case_ ? case_.company : case_.brand}</CardTitle>
              <CardDescription>
                {'industry' in case_ ? case_.industry : 'category' in case_ ? case_.category : case_.product}
              </CardDescription>
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

              <div className="bg-gradient-to-r from-navy-50 to-brixa-50 rounded-lg p-4">
                <h4 className="font-semibold text-navy-600 mb-3">実績</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries((case_ as any).results).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-navy-600">
                        {key === 'shelfLife' && '賞味期限延長: '}
                        {key === 'costReduction' && 'コスト削減: '}
                        {key === 'wasteReduction' && '廃棄物削減: '}
                        {key === 'satisfaction' && '満足度: '}
                        {key === 'damageRate' && '破損率: '}
                        {key === 'brandValue' && 'ブランド価値: '}
                        {key === 'salesIncrease' && '売上増加: '}
                        {key === 'customerLoyalty' && '顧客ロイヤルティ: '}
                        {key === 'ecoScore' && '環境評価: '}
                        {key === 'customerAcquisition' && '顧客獲得: '}
                        {key === 'stability' && '安定性期間: '}
                        {key === 'compliance' && 'コンプライアンス: '}
                        {key === 'patientAdherence' && '患者服薬アドherence: '}
                        {key === 'temperatureControl' && '温度管理精度: '}
                        {key === 'productLoss' && '製品ロス: '}
                        {key === 'shippingEfficiency' && '輸送効率: '}
                        {key === 'esdFailures' && 'ESD不良率: '}
                        {key === 'shippingCost' && '輸送コスト: '}
                        {key === 'handlingTime' && '取り扱い時間: '}
                        {key === 'onTimeDelivery' && '納期遵守率: '}
                        {key === 'productionEfficiency' && '生産効率: '}
                        {key === 'qualityScore' && '品質評価: '}
                        {key === 'reliability' && '信頼性: '}
                        {key === 'lifespan' && '寿命延長: '}
                      </span>
                      <span className="text-navy-600 font-semibold">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>実際の導入実績に基づくデータ</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h4 className="font-semibold text-gray-900 mb-2">導入で実現できる効果</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex flex-col items-center">
            <TrendingUp className="w-6 h-6 text-green-600 mb-1" />
            <span className="font-semibold text-green-700">平均30%+</span>
            <span className="text-gray-600">コスト削減</span>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle className="w-6 h-6 text-navy-700 mb-1" />
            <span className="font-semibold text-navy-600">95%+</span>
            <span className="text-gray-600">満足度</span>
          </div>
          <div className="flex flex-col items-center">
            <Award className="w-6 h-6 text-purple-600 mb-1" />
            <span className="font-semibold text-purple-700">100+</span>
            <span className="text-gray-600">導入実績</span>
          </div>
          <div className="flex flex-col items-center">
            <Users className="w-6 h-6 text-brixa-700 mb-1" />
            <span className="font-semibold text-brixa-600">24時間</span>
            <span className="text-gray-600">最短対応</span>
          </div>
        </div>
      </div>
    </div>
  )
}