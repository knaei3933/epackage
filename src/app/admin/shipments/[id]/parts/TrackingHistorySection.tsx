/**
 * Tracking History and Delivery Completion Section
 */

'use client';

import { Package, CheckCircle, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface TrackingHistorySectionProps {
  shipment: any;
}

export function TrackingHistorySection({ shipment }: TrackingHistorySectionProps) {
  return (
    <>
        {/* 配送追跡履歴 */}
        {(shipment.trackingEvents || shipment.tracking_events || []).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">配送追跡履歴</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {(shipment.trackingEvents || shipment.tracking_events || []).map((event: any, index: number) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                    )} />
                    {index < (shipment.trackingEvents || shipment.tracking_events || []).length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 min-h-[40px]" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{event.status_description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.event_at).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    {(event.location || event.facility_name) && (
                      <p className="text-sm text-gray-600 mt-1">
                        {event.facility_name && event.facility_name}
                        {event.location && ` (${event.location})`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 配達完了情報 */}
        {shipment.status === 'delivered' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">配達完了情報</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {shipment.delivered_to && (
                <div>
                  <dt className="text-gray-600">受取人</dt>
                  <dd className="text-gray-900 mt-1">{shipment.delivered_to}</dd>
                </div>
              )}
              {shipment.delivered_at && (
                <div>
                  <dt className="text-gray-600">配達完了日時</dt>
                  <dd className="text-gray-900 mt-1">
                    {new Date(shipment.delivered_at).toLocaleString('ja-JP')}
                  </dd>
                </div>
              )}
              {shipment.delivery_notes && (
                <div className="md:col-span-2">
                  <dt className="text-gray-600">配達メモ</dt>
                  <dd className="text-gray-900 mt-1">{shipment.delivery_notes}</dd>
                </div>
              )}
            </dl>
            <div className="mt-4 flex gap-3">
              {shipment.delivery_signature_url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(shipment.delivery_signature_url!, '_blank')}
                >
                  署名を表示
                </Button>
              )}
              {shipment.delivery_photo_url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(shipment.delivery_photo_url!, '_blank')}
                >
                  配達写真を表示
                </Button>
              )}
            </div>
          </div>
        )}
    </>
  );
}
