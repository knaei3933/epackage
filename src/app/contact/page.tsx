import { LEAD_TIME_LABEL, REPLY_TIME_LABEL } from '@/lib/site-facts'
import ContactForm from '@/components/contact/ContactForm'
import { Metadata } from 'next'
import { PageHeader } from '@/components/layout'
import { Badge } from '@/components/ui/Badge'
import { ContactFacts, ContactTrustCards } from '@/components/contact/ContactTrust'
import { ContactCTA } from '@/components/contact/ContactCTA'
import { headingFont } from '@/components/home/fonts'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'パウチお問い合わせ',
  description: `パウチ包装に関する専門的なご相談を受け付けています。ソフトパウチ、スタンドパウチ、ガゼットパウチなど6種類のパウチ製品に関するお問い合わせをどうぞ。小ロット500個から大ロット大量生産まで対応。${LEAD_TIME_LABEL}で納品。化粧品・食品・医薬品業界向け最適な包装ソリューションのご提案。${REPLY_TIME_LABEL}にご回答します。無料サンプルにも対応しています。`,
  openGraph: {
    title: 'パウチお問い合わせ',
    description: `パウチ包装専門のEpackage Labへのお問い合わせフォーム。${REPLY_TIME_LABEL}にご回答します。無料サンプルにも対応しています。`,
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
    title: 'パウチお問い合わせ',
    description: `パウチ包装専門のEpackage Labへのお問い合わせフォーム。${REPLY_TIME_LABEL}にご回答します。`,
    images: ['https://www.package-lab.com/images/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.package-lab.com/contact',
  },
}

export default function ContactPage() {
  return (
    <div className={`${headingFont.variable} min-h-screen bg-bg-primary`}>
      <BreadcrumbJsonLd pathname="/contact" />
      <PageHeader
        title="パウチ包装に関するお問い合わせ"
        lead={
          <>
            専門スタッフが最適な包装ソリューションをご提案します。
            <br />
            {REPLY_TIME_LABEL}にご回答します。無料サンプルにも対応しています
          </>
        }
      >
        <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-text-primary">
          <Badge>完全無料相談</Badge>
          <span>{REPLY_TIME_LABEL}にご回答</span>
        </div>
        <ContactFacts />
      </PageHeader>

      {/* Main Content */}
      <div className="bg-bg-primary py-16 md:py-24">
        <ContactForm />
      </div>

      {/* Trust Signals with Certifications */}
      <section className="bg-bg-secondary py-16 md:py-24">
        <ContactTrustCards />
      </section>

      {/* Additional CTA Section */}
      <section className="bg-bg-primary py-16 md:py-24">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
          <ContactCTA
            title="お電話でもお気軽にご相談ください"
            description="お急ぎの場合や、詳細をご希望の方はお電話にてご相談をお承りしております"
            primaryText="今すぐ見積もる"
            primaryHref="/quote-simulator"
            secondaryText="サンプル請求"
            secondaryHref="/samples"
          />
        </div>
      </section>
    </div>
  )
}
