/**
 * Push Notification Service
 *
 * プッシュ通知サービス
 * Firebase Cloud Messaging (FCM)を使用したプッシュ通知送信機能
 *
 * @module lib/notifications/push
 */

import { createClient } from '@supabase/supabase-js'
import type {
  PushNotification,
  DeviceToken,
  NotificationStatus,
  ChannelDeliveryResult,
} from '@/types/notification'

// ============================================================
// Configuration
// ============================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Firebase設定
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY
const FCM_PROJECT_ID = process.env.FCM_PROJECT_ID

// 環境変数チェック
if (!FCM_SERVER_KEY || !FCM_PROJECT_ID) {
  console.warn('[PushService] Firebase credentials not configured. Push notifications will not be sent.')
}

// ============================================================
// Types
// ============================================================

interface FCMMessage {
  token?: string
  topic?: string
  notification?: {
    title: string
    body: string
    icon?: string
    badge?: number
    sound?: string
    click_action?: string
  }
  data?: Record<string, any>
  android?: {
    priority?: 'normal' | 'high'
    notification?: {
      channel_id?: string
      sound?: string
      click_action?: string
    }
  }
  apns?: {
    payload?: {
      aps: {
        alert?: {
          title: string
          body: string
        }
        badge?: number
        sound?: string
        category?: string
        'mutable-content'?: number
        'content-available'?: number
      }
    }
  }
  webpush?: {
    headers?: Record<string, string>
    notification?: {
      title: string
      body: string
      icon: string
      badge: string
      data?: Record<string, any>
    }
  }
}

interface FCMResponse {
  success: boolean
    messageId?: string
    error?: string
}

interface SendPushResult {
  success: boolean
  messageIds?: string[]
  failedTokens?: string[]
  status: NotificationStatus
  errorCode?: string
  errorMessage?: string
}

// ============================================================
// Core Push Functions
// ============================================================

/**
 * FCM HTTP v1 APIで送信
 */
async function sendViaFCMHTTPv1(messages: FCMMessage[]): Promise<FCMResponse[]> {
  // TODO: Implement FCM HTTP v1 API
  // この実装では、Firebase Admin SDKを使用する必要があります
  // サーバーレス環境では、HTTP v1 APIを直接使用

  const responses: FCMResponse[] = []

  for (const message of messages) {
    try {
      if (!FCM_SERVER_KEY) {
        responses.push({
          success: false,
          error: 'FCM_NOT_CONFIGURED',
        })
        continue
      }

      // FCM Legacy APIを使用（簡易実装）
      const response = await sendViaFCMLegacy(message)
      responses.push(response)
    } catch (error: any) {
      responses.push({
        success: false,
        error: error.message || 'UNKNOWN_ERROR',
      })
    }
  }

  return responses
}

/**
 * FCM Legacy APIで送信
 */
