/**
 * Shared Shipment Tracking Component
 * 共用配送追跡コンポーネント
 *
 * Unified shipment tracking component supporting:
 * - Simple card display (Portal style)
 * - Full-featured card with actions (Admin style)
 * - Carrier integration
 * - Tracking updates
 */

'use client';

import React from 'react';
import { Package, Truck, MapPin, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// =====================================================
// Types
// =====================================================

export type ShipmentStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned'
  | 'cancelled';

export type CarrierType = 'yamato' | 'sagawa' | 'jp_post' | 'other';

export interface ShipmentAddress {
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  name?: string;
}

export interface TrackingEvent {
  event_time: string;
  description_ja: string;
  description_en?: string;
  location?: string;
}

export interface ShipmentInfo {
  id: string;
  shipment_number?: string;
  order_number?: string;
  customer_name?: string;
  tracking_number?: string;
  tracking_url?: string;
  carrier_name_ja: string;
  carrier_name_en?: string;
  carrier: CarrierType;
  status: ShipmentStatus;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  pickup_scheduled_for?: string;
  delivery_address?: ShipmentAddress;
  shipping_label_url?: string;
  recent_tracking?: TrackingEvent[];
}

export interface ShipmentTrackingCardProps {
  shipment: ShipmentInfo;
  variant?: 'simple' | 'full';
  locale?: 'ja' | 'en';
  onRefreshTracking?: (id: string) => Promise<void>;
  onViewDetails?: (id: string) => void;
  onDownloadLabel?: (id: string) => Promise<void>;
  isRefreshing?: boolean;
  className?: string;
}

// =====================================================
// Constants
// =====================================================

const STATUS_LABELS: Record<ShipmentStatus, { ja: string; en: string; color: string }> = {
  pending: { ja: '準備中', en: 'Pending', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
  picked_up: { ja: '集荷済み', en: 'Picked Up', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  in_transit: { ja: '輸送中', en: 'In Transit', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  out_for_delivery: { ja: '配達中', en: 'Out for Delivery', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  delivered: { ja: '配達済み', en: 'Delivered', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  failed: { ja: '配達失敗', en: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  returned: { ja: '返送済み', en: 'Returned', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  cancelled: { ja: 'キャンセル', en: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const CARRIER_NAMES: Record<CarrierType, { ja: string; en: string }> = {
  yamato: { ja: 'ヤマト運輸', en: 'Yamato Transport' },
  sagawa: { ja: '佐川急便', en: 'Sagawa Express' },
  jp_post: { ja: '日本郵便', en: 'Japan Post' },
  other: { ja: 'その他', en: 'Other' },
};

const CARRIER_TRACKING_URLS: Record<CarrierType, (trackingNumber: string) => string> = {
  yamato: (num) => `https://www.kuronekoyamato.co.jp/tracking/?js=xs&ng=1&number01=${num}`,
  sagawa: (num) => `https://k2k.sagawa-exp.co.jp/web/search/tracking?no=${num}`,
  jp_post: (num) => `https://trackings.post.japanpost.jp/services/srv/search/direct?searchKind=S002&locale=ja&S06-02=${num}`,
  other: (num) => `https://google.com/search?q=${num}`,
};

// =====================================================
// Helper Functions
// =====================================================

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// =====================================================
// Simple Variant (Portal style)
// =====================================================

function SimpleShipmentCard({
  shipment,
  locale = 'ja'
}: Pick<ShipmentTrackingCardProps, 'shipment' | 'locale'>) {
  const statusInfo = STATUS_LABELS[shipment.status];
  const labels = locale === 'ja' ? {
    title: '配送情報',
    trackingNumber: '配送伝票番号',
    carrier: '配送業者',
    estimated: '配達予定日',
    actual: '配達日',
    deliveryAddress: '配送先住所',
    track: '追跡する'
  } : {
    title: 'Shipment Information',
    trackingNumber: 'Tracking Number',
    carrier: 'Carrier',
    estimated: 'Est. Delivery',
    actual: 'Delivery Date',
    deliveryAddress: 'Delivery Address',
    track: 'Track'
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">{labels.title}</h3>
        <span className={cn('px-3 py-1 text-xs font-medium rounded-full', statusInfo.color)}>
          {statusInfo[locale]}
        </span>
      </div>

      {/* Shipment Details */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">{labels.trackingNumber}:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-900 dark:text-white">
              {shipment.tracking_number || '-'}
            </span>
            {shipment.tracking_url && (
              <a
                href={shipment.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
              >
                {labels.track}
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">{labels.carrier}:</span>
          <span className="text-slate-900 dark:text-white">{shipment.carrier_name_ja}</span>
        </div>

        {shipment.estimated_delivery_date && (
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">{labels.estimated}:</span>
            <span className="text-slate-900 dark:text-white">
              {formatDate(shipment.estimated_delivery_date)}
            </span>
          </div>
        )}

        {shipment.actual_delivery_date && (
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">{labels.actual}:</span>
            <span className="text-slate-900 dark:text-white">
              {formatDate(shipment.actual_delivery_date)}
            </span>
          </div>
        )}
      </div>

      {/* Delivery Address */}
      {shipment.delivery_address && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{labels.deliveryAddress}</p>
          <p className="text-sm text-slate-900 dark:text-white">
            {[
              shipment.delivery_address.postalCode,
              shipment.delivery_address.prefecture,
              shipment.delivery_address.city,
              shipment.delivery_address.addressLine1,
              shipment.delivery_address.addressLine2,
            ]
              .filter(Boolean)
              .join(' ')}
          </p>
        </div>
      )}
    </div>
  );
}

// =====================================================
// Full Variant (Admin style)
// =====================================================

function FullShipmentCard({
  shipment,
  onRefreshTracking,
  onViewDetails,
  onDownloadLabel,
  isRefreshing,
  locale = 'ja'
}: ShipmentTrackingCardProps) {
  const statusInfo = STATUS_LABELS[shipment.status];
  const trackingUrl = shipment.tracking_url || CARRIER_TRACKING_URLS[shipment.carrier](shipment.tracking_number || '');

  const labels = locale === 'ja' ? {
    orderNumber: '注文番号',
    customerName: 'お客様名',
    carrier: '配送業者',
    trackingNumber: '追跡番号',
    notIssued: '未発行',
    latestInfo: '最新情報',
    pickupScheduled: '集荷予定',
    deliveryScheduled: '配達予定',
    destination: '配送先',
    refreshTracking: '追跡更新',
    label: 'ラベル',
    details: '詳細'
  } : {
    orderNumber: 'Order Number',
    customerName: 'Customer Name',
    carrier: 'Carrier',
    trackingNumber: 'Tracking Number',
    notIssued: 'Not Issued',
    latestInfo: 'Latest Info',
    pickupScheduled: 'Pickup Scheduled',
    deliveryScheduled: 'Delivery Scheduled',
    destination: 'Destination',
    refreshTracking: 'Refresh Tracking',
    label: 'Label',
    details: 'Details'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-600" />
          <span className="font-semibold">{shipment.shipment_number}</span>
        </div>
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusInfo.color)}>
          {statusInfo[locale]}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Order & Customer */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">{labels.orderNumber}</span>
            <p className="font-medium mt-1">{shipment.order_number || '-'}</p>
          </div>
          <div>
            <span className="text-gray-600">{labels.customerName}</span>
            <p className="font-medium mt-1">
              {shipment.customer_name || shipment.delivery_address?.name}
            </p>
          </div>
        </div>

        {/* Carrier & Tracking */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">{labels.carrier}</span>
            </div>
            <span className="font-medium">{shipment.carrier_name_ja}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">{labels.trackingNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium font-mono">
                {shipment.tracking_number || labels.notIssued}
              </span>
              {shipment.tracking_number && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Latest Tracking Event */}
          {shipment.recent_tracking && shipment.recent_tracking.length > 0 && (
            <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
              <p className="font-medium">{labels.latestInfo}</p>
              <p>{shipment.recent_tracking[0].description_ja}</p>
              <p className="text-gray-500">{formatDateTime(shipment.recent_tracking[0].event_time)}</p>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-3 h-3" />
              <span>{labels.pickupScheduled}</span>
            </div>
            <p className="mt-1 text-xs">{formatDate(shipment.pickup_scheduled_for)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-3 h-3" />
              <span>{labels.deliveryScheduled}</span>
            </div>
            <p className="mt-1 text-xs">{formatDate(shipment.estimated_delivery_date)}</p>
          </div>
        </div>

        {/* Destination */}
        <div className="text-sm">
          <span className="text-gray-600">{labels.destination}</span>
          <p className="mt-1 text-xs">
            {shipment.delivery_address?.prefecture} {shipment.delivery_address?.city}{' '}
            {shipment.delivery_address?.addressLine1}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
        {onRefreshTracking && shipment.tracking_number && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRefreshTracking(shipment.id)}
            disabled={isRefreshing || shipment.status === 'delivered'}
            className="flex-1"
          >
            <RefreshCw className={cn('w-3 h-3 mr-1', isRefreshing && 'animate-spin')} />
            {labels.refreshTracking}
          </Button>
        )}
        {onDownloadLabel && shipment.shipping_label_url && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDownloadLabel(shipment.id)}
            className="flex-1"
          >
            {labels.label}
          </Button>
        )}
        {onViewDetails && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onViewDetails(shipment.id)}
            className="flex-1"
          >
            {labels.details}
          </Button>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Main Component
// =====================================================

export function ShipmentTrackingCard({
  shipment,
  variant = 'simple',
  locale = 'ja',
  onRefreshTracking,
  onViewDetails,
  onDownloadLabel,
  isRefreshing,
  className
}: ShipmentTrackingCardProps) {
  return (
    <div className={className}>
      {variant === 'simple' ? (
        <SimpleShipmentCard shipment={shipment} locale={locale} />
      ) : (
        <FullShipmentCard
          shipment={shipment}
          locale={locale}
          onRefreshTracking={onRefreshTracking}
          onViewDetails={onViewDetails}
          onDownloadLabel={onDownloadLabel}
          isRefreshing={isRefreshing}
        />
      )}
    </div>
  );
}

export default ShipmentTrackingCard;
