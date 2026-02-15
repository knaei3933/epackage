'use client'

/**
 * ReorderButton Component
 *
 * 再注文ボタンコンポーネント
 * - 過去の注文を複製して新規注文を作成
 * - 注文アイテムのコピー
 * - 配送先・請求先のコピー
 * - Supabase MCPを使用したDB操作
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import {
  getOrderDetails,
  duplicateOrder,
  duplicateOrderItems,
  recalculateOrderTotal,
} from '@/lib/supabase-mcp'

interface ReorderButtonProps {
  orderId: string
  currentStatus: string
  onReordered?: (newOrderId: string) => void
}

/**
 * 再注文可能なステータス
 * DELIVERED, CANCELLED のみ再注文可能
 */
const REORDERABLE_STATUSES = [
  'DELIVERED',
  'CANCELLED',
]

/**
 * 再注文ボタン
 * 過去の注文を複製して新規注文を作成
 */
export function ReorderButton({
  orderId,
  currentStatus,
  onReordered,
}: ReorderButtonProps) {
  const [isReordering, setIsReordering] = useState(false)
  const router = useRouter()

  /**
   * 再注文処理
   * 元の注文取得 → 新規注文作成 → アイテム複製 → 合計再計算
   */
  const handleReorder = async () => {
    // 二重確認
    const confirmed = confirm(
      '同じ内容で再注文しますか？\n\n' +
      '新しい注文として作成されます。'
    )

    if (!confirmed) return

    setIsReordering(true)

    try {
      // 元の注文データを取得
      const orderResult = await getOrderDetails(orderId)

      if (orderResult.error) {
        throw new Error(`注文データの取得に失敗しました: ${orderResult.error.message}`)
      }

      if (!orderResult.data || orderResult.data.length === 0) {
        throw new Error('元の注文が見つかりません')
      }

      const originalOrder = orderResult.data[0]

      // 新規注文を作成
      const newOrderResult = await duplicateOrder(orderId)

      if (newOrderResult.error) {
        throw new Error(`新規注文の作成に失敗しました: ${newOrderResult.error.message}`)
      }

      if (!newOrderResult.data || newOrderResult.data.length === 0) {
        throw new Error('新規注文IDの取得に失敗しました')
      }

      const newOrderId = newOrderResult.data[0].id

      // 注文アイテムを複製
      const itemsResult = await duplicateOrderItems(newOrderId, orderId)

      if (itemsResult.error) {
        throw new Error(`注文アイテムの複製に失敗しました: ${itemsResult.error.message}`)
      }

      // 合計金額を再計算
      const recalcResult = await recalculateOrderTotal(newOrderId)

      if (recalcResult.error) {
        throw new Error(`合計金額の再計算に失敗しました: ${recalcResult.error.message}`)
      }

      // 成功アラート表示
      alert('新しい注文を作成しました')

      // コールバック実行
      if (onReordered) {
        onReordered(newOrderId)
      } else {
        // 新規注文詳細ページへリダイレクト
        router.push(`/member/orders/${newOrderId}`)
        router.refresh()
      }

    } catch (error: unknown) {
      console.error('Reorder error:', error)

      const errorMessage = error instanceof Error
        ? error.message
        : '再注文に失敗しました'

      alert(errorMessage)
    } finally {
      setIsReordering(false)
    }
  }

  // 再注文不可能なステータスの場合、ボタンを非表示
  const normalizedStatus = currentStatus?.toUpperCase()
  const canReorder = REORDERABLE_STATUSES.includes(normalizedStatus)

  if (!canReorder) {
    return null
  }

  return (
    <Button
      variant="outline"
      onClick={handleReorder}
      disabled={isReordering}
    >
      {isReordering ? '再注文中...' : '再注文'}
    </Button>
  )
}
