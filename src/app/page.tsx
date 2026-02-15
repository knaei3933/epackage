import { OrganizationSchema, LocalBusinessSchema, FAQSchema } from '@/components/seo/StructuredData'
import { ManufacturingProcessShowcase } from '@/components/home/ManufacturingProcessShowcase'
import { HeroSection, ProductShowcaseSection, CTASection, IndustryShowcase } from '@/components/home'
import { AnnouncementBanner } from '@/components/home/AnnouncementBanner'
import { getFeaturedProducts, getLatestAnnouncements } from '@/lib/products'
import { getAuthenticatedUser } from '@/lib/supabase/server'

// FAQ Schema data for homepage
const faqData = [
  {
    question: '韓国の包装材の品質は本当に日本の基準に満たしていますか？',
    answer: 'はい、当社の包装材はJIS規格などの国際標準に完全準拠しており、日本の厳しい品質基準を満たしています。実際に100社以上の日本企業様にご採用いただいております。'
  },
  {
    question: '最低注文数量（MOQ）はどのくらいですか？',
    answer: '製品によって異なりますが、一般的に500個から1000個からの対応が可能です。小ロット試作にも柔軟に対応いたしますので、まずはお気軽にご相談ください。'
  },
  {
    question: '納期はどのくらいかかりますか？',
    answer: '標準的な製品で最短21日、通常25-30日での納品が可能です。緊急のご要望には最優先で対応いたしますので、お気軽にご相談ください。'
  },
  {
    question: '日本の法規制（食品衛生法、薬機法など）に対応していますか？',
    answer: 'はい、食品衛生法、薬機法、JIS規格など日本の主要法規制に完全準拠した製品をご提供しています。必要な証明書も全て整備しております。'
  },
  {
    question: 'カスタマイズはどの程度可能ですか？',
    answer: 'サイズ、印刷、材質、機能など、あらゆる面でのカスタマイズが可能です。お客様の要件に合わせて最適なソリューションをご提案します。'
  }
]

// Main Home Page Component with Performance Monitoring and SEO
export default async function Home() {
  // Check if user is authenticated
  const user = await getAuthenticatedUser()

  // Fetch dynamic data from Supabase
  // Only fetch announcements if user is authenticated
  const featuredProducts = await getFeaturedProducts(6)
  const announcements = user ? await getLatestAnnouncements(3) : []

  return (
    <>
      {/* Structured Data for SEO */}
      <OrganizationSchema />
      <LocalBusinessSchema />
      <FAQSchema faqs={faqData} />

      <div className="min-h-screen">
        {/* Announcement Banner - Only for authenticated users */}
        {user && announcements.length > 0 && (
          <AnnouncementBanner announcements={announcements} />
        )}

        <HeroSection />
        <IndustryShowcase />

        {/* Product Showcase - Dynamic from Supabase */}
        <ProductShowcaseSection products={featuredProducts} />

        {/* Manufacturing Process Showcase - Real Production Images */}
        <ManufacturingProcessShowcase />

        {/* Removed sections as per modification request:
            - ComplianceSection (日本規制準拠と信頼構築)
            - TrustSignalsSection (信頼の証明)
            - CertificationBadges (認証・規格証明)
            - JapanBusinessSupport (日本企業向けビジネスサポート)
          */}
        <CTASection />
      </div>
    </>
  )
}
