'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
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
        <BarChart className="w-8 h-8 text-green-600" />
        <h3 className="text-2xl font-bold text-gray-900">ROI分析</h3>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">{data.averageROI}</div>
            <div className="text-sm text-green-600">平均ROI</div>
          </CardContent>
        </Card>

        <Card className="bg-navy-50 border-navy-600">
          <CardContent className="p-6 text-center">
            <Calculator className="w-8 h-8 text-navy-700 mx-auto mb-2" />
            <div className="text-2xl font-bold text-navy-600">{data.paybackPeriod}</div>
            <div className="text-sm text-navy-700">回収期間</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{data.costReduction}</div>
            <div className="text-sm text-purple-600">コスト削減</div>
          </CardContent>
        </Card>

        <Card className="bg-brixa-50 border-brixa-600">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-brixa-700 mx-auto mb-2" />
            <div className="text-2xl font-bold text-brixa-600">{data.revenueIncrease}</div>
            <div className="text-sm text-brixa-700">売上増加</div>
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
                <Badge variant="outline" className="bg-green-100 text-green-800 mt-0.5">
                  {index + 1}
                </Badge>
                <span className="text-sm text-gray-700">{factor}</span>
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
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-24 text-sm font-medium text-gray-700">
                    {metric.metric}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="line-through">導入前: {metric.before}</span>
                    <span className="mx-2">→</span>
                    <span className="font-semibold">導入後: {metric.after}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  metric.improvement.startsWith('+')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {metric.improvement}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ROI Calculator */}
      <Card className="bg-gradient-to-r from-navy-50 to-brixa-50">
        <CardHeader>
          <CardTitle className="text-navy-600">ROI計算ツール</CardTitle>
          <CardDescription className="text-navy-600">
            導入による具体的な投資効果を計算します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  月間包装コスト（万円）
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-600"
                  placeholder="例: 1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  導入費用（万円）
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-600"
                  placeholder="例: 500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  予想削減率（%）
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-600"
                  placeholder="例: 30"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">計算結果</div>
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
                    <span className="font-semibold text-green-600">%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3年間ROI:</span>
                    <span className="font-semibold text-green-600">%</span>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-navy-700 text-white hover:bg-navy-600">
                <Calculator className="w-4 h-4 mr-2" />
                ROIを計算する
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center space-y-4">
        <p className="text-lg text-gray-600">
          導入実績に基づいた具体的なROIデータをご提供します。
          あなたのビジネスに最適なソリューションを提案します。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-green-600 text-white hover:bg-green-700 font-semibold px-8 py-4">
            <Download className="w-5 h-5 mr-2" />
            詳細ROIレポートダウンロード
          </Button>
          <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-8 py-4">
            <Users className="w-5 h-5 mr-2" />
            導入相談を予約
          </Button>
        </div>
      </div>
    </div>
  )
}