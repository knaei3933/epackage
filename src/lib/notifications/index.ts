/**
 * Unified Notification Manager
 *
 * 統合通知マネージャー
 * すべての通知チャンネルを統合管理
 *
 * @module lib/notifications
 */

import type {
  NotificationChannel,
  NotificationCategory,
  NotificationPriority,
  NotificationDeliveryResult,
  BaseNotification,
} from '@/types/notification'
import { sendEmail, handleNotificationEvent } from '../email/notificationService'
import { sendSMS, sendTemplatedSMS } from './sms'
import { sendPushNotificationFromObject, sendTemplatedPush, getUserDeviceTokens, sendBulkPushNotifications } from './push'
import { getEnabledChannelsForCategory, isInQuietHours } from './preferences'
import {
  recordNotificationSent,
  recordDelivery,
  recordFailure,
  recordOpen,
  recordClick,
} from './history'
import { calculateOptimalSendTime, checkRateLimit } from './optimization'

// ============================================================
// Core Notification Function
// ============================================================

/**
 * 通知を送信（マルチチャネル対応）
 */
export async function sendNotification(request: {
  userId: string
  type: string
  category: NotificationCategory
  priority: NotificationPriority
  subject: string
  content: {
    text: string
    html?: string
  }
  channels?: NotificationChannel[]
  data?: Record<string, any>
  options?: {
    sms?: { phone_number?: string }
    push?: { title?: string; body?: string }
    scheduleFor?: Date
    skipQuietHours?: boolean
  }
}): Promise<NotificationDeliveryResult> {
  const {
    userId,
    type,
    category,
    priority,
    subject,
    content,
    channels: requestedChannels,
    data,
    options,
  } = request

  // 有効なチャンネルを取得
  const enabledChannels = await getEnabledChannelsForCategory(userId, category)
  const channels = requestedChannels
    ? requestedChannels.filter(c => enabledChannels.includes(c))
    : enabledChannels

  if (channels.length === 0) {
    return {
      notification_id: '',
      channels: [],
      overall_status: 'failed',
      sent_at: new Date().toISOString(),
    }
  }

  // 通知停止時間帯のチェック
  if (!options?.skipQuietHours && await isInQuietHours(userId)) {
    // スケジュール延期（簡易実装）
    console.log('[NotificationManager] In quiet hours, would schedule for later')
  }

  // レート制限チェック
  for (const channel of channels) {
    const rateLimit = await checkRateLimit(userId, channel)
    if (!rateLimit.allowed) {
      console.log(`[NotificationManager] Rate limit exceeded for ${channel}`)
    }
  }

  // 通知IDを生成
  const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`
  const results = []
  const sentAt = new Date().toISOString()

  // チャンネルごとに送信
  for (const channel of channels) {
    try {
      let result

      switch (channel) {
        case 'email':
          result = await sendEmailNotification(userId, subject, content, data)
          break

        case 'sms':
          result = await sendSMSNotification(userId, content.text, options?.sms?.phone_number)
          break

        case 'push':
          result = await sendPushNotification(userId, options?.push?.title || subject, options?.push?.body || content.text, data)
          break

        default:
          result = { channel, status: 'failed' as const, error_message: 'Unknown channel' }
      }

      results.push(result)

      // 履歴を記録
      const historyId = await recordNotificationSent(
        notificationId,
        userId,
        type,
        category,
        channel,
        subject,
        content.text,
        data
      )

      if (result.status === 'sent' || result.status === 'delivered') {
        await recordDelivery(historyId!)
      } else if (result.status === 'failed') {
        await recordFailure(historyId!, result.error_message || 'Send failed')
      }
    } catch (error: any) {
      results.push({
        channel,
        status: 'failed' as const,
        error_message: error.message || 'Unknown error',
      })
    }
  }

  // 全体ステータスを決定
  const overallStatus = determineOverallStatus(results.map(r => r.status))

  return {
    notification_id: notificationId,
    channels: results,
    overall_status: overallStatus,
    sent_at: sentAt,
  }
}

/**
 * テンプレートベースの通知を送信
 */
export async function sendTemplatedNotification(request: {
  userId: string
  templateKey: keyof typeof notificationTemplates
  data: Record<string, any>
  channels?: NotificationChannel[]
  priority?: NotificationPriority
}): Promise<NotificationDeliveryResult> {
  const { userId, templateKey, data, channels, priority } = request
  const template = notificationTemplates[templateKey]

  if (!template) {
    return {
      notification_id: '',
      channels: [],
      overall_status: 'failed',
      sent_at: new Date().toISOString(),
    }
  }

  return sendNotification({
    userId,
    type: templateKey,
    category: template.category,
    priority: priority || 'normal',
    subject: template.getSubject(data),
    content: {
      text: template.getText(data),
      html: 'getHTML' in template ? template.getHTML?.(data) : undefined,
    },
    channels,
    data,
    options: 'getOptions' in template && template.getOptions
      ? template.getOptions(data)
      : undefined,
  })
}

// ============================================================
// Channel-Specific Helpers
// ============================================================

/**
 * Email通知を送信
 */
async function sendEmailNotification(
  userId: string,
  subject: string,
  content: { text: string; html?: string },
  data?: Record<string, any>
) {
  // ユーザーのメールアドレスを取得
  const { getUserEmail } = await import('@/lib/supabase')
  const email = await getUserEmail(userId)

  if (!email) {
    return { channel: 'email' as const, status: 'failed' as const, error_message: 'Email not found' }
  }

  const result = await sendEmail({
    to: { email, type: 'customer' },
    templateId: 'quote_approved_customer', // 仮テンプレート
    data: { ...data, subject, ...content },
  })

  return {
    channel: 'email' as const,
    status: result.success ? ('sent' as const) : ('failed' as const),
    message_id: result.messageId,
    error_code: result.errorCode,
    error_message: result.error,
  }
}

/**
 * SMS通知を送信
 */
async function sendSMSNotification(
  userId: string,
  message: string,
  phoneNumber?: string
) {
  const { getSMSPhoneNumber } = await import('./preferences')

  const phone = phoneNumber || await getSMSPhoneNumber(userId)

  if (!phone) {
    return { channel: 'sms' as const, status: 'failed' as const, error_message: 'Phone number not found' }
  }

  const result = await sendSMS(phone, message)

  return {
    channel: 'sms' as const,
    status: result.status,
    message_id: result.messageSid,
    error_code: result.errorCode,
    error_message: result.errorMessage,
    cost: result.cost,
  }
}

/**
 * プッシュ通知を送信
 */
async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  const tokens = await getUserDeviceTokens(userId)

  if (tokens.length === 0) {
    return { channel: 'push' as const, status: 'failed' as const, error_message: 'No device tokens' }
  }

  const result = await sendBulkPushNotifications(
    tokens.map(t => t.token),
    title,
    body,
    data
  )

  return {
    channel: 'push' as const,
    status: result.status,
    message_id: result.messageIds?.[0],
    error_message: result.errorMessage,
  }
}

// ============================================================
// Template Definitions
// ============================================================

/**
 * 通知テンプレート定義
 */
const notificationTemplates = {
  quotation_created_admin: {
    category: 'quotation' as const,
    getSubject: (data: any) => `[EPackage Lab] 新しい見積依頼: ${data.quotationNumber}`,
    getText: (data: any) => `新しい見積依頼が届きました。\n\n見積番号: ${data.quotationNumber}\n顧客名: ${data.customerName}\n金額: ¥${data.totalAmount?.toLocaleString('ja-JP')}`,
  },

  quotation_approved: {
    category: 'quotation' as const,
    getSubject: (data: any) => `[EPackage Lab] 見積が承認されました: ${data.quotationNumber}`,
    getText: (data: any) => `見積が承認されました。\n\n見積番号: ${data.quotationNumber}\n金額: ¥${data.totalAmount?.toLocaleString('ja-JP')}`,
    getHTML: (data: any) => `<h1>見積が承認されました</h1><p>見積番号: ${data.quotationNumber}</p>`,
  },

  order_confirmed: {
    category: 'order' as const,
    getSubject: (data: any) => `[EPackage Lab] 注文を受け付けました: ${data.orderNumber}`,
    getText: (data: any) => `注文を受け付けました。\n\n注文番号: ${data.orderNumber}`,
  },

  contract_sent: {
    category: 'contract' as const,
    getSubject: (data: any) => `[EPackage Lab] 契約書をご確認ください: ${data.orderNumber}`,
    getText: (data: any) => `契約書を送信しました。\n\n注文番号: ${data.orderNumber}\n署名期限: ${data.dueDate}`,
  },

  contract_signed: {
    category: 'contract' as const,
    getSubject: (data: any) => `[EPackage Lab] 契約が署名されました: ${data.orderNumber}`,
    getText: (data: any) => `契約が署名されました。\n\n注文番号: ${data.orderNumber}`,
  },

  production_update: {
    category: 'production' as const,
    getSubject: (data: any) => `[EPackage Lab] 生産状況更新: ${data.orderNumber}`,
    getText: (data: any) => `生産状況が更新されました。\n\n注文番号: ${data.orderNumber}\n現在の状況: ${data.statusLabel}`,
  },

  shipped: {
    category: 'shipping' as const,
    getSubject: (data: any) => `[EPackage Lab] 製品を発送いたしました: ${data.orderNumber}`,
    getText: (data: any) => `商品を発送いたしました。\n\n注文番号: ${data.orderNumber}\n${data.trackingNumber ? `お問い合わせ番号: ${data.trackingNumber}` : ''}`,
  },

  delivery_scheduled: {
    category: 'shipping' as const,
    getSubject: (data: any) => `[EPackage Lab] お届け日が決まりました: ${data.orderNumber}`,
    getText: (data: any) => `お届け日が決まりました。\n\n注文番号: ${data.orderNumber}\nお届け予定日: ${data.deliveryDate}`,
  },

  payment_reminder: {
    category: 'payment' as const,
    getSubject: (data: any) => `[EPackage Lab] お支払い期限のお知らせ: ${data.orderNumber}`,
    getText: (data: any) => `お支払い期限のお知らせです。\n\n注文番号: ${data.orderNumber}\n金額: ¥${data.amount?.toLocaleString('ja-JP')}\n期限: ${data.dueDate}`,
    getOptions: (data: any) => ({
      sms: { phone_number: data.phoneNumber },
    }),
  },
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * 全体ステータスを決定
 */
function determineOverallStatus(statuses: string[]): NotificationDeliveryResult['overall_status'] {
  if (statuses.every(s => s === 'delivered')) return 'delivered'
  if (statuses.some(s => s === 'delivered' || s === 'sent')) return 'sent'
  if (statuses.some(s => s === 'sent')) return 'sent'
  return 'failed'
}

/**
 * ユーザーの通知統計を取得
 */
export async function getUserNotificationStats(userId: string) {
  const { getNotificationStatistics } = await import('./history')
  return getNotificationStatistics(userId)
}

/**
 * ユーザーの通知設定を取得
 */
export async function getUserNotificationPreferences(userId: string) {
  const { getUserPreferences } = await import('./preferences')
  return getUserPreferences(userId)
}

/**
 * ユーザーの通知設定を更新
 */
export async function updateUserNotificationPreferences(
  userId: string,
  preferences: any
) {
  const { updateUserPreferences } = await import('./preferences')
  return updateUserPreferences(userId, preferences)
}

// ============================================================
// Tracking Handlers
// ============================================================

/**
 * 通知開封を記録
 */
export async function trackNotificationOpen(historyId: string): Promise<boolean> {
  return recordOpen(historyId)
}

/**
 * 通知クリックを記録
 */
export async function trackNotificationClick(historyId: string): Promise<boolean> {
  return recordClick(historyId)
}

// ============================================================
// Exports
// ============================================================

export * from './preferences'
export * from './push'
export * from './history'
export * from './batch'
export * from './optimization'

// SMS exports (excluding conflicting validatePhoneNumber)
export {
  sendSMS,
  sendSMSNotification,
  sendBulkSMS,
  sendTemplatedSMS,
  handleTwilioStatusWebhook,
  validateSMSLength,
  truncateSMS,
  estimateSMSCost,
  validatePhoneNumber as validateSMSPhoneNumber,
  canSendSMS,
  sendTestSMS,
  testSMSSettings,
} from './sms'
