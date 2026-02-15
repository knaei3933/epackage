/**
 * Admin Notifications Library
 *
 * 管理者通知システム
 * Direct Supabase client for DB operations
 *
 * @module lib/admin-notifications
 */

import { createServiceClient } from '@/lib/supabase'

// ============================================================
// Type Definitions
// ============================================================

export type AdminNotificationType =
  | 'order'               // 新規注文
  | 'quotation'           // 見積依頼
  | 'sample'              // サンプル依頼
  | 'registration'        // 会員登録依頼 (B2B)
  | 'production'          // 生産完了
  | 'shipment'            // 出荷完了
  | 'contract'            // 契約署名依頼
  | 'system'              // システムエラー
  | 'data_receipt'        // データ受領
  | 'ai_extraction'       // AI抽出完了
  | 'korea_transfer'      // 韓国チーム送信
  | 'modification'        // 修正承認関連

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface CreateAdminNotificationParams {
  type: AdminNotificationType
  title: string
  message: string
  relatedId?: string
  relatedType?: string
  priority?: NotificationPriority
  userId?: string
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, any>
  expiresAt?: Date
}

export interface AdminNotification {
  id: string
  type: AdminNotificationType
  title: string
  message: string
  related_id?: string
  related_type?: string
  priority: NotificationPriority
  user_id?: string
  is_read: boolean
  read_at?: string
  action_url?: string
  action_label?: string
  metadata: Record<string, any>
  created_at: string
  expires_at?: string
}

export interface GetNotificationsOptions {
  unreadOnly?: boolean
  type?: AdminNotificationType
  priority?: NotificationPriority
  limit?: number
  offset?: number
  userId?: string
}

// ============================================================
// Core Functions
// ============================================================

/**
 * 管理者通知作成
 */
export async function createAdminNotification(
  params: CreateAdminNotificationParams
): Promise<AdminNotification | null> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        type: params.type,
        title: params.title,
        message: params.message,
        related_id: params.relatedId || null,
        related_type: params.relatedType || null,
        priority: params.priority || 'normal',
        user_id: params.userId || null,
        action_url: params.actionUrl || null,
        action_label: params.actionLabel || null,
        metadata: params.metadata || {},
        expires_at: params.expiresAt ? params.expiresAt.toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('[createAdminNotification] Error:', error);
      return null;
    }

    return data as AdminNotification;
  } catch (error) {
    console.error('[createAdminNotification] Exception:', error);
    return null;
  }
}

/**
 * 管理者通知一覧取得
 */
export async function getAdminNotifications(
  options: GetNotificationsOptions = {}
): Promise<{ notifications: AdminNotification[]; total: number }> {
  try {
    let query = `
      SELECT * FROM admin_notifications
      WHERE 1=1
    `

    const params: (string | number | boolean)[] = []
    let paramIndex = 1

    // Filter by unread status
    if (options.unreadOnly) {
      query += ` AND is_read = false`
    }

    // Filter by type
    if (options.type) {
      query += ` AND type = $${paramIndex++}`
      params.push(options.type)
    }

    // Filter by priority
    if (options.priority) {
      query += ` AND priority = $${paramIndex++}`
      params.push(options.priority)
    }

    // Filter by user ID (if specific user notification)
    if (options.userId) {
      query += ` AND (user_id = $${paramIndex++} OR user_id IS NULL)`
      params.push(options.userId)
    } else {
      // Only show general notifications (user_id IS NULL)
      query += ` AND user_id IS NULL`
    }

    // Filter out expired notifications
    query += ` AND (expires_at IS NULL OR expires_at > NOW())`

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count')
    const countResult = await executeSql<{ count: string }>(countQuery, params)
    const total = parseInt(countResult.data?.[0]?.count || '0', 10)

    // Add ordering and pagination
    query += ` ORDER BY created_at DESC`

    if (options.limit) {
      query += ` LIMIT $${paramIndex++}`
      params.push(options.limit)
    }

    if (options.offset) {
      query += ` OFFSET $${paramIndex++}`
      params.push(options.offset)
    }

    const result = await executeSql<AdminNotification>(query, params)

    if (result.error) {
      console.error('[getAdminNotifications] Error:', result.error)
      return { notifications: [], total: 0 }
    }

    return {
      notifications: result.data || [],
      total
    }
  } catch (error) {
    console.error('[getAdminNotifications] Exception:', error)
    return { notifications: [], total: 0 }
  }
}

