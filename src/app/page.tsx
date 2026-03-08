import dynamic from 'next/dynamic'
import { OrganizationSchema, LocalBusinessSchema, FAQSchema, ProductSchema } from '@/components/seo/StructuredData'
import { HeroSection, ProductShowcaseSection, BeforeAfterSection, CTASection, IndustryShowcase } from '@/components/home'
import { AnnouncementBanner } from '@/components/home/AnnouncementBanner'
import { getFeaturedProducts } from '@/lib/products'

const ManufacturingProcessShowcase = dynamic(
  () => import('@/components/home/ManufacturingProcessShowcase').then(m => ({ default: m.ManufacturingProcessShowcase })),
  {
    loading: () => <div className="min-h-[600px] flex items-center justify-center bg-gray-50" aria-label="제조 공정 로딩 중" />,
    ssr: true
  }
)

// ISR for better performance - revalidate every 5 minutes
export const revalidate = 300;

// FAQ Schema data for homepage
const faqData = [
  {
    question: '韓国の包装材の品質は本当に日本の基準に満たしていますか？',
    answer: 'はい、当社の包装材は日本の食品安全規格に完全準拠しており、日本の厳しい品質基準を満たしています。実際に100社以上の日本企業様にご採用いただいております。'
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
    answer: 'はい、食品衛生法、薬機法など日本の主要法規制に完全準拠した製品をご提供しています。必要な証明書も全て整備しております。'
  },
  {
    question: 'カスタマイズはどの程度可能ですか？',
    answer: 'サイズ、印刷、材質、機能など、あらゆる面でのカスタマイズが可能です。お客様の要件に合わせて最適なソリューションをご提案します。'
  }
]

// Main Home Page Component with Performance Monitoring and SEO
export default async function Home() {
  // Fetch featured products from Supabase (cached)
  const featuredProducts = await getFeaturedProducts(6)

  // Supabase 제품 데이터를 Product 스키마 props로 매핑
  const productSchemas = featuredProducts.map(product => ({
    name: product.name_ja || product.name_en,
    description: product.description_ja || product.description_en,
    category: product.category,
    material: product.material_type,
    foodGrade: product.specifications?.food_grade === true,
    pharmaGrade: product.specifications?.pharma_grade === true
  }))

  return (
    <>
      {/* Structured Data for SEO */}
      <OrganizationSchema />
      <LocalBusinessSchema />
      <FAQSchema faqs={faqData} />
      {productSchemas.map(props => (
        <ProductSchema key={props.name} {...props} />
      ))}

      <div className="min-h-screen">
        {/* Announcement Banner - Client-side auth check */}
        <AnnouncementBanner />

        <HeroSection />
        <IndustryShowcase />

        {/* Product Showcase - Dynamic from Supabase */}
        <ProductShowcaseSection products={featuredProducts} />

        {/* Manufacturing Process Showcase - Real Production Images */}
        <ManufacturingProcessShowcase />

        {/* Before & After Section - SEO Improvement */}
        <BeforeAfterSection />

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
