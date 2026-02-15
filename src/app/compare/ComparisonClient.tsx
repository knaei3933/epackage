'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  GitCompare,
  Trophy,
  Clock,
  DollarSign,
  Package,
  CheckCircle,
  BarChart3,
  Download,
  Eye,
  Zap,
  Shield
} from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { Grid } from '@/components/ui/Grid'
import { useComparison } from '@/contexts/ComparisonContext'
import { compareProducts, getUniqueMaterials } from '@/contexts/ComparisonContext'

export function ComparisonClient() {
  const { state, clearSelection, removeProduct } = useComparison()
  const [comparisonView, setComparisonView] = useState<'table' | 'cards'>('table')
  const [showRecommendations, setShowRecommendations] = useState(true)

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`

  if (!state.compareMode || state.selectedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-navy-50">
        <Container size="6xl" className="py-16">
          <MotionWrapper delay={0.1}>
            <div className="text-center">
              <Link href="/catalog">
                <Button variant="outline" className="inline-flex items-center mb-6 group">
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  カタログに戻る
                </Button>
              </Link>

              <div className="w-24 h-24 bg-gradient-to-br from-navy-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <GitCompare className="w-12 h-12 text-white" />
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                製品比較
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                製品を比較して、プロジェクトに最適な包装ソリューションを見つけましょう
              </p>

              <Card className="max-w-md mx-auto p-8 bg-yellow-50 border-yellow-200">
                <div className="text-center">
                  <Package className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    比較する製品がありません
                  </h3>
                  <p className="text-gray-600 mb-6">
                    カタログページで製品を選択して比較を開始してください
                  </p>
                  <Link href="/catalog">
                    <Button variant="primary" size="lg" className="w-full">
                      製品カタログへ移動
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </MotionWrapper>
        </Container>
      </div>
    )
  }

  const {
    overallBest,
    priceBest,
    speedBest,
    flexibleBest
  } = compareProducts(state.selectedProducts)

  const uniqueMaterials = getUniqueMaterials(state.selectedProducts)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-navy-50">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-600/30 via-transparent to-brixa-600/30"></div>
        <Container size="6xl" className="relative z-10 py-8">
          <MotionWrapper delay={0.1}>
            <div className="flex items-center justify-between mb-6">
              <Link href="/catalog">
                <Button variant="outline" className="inline-flex items-center group">
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  カタログに戻る
                </Button>
              </Link>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={clearSelection}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  比較をクリア
                </Button>

                <div className="flex items-center bg-white rounded-lg border border-gray-200 px-4 py-2">
                  <GitCompare className="w-5 h-5 text-navy-600 mr-2" />
                  <span className="font-medium text-gray-900">
                    {state.selectedProducts.length}個の製品を比較中
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                製品比較分析
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                選択された{state.selectedProducts.length}個の製品を詳細に比較分析
              </p>
            </div>
          </MotionWrapper>
        </Container>
      </section>

      <Container size="6xl" className="py-12">
        <MotionWrapper delay={0.2}>
          {/* View Toggle and Actions */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant={comparisonView === 'table' ? 'primary' : 'outline'}
                onClick={() => setComparisonView('table')}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                テーブル表示
              </Button>
              <Button
                variant={comparisonView === 'cards' ? 'primary' : 'outline'}
                onClick={() => setComparisonView('cards')}
                className="flex items-center space-x-2"
              >
                <Package className="w-4 h-4" />
                カード表示
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="flex items-center space-x-2"
              >
                <Trophy className="w-4 h-4" />
                推奨表示
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                比較結果をエクスポート
              </Button>
            </div>
          </div>

          {/* Recommendations */}
          {showRecommendations && (
            <div className="mb-8">
              <Grid xs={1} md={2} lg={4} gap={6}>
                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-green-600" />
                      <h3 className="font-bold text-gray-900">総合評価1位</h3>
                    </div>
                    <Badge variant="success" className="bg-green-600 text-white">
                      #1
                    </Badge>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {overallBest?.name_ja || '-'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      バランスの取れた最適選択
                    </p>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-navy-50 to-brixa-100 border-navy-600">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-navy-700" />
                      <h3 className="font-bold text-gray-900">コストパフォーマンス</h3>
                    </div>
                    <Badge variant="info" className="bg-navy-700 text-white">
                      #1
                    </Badge>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {priceBest?.name_ja || '-'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      最も費用対効果が高い選択
                    </p>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-brixa-50 to-brixa-100 border-brixa-600">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-brixa-700" />
                      <h3 className="font-bold text-gray-900">最速納期</h3>
                    </div>
                    <Badge variant="secondary" className="bg-brixa-700 text-white">
                      #1
                    </Badge>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {speedBest?.name_ja || '-'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      最短納期で対応可能
                    </p>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-navy-100 border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <h3 className="font-bold text-gray-900">柔軟性</h3>
                    </div>
                    <Badge variant="secondary" className="bg-purple-600 text-white">
                      #1
                    </Badge>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {flexibleBest?.name_ja || '-'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      小ロットでも対応可能
                    </p>
                  </div>
                </Card>
              </Grid>
            </div>
          )}

          {/* Comparison Table */}
          {comparisonView === 'table' && (
            <Card className="overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-900">比較項目</th>
                      {state.selectedProducts.map((product) => (
                        <th key={product.id} className="text-left p-4 font-semibold text-gray-900">
                          <div className="space-y-2">
                            <div>{product.name_ja}</div>
                            <Badge variant="outline" className="text-xs">
                              {product.category.replace('_', ' ')}
                            </Badge>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Basic Info */}
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">説明</td>
                      {state.selectedProducts.map((product) => (
                        <td key={product.id} className="p-4 text-gray-600">
                          {product.description_ja}
                        </td>
                      ))}
                    </tr>

                    {/* Pricing */}
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">初期費用</td>
                      {state.selectedProducts.map((product) => (
                        <td key={product.id} className="p-4">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency((product.pricing_formula as { base_cost?: number })?.base_cost || 0)}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">単価</td>
                      {state.selectedProducts.map((product) => (
                        <td key={product.id} className="p-4">
                          <span className="font-medium text-gray-900">
                            {formatCurrency((product.pricing_formula as { per_unit_cost?: number })?.per_unit_cost || 0)}/個
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Specifications */}
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">最低注文数量</td>
                      {state.selectedProducts.map((product) => (
                        <td key={product.id} className="p-4">
                          {product.min_order_quantity.toLocaleString()}個
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">納期</td>
                      {state.selectedProducts.map((product) => (
                        <td key={product.id} className="p-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-navy-600" />
                            <span>{product.lead_time_days}日</span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Materials */}
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">対応素材</td>
                      {state.selectedProducts.map((product) => (
                        <td key={product.id} className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {product.materials.map((material) => (
                              <Badge key={material} variant="outline" className="text-xs">
                                {material}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Materials */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">素材</td>
                      {state.selectedProducts.map((product) => (
                        <td key={product.id} className="p-4">
                          <div className="space-y-1">
                            {product.materials.map((material, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-sm text-gray-700">{material}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Comparison Cards */}
          {comparisonView === 'cards' && (
            <Grid xs={1} md={2} lg={3} gap={8}>
              {state.selectedProducts.map((product, index) => (
                <MotionWrapper key={product.id} delay={index * 0.1}>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {product.name_ja}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {product.description_ja}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {product === overallBest && (
                          <Badge variant="success" className="bg-green-600 text-white">
                            <Trophy className="w-3 h-3 mr-1" />
                            総合1位
                          </Badge>
                        )}
                        {product === priceBest && (
                          <Badge variant="info" className="bg-navy-700 text-white">
                            <DollarSign className="w-3 h-3 mr-1" />
                            コスト1位
                          </Badge>
                        )}
                        {product === speedBest && (
                          <Badge variant="secondary" className="bg-brixa-700 text-white">
                            <Clock className="w-3 h-3 mr-1" />
                            速度1位
                          </Badge>
                        )}
                        {product === flexibleBest && (
                          <Badge variant="secondary" className="bg-purple-600 text-white">
                            <Zap className="w-3 h-3 mr-1" />
                            柔軟1位
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">初期費用</p>
                        <p className="font-bold text-gray-900">
                          {formatCurrency((product.pricing_formula as { base_cost?: number })?.base_cost || 0)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">単価</p>
                        <p className="font-bold text-gray-900">
                          {formatCurrency((product.pricing_formula as { per_unit_cost?: number })?.per_unit_cost || 0)}/個
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">最低注文数</p>
                        <p className="font-bold text-gray-900">
                          {product.min_order_quantity.toLocaleString()}個
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">納期</p>
                        <p className="font-bold text-gray-900">
                          {product.lead_time_days}日
                        </p>
                      </div>
                    </div>

                    {/* Materials */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">対応素材</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.materials.map((material) => (
                          <Badge key={material} variant="outline" className="text-xs">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Materials */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">素材</h4>
                      <div className="space-y-2">
                        {product.materials?.slice(0, 3).map((material, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700">{material}</span>
                          </div>
                        )) || [
                          <div key="default" className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700">高品質素材</span>
                          </div>
                        ]}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link href={`/catalog/${product.id}`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          詳細
                        </Button>
                      </Link>
                      <Link href="/quote-simulator">
                        <Button variant="primary" size="sm" className="flex-1">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          見積
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeProduct(product.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <GitCompare className="w-4 h-4 mr-2" />
                        削除
                      </Button>
                    </div>
                  </Card>
                </MotionWrapper>
              ))}
            </Grid>
          )}

          {/* Feature Comparison */}
          {uniqueMaterials.length > 0 && (
            <Card className="p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-navy-600" />
                素材比較マトリクス
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold text-gray-900">素材</th>
                      {state.selectedProducts.map((product) => (
                        <th key={product.id} className="text-center p-3 font-semibold text-gray-900">
                          <div className="text-sm">{product.name_ja}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueMaterials.map((material) => (
                      <tr key={material} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-700">{material}</td>
                        {state.selectedProducts.map((product) => (
                          <td key={product.id} className="p-3 text-center">
                            {product.materials?.includes(material) ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                            <div className="w-5 h-5 mx-auto"></div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Call to Action */}
          <Card className="p-8 bg-gradient-to-r from-navy-600 to-indigo-600 text-white border-navy-600">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                比較結果から最適な製品を選択
              </h2>
              <p className="text-lg mb-8 text-navy-600">
                専門スタッフが最適な包装ソリューションをご提案いたします
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white text-navy-700 hover:bg-gray-100 px-8 py-4"
                  >
                    専門家に相談
                  </Button>
                </Link>
                <Link href="/quote-simulator">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-navy-700 px-8 py-4"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    見積シミュレーション
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </MotionWrapper>
      </Container>
    </div>
  )
}