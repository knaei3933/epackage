'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Calculator, TrendingUp, DollarSign, Package, Users, AlertCircle } from 'lucide-react'

interface IndustryCalculatorProps {
  industry: string
}

export function IndustryCalculator({ industry }: IndustryCalculatorProps) {
  const [formData, setFormData] = useState({
    monthlyCost: '',
    currentVolume: '',
    targetReduction: '',
    customFeatures: [] as string[]
  })

  const [results, setResults] = useState<any>(null)

  const industryFeatures = {
    'food-manufacturing': [
      { id: 'hygiene', name: '食品衛生法対応', impact: 15, cost: 10000 },
      { id: 'preservation', name: '鮮度保持技術', impact: 25, cost: 15000 },
      { id: 'automation', name: '自動化対応', impact: 20, cost: 20000 },
      { id: 'custom', name: 'カスタム設計', impact: 30, cost: 25000 }
    ],
    'cosmetics': [
      { id: 'premium', name: 'プレミアム包装', impact: 35, cost: 20000 },
      { id: 'sustainability', name: 'サステナブル素材', impact: 20, cost: 18000 },
      { id: 'branding', name: 'ブランディング対応', impact: 40, cost: 15000 },
      { id: 'smart', name: 'スマート包装', impact: 25, cost: 22000 }
    ],
    'pharmaceutical': [
      { id: 'gmp', name: 'GMP対応', impact: 15, cost: 25000 },
      { id: 'safety', name: '安全包装', impact: 20, cost: 18000 },
      { id: 'tracking', name: 'トレーサビリティ', impact: 25, cost: 20000 },
      { id: 'validation', name: '検証対応', impact: 30, cost: 30000 }
    ],
    'electronics': [
      { id: 'esd', name: 'ESD防止', impact: 30, cost: 15000 },
      { id: 'protection', name: '精密保護', impact: 25, cost: 18000 },
      { id: 'automation', name: '自動化対応', impact: 20, cost: 12000 },
      { id: 'tracking', name: 'トレーサビリティ', impact: 15, cost: 10000 }
    ]
  }

  const calculateROI = () => {
    const monthlyCost = parseFloat(formData.monthlyCost) || 0
    const currentVolume = parseFloat(formData.currentVolume) || 0
    const targetReduction = parseFloat(formData.targetReduction) || 0

    // 基本的なROI計算
    const monthlySavings = monthlyCost * (targetReduction / 100)
    const yearlySavings = monthlySavings * 12

    // カスタム機能のコストと影響を計算
    const customFeatureCost = formData.customFeatures.reduce((total, featureId) => {
      const feature = industryFeatures[industry as keyof typeof industryFeatures]?.find(f => f.id === featureId)
      return total + (feature?.cost || 0)
    }, 0)

    const customFeatureImpact = formData.customFeatures.reduce((total, featureId) => {
      const feature = industryFeatures[industry as keyof typeof industryFeatures]?.find(f => f.id === featureId)
      return total + (feature?.impact || 0)
    }, 0)

    // 調整後の削減率
    const adjustedReduction = Math.min(targetReduction + customFeatureImpact, 80)
    const adjustedMonthlySavings = monthlyCost * (adjustedReduction / 100)
    const adjustedYearlySavings = adjustedMonthlySavings * 12

    // 回収期間計算（カスタム機能のコストを含む）
    const totalInvestment = customFeatureCost
    const paybackPeriod = totalInvestment > 0 ? totalInvestment / adjustedMonthlySavings : 0

    // ROI計算
    const roi1Year = (adjustedYearlySavings / totalInvestment) * 100
    const roi3Years = ((adjustedYearlySavings * 3) / totalInvestment) * 100

    setResults({
      monthlySavings,
      yearlySavings,
      adjustedMonthlySavings,
      adjustedYearlySavings,
      adjustedReduction,
      paybackPeriod,
      roi1Year,
      roi3Years,
      totalInvestment,
      featureImpact: customFeatureImpact
    })
  }

  const features = industryFeatures[industry as keyof typeof industryFeatures] || industryFeatures['food-manufacturing']

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Calculator className="w-8 h-8 text-navy-700" />
        <h3 className="text-2xl font-bold text-gray-900">業別カスタム計算ツール</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calculator Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>基本的な情報を入力</CardTitle>
              <CardDescription>あなたのビジネスに最適なROIを計算します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  月間包装コスト（万円）
                </label>
                <input
                  type="number"
                  value={formData.monthlyCost}
                  onChange={(e) => setFormData({...formData, monthlyCost: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-600"
                  placeholder="例: 1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  月間包装数量（個）
                </label>
                <input
                  type="number"
                  value={formData.currentVolume}
                  onChange={(e) => setFormData({...formData, currentVolume: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-600"
                  placeholder="例: 100000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目標削減率（%）
                </label>
                <input
                  type="number"
                  value={formData.targetReduction}
                  onChange={(e) => setFormData({...formData, targetReduction: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-600"
                  placeholder="例: 30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  必要な機能を選択
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {features.map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        id={feature.id}
                        checked={formData.customFeatures.includes(feature.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              customFeatures: [...formData.customFeatures, feature.id]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              customFeatures: formData.customFeatures.filter(id => id !== feature.id)
                            })
                          }
                        }}
                        className="w-4 h-4 text-navy-700 rounded focus:ring-navy-600"
                      />
                      <label htmlFor={feature.id} className="flex-1 text-sm font-medium text-gray-700">
                        {feature.name}
                      </label>
                      <Badge variant="outline" className="text-xs">
                        影響率: {feature.impact}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={calculateROI} className="w-full bg-navy-700 text-white hover:bg-navy-600">
                <Calculator className="w-4 h-4 mr-2" />
                ROIを計算する
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-1">
          {results ? (
            <Card className="bg-gradient-to-br from-navy-50 to-brixa-50">
              <CardHeader>
                <CardTitle className="text-navy-600">計算結果</CardTitle>
                <CardDescription className="text-navy-600">
                  導入による具体的な効果
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-600">月間削減額</span>
                      <span className="text-xl font-bold text-green-600">
                        {results.adjustedMonthlySavings.toFixed(0)}万円
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600">年間削減額</span>
                      <span className="text-xl font-bold text-green-600">
                        {results.adjustedYearlySavings.toFixed(0)}万円
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600">調整後削減率</span>
                      <span className="text-xl font-bold text-navy-700">
                        {results.adjustedReduction.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600">回収期間</span>
                      <span className="text-xl font-bold text-purple-600">
                        {results.paybackPeriod.toFixed(1)}ヶ月
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">投資費用</span>
                    <span className="font-semibold">{results.totalInvestment.toLocaleString()}万円</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">機能追加効果</span>
                    <span className="font-semibold text-green-600">+{results.featureImpact}%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-navy-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">ROI分析</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>1年間ROI:</span>
                      <span className="font-semibold text-green-600">
                        {results.roi1Year.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>3年間ROI:</span>
                      <span className="font-semibold text-green-600">
                        {results.roi3Years.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-xs text-yellow-800">
                      計算結果は目安です。実際の効果は導入規模やビジネスモデルによって異なります。
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calculator className="w-12 h-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">計算結果</h4>
                <p className="text-sm text-gray-600 text-center">
                  左のフォームに情報を入力して<br />
                  ROIを計算してください
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>計算に含まれる要素</CardTitle>
          <CardDescription>ROI計算に考慮された主な要素</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">直接的なコスト削減</div>
                <div className="text-gray-600">材料費、労務費、エネルギー費の削減</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Package className="w-4 h-4 text-navy-700 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">間接的な効果</div>
                <div className="text-gray-600">品質向上、納期改善、顧客満足度</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Users className="w-4 h-4 text-purple-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">長期的な価値</div>
                <div className="text-gray-600">ブランド価値、環境配慮、競争優位性</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}