'use client'

/**
 * OrderCancelButton Component
 *
 * 注文キャンセルボタンコンポーネント
 * - Supabase MCPを使用したDB操作
 * - ステータスチェック（キャンセル可能かどうか）
 * - 二重確認ダイアログ
 * - 管理者通知送信
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import {
  getOrderStatus,
  cancelOrder,
  createNotification,
} from '@/lib/supabase-mcp'

interface OrderCancelButtonProps {
  orderId: string
  currentStatus: string
  onOrderCancelled?: () => void
}

/**
 * キャンセル可能なステータス
 * PENDING, QUOTATION, DATA_RECEIVED, WORK_ORDER, CONTRACT_SENT のみキャンセル可能
 */
const CANCELLABLE_STATUSES = [
  'PENDING',
  'QUOTATION',
  'DATA_RECEIVED',
  'WORK_ORDER',
  'CONTRACT_SENT',
]

/**
 * 注文キャンセルボタン
 * Supabase MCPを使用して注文をキャンセル状態に更新
 */
export function OrderCancelButton({
  orderId,
  currentStatus,
  onOrderCancelled,
}: OrderCancelButtonProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const router = useRouter()

  /**
   * 注文キャンセル処理
   * ステータスチェック → キャンセル実行 → 管理者通知
   */
  const handleCancel = async () => {
    // 二重確認
    const confirmed = confirm(
      '注文をキャンセルしますか？\n\n' +
      'この操作は取り消せません。\n' +
      'キャンセルする場合は「OK」を押してください。'
    )

    if (!confirmed) return

    setIsCancelling(true)

    try {
      // 現在のステータスを確認（セキュリティチェック）
      const orderResult = await getOrderStatus(orderId)

      if (orderResult.error) {
        throw new Error(`注文データの取得に失敗しました: ${orderResult.error.message}`)
      }

      if (!orderResult.data || orderResult.data.length === 0) {
        throw new Error('注文が見つかりません')
      }

      const order = orderResult.data[0]
      const dbStatus = order.status?.toUpperCase()

      // キャンセル可能ステータスかどうか確認
      if (!CANCELLABLE_STATUSES.includes(dbStatus)) {
        throw new Error(
          `現在のステータス（${dbStatus}）ではキャンセルできません。\n` +
          `キャンセル可能なステータス: ${CANCELLABLE_STATUSES.join(', ')}`
        )
      }

      // 注文をキャンセル状態に更新
      const cancelResult = await cancelOrder(orderId)

      if (cancelResult.error) {
        throw new Error(`注文のキャンセルに失敗しました: ${cancelResult.error.message}`)
      }

      // 管理者通知を作成（notificationsテーブルが存在する場合）
      try {
        await createNotification(
          'order_cancelled',
          '注文キャンセル通知',
          `注文 ${orderId} がキャンセルされました`,
          orderId,
          'admin'
        )
      } catch (notificationError) {
        // 通知作成は失敗してもキャンセル自体は成功とみなす
        console.warn('管理者通知の作成に失敗しました:', notificationError)
      }

      // 成功アラート表示
      alert('注文をキャンセルしました')

      // コールバック実行
      if (onOrderCancelled) {
        onOrderCancelled()
      } else {
        // デフォルト：注文一覧へリダイレクト
        router.push('/member/orders')
        router.refresh()
      }

    } catch (error: unknown) {
      console.error('Cancel order error:', error)

      const errorMessage = error instanceof Error
        ? error.message
        : 'キャンセルに失敗しました'

      alert(errorMessage)
    } finally {
      setIsCancelling(false)
    }
  }

  // キャンセル不可能なステータスの場合、ボタンを非表示
  const normalizedStatus = currentStatus?.toUpperCase()
  const canCancel = CANCELLABLE_STATUSES.includes(normalizedStatus)

  if (!canCancel) {
    return null
  }

  return (
    <Button
      variant="destructive"
      onClick={handleCancel}
      disabled={isCancelling}
    >
      {isCancelling ? 'キャンセル中...' : '注文をキャンセル'}
    </Button>
  )
}
