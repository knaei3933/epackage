import { Metadata } from 'next'
import { IndustrySolutionTemplate } from '@/components/industry/IndustrySolutionTemplate'
import { CosmeticsContent } from '@/components/industry/industries/CosmeticsContent'

// SEO Metadata for Cosmetics
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: '化粧品業界向け高級パッケージングソリューション | Epackage Lab',
      template: '%s | Epackage Lab'
    },
    description: '化粧品業界向けのプレミアムパッケージングソリューション。ブランド価値向上、欧州・日本認証対応、持続可能性を考慮した包装で実際の売上増を実現。',
    keywords: [
      '化粧品包装',
      'コスメパッケージ',
      '化粧品業界',
      '高級包装',
      'ラグジュアリー包装',
      'ブランド価値',
      '化粧品容器',
      '欧州認証',
      '日本認証',
      'セキュリティ包装',
      '持続可能包装',
      '化粧品ソリューション',
      '美容業界',
      '化粧品包材',
      'Epackage Lab'
    ],
    openGraph: {
      title: '化粧品業界向け高級パッケージングソリューション | Epackage Lab',
      description: '化粧品業界向けのプレミアムパッケージングソリューション。ブランド価値向上と実際の売上増を実現。',
      type: 'website',
      images: [
        {
          url: '/images/industry/cosmetics-og.jpg',
          width: 1200,
          height: 630,
          alt: '化粧品業界向け高級パッケージングソリューション'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: '化粧品業界向け高級パッケージングソリューション | Epackage Lab',
      description: '化粧品業界向けのプレミアムパッケージングソリューション。ブランド価値向上と実際の売上増を実現。',
      images: ['/images/industry/cosmetics-og.jpg']
    },
    alternates: {
      canonical: '/industry/cosmetics',
      languages: {
        'ja': '/ja/industry/cosmetics',
        'en': '/en/industry/cosmetics'
      }
    },
    other: {
      'cosmetics-industry-target': 'premium-brands',
      'solution-focus': 'brand-value-sustainability',
      'sales-improvement': 'actual-increase'
    }
  }
}

export default function CosmeticsPage() {
  return (
    <IndustrySolutionTemplate
      industry="cosmetics"
      title="化粧品業界向け高級パッケージングソリューション"
      subtitle="ブランド価値向上・欧日認証対応・持続可能性を実現"
      content={<CosmeticsContent />}
    />
  )
}