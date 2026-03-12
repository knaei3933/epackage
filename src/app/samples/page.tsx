import SampleRequestForm from '@/components/contact/SampleRequestForm'
import { Metadata } from 'next'
import { TrustSignals } from '@/components/lp/TrustSignals'
import { StrongCTA } from '@/components/lp/StrongCTA'

export const metadata: Metadata = {
  title: 'パウチサンプルご依頼 | Epackage Lab',
  description: 'Epackage Labのパウチ製品サンプルご依頼フォーム。実際の製品をお手元でお試しいただけます。完全無料で全国発送いたします。',
  keywords: ['パウチサンプル', 'サンプル依頼', 'パウチ請求', '連包裝材', 'Epackage Lab', 'ソフトパウチ', 'スタンドパウチ'],
  openGraph: {
    title: 'パウチサンプルご依頼 | Epackage Lab',
    description: 'Epackage Labのパッキージ製品サンプルご依頼フォーム',
  },
}

export default function SamplesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brixa-600 via-brixa-700 to-navy-800 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <span className="text-green-400 font-semibold text-sm">完全無料</span>
            <span className="text-white/50">|</span>
            <span className="text-brixa-100 text-sm">全国発送</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            パウチサンプルをご依頼ください
          </h1>
          <p className="text-lg md:text-xl text-brixa-100 mb-6 max-w-3xl mx-auto">
            実際の製品をお手元でお試しいただけます。
            <br />
            ご要望に合わせてカスタマイズも可能です。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-brixa-100">
            <span>完全無料</span>
            <span>・</span>
            <span>迅速発送</span>
            <span>・</span>
            <span>最大6種類まで</span>
          </div>
        </div>
      </section>

      {/* Trust Signals Compact */}
      <TrustSignals variant="compact" className="py-6 bg-white border-b shadow-sm" />

      {/* Sample Request Form */}
      <section className="py-12 bg-gray-50">
        <SampleRequestForm />
      </section>

      {/* Strong CTA */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <StrongCTA
            title="ご質問やご不明点がございましたら"
            description="お電話やメールでもお気軽にご相談ください"
            primaryText="お電話で相談"
            primaryHref="tel:050-1793-6500"
            secondaryText="お問い合わせフォーム"
            secondaryHref="/contact"
            variant="centered"
          />
        </div>
      </section>
    </div>
  )
}
