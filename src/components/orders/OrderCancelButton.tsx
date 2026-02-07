/**
 * OrderCancelButton Component
 *
 * 注文キャンセルボタンコンポーネント
 * - 管理者承認方式のキャンセルリクエスト
 * - ステータスチェック（キャンセル可能かどうか）
 * - 二重確認ダイアログ
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface OrderCancelButtonProps {
  orderId: string
  currentStatus: string
  onOrderCancelled?: () => void
}

/**
 * キャンセル可能なステータス
 * PENDING, QUOTATION, DATA_RECEIVED, WORK_ORDER, CONTRACT_SENT のみキャンセルリクエスト可能
 */
const CANCELLABLE_STATUSES = [
  'PENDING',
  'QUOTATION',
  'DATA_RECEIVED',
  'WORK_ORDER',
  'CONTRACT_SENT',
]

/**
 * 注文キャンセルリクエストボタン
 * 管理者の承認が必要なキャンセルリクエストを送信
 */
export function OrderCancelButton({
  orderId,
  currentStatus,
  onOrderCancelled,
}: OrderCancelButtonProps) {
  const [isRequesting, setIsRequesting] = useState(false)
  const router = useRouter()

  /**
   * 注文キャンセルリクエスト処理
   * ステータスチェック → キャンセルリクエスト送信 → 画面更新
   */
  const handleRequestCancellation = async () => {
    // 二重確認
    const reason = prompt(
      'キャンセル理由を入力してください（任意）\n\n' +
      'キャンセルリクエストを送信すると、管理者の承認が必要です。'
    )

    // キャンセルまたは空入力の場合は処理を中止
    if (reason === null) return

    setIsRequesting(true)

    try {
      // キャンセルリクエストを送信
      const response = await fetch(`/api/member/orders/${orderId}/request-cancellation`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'キャンセルリクエストの送信に失敗しました')
      }

      const { data } = await response.json()

      // 成功アラート表示
      alert('キャンセルリクエストを送信しました。\n管理者の承認をお待ちください。')

      // 画面を更新
      if (onOrderCancelled) {
        onOrderCancelled()
      } else {
        window.location.reload()
      }

    } catch (error: unknown) {
      console.error('Cancel request error:', error)

      const errorMessage = error instanceof Error
        ? error.message
        : 'キャンセルリクエストの送信に失敗しました'

      alert(errorMessage)
    } finally {
      setIsRequesting(false)
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
      onClick={handleRequestCancellation}
      disabled={isRequesting}
    >
      {isRequesting ? 'リクエスト送信中...' : '注文をキャンセル'}
    </Button>
  )
}
