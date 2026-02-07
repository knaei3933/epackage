/**
 * Admin Notifications Management Page
 *
 * お知らせ管理ページ
 * 通知の作成、編集、削除機能
 *
 * @module app/admin/notifications
 */

'use client'

import { useState, useEffect } from 'react'
import { Bell, Plus, Pencil, Trash2, Eye, EyeOff, Save, X } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'order' | 'quotation' | 'sample' | 'registration' | 'production' | 'shipment' | 'contract' | 'system'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  is_read: boolean
  created_at: string
  action_url?: string
  action_label?: string
}

interface NotificationFormData {
  title: string
  message: string
  type: Notification['type']
  priority: Notification['priority']
  action_url?: string
  action_label?: string
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    type: 'system',
    priority: 'normal',
    action_url: '',
    action_label: '',
  })

  // 通知一覧を取得
  const fetchNotifications = async () => {
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
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // 通知を作成
  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/notifications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (result.success) {
        fetchNotifications()
        setShowForm(false)
        resetForm()
      } else {
        alert('作成に失敗しました: ' + (result.error || '不明なエラー'))
      }
    } catch (error) {
      console.error('Failed to create notification:', error)
      alert('作成に失敗しました')
    }
  }

  // 通知を更新
  const handleUpdate = async () => {
    if (!editingId) return

    try {
      const response = await fetch(`/api/admin/notifications/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (result.success) {
        fetchNotifications()
        setShowForm(false)
        setEditingId(null)
        resetForm()
      } else {
        alert('更新に失敗しました: ' + (result.error || '不明なエラー'))
      }
    } catch (error) {
      console.error('Failed to update notification:', error)
      alert('更新に失敗しました')
    }
  }

  // 通知を削除
  const handleDelete = async (id: string) => {
    if (!confirm('この通知を削除してもよろしいですか？')) return

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      } else {
        alert('削除に失敗しました: ' + (result.error || '不明なエラー'))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
      alert('削除に失敗しました')
    }
  }

  // 既読/未読を切り替え
  const toggleReadStatus = async (id: string, isRead: boolean) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'PATCH',
      })
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: !isRead } : n))
        )
      }
    } catch (error) {
      console.error('Failed to toggle read status:', error)
    }
  }

  // フォームを開く（新規作成）
  const openCreateForm = () => {
    resetForm()
    setEditingId(null)
    setShowForm(true)
  }

  // フォームを開く（編集）
  const openEditForm = (notification: Notification) => {
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      action_url: notification.action_url || '',
      action_label: notification.action_label || '',
    })
    setEditingId(notification.id)
    setShowForm(true)
  }

  // フォームをリセット
  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'system',
      priority: 'normal',
      action_url: '',
      action_label: '',
    })
  }

  // フォームを閉じる
  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    resetForm()
  }

  // 通知タイプの日本語名
  const getTypeLabel = (type: Notification['type']) => {
    const labels = {
      order: '注文',
      quotation: '見積',
      sample: 'サンプル',
      registration: '会員登録',
      production: '生産',
      shipment: '配送',
      contract: '契約',
      system: 'システム',
    }
    return labels[type] || type
  }

  // 優先度のラベルと色
  const getPriorityInfo = (priority: Notification['priority']) => {
    const info = {
      urgent: { label: '緊急', color: 'bg-red-100 text-red-800 border-red-200' },
      high: { label: '高', color: 'bg-orange-100 text-orange-800 border-orange-200' },
      normal: { label: '通常', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      low: { label: '低', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    }
    return info[priority] || info.normal
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="h-6 w-6" />
                お知らせ管理
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                通知の作成、編集、削除
              </p>
            </div>
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              新規作成
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : showForm ? (
          /* Form */
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? '通知を編集' : '新規通知作成'}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                editingId ? handleUpdate() : handleCreate()
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="通知のタイトル"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メッセージ <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="通知の内容"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タイプ
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Notification['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="system">システム</option>
                    <option value="order">注文</option>
                    <option value="quotation">見積</option>
                    <option value="sample">サンプル</option>
                    <option value="registration">会員登録</option>
                    <option value="production">生産</option>
                    <option value="shipment">配送</option>
                    <option value="contract">契約</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    優先度
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Notification['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">低</option>
                    <option value="normal">通常</option>
                    <option value="high">高</option>
                    <option value="urgent">緊急</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  アクションURL（オプション）
                </label>
                <input
                  type="text"
                  value={formData.action_url}
                  onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="/admin/orders/123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  アクションボタンラベル（オプション）
                </label>
                <input
                  type="text"
                  value={formData.action_label}
                  onChange={(e) => setFormData({ ...formData, action_label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="詳細を見る"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {editingId ? '更新' : '作成'}
                </button>
              </div>
            </form>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">通知はありません</p>
          </div>
        ) : (
          /* Notifications List */
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                  notification.priority === 'urgent' ? 'border-red-500' :
                  notification.priority === 'high' ? 'border-orange-500' :
                  notification.priority === 'low' ? 'border-gray-300' :
                  'border-blue-500'
                } ${!notification.is_read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityInfo(notification.priority).color}`}>
                        {getPriorityInfo(notification.priority).label}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {getTypeLabel(notification.type)}
                      </span>
                      {!notification.is_read && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          未読
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.created_at).toLocaleString('ja-JP')}
                    </p>
                    {notification.action_url && (
                      <a
                        href={notification.action_url}
                        className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        {notification.action_label || '詳細を見る'} →
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleReadStatus(notification.id, notification.is_read)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={notification.is_read ? '未読にする' : '既読にする'}
                    >
                      {notification.is_read ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditForm(notification)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="編集"
                    >
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
