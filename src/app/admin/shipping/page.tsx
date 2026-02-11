'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering (skip static generation)
export const dynamic = "force-dynamic";
import useSWR from 'swr';

// Force dynamic rendering (skip static generation)
export const dynamic = "force-dynamic";
import { supabase } from '@/lib/supabase-browser';

// Force dynamic rendering (skip static generation)
export const dynamic = "force-dynamic";
import { Card, Badge, Button } from '@/components/ui';

// Force dynamic rendering (skip static generation)
export const dynamic = "force-dynamic";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Shipment {
  id: string;
  shipmentNumber: string;
  trackingNumber: string | null;
  orderNumber: string;
  customerName: string;
  carrierName: string;
  carrierCode: string | null;
  status: string;
  shippedAt: string | null;
  estimatedDeliveryDate: string | null;
  deliveredAt: string | null;
  trackingUrl: string | null;
  shippingCost: number;
}

interface TrackingEvent {
  id: string;
  eventAt: string;
  statusCode: string;
  statusDescription: string;
  location: string | null;
  facilityName: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  'pending': '出荷待ち',
  'picked_up': '集荷済み',
  'in_transit': '輸送中',
  'out_for_delivery': '配達中',
  'delivered': '配達済み',
  'failed': '配達失敗',
  'returned': '返送済み',
  'cancelled': 'キャンセル'
};

const CARRIERS = [
  { code: 'YTO', name: 'ヤマト運輸' },
  { code: 'SGE', name: '佐川急便' },
  { code: 'JPT', name: '日本郵便' },
  { code: 'SEINO', name: '西濃運輸' }
];

