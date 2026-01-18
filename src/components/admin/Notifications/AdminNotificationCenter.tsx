/**
 * Admin Notification Center Component
 *
 * 管理者通知センター統合コンポーネント
 * 通知アイコン、リスト、リアルタイム更新機能を含む
 *
 * @module components/admin/notifications
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { NotificationIcon } from './NotificationIcon'
import { NotificationList } from './NotificationList'

export function AdminNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // 未読通知数を取得
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/notifications/unread-count')
      const result = await response.json()

      if (result.success) {
        setUnreadCount(result.data.count)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }, [])

  // コンポーネントマウント時に未読通知数を取得
  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  // 30秒ごとに未読通知数を更新
  useEffect(() => {
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // 通知リストが閉じる時に未読通知数を更新
  const handleClose = () => {
    setIsOpen(false)
    fetchUnreadCount()
  }

  return (
    <div className="relative">
      <NotificationIcon
        onToggle={setIsOpen}
        unreadCount={unreadCount}
      />

      <NotificationList
        isOpen={isOpen}
        onClose={handleClose}
      />
    </div>
  )
}
