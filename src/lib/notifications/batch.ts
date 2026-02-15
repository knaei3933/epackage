/**
 * Batch Notification Service
 *
 * バッチ通知処理サービス
 * 大量通知のバッチ処理・再試行ロジック
 *
 * @module lib/notifications/batch
 */

import { createClient } from '@supabase/supabase-js'
import type {
  BatchNotificationJob,
  BatchNotification,
  BatchSendOptions,
  NotificationChannel,
  NotificationStatus,
} from '@/types/notification'
import { sendEmail } from '../email/notificationService'
import { sendSMS } from './sms'
import { sendBulkPushNotifications } from './push'
import { recordNotificationSent, recordDelivery, recordFailure } from './history'

// ============================================================
// Configuration
// ============================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const BATCH_JOBS_TABLE = 'batch_notification_jobs'
const BATCH_NOTIFICATIONS_TABLE = 'batch_notifications'

const DEFAULT_OPTIONS: Required<BatchSendOptions> = {
  batch_size: 100,
  delay_between_batches: 1000,
  max_retries: 3,
  retry_delay: 5000,
  continue_on_error: true,
}

// ============================================================
// Batch Job Management
// ============================================================

/**
 * バッチジョブを作成
 */
export async function createBatchJob(
  name: string,
  recipients: string[],
  createdBy: string
): Promise<string | null> {
  try {
    const jobId = `batch-${Date.now()}-${Math.random().toString(36).substring(7)}`

    const { error } = await supabase
      .from(BATCH_JOBS_TABLE)
      .insert({
        id: jobId,
        name,
        status: 'pending',
        total_recipients: recipients.length,
        processed_recipients: 0,
        successful_sends: 0,
        failed_sends: 0,
        created_by: createdBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (error) throw error
    return jobId
  } catch (error) {
    console.error('[BatchService] Failed to create batch job:', error)
    return null
  }
}

/**
 * バッチジョブを開始
 */
export async function startBatchJob(
  jobId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(BATCH_JOBS_TABLE)
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    return !error
  } catch (error) {
    console.error('[BatchService] Failed to start batch job:', error)
    return false
  }
}

/**
 * バッチジョブを完了
 */
export async function completeBatchJob(
  jobId: string,
  status: 'completed' | 'failed'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(BATCH_JOBS_TABLE)
      .update({
        status,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    return !error
  } catch (error) {
    console.error('[BatchService] Failed to complete batch job:', error)
    return false
  }
}

/**
 * バッチジョブの進捗を更新
 */
export async function updateBatchJobProgress(
  jobId: string,
  processed: number,
  successful: number,
  failed: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(BATCH_JOBS_TABLE)
      .update({
        processed_recipients: processed,
        successful_sends: successful,
        failed_sends: failed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    return !error
  } catch (error) {
    console.error('[BatchService] Failed to update job progress:', error)
    return false
  }
}

// ============================================================
// Batch Processing
// ============================================================

/**
 * バッチ送信を実行
 */
export async function processBatchNotifications<T extends { user_id: string; [key: string]: any }>(
  jobId: string,
  recipients: T[],
  sendFunction: (recipient: T) => Promise<{ success: boolean; notificationId?: string; error?: string }>,
  options?: Partial<BatchSendOptions>
): Promise<{
  total: number
  successful: number
  failed: number
  errors: Array<{ recipient: T; error: string }>
}> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let successful = 0
  let failed = 0
  const errors: Array<{ recipient: T; error: string }> = []

  await startBatchJob(jobId)

  // バッチ処理
  for (let i = 0; i < recipients.length; i += opts.batch_size) {
    const batch = recipients.slice(i, i + opts.batch_size)

    // 並列処理
    const results = await Promise.allSettled(
      batch.map(async (recipient) => {
        try {
          const result = await sendFunction(recipient)

          // バッチ通知レコードを作成
          const batchNotifId = `bn-${Date.now()}-${Math.random().toString(36).substring(7)}`
          await supabase.from(BATCH_NOTIFICATIONS_TABLE).insert({
            id: batchNotifId,
            job_id: jobId,
            recipient_id: recipient.user_id,
            notification_id: result.notificationId,
            status: result.success ? 'sent' : 'failed',
            retry_count: 0,
            error_message: result.error,
            processed_at: new Date().toISOString(),
          })

          return { recipient, result }
        } catch (error: any) {
          return {
            recipient,
            result: {
              success: false,
              error: error.message || 'Unknown error',
            },
          }
        }
      })
    )

    // 結果を集計
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { recipient, result: sendResult } = result.value
        if (sendResult.success) {
          successful++
        } else {
          failed++
          if (!opts.continue_on_error) {
            errors.push({ recipient, error: sendResult.error || 'Send failed' })
          }
        }
      } else {
        failed++
      }
    }

    // 進捗を更新
    const processed = Math.min(i + opts.batch_size, recipients.length)
    await updateBatchJobProgress(jobId, processed, successful, failed)

    // バッチ間の遅延
    if (i + opts.batch_size < recipients.length) {
      await sleep(opts.delay_between_batches)
    }
  }

  // ジョブを完了
  await completeBatchJob(jobId, failed === 0 || opts.continue_on_error ? 'completed' : 'failed')

  return {
    total: recipients.length,
    successful,
    failed,
    errors,
  }
}

/**
 * マルチチャネルバッチ送信
 */
