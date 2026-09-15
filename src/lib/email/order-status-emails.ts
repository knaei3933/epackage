/**
 * Order Status Email Service
 *
 * オーダーステータスに応じたメール送信サービス
 * B2B注文ワークフローの各ステップで適切なメールを送信
 *
 * @module lib/email/order-status-emails
 */

import { epackMailer, type EpackEmailData } from './epack-mailer'
import { createServiceClient } from '@/lib/supabase'
import type { OrderStatus } from '@/types/order-status'

// ============================================================
// Type Definitions
// ============================================================

export interface OrderStatusEmailConfig {
  orderId: string
  orderNumber: string
  customerEmail: string
  customerName: string
  productName?: string
  companyName?: string
  viewUrl?: string
}

export interface QuotationStatusEmailConfig {
  quotationId: string
  quotationNumber: string
  customerEmail: string
  customerName: string
  companyName?: string
  totalAmount: number
  validUntil: string
  viewUrl: string
}

// ============================================================
// Order Workflow Email Functions
// ============================================================

/**
 * 見積作成完了メール送信
 *
 * ワークフロー: 見積作成 → 顧客通知
 */
export async function notifyQuoteReady(config: QuotationStatusEmailConfig): Promise<boolean> {
  const data: EpackEmailData = {
    quotation_id: config.quotationId,
    quotation_number: config.quotationNumber,
    customer_email: config.customerEmail,
    customer_name: config.customerName,
    company_name: config.companyName,
    total_amount: config.totalAmount,
    valid_until: config.validUntil,
    view_url: config.viewUrl,
  }

  const result = await epackMailer.quoteReady(data)
  return result.success
}

/**
 * 見積承認完了メール送信
 *
 * ワークフロー: 見積承認 → 顧客通知
 */
export async function notifyQuoteApproved(config: QuotationStatusEmailConfig): Promise<boolean> {
  const data: EpackEmailData = {
    quotation_id: config.quotationId,
    quotation_number: config.quotationNumber,
    customer_email: config.customerEmail,
    customer_name: config.customerName,
    total_amount: config.totalAmount,
    valid_until: config.validUntil,
    view_url: config.viewUrl,
  }

  const result = await epackMailer.quoteApproved(data)
  return result.success
}

/**
 * データ入稿依頼メール送信
 *
 * ワークフロー: 注文確認 → データ入稿依頼
 */
export async function requestDataUpload(
  config: OrderStatusEmailConfig,
  deadline: string
): Promise<boolean> {
  const data: EpackEmailData = {
    order_id: config.orderId,
    order_number: config.orderNumber,
    customer_email: config.customerEmail,
    customer_name: config.customerName,
    product_name: config.productName,
    upload_deadline: deadline,
    view_url: config.viewUrl,
  }

  const result = await epackMailer.dataUploadRequest(data)
  return result.success
}

/**
 * データ受領確認メール送信
 *
 * ワークフロー: データ入稿 → 受領確認
 */
export async function notifyDataReceived(
  config: OrderStatusEmailConfig,
  fileName: string
): Promise<boolean> {
  const data: EpackEmailData = {
    order_id: config.orderId,
    order_number: config.orderNumber,
    customer_email: config.customerEmail,
    customer_name: config.customerName,
    file_name: fileName,
    view_url: config.viewUrl,
  }

  const result = await epackMailer.dataReceived(data)
  return result.success
}

/**
 * 部分SKU入稿警告メール送信
 *
 * ワークフロー: 一部SKUのみ入稿された場合に警告
 */
export async function notifyPartialSKUSubmission(
  config: OrderStatusEmailConfig,
  skuStatus: {
    totalSkus: number
    submittedSkus: number
    pendingSkus: Array<{ id: string; productName: string; quantity: number }>
  }
): Promise<boolean> {
  const data: EpackEmailData = {
    order_id: config.orderId,
    order_number: config.orderNumber,
    customer_email: config.customerEmail,
    customer_name: config.customerName,
    submitted_skus: skuStatus.submittedSkus,
    total_skus: skuStatus.totalSkus,
    pending_skus: skuStatus.pendingSkus,
    view_url: config.viewUrl,
  }

  const result = await epackMailer.partialSKUSubmission(data)
  return result.success
}

