import { Metadata } from 'next'
import { CheckoutClient } from './CheckoutClient'
import { CheckoutProvider } from '@/contexts/CheckoutContext'
import { CartProvider } from '@/contexts/CartContext'

// SEO Metadata
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: 'チェックアウト | Epackage Lab',
      template: '%s | Epackage Lab'
    },
    description: 'Epackage Labのチェックアウトページ。安全なB2B決済システムで包装ソリューションをご注文ください。',
    keywords: [
      'チェックアウト',
      'B2B決済',
      '包装注文',
      '請求書払い',
      'クレジットカード',
      '銀行振込',
      'Epackage Lab'
    ],
    openGraph: {
      title: 'チェックアウト | Epackage Lab',
      description: 'Epackage Labのチェックアウトページ。安全なB2B決済システムで包装ソリューションをご注文ください。',
      type: 'website',
      images: [
        {
          url: '/images/og-checkout.jpg',
          width: 1200,
          height: 630,
          alt: 'Epackage Lab チェックアウト'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'チェックアウト | Epackage Lab',
      description: 'Epackage Labのチェックアウトページ。安全なB2B決済システムで包装ソリューションをご注文ください。',
      images: ['/images/og-checkout.jpg']
    },
    alternates: {
      canonical: '/checkout',
      languages: {
        'ja': '/ja/checkout',
        'en': '/en/checkout',
        'ko': '/ko/checkout'
      }
    },
    robots: {
      index: false,
      follow: false
    }
  }
}

export default function CheckoutPage() {
  return (
    <CartProvider>
      <CheckoutProvider>
        <CheckoutClient />
      </CheckoutProvider>
    </CartProvider>
  )
}