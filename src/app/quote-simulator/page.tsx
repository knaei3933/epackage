'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Calculator, FileText, Phone, Mail, Target, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Layout } from '@/components/layout/Layout'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { ImprovedQuotingWizard } from '@/components/quote/ImprovedQuotingWizard'
import { QuoteProvider } from '@/contexts/QuoteContext'
import { MultiQuantityQuoteProvider } from '@/contexts/MultiQuantityQuoteContext'
import { Card } from '@/components/ui/Card'

export default function QuoteSimulatorPage() {
  return (
    <Layout showFooter={false}>
      <div className="min-h-screen">
        {/* Page Title - Only show once */}
        <section className="py-8 bg-gradient-to-br from-navy-700 to-navy-900 border-b">
          <Container size="6xl">
            <MotionWrapper delay={0.1}>
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm text-navy-200 mb-4" aria-label="パンくずリスト">
                <Link href="/" className="hover:text-white transition-colors">
                  ホーム
                </Link>
                <span>/</span>
                <span className="text-white font-medium">統合見積もりシステム</span>
              </nav>

              {/* Page Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                統合見積もりシステム
              </h1>
              <p className="text-navy-100 text-lg">
                AI-poweredでお客様のニーズに合わせた最適な包装ソリューションをご提案します
              </p>
            </MotionWrapper>
          </Container>
        </section>

        {/* Improved Quote System */}
        <div className="min-h-screen bg-gray-50">
          <QuoteProvider>
            <MultiQuantityQuoteProvider>
              <ImprovedQuotingWizard />
            </MultiQuantityQuoteProvider>
          </QuoteProvider>
        </div>

        {/* Quick Actions - Moved to bottom */}
        <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-brixa-50">
          <Container size="6xl">
            <MotionWrapper delay={0.4}>
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  その他のご案内
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  お見積もり以外のご要望にお応えします
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto px-4 sm:px-0">
                <Link href="/quote-simulator" className="group hover-glow">
                  <Card className="quick-actions-card p-6 border-brixa-200 hover:border-brixa-400 bg-gradient-to-br from-brixa-50 via-white to-brixa-50">
                    <div className="relative z-10">
                      <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brixa-600 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-brixa-700 transition-colors flex-shrink-0">
                          <Calculator className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 group-hover:text-brixa-700 transition-colors text-base sm:text-lg mb-1">
                            統合見積もりツール
                          </h3>
                          <p className="text-sm text-gray-600 font-medium">AI即時見積もり</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="inline-flex items-center text-xs text-brixa-700 font-semibold bg-brixa-100 px-3 py-1.5 rounded-full">
                          <Calculator className="w-3 h-3 mr-1.5 flex-shrink-0" />
                          複数数量で比較
                        </span>
                        <span className="text-sm text-brixa-600 group-hover:text-brixa-700 transition-colors font-medium">
                          現在地で利用中 →
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>

                <Link href="/contact" className="group hover-glow">
                  <Card className="quick-actions-card p-6 hover:border-blue-400 bg-white">
                    <div className="relative z-10">
                      <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:from-blue-600 group-hover:to-blue-700 transition-all flex-shrink-0">
                          <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-base sm:text-lg mb-1">
                            詳細見積もり
                          </h3>
                          <p className="text-sm text-gray-600 font-medium">専門家相談</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="inline-flex items-center text-xs text-blue-700 font-semibold bg-blue-100 px-3 py-1.5 rounded-full">
                          詳細仕様対応
                        </span>
                        <span className="text-sm text-blue-600 group-hover:text-blue-700 transition-colors font-medium">
                          お問い合わせ →
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>

                <a href="tel:+81-80-6942-7235" className="group hover-glow">
                  <Card className="quick-actions-card p-6 hover:border-purple-400 bg-white">
                    <div className="relative z-10">
                      <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:from-purple-600 group-hover:to-purple-700 transition-all flex-shrink-0">
                          <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors text-base sm:text-lg mb-1">
                            即時相談
                          </h3>
                          <p className="text-sm text-gray-600 font-medium">電話でご相談</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="inline-flex items-center text-xs text-purple-700 font-semibold bg-purple-100 px-3 py-1.5 rounded-full">
                          即時対応
                        </span>
                        <span className="text-sm text-purple-600 group-hover:text-purple-700 transition-colors font-medium">
                          発信 →
                        </span>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="block bg-gradient-to-r from-purple-50 to-blue-50 text-sm text-gray-700 font-medium py-2.5 px-4 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors cursor-pointer">
                          +81-80-6942-7235
                        </div>
                      </div>
                    </div>
                  </Card>
                </a>
              </div>
            </MotionWrapper>
          </Container>
        </section>

        </div>
    </Layout>
  )
}