/**
 * B2B Order Confirmation Success Page
 *
 * B2B注文完了ページ
 * Displays order confirmation details after successful order placement
 *
 * @route /member/orders/[id]/confirmation
 */

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { OrderConfirmSuccessClient } from '@/components/b2b/OrderConfirmSuccessClient'
import { getOrderById } from '@/lib/b2b-db'

// ============================================================
// Page Props
// ============================================================

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// ============================================================
// Server Component - Order Confirmation Success
// ============================================================

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { id } = await params

  // Fetch order details
  const order = await getOrderById(id)

  if (!order) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingState />}>
          <OrderConfirmSuccessClient order={order} />
        </Suspense>
      </div>
    </div>
  )
}

// ============================================================
// Loading State
// ============================================================

function LoadingState() {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
    </div>
  )
}

// ============================================================
// Metadata
// ============================================================

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params

  return {
    title: `注文完了 ${id}`,
    description: '注文が正常に完了しました',
  }
}
