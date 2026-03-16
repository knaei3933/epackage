import SampleRequestForm from '@/components/contact/SampleRequestForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パウチサンプルご依頼 | Epackage Lab',
  description: 'Epackage Labのパウチ製品サンプルご依頼フォーム。実際の製品をお手元でお試しいただけます。完全無料で全国発送いたします。',
  keywords: ['パウチサンプル', 'サンプル依頼', 'パウチ請求', '連包裝材', 'Epackage Lab', 'ソフトパウチ', 'スタンドパウチ'],
  alternates: {
    canonical: '/samples',
  },
  openGraph: {
    title: 'パウチサンプルご依頼 | Epackage Lab',
    description: 'Epackage Labのパッキージ製品サンプルご依頼フォーム',
  },
}

export default function SamplesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Hero */}
      <section className="bg-gradient-to-br from-brixa-600 via-brixa-700 to-navy-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            パウチサンプルご依頼
          </h1>
          <p className="text-brixa-100">
            無料でサンプルをお送りいたします
          </p>
        </div>
      </section>

      {/* Sample Request Form */}
      <section className="py-8 bg-gray-50">
        <SampleRequestForm />
      </section>
    </div>
  )
}
