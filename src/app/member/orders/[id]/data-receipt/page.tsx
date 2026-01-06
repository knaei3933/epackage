/**
 * Order Data Receipt Upload Page (Member Portal)
 *
 * 注文データ入稿ページ
 * - Upload production data files (PDF, Excel, images)
 * - File validation using security-validator
 * - Japanese business language
 * - Drag & drop interface
 *
 * Task P2-12: Order data receipt file upload
 * @route /member/orders/[id]/data-receipt
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/dashboard';
import { getOrderById } from '@/lib/dashboard';
import { DataReceiptUploadClient } from '@/components/orders/DataReceiptUploadClient';
import type { Order } from '@/types/dashboard';

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';

// =====================================================
// Page Props
// =====================================================

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// =====================================================
// Server Component - Data Receipt Page
// =====================================================

async function DataReceiptPageContent({ orderId }: { orderId: string }) {
  // Check authentication
  await requireAuth();

  // Fetch order details
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  // Check if order is in correct status for data receipt
  // Allow data upload for pending, processing, and manufacturing orders
  const canUploadData = ['pending', 'processing', 'manufacturing'].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <nav className="flex text-sm text-gray-500 mb-4">
            <a href="/member/orders" className="hover:text-gray-700">
              注文一覧
            </a>
            <span className="mx-2">/</span>
            <a href={`/member/orders/${orderId}`} className="hover:text-gray-700">
              注文詳細
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">データ入稿</span>
          </nav>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                データ入稿
              </h1>
              <p className="mt-2 text-gray-600">
                注文番号: {order.orderNumber}
              </p>
            </div>

            {!canUploadData && (
              <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                この注文のステータスではデータをアップロードできません
              </div>
            )}
          </div>
        </div>

        {/* Data Receipt Upload Form */}
        <DataReceiptUploadClient
          order={order}
          canUploadData={canUploadData}
        />
      </div>
    </div>
  );
}

// =====================================================
// Loading Component
// =====================================================

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Page Component
// =====================================================

export default async function DataReceiptPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingState />}>
      <DataReceiptPageContent orderId={id} />
    </Suspense>
  );
}

// =====================================================
// Metadata
// =====================================================

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  return {
    title: `データ入稿 | 注文 ${id}`,
    description: '生産データ・デザインファイルのアップロード',
  };
}
