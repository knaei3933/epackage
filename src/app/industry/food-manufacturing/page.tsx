import { Metadata } from 'next'
import { IndustrySolutionTemplate } from '@/components/industry/IndustrySolutionTemplate'
import { FoodManufacturingContent } from '@/components/industry/FoodManufacturingContent'

// Force dynamic rendering to prevent useSearchParams bailout during build
export const dynamic = 'force-dynamic';

// SEO Metadata for Food Manufacturing
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: '食品製造業向けパッケージングソリューション | Epackage Lab',
      template: '%s | Epackage Lab'
    },
    description: '食品製造業向けの専門パッケージングソリューション。食品衛生法対応、鮮度保持技術、30%のコスト削減を実現。実際の導入事例とROIデータを公開。今すぐ無料見積もりで鮮度保持包装を依頼。',
    keywords: [
      '食品包装',
      '食品製造業',
      '食品衛生法',
      'パッケージングソリューション',
      '食品容器',
      '保鲜包装',
      'コスト削減',
      '食品包装材',
      '衛生包装',
      '鮮度保持',
      '食品業界',
      '包装ソリューション',
      '食品安全',
      '食品パッケージ',
      'Epackage Lab'
    ],
    openGraph: {
      title: '食品製造業向けパッケージングソリューション | Epackage Lab',
      description: '食品製造業向けの専門パッケージングソリューション。食品衛生法対応、鮮度保持技術で30%のコスト削減を実現。',
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
      title: '食品製造業向けパッケージングソリューション | Epackage Lab',
      description: '食品製造業向けの専門パッケージングソリューション。食品衛生法対応、鮮度保持技術で30%のコスト削減。',
      images: ['/images/industry/food-manufacturing-og.jpg']
    },
    alternates: {
      canonical: '/industry/food-manufacturing',
      languages: {
        'ja': '/ja/industry/food-manufacturing',
        'en': '/en/industry/food-manufacturing'
      }
    },
    other: {
      'food-industry-target': 'manufacturers',
      'solution-focus': 'hygiene-preservation-cost',
      'roi-improvement': '30%'
    }
  }
}

export default function FoodManufacturingPage() {
  return (
    <IndustrySolutionTemplate
      industry="food-manufacturing"
      title="食品製造業向けパッケージングソリューション"
      subtitle="食品衛生法準拠・鮮度保持技術・30%コスト削減を実現"
      content={<FoodManufacturingContent />}
    />
  )
}