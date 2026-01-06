/**
 * Admin Notification Icon Component
 *
 * 관리자 알림 아이콘 컴포넌트
 * 안읽은 알림 수 표시 및 드롭다운 토글
 *
 * @module components/admin/notifications
 */

'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'

interface NotificationIconProps {
  onToggle: (isOpen: boolean) => void
  unreadCount: number
}

export function NotificationIcon({ onToggle, unreadCount }: NotificationIconProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // 애니메이션 효과 (새 알림이 도착했을 때)
    if (unreadCount > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [unreadCount])

  const handleClick = () => {
    onToggle(true)
  }

  return (
    <button
      onClick={handleClick}
      className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
      aria-label={`通知 (${unreadCount}件の未読)`}
    >
      <Bell
        className={`h-6 w-6 text-gray-600 dark:text-gray-300 ${
          isAnimating ? 'animate-pulse' : ''
        }`}
      />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1.5 animate-bounce">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
