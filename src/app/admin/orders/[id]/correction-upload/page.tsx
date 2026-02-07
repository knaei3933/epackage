/**
 * Admin Correction Upload Page
 *
 * 管理者教正データアップロードページ
 * - 韓国パートナーから返却された教正データをアップロード
 * - プレビュー画像(JPG)・原版ファイル(AI/PDF/PSD)
 * - パートナーコメント入力
 * - 顧客に承認依頼メール送信
 *
 * @route /admin/orders/[id]/correction-upload
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/dashboard';
import { getOrderById } from '@/lib/dashboard';
import { CorrectionUploadClient } from '@/components/admin/CorrectionUploadClient';
import type { Order } from '@/types/dashboard';

// Force dynamic rendering
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
// Server Component - Correction Upload Page
// =====================================================

async function CorrectionUploadPageContent({ orderId }: { orderId: string }) {
  // Check authentication and admin role
  const user = await requireAuth();

  // Fetch order details
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <nav className="flex text-sm text-gray-500 mb-4">
            <a href="/admin/orders" className="hover:text-gray-700">
              注文一覧
            </a>
            <span className="mx-2">/</span>
            <a href={`/admin/orders/${orderId}`} className="hover:text-gray-700">
              注文詳細
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">教正データアップロード</span>
          </nav>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                教正データアップロード
              </h1>
              <p className="mt-2 text-gray-600">
                注文番号: {order.orderNumber}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                顧客: {order.customerName}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <CorrectionUploadClient order={order} />
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

export default async function CorrectionUploadPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingState />}>
      <CorrectionUploadPageContent orderId={id} />
    </Suspense>
  );
}

// =====================================================
// Metadata
// =====================================================

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  return {
    title: `教正データアップロード | 注文 ${id}`,
    description: '韓国パートナーによる教正データのアップロード',
  };
}
