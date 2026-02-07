'use client';

/**
 * Admin Orders Client Component
 *
 * 注文管理ページ - Client Component
 * - Server Componentから認証コンテキストと初期データを受け取る
 * - UI/インタラクションを担当
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { OrderStatus, getStatusLabel, ORDER_STATUS_LABELS } from '@/types/order-status';
import { OrderStatusBadge } from '@/components/orders';
import { cn } from '@/lib/utils';

interface AuthContext {
  userId: string;
  role: 'ADMIN' | 'OPERATOR' | 'SALES' | 'ACCOUNTING';
  userName: string;
  isDevMode: boolean;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;  // 新しい10段階ワークフローステータス
  total_amount: number;
  created_at: string;
}

interface AdminOrdersClientProps {
  authContext: AuthContext;
  initialStatus: string;
  initialOrders?: Order[];
  quotationFilter?: string;
}

export default function AdminOrdersClient({ authContext, initialStatus, initialOrders = [], quotationFilter }: AdminOrdersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(false); // 初期データがあるのでロード中ではない
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  // 注文リスト取得
  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Dev Mode 인증을 지원하는 API 사용
      const { adminFetch } = await import('@/lib/auth-client');
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') {
        params.set('status', selectedStatus);
      }

      console.log('[AdminOrdersClient] Fetching orders from:', `/api/admin/orders?${params}`);
      const response = await adminFetch(`/api/admin/orders?${params}`);

      console.log('[AdminOrdersClient] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AdminOrdersClient] Error response:', errorText);
        throw new Error('注文リスト取得失敗');
      }

      const { data } = await response.json();
      console.log('[AdminOrdersClient] Received orders:', data?.length || 0);
      setOrders(data || []);
    } catch (error) {
      console.error('注文リスト取得失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // ステータスフィルター変更 - URLパラメータを更新
  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === 'all') {
      params.delete('status');
    } else {
      params.set('status', newStatus);
    }
    router.push(`/admin/orders?${params.toString()}`);
  };

  // 注文ステータス変更
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Admin APIを使用してステータスを変更（RLS回避）
      const { adminFetch } = await import('@/lib/auth-client');
      const response = await adminFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AdminOrdersClient] Status update error:', errorText);
        throw new Error('ステータス変更失敗');
      }

      fetchOrders();
      alert('注文ステータスが変更されました。');
    } catch (error) {
      console.error('注文ステータス変更失敗:', error);
      alert('注文ステータスの変更に失敗しました。');
    }
  };

  // 一括ステータス変更
  const bulkUpdateStatus = async (newStatus: OrderStatus) => {
    if (selectedOrders.size === 0) {
      alert('選択された注文がありません。');
      return;
    }

    if (!confirm(`${selectedOrders.size}件の注文のステータスを${getStatusLabel(newStatus)}に変更しますか？`)) {
      return;
    }

    try {
      // Admin APIを使用して一括変更（RLS回避）
      const { adminFetch } = await import('@/lib/auth-client');
      const response = await adminFetch('/api/admin/orders/bulk-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_ids: Array.from(selectedOrders),
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AdminOrdersClient] Bulk status update error:', errorText);
        throw new Error('一括ステータス変更失敗');
      }

      setSelectedOrders(new Set());
      fetchOrders();
      alert('一括ステータス変更が完了しました。');
    } catch (error) {
      console.error('一括ステータス変更失敗:', error);
      alert('一括ステータスの変更に失敗しました。');
    }
  };

  // 注文選択トグル
  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  };

  // 全選択トグル
  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(o => o.id)));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
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
              注文管理
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ようこそ、{authContext.userName}さん
            </p>
            {quotationFilter && (
              <p className="text-xs text-blue-600 mt-1">
                見積もりに関連する注文のみ表示中
              </p>
            )}
          </div>
          <div className="text-sm text-gray-500">
            総件数: {orders.length}
          </div>
        </div>

        {/* フィルター及び一括操作 */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* ステータスフィルター */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">ステータス:</label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                {Object.keys(ORDER_STATUS_LABELS).map((status) => (
                  <option key={status} value={status}>
                    {ORDER_STATUS_LABELS[status as OrderStatus].ja}
                  </option>
                ))}
              </select>
            </div>

            {/* 一括操作 */}
            {selectedOrders.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedOrders.size}件選択
                </span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      bulkUpdateStatus(e.target.value as OrderStatus);
                      e.target.value = '';
                    }
                  }}
                  value=""
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">一括変更...</option>
                  {Object.keys(ORDER_STATUS_LABELS).map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_LABELS[status as OrderStatus].ja}に変更
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 注文リストテーブル */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={selectedOrders.size === orders.length && orders.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  注文番号
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  顧客名
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ステータス
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  金額
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  作成日
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200" data-testid="admin-orders-list">
              {orders.map((order) => (
                <tr key={order.id} className={selectedOrders.has(order.id) ? 'bg-blue-50' : ''} data-testid="admin-order-row">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.id)}
                      onChange={() => toggleOrderSelection(order.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.customer_email}</div>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-full border'
                      )}
                    >
                      {Object.keys(ORDER_STATUS_LABELS).map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_LABELS[status as OrderStatus].ja}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    ¥{order.total_amount?.toLocaleString() || '0'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <a
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      詳細
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              注文がありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
