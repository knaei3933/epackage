import React from 'react'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, TrendingUp, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import DetailedInquiryForm from '@/components/inquiry/DetailedInquiryForm'

export const metadata = {
  title: '詳細お問い合わせ | Epackage Lab',
  description: '5ステップで最適なパウチソリューションをご提案。リードスコアに基づいた優先対応で、最短導入を支援します。',
  keywords: ['詳細お問い合わせ', 'パウチ相談', 'リードスコア', '優先対応', 'Epackage Lab'],
  openGraph: {
    title: '詳細お問い合わせ | Epackage Lab',
    description: '専門家が最適なパウチソリューションをご提案します',
  },
}

export default function DetailedInquiryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-brixa-50">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/30 via-transparent to-purple-100/30"></div>

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
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                <span className="block text-indigo-600">詳細</span>
                <span className="block text-gray-900">お問い合わせ</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                5ステップであなたの最適なパウチソリューションをご提案します。<br />
                リードスコアに基づき、高品質リードには優先的なご対応をいたします。
              </p>
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <Container size="6xl">
          <MotionWrapper delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">リードスコア</h3>
                <p className="text-gray-600 text-sm">
                  お客様の重要度を自動評価し、優先対応
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">スピード対応</h3>
                <p className="text-gray-600 text-sm">
                  高品質リードは4時間以内にご連絡
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-navy-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">詳細ヒアリング</h3>
                <p className="text-gray-600 text-sm">
                  5ステップで要件を網羅的に把握
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">品質保証</h3>
                <p className="text-gray-600 text-sm">
                  専門家による確実なご提案とサポート
                </p>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* Form Section */}
      <section className="pb-16">
        <Container size="6xl">
          <MotionWrapper delay={0.3}>
            <DetailedInquiryForm />
          </MotionWrapper>
        </Container>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <Container size="6xl">
          <MotionWrapper delay={0.4}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                お問い合わせ後の流れ
              </h2>
              <p className="text-xl text-indigo-100">
                お客様のリードスコアに応じて、最適な対応プランをご用意
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-white text-xl font-bold">1</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">自動スコアリング</h3>
                <p className="text-indigo-100">
                  お客様の情報を基にリードスコアを自動算出
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-white text-xl font-bold">2</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">優先対応</h3>
                <p className="text-indigo-100">
                  高品質リードは4時間以内、通常は24時間以内にご連絡
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-white text-xl font-bold">3</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">最適提案</h3>
                <p className="text-indigo-100">
                  リードスコアに応じた最適なソリューションをご提案
                </p>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <Container size="4xl">
          <MotionWrapper delay={0.5}>
            <div className="mb-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                よくあるご質問
              </h2>
              <p className="text-xl text-gray-600">
                詳細お問い合わせフォームに関するよくある質問
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Q. リードスコアとは何ですか？
                </h3>
                <p className="text-gray-600">
                  A. お客様の会社規模、予算、要望などから算出される重要度スコアです。
                  高得点ほど高品質なリードとして評価し、優先的なご対応をいたします。
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Q. どのくらいでご連絡がもらえますか？
                </h3>
                <p className="text-gray-600">
                  A. リードスコア70点以上のお客様は4時間以内、それ以外のお客様は24時間以内に
                  専門担当者よりご連絡いたします。
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Q. 5ステップすべて入力する必要がありますか？
                </h3>
                <p className="text-gray-600">
                  A. はい、最適なご提案のため、すべてのステップでの入力をお願いしております。
                  所要時間は約3分です。
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Q. 個人情報はどのように使用されますか？
                </h3>
                <p className="text-gray-600">
                  A. ご提供いただいた情報は、お問い合わせへの回答と弊社サービスのご案内のみに使用し、
                  第三者に提供することはありません。
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
            <div className="text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                まずは簡単なお問い合わせから
              </h2>
              <p className="text-xl mb-8 text-brixa-600">
                詳細な入力が難しい場合は、通常のお問い合わせフォームもご利用いただけます
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact/">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white text-brixa-600 hover:bg-gray-100 px-8 py-4"
                  >
                    通常お問い合わせ
                  </Button>
                </Link>
                <Link href="/premium-content/">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-brixa-600 px-8 py-4"
                  >
                    資料ダウンロード
                  </Button>
                </Link>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>
    </div>
  )
}