/**
 * Admin Shipment Detail Page
 *
 * 管理者出荷詳細ページ
 * - 出荷情報の詳細表示
 * - 配送追跡
 * - ステータス更新
 * - 配送伝票アップロード
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface TrackingEvent {
  id: string;
  status_code: string;
  status_description: string;
  location?: string;
  facility_name?: string;
  event_at: string;
}

interface Shipment {
  id: string;
  order_id: string;
  shipment_number: string;
  tracking_number: string | null;
  carrier_name: string;
  carrier_code: string | null;
  service_level: string | null;
  shipping_method: 'ground' | 'air' | 'sea' | 'rail' | 'courier';
  shipping_cost: number;
  currency: string;
  package_details: any;
  tracking_url: string | null;
  estimated_delivery_date: string | null;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned' | 'cancelled';
  shipped_at: string | null;
  estimated_delivery_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  delivered_to: string | null;
  delivery_signature_url: string | null;
  delivery_photo_url: string | null;
  shipping_notes: string | null;
  delivery_notes: string | null;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  shipping_address?: any;
}

export default function AdminShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = params.id as string;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (shipmentId) {
      fetchShipmentDetails();
    }
  }, [shipmentId]);

  const fetchShipmentDetails = async () => {
    if (!supabase) return;

    setLoading(true);
    try {
      // Fetch shipment details
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .single();

      if (shipmentError) throw shipmentError;

      setShipment(shipmentData as Shipment);
      setNotes(shipmentData?.shipping_notes || '');

      // Fetch related order
      if (shipmentData?.order_id) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('id, order_number, customer_name, customer_email, shipping_address')
          .eq('id', shipmentData.order_id)
          .single();

        setOrder(orderData as Order);
      }

      // Fetch tracking events
      const { data: trackingData } = await supabase
        .from('shipment_tracking')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('event_at', { ascending: false });

      setTrackingEvents(trackingData || []);
    } catch (error) {
      console.error('出荷詳細の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!supabase || !shipment || !newStatus) return;

    if (!confirm(`ステータスを ${getStatusLabel(newStatus)} に変更しますか？`)) {
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('shipments')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipmentId);

      if (error) throw error;

      setNewStatus('');
      fetchShipmentDetails();
      alert('ステータスを変更しました');
    } catch (error) {
      console.error('ステータス変更に失敗しました:', error);
      alert('ステータス変更に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const updateTracking = async () => {
    if (!supabase || !shipment) return;

    if (!shipment.tracking_number) {
      alert('配送伝票番号を入力してください');
      return;
    }

    setUpdating(true);
    try {
      // In a real implementation, you would call the carrier's API here
      // For now, just update the tracking URL
      const trackingUrl = getCarrierTrackingUrl(shipment.carrier_code, shipment.tracking_number);

      const { error } = await supabase
        .from('shipments')
        .update({
          tracking_url: trackingUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipmentId);

      if (error) throw error;

      fetchShipmentDetails();
      alert('配送追跡情報を更新しました');
    } catch (error) {
      console.error('追跡情報の更新に失敗しました:', error);
      alert('追跡情報の更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: '出荷待ち',
      picked_up: '集荷済み',
      in_transit: '輸送中',
      out_for_delivery: '配達中',
      delivered: '配達完了',
      failed: '配達失敗',
      returned: '返送',
      cancelled: 'キャンセル',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string): string => {
    const variants: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800',
      picked_up: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-purple-100 text-purple-800',
      out_for_delivery: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      returned: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-gray-200 text-gray-600',
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const getCarrierTrackingUrl = (carrierCode: string | null, trackingNumber: string): string => {
    if (!carrierCode) return '';

    const urls: Record<string, string> = {
      'YTO': `https://track.kuronekoyamato.co.jp/english/tracking?id=${trackingNumber}`,
      'SG': `https://t.sagawa-exp.co.jp/web/app/tcengtls.do?engno=${trackingNumber}`,
      'JP': `https://www.post.japanpost.jp/int/delivery_en/?trackingNumber=${trackingNumber}`,
    };

    return urls[carrierCode] || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-center text-gray-600 mt-4">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600">出荷情報が見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              出荷詳細
            </h1>
            <p className="text-gray-600 mt-1">
              出荷番号: {shipment.shipment_number}
            </p>
          </div>
          <div className="flex gap-3">
            {order && (
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/orders/${order.id}`)}
              >
                注文詳細を見る
              </Button>
            )}
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              戻る
            </button>
          </div>
        </div>

        {/* ステータス */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ステータス</h2>
          <div className="flex items-center justify-between">
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              getStatusVariant(shipment.status)
            )}>
              {getStatusLabel(shipment.status)}
            </span>

            {/* ステータス変更 */}
            <div className="flex gap-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ステータスを選択...</option>
                <option value="pending">出荷待ち</option>
                <option value="picked_up">集荷済み</option>
                <option value="in_transit">輸送中</option>
                <option value="out_for_delivery">配達中</option>
                <option value="delivered">配達完了</option>
                <option value="failed">配達失敗</option>
                <option value="returned">返送</option>
                <option value="cancelled">キャンセル</option>
              </select>
              <Button
                onClick={updateStatus}
                disabled={!newStatus || updating}
                className="px-6"
              >
                変更
              </Button>
            </div>
          </div>
        </div>

        {/* 出荷情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">出荷情報</h2>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-gray-600">作成日時</dt>
              <dd className="text-gray-900 mt-1">
                {new Date(shipment.created_at).toLocaleString('ja-JP')}
              </dd>
            </div>
            {shipment.shipped_at && (
              <div>
                <dt className="text-gray-600">出荷日時</dt>
                <dd className="text-gray-900 mt-1">
                  {new Date(shipment.shipped_at).toLocaleString('ja-JP')}
                </dd>
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
            {shipment.estimated_delivery_at && (
              <div>
                <dt className="text-gray-600">予定配達日時</dt>
                <dd className="text-gray-900 mt-1">
                  {new Date(shipment.estimated_delivery_at).toLocaleString('ja-JP')}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-gray-600">配送業者</dt>
              <dd className="text-gray-900 mt-1">{shipment.carrier_name}</dd>
            </div>
            {shipment.service_level && (
              <div>
                <dt className="text-gray-600">サービスレベル</dt>
                <dd className="text-gray-900 mt-1">{shipment.service_level}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-600">配送方法</dt>
              <dd className="text-gray-900 mt-1">
                {shipment.shipping_method === 'ground' && '陸送'}
                {shipment.shipping_method === 'air' && '航空'}
                {shipment.shipping_method === 'sea' && '海上'}
                {shipment.shipping_method === 'rail' && '鉄道'}
                {shipment.shipping_method === 'courier' && '宅配便'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">配送料金</dt>
              <dd className="text-gray-900 mt-1">
                {shipment.shipping_cost.toLocaleString()} {shipment.currency}
              </dd>
            </div>
          </dl>
        </div>

        {/* 顧客情報 */}
        {order && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">注文情報</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-600">注文番号</dt>
                <dd className="text-gray-900 mt-1">{order.order_number}</dd>
              </div>
              <div>
                <dt className="text-gray-600">顧客名</dt>
                <dd className="text-gray-900 mt-1">{order.customer_name}</dd>
              </div>
              <div>
                <dt className="text-gray-600">メールアドレス</dt>
                <dd className="text-gray-900 mt-1">{order.customer_email}</dd>
              </div>
            </dl>
            {order.shipping_address && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">配送先</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{order.shipping_address.name}</p>
                  <p>〒{order.shipping_address.postalCode}</p>
                  <p>
                    {order.shipping_address.prefecture} {order.shipping_address.city}
                    <br />
                    {order.shipping_address.addressLine1}
                    {order.shipping_address.addressLine2 && (
                      <>
                        <br />
                        {order.shipping_address.addressLine2}
                      </>
                    )}
                  </p>
                  <p>TEL: {order.shipping_address.phone}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 配送伝票情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">配送伝票情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                配送伝票番号
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={shipment.tracking_number || ''}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                {shipment.tracking_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(shipment.tracking_url!, '_blank')}
                  >
                    配送業者サイトで追跡
                  </Button>
                )}
                <Button
                  onClick={updateTracking}
                  disabled={updating || !shipment.tracking_number}
                >
                  追跡情報を更新
                </Button>
              </div>
            </div>

            {shipment.package_details && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">荷物情報</h3>
                <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {JSON.stringify(shipment.package_details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* 配送メモ */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">配送メモ</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={async () => {
              if (!supabase) return;
              try {
                await supabase
                  .from('shipments')
                  .update({ shipping_notes: notes })
                  .eq('id', shipmentId);
              } catch (error) {
                console.error('メモ更新に失敗しました:', error);
              }
            }}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="配送に関するメモを入力..."
          />
        </div>

        {/* 配送追跡履歴 */}
        {trackingEvents.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">配送追跡履歴</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {trackingEvents.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                    )} />
                    {index < trackingEvents.length - 1 && (
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
      </div>
    </div>
  );
}
