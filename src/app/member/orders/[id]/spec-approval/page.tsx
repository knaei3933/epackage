/**
 * Customer Spec Approval Page
 *
 * 顧客教正データ確認ページ
 * - 韓国パートナーによる教正データの確認
 * - 承認・修正要求・キャンセルの3つのアクション
 * - 画像プレビュー、パートナーコメント表示
 *
 * @route /member/orders/[id]/spec-approval
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/dashboard';
import { getOrderById } from '@/lib/dashboard';
import { SpecApprovalClient } from '@/components/member/SpecApprovalClient';
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
// Server Component - Spec Approval Page
// =====================================================

async function SpecApprovalPageContent({ orderId }: { orderId: string }) {
  // Check authentication
  const user = await requireAuth();

  // Fetch order details
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  // Verify order belongs to user
  if (order.userId !== user.id) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">アクセス権限がありません</h1>
            <p className="text-gray-600">この注文にアクセスする権限がありません。</p>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="text-gray-900">教正データ確認</span>
          </nav>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              教正データ確認
            </h1>
            <p className="mt-2 text-gray-600">
              注文番号: {order.orderNumber}
            </p>
          </div>
        </div>

        {/* Approval Form */}
        <SpecApprovalClient order={order} />
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

export default async function SpecApprovalPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingState />}>
      <SpecApprovalPageContent orderId={id} />
    </Suspense>
  );
}

// =====================================================
// Metadata
// =====================================================

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  return {
    title: `教正データ確認 | 注文 ${id}`,
    description: '韓国パートナーによる教正データの確認と承認',
  };
}
