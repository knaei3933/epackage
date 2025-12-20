import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, FileText, Calculator, CheckCircle, TrendingUp, Shield, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import PremiumContentSection from '@/components/premium-content/PremiumContentSection'
import { premiumContents } from '@/types/premium-content'

export const metadata = {
  title: 'プレミアムコンテンツ | Epackage Lab',
  description: '日本パウチ包装市場レポート、ROI計算テンプレート、技術資料などの専門コンテンツを無料ダウンロード。業界の最新トレンドと導入効果を即把握。',
  keywords: ['パウチ市場レポート', 'ROI計算', '技術資料', '包装ガイド', 'Epackage Lab'],
  openGraph: {
    title: 'プレミアムコンテンツ | Epackage Lab',
    description: 'パウチ包装の専門コンテンツを無料ダウンロード',
  },
}

export default function PremiumContentPage() {
  const featuredContents = premiumContents.filter(content => content.featured)
  const otherContents = premiumContents.filter(content => !content.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-green-50">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-600/30 via-transparent to-green-100/30"></div>

        <Container size="6xl" className="relative z-10 py-16">
          <MotionWrapper delay={0.1}>
            {/* Breadcrumb */}
            <nav className="mb-8">
              <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                ホームに戻る
              </Link>
            </nav>

            {/* Page Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-navy-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-10 h-10 text-white" />
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                <span className="block text-navy-700">プレミアム</span>
                <span className="block text-gray-900">コンテンツライブラリ</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                業界の専門家が作成したパウチ包装に関する資料を無料でダウンロード。<br />
                市場トレンドからROI計算まで、意思決定に必要な情報がすべて揃っています。
              </p>
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <Container size="6xl">
          <MotionWrapper delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-navy-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">5+</h3>
                <p className="text-gray-600">専門資料</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">ROI</h3>
                <p className="text-gray-600">即時計算可能</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-brixa-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-brixa-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">業界最新</h3>
                <p className="text-gray-600">2024年版</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">1,000+</h3>
                <p className="text-gray-600">DL実績</p>
              </Card>
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* Featured Content */}
      <section className="pb-16">
        <Container size="6xl">
          <MotionWrapper delay={0.3}>
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                🌟 注目コンテンツ
              </h2>
              <p className="text-xl text-gray-600">
                特に人気の高い資料をこちらからダウンロードできます
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredContents.map((content, index) => (
                <Card key={content.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Content Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-navy-600 to-indigo-100 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {content.category === '市場レポート' && <FileText className="w-16 h-16 text-navy-700" />}
                      {content.category === 'コスト計算' && <Calculator className="w-16 h-16 text-green-600" />}
                      {content.category === '技術資料' && <Shield className="w-16 h-16 text-brixa-700" />}
                      {content.category === '環境対策' && <Leaf className="w-16 h-16 text-green-500" />}
                    </div>
                    <div className="absolute top-4 right-4 bg-brixa-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      注目
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block bg-navy-600 text-navy-600 text-xs font-semibold px-3 py-1 rounded-full">
                        {content.category}
                      </span>
                      <span className="text-sm text-gray-500">{content.format} • {content.fileSize}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-navy-700 transition-colors">
                      {content.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {content.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FileText className="w-4 h-4 mr-1" />
                        {content.pageCount}ページ
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        スコア: {content.leadScore}/10
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {content.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <PremiumContentSection content={content} />
                  </div>
                </Card>
              ))}
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* Other Content */}
      {otherContents.length > 0 && (
        <section className="pb-16">
          <Container size="6xl">
            <MotionWrapper delay={0.4}>
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  その他の専門資料
                </h2>
                <p className="text-xl text-gray-600">
                  業界標準の資料やガイドラインをご活用ください
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {otherContents.map((content, index) => (
                  <Card key={content.id} className="flex hover:shadow-lg transition-shadow">
                    <div className="w-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                      {content.category === 'コンプライアンス' && <Shield className="w-12 h-12 text-gray-600" />}
                    </div>

                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                          {content.category}
                        </span>
                        <span className="text-sm text-gray-500">{content.format} • {content.fileSize}</span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {content.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4">
                        {content.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <FileText className="w-4 h-4 mr-1" />
                          {content.pageCount}ページ
                        </div>
                        <PremiumContentSection content={content} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </MotionWrapper>
          </Container>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-r from-navy-700 to-indigo-600">
        <Container size="6xl">
          <MotionWrapper delay={0.5}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                なぜEpackage Labのコンテンツか？
              </h2>
              <p className="text-xl text-navy-600">
                業界の専門知識と実績に基づいた、信頼できる情報のみを提供
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">業界最新データ</h3>
                <p className="text-navy-600">
                  2024年の最新市場動向と統計データを反映
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">実用的ツール</h3>
                <p className="text-navy-600">
                  即座に使えるExcelテンプレートと計算シート
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">法規制対応</h3>
                <p className="text-navy-600">
                  食品衛生法やPL法など関連法規を網羅
                </p>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-brixa-600 to-amber-600">
        <Container size="4xl">
          <MotionWrapper delay={0.6}>
            <Card className="p-8 md:p-12 text-center bg-transparent text-white border-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                専門家に相談する
              </h2>
              <p className="text-xl mb-8 text-brixa-600">
                コンテンツをご覧いただき、具体的な導入プランについてご相談ください
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact/">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white text-brixa-700 hover:bg-gray-100 px-8 py-4"
                  >
                    無料相談する
                  </Button>
                </Link>
                <Link href="/roi-calculator/">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-brixa-700 px-8 py-4"
                  >
                    見積もりシミュレーション
                  </Button>
                </Link>
              </div>
            </Card>
          </MotionWrapper>
        </Container>
      </section>
    </div>
  )
}