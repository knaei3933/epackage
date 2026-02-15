/**
 * Admin Notification Icon Component
 *
 * 管理者通知アイコンコンポーネント
 * 未読通知数表示及びドロップダウントグル
 *
 * @module components/admin/notifications
 */

'use client'

import { useState, useEffect } from 'react'

interface NotificationIconProps {
  onToggle: (isOpen: boolean) => void
  unreadCount: number
}

export function NotificationIcon({ onToggle, unreadCount }: NotificationIconProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // アニメーション効果（新しい通知が到着した時）
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-6 w-6 text-gray-600 dark:text-gray-300 ${
          isAnimating ? 'animate-pulse' : ''
        }`}
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 9 9" />
        <path d="M10 3a4 4 0 0 0-4 4v0a5 5 0 0 0 10 0v0a4 4 0 0 0-4 4" />
        <path d="M9.17 4.35L9 6h.01" />
      </svg>

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1.5 animate-bounce">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