export default function ShippingManagementPage() {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCarrier, setFilterCarrier] = useState<string>('all');

  const { data: shipments, error, mutate } = useSWR(
    '/api/admin/shipping/shipments',
    fetcher,
    { refreshInterval: 30000 } // 30秒ごとに更新
  );

  // リアルタイム更新の購読
  useEffect(() => {
    const channel = supabase
      .channel('shipments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipments'
        },
        () => {
          mutate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, mutate]);

  const filteredShipments = shipments?.filter((s: Shipment) => {
    const statusMatch = filterStatus === 'all' || s.status === filterStatus;
    const carrierMatch = filterCarrier === 'all' || s.carrierCode === filterCarrier;
    return statusMatch && carrierMatch;
  }) || [];

  const stats = {
    total: shipments?.length || 0,
    pending: shipments?.filter((s: Shipment) => s.status === 'pending').length || 0,
    inTransit: shipments?.filter((s: Shipment) => ['picked_up', 'in_transit', 'out_for_delivery'].includes(s.status)).length || 0,
    delivered: shipments?.filter((s: Shipment) => s.status === 'delivered').length || 0,
    failed: shipments?.filter((s: Shipment) => s.status === 'failed').length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              配送管理
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              出荷・配送追跡の管理
            </p>
          </div>
          <Button>
            新規出荷
          </Button>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatsCard label="総出荷数" value={stats.total} color="blue" />
          <StatsCard label="出荷待ち" value={stats.pending} color="gray" />
          <StatsCard label="輸送中" value={stats.inTransit} color="yellow" />
          <StatsCard label="配達済み" value={stats.delivered} color="green" />
          <StatsCard label="失敗" value={stats.failed} color="red" />
        </div>

        {/* フィルター */}
        <div className="flex gap-4 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">すべてのステータス</option>
            <option value="pending">出荷待ち</option>
            <option value="picked_up">集荷済み</option>
            <option value="in_transit">輸送中</option>
            <option value="out_for_delivery">配達中</option>
            <option value="delivered">配達済み</option>
            <option value="failed">配達失敗</option>
          </select>
          <select
            value={filterCarrier}
            onChange={(e) => setFilterCarrier(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">すべての運送会社</option>
            {CARRIERS.map(carrier => (
              <option key={carrier.code} value={carrier.code}>{carrier.name}</option>
            ))}
          </select>
        </div>

        {/* 出荷リスト */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">出荷一覧</h2>
                <div className="space-y-3">
                  {filteredShipments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      出荷がありません
                    </div>
                  ) : (
                    filteredShipments.map((shipment: Shipment) => (
                      <div
                        key={shipment.id}
                        onClick={() => setSelectedShipment(shipment)}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{shipment.shipmentNumber}</p>
                              <Badge variant={getStatusVariant(shipment.status)}>
                                {STATUS_LABELS[shipment.status] || shipment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{shipment.carrierName}</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                              <span>注文: {shipment.orderNumber}</span>
                              <span>顧客: {shipment.customerName}</span>
                            </div>
                            {shipment.trackingNumber && (
                              <p className="text-xs text-blue-600 mt-1">
                                追跡番号: {shipment.trackingNumber}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm">
                            {shipment.shippedAt && (
                              <p className="text-gray-600">
                                出荷: {new Date(shipment.shippedAt).toLocaleDateString('ja-JP')}
                              </p>
                            )}
                            {shipment.estimatedDeliveryDate && (
                              <p className="text-gray-600">
                                納期: {new Date(shipment.estimatedDeliveryDate).toLocaleDateString('ja-JP')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* 詳細パネル */}
          <div className="lg:col-span-1">
            {selectedShipment ? (
              <ShipmentDetailPanel shipment={selectedShipment} onUpdate={mutate} />
            ) : (
              <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                出荷を選択してください
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[color as keyof typeof colors]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'delivered': return 'success';
    case 'in_transit':
    case 'out_for_delivery':
      return 'warning';
    case 'failed':
    case 'returned':
      return 'error';
    default: return 'default';
  }
}

function ShipmentDetailPanel({ shipment, onUpdate }: { shipment: Shipment; onUpdate: () => void }) {
  const { data: tracking } = useSWR(
    shipment.id ? `/api/admin/shipping/tracking/${shipment.id}` : null,
    fetcher
  );

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{shipment.shipmentNumber}</h3>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">注文番号</p>
            <p className="font-medium text-gray-900">{shipment.orderNumber}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">ステータス</p>
              <Badge variant={getStatusVariant(shipment.status)}>
                {STATUS_LABELS[shipment.status] || shipment.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500">運送会社</p>
              <p className="font-medium text-gray-900">{shipment.carrierName}</p>
            </div>
          </div>

          {shipment.trackingNumber && (
            <div>
              <p className="text-xs text-gray-500">追跡番号</p>
              <div className="flex items-center gap-2">
                <p className="font-medium text-blue-600">{shipment.trackingNumber}</p>
                {shipment.trackingUrl && (
                  <a
                    href={shipment.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    追跡 →
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">出荷日</p>
              <p className="font-medium text-gray-900">
                {shipment.shippedAt ? new Date(shipment.shippedAt).toLocaleDateString('ja-JP') : '---'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">納期日</p>
              <p className="font-medium text-gray-900">
                {shipment.estimatedDeliveryDate ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString('ja-JP') : '---'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">配達日</p>
              <p className="font-medium text-green-600">
                {shipment.deliveredAt ? new Date(shipment.deliveredAt).toLocaleDateString('ja-JP') : '---'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">送料</p>
              <p className="font-medium text-gray-900">¥{shipment.shippingCost.toLocaleString()}</p>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <Button className="w-full" variant="outline">
              追跡情報を更新
            </Button>
            {shipment.status === 'pending' && (
              <Button className="w-full">
                出荷処理
              </Button>
            )}
          </div>

          {/* 追跡タイムライン */}
          {tracking && tracking.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-3">追跡履歴</p>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {tracking.map((event: TrackingEvent, index: number) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      {index < tracking.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm font-medium text-gray-900">
                        {event.statusDescription}
                      </p>
                      {event.location && (
                        <p className="text-xs text-gray-500">{event.location}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(event.eventAt).toLocaleString('ja-JP')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
