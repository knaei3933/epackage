import { REPLY_TIME_LABEL } from '@/lib/site-facts'
import React from 'react'
import Link from 'next/link'
import { MessageSquare, TrendingUp, Clock, Shield } from 'lucide-react'
import { buttonVariants } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/layout'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import DetailedInquiryForm from '@/components/inquiry/DetailedInquiryForm'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata = {
  title: '詳細お問い合わせ',
  description: '5ステップで最適なパウチソリューションをご提案。リードスコアに基づいた優先対応で、最短導入を支援します。',
  openGraph: {
    title: '詳細お問い合わせ',
    description: '専門家が最適なパウチソリューションをご提案します',
  },
  alternates: {
    canonical: '/inquiry/detailed',
  },
}

export default function DetailedInquiryPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <BreadcrumbJsonLd pathname="/inquiry/detailed" />
      <PageHeader
        title={
          <>
            詳細
            <span className="block">お問い合わせ</span>
          </>
        }
        lead={
          <>
            5ステップであなたの最適なパウチソリューションをご提案します。
            リードスコアに基づき、高品質リードには優先的なご対応をいたします。
          </>
        }
      />

      {/* Features Section */}
      <section className="bg-bg-primary py-16 md:py-24">
        <Container size="6xl">
          <MotionWrapper delay={0.2}>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-muted text-brand">
                  <TrendingUp className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-text-primary">リードスコア</h3>
                <p className="text-sm leading-[1.8] text-text-secondary">
                  お客様の重要度を自動評価し、優先対応
                </p>
              </div>
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-muted text-brand">
                  <Clock className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-text-primary">スピード対応</h3>
                <p className="text-sm leading-[1.8] text-text-secondary">
                  {REPLY_TIME_LABEL}にご連絡します
                </p>
              </div>
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-muted text-brand">
                  <MessageSquare className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-text-primary">詳細ヒアリング</h3>
                <p className="text-sm leading-[1.8] text-text-secondary">
                  5ステップで要件を網羅的に把握
                </p>
              </div>
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-muted text-brand">
                  <Shield className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-text-primary">品質保証</h3>
                <p className="text-sm leading-[1.8] text-text-secondary">
                  専門家による確実なご提案とサポート
                </p>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* Form Section */}
      <section className="bg-bg-secondary py-16 md:py-24">
        <Container size="6xl">
          <MotionWrapper delay={0.3}>
            <DetailedInquiryForm />
          </MotionWrapper>
        </Container>
      </section>

      {/* Process Section */}
      <section className="bg-bg-primary py-16 md:py-24">
        <Container size="6xl">
          <MotionWrapper delay={0.4}>
            <div className="mb-12">
              <h2 className="font-heading text-2xl leading-[1.4] text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                お問い合わせ後の流れ
              </h2>
              <p className="mt-4 max-w-[40em] leading-[1.8] text-text-secondary">
                お客様のリードスコアに応じて、最適な対応プランをご用意
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-muted text-xl font-bold text-on-brand-muted">1</div>
                <h3 className="mb-2 text-xl font-bold text-text-primary">自動スコアリング</h3>
                <p className="leading-[1.8] text-text-secondary">
                  お客様の情報を基にリードスコアを自動算出
                </p>
              </Card>
              <Card className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-muted text-xl font-bold text-on-brand-muted">2</div>
                <h3 className="mb-2 text-xl font-bold text-text-primary">優先対応</h3>
                <p className="leading-[1.8] text-text-secondary">
                  {REPLY_TIME_LABEL}にご連絡します
                </p>
              </Card>
              <Card className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-muted text-xl font-bold text-on-brand-muted">3</div>
                <h3 className="mb-2 text-xl font-bold text-text-primary">最適提案</h3>
                <p className="leading-[1.8] text-text-secondary">
                  リードスコアに応じた最適なソリューションをご提案
                </p>
              </Card>
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="bg-bg-secondary py-16 md:py-24">
        <Container size="4xl">
          <MotionWrapper delay={0.5}>
            <div className="mb-12">
              <h2 className="font-heading text-2xl leading-[1.4] text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                よくあるご質問
              </h2>
              <p className="mt-4 leading-[1.8] text-text-secondary">
                詳細お問い合わせフォームに関するよくある質問
              </p>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-3 text-lg font-bold text-text-primary">
                  Q. リードスコアとは何ですか？
                </h3>
                <p className="leading-[1.8] text-text-secondary">
                  A. お客様の会社規模、予算、要望などから算出される重要度スコアです。
                  高得点ほど高品質なリードとして評価し、優先的なご対応をいたします。
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="mb-3 text-lg font-bold text-text-primary">
                  Q. どのくらいでご連絡がもらえますか？
                </h3>
                <p className="leading-[1.8] text-text-secondary">
                  A. {REPLY_TIME_LABEL}に、専門の担当者からご連絡します。
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="mb-3 text-lg font-bold text-text-primary">
                  Q. 5ステップすべて入力する必要がありますか？
                </h3>
                <p className="leading-[1.8] text-text-secondary">
                  A. はい、最適なご提案のため、すべてのステップでの入力をお願いしております。
                  所要時間は約3分です。
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="mb-3 text-lg font-bold text-text-primary">
                  Q. 個人情報はどのように使用されますか？
                </h3>
                <p className="leading-[1.8] text-text-secondary">
                  A. ご提供いただいた情報は、お問い合わせへの回答と弊社サービスのご案内のみに使用し、
                  第三者に提供することはありません。
                </p>
              </Card>
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-bg-primary py-16 md:py-24">
        <Container size="6xl">
          <MotionWrapper delay={0.6}>
            <div className="rounded-container bg-bg-inverted p-6 text-text-inverse sm:p-8 md:p-12">
              <h2 className="font-heading text-2xl leading-[1.4] [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                まずは簡単なお問い合わせから
              </h2>
              <p className="mt-4 max-w-[40em] leading-[1.8]">
                詳細な入力が難しい場合は、通常のお問い合わせフォームもご利用いただけます
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-x-8">
                <Link href="/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                  通常お問い合わせ
                </Link>
                <Link
                  href="/premium-content"
                  className="inline-flex min-h-11 items-center text-base underline underline-offset-4 hover:text-brand-soft"
                >
                  資料ダウンロード
                </Link>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>
    </div>
  )
}
