/**
 * B2B Quotation Confirmation & Order Page
 *
 * B2B見積確認・注文ページ
 * Displays quotation details and handles order confirmation
 *
 * @route /member/quotations/[id]/confirm
 */

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { QuotationConfirmClient } from '@/components/b2b/QuotationConfirmClient'
import { getQuotationById } from '@/lib/b2b-db'

// ============================================================
// Page Props
// ============================================================

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// ============================================================
// Server Component - Quotation Confirmation
// ============================================================

export default async function QuotationConfirmPage({ params }: PageProps) {
  const { id } = await params

  // Fetch quotation details
  const quotation = await getQuotationById(id)

  if (!quotation) {
    notFound()
  }

  // Check if quotation can be confirmed (must be in 'sent' status)
  if (quotation.status !== 'SENT') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              注文できません
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              この見積は現在注文できません。
            </p>
            <p className="mt-1 text-sm text-gray-500">
              ステータス: {quotation.status}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            見積確認・注文
          </h1>
          <p className="mt-2 text-gray-600">
            見積内容を確認し、注文を確定してください
          </p>
        </div>

        {/* Confirmation Form */}
        <Suspense fallback={<LoadingState />}>
          <QuotationConfirmClient quotation={quotation} />
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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Metadata
// ============================================================

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params

  return {
    title: `見積確認・注文 ${id}`,
    description: '見積内容を確認し、注文を確定します',
  }
}
