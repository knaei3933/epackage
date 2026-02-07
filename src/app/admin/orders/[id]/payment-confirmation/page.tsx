/**
 * Admin Payment Confirmation Page
 *
 * 管理者入金確認ページ
 * - 顧客の入金を確認
 * - 入金額と日時を記録
 * - 入金確認後に次のステップ（製造開始）へ進む
 *
 * @route /admin/orders/[id]/payment-confirmation
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/dashboard';
import { getOrderById } from '@/lib/dashboard';
import { PaymentConfirmationClient } from '@/components/admin/PaymentConfirmationClient';
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
// Server Component - Payment Confirmation Page
// =====================================================

async function PaymentConfirmationPageContent({ orderId }: { orderId: string }) {
  // Check authentication and admin role
  const user = await requireAuth();

  // Fetch order details
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <span className="text-gray-900">入金確認</span>
          </nav>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              入金確認
            </h1>
            <p className="mt-2 text-gray-600">
              注文番号: {order.orderNumber}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              顧客: {order.customerName}
            </p>
          </div>
        </div>

        {/* Payment Confirmation Form */}
        <PaymentConfirmationClient order={order} />
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

export default async function PaymentConfirmationPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingState />}>
      <PaymentConfirmationPageContent orderId={id} />
    </Suspense>
  );
}

// =====================================================
// Metadata
// =====================================================

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  return {
    title: `入金確認 | 注文 ${id}`,
    description: '顧客の入金確認と記録',
  };
}
