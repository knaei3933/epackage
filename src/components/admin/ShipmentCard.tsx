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

interface ShipmentCardProps {
  shipment: Shipment & {
    order_number?: string;
    customer_name?: string;
    recent_tracking?: any[];
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
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusColors[shipment.status])}>
          {SHIPMENT_STATUS_NAMES[shipment.status].ja}
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
            <p className="font-medium mt-1">{shipment.customer_name || shipment.shipping_address?.name}</p>
          </div>
        </div>

        {/* Carrier & Tracking */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">配送業者</span>
            </div>
            <span className="font-medium">{CARRIER_NAMES[shipment.carrier].ja}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">追跡番号</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium font-mono">{shipment.tracking_number || '未発行'}</span>
              {shipment.tracking_number && (
                <a
                  href={`https://www.kuronekoyamato.co.jp/tracking/?js=xs&ng=1&number01=${shipment.tracking_number}`}
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
              <p className="font-medium">最新情報</p>
              <p>{shipment.recent_tracking[0].description_ja}</p>
              <p className="text-gray-500">{formatDate(shipment.recent_tracking[0].event_time)}</p>
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
            <p className="mt-1 text-xs">{formatDate(shipment.pickup_scheduled_for)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-3 h-3" />
              <span>配達予定</span>
            </div>
            <p className="mt-1 text-xs">{formatDate(shipment.estimated_delivery)}</p>
          </div>
        </div>

        {/* Destination */}
        <div className="text-sm">
          <span className="text-gray-600">配送先</span>
          <p className="mt-1 text-xs">
            {shipment.shipping_address?.prefecture} {shipment.shipping_address?.city}{' '}
            {shipment.shipping_address?.address}
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
