/**
 * Customer Notification System
 * カスタマー通知システム
 *
 * Functions to create and manage customer notifications for various events
 */

import { createServiceClient } from '@/lib/supabase';
import type { NotificationType } from '@/types/portal';
import type { Database } from '@/types/database';

// ============================================================
// Type-safe Helper Functions
// ============================================================

/**
 * Type-safe update helper for customer_notifications table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function updateCustomerNotification(supabase: ReturnType<typeof createServiceClient>, notificationId: string, data: Database['public']['Tables']['customer_notifications']['Update']) {
  return (supabase as any)
    .from('customer_notifications')
    .update(data)
    .eq('id', notificationId);
}

/**
 * Type-safe delete helper for customer_notifications table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function deleteExpiredCustomerNotifications(supabase: ReturnType<typeof createServiceClient>, expiresBefore: string) {
  return (supabase as any)
    .from('customer_notifications')
    .delete()
    .lt('expires_at', expiresBefore)
    .select();
}

interface NotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  titleJa: string;
  message: string;
  messageJa: string;
  orderId?: string;
  quotationId?: string;
  shipmentId?: string;
  actionUrl?: string;
  actionLabel?: string;
  actionLabelJa?: string;
  sendEmail?: boolean;
  sendSms?: boolean;
}

/**
 * Create a customer notification
 */
export async function createCustomerNotification(options: NotificationOptions): Promise<string | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc('create_customer_notification', {
    user_uuid: options.userId,
    notif_type: options.type,
    notif_title: options.title,
    notif_message: options.message,
    order_uuid: options.orderId || null,
    quotation_uuid: options.quotationId || null,
    shipment_uuid: options.shipmentId || null,
    action_url: options.actionUrl || null,
    action_label: options.actionLabel || null,
  } as any);

  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }

  // Update sent flags if email/SMS was sent
  if (options.sendEmail || options.sendSms) {
    await updateCustomerNotification(supabase, data, {
      sent_via_email: options.sendEmail || false,
      sent_via_sms: options.sendSms || false,
    });
  }

  return data;
}

/**
 * Notify customer when quote is ready
 */
export async function notifyQuoteReady(userId: string, quotationId: string, quotationNumber: string): Promise<void> {
  await createCustomerNotification({
    userId,
    type: 'quote_ready',
    title: 'Quote Ready',
    titleJa: '見積書が準備できました',
    message: `Your quote ${quotationNumber} is ready for review.`,
    messageJa: `見積書 ${quotationNumber} がご確認いただける状態になりました。`,
    quotationId,
    actionUrl: `/portal/quotations/${quotationId}`,
    actionLabel: 'View Quote',
    actionLabelJa: '見積書を確認',
    sendEmail: true,
  });
}

/**
 * Notify customer when contract is ready for signature
 */
export async function notifyContractReady(userId: string, orderId: string, orderNumber: string): Promise<void> {
  await createCustomerNotification({
    userId,
    type: 'contract_ready',
    title: 'Contract Ready for Signature',
    titleJa: '契約書に署名してください',
    message: `Contract for order ${orderNumber} is ready for your signature.`,
    messageJa: `注文 ${orderNumber} の契約書に署名してください。`,
    orderId,
    actionUrl: `/portal/orders/${orderId}`,
    actionLabel: 'Review Contract',
    actionLabelJa: '契約書を確認',
    sendEmail: true,
  });
}

/**
 * Notify customer of production stage update
 */
export async function notifyProductionUpdate(
  userId: string,
  orderId: string,
  stage: string,
  stageJa: string
): Promise<void> {
  await createCustomerNotification({
    userId,
    type: 'production_update',
    title: 'Production Update',
    titleJa: '製造進捗更新',
    message: `Your order has moved to: ${stage}`,
    messageJa: `注文の製造が進行しました: ${stageJa}`,
    orderId,
    actionUrl: `/portal/orders/${orderId}`,
    actionLabel: 'View Progress',
    actionLabelJa: '進捗を確認',
    sendEmail: true,
  });
}

