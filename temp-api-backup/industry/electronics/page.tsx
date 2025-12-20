import { Metadata } from 'next'
import { IndustrySolutionTemplate } from '@/components/industry/IndustrySolutionTemplate'
import { ElectronicsContent } from '@/components/industry/industries/ElectronicsContent'

// SEO Metadata for Electronics
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: '電子部品業界向けESD対応パッケージングソリューション | Epackage Lab',
      template: '%s | Epackage Lab'
    },
    description: '電子部品業界向けの専門パッケージングソリューション。静電気防止、衝撃吸収、部品保護機能で供給網の安定性を確保。実際の電子企業取引実績豊富。',
    keywords: [
      '電子部品包装',
      '電子部品業界',
      'ESD防止',
      '静電気防止',
      '衝撃吸収',
      '電子部品容器',
      '半導体包装',
      '精密部品包装',
      '電子部品ソリューション',
      '電子業界',
      '電子包装',
      'ESDパッケージ',
      '電子部品包材',
      '供給網安定',
      'Epackage Lab'
    ],
    openGraph: {
      title: '電子部品業界向けESD対応パッケージングソリューション | Epackage Lab',
      description: '電子部品業界向けの専門パッケージングソリューション。ESD防止と供給網の安定性を実現。',
      type: 'website',
      images: [
        {
          url: '/images/industry/electronics-og.jpg',
          width: 1200,
          height: 630,
          alt: '電子部品業界向けESD対応パッケージングソリューション'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: '電子部品業界向けESD対応パッケージングソリューション | Epackage Lab',
      description: '電子部品業界向けの専門パッケージングソリューション。ESD防止と供給網の安定性を実現。',
      images: ['/images/industry/electronics-og.jpg']
    },
    alternates: {
      canonical: '/industry/electronics',
      languages: {
        'ja': '/ja/industry/electronics',
        'en': '/en/industry/electronics'
      }
    },
    other: {
      'electronics-industry-target': 'electronic-components',
      'solution-focus': 'esd-protection-shock-absorption',
      'supply-chain-stability': 'proven'
    }
  }
}

export default function ElectronicsPage() {
  return (
    <IndustrySolutionTemplate
      industry="electronics"
      title="電子部品業界向けESD対応パッケージングソリューション"
      subtitle="静電気防止・衝撃吸収・部品保護機能で供給網安定化"
      content={<ElectronicsContent />}
    />
  )
}