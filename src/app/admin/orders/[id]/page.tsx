/**
 * Admin Order Detail Page
 *
 * 管理者注文詳細ページ
 * - 注文情報の詳細表示
 * - ステータス変更
 * - 編集機能
 * - 管理者メモ
 * - 履歴記録
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { OrderStatus, ORDER_STATUS_LABELS } from '@/types/order-status';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications?: any;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  quotation_id?: string;
  status: OrderStatus;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: any;
  billing_address?: any;
  requested_delivery_date?: string;
  estimated_delivery_date?: string;
  delivery_notes?: string;
  notes?: string;
  payment_term?: 'credit' | 'advance';
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
  items?: OrderItem[];
}

interface StatusHistory {
  id: string;
  from_status: string;
  to_status: string;
  changed_by: string;
  changed_at: string;
  reason?: string;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [reason, setReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    if (!supabase) return;

    setLoading(true);
    try {
      // Fetch order with items
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Fetch status history
      const { data: historyData, error: historyError } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('changed_at', { ascending: false });

      if (historyError) throw historyError;

      setOrder(orderData as Order);
      setStatusHistory(historyData || []);
      setAdminNotes(orderData?.notes || '');
    } catch (error) {
      console.error('注文詳細の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!supabase || !order || !newStatus) return;

    if (!isValidStatusTransition(order.status, newStatus)) {
      alert(`無効なステータス遷移: ${order.status} → ${newStatus}`);
      return;
    }

    if (!confirm(`ステータスを ${ORDER_STATUS_LABELS[newStatus].ja} に変更しますか？`)) {
      return;
    }

    setUpdating(true);
    try {
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Record status history
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          from_status: order.status,
          to_status: newStatus,
          changed_by: 'admin', // TODO: Use actual admin user ID
          changed_at: new Date().toISOString(),
          reason: reason || null,
        });

      if (historyError) throw historyError;

      setNewStatus('');
      setReason('');
      fetchOrderDetails();
      alert('ステータスを変更しました');
    } catch (error) {
      console.error('ステータス変更に失敗しました:', error);
      alert('ステータス変更に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const updateNotes = async () => {
    if (!supabase || !order) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      fetchOrderDetails();
      alert('管理者メモを更新しました');
    } catch (error) {
      console.error('メモ更新に失敗しました:', error);
      alert('メモ更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const isValidStatusTransition = (from: OrderStatus, to: string): boolean => {
    // Import and use validation logic from order-status types
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['QUOTATION', 'DATA_RECEIVED', 'CANCELLED'],
      QUOTATION: ['DATA_RECEIVED', 'WORK_ORDER', 'CANCELLED'],
      DATA_RECEIVED: ['WORK_ORDER', 'CONTRACT_SENT', 'CANCELLED'],
      WORK_ORDER: ['CONTRACT_SENT', 'PRODUCTION', 'CANCELLED'],
      CONTRACT_SENT: ['CONTRACT_SIGNED', 'CANCELLED'],
      CONTRACT_SIGNED: ['PRODUCTION', 'CANCELLED'],
      PRODUCTION: ['STOCK_IN', 'SHIPPED', 'CANCELLED'],
      STOCK_IN: ['SHIPPED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    return validTransitions[from]?.includes(to as OrderStatus) || false;
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600">注文が見つかりません</p>
        </div>
      </div>
    );
  }

  const statusLabel = ORDER_STATUS_LABELS[order.status]?.ja || order.status;
  const statusCategory = ORDER_STATUS_LABELS[order.status]?.category || 'default';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              注文詳細
            </h1>
            <p className="text-gray-600 mt-1">
              注文番号: {order.order_number}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            戻る
          </button>
        </div>

        {/* ステータス */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ステータス</h2>
          <div className="flex items-center gap-4">
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              statusCategory === 'initial' && 'bg-gray-100 text-gray-800',
              statusCategory === 'active' && 'bg-blue-100 text-blue-800',
              statusCategory === 'production' && 'bg-purple-100 text-purple-800',
              statusCategory === 'final' && 'bg-green-100 text-green-800',
              statusCategory === 'terminated' && 'bg-red-100 text-red-800'
            )}>
              {statusLabel}
            </span>
          </div>

          {/* ステータス変更 */}
          <div className="mt-4 space-y-3">
            <div className="flex gap-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ステータスを選択...</option>
                {Object.keys(ORDER_STATUS_LABELS).map((status) => (
                  <option key={status} value={status}>
                    {ORDER_STATUS_LABELS[status as OrderStatus].ja}
                  </option>
                ))}
              </select>
              <Button
                onClick={updateStatus}
                disabled={!newStatus || updating}
                className="px-6 py-2"
              >
                変更
              </Button>
            </div>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="変更理由（任意）"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 注文情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">注文情報</h2>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-gray-600">注文日時</dt>
              <dd className="text-gray-900 mt-1">
                {new Date(order.created_at).toLocaleString('ja-JP')}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">最終更新</dt>
              <dd className="text-gray-900 mt-1">
                {new Date(order.updated_at).toLocaleString('ja-JP')}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">支払条件</dt>
              <dd className="text-gray-900 mt-1">
                {order.payment_term === 'credit' ? '掛け払い' : '前払い'}
              </dd>
            </div>
            {order.shipped_at && (
              <div>
                <dt className="text-gray-600">発送日時</dt>
                <dd className="text-gray-900 mt-1">
                  {new Date(order.shipped_at).toLocaleString('ja-JP')}
                </dd>
              </div>
            )}
            {order.delivered_at && (
              <div>
                <dt className="text-gray-600">配送完了日時</dt>
                <dd className="text-gray-900 mt-1">
                  {new Date(order.delivered_at).toLocaleString('ja-JP')}
                </dd>
              </div>
            )}
            {order.estimated_delivery_date && (
              <div>
                <dt className="text-gray-600">予定納期</dt>
                <dd className="text-gray-900 mt-1">
                  {new Date(order.estimated_delivery_date).toLocaleDateString('ja-JP')}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* 顧客情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">顧客情報</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-600">顧客名</dt>
              <dd className="text-gray-900 mt-1">{order.customer_name}</dd>
            </div>
            <div>
              <dt className="text-gray-600">メールアドレス</dt>
              <dd className="text-gray-900 mt-1">{order.customer_email}</dd>
            </div>
            {order.customer_phone && (
              <div>
                <dt className="text-gray-600">電話番号</dt>
                <dd className="text-gray-900 mt-1">{order.customer_phone}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* 商品明細 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">商品明細</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">商品名</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">数量</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">単価</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">金額</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3">
                      <div className="font-medium text-gray-900">{item.product_name}</div>
                      {item.specifications && (
                        <div className="text-sm text-gray-600 mt-1">
                          {Object.entries(item.specifications).map(([key, value]) => (
                            <div key={key}>{`${key}: ${value}`}</div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-right py-3">{item.quantity}</td>
                    <td className="text-right py-3">¥{item.unit_price.toLocaleString()}</td>
                    <td className="text-right py-3">¥{item.total_price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">小計</span>
              <span className="text-gray-900">¥{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">消費税 (10%)</span>
              <span className="text-gray-900">¥{order.tax_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold mt-2">
              <span className="text-gray-900">合計</span>
              <span className="text-gray-900">¥{order.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 配送先・請求先 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {order.shipping_address && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">配送先</h2>
              <div className="text-sm space-y-2">
                <p className="font-medium text-gray-900">{order.shipping_address.name}</p>
                <p className="text-gray-600">〒{order.shipping_address.postalCode}</p>
                <p className="text-gray-600">
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
                <p className="text-gray-600">TEL: {order.shipping_address.phone}</p>
                {order.delivery_notes && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-gray-600">配送備考: {order.delivery_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {order.billing_address && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">請求先</h2>
              <div className="text-sm space-y-2">
                <p className="font-medium text-gray-900">{order.billing_address.company}</p>
                <p className="text-gray-600">〒{order.billing_address.postalCode}</p>
                <p className="text-gray-600">
                  {order.billing_address.prefecture} {order.billing_address.city}
                  <br />
                  {order.billing_address.addressLine1}
                  {order.billing_address.addressLine2 && (
                    <>
                      <br />
                      {order.billing_address.addressLine2}
                    </>
                  )}
                </p>
                <p className="text-gray-600">TEL: {order.billing_address.phone}</p>
              </div>
            </div>
          )}
        </div>

        {/* 管理者メモ */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">管理者メモ</h2>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="管理者用メモを入力..."
          />
          <div className="mt-3">
            <Button
              onClick={updateNotes}
              disabled={updating}
              className="px-6"
            >
              メモを更新
            </Button>
          </div>
        </div>

        {/* ステータス履歴 */}
        {statusHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ステータス変更履歴</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {statusHistory.map((history) => (
                <div key={history.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {ORDER_STATUS_LABELS[history.from_status as OrderStatus]?.ja || history.from_status}
                        {' → '}
                        {ORDER_STATUS_LABELS[history.to_status as OrderStatus]?.ja || history.to_status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(history.changed_at).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    {history.reason && (
                      <p className="text-sm text-gray-600 mt-1">理由: {history.reason}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      変更者: {history.changed_by}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
