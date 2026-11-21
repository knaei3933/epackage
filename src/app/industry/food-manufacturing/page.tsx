import { Metadata } from 'next'
import { IndustrySolutionTemplate } from '@/components/industry/IndustrySolutionTemplate'
import { FoodManufacturingContent } from '@/components/industry/FoodManufacturingContent'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

// SEO Metadata for Food Manufacturing
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '食品製造業向けパッケージングソリューション',
    description: '食品製造業向けの専門パッケージングソリューション。厳格な品質管理と鮮度保持技術で、食品包装のコスト見直しを支援。無料見積もりで鮮度保持包装をご相談ください。',
    openGraph: {
      title: '食品製造業向けパッケージングソリューション',
      description: '食品製造業向けの専門パッケージングソリューション。厳格な品質管理と鮮度保持技術を支える包装。',
      type: 'website',
      images: [
        {
          url: '/images/industry/food-manufacturing-og.jpg',
          width: 1200,
          height: 630,
          alt: '食品製造業向けパッケージングソリューション'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: '食品製造業向けパッケージングソリューション',
      description: '食品製造業向けの専門パッケージングソリューション。食品衛生法対応、鮮度保持技術。',
      images: ['/images/industry/food-manufacturing-og.jpg']
    },
    alternates: {
      canonical: '/industry/food-manufacturing'
    },
    other: {
      'food-industry-target': 'manufacturers',
      'solution-focus': 'hygiene-preservation-cost'
    }
  }
}

export default function FoodManufacturingPage() {
  return (
    <>
      <BreadcrumbJsonLd pathname="/industry/food-manufacturing" />
      <IndustrySolutionTemplate
        industry="food-manufacturing"
        title="食品製造業向けパッケージングソリューション"
        subtitle="厳格な品質管理・鮮度保持技術・コスト見直しを支援"
        content={<FoodManufacturingContent />}
      />
    </>
  )
}