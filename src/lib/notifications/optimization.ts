/**
 * Delivery Optimization Service
 *
 * 配信最適化サービス
 * タイムゾーン考慮・AIスケジューリング・コスト最適化
 *
 * @module lib/notifications/optimization
 */

import { createClient } from '@supabase/supabase-js'
import type {
  DeliveryOptimization,
  DeliveryTimeRecommendation,
  DeliveryScore,
  NotificationChannel,
} from '@/types/notification'
import { isInQuietHours } from './preferences'

// ============================================================
// Configuration
// ============================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const OPTIMIZATION_TABLE = 'delivery_optimization'

// デフォルト設定
const DEFAULT_OPTIMIZATION: DeliveryOptimization = {
  timezone_aware_sending: true,
  quiet_hours_enforced: true,
  smart_scheduling: false,
  rate_limiting: true,
  cost_optimization: true,
}

// ============================================================
// Timezone-Based Sending
// ============================================================

/**
 * タイムゾーンに基づく最適な送信時刻を計算
 */
export async function calculateOptimalSendTime(
  userId: string,
  baseDate: Date = new Date()
): Promise<Date> {
  try {
    // ユーザーのタイムゾーンを取得（デフォルト: Asia/Tokyo）
    const userTimezone = await getUserTimezone(userId)

    // ユーザーの現地時間で計算
    const userLocalTime = new Date(baseDate.toLocaleString('en-US', { timeZone: userTimezone }))
    const hour = userLocalTime.getHours()

    // 通知停止時間帯をチェック
    const inQuietHours = await isInQuietHours(userId)

    if (inQuietHours) {
      // 停止時間帯が終わる時刻を計算
      const { end } = await getQuietHours(userId)
      const [endHour, endMin] = end.split(':').map(Number)

      // 次の有効な時刻を返す
      const nextValidTime = new Date(userLocalTime)
      nextValidTime.setHours(endHour, endMin, 0, 0)

      // もし現在時刻が終了時刻より後の場合、翌日に設定
      if (userLocalTime.getTime() > nextValidTime.getTime()) {
        nextValidTime.setDate(nextValidTime.getDate() + 1)
      }

      return new Date(nextValidTime.toLocaleString('en-US', { timeZone: userTimezone }))
    }

    // 最適な送信時間（9:00-18:00の間）
    const optimalHours = [9, 10, 11, 14, 15, 16, 17]
    const closestHour = optimalHours.find(h => h > hour) || optimalHours[0]

    const optimalTime = new Date(userLocalTime)
    if (closestHour <= hour) {
      optimalTime.setDate(optimalTime.getDate() + 1)
    }
    optimalTime.setHours(closestHour, 0, 0, 0)

    return new Date(optimalTime.toLocaleString('en-US', { timeZone: userTimezone }))
  } catch (error) {
    console.error('[DeliveryOptimization] Failed to calculate optimal send time:', error)
    return baseDate
  }
}

/**
 * ユーザーのタイムゾーンを取得
 */
async function getUserTimezone(userId: string): Promise<string> {
  try {
    const { data } = await supabase
      .from('notification_preferences')
      .select('quiet_hours')
      .eq('user_id', userId)
      .single()

    return ((data as { quiet_hours?: { timezone?: string } } | null)?.quiet_hours?.timezone) || 'Asia/Tokyo'
  } catch (error) {
    return 'Asia/Tokyo'
  }
}

/**
 * 通知停止時間帯を取得
 */
async function getQuietHours(userId: string): Promise<{ start: string; end: string }> {
  try {
    const { data } = await supabase
      .from('notification_preferences')
      .select('quiet_hours')
      .eq('user_id', userId)
      .single()

    const quietHours = (data as { quiet_hours?: { start?: string; end?: string } } | null)?.quiet_hours
    return {
      start: quietHours?.start || '22:00',
      end: quietHours?.end || '08:00',
    }
  } catch (error) {
    return { start: '22:00', end: '08:00' }
  }
}

// ============================================================
// Smart Scheduling
// ============================================================

/**
 * 最適な送信時間を推奨（AIによる学習ベース）
 */
