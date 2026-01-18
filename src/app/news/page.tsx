import { Metadata } from 'next'
import { NewsClient } from './NewsClient'

// Disable static generation for this page due to client-side interactivity
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'パウチ包装ニュース | Epackage Lab',
  description: 'Epackage Labのパウチ包装に関する最新ニュース、製品情報、導入事例などをお届けします。連包裝材業界の最新動向をご確認ください。',
  keywords: ['パウチニュース', '連包裝材', '包装ニュース', 'パウチ製品', '導入事例', 'Epackage Lab', 'パウチ専門'],
  openGraph: {
    title: 'パウチ包装ニュース | Epackage Lab',
    description: 'Epackage Labのパウチ包装専門ニュースと製品情報',
    type: 'website',
    images: [
      {
        url: '/images/og-pouch-news.jpg',
        width: 1200,
        height: 630,
        alt: 'Epackage Lab パウチ包装ニュース'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'パウチ包装ニュース | Epackage Lab',
    description: 'Epackage Labのパウチ包装専門ニュースと製品情報',
    images: ['/images/og-pouch-news.jpg']
  },
  alternates: {
    canonical: '/news',
    languages: {
      'ja': '/ja/news',
      'en': '/en/news',
      'ko': '/ko/news'
    }
  }
}

export default function NewsPage() {
  return <NewsClient />
}