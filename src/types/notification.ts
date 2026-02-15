/**
 * Extended Notification Type Definitions
 *
 * 拡張通知タイプ定義
 * マルチチャネル通知システムの型定義
 */

// ============================================================
// Notification Channel Types
// ============================================================

/**
 * 通知チャンネル
 */
export type NotificationChannel = 'email' | 'sms' | 'push' | 'webhook'

/**
 * 通知ステータス
 */
export type NotificationStatus =
  | 'pending'       // 送信待ち
  | 'sending'       // 送信中
  | 'sent'          // 送信完了
  | 'delivered'     // 配信完了
  | 'failed'        // 失敗
  | 'bounced'       // バウンス
  | 'opened'        // 開封済み
  | 'clicked'       // クリック済み

/**
 * 優先度レベル
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

// ============================================================
// Core Notification Types
// ============================================================

/**
 * 基本通知データ
 */
export interface BaseNotification {
  id: string
  type: string
  recipient_id: string
  channels: NotificationChannel[]
  subject: string
  content: {
    text: string
    html?: string
  }
  data?: Record<string, any>
  priority: NotificationPriority
  scheduled_at?: string
  created_at: string
  updated_at: string
}

/**
 * 通知レコード（データベース用）
 */
export interface NotificationRecord extends BaseNotification {
  status: NotificationStatus
  sent_at?: string
  delivered_at?: string
  error_message?: string
  retry_count: number
  max_retries: number
  metadata?: {
    order_id?: string
    quotation_id?: string
    user_id?: string
    [key: string]: any
  }
}

/**
 * チャンネルごとの送信結果
 */
export interface ChannelDeliveryResult {
  channel: NotificationChannel
  status: NotificationStatus
  message_id?: string
  sent_at?: string
  delivered_at?: string
  error_code?: string
  error_message?: string
  cost?: number
}

/**
 * 通知送信結果
 */
export interface NotificationDeliveryResult {
  notification_id: string
  channels: ChannelDeliveryResult[]
  overall_status: NotificationStatus
  sent_at: string
}

// ============================================================
// SMS Notification Types
// ============================================================

/**
 * SMS通知データ
 */
export interface SMSNotification extends BaseNotification {
  channels: ['sms'] | ['email', 'sms']
  phone_number: string
  content: {
    text: string  // SMSはテキストのみ
  }
}

/**
 * SMS送信オプション
 */
export interface SMSOptions {
  sender_id?: string    // 送信者ID
  encoding?: 'UTF8' | 'GSM'
  max_segments?: number // 最大分割数
  delivery_receipt?: boolean
}

// ============================================================
// Push Notification Types
// ============================================================

/**
 * プッシュ通知データ
 */
export interface PushNotification extends BaseNotification {
  channels: ['push'] | ['email', 'push']
  device_tokens: string[]
  push: {
    title: string
    body: string
    icon?: string
    badge?: number
    sound?: string
    click_action?: string
    data?: Record<string, any>
  }
}

/**
 * デバイストークン情報
 */
