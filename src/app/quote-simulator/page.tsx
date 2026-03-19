'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Container } from '@/components/ui/Container'
import { Layout } from '@/components/layout/Layout'
import { QuoteProvider } from '@/contexts/QuoteContext'
import { MultiQuantityQuoteProvider } from '@/contexts/MultiQuantityQuoteContext'
import { HowToSchema } from '@/components/seo/StructuredData'
import { TrustSignals } from '@/components/lp/TrustSignals'
import { StrongCTA } from '@/components/lp/StrongCTA'
import { QuickActionsSection, QuoteSimulatorHeader } from '@/components/quote/sections'
import { Calculator, BarChart3, Target } from 'lucide-react'

// バンドル最適化: 重いコンポーネントを動的インポート
const ImprovedQuotingWizard = dynamic(
  () => import('@/components/quote/wizards/ImprovedQuotingWizard').then(mod => ({ default: mod.ImprovedQuotingWizard })),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brixa-600 mb-4"></div>
          <p className="text-gray-600">見積もりツールを読み込み中...</p>
        </div>
      </div>
    ),
    ssr: false
  }
)

// 見積もり手順の構造化データ
const quoteHowToData = {
  name: '包装材の見積もり手順',
  description: 'Epackage LabのAI見積もりツールで最適な包装ソリューションの見積もりを取得する方法',
  supplies: [
    'パッケージングの要件',
    '希望するサイズと数量',
    '予算の目安'
  ],
  steps: [
    {
      name: '製品を選択',
      text: 'まず、パッケージングの製品タイプ（平袋、スタンドパウチ、ガゼット袋など）を選択します'
    },
    {
      name: 'サイズと数量を入力',
      text: '製品のサイズ（幅、高さ、マチ）と注文数量を入力します。複数の数量を比較して最適な経済性を確認できます'
    },
    {
      name: '後加工を選択',
      text: 'チャック、ジッパー、バルブなどの後加工オプションを選択します。オプションによって価格が変動します'
    },
    {
      name: '価格を確認',
      text: 'AIが即座に価格を計算し、数量による単価の違いを比較できます。最適な注文数量をご提案します'
    },
    {
      name: '見積を保存または相談',
      text: '見積結果を保存して後で確認するか、専門家に詳細相談を依頼できます'
    }
  ]
}

export default function QuoteSimulatorPage() {
  // Trust Indicators データ
  const trustIndicators = [
    { icon: Calculator, label: '即座に価格算出' },
    { icon: BarChart3, label: '数量で比較検討' },
    { icon: Target, label: '最適数量を提案' }
  ]

  return (
    <>
      {/* 構造化データ: 見積もり手順 */}
      <HowToSchema
        name={quoteHowToData.name}
        description={quoteHowToData.description}
        supplies={quoteHowToData.supplies}
        steps={quoteHowToData.steps}
      />
      <Layout showFooter={false}>
      <div className="min-h-screen">
        {/* Page Title Section */}
        <QuoteSimulatorHeader
          title="統合見積もりシステム"
          description="AI-poweredでお客様のニーズに合わせた最適な包装ソリューションをご提案します"
          currentPageName="統合見積もりシステム"
          trustIndicators={trustIndicators}
        />

        {/* Improved Quote System */}
        <div className="min-h-screen bg-gray-50">
          <QuoteProvider>
            <MultiQuantityQuoteProvider>
              <ImprovedQuotingWizard />
            </MultiQuantityQuoteProvider>
          </QuoteProvider>
        </div>

        {/* Quick Actions - Moved to bottom */}
        <QuickActionsSection />

        {/* Trust Signals Section */}
        <TrustSignals variant="default" showCertifications={true} />

        {/* Strong CTA Section */}
        <section className="py-12 bg-gradient-to-br from-gray-50 via-white to-brixa-50">
          <Container size="6xl">
            <StrongCTA
              title="ご不明点がございましたらお気軽にご相談ください"
              description="専門スタッフが最適な包装ソリューションをご提案します。電話・メール・チャットで迅速に対応いたします。"
              primaryText="今すぐお電話で相談"
              primaryHref="tel:050-1793-6500"
              secondaryText="お問い合わせフォーム"
              secondaryHref="/contact"
            />
          </Container>
        </section>

        </div>
      </Layout>
    </>
  )
}