/**
 * 修正依頼メール送信
 *
 * ワークフロー: データ確認 → 修正必要
 */
export async function requestModification(
  config: OrderStatusEmailConfig,
  modificationDetails: string
): Promise<boolean> {
  const data: EpackEmailData = {
    order_id: config.orderId,
    order_number: config.orderNumber,
    customer_email: config.customerEmail,
    customer_name: config.customerName,
    modification_details: modificationDetails,
    view_url: config.viewUrl,
  }

  const result = await epackMailer.modificationRequest(data)
  return result.success
}

/**
 * 修正承認完了メール送信
 *
 * ワークフロー: 修正データ提出 → 承認
 */
export async function notifyModificationApproved(config: OrderStatusEmailConfig): Promise<boolean> {
  const data: EpackEmailData = {
    order_id: config.orderId,
    order_number: config.orderNumber,
    customer_email: config.customerEmail,
    customer_name: config.customerName,
    view_url: config.viewUrl,
  }

  const result = await epackMailer.modificationApproved(data)
  return result.success
}

/**
 * 修正却下確認メール送信
 *
 * ワークフロー: 修正却下 → 確認通知
 */
export async function notifyModificationRejected(
  config: OrderStatusEmailConfig,
  rejectionReason: string
): Promise<boolean> {
  const data: EpackEmailData = {
    order_id: config.orderId,
    order_number: config.orderNumber,
    customer_email: config.customerEmail,
    customer_name: config.customerName,
    rejection_reason: rejectionReason,
    view_url: config.viewUrl,
  }

  const result = await epackMailer.modificationRejected(data)
  return result.success
}

/**
 * 校正完了メール送信
 *
 * ワークフロー: 校正完了 → 顧客通知
 */
export async function notifyCorrectionReady(config: OrderStatusEmailConfig): Promise<boolean> {
  const data: EpackEmailData = {
    order_id: config.orderId,
    order_number: config.orderNumber,
    customer_email: config.customerEmail,
    customer_name: config.customerName,
    view_url: config.viewUrl,
  }

  const result = await epackMailer.correctionReady(data)
  return result.success
}

/**
 * 顧客承認依頼メール送信
 *
 * ワークフロー: 校正完了 → 承認依頼
 */
export async function requestApproval(
  config: OrderStatusEmailConfig,
  approvalDeadline: string
): Promise<boolean> {
  const data: EpackEmailData = {
    order_id: config.orderId,
    order_number: config.orderNumber,
    customer_email: config.customerEmail,
    customer_name: config.customerName,
    approval_deadline: approvalDeadline,
    view_url: config.viewUrl,
  }

  const result = await epackMailer.approvalRequest(data)
  return result.success
}

/**
 * 製造開始メール送信
 *
 * ワークフロー: 承認完了 → 製造開始
 */
export async function notifyProductionStarted(
  config: OrderStatusEmailConfig,
  estimatedCompletion: string
): Promise<boolean> {
  const data: EpackEmailData = {
    order_id: config.orderId,
    order_number: config.orderNumber,
    customer_email: config.customerEmail,
    customer_name: config.customerName,
    product_name: config.productName,
    estimated_completion: estimatedCompletion,
    view_url: config.viewUrl,
  }

  const result = await epackMailer.productionStarted(data)
  return result.success
}

/**
 * 出荷準備完了メール送信
 *
 * ワークフロー: 製造完了 → 出荷準備
 */
export async function notifyReadyToShip(
  config: OrderStatusEmailConfig,
  quantity: string
): Promise<boolean> {
  const data: EpackEmailData = {
    order_id: config.orderId,
    order_number: config.orderNumber,
    customer_email: config.customerEmail,
    customer_name: config.customerName,
    product_name: config.productName,
    quantity,
    view_url: config.viewUrl,
  }

  const result = await epackMailer.readyToShip(data)
  return result.success
}

/**
 * 出荷完了メール送信
 *
 * ワークフロー: 出荷準備 → 出荷完了
 */
