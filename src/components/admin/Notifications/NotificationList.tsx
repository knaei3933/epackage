/**
 * Admin Notification List Component
 *
 * 管理者通知リストコンポーネント
 * 通知リスト表示及び既読表示機能
 *
 * @module components/admin/notifications
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, X, Trash2, Package, FileText, ClipboardList, User, Factory, Truck, PenTool, AlertCircle, Bell } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  action_url?: string
  action_label?: string
  priority: string
}

interface NotificationListProps {
  isOpen: boolean
  onClose: () => void
  initialNotifications?: Notification[]
}

export function NotificationList({
  isOpen,
  onClose,
  initialNotifications = [],
}: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [loading, setLoading] = useState(false)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  // 通知リストを取得
  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/notifications?limit=50')
      const result = await response.json()

      if (result.success) {
        setNotifications(result.data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // コンポーネントマウント時に通知を取得
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, fetchNotifications])

  // 通知を既読にする
  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActionInProgress(notificationId)

    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'PATCH',
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        )
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    } finally {
      setActionInProgress(null)
    }
  }

  // すべて既読にする
  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  // 通知を削除
  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActionInProgress(notificationId)

    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    } finally {
      setActionInProgress(null)
    }
  }

  // 通知タイプ別アイコンを返す
  const getIconForType = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5" />
      case 'quotation':
        return <FileText className="h-5 w-5" />
      case 'sample':
        return <ClipboardList className="h-5 w-5" />
      case 'registration':
        return <User className="h-5 w-5" />
      case 'production':
        return <Factory className="h-5 w-5" />
      case 'shipment':
        return <Truck className="h-5 w-5" />
      case 'contract':
        return <PenTool className="h-5 w-5" />
      case 'system':
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  // 通知タイプ別色を返す
  const getIconColorForType = (type: string) => {
    switch (type) {
      case 'order':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'quotation':
        return 'text-green-500 bg-green-50 dark:bg-green-900/20'
      case 'sample':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'registration':
        return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20'
      case 'production':
        return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
      case 'shipment':
        return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
      case 'contract':
        return 'text-pink-500 bg-pink-50 dark:bg-pink-900/20'
      case 'system':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20'
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  // 優先度別スタイル
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-l-red-500'
      case 'high':
        return 'border-l-4 border-l-orange-500'
      case 'low':
        return 'border-l-4 border-l-gray-300 dark:border-l-gray-600'
      default:
        return ''
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* 通知パネル */}
      <div className="fixed right-4 top-16 w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 max-h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            お知らせ
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 通知リスト */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                ロード中...
              </p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                通知はありません
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${getPriorityStyles(
                  notification.priority
                )} ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* アイコン */}
                  <div className={`flex-shrink-0 p-2 rounded-full ${getIconColorForType(
                    notification.type
                  )}`}>
                    {getIconForType(notification.type)}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {format(new Date(notification.created_at), 'yyyy年M月d日', { locale: ja })}
                      </p>

                      {/* アクションボタン */}
                      <div className="flex items-center gap-1">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            disabled={actionInProgress === notification.id}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            title="既読にする"
                          >
                            <Check className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(notification.id, e)}
                          disabled={actionInProgress === notification.id}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="削除"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* アクションボタン（存在する場合） */}
                    {notification.action_url && (
                      <a
                        href={notification.action_url}
                        className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {notification.action_label || '詳細を見る'} →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* フッター */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleMarkAllAsRead}
              className="w-full py-2 px-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
            >
              すべて既読にする
            </button>
          </div>
        )}
      </div>
    </>
  )
}