async function sendViaFCMLegacy(message: FCMMessage): Promise<FCMResponse> {
  try {
    if (!FCM_SERVER_KEY) {
      return { success: false, error: 'FCM_NOT_CONFIGURED' }
    }

    const url = `https://fcm.googleapis.com/fcm/send`

    const payload = {
      to: message.token,
      notification: message.notification,
      data: message.data,
      android: message.android,
      apns: message.apns,
      webpush: message.webpush,
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${FCM_SERVER_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (result.success === 1) {
      return {
        success: true,
        messageId: result.results?.[0]?.message_id || 'unknown',
      }
    } else {
      return {
        success: false,
        error: result.results?.[0]?.error || 'SEND_FAILED',
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'NETWORK_ERROR',
    }
  }
}

/**
 * 単一デバイスにプッシュ通知を送信
 */
export async function sendPushNotification(
  deviceToken: string,
  title: string,
  body: string,
  data?: Record<string, any>,
  options?: {
    icon?: string
    badge?: number
    sound?: string
    clickAction?: string
    priority?: 'normal' | 'high'
  }
): Promise<SendPushResult> {
  const message: FCMMessage = {
    token: deviceToken,
    notification: {
      title,
      body,
      icon: options?.icon || '/icon-192x192.png',
      badge: options?.badge,
      sound: options?.sound || 'default',
      click_action: options?.clickAction,
    },
    data: data || {},
    android: {
      priority: options?.priority || 'normal',
    },
  }

  const response = await sendViaFCMLegacy(message)

  return {
    success: response.success,
    messageIds: response.success && response.messageId ? [response.messageId] : undefined,
    failedTokens: response.success ? undefined : [deviceToken],
    status: response.success ? 'sent' : 'failed',
    errorCode: response.error,
    errorMessage: response.error,
  }
}

/**
 * 複数デバイスにプッシュ通知を送信
 */
export async function sendBulkPushNotifications(
  deviceTokens: string[],
  title: string,
  body: string,
  data?: Record<string, any>,
  options?: {
    icon?: string
    badge?: number
    sound?: string
    clickAction?: string
  }
): Promise<SendPushResult> {
  if (deviceTokens.length === 0) {
    return {
      success: false,
      status: 'failed',
      errorMessage: 'No device tokens provided',
    }
  }

  const results = await Promise.all(
    deviceTokens.map(token =>
      sendPushNotification(token, title, body, data, options)
    )
  )

  const successCount = results.filter(r => r.success).length
  const messageIds = results.flatMap(r => r.messageIds || [])
  const failedTokens = results.flatMap(r => r.failedTokens || [])

  return {
    success: successCount > 0,
    messageIds,
    failedTokens,
    status: successCount === deviceTokens.length ? 'sent' : successCount > 0 ? 'delivered' : 'failed',
  }
}

/**
 * 通知オブジェクトからプッシュ通知を送信
 */
export async function sendPushNotificationFromObject(
  notification: PushNotification
): Promise<ChannelDeliveryResult> {
  const result = await sendBulkPushNotifications(
    notification.device_tokens,
    notification.push.title,
    notification.push.body,
    notification.push.data,
    {
      icon: notification.push.icon,
      badge: notification.push.badge,
      sound: notification.push.sound,
      clickAction: notification.push.click_action,
    }
  )

  return {
    channel: 'push',
    status: result.status,
    message_id: result.messageIds?.[0],
    sent_at: result.success ? new Date().toISOString() : undefined,
    error_code: result.errorCode,
    error_message: result.errorMessage,
  }
}

// ============================================================
// Device Token Management
// ============================================================

/**
 * デバイストークンを登録
 */
export async function registerDeviceToken(
  userId: string,
  token: string,
  platform: 'ios' | 'android' | 'web',
  appVersion?: string,
  osVersion?: string
): Promise<boolean> {
  try {
    // 既存のトークンをチェック
    const { data: existing } = await supabase
      .from('device_tokens')
      .select('id')
      .eq('token', token)
      .single()

    if (existing) {
      // 既存トークンを更新
      const { error } = await supabase
        .from('device_tokens')
        .update({
          user_id: userId,
          platform,
          app_version: appVersion,
          os_version: osVersion,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('token', token)

      return !error
    }

    // 新規トークンを登録
    const { error } = await supabase
      .from('device_tokens')
      .insert({
        id: `dt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        user_id: userId,
        token,
        platform,
        app_version: appVersion,
        os_version: osVersion,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    return !error
  } catch (error) {
    console.error('[PushService] Failed to register device token:', error)
    return false
  }
}

/**
 * デバイストークンを削除
 */
export async function unregisterDeviceToken(token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('device_tokens')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('token', token)

    return !error
  } catch (error) {
    console.error('[PushService] Failed to unregister device token:', error)
    return false
  }
}

/**
 * ユーザーのアクティブなデバイストークンを取得
 */
export async function getUserDeviceTokens(userId: string): Promise<DeviceToken[]> {
  try {
    const { data, error } = await supabase
      .from('device_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) throw error
    return (data as DeviceToken[]) || []
  } catch (error) {
    console.error('[PushService] Failed to get user device tokens:', error)
    return []
  }
}

/**
 * 無効なトークンを削除
 */
export async function removeInvalidTokens(tokens: string[]): Promise<number> {
  try {
    let removed = 0

    for (const token of tokens) {
      const { error } = await supabase
        .from('device_tokens')
        .update({ is_active: false })
        .eq('token', token)

      if (!error) removed++
    }

    return removed
  } catch (error) {
    console.error('[PushService] Failed to remove invalid tokens:', error)
    return 0
  }
}

// ============================================================
// Topic-Based Messaging
// ============================================================

/**
 * トピックに購読
 */
export async function subscribeToTopic(
  tokens: string[],
  topic: string
): Promise<boolean> {
  // TODO: Implement FCM Topic Management API
  console.log(`[PushService] Subscribing ${tokens.length} tokens to topic: ${topic}`)
  return true
}

/**
 * トピックから購読解除
 */
export async function unsubscribeFromTopic(
  tokens: string[],
  topic: string
): Promise<boolean> {
  // TODO: Implement FCM Topic Management API
  console.log(`[PushService] Unsubscribing ${tokens.length} tokens from topic: ${topic}`)
  return true
}

/**
 * トピックに送信
 */
export async function sendToTopic(
  topic: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<SendPushResult> {
  const message: FCMMessage = {
    topic,
    notification: { title, body },
    data,
  }

  const response = await sendViaFCMLegacy(message)

  return {
    success: response.success,
    status: response.success ? 'sent' : 'failed',
    errorCode: response.error,
    errorMessage: response.error,
  }
}

// ============================================================
// Template-Based Push Notifications
// ============================================================

/**
 * プッシュ通知テンプレート（日本語）
 */
export const pushTemplates = {
  quotation_created: (data: { quotationNumber: string }) => ({
    title: '見積依頼を受け付けました',
    body: `見積番号: ${data.quotationNumber}`,
    data: { type: 'quotation', quotationNumber: data.quotationNumber },
    clickAction: '/member/quotations',
  }),

  quotation_approved: (data: { quotationNumber: string }) => ({
    title: '見積が承認されました',
    body: `見積番号: ${data.quotationNumber}`,
    data: { type: 'quotation', quotationNumber: data.quotationNumber },
    clickAction: '/member/quotations',
  }),

  order_confirmed: (data: { orderNumber: string }) => ({
    title: '注文を受け付けました',
    body: `注文番号: ${data.orderNumber}`,
    data: { type: 'order', orderNumber: data.orderNumber },
    clickAction: '/member/orders',
  }),

  contract_sent: (data: { orderNumber: string }) => ({
    title: '契約書が届いています',
    body: `署名期限までにご確認ください`,
    data: { type: 'contract', orderNumber: data.orderNumber },
    clickAction: '/member/orders',
  }),

  production_update: (data: { orderNumber: string; status: string }) => ({
    title: '生産状況が更新されました',
    body: `${data.orderNumber}: ${data.status}`,
    data: { type: 'production', orderNumber: data.orderNumber },
    clickAction: '/member/orders',
  }),

  shipped: (data: { orderNumber: string }) => ({
    title: '商品を発送いたしました',
    body: `注文番号: ${data.orderNumber}`,
    data: { type: 'shipping', orderNumber: data.orderNumber },
    clickAction: '/member/orders',
  }),

  delivery_scheduled: (data: { orderNumber: string; deliveryDate: string }) => ({
    title: 'お届け日が決まりました',
    body: `${data.deliveryDate}にお届け予定です`,
    data: { type: 'shipping', orderNumber: data.orderNumber },
    clickAction: '/member/orders',
  }),
}

/**
 * テンプレートを使用してプッシュ通知を送信
 */
export async function sendTemplatedPush(
  userId: string,
  templateKey: keyof typeof pushTemplates,
  data: Record<string, any>
): Promise<SendPushResult> {
  const template = pushTemplates[templateKey]
  if (!template) {
    return {
      success: false,
      status: 'failed',
      errorCode: 'TEMPLATE_NOT_FOUND',
      errorMessage: `Template not found: ${templateKey}`,
    }
  }

  const tokens = await getUserDeviceTokens(userId)
  if (tokens.length === 0) {
    return {
      success: false,
      status: 'failed',
      errorMessage: 'No active device tokens',
    }
  }

  const templateData = template(data as unknown as never)
  return sendBulkPushNotifications(
    tokens.map(t => t.token),
    templateData.title,
    templateData.body,
    { ...templateData.data, ...data },
    {
      clickAction: templateData.clickAction,
    }
  )
}

// ============================================================
// Platform-Specific Notifications
// ============================================================

/**
 * iOS通知ペイロードを作成
 */
export function createIOSPayload(
  title: string,
  body: string,
  data?: Record<string, any>
): FCMMessage {
  return {
    notification: { title, body },
    data,
    apns: {
      payload: {
        aps: {
          alert: { title, body },
          badge: 1,
          sound: 'default',
          'mutable-content': 1,
        },
      },
    },
  }
}

/**
 * Android通知ペイロードを作成
 */
export function createAndroidPayload(
  title: string,
  body: string,
  data?: Record<string, any>
): FCMMessage {
  return {
    notification: { title, body },
    data,
    android: {
      priority: 'high',
      notification: {
        channel_id: 'default',
        sound: 'default',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
    },
  }
}

/**
 * Web通知ペイロードを作成
 */
export function createWebPayload(
  title: string,
  body: string,
  data?: Record<string, any>
): FCMMessage {
  return {
    notification: { title, body },
    data,
    webpush: {
      headers: {
        'TTL': '86400', // 24 hours
      },
      notification: {
        title,
        body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data,
      },
    },
  }
}

// ============================================================
// Testing & Development
// ============================================================

/**
 * テストプッシュ通知を送信
 */
export async function sendTestPush(userId: string): Promise<SendPushResult> {
  const tokens = await getUserDeviceTokens(userId)

  if (tokens.length === 0) {
    return {
      success: false,
      status: 'failed',
      errorMessage: 'No device tokens found',
    }
  }

  const now = new Date()
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`

  return sendBulkPushNotifications(
    tokens.map(t => t.token),
    'お知らせ',
    `テスト通知\n${dateStr}\nこれはテスト通知です。\nこの通知は、あなたの製品に最適なパッケージソリューション`,
    { type: 'test' }
  )
}

/**
 * プッシュ通知設定のテスト
 */
export async function testPushSettings(): Promise<{
  configured: boolean
  serverKeyExists: boolean
  projectIdExists: boolean
  projectId?: string
}> {
  return {
    configured: !!(FCM_SERVER_KEY && FCM_PROJECT_ID),
    serverKeyExists: !!FCM_SERVER_KEY,
    projectIdExists: !!FCM_PROJECT_ID,
    projectId: FCM_PROJECT_ID,
  }
}
