/**
 * SMS Notification Service
 *
 * SMS通知サービス
 * Twilioを使用したSMS送信機能
 *
 * @module lib/notifications/sms
 */

import { createClient } from '@supabase/supabase-js'
import type {
  SMSNotification,
  SMSOptions,
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

// Twilio設定
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

// 環境変数チェック
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.warn('[SMSService] Twilio credentials not configured. SMS will not be sent.')
}

// ============================================================
// Types
// ============================================================

interface TwilioMessage {
  sid: string
  status: string
  errorCode?: string | number  // Twilio returns number for errorCode
  errorMessage?: string
  dateCreated?: Date
  dateSent?: Date
}

interface SendSMSResult {
  success: boolean
  messageSid?: string
  status: NotificationStatus
  errorCode?: string
  errorMessage?: string
  cost?: number
}

// ============================================================
// Twilio Client
// ============================================================

/**
 * Twilioクライアントを取得（動的インポート）
 */
async function getTwilioClient() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return null
  }
  // 動的インポートで未使用時のエラーを回避
  const twilioModule = await import('twilio')
  // Type assertion for Twilio module default export
  type TwilioClient = ReturnType<typeof twilioModule.default>
  return (twilioModule.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) as unknown) as TwilioClient | null
}

// ============================================================
// Core SMS Functions
// ============================================================

/**
 * SMSを送信
 */
