'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import Link from 'next/link'
import { TrendingUp, Calculator, DollarSign, Target, Users, BarChart, Download } from 'lucide-react'

interface ROISectionProps {
  industry: string
}

export function ROISection({ industry }: ROISectionProps) {
  const roiData = {
    'food-manufacturing': {
      averageROI: '35%',
      paybackPeriod: '8ヶ月',
      costReduction: '30%',
      revenueIncrease: '15%',
      keyFactors: [
        '包装材料費の削減（25%）',
        '廃棄物処理費の軽減（40%）',
        '輸送効率の向上（30%）',
        '賞味期限延長によるロス削減（45%）'
      ],
      metrics: [
        { metric: '包装コスト', before: '100%', after: '70%', improvement: '-30%' },
        { metric: '廃棄物量', before: '100%', after: '55%', improvement: '-45%' },
        { metric: '輸送効率', before: '100%', after: '130%', improvement: '+30%' },
        { metric: '賞味期限', before: '14日', after: '21日', improvement: '+50%' }
      ]
    },
    'cosmetics': {
      averageROI: '42%',
      paybackPeriod: '6ヶ月',
      costReduction: '18%',
      revenueIncrease: '35%',
      keyFactors: [
        'ブランド価値向上（85%）',
        '顧客ロイヤリティ向上（65%）',
        'プレミアム価格設定（40%）',
        'リピート購入率向上（30%）'
      ],
      metrics: [
        { metric: 'ブランド価値', before: '100%', after: '185%', improvement: '+85%' },
        { metric: '売上増加', before: '100%', after: '135%', improvement: '+35%' },
        { metric: '顧客ロイヤルティ', before: '100%', after: '165%', improvement: '+65%' },
        { metric: 'リピート率', before: '30%', after: '39%', improvement: '+30%' }
      ]
    },
    'pharmaceutical': {
      averageROI: '28%',
      paybackPeriod: '12ヶ月',
      costReduction: '15%',
      revenueIncrease: '20%',
      keyFactors: [
        'コンプライアンスリスクの低減（99%）',
        '品質安定性向上（25%）',
        '患者服薬アドherence向上（35%）',
        '輸送ロスの削減（100%）'
      ],
      metrics: [
        { metric: '品質安定性', before: '18ヶ月', after: '24ヶ月', improvement: '+33%' },
        { metric: '服薬アドherence', before: '65%', after: '88%', improvement: '+35%' },
        { metric: '製品ロス', before: '5%', after: '0%', improvement: '-100%' },
        { metric: 'コンプライアンス', before: '85%', after: '100%', improvement: '+15%' }
      ]
    },
    'electronics': {
      averageROI: '45%',
      paybackPeriod: '5ヶ月',
      costReduction: '25%',
      revenueIncrease: '30%',
      keyFactors: [
        'ESD不良の低減（98%）',
        '輸送コストの削減（35%）',
        '納期遵守率向上（15%）',
        '生産効率向上（50%）'
      ],
      metrics: [
        { metric: 'ESD不良率', before: '0.5%', after: '0.01%', improvement: '-98%' },
        { metric: '輸送コスト', before: '100%', after: '65%', improvement: '-35%' },
        { metric: '納期遵守率', before: '85%', after: '98%', improvement: '+15%' },
        { metric: '生産効率', before: '100%', after: '150%', improvement: '+50%' }
      ]
    }
  }

  const data = roiData[industry as keyof typeof roiData] || roiData['food-manufacturing']

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <BarChart className="w-8 h-8 text-brand" />
        <h3 className="text-2xl font-bold text-text-primary">ROI分析</h3>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-brand-muted border-border-medium">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-brand mx-auto mb-2" />
            <div className="text-2xl font-bold text-brand">{data.averageROI}</div>
            <div className="text-sm text-brand">平均ROI</div>
          </CardContent>
        </Card>

        <Card className="bg-brand-muted border-brand">
          <CardContent className="p-6 text-center">
            <Calculator className="w-8 h-8 text-brand mx-auto mb-2" />
            <div className="text-2xl font-bold text-brand">{data.paybackPeriod}</div>
            <div className="text-sm text-brand">回収期間</div>
          </CardContent>
        </Card>

        <Card className="bg-brand-muted border-border-medium">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-brand mx-auto mb-2" />
            <div className="text-2xl font-bold text-brand">{data.costReduction}</div>
            <div className="text-sm text-brand">コスト削減</div>
          </CardContent>
        </Card>

        <Card className="bg-brand-muted border-brand">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-brand mx-auto mb-2" />
            <div className="text-2xl font-bold text-brand">{data.revenueIncrease}</div>
            <div className="text-sm text-brand">売上増加</div>
          </CardContent>
        </Card>
      </div>

      {/* Key Factors */}
      <Card>
        <CardHeader>
          <CardTitle>ROI向上の主要因</CardTitle>
          <CardDescription>導入により実現される主な効果</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.keyFactors.map((factor, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Badge variant="outline" className="bg-brand-muted text-text-primary mt-0.5">
                  {index + 1}
                </Badge>
                <span className="text-sm text-text-secondary">{factor}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>具体的な改善指標</CardTitle>
          <CardDescription>導入前後の比較データ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.metrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-24 text-sm font-medium text-text-secondary">
                    {metric.metric}
                  </div>
                  <div className="text-sm text-text-secondary">
                    <span className="line-through">導入前: {metric.before}</span>
                    <span className="mx-2">→</span>
                    <span className="font-semibold">導入後: {metric.after}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-inner text-sm font-medium ${
                  metric.improvement.startsWith('+')
                    ? 'bg-brand-muted text-on-brand-muted'
                    : 'bg-error-muted text-on-error-muted'
                }`}>
                  {metric.improvement}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ROI Calculator */}
      <Card className="bg-bg-secondary">
        <CardHeader>
          <CardTitle className="text-brand">ROI計算ツール</CardTitle>
          <CardDescription className="text-brand">
            導入による具体的な投資効果を計算します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  月間包装コスト（万円）
                </label>
                <input
                  type="number"
                  className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                  placeholder="例: 1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  導入費用（万円）
                </label>
                <input
                  type="number"
                  className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                  placeholder="例: 500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  予想削減率（%）
                </label>
                <input
                  type="number"
                  className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                  placeholder="例: 30"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-text-secondary mb-2">計算結果</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>月間削減額:</span>
                    <span className="font-semibold">万円</span>
                  </div>
                  <div className="flex justify-between">
                    <span>回収期間:</span>
                    <span className="font-semibold">ヶ月</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1年間ROI:</span>
                    <span className="font-semibold text-brand">%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3年間ROI:</span>
                    <span className="font-semibold text-brand">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center space-y-4">
        <p className="text-lg text-text-secondary">
          導入実績に基づいた具体的なROIデータをご提供します。
          あなたのビジネスに最適なソリューションを提案します。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/quote-simulator" className={buttonVariants({ size: 'lg', variant: 'primary' })}>
            <Calculator className="w-5 h-5 mr-2" aria-hidden="true" />
            見積もりで費用を確かめる
          </Link>
          <Link href="/contact" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
            <Users className="w-5 h-5 mr-2" aria-hidden="true" />
            専門家へ相談
          </Link>
        </div>
      </div>
    </div>
  )
}