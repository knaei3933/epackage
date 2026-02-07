/**
 * useNotifications Hook
 *
 * SWRポーリングによるリアルタイム通知取得
 * - 30秒間隔で自動更新
 * - DEV_MODE対応
 * - 統合通知APIを使用
 */

'use client';

import useSWR from 'swr';
import type { Notification } from '@/lib/unified-notifications';

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  mutate: () => void;
}

interface UseNotificationsOptions {
  refreshInterval?: number; // ポーリング間隔（デフォルト: 30秒）
  unreadOnly?: boolean;
  limit?: number;
}

/**
 * 通知フック
 *
 * @param options - オプション
 * @returns 通知データと操作関数
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsResult {
  const {
    refreshInterval = 30000, // 30秒デフォルト
    unreadOnly = false,
    limit = 50,
  } = options;

  // DEV_MODEヘッダー生成
  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const devUserId = typeof window !== 'undefined'
      ? localStorage.getItem('dev-mock-user-id')
      : null;

    if (devUserId) {
      headers['x-dev-mode'] = 'true';
      headers['x-user-id'] = devUserId;
    }

    return headers;
  };

  // SWRフェッチャー
  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      credentials: 'include',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<Notification[]>;
  };

  // クエリパラメータ構築
  const params = new URLSearchParams();
  if (unreadOnly) params.set('unreadOnly', 'true');
  if (limit) params.set('limit', limit.toString());

  const queryString = params.toString();
  const url = `/api/notifications${queryString ? `?${queryString}` : ''}`;

  // SWRでデータ取得
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<Notification[]>(url, fetcher, {
    refreshInterval,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    shouldRetryOnError: false,
    dedupingInterval: 5000, // 5秒以内の重複リクエストを防止
  });

  // 未読カウント計算
  const unreadCount = data?.filter((n) => !n.is_read).length || 0;

  return {
    notifications: data || [],
    unreadCount,
    isLoading,
    error: error?.message || null,
    mutate,
  };
}
