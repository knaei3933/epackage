'use client'

/**
 * OrderModifyButton Component
 *
 * 注文変更ボタンコンポーネント
 * - 数量変更
 * - 配送先変更
 * - 合計金額再計算
 * - Supabase MCPを使用したDB操作
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Order, OrderItem } from '@/types/dashboard'
import {
  getOrderStatus,
  updateOrderItemQuantity,
  updateOrderDeliveryAddress,
  recalculateOrderTotal,
} from '@/lib/supabase-mcp'

interface OrderModifyButtonProps {
  order: Order
  onOrderModified?: () => void
}

/**
 * 修正可能なステータス
 * PENDING, QUOTATION, DATA_RECEIVED のみ修正可能
 */
const MODIFIABLE_STATUSES = [
  'PENDING',
  'QUOTATION',
  'DATA_RECEIVED',
]

/**
 * 注文変更ボタン
 * ダイアログで数量と配送先を変更可能
 */
export function OrderModifyButton({
  order,
  onOrderModified,
}: OrderModifyButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // 変更データの初期値
  const [modifications, setModifications] = useState({
    items: order.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
    })),
    deliveryAddress: order.deliveryAddress ? {
      name: order.deliveryAddress.name || '',
      postalCode: order.deliveryAddress.postalCode || '',
      prefecture: order.deliveryAddress.prefecture || '',
      city: order.deliveryAddress.city || '',
      address: order.deliveryAddress.address || '',
      building: order.deliveryAddress.building || '',
      phone: order.deliveryAddress.phone || '',
      contactPerson: order.deliveryAddress.contactPerson || '',
    } : null,
  })

  /**
   * 注文変更保存処理
   */
  const handleSave = async () => {
    setIsSaving(true)

    try {
      // 注文ステータス確認
      const statusResult = await getOrderStatus(order.id)

      if (statusResult.error) {
        throw new Error(`注文データの取得に失敗しました: ${statusResult.error.message}`)
      }

      if (!statusResult.data || statusResult.data.length === 0) {
        throw new Error('注文が見つかりません')
      }

      const currentStatus = statusResult.data[0].status?.toUpperCase()

      // 修正可能ステータスかどうか確認
      if (!MODIFIABLE_STATUSES.includes(currentStatus)) {
        throw new Error(
          `現在のステータス（${currentStatus}）では変更できません。\n` +
          `変更可能なステータス: ${MODIFIABLE_STATUSES.join(', ')}`
        )
      }

      // 注文アイテムの数量を更新
      for (const item of modifications.items) {
        const updateResult = await updateOrderItemQuantity(
          order.id,
          item.id,
          item.quantity
        )

        if (updateResult.error) {
          throw new Error(`アイテムの更新に失敗しました: ${updateResult.error.message}`)
        }
      }

      // 配送先を更新（変更がある場合）
      if (modifications.deliveryAddress) {
        const addressResult = await updateOrderDeliveryAddress(
          order.id,
          modifications.deliveryAddress
        )

        if (addressResult.error) {
          throw new Error(`配送先の更新に失敗しました: ${addressResult.error.message}`)
        }
      }

      // 合計金額を再計算
      const recalcResult = await recalculateOrderTotal(order.id)

      if (recalcResult.error) {
        throw new Error(`合計金額の再計算に失敗しました: ${recalcResult.error.message}`)
      }

      // 成功アラート表示
      alert('注文を変更しました')

      // ダイアログを閉じる
      setIsOpen(false)

      // コールバック実行またはページリロード
      if (onOrderModified) {
        onOrderModified()
      } else {
        window.location.reload()
      }

    } catch (error: unknown) {
      console.error('Modify order error:', error)

      const errorMessage = error instanceof Error
        ? error.message
        : '変更に失敗しました'

      alert(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * アイテム数量変更ハンドラー
   */
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setModifications(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ),
    }))
  }

  /**
   * 配送先変更ハンドラー
   */
  const handleAddressChange = (field: string, value: string) => {
    setModifications(prev => ({
      ...prev,
      deliveryAddress: prev.deliveryAddress
        ? { ...prev.deliveryAddress, [field]: value }
        : null,
    }))
  }

  // 修正不可能なステータスの場合、ボタンを非表示
  const normalizedStatus = order.status?.toUpperCase()
  const canModify = MODIFIABLE_STATUSES.includes(normalizedStatus)

  if (!canModify) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
      >
        注文を変更
      </Button>

      {/* 変更ダイアログ */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">注文変更</h2>

              {/* 注文番号 */}
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">注文番号</p>
                <p className="font-semibold">{order.orderNumber}</p>
              </div>

              {/* 数量変更セクション */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">数量変更</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          単価: {item.unitPrice.toLocaleString()}円
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm">数量:</label>
                        <input
                          type="number"
                          value={modifications.items.find(i => i.id === item.id)?.quantity || item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-20 border rounded px-2 py-1 text-center"
                        />
                        <span className="text-sm text-gray-600 w-24 text-right">
                          {((modifications.items.find(i => i.id === item.id)?.quantity || item.quantity) * item.unitPrice).toLocaleString()}円
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 配送先変更セクション */}
              {order.deliveryAddress && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">配送先変更</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">配送先名</label>
                      <input
                        type="text"
                        value={modifications.deliveryAddress?.name || ''}
                        onChange={(e) => handleAddressChange('name', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">郵便番号</label>
                        <input
                          type="text"
                          value={modifications.deliveryAddress?.postalCode || ''}
                          onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                          className="w-full border rounded px-3 py-2"
                          placeholder="〒XXX-XXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">都道府県</label>
                        <input
                          type="text"
                          value={modifications.deliveryAddress?.prefecture || ''}
                          onChange={(e) => handleAddressChange('prefecture', e.target.value)}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">市区町村</label>
                      <input
                        type="text"
                        value={modifications.deliveryAddress?.city || ''}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">番地</label>
                      <input
                        type="text"
                        value={modifications.deliveryAddress?.address || ''}
                        onChange={(e) => handleAddressChange('address', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">建物名</label>
                      <input
                        type="text"
                        value={modifications.deliveryAddress?.building || ''}
                        onChange={(e) => handleAddressChange('building', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">電話番号</label>
                      <input
                        type="tel"
                        value={modifications.deliveryAddress?.phone || ''}
                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">担当者名</label>
                      <input
                        type="text"
                        value={modifications.deliveryAddress?.contactPerson || ''}
                        onChange={(e) => handleAddressChange('contactPerson', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? '保存中...' : '変更を保存'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSaving}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
