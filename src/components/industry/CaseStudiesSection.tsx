'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Award } from 'lucide-react'

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
        solution: '鮮度保持パッケージングシステム導入'
      },
      {
        company: 'Bベーカリー',
        industry: 'パン製造',
        challenge: 'パンの硬化と輸送中の破損',
        solution: '特殊ガス封止・衝撃吸収パッケージ'
      }
    ],
    'cosmetics': [
      {
        brand: 'LUXE BEAUTY',
        category: 'プレミアムスキンケア',
        challenge: 'コモディティ化した市場での差別化不足',
        solution: '高級感包装とサステナビリティの融合'
      },
      {
        brand: 'NATURE GLOW',
        category: 'ナチュラルコスメ',
        challenge: '自然志向との一致した包装の不在',
        solution: 'バイオ素材使用・環境配慮デザイン'
      }
    ],
    'pharmaceutical': [
      {
        company: '第一製薬株式会社',
        product: '慢性疾患治療薬',
        challenge: '輸送中の品質劣化と患者の服薬アドherence',
        solution: '複合機能包装システム導入'
      },
      {
        company: '生物医薬品KK',
        product: 'バイオテクノロジー医薬品',
        challenge: '温度敏感性と輸送環境の厳しい管理',
        solution: '温制御包装・リアルタイムモニタリング'
      }
    ],
    'electronics': [
      {
        company: '半導体製造大手',
        product: 'ロジックLSI',
        challenge: '輸送中の静電気破損と輸送コストの高騰',
        solution: 'ESD制御・効率化包装システム'
      },
      {
        company: 'スマートフォンメーカー',
        product: 'スマートフォン部品',
        challenge: '破損率の高さと納期遅延',
        solution: '精密保護・自動化包装ライン'
      }
    ]
  }

  const cases = caseStudies[industry as keyof typeof caseStudies] || []

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Award className="w-8 h-8 text-brand" />
        <h3 className="text-2xl font-bold text-text-primary">導入事例</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cases.map((case_, index) => (
          <Card key={index} className="hover:shadow-low transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{'company' in case_ ? case_.company : case_.brand}</CardTitle>
              <CardDescription>
                {'industry' in case_ ? case_.industry : 'category' in case_ ? case_.category : case_.product}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-text-primary mb-2">課題</h4>
                <p className="text-sm text-text-secondary">{case_.challenge}</p>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-2">ソリューション</h4>
                <p className="text-sm text-text-secondary">{case_.solution}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}