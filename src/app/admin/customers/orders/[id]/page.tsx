/**
 * Customer Order Detail Page
 * 注文詳細ページ
 *
 * Displays complete order information including:
 * - Order status and progress
 * - Production stages
 * - Order items
 * - Documents
 * - Shipment tracking
 * - Notes
 *
 * Migrated from /portal/orders/[id] to /admin/customers/orders/[id]
 */

import React from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderSummaryCard } from '@/components/shared';
import { ProductionProgress as ProductionProgressWidget } from '@/components/shared/production';
import { DocumentDownloadCard } from '@/components/shared/document';
import { ShipmentTrackingCard } from '@/components/shared/shipping';
import { getOrderStatusLabel, getOrderStatusColor, formatCurrency, formatDate, formatDateTime } from '@/types/portal';
import { cn } from '@/lib/utils';

// Force dynamic rendering - this page requires authentication and cannot be pre-rendered
export const dynamic = 'force-dynamic';

async function getOrderDetail(orderId: string) {
  const cookieStore = await cookies();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/member/orders/${orderId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join('; '),
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    return null;
  }

  const result = await response.json();
  return result.data;
}

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrderDetail(params.id);

  if (!order) {
    notFound();
  }

  const statusLabel = getOrderStatusLabel(order.status, 'ja');
  const statusColor = getOrderStatusColor(order.status);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <Link href="/admin/customers" className="hover:text-slate-900 dark:hover:text-white">
          カスタマーポータル
        </Link>
        <span>/</span>
        <Link href="/admin/customers/orders" className="hover:text-slate-900 dark:hover:text-white">
          注文一覧
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white">{order.orderNumber}</span>
      </nav>

      {/* Order Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {order.orderNumber}
              </h1>
              <span className={cn('px-3 py-1 text-sm font-medium rounded-full border', statusColor)}>
                {statusLabel}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              作成日: {formatDate(order.created_at, 'ja')}
            </p>
          </div>

          {order.can_request_changes && (
            <Link
              href={`/admin/customers/orders/${order.id}/request-changes`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              変更リクエスト
            </Link>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
            <span>注文進捗</span>
            <span>{order.progress_percentage}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${order.progress_percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              注文内容
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      商品名
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      数量
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      単価
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      金額
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items?.map((item: any) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {item.product_name}
                        </p>
                      </td>
                      <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-400">
                        {item.quantity}
                      </td>
                      <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-400">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="text-right py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-full sm:w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">小計:</span>
                  <span className="text-slate-900 dark:text-white">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">消費税:</span>
                  <span className="text-slate-900 dark:text-white">
                    {formatCurrency(order.taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-900 dark:text-white">合計:</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Production Stages */}
          {order.production_stages && order.production_stages.length > 0 && (
            <ProductionProgressWidget
              stages={order.production_stages}
              currentStageIndex={order.production_stages.findIndex((s: any) => s.status === 'in_progress')}
            />
          )}

          {/* Documents */}
          {order.available_documents && order.available_documents.length > 0 && (
            <DocumentDownloadCard documents={order.available_documents} />
          )}

          {/* Notes */}
          {order.notes && order.notes.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                メモ・連絡事項
              </h2>
              <div className="space-y-4">
                {order.notes.map((note: any) => (
                  <div key={note.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {note.subject || 'メモ'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDateTime(note.created_at, 'ja')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipment Info */}
          {order.shipment_info && (
            <ShipmentTrackingCard
              shipment={order.shipment_info}
              orderNumber={order.orderNumber}
            />
          )}

          {/* Delivery Address */}
          {order.shipping_address && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                配送先住所
              </h3>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <p>{order.shipping_address.company}</p>
                <p>{order.shipping_address.contactName}</p>
                <p>{order.shipping_address.phone}</p>
                <p>
                  {[
                    order.shipping_address.postalCode,
                    order.shipping_address.prefecture,
                    order.shipping_address.city,
                    order.shipping_address.addressLine1,
                    order.shipping_address.addressLine2,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </p>
              </div>
            </div>
          )}

          {/* Billing Address */}
          {order.billing_address && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                請求先住所
              </h3>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <p>{order.billing_address.company}</p>
                <p>{order.billing_address.contactName}</p>
                <p>
                  {[
                    order.billing_address.postalCode,
                    order.billing_address.prefecture,
                    order.billing_address.city,
                    order.billing_address.addressLine1,
                    order.billing_address.addressLine2,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              クイックアクション
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/customers/support"
                className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                お問い合わせ
              </Link>
              <Link
                href="/admin/customers/documents"
                className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ドキュメントを確認
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
