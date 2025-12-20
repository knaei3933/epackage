import { Metadata } from 'next'
import { Suspense } from 'react'
import OrderConfirmationClient from './OrderConfirmationClient'

// Generate metadata
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '注文確認 | Epackage Lab',
    description: 'Epackage Labのご注文確認ページ。注文詳細とお届け予定をご確認いただけます。',
    robots: {
      index: false,
      follow: false
    }
  }
}

// Loading fallback
function OrderConfirmationLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
    </div>
  )
}

// Page component
export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderConfirmationLoading />}>
      <OrderConfirmationClient />
    </Suspense>
  )
}