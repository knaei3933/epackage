import { Metadata } from 'next'
import { IndustrySolutionTemplate } from '@/components/industry/IndustrySolutionTemplate'
import { PharmaceuticalContent } from '@/components/industry/PharmaceuticalContent'

// Force dynamic rendering to prevent useSearchParams bailout during build
export const dynamic = 'force-dynamic';

// SEO Metadata for Pharmaceuticals
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: '医薬品業界向けGMP対応パッケージングソリューション | Epackage Lab',
      template: '%s | Epackage Lab'
    },
    description: '医薬品業界向けの専門パッケージングソリューション。GMP準拠、薬機法対応、小児安全包装で実際の導入事例多数。医薬品企業の信頼を裏切らない包装ソリューション。今すぐ無料見積もりでGMP対応包装を依頼。',
    keywords: [
      '医薬品包装',
      '医薬品業界',
      'GMP包装',
      '薬機法',
      '医薬品パッケージ',
      '小児安全包装',
      '医療用包装',
      '医薬品容器',
      '薬品包装',
      '医療包装',
      '医薬品ソリューション',
      '医薬品業界',
      '医療関連',
      '医薬品包装材',
      'Epackage Lab'
    ],
    openGraph: {
      title: '医薬品業界向けGMP対応パッケージングソリューション | Epackage Lab',
      description: '医薬品業界向けの専門パッケージングソリューション。GMP準拠と実際の導入事例で信頼を提供。',
      type: 'website',
      images: [
        {
          url: '/images/industry/pharmaceutical-og.jpg',
          width: 1200,
          height: 630,
          alt: '医薬品業界向けGMP対応パッケージングソリューション'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: '医薬品業界向けGMP対応パッケージングソリューション | Epackage Lab',
      description: '医薬品業界向けの専門パッケージングソリューション。GMP準拠と実際の導入事例で信頼を提供。',
      images: ['/images/industry/pharmaceutical-og.jpg']
    },
    alternates: {
      canonical: '/industry/pharmaceutical',
      languages: {
        'ja': '/ja/industry/pharmaceutical',
        'en': '/en/industry/pharmaceutical'
      }
    },
    other: {
      'pharma-industry-target': 'pharmaceutical-companies',
      'solution-focus': 'gmp-compliance-safety',
      'cases-count': 'multiple-success-stories'
    }
  }
}

export default function PharmaceuticalPage() {
  return (
    <IndustrySolutionTemplate
      industry="pharmaceutical"
      title="医薬品業界向けGMP対応パッケージングソリューション"
      subtitle="薬機法準拠・小児安全包装・保護機能強化を実現"
      content={<PharmaceuticalContent />}
    />
  )
}