export async function sendSMS(
  phoneNumber: string,
  message: string,
  options?: SMSOptions
): Promise<SendSMSResult> {
  // 環境チェック
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn('[SMSService] Twilio not configured, skipping SMS send')
    return {
      success: false,
      status: 'failed',
      errorCode: 'CONFIG_ERROR',
      errorMessage: 'Twilio credentials not configured',
    }
  }

  try {
    const client = await getTwilioClient()
    if (!client) {
      return {
        success: false,
        status: 'failed',
        errorCode: 'CLIENT_ERROR',
        errorMessage: 'Failed to initialize Twilio client',
      }
    }

    // 日本の電話番号フォーマットに変換
    const formattedNumber = formatPhoneNumberForTwilio(phoneNumber)

    // 送信者IDまたはデフォルト番号
    const from = options?.sender_id || TWILIO_PHONE_NUMBER

    // メッセージ送信
    const twilioMessage: TwilioMessage = await client.messages.create({
      body: message,
      from: from,
      to: formattedNumber,
      statusCallback: options?.delivery_receipt ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/status` : undefined,
    })

    // ステータスマッピング
    const status = mapTwilioStatus(twilioMessage.status)

    return {
      success: status === 'sent' || status === 'delivered',
      messageSid: twilioMessage.sid,
      status,
      cost: 0, // Twilioのcost情報は別途取得が必要
    }
  } catch (error: any) {
    console.error('[SMSService] SMS send error:', error)

    return {
      success: false,
      status: 'failed',
      errorCode: error.code || 'SEND_ERROR',
      errorMessage: error.message || 'Unknown error',
    }
  }
}

/**
 * 通知オブジェクトからSMSを送信
 */
export async function sendSMSNotification(
  notification: SMSNotification
): Promise<ChannelDeliveryResult> {
  const result = await sendSMS(
    notification.phone_number,
    notification.content.text,
    {
      sender_id: notification.data?.sender_id,
      delivery_receipt: true,
    }
  )

  return {
    channel: 'sms',
    status: result.status,
    message_id: result.messageSid,
    sent_at: result.success ? new Date().toISOString() : undefined,
    error_code: result.errorCode,
    error_message: result.errorMessage,
    cost: result.cost,
  }
}

/**
 * 複数のSMSを一括送信
 */
export async function sendBulkSMS(
  recipients: Array<{ phone_number: string; message?: string }>,
  baseMessage: string,
  options?: SMSOptions
): Promise<ChannelDeliveryResult[]> {
  const results: ChannelDeliveryResult[] = []

  for (const recipient of recipients) {
    const message = recipient.message || baseMessage
    const result = await sendSMS(recipient.phone_number, message, options)

    results.push({
      channel: 'sms',
      status: result.status,
      message_id: result.messageSid,
      sent_at: result.success ? new Date().toISOString() : undefined,
      error_code: result.errorCode,
      error_message: result.errorMessage,
      cost: result.cost,
    })
  }

  return results
}

// ============================================================
// Template-Based SMS
// ============================================================

/**
 * SMSテンプレート（日本語）
 */
export const smsTemplates = {
  quotation_created: (data: { quotationNumber: string; customerName: string }) =>
    `【EPackage Lab】見積依頼を受け付けました。\n見積番号: ${data.quotationNumber}\n担当者より近日中にご連絡いたします。`,

  quotation_approved: (data: { quotationNumber: string; amount: number }) =>
    `【EPackage Lab】見積が承認されました。\n見積番号: ${data.quotationNumber}\n金額: ¥${data.amount.toLocaleString('ja-JP')}\nマイページでご確認ください。`,

  order_confirmed: (data: { orderNumber: string }) =>
    `【EPackage Lab】注文を受け付けました。\n注文番号: ${data.orderNumber}\n詳細はマイページでご確認ください。`,

  contract_sent: (data: { orderNumber: string; dueDate: string }) =>
    `【EPackage Lab】契約書を送信しました。\n注文番号: ${data.orderNumber}\n署名期限: ${data.dueDate}\nマイページから署名をお願いします。`,

  production_update: (data: { orderNumber: string; status: string }) =>
    `【EPackage Lab】生産状況が更新されました。\n注文番号: ${data.orderNumber}\n現在の状況: ${data.status}`,

  shipped: (data: { orderNumber: string; trackingNumber?: string }) => {
    const base = `【EPackage Lab】商品を発送いたしました。\n注文番号: ${data.orderNumber}`
    if (data.trackingNumber) {
      return `${base}\nお問い合わせ番号: ${data.trackingNumber}`
    }
    return base
  },

  delivery_scheduled: (data: { orderNumber: string; deliveryDate: string }) =>
    `【EPackage Lab】商品のお届け日が決まりました。\n注文番号: ${data.orderNumber}\nお届け予定日: ${data.deliveryDate}`,

  payment_reminder: (data: { orderNumber: string; amount: number; dueDate: string }) =>
    `【EPackage Lab】お支払い期限のお知らせです。\n注文番号: ${data.orderNumber}\n金額: ¥${data.amount.toLocaleString('ja-JP')}\n期限: ${data.dueDate}`,

  password_reset: (data: { resetCode: string }) =>
    `【EPackage Lab】パスワードリセットコード: ${data.resetCode}\nこのコードを入力してパスワードを再設定してください。`,
}

/**
 * テンプレートを使用してSMSを送信
 */
export async function sendTemplatedSMS(
  phoneNumber: string,
  templateKey: keyof typeof smsTemplates,
  data: Record<string, any>,
  options?: SMSOptions
): Promise<SendSMSResult> {
  const template = smsTemplates[templateKey]
  if (!template) {
    return {
      success: false,
      status: 'failed',
      errorCode: 'TEMPLATE_NOT_FOUND',
      errorMessage: `Template not found: ${templateKey}`,
    }
  }

  // Type assertion: template expects specific data type, but we pass generic Record<string, any>
  // The caller is responsible for passing the correct data structure
  const message = (template as (data: Record<string, unknown>) => string)(data as Record<string, unknown>)
  return sendSMS(phoneNumber, message, options)
}

// ============================================================
// Status Webhook Handling
// ============================================================

/**
 * Twilioステータスコールバックの処理
 */
export async function handleTwilioStatusWebhook(
  messageSid: string,
  messageStatus: string,
  errorCode?: string,
  errorMessage?: string
): Promise<void> {
  // TODO: データベースにステータスを更新
  console.log(`[SMSService] Message ${messageSid} status: ${messageStatus}`)

  if (messageStatus === 'failed' || messageStatus === 'undelivered') {
    console.error(`[SMSService] Message ${messageSid} failed: ${errorMessage}`)
  }
}

/**
 * Next.js API Route用のWebhookハンドラー
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const messageSid = formData.get('MessageSid') as string
    const messageStatus = formData.get('MessageStatus') as string
    const errorCode = formData.get('ErrorCode') as string | undefined
    const errorMessage = formData.get('ErrorMessage') as string | undefined

    await handleTwilioStatusWebhook(messageSid, messageStatus, errorCode, errorMessage)

    return Response.json({ success: true })
  } catch (error) {
    console.error('[SMSService] Webhook error:', error)
    return Response.json({ success: false }, { status: 500 })
  }
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * TwilioステータスをNotificationStatusにマッピング
 */
function mapTwilioStatus(twilioStatus: string): NotificationStatus {
  const statusMap: Record<string, NotificationStatus> = {
    'queued': 'pending',
    'sending': 'sending',
    'sent': 'sent',
    'delivered': 'delivered',
    'undelivered': 'bounced',
    'failed': 'failed',
    'received': 'delivered',
    'read': 'opened',
  }

  return statusMap[twilioStatus] || 'pending'
}

/**
 * 電話番号をTwilioフォーマットに変換
 */
function formatPhoneNumberForTwilio(phoneNumber: string): string {
  // ハイフンとスペースを除去
  let cleaned = phoneNumber.replace(/[-\s]/g, '')

  // 日本の番号で0から始まる場合、国番号+81に変換
  if (cleaned.startsWith('0')) {
    cleaned = '+81' + cleaned.substring(1)
  }
  // まだ+がない場合は追加
  else if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned
  }

  return cleaned
}

/**
 * メッセージ長のバリデーション
 */
export function validateSMSLength(message: string, encoding: 'UTF8' | 'GSM' = 'UTF8'): {
  valid: boolean
  segments: number
  characters: number
  limit: number
} {
  // UTF-8: 70文字/セグメント、GSM: 160文字/セグメント
  const segmentSize = encoding === 'UTF8' ? 70 : 160
  const characters = message.length
  const segments = Math.ceil(characters / segmentSize)

  return {
    valid: characters <= segmentSize * 10, // 最大10セグメント
    segments,
    characters,
    limit: segmentSize * 10,
  }
}

/**
 * メッセージを短縮（長すぎる場合）
 */
export function truncateSMS(message: string, maxLength: number = 320): string {
  if (message.length <= maxLength) return message

  // ...を追加して短縮
  return message.substring(0, maxLength - 3) + '...'
}

/**
 * SMS送信コストの見積もり
 */
export function estimateSMSCost(message: string, countryCode: string = 'JP'): number {
  const validation = validateSMSLength(message)
  const segments = validation.segments

  // Twilioの日本向けSMS価格（例: ¥15/セグメント）
  // 実際の価格はTwilioの設定を確認
  const costPerSegment = 0.08 // USD（例）

  return costPerSegment * segments
}

/**
 * 電話番号のバリデーション
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // 国際フォーマットのチェック
  const phoneRegex = /^\+\d{10,15}$/
  return phoneRegex.test(phoneNumber.replace(/[-\s]/g, ''))
}

/**
 * 送信可能かどうかのチェック
 */
export async function canSendSMS(userId: string): Promise<boolean> {
  try {
    // Type for database query result
    type PreferencesQueryResult = {
      channels: {
        sms?: {
          enabled: boolean;
          phone_number?: string;
        };
      };
    };

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('channels')
      .eq('user_id', userId)
      .single();

    if (error || !data) return false

    // Type assertion for JSON column access
    const prefData = data as unknown as PreferencesQueryResult;
    const smsConfig = prefData.channels?.sms
    return smsConfig?.enabled === true && !!smsConfig?.phone_number
  } catch (error) {
    console.error('[SMSService] Failed to check SMS permission:', error)
    return false
  }
}

// ============================================================
// Testing & Development
// ============================================================

/**
 * テストSMSを送信（開発用）
 */
export async function sendTestSMS(phoneNumber: string): Promise<SendSMSResult> {
  const testMessage = `【EPackage Lab】これはテストメッセージです。\n時刻: ${new Date().toLocaleString('ja-JP')}`

  return sendSMS(phoneNumber, testMessage)
}

/**
 * SMS設定のテスト
 */
export async function testSMSSettings(): Promise<{
  configured: boolean
  accountSidExists: boolean
  authTokenExists: boolean
  phoneNumberExists: boolean
  phoneNumber?: string
}> {
  return {
    configured: !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER),
    accountSidExists: !!TWILIO_ACCOUNT_SID,
    authTokenExists: !!TWILIO_AUTH_TOKEN,
    phoneNumberExists: !!TWILIO_PHONE_NUMBER,
    phoneNumber: TWILIO_PHONE_NUMBER,
  }
}
