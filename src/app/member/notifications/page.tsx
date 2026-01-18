/**
 * Member Notifications Page
 *
 * 通知一覧ページ
 * - 通知一覧表示
 * - 既読/未読管理
 * - 通知削除機能
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button, Badge, PageLoadingState } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Bell, Trash2, Check, CheckCheck, Filter } from 'lucide-react';

// =====================================================
// Types
// =====================================================

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'quotation' | 'shipment' | 'payment' | 'system';
  is_read: boolean;
  created_at: string;
  link_url?: string;
}

type NotificationFilter = 'all' | 'unread' | 'order' | 'quotation' | 'shipment' | 'payment' | 'system';

// =====================================================
// Constants
// =====================================================

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  order: '注文',
  quotation: '見積',
  shipment: '配送',
  payment: '支払い',
  system: 'システム',
};

const NOTIFICATION_FILTERS = [
  { value: 'all', label: 'すべて' },
  { value: 'unread', label: '未読' },
  { value: 'order', label: '注文' },
  { value: 'quotation', label: '見積' },
  { value: 'shipment', label: '配送' },
  { value: 'payment', label: '支払い' },
  { value: 'system', label: 'システム' },
];

const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
  order: '📦',
  quotation: '📁',
  shipment: '🚚',
  payment: '💳',
  system: '⚙️',
};

// =====================================================
// Page Component
// =====================================================

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<NotificationFilter>('all');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[NotificationsPage] User not authenticated, redirecting to login');
      router.push('/auth/signin?redirect=/member/notifications');
    }
  }, [authLoading, user, router]);

  const fetchNotifications = async () => {
    if (authLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      if (!user?.id) {
        throw new Error('Not authenticated');
      }

      // Fetch notifications from API
      const response = await fetch('/api/member/notifications', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const { data } = await response.json();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('通知の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchNotifications();
    }
  }, [user?.id, authLoading]);

  // Apply filters
  useEffect(() => {
    let filtered = [...notifications];

    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter((n) => !n.is_read);
        break;
      case 'order':
      case 'quotation':
      case 'shipment':
      case 'payment':
      case 'system':
        filtered = filtered.filter((n) => n.type === selectedFilter);
        break;
      case 'all':
      default:
        // No filter
        break;
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredNotifications(filtered);
  }, [notifications, selectedFilter]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/member/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/member/notifications/mark-all-read', {
        method: 'PATCH',
        credentials: 'include',
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm('この通知を削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/member/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('すべての通知を削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch('/api/member/notifications/delete-all', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Failed to delete all notifications:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate to link if exists
    if (notification.link_url) {
      router.push(notification.link_url);
    }
  };

  // Show loading state while auth context is initializing
  if (authLoading || isLoading) {
    return <PageLoadingState isLoading={true} message="通知を読み込み中..." />;
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">通知</h1>
          <p className="text-text-muted mt-1">通知の一覧と管理</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              すべて既読
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" onClick={handleDeleteAll}>
              <Trash2 className="w-4 h-4 mr-2" />
              すべて削除
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-text-muted" />
          {NOTIFICATION_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value as NotificationFilter)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedFilter === filter.value
                  ? 'bg-primary text-white'
                  : 'bg-bg-secondary text-text-muted hover:bg-border-secondary'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-16 h-16 mx-auto text-text-muted mb-4" />
          <p className="text-text-muted mb-2">
            {notifications.length === 0
              ? '通知がありません'
              : '選択したフィルターに一致する通知がありません'}
          </p>
          {selectedFilter !== 'all' && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSelectedFilter('all')}
            >
              すべての通知を表示
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 hover:shadow-sm transition-all cursor-pointer ${
                !notification.is_read
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                  : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-2xl">
                  {NOTIFICATION_TYPE_ICONS[notification.type] || '🔔'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium ${!notification.is_read ? 'text-text-primary' : 'text-text-muted'}`}>
                      {notification.title}
                    </h3>
                    {!notification.is_read && (
                      <Badge variant="info" size="sm">新着</Badge>
                    )}
                    <Badge variant="secondary" size="sm">
                      {NOTIFICATION_TYPE_LABELS[notification.type]}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-muted mb-2 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      title="既読にする"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {notifications.length > 0 && (
        <div className="text-sm text-text-muted text-center">
          {unreadCount > 0
            ? `${unreadCount}件の未読通知`
            : 'すべての通知を既読しました'}
          （全{notifications.length}件）
        </div>
      )}
    </div>
  );
}
