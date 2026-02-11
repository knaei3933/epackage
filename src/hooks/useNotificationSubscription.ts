'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Notification } from '@/lib/unified-notifications';

// =====================================================
// Types
// =====================================================

export interface UseNotificationSubscriptionProps {
  userId: string;
  userType: 'member' | 'admin';
  initialNotifications?: Notification[];
  fetchUrl?: string;
}

export interface NotificationSubscriptionResult {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

// =====================================================
// Hook
// =====================================================

export function useNotificationSubscription({
  userId,
  userType,
  initialNotifications = [],
  fetchUrl = '/api/notifications',
}: UseNotificationSubscriptionProps): NotificationSubscriptionResult {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(
    initialNotifications.filter(n => !n.is_read).length
  );

  useEffect(() => {
    if (!supabase) {
      console.warn('[NotificationSubscription] Supabase client not available');
      return;
    }

    const tableName = 'unified_notifications';
    const filter = `recipient_id=eq.${userId}&recipient_type=eq.${userType}`;

    const channel = supabase
      .channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: filter,
        },
        (payload: any) => {
          console.log('[Realtime] Notification change:', payload.eventType, payload);

          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as Notification;
            setNotifications((prev) => [newNotification, ...prev]);
            if (!newNotification.is_read) {
              setUnreadCount((prev) => prev + 1);
            }
          } else if (payload.eventType === 'UPDATE') {
            const oldRead = payload.old.is_read;
            const newRead = payload.new.is_read;
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new as Notification : n))
            );
            // 未読→既読、既読→未読の変化を反映
            if (oldRead !== newRead) {
              setUnreadCount((prev) => (newRead ? prev - 1 : prev + 1));
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedNotification = payload.old as Notification;
            setNotifications((prev) => prev.filter((n) => n.id !== deletedNotification.id));
            if (!deletedNotification.is_read) {
              setUnreadCount((prev) => prev - 1);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      });

    // 初期フェッチ
    fetchNotifications();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userType, fetchUrl]);

  // 通知一覧取得
  const fetchNotifications = async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(fetchUrl, {
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
    } catch (error) {
      console.error('[NotificationSubscription] Fetch error:', error);
    }
  };

  // 既読にする
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // ローカル状態を更新
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('[NotificationSubscription] Mark as read error:', error);
      throw error;
    }
  };

  // 全て既読にする
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // ローカル状態を更新
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('[NotificationSubscription] Mark all as read error:', error);
      throw error;
    }
  };

  // 通知削除
  const deleteNotification = async (notificationId: string) => {
    try {
      const wasUnread = notifications.find(n => n.id === notificationId)?.is_read === false;

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // ローカル状態を更新
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (wasUnread) {
        setUnreadCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error('[NotificationSubscription] Delete error:', error);
      throw error;
    }
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
}
