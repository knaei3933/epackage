/**
 * Admin Notification Center Component
 *
 * 관리자 알림 센터 통합 컴포넌트
 * 알림 아이콘, 목록, 실시간 업데이트 기능 포함
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

  // 안읽은 알림 수 가져오기
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

  // 컴포넌트 마운트 시 안읽은 알림 수 가져오기
  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  // 30초마다 안읽은 알림 수 갱신
  useEffect(() => {
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // 알림 목록이 닫힐 때 안읽은 알림 수 갱신
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
