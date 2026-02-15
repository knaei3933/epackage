/**
 * Shipment Card Component
 * Displays shipment information in a card format
 */

'use client';

import { Package, Truck, MapPin, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Shipment,
  ShipmentStatus,
  CarrierType,
  CARRIER_NAMES,
  SHIPMENT_STATUS_NAMES,
} from '@/types/shipment';
import { cn } from '@/lib/utils';

// キャリアコードを正規化（大文字→小文字、enumにマッピング）
function normalizeCarrierCode(code: string): CarrierType {
  const upperCode = code.toUpperCase();
  switch (upperCode) {
    case 'YAMATO':
      return CarrierType.YAMATO;
    case 'SAGAWA':
      return CarrierType.SAGAWA;
    case 'JP_POST':
    case 'JPPOST':
      return CarrierType.JP_POST;
    case 'SEINO':
      return CarrierType.SEINO;
    default:
      return CarrierType.YAMATO; // デフォルト
  }
}

// キャリア名を取得（安全にハンドリング）
function getCarrierName(carrierCode: string): { ja: string; en: string } {
  try {
    const normalized = normalizeCarrierCode(carrierCode);
    return CARRIER_NAMES[normalized];
  } catch {
    return { ja: carrierCode || '配送業者', en: carrierCode || 'Carrier' };
  }
}

// ステータス名を取得（安全にハンドリング）
function getStatusName(status: string): { ja: string; en: string } {
  try {
    const statusKey = status.toUpperCase() as keyof typeof SHIPMENT_STATUS_NAMES;
    if (SHIPMENT_STATUS_NAMES[statusKey]) {
      return SHIPMENT_STATUS_NAMES[statusKey];
    }
  } catch {
    // エラーを無視
  }
  // デフォルトのステータス名マッピング
  const defaultStatusNames: Record<string, { ja: string; en: string }> = {
    pending: { ja: '待機中', en: 'Pending' },
    picked_up: { ja: '引渡済み', en: 'Picked Up' },
    in_transit: { ja: '輸送中', en: 'In Transit' },
    out_for_delivery: { ja: '配達中', en: 'Out for Delivery' },
    delivered: { ja: '配達完了', en: 'Delivered' },
    failed: { ja: '配達失敗', en: 'Failed' },
    returned: { ja: '返品', en: 'Returned' },
  };
  return defaultStatusNames[status] || { ja: status, en: status };
}

interface ShipmentCardProps {
  shipment: Shipment & {
    order_number?: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    delivery_address?: any;  // API에서 반환하는 배송지 주소
    recent_tracking?: any;
  };
  onRefreshTracking?: (id: string) => Promise<void>;
  onViewDetails?: (id: string) => void;
  onDownloadLabel?: (id: string) => Promise<void>;
  isRefreshing?: boolean;
}

export function ShipmentCard({
  shipment,
  onRefreshTracking,
  onViewDetails,
  onDownloadLabel,
  isRefreshing,
}: ShipmentCardProps) {
  const statusColors: Record<ShipmentStatus, string> = {
    [ShipmentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [ShipmentStatus.PICKED_UP]: 'bg-blue-100 text-blue-800',
    [ShipmentStatus.IN_TRANSIT]: 'bg-indigo-100 text-indigo-800',
    [ShipmentStatus.OUT_FOR_DELIVERY]: 'bg-purple-100 text-purple-800',
    [ShipmentStatus.DELIVERED]: 'bg-green-100 text-green-800',
    [ShipmentStatus.FAILED]: 'bg-red-100 text-red-800',
    [ShipmentStatus.RETURNED]: 'bg-gray-100 text-gray-800',
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-600" />
          <span className="font-semibold">{shipment.shipment_number}</span>
        </div>
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusColors[shipment.status as ShipmentStatus])}>
          {getStatusName(shipment.status).ja}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Order & Customer */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">注文番号</span>
            <p className="font-medium mt-1">{shipment.order_number || '-'}</p>
          </div>
          <div>
            <span className="text-gray-600">お客様名</span>
            <p className="font-medium mt-1">{shipment.customer_name || '-'}</p>
          </div>
        </div>

        {/* Carrier & Tracking */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">配送業者</span>
            </div>
            <span className="font-medium">{getCarrierName(shipment.carrier_code || shipment.carrier_name || 'yamato').ja}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">追跡番号</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium font-mono text-sm">{shipment.tracking_number || '未発行'}</span>
              {shipment.tracking_number && shipment.tracking_url && (
                <a
                  href={shipment.tracking_url}
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
          {shipment.recent_tracking && (
            <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
              <p className="font-medium">最新情報</p>
              <p>{shipment.recent_tracking.status_description || shipment.recent_tracking.description_ja || '-'}</p>
              <p className="text-gray-500">{formatDate(shipment.recent_tracking.event_at || shipment.recent_tracking.created_at)}</p>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-3 h-3" />
              <span>集荷予定</span>
            </div>
            <p className="mt-1 text-xs">{formatDate(shipment.shipped_at)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-3 h-3" />
              <span>配達予定</span>
            </div>
            <p className="mt-1 text-xs">{formatDate(shipment.estimated_delivery_date)}</p>
          </div>
        </div>

        {/* Destination */}
        <div className="text-sm">
          <span className="text-gray-600">配送先</span>
          <p className="mt-1 text-xs">
            〒{shipment.delivery_address?.postal_code || '-'}
            {shipment.delivery_address?.prefecture} {shipment.delivery_address?.city}{' '}
            {shipment.delivery_address?.address}
            {shipment.delivery_address?.building && ` ${shipment.delivery_address.building}`}
          </p>
          {shipment.delivery_address?.name && (
            <p className="text-xs text-gray-600 mt-1">{shipment.delivery_address.name}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
        {onRefreshTracking && shipment.tracking_number && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRefreshTracking(shipment.id)}
            disabled={isRefreshing || shipment.status === ShipmentStatus.DELIVERED}
            className="flex-1"
          >
            <RefreshCw className={cn('w-3 h-3 mr-1', isRefreshing && 'animate-spin')} />
            追跡更新
          </Button>
        )}
        {onDownloadLabel && shipment.shipping_label_url && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDownloadLabel(shipment.id)}
            className="flex-1"
          >
            ラベル
          </Button>
        )}
        {onViewDetails && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onViewDetails(shipment.id)}
            className="flex-1"
          >
            詳細
          </Button>
        )}
      </div>
    </div>
  );
}
