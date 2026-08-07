/**
 * Delivery Optimization Service
 *
 * 配信最適化サービス
 * タイムゾーン考慮・AIスケジューリング・コスト最適化
 *
 * @module lib/notifications/optimization
 */

// ---------------------------------------------------------------------------
// C2 drift 対応（TECH DEBT）
// ---------------------------------------------------------------------------
// 本モジュールが参照していた以下の実DB不存在テーブルを neutralize した:
//   - notification_history       （配信履歴・開封データ）
//   - notification_preferences   （ユーザー設定・タイムゾーン・通知停止時間帯）
//   - delivery_optimization      （配信最適化システム設定）
// いずれも実DB（database.ts SoT）に不存在。本サービスは未配線の予備機能であり、
// アプリ/APIルート/コンポーネントのいずれからも呼び出されていない。
//
// ガイドの「完全にデッド機能 → 機能を安全に無害化」方針に従い、各関数はシグネチャを
// 維持したまま安全なデフォルト値（デフォルト設定・空データ・許可）を返す。
// タイムゾーン計算・コスト見積もり・A/Bテスト割当てなど純粋計算はそのまま動作する。
//
// 将来この機能を有効化する場合は、`notification_settings`（KV）や `unified_notifications`
// 等の実DB存在テーブルへ統合するか、専用テーブルの新設をリードに依頼すること。
// ---------------------------------------------------------------------------

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
 *
 * drift: `notification_preferences` が実DB不存在のためデフォルト 'Asia/Tokyo' を返す。
 */
async function getUserTimezone(_userId: string): Promise<string> {
  return 'Asia/Tokyo'
}

/**
 * 通知停止時間帯を取得
 *
 * drift: `notification_preferences` が実DB不存在のためデフォルト設定を返す。
 */
async function getQuietHours(_userId: string): Promise<{ start: string; end: string }> {
  return { start: '22:00', end: '08:00' }
}

// ============================================================
// Smart Scheduling
// ============================================================

/**
 * 最適な送信時間を推奨（AIによる学習ベース）
 *
 * drift: `notification_history` が実DB不存在のため過去データが得られず、
 * データ不足時のデフォルト推奨を返す。
 */
export async function getDeliveryTimeRecommendations(
  userId: string
): Promise<DeliveryTimeRecommendation> {
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

// ============================================================
// Delivery Scoring
// ============================================================

/**
 * 配信スコアを計算
 *
 * drift: `notification_history` が実DB不存在のため過去データが得られず、
 * スコア 50（中立）を返す。
 */
export async function calculateDeliveryScore(
  userId: string,
  channel: NotificationChannel
): Promise<DeliveryScore> {
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

// ============================================================
// Cost Optimization
// ============================================================

/**
 * コスト最適化チャンネルを選択
 */
export async function selectOptimalChannel(
  _userId: string,
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
 *
 * drift: `notification_history` が実DB不存在のため送信履歴が取得できず、
 * 常に許可（allowed: true）を返す。
 */
export async function checkRateLimit(
  _userId: string,
  _channel: NotificationChannel
): Promise<{ allowed: boolean; remaining?: number; resetAt?: Date }> {
  return { allowed: true }
}

// ============================================================
// Optimization Settings
// ============================================================

/**
 * 最適化設定を取得
 *
 * drift: `delivery_optimization` が実DB不存在のためデフォルト設定を返す。
 */
export async function getOptimizationSettings(): Promise<DeliveryOptimization> {
  return DEFAULT_OPTIMIZATION
}

/**
 * 最適化設定を更新
 *
 * drift: `delivery_optimization` が実DB不存在のため永続化できず false を返す。
 */
export async function updateOptimizationSettings(
  _settings: Partial<DeliveryOptimization>
): Promise<boolean> {
  return false
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