export async function notifyShipped(
  config: OrderStatusEmailConfig,
  trackingInfo: {
    trackingNumber: string
    carrier: string
    estimatedDelivery: string
    trackingUrl?: string
  }
): Promise<boolean> {
  const data: EpackEmailData = {
    order_id: config.orderId,
    order_number: config.orderNumber,
    customer_email: config.customerEmail,
    customer_name: config.customerName,
    product_name: config.productName,
    tracking_number: trackingInfo.trackingNumber,
    carrier: trackingInfo.carrier,
    estimated_delivery: trackingInfo.estimatedDelivery,
    tracking_url: trackingInfo.trackingUrl,
    view_url: config.viewUrl,
  }

  const result = await epackMailer.shipped(data)
  return result.success
}

/**
 * 注文キャンセルメール送信
 *
 * ワークフロー: キャンセル処理 → 通知
 */
export async function notifyOrderCancelled(
  config: OrderStatusEmailConfig,
  cancellationReason: string,
  refundInfo?: {
    amount: number
    method: string
  }
): Promise<boolean> {
  const data: EpackEmailData = {
    order_id: config.orderId,
    order_number: config.orderNumber,
    customer_email: config.customerEmail,
    customer_name: config.customerName,
    cancellation_reason: cancellationReason,
    refund_amount: refundInfo?.amount,
    refund_method: refundInfo?.method,
    view_url: config.viewUrl,
  }

  const result = await epackMailer.orderCancelled(data)
  return result.success
}

/**
 * 韓国チーム校正依頼メール送信
 *
 * ワークフロー: 韓国チーム校正依頼
 */
export async function requestKoreaCorrection(
  config: OrderStatusEmailConfig,
  correctionDetails: string
): Promise<boolean> {
  const data: EpackEmailData = {
    order_id: config.orderId,
    order_number: config.orderNumber,
    customer_email: config.customerEmail,
    customer_name: config.customerName,
    correction_details: correctionDetails,
    view_url: config.viewUrl,
  }

  const result = await epackMailer.koreaCorrectionRequest(data)
  return result.success
}

// ============================================================
// Status-Based Email Dispatcher
// ============================================================

/**
 * オーダーステータスに基づくメール送信
 *
 * Supabaseのordersテーブルのstatusフィールドに応じて
 * 適切なメールを自動送信
 */