/**
 * Notify customer of shipment
 */
export async function notifyShipmentUpdate(
  userId: string,
  orderId: string,
  trackingNumber: string,
  carrierName: string
): Promise<void> {
  await createCustomerNotification({
    userId,
    type: 'shipment_update',
    title: 'Order Shipped',
    titleJa: '商品を発送しました',
    message: `Your order has been shipped. Tracking: ${trackingNumber}`,
    messageJa: `注文を発送いたしました。配送伝票番号: ${trackingNumber}`,
    orderId,
    shipmentId: trackingNumber,
    actionUrl: `/portal/orders/${orderId}`,
    actionLabel: 'Track Shipment',
    actionLabelJa: '配送を追跡',
    sendEmail: true,
  });
}

/**
 * Notify customer of delivery
 */
export async function notifyDeliveryComplete(userId: string, orderId: string, orderNumber: string): Promise<void> {
  await createCustomerNotification({
    userId,
    type: 'shipment_update',
    title: 'Order Delivered',
    titleJa: '商品をお届けしました',
    message: `Your order ${orderNumber} has been delivered.`,
    messageJa: `注文 ${orderNumber} をお届けいたしました。`,
    orderId,
    actionUrl: `/portal/orders/${orderId}`,
    sendEmail: true,
  });
}

/**
 * Notify customer when document is available
 */
export async function notifyDocumentReady(
  userId: string,
  documentType: string,
  orderId: string
): Promise<void> {
  await createCustomerNotification({
    userId,
    type: 'document_ready',
    title: 'Document Available',
    titleJa: 'ドキュメントが利用可能です',
    message: `A new ${documentType} is available for download.`,
    messageJa: `${documentType}がダウンロード可能になりました。`,
    orderId,
    actionUrl: `/portal/orders/${orderId}`,
    actionLabel: 'Download',
    actionLabelJa: 'ダウンロード',
    sendEmail: true,
  });
}

/**
 * Notify customer when admin requests modification approval
 * Uses direct Supabase client insertion
 */
export async function notifyModificationRequested(
  userId: string,
  orderId: string,
  orderNumber: string,
  reason: string
): Promise<void> {
  const { createServiceClient } = await import('./supabase');
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('unified_notifications')
    .insert({
      recipient_id: userId,
      recipient_type: 'member',
      type: 'modification_requested',
      title: '修正承認依頼',
      message: `管理者が注文 ${orderNumber} の修正を依頼しました。理由: ${reason}`,
      related_id: orderId,
      related_type: 'orders',
      priority: 'high',
      action_url: `/member/orders/${orderId}`,
      action_label: '修正内容を確認',
    })
    .select('id')
    .single();

  if (error) {
    console.error('[notifyModificationRequested] Failed:', error);
  } else {
    console.log('[notifyModificationRequested] Created notification:', data?.id);
  }
}

/**
 * Get unread notification count for user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc('get_unread_notification_count', {
    user_uuid: userId,
  } as any);

  return data || 0;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string, userId: string): Promise<boolean> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc('mark_notification_read', {
    notification_uuid: notificationId,
    user_uuid: userId,
  } as any);

  return data || false;
}

/**
 * Mark all notifications as read for user
 */
export async function markAllAsRead(userId: string): Promise<number> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc('mark_all_notifications_read', {
    user_uuid: userId,
  } as any);

  return data || 0;
}

/**
 * Clean up expired notifications
 */
export async function cleanupExpiredNotifications(): Promise<number> {
  const supabase = createServiceClient();

  const { data, error } = await deleteExpiredCustomerNotifications(
    supabase,
    new Date().toISOString()
  );

  return (data as Database['public']['Tables']['customer_notifications']['Row'][] | undefined)?.length || 0;
}
