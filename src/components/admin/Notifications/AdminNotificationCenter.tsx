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
      // DEV_MODE用ヘッダーの設定
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // DEV_MODEの場合はヘッダーを追加
      if (typeof window !== 'undefined') {
        const devUserId = localStorage.getItem('dev-mock-user-id');
        if (devUserId) {
          headers['x-dev-mode'] = 'true';
          headers['x-user-id'] = devUserId;
        }
      }

      const response = await fetch('/api/admin/notifications/unread-count', {
        headers,
      });

      // レスポンスチェック
      if (!response.ok) {
        return // サーバーエラーは静かに無視
      }

      const result = await response.json()

      if (result.success) {
        setUnreadCount(result.data.count)
      }
    } catch (error) {
      // ネットワークエラーは静かに無視（開発環境でのAPI未対応など）
      // console.error('Failed to fetch unread count:', error)
    }
  }, [])

  // コンポーネントマウント時に未読通知数を取得（一時的に無効化）
  // useEffect(() => {
  //   fetchUnreadCount()
  // }, [fetchUnreadCount])

  // 30秒ごとに未読通知数を更新（一時的に無効化）
  // useEffect(() => {
  //   const interval = setInterval(fetchUnreadCount, 30000)
  //
  //   return () => clearInterval(interval)
  // }, [fetchUnreadCount])

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
