/**
 * Batch Notification Service
 *
 * バッチ通知処理サービス
 * 大量通知のバッチ処理・再試行ロジック
 *
 * @module lib/notifications/batch
 */

// ---------------------------------------------------------------------------
// C2 drift 対応（TECH DEBT）
// ---------------------------------------------------------------------------
// 本モジュールが参照していた以下の実DB不存在テーブルを neutralize した:
//   - batch_notification_jobs   （バッチジョブ進捗管理）
//   - batch_notifications       （バッチ個別通知レコード）
// いずれも実DB（database.ts SoT）に不存在。バッチ処理機能は未配線の予備機能であり、
// アプリ/APIルート/コンポーネントのいずれからも呼び出されていない。
//
// ガイドの「完全にデッド機能 → 機能を安全に無害化」方針に従い、ジョブ/通知レコードの
// 永続化関数はシグネチャを維持したまま安全なデフォルト値を返すよう neutralize した。
// `processBatchNotifications` / `sendBatchNotifications` の送信ループ本体は
// DB に依存しないためそのまま動作する（進捗記録だけ no-op になる）。
//
// 将来この機能を有効化する場合は専用テーブルの新設をリードに依頼すること。
// ---------------------------------------------------------------------------

import type {
  BatchNotificationJob,
  BatchNotification,
  BatchSendOptions,
  NotificationChannel,
} from '@/types/notification'
import { sendEmail } from '../email/notificationService'
import { sendSMS } from './sms'

// ============================================================
// Configuration
// ============================================================

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
 *
 * drift: `batch_notification_jobs` が実DB不存在のため永続化できず null を返す。
 */
export async function createBatchJob(
  _name: string,
  _recipients: string[],
  _createdBy: string
): Promise<string | null> {
  return null
}

/**
 * バッチジョブを開始
 *
 * drift: `batch_notification_jobs` が実DB不存在のため false を返す。
 */
export async function startBatchJob(_jobId: string): Promise<boolean> {
  return false
}

/**
 * バッチジョブを完了
 *
 * drift: `batch_notification_jobs` が実DB不存在のため false を返す。
 */
export async function completeBatchJob(
  _jobId: string,
  _status: 'completed' | 'failed'
): Promise<boolean> {
  return false
}

/**
 * バッチジョブの進捗を更新
 *
 * drift: `batch_notification_jobs` が実DB不存在のため false を返す。
 * （送信ループから呼ばれるが、進捗記録が no-op になるだけで送信には影響しない）
 */
export async function updateBatchJobProgress(
  _jobId: string,
  _processed: number,
  _successful: number,
  _failed: number
): Promise<boolean> {
  return false
}

// ============================================================
// Batch Processing
// ============================================================

/**
 * バッチ送信を実行
 *
 * 送信ループ本体は DB に依存せずそのまま動作する。
 * drift: バッチ通知レコード（`batch_notifications`）の作成は実DB不存在のため省略。
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
          // drift: バッチ通知レコード（batch_notifications）作成は実DB不存在のため省略
          return { recipient, result }
        } catch (error: unknown) {
          const errMsg = (error as { message?: string }).message;
          return {
            recipient,
            result: {
              success: false,
              error: errMsg || 'Unknown error',
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
      } catch (error: unknown) {
        const errMsg = (error as { message?: string }).message;
        results.push({ channel, success: false, error: errMsg })
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
 *
 * drift: `batch_notifications` が実DB不存在のため失敗レコードを取得できず 0 を返す。
 */
export async function retryFailedNotifications(
  _jobId: string,
  _maxRetries: number = DEFAULT_OPTIONS.max_retries
): Promise<number> {
  return 0
}

// ============================================================
// Job Status & Monitoring
// ============================================================

/**
 * バッチジョブのステータスを取得
 *
 * drift: `batch_notification_jobs` が実DB不存在のため null を返す。
 */
export async function getBatchJobStatus(_jobId: string): Promise<BatchNotificationJob | null> {
  return null
}

/**
 * 進行中のバッチジョブ一覧を取得
 *
 * drift: `batch_notification_jobs` が実DB不存在のため空配列を返す。
 */
export async function getActiveBatchJobs(): Promise<BatchNotificationJob[]> {
  return []
}

/**
 * バッチジョブの詳細を取得
 *
 * drift: `batch_notification_jobs` / `batch_notifications` が実DB不存在のため空結果を返す。
 */
export async function getBatchJobDetails(_jobId: string): Promise<{
  job: BatchNotificationJob | null
  notifications: BatchNotification[]
}> {
  return { job: null, notifications: [] }
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
 *
 * drift: `batch_notification_jobs` が実DB不存在のため false を返す。
 */
export async function cancelBatchJob(_jobId: string): Promise<boolean> {
  return false
}

/**
 * 古いバッチジョブを削除
 *
 * drift: `batch_notification_jobs` が実DB不存在のため削除対象なく 0 を返す。
 */
export async function cleanupOldJobs(_daysToKeep: number = 30): Promise<number> {
  return 0
}
