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
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { PRODUCT_CATEGORIES, getAllProducts } from '@/lib/product-data'
import { ProductSchema } from '@/components/seo/StructuredData'
import { ProductFAQ } from '@/components/catalog/ProductFAQ'
import { ProductDownloads } from '@/components/catalog/ProductDownloads'
import { ProductRelatedCases } from '@/components/catalog/ProductRelatedCases'
import { ProductCertifications } from '@/components/catalog/ProductCertifications'
import type { ProductTabType } from '@/types/product-content'

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

  // 構造化データ用プロパティ
  const materialNames = product.materials.join(', ')
  const categoryInfo = PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]

  return (
    <>
      {/* 構造化データ: Product */}
      <ProductSchema
        name={product.name_ja}
        description={product.description_ja}
        category={categoryInfo?.name_ja || '包装資材'}
        material={materialNames}
        foodGrade={product.tags.some(tag => tag.includes('食品') || tag.includes('Food'))}
        pharmaGrade={product.tags.some(tag => tag.includes('医薬') || tag.includes('医薬品') || tag.includes('Pharmaceutical'))}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brixa-50">
      {/* Breadcrumb */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brixa-600/30 via-transparent to-navy-600/30"></div>
        <Container size="6xl" className="relative z-10 py-6">
          <MotionWrapper delay={0.1}>
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900 transition-colors">
                ホーム
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/catalog" className="hover:text-gray-900 transition-colors">
                製品カタログ
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{product.name_ja}</span>
            </nav>
          </MotionWrapper>
        </Container>
      </section>

      {/* Header Section */}
      <section className="py-8">
        <Container size="6xl">
          <MotionWrapper delay={0.2}>
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/catalog">
                <Button variant="outline" className="inline-flex items-center group">
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  カタログに戻る
                </Button>
              </Link>
            </div>

            {/* Product Header */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Product Image */}
              <div className="space-y-6">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-lg">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-8">
                      <Package className="w-24 h-24 text-brixa-600 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">{product.name_ja}</p>
                      <p className="text-sm text-gray-500 mt-2">製品イメージ</p>
                    </div>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="flex items-center justify-center">
                  <Badge variant="secondary" className="text-lg px-6 py-3 bg-brixa-600 text-brixa-600 border-brixa-600">
                    {categoryInfo?.name_ja || '包装材料'}
                  </Badge>
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <h1 className="text-4xl font-bold text-gray-900">{product.name_ja}</h1>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xl text-gray-600 leading-relaxed">{product.description_ja}</p>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 text-center">
                    <Users className="w-8 h-8 text-navy-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">最小注文数</p>
                    <p className="text-lg font-bold text-gray-900">{product.min_order_quantity.toLocaleString()}{product.id === 'roll-film-001' || product.name_ja === 'ロールフィルム' ? 'M' : '枚'}</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <Clock className="w-8 h-8 text-brixa-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">納期</p>
                    <p className="text-lg font-bold text-gray-900">{product.lead_time_days}日</p>
                  </Card>
                </div>

                {/* Call to Action */}
                <div className="space-y-4">
                  <Link href="/quote-simulator">
                    <Button variant="primary" size="lg" className="w-full text-lg py-4">
                      <Calculator className="w-5 h-5 mr-2" />
                      見積計算を開始
                    </Button>
                  </Link>
                  <Link href="/samples">
                    <Button variant="outline" size="lg" className="w-full text-lg py-4">
                      <Package className="w-5 h-5 mr-2" />
                      サンプル請求
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="secondary" size="lg" className="w-full text-lg py-4">
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
      <section className="py-8 bg-white border-y">
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
                className={`flex items-center space-x-2 pb-4 px-2 border-b-2 transition-colors whitespace-nowrap ${selectedTab === tab.id
                    ? 'border-brixa-600 text-brixa-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
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
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Award className="w-6 h-6 mr-2 text-brixa-600" />
                    製品の特徴
                  </h3>
                  <ul className="space-y-4">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Package className="w-6 h-6 mr-2 text-navy-600" />
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
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Ruler className="w-6 h-6 mr-2 text-navy-600" />
                  技術仕様
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <h4 className="font-semibold text-gray-900 capitalize">
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
                          <p className="text-gray-600">{String(value)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">対応素材</h4>
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
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Package className="w-6 h-6 mr-2 text-green-500" />
                  主な用途
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {product.applications.map((application, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-center">
                      <Package className="w-8 h-8 text-brixa-600 mx-auto mb-2" />
                      <p className="font-medium text-gray-900">{application}</p>
                    </div>
                  ))}
                </div>

                {/* Usage Examples */}
                <div className="mt-8 p-6 bg-navy-50 border border-navy-600 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-navy-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">活用例</h4>
                      <p className="text-sm text-gray-700">
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
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
                    価格情報
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4 bg-gradient-to-br from-brixa-50 to-brixa-600 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">初期費用</p>
                      <p className="text-2xl font-bold text-brixa-700">
                        {formatCurrency(product.pricing_formula.base_cost || 0)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-navy-50 to-navy-600 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">単品費用</p>
                      <p className="text-2xl font-bold text-navy-700">
                        {formatCurrency(product.pricing_formula.per_unit_cost || 0)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">最小注文数</p>
                      <p className="text-2xl font-bold text-green-600">
                        {product.min_order_quantity.toLocaleString()}{product.id === 'roll-film-001' || product.name_ja === 'ロールフィルム' ? 'M' : '枚'}
                      </p>
                    </div>
                  </div>

                  {/* Price Calculator */}
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">簡易価格計算</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-brixa-600"
                            onChange={(e) => {
                              const quantity = parseInt(e.target.value)
                              const total = calculateSamplePrice(quantity)
                              document.getElementById('calculated-price')!.textContent = formatCurrency(total)
                            }}
                          >
                            <option value="1000">1,000個</option>
                            <option value="5000">5,000個</option>
                            <option value="10000">10,000個</option>
                            <option value="50000">50,000個</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">概算合計</label>
                          <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg">
                            <span id="calculated-price" className="font-bold text-brixa-700">
                              {formatCurrency(calculateSamplePrice(1000))}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">単価</label>
                          <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg">
                            <span className="font-bold text-gray-900">
                              {formatCurrency(Math.round(calculateSamplePrice(1000) / 1000))}/個
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-yellow-50 border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">価格について</h4>
                      <p className="text-sm text-gray-700">
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
              <ProductRelatedCases product={product} />
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
        <section className="py-12 bg-white">
          <Container size="6xl">
            <MotionWrapper delay={0.4}>
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">関連製品</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.id} href={`/catalog/${relatedProduct.id}`}>
                    <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <Package className="w-12 h-12 text-brixa-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">{relatedProduct.name_ja}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{relatedProduct.description_ja}</p>
                      <ChevronRight className="w-4 h-4 text-brixa-600 mx-auto mt-3" />
                    </Card>
                  </Link>
                ))}
              </div>
            </MotionWrapper>
          </Container>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-brixa-600 to-amber-600">
        <Container size="4xl">
          <MotionWrapper delay={0.5}>
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">この製品について詳しく知る</h2>
              <p className="text-xl mb-8 text-brixa-600">
                専門スタッフが最適な包装ソリューションをご提案いたします
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/quote-simulator">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white text-brixa-700 hover:bg-gray-100 px-8 py-4"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    見積計算
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-brixa-700 px-8 py-4"
                  >
                    お問い合わせ
                  </Button>
                </Link>
              </div>

              {/* 業界ソリューションへのリンク */}
              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-sm font-medium mb-4 text-brixa-600">業界別ソリューション</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/industry/food-manufacturing" className="text-white hover:text-brixa-600 underline decoration-white/30 hover:decoration-brixa-600/50 transition-all">
                    食品製造業
                  </Link>
                  <span className="text-white/50">•</span>
                  <Link href="/industry/cosmetics" className="text-white hover:text-brixa-600 underline decoration-white/30 hover:decoration-brixa-600/50 transition-all">
                    化粧品業界
                  </Link>
                  <span className="text-white/50">•</span>
                  <Link href="/industry/pharmaceutical" className="text-white hover:text-brixa-600 underline decoration-white/30 hover:decoration-brixa-600/50 transition-all">
                    医薬品業界
                  </Link>
                  <span className="text-white/50">•</span>
                  <Link href="/industry/electronics" className="text-white hover:text-brixa-600 underline decoration-white/30 hover:decoration-brixa-600/50 transition-all">
                    電子機器業界
                  </Link>
                </div>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>
      </div>
    </>
  )
}