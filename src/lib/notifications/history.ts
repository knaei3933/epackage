/**
 * Notification History Service
 *
 * 通知履歴管理サービス
 * 通知の送信履歴・開封率・クリック率を追跡
 *
 * @module lib/notifications/history
 */

import { createClient } from '@supabase/supabase-js'
import type {
  NotificationHistoryEntry,
  NotificationStatistics,
  NotificationStatus,
  NotificationChannel,
  NotificationCategory,
} from '@/types/notification'

// ============================================================
// Configuration
// ============================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const HISTORY_TABLE = 'notification_history'

// ============================================================
// History Recording
// ============================================================

/**
 * 通知履歴を記録
 */
export async function recordNotificationHistory(entry: Omit<NotificationHistoryEntry, 'id'>): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from(HISTORY_TABLE)
      .insert({
        ...entry,
        id: `nh-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      })
      .select('id')
      .single()

    if (error) throw error
    return data?.id || null
  } catch (error) {
    console.error('[NotificationHistory] Failed to record history:', error)
    return null
  }
}

/**
 * 通知送信を記録
 */
export async function recordNotificationSent(
  notificationId: string,
  userId: string,
  type: string,
  category: NotificationCategory,
  channel: NotificationChannel,
  subject: string,
  content: string,
  metadata?: Record<string, any>
): Promise<string | null> {
  return recordNotificationHistory({
    notification_id: notificationId,
    user_id: userId,
    type,
    category,
    channel,
    status: 'sent',
    subject,
    preview: content.substring(0, 100),
    sent_at: new Date().toISOString(),
    metadata,
  })
}

/**
 * 配信完了を記録
 */
export async function recordDelivery(
  historyId: string,
  deliveredAt?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(HISTORY_TABLE)
      .update({
        status: 'delivered',
        delivered_at: deliveredAt || new Date().toISOString(),
      })
      .eq('id', historyId)

    return !error
  } catch (error) {
    console.error('[NotificationHistory] Failed to record delivery:', error)
    return false
  }
}

/**
 * 開封を記録
 */
export async function recordOpen(
  historyId: string,
  openedAt?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(HISTORY_TABLE)
      .update({
        status: 'opened',
        opened_at: openedAt || new Date().toISOString(),
      })
      .eq('id', historyId)

    return !error
  } catch (error) {
    console.error('[NotificationHistory] Failed to record open:', error)
    return false
  }
}

/**
 * クリックを記録
 */
export async function recordClick(
  historyId: string,
  clickedAt?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(HISTORY_TABLE)
      .update({
        status: 'clicked',
        clicked_at: clickedAt || new Date().toISOString(),
      })
      .eq('id', historyId)

    return !error
  } catch (error) {
    console.error('[NotificationHistory] Failed to record click:', error)
    return false
  }
}

/**
 * 失敗を記録
 */
export async function recordFailure(
  historyId: string,
  errorMessage: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(HISTORY_TABLE)
      .update({
        status: 'failed',
        error_message: errorMessage,
      })
      .eq('id', historyId)

    return !error
  } catch (error) {
    console.error('[NotificationHistory] Failed to record failure:', error)
    return false
  }
}

// ============================================================
// History Retrieval
// ============================================================

/**
 * ユーザーの通知履歴を取得
 */
export async function getUserNotificationHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<NotificationHistoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from(HISTORY_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return (data as NotificationHistoryEntry[]) || []
  } catch (error) {
    console.error('[NotificationHistory] Failed to get user history:', error)
    return []
  }
}

/**
 * 特定の通知の履歴を取得
 */
export async function getNotificationHistory(
  notificationId: string
): Promise<NotificationHistoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from(HISTORY_TABLE)
      .select('*')
      .eq('notification_id', notificationId)
      .order('sent_at', { ascending: false })

    if (error) throw error
    return (data as NotificationHistoryEntry[]) || []
  } catch (error) {
    console.error('[NotificationHistory] Failed to get notification history:', error)
    return []
  }
}

/**
 * カテゴリ別の履歴を取得
 */
export async function getHistoryByCategory(
  userId: string,
  category: NotificationCategory
): Promise<NotificationHistoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from(HISTORY_TABLE)
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('sent_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return (data as NotificationHistoryEntry[]) || []
  } catch (error) {
    console.error('[NotificationHistory] Failed to get history by category:', error)
    return []
  }
}

/**
 * チャンネル別の履歴を取得
 */
export async function getHistoryByChannel(
  userId: string,
  channel: NotificationChannel
): Promise<NotificationHistoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from(HISTORY_TABLE)
      .select('*')
      .eq('user_id', userId)
      .eq('channel', channel)
      .order('sent_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return (data as NotificationHistoryEntry[]) || []
  } catch (error) {
    console.error('[NotificationHistory] Failed to get history by channel:', error)
    return []
  }
}

// ============================================================
// Statistics
// ============================================================

/**
 * 通知統計を取得
 */
export async function getNotificationStatistics(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<NotificationStatistics | null> {
  try {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // デフォルト30日
    const end = endDate || new Date()

    const { data, error } = await supabase
      .from(HISTORY_TABLE)
      .select('*')
      .eq('user_id', userId)
      .gte('sent_at', start.toISOString())
      .lte('sent_at', end.toISOString())

    if (error) throw error
    if (!data || data.length === 0) {
      return createEmptyStatistics(start, end)
    }

    const history = data as NotificationHistoryEntry[]

    // 全体統計
    const totalSent = history.length
    const totalDelivered = history.filter(h => h.status === 'delivered' || h.status === 'opened' || h.status === 'clicked').length
    const totalOpened = history.filter(h => h.status === 'opened' || h.status === 'clicked').length
    const totalClicked = history.filter(h => h.status === 'clicked').length
    const totalFailed = history.filter(h => h.status === 'failed').length

    // チャンネル別統計
    const emailHistory = history.filter(h => h.channel === 'email')
    const smsHistory = history.filter(h => h.channel === 'sms')
    const pushHistory = history.filter(h => h.channel === 'push')

    const emailStats = calculateChannelStats(emailHistory, ['opened', 'clicked'])
    const smsStats = calculateChannelStats(smsHistory, [])
    const pushStats = calculateChannelStats(pushHistory, ['opened', 'clicked'])

    // カテゴリ別統計
    const categories: NotificationCategory[] = ['quotation', 'order', 'production', 'shipping', 'payment', 'contract', 'promotion', 'system']
    const byCategory: Record<NotificationCategory, { sent: number; delivered: number; opened: number }> = {
      quotation: { sent: 0, delivered: 0, opened: 0 },
      order: { sent: 0, delivered: 0, opened: 0 },
      production: { sent: 0, delivered: 0, opened: 0 },
      shipping: { sent: 0, delivered: 0, opened: 0 },
      payment: { sent: 0, delivered: 0, opened: 0 },
      contract: { sent: 0, delivered: 0, opened: 0 },
      promotion: { sent: 0, delivered: 0, opened: 0 },
      system: { sent: 0, delivered: 0, opened: 0 },
    }

    for (const category of categories) {
      const categoryHistory = history.filter(h => h.category === category)
      byCategory[category] = {
        sent: categoryHistory.length,
        delivered: categoryHistory.filter(h => h.status === 'delivered' || h.status === 'opened' || h.status === 'clicked').length,
        opened: categoryHistory.filter(h => h.status === 'opened' || h.status === 'clicked').length,
      }
    }

    return {
      total_sent: totalSent,
      total_delivered: totalDelivered,
      total_opened: totalOpened,
      total_clicked: totalClicked,
      total_failed: totalFailed,
      delivery_rate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      open_rate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      click_rate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      by_channel: {
        email: emailStats,
        sms: smsStats,
        push: pushStats,
      },
      by_category: byCategory,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    }
  } catch (error) {
    console.error('[NotificationHistory] Failed to get statistics:', error)
    return null
  }
}

/**
 * チャンネル統計を計算
 */
function calculateChannelStats(
  history: NotificationHistoryEntry[],
  trackedStatuses: NotificationStatus[]
) {
  return {
    sent: history.length,
    delivered: history.filter(h => h.status === 'delivered' || trackedStatuses.includes(h.status)).length,
    opened: trackedStatuses.includes('opened') ? history.filter(h => h.status === 'opened' || h.status === 'clicked').length : 0,
    clicked: trackedStatuses.includes('clicked') ? history.filter(h => h.status === 'clicked').length : 0,
    failed: history.filter(h => h.status === 'failed').length,
  }
}

/**
 * 空の統計を作成
 */
function createEmptyStatistics(startDate: Date, endDate: Date): NotificationStatistics {
  return {
    total_sent: 0,
    total_delivered: 0,
    total_opened: 0,
    total_clicked: 0,
    total_failed: 0,
    delivery_rate: 0,
    open_rate: 0,
    click_rate: 0,
    by_channel: {
      email: { sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 },
      sms: { sent: 0, delivered: 0, failed: 0 },
      push: { sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 },
    },
    by_category: {
      quotation: { sent: 0, delivered: 0, opened: 0 },
      order: { sent: 0, delivered: 0, opened: 0 },
      production: { sent: 0, delivered: 0, opened: 0 },
      shipping: { sent: 0, delivered: 0, opened: 0 },
      payment: { sent: 0, delivered: 0, opened: 0 },
      contract: { sent: 0, delivered: 0, opened: 0 },
      promotion: { sent: 0, delivered: 0, opened: 0 },
      system: { sent: 0, delivered: 0, opened: 0 },
    },
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
  }
}

// ============================================================
// Tracking Links
// ============================================================

/**
 * トラッキング用URLを生成
 */
export function generateTrackingLink(
  historyId: string,
  originalUrl: string,
  type: 'open' | 'click'
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://epackage-lab.com'
  return `${baseUrl}/api/notifications/track?history_id=${historyId}&type=${type}&url=${encodeURIComponent(originalUrl)}`
}

/**
 * トラッキングピクセルを生成（開封追跡用）
 */
export function generateTrackingPixel(historyId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://epackage-lab.com'
  return `${baseUrl}/api/notifications/track?history_id=${historyId}&type=open`
}

// ============================================================
// Cleanup & Maintenance
// ============================================================

/**
 * 古い履歴を削除
 */
export async function cleanupOldHistory(daysToKeep: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from(HISTORY_TABLE)
      .delete()
      .lt('sent_at', cutoffDate.toISOString())
      .select()

    if (error) throw error
    return data?.length || 0
  } catch (error) {
    console.error('[NotificationHistory] Failed to cleanup old history:', error)
    return 0
  }
}

/**
 * 重複履歴を削除
 */
export async function removeDuplicates(): Promise<number> {
  try {
    // 同一notification_idとchannelの組み合わせで重複を検出
    const { data: duplicates } = await supabase.rpc('find_duplicate_notifications')

    if (!duplicates || duplicates.length === 0) return 0

    // 重複を削除（最新のものを残す）
    let removed = 0
    for (const dup of duplicates) {
      await supabase
        .from(HISTORY_TABLE)
        .delete()
        .eq('notification_id', dup.notification_id)
        .eq('channel', dup.channel)
        .neq('id', dup.keep_id)
      removed++
    }

    return removed
  } catch (error) {
    console.error('[NotificationHistory] Failed to remove duplicates:', error)
    return 0
  }
}

// ============================================================
// Analytics Queries
// ============================================================

/**
 * 最も開封された通知タイプを取得
 */
export async function getMostOpenedTypes(
  userId: string,
  limit: number = 5
): Promise<Array<{ type: string; count: number }>> {
  try {
    const { data, error } = await supabase
      .from(HISTORY_TABLE)
      .select('type')
      .eq('user_id', userId)
      .in('status', ['opened', 'clicked'])

    if (error) throw error
    if (!data) return []

    // タイプ別に集計
    const counts: Record<string, number> = {}
    for (const item of data) {
      counts[item.type] = (counts[item.type] || 0) + 1
    }

    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  } catch (error) {
    console.error('[NotificationHistory] Failed to get most opened types:', error)
    return []
  }
}

/**
 * 最もクリックされた通知カテゴリを取得
 */
export async function getMostClickedCategories(
  userId: string,
  limit: number = 5
): Promise<Array<{ category: string; count: number }>> {
  try {
    const { data, error } = await supabase
      .from(HISTORY_TABLE)
      .select('category')
      .eq('user_id', userId)
      .eq('status', 'clicked')

    if (error) throw error
    if (!data) return []

    const counts: Record<string, number> = {}
    for (const item of data) {
      counts[item.category] = (counts[item.category] || 0) + 1
    }

    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  } catch (error) {
    console.error('[NotificationHistory] Failed to get most clicked categories:', error)
    return []
  }
}
