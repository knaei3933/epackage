/**
 * Notifications API Functions
 *
 * 通知API関数
 */

// =====================================================
// Types
// =====================================================

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'quotation' | 'shipment' | 'payment' | 'system';
  is_read: boolean;
  created_at: string;
  link_url?: string;
}

// =====================================================
// API Client Functions
// =====================================================

/**
 * Fetch notifications for the current member
 */
export async function fetchNotifications(): Promise<Notification[]> {
  const response = await fetch('/api/member/notifications', {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '通知の取得に失敗しました');
  }

  const { data } = await response.json();
  return data || [];
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const response = await fetch(`/api/member/notifications/${notificationId}/read`, {
    method: 'PATCH',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '通知の既読化に失敗しました');
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const response = await fetch('/api/member/notifications/mark-all-read', {
    method: 'PATCH',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '一括既読化に失敗しました');
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const response = await fetch(`/api/member/notifications/${notificationId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '通知の削除に失敗しました');
  }
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(): Promise<void> {
  const response = await fetch('/api/member/notifications/delete-all', {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '一括削除に失敗しました');
  }
}
