/**
 * Admin Notifications Library
 *
 * 관리자 알림 시스템
 * Supabase MCP를 통한 DB 작업
 *
 * @module lib/admin-notifications
 */

import { executeSql } from './supabase-mcp'

// ============================================================
// Type Definitions
// ============================================================

export type AdminNotificationType =
  | 'order'          // 새 주문
  | 'quotation'      // 견적 요청
  | 'sample'         // 샘플 요청
  | 'registration'   // 회원가입 요청 (B2B)
  | 'production'     // 생산 완료
  | 'shipment'       // 출하 완료
  | 'contract'       // 계약 서명 요청
  | 'system'         // 시스템 에러

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
 * 관리자 알림 생성
 */
export async function createAdminNotification(
  params: CreateAdminNotificationParams
): Promise<AdminNotification | null> {
  try {
    const result = await executeSql<AdminNotification>(
      `
      INSERT INTO admin_notifications (
        type,
        title,
        message,
        related_id,
        related_type,
        priority,
        user_id,
        action_url,
        action_label,
        metadata,
        expires_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      RETURNING *
      `,
      [
        params.type,
        params.title,
        params.message,
        params.relatedId || null,
        params.relatedType || null,
        params.priority || 'normal',
        params.userId || null,
        params.actionUrl || null,
        params.actionLabel || null,
        JSON.stringify(params.metadata || {}),
        params.expiresAt ? params.expiresAt.toISOString() : null
      ]
    )

    if (result.error) {
      console.error('[createAdminNotification] Error:', result.error)
      return null
    }

    return result.data?.[0] || null
  } catch (error) {
    console.error('[createAdminNotification] Exception:', error)
    return null
  }
}

/**
 * 관리자 알림 목록 조회
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
 * 안읽은 알림 수 조회
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
 * 알림 읽음 표시
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
 * 모든 알림 읽음 표시
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
 * 알림 삭제 (soft delete by marking as read)
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
 * 오래된 알림 정리 (30일 이상 된 읽은 알림 삭제)
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
 * 새 주문 알림 생성
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
 * 견적 요청 알림 생성
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
 * 샘플 요청 알림 생성
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
 * 회원가입 요청 알림 생성
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
 * 생산 완료 알림 생성
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
 * 출하 완료 알림 생성
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
 * 계약 서명 요청 알림 생성
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
 * 시스템 에러 알림 생성
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
    // 24시간 후 만료
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  })
}