export async function sendEmailForOrderStatus(
  status: string,
  config: OrderStatusEmailConfig,
  metadata?: {
    deadline?: string
    fileName?: string
    modificationDetails?: string
    rejectionReason?: string
    estimatedCompletion?: string
    estimatedDelivery?: string
    quantity?: string
    trackingNumber?: string
    carrier?: string
    trackingUrl?: string
    cancellationReason?: string
    refundAmount?: number
    refundMethod?: string
    correctionDetails?: string
  }
): Promise<{ success: boolean; emailType?: string; error?: string }> {
  try {
    switch (status) {
      case 'data_upload_required':
        return {
          success: await requestDataUpload(config, metadata?.deadline || '7日以内'),
          emailType: 'data_upload_request',
        }

      case 'data_received':
        return {
          success: await notifyDataReceived(config, metadata?.fileName || 'ファイル'),
          emailType: 'data_received',
        }

      case 'modification_required':
        return {
          success: await requestModification(config, metadata?.modificationDetails || '修正が必要です'),
          emailType: 'modification_request',
        }

      case 'modification_approved':
        return {
          success: await notifyModificationApproved(config),
          emailType: 'modification_approved',
        }

      case 'modification_rejected':
        return {
          success: await notifyModificationRejected(config, metadata?.rejectionReason || 'お客様のご意向によるものです'),
          emailType: 'modification_rejected',
        }

      case 'correction_ready':
        return {
          success: await notifyCorrectionReady(config),
          emailType: 'correction_ready',
        }

      case 'approval_pending':
        return {
          success: await requestApproval(config, metadata?.deadline || '3日以内'),
          emailType: 'approval_request',
        }

      case 'in_production':
        return {
          success: await notifyProductionStarted(config, metadata?.estimatedCompletion || '製造完了まで2〜3週間'),
          emailType: 'production_started',
        }

      case 'ready_to_ship':
        return {
          success: await notifyReadyToShip(config, metadata?.quantity || 'ご注文数量'),
          emailType: 'ready_to_ship',
        }

      case 'shipped':
        if (!metadata?.trackingNumber || !metadata?.carrier || !metadata?.estimatedDelivery) {
          return {
            success: false,
            error: 'Missing required tracking information',
          }
        }
        return {
          success: await notifyShipped(config, {
            trackingNumber: metadata.trackingNumber,
            carrier: metadata.carrier,
            estimatedDelivery: metadata.estimatedDelivery,
            trackingUrl: metadata.trackingUrl,
          }),
          emailType: 'shipped',
        }

      case 'cancelled':
        return {
          success: await notifyOrderCancelled(
            config,
            metadata?.cancellationReason || 'お客様のご依頼によるものです',
            metadata?.refundAmount && metadata?.refundMethod
              ? {
                  amount: metadata.refundAmount,
                  method: metadata.refundMethod,
                }
              : undefined
          ),
          emailType: 'order_cancelled',
        }

      case 'korea_correction_pending':
        return {
          success: await requestKoreaCorrection(config, metadata?.correctionDetails || '校正が必要です'),
          emailType: 'korea_correction_request',
        }

      default:
        return {
          success: false,
          error: `No email template configured for status: ${status}`,
        }
    }
  } catch (error) {
    console.error('[OrderStatusEmails] Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================
// Batch Email Functions
// ============================================================

/**
 * 複数注文のステータス更新メールを一括送信
 */
export async function sendBatchOrderStatusEmails(
  orders: Array<{
    orderId: string
    orderNumber: string
    customerEmail: string
    customerName: string
    productName?: string
    status: string
    metadata?: Record<string, any>
  }>,
  baseUrl: string = 'https://epackage-lab.com'
): Promise<{
  total: number
  success: number
  failed: number
  errors: Array<{ orderNumber: string; error: string }>
}> {
  let success = 0
  let failed = 0
  const errors: Array<{ orderNumber: string; error: string }> = []

  for (const order of orders) {
    const config: OrderStatusEmailConfig = {
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      productName: order.productName,
      viewUrl: `${baseUrl}/member/orders/${order.orderId}`,
    }

    const result = await sendEmailForOrderStatus(order.status, config, order.metadata)

    if (result.success) {
      success++
    } else {
      failed++
      errors.push({
        orderNumber: order.orderNumber,
        error: result.error || 'Unknown error',
      })
    }
  }

  return {
    total: orders.length,
    success,
    failed,
    errors,
  }
}

// ============================================================
// Export
// ============================================================

export const orderStatusEmails = {
  // Quotation
  notifyQuoteReady,
  notifyQuoteApproved,

  // Data & Production Workflow
  requestDataUpload,
  notifyDataReceived,
  notifyPartialSKUSubmission,
  requestModification,
  notifyModificationApproved,
  notifyModificationRejected,
  notifyCorrectionReady,
  requestApproval,
  notifyProductionStarted,
  notifyReadyToShip,
  notifyShipped,

  // Order Management
  notifyOrderCancelled,
  requestKoreaCorrection,

  // Status Dispatcher
  sendForStatus: sendEmailForOrderStatus,
  sendBatch: sendBatchOrderStatusEmails,
}


// ============================================================
// 상태 전이 중앙 알림 (RALPLAN STEP4 — Option A 중앙 매핑)
// ============================================================

export interface NotifyStatusChangeConfig extends OrderStatusEmailConfig {
  trackingNumber?: string
}

export interface NotifyStatusChangeResult {
  sent: boolean
  templateId?: string
  error?: string
}

/**
 * 주문 상태 전이 시 고객에게 맞는 이메일을 발송하는 중앙 진입점.
 *
 * - A4: 내부 오류가 상태 변경 자체를 롤백시키지 않도록 catch 후 boolean 반환
 * - A5: 매핑되지 않은 상태는 조용히 생략 + warn 로그
 * - A6: view_url 미전달 시 NEXT_PUBLIC_SITE_URL 기반 폴백
 */
export async function notifyStatusChange(
  config: NotifyStatusChangeConfig,
  targetStatus: OrderStatus
): Promise<NotifyStatusChangeResult> {
  try {
    const viewUrl =
      config.viewUrl ||
      `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/member/orders/${config.orderId}`

    const baseData: EpackEmailData = {
      order_id: config.orderId,
      order_number: config.orderNumber,
      customer_email: config.customerEmail,
      customer_name: config.customerName,
      product_name: config.productName,
      view_url: viewUrl,
    }

    // SHIPPED: 운송장 번호를 delivery_tracking에서 조회 (호출자가 미전달 시)
    let trackingNumber = config.trackingNumber
    if (targetStatus === 'SHIPPED' && !trackingNumber) {
      try {
        const supabase = createServiceClient() as any // delivery_tracking 미정의 타입 우회
        const { data } = await supabase
          .from('delivery_tracking')
          .select('tracking_number')
          .eq('order_id', config.orderId)
          .maybeSingle()
        trackingNumber = data?.tracking_number ?? undefined
      } catch {
        // 조회 실패 시에도 운송장 없는 발송 안내로 진행
      }
    }

    let result: { success: boolean; error?: string } | null = null
    let templateId: string | undefined

    switch (targetStatus) {
      case 'DATA_UPLOADED':
        templateId = 'dataReceived'
        result = await epackMailer.dataReceived(baseData)
        break
      case 'MODIFICATION_APPROVED':
        templateId = 'modificationApproved'
        result = await epackMailer.modificationApproved(baseData)
        break
      case 'CORRECTION_COMPLETED':
      case 'CUSTOMER_APPROVAL_PENDING':
        templateId = 'approvalRequest'
        result = await epackMailer.approvalRequest(baseData)
        break
      case 'PRODUCTION':
        templateId = 'productionStarted'
        result = await epackMailer.productionStarted({ ...baseData, estimated_completion: '—' })
        break
      case 'WORK_ORDER':
        templateId = 'workOrderStartedEmail'
        result = await epackMailer.workOrderStarted(baseData)
        break
      case 'READY_TO_SHIP':
        templateId = 'readyToShip'
        result = await epackMailer.readyToShip({ ...baseData, quantity: '—' })
        break
      case 'SHIPPED':
        templateId = 'shipped'
        result = await epackMailer.shipped({
          ...baseData,
          tracking_number: trackingNumber,
          tracking_url: trackingNumber
            ? `https://trackings.post.japanpost.jp/services/srv/search/?requestNo1=${trackingNumber}`
            : undefined,
          estimated_delivery: '—',
        })
        break
      case 'DELIVERED':
        templateId = 'deliveredEmail'
        result = await epackMailer.delivered({
          ...baseData,
          delivered_at: new Date().toISOString(),
          tracking_number: trackingNumber,
        })
        break
      case 'QUOTATION_PENDING':
      case 'QUOTATION_APPROVED':
      case 'DATA_UPLOAD_PENDING':
      case 'MODIFICATION_REQUESTED':
      case 'CORRECTION_IN_PROGRESS':
      case 'CANCELLED':
        // 별도 전용 흐름이 있는 상태 — 이 중앙 매핑에서는 발송하지 않음
        return { sent: false, error: `no mapped template for ${targetStatus}` }
      default:
        // A5: 미지 상태 — 조용히 생략하지만 로그로 추적
        console.warn(`[notifyStatusChange] Unmapped status: ${targetStatus}`)
        return { sent: false, error: `unmapped status: ${targetStatus}` }
    }

    if (!result?.success) {
      // A4: 발송 실패는 로그만 남기고 호출자에게 보고 (상태 변경은 이미 완료됨)
      console.warn(`[notifyStatusChange] Send failed (${templateId}):`, result?.error)
      return { sent: false, templateId, error: result?.error }
    }

    return { sent: true, templateId }
  } catch (error) {
    // A4: 어떤 경우에도 throw하지 않는다
    console.error('[notifyStatusChange] Unexpected error:', error)
    return { sent: false, error: error instanceof Error ? error.message : 'unexpected error' }
  }
}