export interface DeviceToken {
  id: string
  user_id: string
  token: string
  platform: 'ios' | 'android' | 'web'
  app_version?: string
  os_version?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================
// Notification Preferences
// ============================================================

/**
 * 通知設定
 */
export interface NotificationPreferences {
  user_id: string
  channels: {
    email: {
      enabled: boolean
      categories: NotificationCategory[]
    }
    sms: {
      enabled: boolean
      phone_number?: string
      categories: NotificationCategory[]
    }
    push: {
      enabled: boolean
      categories: NotificationCategory[]
    }
    webhook?: {
      enabled: boolean
      url?: string
      categories: NotificationCategory[]
    }
  }
  quiet_hours?: {
    enabled: boolean
    start: string // HH:mm
    end: string   // HH:mm
    timezone: string
  }
  language: 'ja' | 'en'
  updated_at: string
}

/**
 * 通知カテゴリ
 */
export type NotificationCategory =
  | 'quotation'        // 見積関連
  | 'order'            // 注文関連
  | 'production'       // 生産関連
  | 'shipping'         // 配送関連
  | 'payment'          // 支払い関連
  | 'contract'         // 契約関連
  | 'promotion'        // プロモーション
  | 'system'           // システム通知

/**
 * 通知カテゴリ設定
 */
export interface CategoryPreference {
  category: NotificationCategory
  enabled: boolean
  channels: NotificationChannel[]
}

// ============================================================
// Notification History
// ============================================================

/**
 * 通知履歴エントリ
 */
export interface NotificationHistoryEntry {
  id: string
  notification_id: string
  user_id: string
  type: string
  category: NotificationCategory
  channel: NotificationChannel
  status: NotificationStatus
  subject: string
  preview: string    // 最初の100文字程度
  sent_at: string
  delivered_at?: string
  opened_at?: string
  clicked_at?: string
  metadata?: Record<string, any>
}

/**
 * 通知統計
 */
export interface NotificationStatistics {
  total_sent: number
  total_delivered: number
  total_opened: number
  total_clicked: number
  total_failed: number
  delivery_rate: number      // 配信率
  open_rate: number          // 開封率
  click_rate: number         // クリック率
  by_channel: {
    email: {
      sent: number
      delivered: number
      opened: number
      clicked: number
      failed: number
    }
    sms: {
      sent: number
      delivered: number
      failed: number
    }
    push: {
      sent: number
      delivered: number
      opened: number
      clicked: number
      failed: number
    }
  }
  by_category: Record<NotificationCategory, {
    sent: number
    delivered: number
    opened: number
  }>
  period: {
    start: string
    end: string
  }
}

// ============================================================
// Batch Processing Types
// ============================================================

/**
 * バッチ通知ジョブ
 */
export interface BatchNotificationJob {
  id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  total_recipients: number
  processed_recipients: number
  successful_sends: number
  failed_sends: number
  started_at?: string
  completed_at?: string
  created_by: string
  created_at: string
  updated_at: string
}

/**
 * バッチ通知レコード
 */
export interface BatchNotification {
  id: string
  job_id: string
  recipient_id: string
  notification_id: string
  status: NotificationStatus
  retry_count: number
  error_message?: string
  processed_at?: string
}

/**
 * バッチ送信オプション
 */
export interface BatchSendOptions {
  batch_size?: number      // 一度に処理する数（デフォルト: 100）
  delay_between_batches?: number  // バッチ間の遅延（ms）
  max_retries?: number     // 最大再試行回数（デフォルト: 3）
  retry_delay?: number     // 再試行までの遅延（ms）
  continue_on_error?: boolean  // エラー時も続行するか
}

// ============================================================
// Delivery Optimization Types
// ============================================================

/**
 * 配信最適化設定
 */
export interface DeliveryOptimization {
  timezone_aware_sending: boolean  // タイムゾーンを考慮した送信
  quiet_hours_enforced: boolean    // 通知停止時間帯の尊重
  smart_scheduling: boolean        // AIによる最適な送信時間の予測
  rate_limiting: boolean           // レート制限の適用
  cost_optimization: boolean       // コスト最適化（安価なチャンネル優先）
}

/**
 * 配信時間推奨
 */
export interface DeliveryTimeRecommendation {
  user_id: string
  recommended_times: {
    hour: number      // 0-23
    day_of_week: number // 0-6 (日曜=0)
    expected_open_rate: number
  }[]
  reason: string
}

/**
 * 配信スコア
 */
export interface DeliveryScore {
  user_id: string
  channel: NotificationChannel
  score: number        // 0-100
  factors: {
    engagement_rate: number
    delivery_success_rate: number
    recent_activity: number
    time_of_day_match: number
  }
  calculated_at: string
}

// ============================================================
// Webhook Types
// ============================================================

/**
 * Webhook通知
 */
export interface WebhookNotification extends BaseNotification {
  channels: ['webhook'] | ['email', 'webhook']
  webhook_url: string
  webhook_method: 'POST' | 'PUT'
  webhook_headers?: Record<string, string>
  retry_policy: {
    max_retries: number
    backoff_multiplier: number
    initial_delay: number
  }
}

/**
 * Webhookイベント
 */
export interface WebhookEvent {
  id: string
  event_type: string
  timestamp: string
  data: Record<string, any>
  signature?: string  // HMAC署名
}

// ============================================================
// Template Types
// ============================================================

/**
 * マルチチャネルテンプレート
 */
export interface MultiChannelTemplate {
  id: string
  name: string
  type: string
  category: NotificationCategory
  channels: {
    email?: {
      subject: string
      html: string
      text: string
    }
    sms?: {
      text: string
    }
    push?: {
      title: string
      body: string
    }
  }
  variables: string[]  // テンプレート変数名
  created_at: string
  updated_at: string
}

// ============================================================
// Type Guards
// ============================================================

/**
 * SMS通知かどうか
 */
export function isSMSNotification(notification: BaseNotification): notification is SMSNotification {
  return notification.channels.includes('sms')
}

/**
 * プッシュ通知かどうか
 */
export function isPushNotification(notification: BaseNotification): notification is PushNotification {
  return notification.channels.includes('push')
}

/**
 * Webhook通知かどうか
 */
export function isWebhookNotification(notification: BaseNotification): notification is WebhookNotification {
  return notification.channels.includes('webhook')
}
