import { Metadata } from 'next'
import { CatalogClient } from './CatalogClient'
import { CartProvider } from '@/contexts/CartContext'

// SEO Metadata
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: 'パウチ製品カタログ | Epackage Lab',
      template: '%s | Epackage Lab'
    },
    description: 'Epackage Labのパウチ製品カタログ。6種類のパウチ製品をご覧ください。ソフトパウチ、スタンドパウチ、ガゼットパウチ、ピローパウチ、三角パウチ、スパウトパウチなど、あらゆる軟包裝材ニーズにお応えします。小ロット500枚から大ロット大量生産まで対応。化粧品・食品・医薬品業界向け最適な包装ソリューション。今すぐ無料見積もりでコスト削減を実現。',
    keywords: [
      'パウチ',
      '連包裝材',
      'ソフトパウチ',
      'スタンドパウチ',
      'ガゼットパウチ',
      'ピローパウチ',
      '三角パウチ',
      '特殊形状パウチ',
      '包装資材',
      'Epackage Lab'
    ],
    openGraph: {
      title: 'パウチ製品カタログ | Epackage Lab',
      description: 'Epackage Labのパウチ製品カタログ。6種類のパウチ製品をご覧ください。',
      type: 'website',
      images: [
        {
          url: '/images/og-catalog.jpg',
          width: 1200,
          height: 630,
          alt: 'Epackage Lab パウチ製品カタログ'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'パウチ製品カタログ | Epackage Lab',
      description: 'Epackage Labのパウチ製品カタログ。6種類のパウチ製品をご覧ください。',
      images: ['/images/og-catalog.jpg']
    },
    alternates: {
      canonical: '/catalog',
      languages: {
        'ja': '/ja/catalog',
        'en': '/en/catalog',
        'ko': '/ko/catalog'
      }
    }
  }
}

export default function CatalogPage() {
  return (
    <CartProvider>
      <CatalogClient />
    </CartProvider>
  )
}