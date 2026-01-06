'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { OrderStatus, getStatusLabel, ORDER_STATUS_LABELS } from '@/types/order-status';
import { cn } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/SkeletonLoader';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  // 주문 목록 조회
  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('주문 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 주문 상태 변경
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // 목록 갱신
      fetchOrders();
      alert('주문 상태가 변경되었습니다.');
    } catch (error) {
      console.error('주문 상태 변경 실패:', error);
      alert('주문 상태 변경에 실패했습니다.');
    }
  };

  // 대량 상태 변경
  const bulkUpdateStatus = async (newStatus: OrderStatus) => {
    if (selectedOrders.size === 0) {
      alert('선택된 주문이 없습니다.');
      return;
    }

    if (!confirm(`${selectedOrders.size}개 주문의 상태를 ${getStatusLabel(newStatus)}(으)로 변경하시겠습니까?`)) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in('id', Array.from(selectedOrders));

      if (error) throw error;

      setSelectedOrders(new Set());
      fetchOrders();
      alert('대량 상태 변경이 완료되었습니다.');
    } catch (error) {
      console.error('대량 상태 변경 실패:', error);
      alert('대량 상태 변경에 실패했습니다.');
    }
  };

  // 주문 선택 토글
  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  };

  // 전체 선택 토글
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
        <TableSkeleton rows={10} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            注文管理
          </h1>
          <div className="text-sm text-gray-500">
            総件数: {orders.length}
          </div>
        </div>

        {/* 필터 및 대량 작업 */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* 상태 필터 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">ステータス:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
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

            {/* 대량 작업 */}
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

        {/* 주문 목록 테이블 */}
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
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className={selectedOrders.has(order.id) ? 'bg-blue-50' : ''}>
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
                        'px-3 py-1 text-xs font-medium rounded-full border',
                        ORDER_STATUS_LABELS[order.status].category === 'initial' && 'bg-gray-100 text-gray-800 border-gray-300',
                        ORDER_STATUS_LABELS[order.status].category === 'active' && 'bg-blue-100 text-blue-800 border-blue-300',
                        ORDER_STATUS_LABELS[order.status].category === 'production' && 'bg-purple-100 text-purple-800 border-purple-300',
                        ORDER_STATUS_LABELS[order.status].category === 'final' && 'bg-green-100 text-green-800 border-green-300',
                        ORDER_STATUS_LABELS[order.status].category === 'terminated' && 'bg-red-100 text-red-800 border-red-300'
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
