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
import { Button, buttonVariants } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { Grid } from '@/components/ui/Grid'
import { useComparison } from '@/contexts/ComparisonContext'
import { compareProducts, getUniqueMaterials } from '@/contexts/ComparisonContext'

// 商品カテゴリの日本語名（トップの商品カードと同じ呼び名）
const CATEGORY_NAMES: Record<string, string> = {
  flat_3_side: '平袋',
  stand_up: 'スタンドパウチ',
  gusset: 'ギゼットパウチ',
  box: 'BOXパウチ',
  box_with_valve: 'バルブ付きBOXパウチ',
  flat_with_zip: 'ジッパー付き平袋',
  special: '特殊仕様パウチ',
  soft_pouch: 'ソフトパウチ',
  spout_pouch: 'スパウトパウチ',
  pouch: 'パウチ',
  roll_film: 'ロールフィルム',
}

export function ComparisonClient() {
  const { state, clearSelection, removeProduct } = useComparison()
  const [comparisonView, setComparisonView] = useState<'table' | 'cards'>('table')
  const [showRecommendations, setShowRecommendations] = useState(true)

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`

  if (state.selectedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <PageHeader
          title="製品比較"
          lead="製品を比較して、プロジェクトに最適な包装ソリューションを見つけましょう"
          actions={
            <Link href="/catalog" className={buttonVariants({ variant: 'outline', size: 'md' })}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              カタログに戻る
            </Link>
          }
        />
        <Container size="6xl" className="py-16">
          <MotionWrapper delay={0.1}>
            <div className="text-center">
              <Card className="max-w-md mx-auto p-8 bg-warning-muted border-warning">
                <div className="text-center">
                  <Package className="w-12 h-12 text-warning mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    比較する製品がまだありません
                  </h3>
                  <p className="text-text-secondary mb-6">
                    カタログから製品を選んでください。各製品の「比較に追加」を押すと、ここに並びます。
                  </p>
                  <Link href="/catalog" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}>
                      カタログで製品を選ぶ
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
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <PageHeader
        title="製品比較分析"
        lead={`選択された${state.selectedProducts.length}個の製品を詳細に比較分析`}
        actions={
          <>
            <Link href="/catalog" className={buttonVariants({ variant: 'outline', size: 'md' })}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              カタログに戻る
            </Link>
            <Button
              variant="ghost"
              onClick={clearSelection}
              className="text-error hover:bg-error-muted"
            >
              <GitCompare className="w-4 h-4 mr-2" />
              比較をクリア
            </Button>
          </>
        }
      >
        <p className="flex items-center text-sm font-medium text-text-primary">
          <GitCompare className="w-5 h-5 text-brand mr-2" />
          {state.selectedProducts.length}個の製品を比較中
        </p>
      </PageHeader>

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
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-success" />
                      <h3 className="font-bold text-text-primary">総合評価1位</h3>
                    </div>
                    <Badge variant="default">
                      #1
                    </Badge>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-text-primary mb-2">
                      {overallBest?.name_ja || '-'}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      バランスの取れた最適選択
                    </p>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-brand" />
                      <h3 className="font-bold text-text-primary">コストパフォーマンス</h3>
                    </div>
                    <Badge variant="default">
                      #1
                    </Badge>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-text-primary mb-2">
                      {priceBest?.name_ja || '-'}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      最も費用対効果が高い選択
                    </p>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-brand" />
                      <h3 className="font-bold text-text-primary">最速納期</h3>
                    </div>
                    <Badge variant="default">
                      #1
                    </Badge>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-text-primary mb-2">
                      {speedBest?.name_ja || '-'}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      最短納期で対応可能
                    </p>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-brand" />
                      <h3 className="font-bold text-text-primary">柔軟性</h3>
                    </div>
                    <Badge variant="default">
                      #1
                    </Badge>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-text-primary mb-2">
                      {flexibleBest?.name_ja || '-'}
                    </h4>
                    <p className="text-sm text-text-secondary">
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
                  <thead className="bg-bg-secondary border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold text-text-primary">比較項目</th>
                      {state.selectedProducts.map((product) => (
                        <th key={product.id} className="text-left p-4 font-semibold text-text-primary">
                          <div className="space-y-2">
                            <div>{product.name_ja}</div>
                            <Badge variant="outline" className="text-xs">
                              {CATEGORY_NAMES[product.category] ?? product.category}
                            </Badge>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Basic Info */}
                    <tr className="border-b border-border-medium hover:bg-bg-secondary">
                      <td className="p-4 font-medium text-text-primary">説明</td>
                      {state.selectedProducts.map((product) => (
                        <td key={product.id} className="p-4 text-text-secondary">
                          {product.description_ja}
                        </td>
                      ))}
                    </tr>

                    {/* Pricing */}
                    <tr className="border-b border-border-medium hover:bg-bg-secondary">
                      <td className="p-4 font-medium text-text-primary">初期費用</td>
                      {state.selectedProducts.map((product) => (
                        <td key={product.id} className="p-4">
                          <span className="font-semibold text-text-primary">
                            {formatCurrency((product.pricing_formula as { base_cost?: number })?.base_cost || 0)}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-border-medium hover:bg-bg-secondary">
                      <td className="p-4 font-medium text-text-primary">単価</td>
                      {state.selectedProducts.map((product) => (
                        <td key={product.id} className="p-4">
                          <span className="font-medium text-text-primary">
                            {formatCurrency((product.pricing_formula as { per_unit_cost?: number })?.per_unit_cost || 0)}/個
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Specifications */}
                    <tr className="border-b border-border-medium hover:bg-bg-secondary">
                      <td className="p-4 font-medium text-text-primary">最低注文数量</td>
                      {state.selectedProducts.map((product) => (
                        <td key={product.id} className="p-4">
                          {product.min_order_quantity.toLocaleString()}個
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-border-medium hover:bg-bg-secondary">
                      <td className="p-4 font-medium text-text-primary">納期</td>
                      {state.selectedProducts.map((product) => (
                        <td key={product.id} className="p-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-brand" />
                            <span>{product.lead_time_days}日</span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Materials */}
                    <tr className="hover:bg-bg-secondary">
                      <td className="p-4 font-medium text-text-primary">対応素材</td>
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
                  <Card className="p-6 hover:shadow-low transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">
                          {product.name_ja}
                        </h3>
                        <p className="text-text-secondary text-sm">
                          {product.description_ja}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {product === overallBest && (
                          <Badge variant="default">
                            <Trophy className="w-3 h-3 mr-1" />
                            総合1位
                          </Badge>
                        )}
                        {product === priceBest && (
                          <Badge variant="default">
                            <DollarSign className="w-3 h-3 mr-1" />
                            コスト1位
                          </Badge>
                        )}
                        {product === speedBest && (
                          <Badge variant="default">
                            <Clock className="w-3 h-3 mr-1" />
                            速度1位
                          </Badge>
                        )}
                        {product === flexibleBest && (
                          <Badge variant="default">
                            <Zap className="w-3 h-3 mr-1" />
                            柔軟1位
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-3 bg-bg-secondary rounded-lg">
                        <p className="text-xs text-text-secondary mb-1">初期費用</p>
                        <p className="font-bold text-text-primary">
                          {formatCurrency((product.pricing_formula as { base_cost?: number })?.base_cost || 0)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-bg-secondary rounded-lg">
                        <p className="text-xs text-text-secondary mb-1">単価</p>
                        <p className="font-bold text-text-primary">
                          {formatCurrency((product.pricing_formula as { per_unit_cost?: number })?.per_unit_cost || 0)}/個
                        </p>
                      </div>
                      <div className="text-center p-3 bg-bg-secondary rounded-lg">
                        <p className="text-xs text-text-secondary mb-1">最低注文数</p>
                        <p className="font-bold text-text-primary">
                          {product.min_order_quantity.toLocaleString()}個
                        </p>
                      </div>
                      <div className="text-center p-3 bg-bg-secondary rounded-lg">
                        <p className="text-xs text-text-secondary mb-1">納期</p>
                        <p className="font-bold text-text-primary">
                          {product.lead_time_days}日
                        </p>
                      </div>
                    </div>

                    {/* Materials */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-text-primary mb-3">対応素材</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.materials.map((material) => (
                          <Badge key={material} variant="outline" className="text-xs">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link href={`/catalog/${product.id}`} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1 max-sm:min-h-11')}>
                          <Eye className="w-4 h-4 mr-2" />
                          詳細
                        </Link>
                      <Link href="/quote-simulator" className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'flex-1 max-sm:min-h-11')}>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          見積
                        </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeProduct(product.id)}
                        className="text-error hover:bg-error-muted"
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
              <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-brand" />
                素材比較マトリクス
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold text-text-primary">素材</th>
                      {state.selectedProducts.map((product) => (
                        <th key={product.id} className="text-center p-3 font-semibold text-text-primary">
                          <div className="text-sm">{product.name_ja}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueMaterials.map((material) => (
                      <tr key={material} className="border-b border-border-medium hover:bg-bg-secondary">
                        <td className="p-3 font-medium text-text-secondary">{material}</td>
                        {state.selectedProducts.map((product) => (
                          <td key={product.id} className="p-3 text-center">
                            {product.materials?.includes(material) ? (
                              <CheckCircle className="w-5 h-5 text-success mx-auto" />
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
          <div className="rounded-container bg-bg-inverted p-8 text-text-inverse">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                比較結果から最適な製品を選択
              </h2>
              <p className="text-lg mb-8 text-text-inverse">
                専門スタッフが最適な包装ソリューションをご提案いたします
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                  専門家に相談
                </Link>
                <Link href="/quote-simulator" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
                  <BarChart3 className="w-5 h-5 mr-2" />
                  見積シミュレーション
                </Link>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </div>
  )
}