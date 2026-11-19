import React from 'react'
import Link from 'next/link'
import { FileText, Calculator, CheckCircle, TrendingUp, Shield, Leaf } from 'lucide-react'
import { buttonVariants } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageHeader, FactList } from '@/components/layout'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import PremiumContentSection from '@/components/premium-content/PremiumContentSection'
import { premiumContents } from '@/types/premium-content'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata = {
  title: 'プレミアムコンテンツ',
  description: '日本パウチ包装市場レポート、ROI計算テンプレート、技術資料などの専門コンテンツを無料ダウンロード。業界の最新トレンドと導入効果を即把握。',
  openGraph: {
    title: 'プレミアムコンテンツ',
    description: 'パウチ包装の専門コンテンツを無料ダウンロード',
  },
  alternates: {
    canonical: '/premium-content',
  },
}

export default function PremiumContentPage() {
  const featuredContents = premiumContents.filter(content => content.featured)
  const otherContents = premiumContents.filter(content => !content.featured)

  return (
    <div className="min-h-screen bg-bg-primary">
      <BreadcrumbJsonLd pathname="/premium-content" />
      <PageHeader
        title={
          <>
            プレミアム
            <span className="block">コンテンツライブラリ</span>
          </>
        }
        lead={
          <>
            業界の専門家が作成したパウチ包装に関する資料を無料でダウンロード。
            市場トレンドからROI計算まで、意思決定に必要な情報がすべて揃っています。
          </>
        }
      >
        <FactList
          items={[
            { value: '5+', label: '専門資料' },
            { value: 'ROI', label: '即時計算可能' },
            { value: '業界最新', label: '2024年版' },
            { value: '1,000+', label: 'DL実績' },
          ]}
        />
      </PageHeader>

      {/* Featured Content */}
      <section className="bg-bg-primary py-16 md:py-24">
        <Container size="6xl">
          <MotionWrapper delay={0.3}>
            <div className="mb-12">
              <h2 className="font-heading text-2xl leading-[1.4] text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                注目コンテンツ
              </h2>
              <p className="mt-4 max-w-[40em] leading-[1.8] text-text-secondary">
                特に人気の高い資料をこちらからダウンロードできます
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredContents.map((content) => (
                <Card key={content.id} className="overflow-hidden">
                  {/* Content Thumbnail */}
                  <div className="relative h-48 overflow-hidden bg-bg-secondary">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {content.category === '市場レポート' && <FileText className="h-16 w-16 text-brand" aria-hidden="true" />}
                      {content.category === 'コスト計算' && <Calculator className="h-16 w-16 text-brand" aria-hidden="true" />}
                      {content.category === '技術資料' && <Shield className="h-16 w-16 text-brand" aria-hidden="true" />}
                      {content.category === '環境対策' && <Leaf className="h-16 w-16 text-brand" aria-hidden="true" />}
                    </div>
                    <Badge variant="default" className="absolute right-4 top-4">
                      注目
                    </Badge>
                  </div>

                  {/* Content Info */}
                  <div className="p-6">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="secondary">{content.category}</Badge>
                      <span className="text-sm text-text-muted">{content.format} • {content.fileSize}</span>
                    </div>

                    <h3 className="mb-3 text-xl font-bold text-text-primary">
                      {content.title}
                    </h3>

                    <p className="mb-4 line-clamp-2 leading-[1.8] text-text-secondary">
                      {content.description}
                    </p>

                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center text-sm text-text-muted">
                        <FileText className="mr-1 h-4 w-4" aria-hidden="true" />
                        {content.pageCount}ページ
                      </div>
                      <div className="flex items-center text-sm text-text-muted">
                        <TrendingUp className="mr-1 h-4 w-4" aria-hidden="true" />
                        スコア: {content.leadScore}/10
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {content.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary">
                          {tag}
                        </Badge>
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
        <section className="bg-bg-secondary py-16 md:py-24">
          <Container size="6xl">
            <MotionWrapper delay={0.4}>
              <div className="mb-12">
                <h2 className="font-heading text-2xl leading-[1.4] text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                  その他の専門資料
                </h2>
                <p className="mt-4 max-w-[40em] leading-[1.8] text-text-secondary">
                  業界標準の資料やガイドラインをご活用ください
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {otherContents.map((content) => (
                  <Card key={content.id} className="flex overflow-hidden">
                    <div className="flex w-24 shrink-0 items-center justify-center bg-bg-secondary sm:w-32">
                      {content.category === 'コンプライアンス' && <Shield className="h-12 w-12 text-brand" aria-hidden="true" />}
                    </div>

                    <div className="flex-1 p-6">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="secondary">{content.category}</Badge>
                        <span className="text-sm text-text-muted">{content.format} • {content.fileSize}</span>
                      </div>

                      <h3 className="mb-2 text-lg font-bold text-text-primary">
                        {content.title}
                      </h3>

                      <p className="mb-4 text-sm leading-[1.8] text-text-secondary">
                        {content.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-text-muted">
                          <FileText className="mr-1 h-4 w-4" aria-hidden="true" />
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
      <section className="bg-bg-primary py-16 md:py-24">
        <Container size="6xl">
          <MotionWrapper delay={0.5}>
            <div className="mb-12">
              <h2 className="font-heading text-2xl leading-[1.4] text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                なぜEpackage Labのコンテンツか？
              </h2>
              <p className="mt-4 max-w-[40em] leading-[1.8] text-text-secondary">
                業界の専門知識と実績に基づいた、信頼できる情報のみを提供
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                { Icon: CheckCircle, title: '業界最新データ', text: '2024年の最新市場動向と統計データを反映' },
                { Icon: Calculator, title: '実用的ツール', text: '即座に使えるExcelテンプレートと計算シート' },
                { Icon: Shield, title: '法規制対応', text: '食品衛生法やPL法など関連法規を網羅' },
              ].map(({ Icon, title, text }) => (
                <Card key={title} className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-muted text-brand">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-text-primary">{title}</h3>
                  <p className="leading-[1.8] text-text-secondary">{text}</p>
                </Card>
              ))}
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-bg-secondary py-16 md:py-24">
        <Container size="6xl">
          <MotionWrapper delay={0.6}>
            <div className="rounded-container bg-bg-inverted p-6 text-text-inverse sm:p-8 md:p-12">
              <h2 className="font-heading text-2xl leading-[1.4] [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                専門家に相談する
              </h2>
              <p className="mt-4 max-w-[40em] leading-[1.8]">
                コンテンツをご覧いただき、具体的な導入プランについてご相談ください
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-x-8">
                <Link href="/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                  無料相談する
                </Link>
                <Link
                  href="/quote-simulator"
                  className="inline-flex min-h-11 items-center text-base underline underline-offset-4 hover:text-brand-soft"
                >
                  見積もりシミュレーション
                </Link>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>
    </div>
  )
}