export async function getDeliveryTimeRecommendations(
  userId: string
): Promise<DeliveryTimeRecommendation> {
  try {
    // ユーザーの過去の開封データを分析
    const { data: history } = await supabase
      .from('notification_history')
      .select('sent_at, opened_at, channel')
      .eq('user_id', userId)
      .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('sent_at', { ascending: false })

    if (!history || history.length === 0) {
      // デフォルト推奨
      return {
        user_id: userId,
        recommended_times: [
          { hour: 10, day_of_week: 1, expected_open_rate: 0.25 },
          { hour: 14, day_of_week: 2, expected_open_rate: 0.23 },
          { hour: 11, day_of_week: 3, expected_open_rate: 0.22 },
        ],
        reason: 'insufficient_data',
      }
    }

    // 曜日・時間別の開封率を計算
    const timeSlotOpenRates: Record<string, { opened: number; total: number }> = {}

    for (const record of history) {
      if (!record.opened_at) continue

      const sentDate = new Date(record.sent_at)
      const hour = sentDate.getHours()
      const dayOfWeek = sentDate.getDay()
      const key = `${hour}-${dayOfWeek}`

      if (!timeSlotOpenRates[key]) {
        timeSlotOpenRates[key] = { opened: 0, total: 0 }
      }

      timeSlotOpenRates[key].opened++
      timeSlotOpenRates[key].total++
    }

    // 最適な時間帯をランキング
    const rankings = Object.entries(timeSlotOpenRates)
      .map(([key, stats]) => {
        const [hour, dayOfWeek] = key.split('-').map(Number)
        return {
          hour,
          day_of_week: dayOfWeek,
          expected_open_rate: stats.total > 0 ? stats.opened / stats.total : 0,
        }
      })
      .sort((a, b) => b.expected_open_rate - a.expected_open_rate)
      .slice(0, 5)

    return {
      user_id: userId,
      recommended_times: rankings,
      reason: 'based_on_past_engagement',
    }
  } catch (error) {
    console.error('[DeliveryOptimization] Failed to get recommendations:', error)
    return {
      user_id: userId,
      recommended_times: [],
      reason: 'error_calculating',
    }
  }
}

// ============================================================5
// Delivery Scoring
// ============================================================

/**
 * 配信スコアを計算
 */
