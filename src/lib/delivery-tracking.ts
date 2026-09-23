/**
 * Member Delivery Tracking Lookup
 *
 * 会員向け配送追跡情報の取得（自分の注文のみ）
 *
 * セキュリティ設計 (Architect 条件):
 * - A: 所有権検証 — order.user_id !== userId の場合は null（他人の追跡情報を返さない）
 * - C: 返却フィールドはホワイトリスト方式（admin_notes は絶対に返さない）
 *
 * @module lib/delivery-tracking
 */

import { createServiceClient } from '@/lib/supabase';
import { getEMSTrackingURL, getJapanPostTrackingURL } from '@/lib/ems-tracking';

// =====================================================
// Types
// =====================================================

export type DeliveryCarrier = 'ems' | 'surface_mail' | 'sea_freight' | 'air_freight' | 'other';

export interface MemberDeliveryTracking {
  trackingNumber: string | null;
  carrier: DeliveryCarrier | null;
  carrierLabel: string;
  shippingDate: string | null;
  estimatedDeliveryDateMin: string | null;
  estimatedDeliveryDateMax: string | null;
  actualDeliveryDate: string | null;
  /** 配送状況を確認できる外部トラッキングURL（追跡可能な場合のみ） */
  trackingUrl: string | null;
  /** actual_delivery_date が記録済み（配達完了） */
  isDelivered: boolean;
}

interface DeliveryTrackingRow {
  tracking_number?: string | null;
  carrier?: string | null;
  shipping_date?: string | null;
  estimated_delivery_date_min?: string | null;
  estimated_delivery_date_max?: string | null;
  actual_delivery_date?: string | null;
  // NOTE: status / admin_notes は意図的に型へ含めない（返却しない）
}

const CARRIER_LABELS_JA: Record<DeliveryCarrier, string> = {
  ems: 'EMS',
  surface_mail: '船便',
  sea_freight: '海上コンテナ',
  air_freight: '航空貨物',
  other: 'その他',
};

// =====================================================
// Tracking URL Resolution
// =====================================================

/**
 * 追跡番号から外部トラッキングURLを解決する。
 * 既存の ems-tracking ヘルパーへ委譲（単体テストで検証）。
 */
export function resolveTrackingUrl(
  carrier: DeliveryCarrier | null,
  trackingNumber: string
): string | null {
  if (carrier === 'ems') {
    return getEMSTrackingURL(trackingNumber) || null;
  }
  if (carrier === 'surface_mail') {
    return getJapanPostTrackingURL(trackingNumber) || null;
  }
  // 海上/航空/その他は追跡URL仕様が確定していないため null
  return null;
}

// =====================================================
// Public API
// =====================================================

/**
 * 自分の注文の配送追跡情報を取得する。
 *
 * - 所有権検証: user_id が一致しない注文・存在しない注文は null
 * - 追跡レコードが未作成（まだ出荷フローに入っていない）場合は null
 * - admin_notes など管理情報は返さない
 */
export async function getOrderDeliveryTracking(
  orderId: string,
  userId: string
): Promise<MemberDeliveryTracking | null> {
  const serviceClient = createServiceClient() as any; // Supabase 제네릭 깊이 우회

  // 1) 所有権検証を兼ねた注文解決（order_number でも解決可能）
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
  const { data: orderRow, error: orderError } = await serviceClient
    .from('orders')
    .select('id')
    .eq(isUuid ? 'id' : 'order_number', orderId)
    .eq('user_id', userId)
    .maybeSingle();

  if (orderError || !orderRow) {
    return null; // 他人の注文・存在しない注文
  }

  // 2) 追跡レコード取得
  const { data: trackingRow, error: trackingError } = await serviceClient
    .from('delivery_tracking')
    .select(
      'tracking_number, carrier, shipping_date, estimated_delivery_date_min, estimated_delivery_date_max, actual_delivery_date'
    )
    .eq('order_id', (orderRow as { id: string }).id)
    .maybeSingle();

  if (trackingError || !trackingRow) {
    return null; // 追跡レコード未作成
  }

  const row = trackingRow as DeliveryTrackingRow;
  const trackingNumber = row.tracking_number ?? null;
  const carrier = (row.carrier ?? null) as DeliveryCarrier | null;
  const actualDeliveryDate = row.actual_delivery_date ?? null;

  return {
    trackingNumber,
    carrier,
    carrierLabel: carrier ? (CARRIER_LABELS_JA[carrier] ?? carrier) : '',
    shippingDate: row.shipping_date ?? null,
    estimatedDeliveryDateMin: row.estimated_delivery_date_min ?? null,
    estimatedDeliveryDateMax: row.estimated_delivery_date_max ?? null,
    actualDeliveryDate,
    trackingUrl:
      carrier && trackingNumber ? resolveTrackingUrl(carrier, trackingNumber) : null,
    isDelivered: !!actualDeliveryDate,
  };
}
