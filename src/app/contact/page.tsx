import ContactForm from '@/components/contact/ContactForm'
import { Metadata } from 'next'
import { TrustSignals } from '@/components/lp/TrustSignals'
import { StrongCTA } from '@/components/lp/StrongCTA'

export const metadata: Metadata = {
  title: 'パウチお問い合わせ | Epackage Lab',
  description: 'パウチ包装に関する専門的なご相談を受け付けています。ソフトパウチ、スタンドパウチ、ガゼットパウチなど6種類のパウチ製品に関するお問い合わせをどうぞ。小ロット500枚から大ロット大量生産まで対応。最短28日納品。化粧品・食品・医薬品業界向け最適な包装ソリューションのご提案。24時間以内にご回答、無料サンプル対応可能。',
  openGraph: {
    title: 'パウチお問い合わせ | Epackage Lab',
    description: 'パウチ包装専門のEpackage Labへのお問い合わせフォーム。24時間以内にご回答、無料サンプル対応可能。',
    type: 'website',
    url: 'https://www.package-lab.com/contact',
    images: [
      {
        url: 'https://www.package-lab.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Epackage Lab お問い合わせ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'パウチお問い合わせ | Epackage Lab',
    description: 'パウチ包装専門のEpackage Labへのお問い合わせフォーム。24時間以内にご回答。',
    images: ['https://www.package-lab.com/images/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.package-lab.com/contact',
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Trust Signals */}
      <section className="bg-gradient-to-br from-brixa-700 via-brixa-800 to-navy-900 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            パウチ包装に関するお問い合わせ
          </h1>
          <p className="text-lg md:text-xl text-brixa-100 mb-8 max-w-3xl mx-auto">
            専門スタッフが最適な包装ソリューションをご提案します。
            <br />
            24時間以内のご回答、無料サンプル対応可能
          </p>
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-green-400 font-semibold">完全無料相談</span>
            <span className="text-white/50">|</span>
            <span className="text-brixa-100">2営業日以内にご回答</span>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <TrustSignals variant="compact" className="py-6 bg-white border-b" />

      {/* Main Content */}
      <div className="py-12">
        <ContactForm />
      </div>

      {/* Additional CTA Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <StrongCTA
            title="お電話でもお気軽にご相談ください"
            description="お急ぎの場合や、詳細をご希望の方はお電話にてご相談をお承りしております"
            primaryText="今すぐ見積もる"
            primaryHref="/quote-simulator"
            secondaryText="サンプル請求"
            secondaryHref="/samples"
            variant="centered"
          />
        </div>
      </section>

      {/* Trust Signals with Certifications */}
      <TrustSignals variant="default" showCertifications={true} />
    </div>
  )
}
