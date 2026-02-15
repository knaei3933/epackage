/**
 * Order Status Email Service
 *
 * オーダーステータスに応じたメール送信サービス
 * B2B注文ワークフローの各ステップで適切なメールを送信
 *
 * @module lib/email/order-status-emails
 */

import { epackMailer, type EpackEmailData } from './epack-mailer'

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
  viewUrl: string
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
