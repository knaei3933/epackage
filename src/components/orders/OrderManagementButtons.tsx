/**
 * OrderManagementButtons Component
 *
 * 注文管理ボタン統合コンポーネント
 * - キャンセルボタン（特定ステータスのみ表示）
 * - 変更ボタン（特定ステータスのみ表示）
 * - 再注文ボタン（完了/キャンセル済みのみ表示）
 * - PDFダウンロードボタン（単一注文）
 * - 詳細表示ボタン（常に表示）
 *
 * ステータスに応じて適切なボタンのみを表示
 */

import type { Order } from '@/types/dashboard'
import { OrderCancelButton } from './OrderCancelButton'
import { OrderModifyButton } from './OrderModifyButton'
import { ReorderButton } from './ReorderButton'
import { OrderHistoryPDFButton } from './OrderHistoryPDFButton'
import { Button } from '@/components/ui/Button'

interface OrderManagementButtonsProps {
  order: Order
  onOrderCancelled?: () => void
  onOrderModified?: () => void
  onReordered?: (newOrderId: string) => void
  showPDFDownload?: boolean
  showDetailView?: boolean
  className?: string
}

/**
 * 注文管理ボタン一式
 * ステータスに応じて適切なボタンを表示
 */
export function OrderManagementButtons({
  order,
  onOrderCancelled,
  onOrderModified,
  onReordered,
  showPDFDownload = true,
  showDetailView = true,
  className = '',
}: OrderManagementButtonsProps) {
  const status = order.status?.toUpperCase() || ''

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* キャンセルボタン - 特定ステータスで表示 */}
      <OrderCancelButton
        orderId={order.id}
        currentStatus={status}
        onOrderCancelled={onOrderCancelled}
      />

      {/* 変更ボタン - 特定ステータスで表示 */}
      <OrderModifyButton
        order={order}
        onOrderModified={onOrderModified}
      />

      {/* 再注文ボタン - 完了/キャンセル済みで表示 */}
      <ReorderButton
        orderId={order.id}
        currentStatus={status}
        onReordered={onReordered}
      />

      {/* PDFダウンロードボタン - オプション */}
      {showPDFDownload && (
        <OrderHistoryPDFButton
          orderIds={[order.id]}
          filename={`注文_${order.orderNumber}_${formatDate(order.createdAt)}.pdf`}
        />
      )}

      {/* 詳細表示ボタン - 常に表示 */}
      {showDetailView && (
        <Button
          variant="outline"
          onClick={() => window.open(`/member/orders/${order.id}`, '_blank')}
        >
          詳細を見る
        </Button>
      )}
    </div>
  )
}

/**
 * 注文履歴ページ用ボタン一式
 * PDFダウンロードは複数注文対応
 */
interface OrderHistoryButtonsProps {
  selectedOrderIds: string[]
  allOrders: Order[]
  onOrdersCancelled?: () => void
  onOrdersModified?: () => void
  className?: string
}

export function OrderHistoryButtons({
  selectedOrderIds,
  allOrders,
  onOrdersCancelled,
  onOrdersModified,
  className = '',
}: OrderHistoryButtonsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* PDFダウンロード - 選択した注文をまとめてダウンロード */}
      {selectedOrderIds.length > 0 && (
        <OrderHistoryPDFButton
          orderIds={selectedOrderIds}
          filename={`注文履歴_${formatDate(new Date().toISOString())}.pdf`}
        />
      )}

      {/* 全注文PDFダウンロード */}
      {allOrders.length > 0 && (
        <OrderHistoryPDFButton
          orderIds={allOrders.map(o => o.id)}
          filename={`全注文履歴_${formatDate(new Date().toISOString())}.pdf`}
        />
      )}
    </div>
  )
}

/**
 * ヘルパー関数: 日付フォーマット
 */
function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'unknown'

  try {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0] // YYYY-MM-DD
  } catch {
    return 'invalid-date'
  }
}
