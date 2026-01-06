/**
 * B2B Order Confirmation Success Client Component
 *
 * B2B注文完了クライアントコンポーネント
 * Displays order success message and details
 *
 * @client
 */

'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Order } from '@/types/database'

// ============================================================
// Props
// ============================================================

interface OrderConfirmSuccessClientProps {
  order: Order
}

// ============================================================
// Status Labels
// ============================================================

const orderStatusLabels: Record<string, string> = {
  PENDING: '登録待',
  QUOTATION: '見積',
  DATA_RECEIVED: 'データ入稿',
  WORK_ORDER: '作業標準書',
  CONTRACT_SENT: '計約書送付',
  CONTRACT_SIGNED: '計約署名',
  PRODUCTION: '生産中',
  STOCK_IN: '入庫完了',
  SHIPPED: '出荷完了',
  DELIVERED: '配送完了',
  CANCELLED: 'キャンセル',
}

const paymentTermLabels: Record<string, string> = {
  credit: '掛け払い',
  advance: '前払い',
}

// ============================================================
// Main Component
// ============================================================

export function OrderConfirmSuccessClient({
  order,
}: OrderConfirmSuccessClientProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card className="p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          注文を受け付けました
        </h1>
        <p className="text-gray-600 mb-4">
          注文番号: <span className="font-mono font-semibold">{order.orderNumber}</span>
        </p>
        <p className="text-sm text-gray-500">
          注文内容をメールでお送りいたしました。
        </p>
      </Card>

      {/* Order Details */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">注文内容</h2>

        <div className="space-y-4">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">注文日時:</span>{' '}
              <span className="font-medium">
                {new Date(order.created_at).toLocaleString('ja-JP')}
              </span>
            </div>
            <div>
              <span className="text-gray-500">注文ステータス:</span>{' '}
              <span className="font-medium">
                {orderStatusLabels[order.status] || order.status}
              </span>
            </div>
            <div>
              <span className="text-gray-500">支払い条件:</span>{' '}
              <span className="font-medium">
                {paymentTermLabels[order.paymentTerm] || order.paymentTerm}
              </span>
            </div>
            <div>
              <span className="text-gray-500">希望納期:</span>{' '}
              <span className="font-medium">
                {order.requestedDeliveryDate
                  ? new Date(order.requestedDeliveryDate).toLocaleDateString('ja-JP')
                  : '-'}
              </span>
            </div>
          </div>

          {/* Delivery Address */}
          {order.shippingAddress && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">配送先</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.company}
                </p>
                <p>{order.shippingAddress.contactName} 様</p>
                <p>
                  〒{order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.prefecture}
                  {order.shippingAddress.city}
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 && (
                    <>
                      <br />
                      {order.shippingAddress.addressLine2}
                    </>
                  )}
                </p>
                <p>TEL: {order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Billing Address */}
          {order.billingAddress && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">請求先</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">
                  {order.billingAddress.company}
                </p>
                <p>{order.billingAddress.contactName} 様</p>
                <p>
                  〒{order.billingAddress.postalCode}
                  <br />
                  {order.billingAddress.prefecture}
                  {order.billingAddress.city}
                  {order.billingAddress.addressLine1}
                  {order.billingAddress.addressLine2 && (
                    <>
                      <br />
                      {order.billingAddress.addressLine2}
                    </>
                  )}
                </p>
                <p>TEL: {order.billingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-3">注文明細</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      {item.specifications && (
                        <p className="text-xs text-gray-500">
                          {formatSpecifications(item.specifications as Record<string, unknown>)}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <p>数量: {item.quantity.toLocaleString()}</p>
                      <p>¥{item.total_price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="pt-4 border-t">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>小計</span>
                <span>¥{order.subtotal?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span>消費税</span>
                <span>¥{order.taxAmount?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>合計</span>
                <span>¥{order.totalAmount?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          {order.paymentTerm === 'advance' && (
            <div className="pt-4 border-t">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  お支払いについて
                </h3>
                <p className="text-sm text-blue-800">
                  前払いをお選びの場合、注文確認後7日以内にお支払いください。
                  振込先はメールにてお送りいたします。
                </p>
              </div>
            </div>
          )}

          {order.deliveryNotes && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">納期に関する備考</h3>
              <p className="text-sm text-gray-600">{order.deliveryNotes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">次のステップ</h2>

        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
              1
            </div>
            <div>
              <p className="font-medium">注文確認メールをお送りしました</p>
              <p className="text-gray-500">
                注文内容の詳細が記載されたメールをお送りいたしました。
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
              2
            </div>
            <div>
              <p className="font-medium">注文処理を開始します</p>
              <p className="text-gray-500">
                担当者が注文内容を確認し、生産スケジュールを調整いたします。
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
              3
            </div>
            <div>
              <p className="font-medium">進捗をご連絡いたします</p>
              <p className="text-gray-500">
                注文の進捗状況に応じて、メールにてご連絡いたします。
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="secondary"
          onClick={() => router.push('/member/orders')}
        >
          注文一覧へ
        </Button>
        <Button
          variant="primary"
          onClick={() => router.push('/member/orders/new')}
        >
          続けて注文する
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// Utilities
// ============================================================

function formatSpecifications(spec: Record<string, unknown>): string {
  return Object.entries(spec)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}
