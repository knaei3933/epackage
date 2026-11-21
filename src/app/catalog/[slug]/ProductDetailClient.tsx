'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Ruler,
  Clock,
  Calculator,
  CheckCircle,
  Info,
  Star,
  TrendingUp,
  Users,
  Award,
  ChevronRight,
  HelpCircle,
  Download,
  BookOpen,
  Shield
} from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { PRODUCT_CATEGORIES, getAllProducts } from '@/lib/product-data'
import { ProductFAQ } from '@/components/catalog/ProductFAQ'
import { ProductDownloads } from '@/components/catalog/ProductDownloads'
import { ProductRelatedCases } from '@/components/catalog/ProductRelatedCases'
import { ProductCertifications } from '@/components/catalog/ProductCertifications'
import type { ProductTabType } from '@/types/product-content'
import { minOrderLabel, MIN_ORDER_BAG, MIN_ORDER_ROLL } from '@/lib/site-facts'

interface ProductDetailClientProps {
  product: {
    id: string
    category: string
    name_ja: string
    name_en: string
    description_ja: string
    description_en: string
    specifications: any
    materials: string[]
    pricing_formula: any
    min_order_quantity: number
    lead_time_days: number
    tags: string[]
    applications: string[]
    features: string[]
    faq?: Array<{
      question_ja: string
      question_en: string
      answer_ja: string
      answer_en: string
      category?: string
    }>
    downloads?: Array<{
      title_ja: string
      title_en: string
      url: string
      type: 'catalog' | 'spec_sheet' | 'technical_guide'
      size?: string
    }>
    related_case_studies?: string[]
    certifications?: Array<{
      name: string
      issuer: string
      image_url?: string
      description?: string
    }>
  }
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedTab, setSelectedTab] = useState<ProductTabType>('overview')

  const formatCurrency = (amount: number) => `¥${amount.toLocaleString()}`

  const getMaterialName = (material: string) => {
    const materialNames: { [key: string]: string } = {
      'PE': 'ポリエチレン',
      'PP': 'ポリプロピレン',
      'PET': 'PETフィルム',
      'ALUMINUM': 'アルミニウム',
      'PAPER_LAMINATE': 'ラミネート紙',
      '特殊素材': '特殊素材'
    }
    return materialNames[material] || material
  }

  // ロールは長さ（m）、袋は個数で数量を選ぶ。最小は site-facts の値より小さくしない。
  const isRollProduct = product.id === 'roll-film-001' || product.name_ja === 'ロールフィルム'
  const quantityUnit = isRollProduct ? 'm' : '個'
  const minQuantity = isRollProduct ? MIN_ORDER_ROLL : MIN_ORDER_BAG
  const quantityOptions = [500, 1000, 5000, 10000, 50000].filter((q) => q >= minQuantity)
  const [sampleQuantity, setSampleQuantity] = useState<number>(
    quantityOptions.includes(1000) ? 1000 : quantityOptions[0]
  )

  const calculateSamplePrice = (quantity: number = 1000) => {
    const baseCost = product.pricing_formula.base_cost || 0
    const perUnitCost = product.pricing_formula.per_unit_cost || 0
    const total = baseCost + (perUnitCost * quantity)
    return total
  }

  // 関連製品を取得（同じカテゴリの製品）
  const relatedProducts = useMemo(() => {
    const allProducts = getAllProducts(null, 'ja')
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4)
  }, [product.category, product.id])

  const categoryInfo = PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]

  return (
    <>
      <div className="min-h-screen bg-bg-primary">
      {/* パンくずは、全ページ共通の BreadcrumbNav（layout.tsx）が出す。ここには重ねて置かない */}

      {/* Header Section */}
      <section className="py-8">
        <Container size="6xl">
          <MotionWrapper delay={0.2}>
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/catalog" className={buttonVariants({ variant: 'outline' })}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                カタログに戻る
              </Link>
            </div>

            {/* Product Header */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Product Image */}
              <div className="space-y-6">
                <div className="aspect-square bg-bg-secondary rounded-container overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-8">
                      <Package className="w-24 h-24 text-brand mx-auto mb-4" />
                      <p className="text-text-secondary font-medium">{product.name_ja}</p>
                      <p className="text-sm text-text-muted mt-2">製品イメージ</p>
                    </div>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="flex items-center justify-center">
                  <Badge variant="default" size="lg">
                    {categoryInfo?.name_ja || '包装材料'}
                  </Badge>
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <h1 className="text-4xl font-bold text-text-primary">{product.name_ja}</h1>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < 4 ? 'text-warning fill-current' : 'text-text-muted'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xl text-text-secondary leading-relaxed">{product.description_ja}</p>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-brand flex-shrink-0" />
                      <span className="text-text-secondary">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 text-center">
                    <Users className="w-8 h-8 text-brand mx-auto mb-2" />
                    <p className="text-sm text-text-secondary">最小注文数</p>
                    <p className="text-lg font-bold text-text-primary">{minOrderLabel(product.id === 'roll-film-001' || product.name_ja === 'ロールフィルム')}</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <Clock className="w-8 h-8 text-brand mx-auto mb-2" />
                    <p className="text-sm text-text-secondary">納期</p>
                    <p className="text-lg font-bold text-text-primary">{product.lead_time_days}日</p>
                  </Card>
                </div>

                {/* Call to Action */}
                <div className="space-y-4">
                  <Link href="/quote-simulator" className="block">
                    <Button variant="primary" size="lg" className="w-full" icon={<Calculator className="w-5 h-5" aria-hidden="true" />}>
                      見積計算を開始
                    </Button>
                  </Link>
                  <Link href="/samples" className="block">
                    <Button variant="outline" size="lg" className="w-full" icon={<Package className="w-5 h-5" aria-hidden="true" />}>
                      サンプル請求
                    </Button>
                  </Link>
                  <Link href="/contact" className="block">
                    <Button variant="secondary" size="lg" className="w-full">
                      専門家に相談
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* Tab Navigation */}
      <section className="py-8 bg-bg-primary border-y border-border-medium">
        <Container size="6xl">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview' as const, label: '概要', icon: Info },
              { id: 'specifications' as const, label: '仕様', icon: Ruler },
              { id: 'applications' as const, label: '用途', icon: Package },
              { id: 'pricing' as const, label: '価格', icon: TrendingUp },
              // Phase 1 追加タブ
              ...(product.faq && product.faq.length > 0 ? [{ id: 'faq' as const, label: 'FAQ', icon: HelpCircle }] : []),
              ...(product.downloads && product.downloads.length > 0 ? [{ id: 'downloads' as const, label: 'ダウンロード', icon: Download }] : []),
              ...(product.related_case_studies && product.related_case_studies.length > 0 ? [{ id: 'cases' as const, label: '導入事例', icon: BookOpen }] : []),
              ...(product.certifications && product.certifications.length > 0 ? [{ id: 'certifications' as const, label: '認証', icon: Shield }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex min-h-11 items-center space-x-2 pb-2 px-2 border-b-2 transition-colors whitespace-nowrap ${selectedTab === tab.id
                    ? 'border-brand text-brand'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* Tab Content */}
      <section className="py-12">
        <Container size="6xl">
          <MotionWrapper delay={0.3}>
            {/* Overview Tab */}
            {selectedTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8">
                  <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
                    <Award className="w-6 h-6 mr-2 text-brand" />
                    製品の特徴
                  </h3>
                  <ul className="space-y-4">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-brand mt-0.5 flex-shrink-0" />
                        <span className="text-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-8">
                  <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
                    <Package className="w-6 h-6 mr-2 text-brand" />
                    対応製品
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Specifications Tab */}
            {selectedTab === 'specifications' && (
              <Card className="p-8">
                <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
                  <Ruler className="w-6 h-6 mr-2 text-brand" />
                  技術仕様
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <h4 className="font-semibold text-text-primary capitalize">
                        {key.replace(/_/g, ' ')}
                      </h4>
                      <div>
                        {Array.isArray(value) ? (
                          <div className="flex flex-wrap gap-2">
                            {value.map((item: string, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-text-secondary">{String(value)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-text-primary">対応素材</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.materials.map((material, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1">
                          {getMaterialName(material)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Applications Tab */}
            {selectedTab === 'applications' && (
              <Card className="p-8">
                <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
                  <Package className="w-6 h-6 mr-2 text-brand" />
                  主な用途
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {product.applications.map((application, index) => (
                    <div key={index} className="bg-bg-secondary rounded-inner p-4 text-center">
                      <Package className="w-8 h-8 text-brand mx-auto mb-2" />
                      <p className="font-medium text-text-primary">{application}</p>
                    </div>
                  ))}
                </div>

                {/* Usage Examples */}
                <div className="mt-8 p-6 bg-brand-muted border border-brand-soft rounded-container">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-brand mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-text-primary mb-2">活用例</h4>
                      <p className="text-sm text-text-secondary">
                        この製品は{product.applications.slice(0, 3).join('、')}などの分野で広く利用されています。
                        特に{product.features[0]}という特徴が評価されています。
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Pricing Tab */}
            {selectedTab === 'pricing' && (
              <div className="space-y-8">
                <Card className="p-8">
                  <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-brand" />
                    価格情報
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4 bg-bg-secondary rounded-inner">
                      <p className="text-sm text-text-secondary mb-2">初期費用</p>
                      <p className="text-2xl font-bold text-brand">
                        {formatCurrency(product.pricing_formula.base_cost || 0)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-bg-secondary rounded-inner">
                      <p className="text-sm text-text-secondary mb-2">単品費用</p>
                      <p className="text-2xl font-bold text-brand">
                        {formatCurrency(product.pricing_formula.per_unit_cost || 0)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-bg-secondary rounded-inner">
                      <p className="text-sm text-text-secondary mb-2">最小注文数</p>
                      <p className="text-2xl font-bold text-brand">
                        {minOrderLabel(product.id === 'roll-film-001' || product.name_ja === 'ロールフィルム')}
                      </p>
                    </div>
                  </div>

                  {/* Price Calculator */}
                  <div className="p-6 bg-bg-secondary rounded-container">
                    <h4 className="font-semibold text-text-primary mb-4">簡易価格計算</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">数量</label>
                          <select
                            className="h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11"
                            value={sampleQuantity}
                            onChange={(e) => setSampleQuantity(parseInt(e.target.value))}
                          >
                            {quantityOptions.map((q) => (
                              <option key={q} value={q}>{q.toLocaleString('en-US')}{quantityUnit}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">概算合計</label>
                          <div className="w-full px-3 py-2 bg-bg-primary border border-border-strong rounded-md">
                            <span id="calculated-price" className="font-bold text-brand">
                              {formatCurrency(calculateSamplePrice(sampleQuantity))}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary mb-1">単価</label>
                          <div className="w-full px-3 py-2 bg-bg-primary border border-border-strong rounded-md">
                            <span className="font-bold text-text-primary">
                              {formatCurrency(Math.round(calculateSamplePrice(sampleQuantity) / sampleQuantity))}/{quantityUnit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-warning-muted border-warning">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-text-primary mb-2">価格について</h4>
                      <p className="text-sm text-text-secondary">
                        表示価格は参考価格です。実際の価格は仕様、数量、印刷内容によって変動します。
                        正確なお見積もりについては、見積計算ツールをご利用いただくか、直接お問い合わせください。
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* FAQ Tab - Phase 1 */}
            {selectedTab === 'faq' && product.faq && product.faq.length > 0 && (
              <ProductFAQ faqs={product.faq} />
            )}

            {/* Downloads Tab - Phase 1 */}
            {selectedTab === 'downloads' && product.downloads && product.downloads.length > 0 && (
              <ProductDownloads downloads={product.downloads} />
            )}

            {/* Related Cases Tab - Phase 1 */}
            {selectedTab === 'cases' && (
              <ProductRelatedCases {...({ product } as any)} />
            )}

            {/* Certifications Tab - Phase 1 */}
            {selectedTab === 'certifications' && product.certifications && product.certifications.length > 0 && (
              <ProductCertifications certifications={product.certifications} />
            )}
          </MotionWrapper>
        </Container>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 bg-bg-secondary">
          <Container size="6xl">
            <MotionWrapper delay={0.4}>
              <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">関連製品</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.id} href={`/catalog/${relatedProduct.id}`}>
                    <Card className="p-6 text-center hover:shadow-low transition-shadow cursor-pointer h-full">
                      <Package className="w-12 h-12 text-brand mx-auto mb-4" />
                      <h3 className="font-semibold text-text-primary mb-2">{relatedProduct.name_ja}</h3>
                      <p className="text-sm text-text-secondary line-clamp-2">{relatedProduct.description_ja}</p>
                      <ChevronRight className="w-4 h-4 text-brand mx-auto mt-3" />
                    </Card>
                  </Link>
                ))}
              </div>
            </MotionWrapper>
          </Container>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-bg-inverted text-text-inverse">
        <Container size="4xl">
          <MotionWrapper delay={0.5}>
            <div>
              <h2 className="text-2xl md:text-[2rem] font-medium leading-[1.4] mb-4 [word-break:keep-all] [overflow-wrap:anywhere]">この製品について詳しく知る</h2>
              <p className="max-w-[40em] leading-[1.8] mb-8">
                専門スタッフが最適な包装ソリューションをご提案いたします
              </p>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-x-8 mb-8">
                <Link href="/quote-simulator" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                  <Calculator className="w-5 h-5" aria-hidden="true" />
                  見積計算
                </Link>
                <Link href="/contact" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-brand-soft">
                  お問い合わせ
                </Link>
              </div>

              {/* 業界ソリューションへのリンク */}
              <div className="mt-8 pt-8 border-t border-text-muted">
                <p className="text-sm font-medium mb-4">業界別ソリューション</p>
                <ul className="flex flex-wrap gap-x-6 gap-y-3">
                  {[
                    ['/industry/food-manufacturing', '食品製造業'],
                    ['/industry/cosmetics', '化粧品業界'],
                    ['/industry/pharmaceutical', '医薬品業界'],
                    ['/industry/electronics', '電子機器業界'],
                  ].map(([href, label]) => (
                    <li key={href}>
                      <Link href={href} className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-brand-soft">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>
      </div>
    </>
  )
}