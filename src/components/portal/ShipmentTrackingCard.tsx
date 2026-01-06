/**
 * Shipment Tracking Card Component
 * 配送追跡カード
 *
 * Displays shipment tracking information with carrier details
 */

'use client';

import React from 'react';
import { type ShipmentInfo } from '@/types/portal';
import { formatDate } from '@/types/portal';
import { cn } from '@/lib/utils';

interface ShipmentTrackingCardProps {
  shipment: ShipmentInfo;
  orderNumber: string;
}

const statusLabels: Record<string, { ja: string; color: string }> = {
  pending: { ja: '準備中', color: 'bg-slate-100 text-slate-700' },
  picked_up: { ja: '集荷済み', color: 'bg-blue-100 text-blue-700' },
  in_transit: { ja: '輸送中', color: 'bg-purple-100 text-purple-700' },
  out_for_delivery: { ja: '配達中', color: 'bg-orange-100 text-orange-700' },
  delivered: { ja: '配達済み', color: 'bg-green-100 text-green-700' },
  failed: { ja: '配達失敗', color: 'bg-red-100 text-red-700' },
  returned: { ja: '返送済み', color: 'bg-gray-100 text-gray-700' },
  cancelled: { ja: 'キャンセル', color: 'bg-red-100 text-red-700' },
};

export function ShipmentTrackingCard({ shipment, orderNumber }: ShipmentTrackingCardProps) {
  const statusInfo = statusLabels[shipment.status] || statusLabels.pending;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">配送情報</h3>
        <span className={cn('px-3 py-1 text-xs font-medium rounded-full', statusInfo.color)}>
          {statusInfo.ja}
        </span>
      </div>

      {/* Shipment Details */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">配送伝票番号:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-900 dark:text-white">{shipment.tracking_number || '-'}</span>
            {shipment.tracking_url && (
              <a
                href={shipment.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
              >
                追跡する
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">配送業者:</span>
          <span className="text-slate-900 dark:text-white">{shipment.carrier_name_ja}</span>
        </div>

        {shipment.estimated_delivery_date && (
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">配達予定日:</span>
            <span className="text-slate-900 dark:text-white">
              {formatDate(shipment.estimated_delivery_date, 'ja')}
            </span>
          </div>
        )}

        {shipment.actual_delivery_date && (
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">配達日:</span>
            <span className="text-slate-900 dark:text-white">
              {formatDate(shipment.actual_delivery_date, 'ja')}
            </span>
          </div>
        )}
      </div>

      {/* Delivery Address */}
      {shipment.delivery_address && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">配送先住所</p>
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