/**
 * 未読通知数取得
 */
export async function getUnreadAdminNotificationCount(
  userId?: string
): Promise<number> {
  try {
    let query = `
      SELECT COUNT(*) as count
      FROM admin_notifications
      WHERE is_read = false
      AND (expires_at IS NULL OR expires_at > NOW())
    `

    const params: (string | number)[] = []
    let paramIndex = 1

    if (userId) {
      query += ` AND (user_id = $${paramIndex++} OR user_id IS NULL)`
      params.push(userId)
    } else {
      query += ` AND user_id IS NULL`
    }

    const result = await executeSql<{ count: string }>(query, params)

    if (result.error) {
      console.error('[getUnreadAdminNotificationCount] Error:', result.error)
      return 0
    }

    return parseInt(result.data?.[0]?.count || '0', 10)
  } catch (error) {
    console.error('[getUnreadAdminNotificationCount] Exception:', error)
    return 0
  }
}

/**
 * 通知を既読にする
 */
export async function markAdminNotificationAsRead(
  notificationId: string
): Promise<AdminNotification | null> {
  try {
    const result = await executeSql<AdminNotification>(
      `
      UPDATE admin_notifications
      SET is_read = true,
          read_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [notificationId]
    )

    if (result.error) {
      console.error('[markAdminNotificationAsRead] Error:', result.error)
      return null
    }

    return result.data?.[0] || null
  } catch (error) {
    console.error('[markAdminNotificationAsRead] Exception:', error)
    return null
  }
}

/**
 * すべての通知を既読にする
 */
export async function markAllAdminNotificationsAsRead(
  userId?: string
): Promise<number> {
  try {
    let query = `
      UPDATE admin_notifications
      SET is_read = true,
          read_at = NOW()
      WHERE is_read = false
    `

    const params: string[] = []
    let paramIndex = 1

    if (userId) {
      query += ` AND (user_id = $${paramIndex++} OR user_id IS NULL)`
      params.push(userId)
    } else {
      query += ` AND user_id IS NULL`
    }

    // Don't update expired notifications
    query += ` AND (expires_at IS NULL OR expires_at > NOW())`

    const result = await executeSql<{ count: string }>(
      query + ` RETURNING COUNT(*) as count`,
      params
    )

    if (result.error) {
      console.error('[markAllAdminNotificationsAsRead] Error:', result.error)
      return 0
    }

    return parseInt(result.data?.[0]?.count || '0', 10)
  } catch (error) {
    console.error('[markAllAdminNotificationsAsRead] Exception:', error)
    return 0
  }
}

/**
 * 通知削除 (既読マークによるソフト削除)
 */
export async function deleteAdminNotification(
  notificationId: string
): Promise<boolean> {
  try {
    const result = await executeSql(
      `
      DELETE FROM admin_notifications
      WHERE id = $1
      `,
      [notificationId]
    )

    if (result.error) {
      console.error('[deleteAdminNotification] Error:', result.error)
      return false
    }

    return true
  } catch (error) {
    console.error('[deleteAdminNotification] Exception:', error)
    return false
  }
}

/**
 * 古い通知の整理 (30日以上前の既読通知を削除)
 */
export async function cleanupOldAdminNotifications(): Promise<number> {
  try {
    const result = await executeSql<{ count: string }>(
      `
      DELETE FROM admin_notifications
      WHERE is_read = true
      AND read_at < NOW() - INTERVAL '30 days'
      RETURNING COUNT(*) as count
      `
    )

    if (result.error) {
      console.error('[cleanupOldAdminNotifications] Error:', result.error)
      return 0
    }

    return parseInt(result.data?.[0]?.count || '0', 10)
  } catch (error) {
    console.error('[cleanupOldAdminNotifications] Exception:', error)
    return 0
  }
}

// ============================================================
// Notification Type Helpers
// ============================================================

/**
 * 新規注文通知作成
 */
export async function notifyNewOrder(
  orderId: string,
  orderNumber: string,
  customerName: string,
  totalAmount: number
): Promise<AdminNotification | null> {
  return createAdminNotification({
    type: 'order',
    title: '新しい注文',
    message: `${customerName} 様から新しい注文がありました (¥${totalAmount.toLocaleString('ja-JP')})`,
    relatedId: orderId,
    relatedType: 'orders',
    priority: 'normal',
    actionUrl: `/admin/orders/${orderId}`,
    actionLabel: '注文を表示',
    metadata: {
      order_number: orderNumber,
      customer_name: customerName,
      total_amount: totalAmount
    }
  })
}

/**
 * 見積依頼通知作成
 */
export async function notifyQuotationRequest(
  quotationId: string,
  quotationNumber: string,
  customerName: string
): Promise<AdminNotification | null> {
  return createAdminNotification({
    type: 'quotation',
    title: '見積依頼',
    message: `${customerName} 様から見積依頼がありました`,
    relatedId: quotationId,
    relatedType: 'quotations',
    priority: 'normal',
    actionUrl: `/admin/quotations/${quotationId}`,
    actionLabel: '見積を表示',
    metadata: {
      quotation_number: quotationNumber,
      customer_name: customerName
    }
  })
}

/**
 * サンプル依頼通知作成
 */
export async function notifySampleRequest(
  sampleRequestId: string,
  customerName: string,
  sampleCount: number
): Promise<AdminNotification | null> {
  return createAdminNotification({
    type: 'sample',
    title: 'サンプル依頼',
    message: `${customerName} 様から${sampleCount}件のサンプル依頼がありました`,
    relatedId: sampleRequestId,
    relatedType: 'sample_requests',
    priority: 'normal',
    actionUrl: `/admin/samples/${sampleRequestId}`,
    actionLabel: 'サンプルを表示',
    metadata: {
      customer_name: customerName,
      sample_count: sampleCount
    }
  })
}

/**
 * 会員登録依頼通知作成
 */
export async function notifyRegistrationRequest(
  userId: string,
  userName: string,
  email: string
): Promise<AdminNotification | null> {
  return createAdminNotification({
    type: 'registration',
    title: '新規会員登録',
    message: `${userName} 様 (${email}) から会員登録申請がありました`,
    relatedId: userId,
    relatedType: 'profiles',
    priority: 'high',
    actionUrl: `/admin/users/${userId}`,
    actionLabel: '承認画面へ',
    metadata: {
      user_name: userName,
      email
    }
  })
}

/**
 * 生産完了通知作成
 */
export async function notifyProductionComplete(
  orderId: string,
  orderNumber: string
): Promise<AdminNotification | null> {
  return createAdminNotification({
    type: 'production',
    title: '生産完了',
    message: `注文 ${orderNumber} の生産が完了しました`,
    relatedId: orderId,
    relatedType: 'orders',
    priority: 'high',
    actionUrl: `/admin/production/${orderId}`,
    actionLabel: '出荷手配へ',
    metadata: {
      order_number: orderNumber
    }
  })
}

/**
 * 出荷完了通知作成
 */
export async function notifyShipmentComplete(
  shipmentId: string,
  orderNumber: string
): Promise<AdminNotification | null> {
  return createAdminNotification({
    type: 'shipment',
    title: '出荷完了',
    message: `注文 ${orderNumber} を出荷しました`,
    relatedId: shipmentId,
    relatedType: 'shipments',
    priority: 'normal',
    actionUrl: `/admin/shipments/${shipmentId}`,
    actionLabel: '出荷詳細を表示',
    metadata: {
      order_number: orderNumber
    }
  })
}

/**
 * 契約署名依頼通知作成
 */
export async function notifyContractSignature(
  contractId: string,
  orderNumber: string
): Promise<AdminNotification | null> {
  return createAdminNotification({
    type: 'contract',
    title: '契約署名完了',
    message: `注文 ${orderNumber} の契約書が署名されました`,
    relatedId: contractId,
    relatedType: 'contracts',
    priority: 'high',
    actionUrl: `/admin/contracts/${contractId}`,
    actionLabel: '契約書を表示',
    metadata: {
      order_number: orderNumber
    }
  })
}

/**
 * システムエラー通知作成
 */
export async function notifySystemError(
  errorType: string,
  errorMessage: string,
  metadata?: Record<string, any>
): Promise<AdminNotification | null> {
  return createAdminNotification({
    type: 'system',
    title: `システムエラー: ${errorType}`,
    message: errorMessage,
    priority: 'urgent',
    metadata: {
      error_type: errorType,
      error_message: errorMessage,
      ...metadata
    },
    // 24時間後に期限切れ
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  })
}

/**
 * データ受領通知作成
 * ファイルアップロード時に管理者に通知
 */
export async function notifyDataReceipt(
  orderId: string,
  orderNumber: string,
  customerName: string,
  fileName: string,
  fileType: string
): Promise<AdminNotification | null> {
  return createAdminNotification({
    type: 'data_receipt',
    title: 'データ受領',
    message: `${customerName} 様から${fileType}ファイル「${fileName}」がアップロードされました`,
    relatedId: orderId,
    relatedType: 'orders',
    priority: 'normal',
    actionUrl: `/admin/orders/${orderId}`,
    actionLabel: 'ファイルを確認',
    metadata: {
      order_number: orderNumber,
      customer_name: customerName,
      file_name: fileName,
      file_type: fileType
    }
  })
}

/**
 * AI抽出完了通知作成
 * AI抽出完了時に管理者に通知
 */
export async function notifyAIExtractionComplete(
  orderId: string,
  orderNumber: string,
  fileId: string,
  fileName: string,
  confidenceScore: number
): Promise<AdminNotification | null> {
  const priority = confidenceScore > 0.8 ? 'low' : confidenceScore > 0.5 ? 'normal' : 'high';

  return createAdminNotification({
    type: 'ai_extraction',
    title: 'AI抽出完了',
    message: `注文 ${orderNumber} のAI抽出が完了しました (信頼度: ${Math.round(confidenceScore * 100)}%)`,
    relatedId: orderId,
    relatedType: 'orders',
    priority,
    actionUrl: `/admin/orders/${orderId}`,
    actionLabel: '抽出結果を確認',
    metadata: {
      order_number: orderNumber,
      file_id: fileId,
      file_name: fileName,
      confidence_score: confidenceScore
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })
}

/**
 * 韓国チームデータ送信通知作成
 * 韓国チーム送信完了時に管理者に通知
 */
export async function notifyKoreaDataTransfer(
  orderId: string,
  orderNumber: string,
  quotationNumber: string,
  koreaEmail: string
): Promise<AdminNotification | null> {
  return createAdminNotification({
    type: 'korea_transfer',
    title: '韓国チームデータ送信',
    message: `注文 ${orderNumber} (${quotationNumber}) のデータを韓国チームに送信しました`,
    relatedId: orderId,
    relatedType: 'orders',
    priority: 'normal',
    metadata: {
      order_number: orderNumber,
      quotation_number: quotationNumber,
      korea_email: koreaEmail
    }
  })
}

/**
 * 顧客が修正を承認した通知作成
 */
export async function notifyModificationApproved(
  orderId: string,
  orderNumber: string,
  customerName: string
): Promise<AdminNotification | null> {
  return createAdminNotification({
    type: 'modification',
    title: '修正承認',
    message: `${customerName} 様が注文 ${orderNumber} の修正内容を承認しました`,
    relatedId: orderId,
    relatedType: 'orders',
    priority: 'high',
    actionUrl: `/admin/orders/${orderId}`,
    actionLabel: '注文を表示',
    metadata: {
      order_number: orderNumber,
      customer_name: customerName,
      action: 'approved'
    }
  })
}

/**
 * 顧客が修正を拒否した通知作成
 */
export async function notifyModificationRejected(
  orderId: string,
  orderNumber: string,
  customerName: string,
  reason?: string
): Promise<AdminNotification | null> {
  const message = reason
    ? `${customerName} 様が注文 ${orderNumber} の修正内容を拒否しました。理由: ${reason}`
    : `${customerName} 様が注文 ${orderNumber} の修正内容を拒否しました`;

  return createAdminNotification({
    type: 'modification',
    title: '修正拒否',
    message,
    relatedId: orderId,
    relatedType: 'orders',
    priority: 'high',
    actionUrl: `/admin/orders/${orderId}`,
    actionLabel: '注文を表示',
    metadata: {
      order_number: orderNumber,
      customer_name: customerName,
      action: 'rejected',
      reason
    }
  })
}