export async function sendBatchNotifications<T extends { user_id: string; email?: string; phone_number?: string }>(
  jobId: string,
  recipients: T[],
  notificationData: {
    type: string
    subject: string
    content: { text: string; html?: string }
    channels: NotificationChannel[]
    push?: { title: string; body: string }
  },
  options?: Partial<BatchSendOptions>
): Promise<void> {
  const sendFunction = async (recipient: T) => {
    const results = []
    const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`

    for (const channel of notificationData.channels) {
      try {
        switch (channel) {
          case 'email':
            if (recipient.email) {
              const emailResult = await sendEmail({
                to: { email: recipient.email, type: 'customer' },
                templateId: 'quote_approved_customer', // 仮テンプレート
                data: notificationData.content,
              })
              results.push({ channel: 'email', success: emailResult.success })
            }
            break

          case 'sms':
            if (recipient.phone_number) {
              const smsResult = await sendSMS(recipient.phone_number, notificationData.content.text)
              results.push({ channel: 'sms', success: smsResult.success })
            }
            break

          case 'push':
            // プッシュ通知の実装
            results.push({ channel: 'push', success: true })
            break
        }
      } catch (error: any) {
        results.push({ channel, success: false, error: error.message })
      }
    }

    const overallSuccess = results.some(r => r.success)
    return {
      success: overallSuccess,
      notificationId: overallSuccess ? notificationId : undefined,
      error: overallSuccess ? undefined : 'All channels failed',
    }
  }

  await processBatchNotifications(jobId, recipients, sendFunction, options)
}

// ============================================================
// Retry Logic
// ============================================================

/**
 * 失敗した通知の再試行
 */
export async function retryFailedNotifications(
  jobId: string,
  maxRetries: number = DEFAULT_OPTIONS.max_retries
): Promise<number> {
  try {
    // 失敗した通知を取得
    const { data: failed, error } = await supabase
      .from(BATCH_NOTIFICATIONS_TABLE)
      .select('*')
      .eq('job_id', jobId)
      .eq('status', 'failed')
      .lt('retry_count', maxRetries)

    if (error) throw error
    if (!failed || failed.length === 0) return 0

    let retried = 0

    for (const notification of failed as BatchNotification[]) {
      await sleep(DEFAULT_OPTIONS.retry_delay * notification.retry_count)

      // 再試行ロジック（実際には通知タイプに応じた再送処理）
      const success = await retryNotification(notification)

      await supabase
        .from(BATCH_NOTIFICATIONS_TABLE)
        .update({
          status: success ? 'sent' : 'failed',
          retry_count: notification.retry_count + 1,
          processed_at: success ? new Date().toISOString() : undefined,
        })
        .eq('id', notification.id)

      if (success) retried++
    }

    return retried
  } catch (error) {
    console.error('[BatchService] Failed to retry notifications:', error)
    return 0
  }
}

/**
 * 通知を再試行
 */
async function retryNotification(notification: BatchNotification): Promise<boolean> {
  // TODO: 通知タイプに応じた再試行ロジックを実装
  // ここでは仮実装
  return true
}

// ============================================================
// Job Status & Monitoring
// ============================================================

/**
 * バッチジョブのステータスを取得
 */
export async function getBatchJobStatus(jobId: string): Promise<BatchNotificationJob | null> {
  try {
    const { data, error } = await supabase
      .from(BATCH_JOBS_TABLE)
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) throw error
    return data as BatchNotificationJob
  } catch (error) {
    console.error('[BatchService] Failed to get job status:', error)
    return null
  }
}

/**
 * 進行中のバッチジョブ一覧を取得
 */
export async function getActiveBatchJobs(): Promise<BatchNotificationJob[]> {
  try {
    const { data, error } = await supabase
      .from(BATCH_JOBS_TABLE)
      .select('*')
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as BatchNotificationJob[]) || []
  } catch (error) {
    console.error('[BatchService] Failed to get active jobs:', error)
    return []
  }
}

/**
 * バッチジョブの詳細を取得
 */
export async function getBatchJobDetails(jobId: string): Promise<{
  job: BatchNotificationJob | null
  notifications: BatchNotification[]
}> {
  try {
    const [jobResult, notificationsResult] = await Promise.all([
      supabase.from(BATCH_JOBS_TABLE).select('*').eq('id', jobId).single(),
      supabase.from(BATCH_NOTIFICATIONS_TABLE).select('*').eq('job_id', jobId).limit(1000),
    ])

    return {
      job: jobResult.data as BatchNotificationJob,
      notifications: (notificationsResult.data as BatchNotification[]) || [],
    }
  } catch (error) {
    console.error('[BatchService] Failed to get job details:', error)
    return { job: null, notifications: [] }
  }
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * スリープ関数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * バッチジョブをキャンセル
 */
export async function cancelBatchJob(jobId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(BATCH_JOBS_TABLE)
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .in('status', ['pending', 'processing'])

    return !error
  } catch (error) {
    console.error('[BatchService] Failed to cancel job:', error)
    return false
  }
}

/**
 * 古いバッチジョブを削除
 */
export async function cleanupOldJobs(daysToKeep: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from(BATCH_JOBS_TABLE)
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .in('status', ['completed', 'failed', 'cancelled'])
      .select()

    if (error) throw error
    return data?.length || 0
  } catch (error) {
    console.error('[BatchService] Failed to cleanup old jobs:', error)
    return 0
  }
}