export async function calculateDeliveryScore(
  userId: string,
  channel: NotificationChannel
): Promise<DeliveryScore> {
  try {
    // 過去30日間の配信データを取得
    const { data: history } = await supabase
      .from('notification_history')
      .select('status, sent_at')
      .eq('user_id', userId)
      .eq('channel', channel)
      .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (!history || history.length === 0) {
      return {
        user_id: userId,
        channel,
        score: 50,
        factors: {
          engagement_rate: 0,
          delivery_success_rate: 0,
          recent_activity: 0,
          time_of_day_match: 0,
        },
        calculated_at: new Date().toISOString(),
      }
    }

    // 配信成功率
    const successCount = history.filter(h => h.status === 'delivered' || h.status === 'opened' || h.status === 'clicked').length
    const deliverySuccessRate = successCount / history.length

    // エンゲージメント率（開封+クリック）
    const engagementCount = history.filter(h => h.status === 'opened' || h.status === 'clicked').length
    const engagementRate = engagementCount / history.length

    // 最近のアクティビティ（過去7日間の通知数）
    const recentCount = history.filter(h => {
      const sentDate = new Date(h.sent_at)
      const daysSince = (Date.now() - sentDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysSince <= 7
    }).length
    const recentActivity = Math.min(recentCount / 10, 1) // 最大1.0

    // 時間帯マッチ（簡易計算）
    const now = new Date()
    const hour = now.getHours()
    const timeOfDayMatch = hour >= 9 && hour <= 18 ? 1 : 0.5

    // 総合スコア（0-100）
    const score = Math.round(
      (
        deliverySuccessRate * 30 +
        engagementRate * 40 +
        recentActivity * 20 +
        timeOfDayMatch * 10
      )
    )

    return {
      user_id: userId,
      channel,
      score,
      factors: {
        engagement_rate: engagementRate,
        delivery_success_rate: deliverySuccessRate,
        recent_activity: recentActivity,
        time_of_day_match: timeOfDayMatch,
      },
      calculated_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error('[DeliveryOptimization] Failed to calculate delivery score:', error)
    return {
      user_id: userId,
      channel,
      score: 0,
      factors: {
        engagement_rate: 0,
        delivery_success_rate: 0,
        recent_activity: 0,
        time_of_day_match: 0,
      },
      calculated_at: new Date().toISOString(),
    }
  }
}

// ============================================================
// Cost Optimization
// ============================================================

/**
 * コスト最適化チャンネルを選択
 */
export async function selectOptimalChannel(
  userId: string,
  availableChannels: NotificationChannel[],
  urgency: 'low' | 'normal' | 'high' | 'urgent'
): Promise<NotificationChannel[]> {
  try {
    // コスト順（安い順）
    const costOrder: NotificationChannel[] = ['push', 'sms', 'email']

    // 緊急度に応じてチャンネルをフィルタリング
    let channels = availableChannels

    if (urgency === 'urgent') {
      // 緊急: すべてのチャンネル
      return channels
    } else if (urgency === 'high') {
      // 高: SMS + Email
      channels = channels.filter(c => c === 'sms' || c === 'email')
    } else if (urgency === 'normal') {
      // 普通: Push + Email
      channels = channels.filter(c => c === 'push' || c === 'email')
    } else {
      // 低: Pushのみ（またはEmail）
      channels = channels.filter(c => c === 'push' || c === 'email')
    }

    // コスト順にソートして返す
    return channels.sort((a, b) => costOrder.indexOf(a) - costOrder.indexOf(b))
  } catch (error) {
    console.error('[DeliveryOptimization] Failed to select optimal channel:', error)
    return availableChannels
  }
}

/**
 * 通知送信コストを見積もり
 */
export async function estimateNotificationCost(
  channels: NotificationChannel[],
  recipientCount: number
): Promise<{
  totalCost: number
  byChannel: Record<NotificationChannel, number>
}> {
  // 推定コスト（USD）
  const costsPerNotification: Record<NotificationChannel, number> = {
    email: 0.001,   // SendGridなど
    sms: 0.08,      // Twilio（日本向け）
    push: 0.0001,   // FCM（実質無料）
    webhook: 0.0001,
  }

  const byChannel: Record<string, number> = {}
  let totalCost = 0

  for (const channel of channels) {
    const channelCost = costsPerNotification[channel] * recipientCount
    byChannel[channel] = channelCost
    totalCost += channelCost
  }

  return {
    totalCost,
    byChannel: byChannel as Record<NotificationChannel, number>,
  }
}

// ============================================================
// Rate Limiting
// ============================================================

/**
 * レート制限をチェック
 */
export async function checkRateLimit(
  userId: string,
  channel: NotificationChannel
): Promise<{ allowed: boolean; remaining?: number; resetAt?: Date }> {
  try {
    // 過去1時間の送信数を確認
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('notification_history')
      .select('id')
      .eq('user_id', userId)
      .eq('channel', channel)
      .gte('sent_at', oneHourAgo.toISOString())

    if (error) throw error

    const sentCount = data?.length || 0

    // チャンネルごとの制限
    const limits: Record<NotificationChannel, number> = {
      email: 10,   // 10通/時間
      sms: 5,      // 5通/時間
      push: 20,    // 20通/時間
      webhook: 50,
    }

    const limit = limits[channel]
    const remaining = Math.max(0, limit - sentCount)

    return {
      allowed: remaining > 0,
      remaining,
      resetAt: new Date(oneHourAgo.getTime() + 60 * 60 * 1000),
    }
  } catch (error) {
    console.error('[DeliveryOptimization] Failed to check rate limit:', error)
    return { allowed: true }
  }
}

// ============================================================
// Optimization Settings
// ============================================================

/**
 * 最適化設定を取得
 */
export async function getOptimizationSettings(): Promise<DeliveryOptimization> {
  try {
    const { data } = await supabase
      .from(OPTIMIZATION_TABLE)
      .select('*')
      .single()

    return data || DEFAULT_OPTIMIZATION
  } catch (error) {
    return DEFAULT_OPTIMIZATION
  }
}

/**
 * 最適化設定を更新
 */
export async function updateOptimizationSettings(
  settings: Partial<DeliveryOptimization>
): Promise<boolean> {
  try {
    const existing = await getOptimizationSettings()

    const { error } = await supabase
      .from(OPTIMIZATION_TABLE)
      .upsert({
        ...existing,
        ...settings,
      })

    return !error
  } catch (error) {
    console.error('[DeliveryOptimization] Failed to update settings:', error)
    return false
  }
}

// ============================================================
// A/B Testing Support
// ============================================================

/**
 * A/Bテストグループを割り当て
 */
export async function assignTestGroup(
  userId: string,
  testId: string
): Promise<'control' | 'variant_a' | 'variant_b'> {
  try {
    // ユーザーIDのハッシュに基づいてグループを決定
    const hash = simpleHash(userId + testId)
    const group = hash % 3

    return group === 0 ? 'control' : group === 1 ? 'variant_a' : 'variant_b'
  } catch (error) {
    return 'control'
  }
}

/**
 * シンプルハッシュ関数
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}
