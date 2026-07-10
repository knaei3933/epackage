/**
 * Shipments Management Page
 * Admin interface for managing all shipments
 */

'use client';

import { useToastContext } from '@/components/ui/Toast';

import { useState, useEffect } from 'react';

import { Plus, Search, Filter, Download, RefreshCw, Package } from 'lucide-react';

import { Button } from '@/components/ui/Button';

import { Input } from '@/components/ui/Input';

import { Select } from '@/components/ui/Select';

import { ShipmentCard } from '@/components/admin/ShipmentCard';

import { ShipmentCreateModal } from '@/components/admin/ShipmentCreateModal';

import { ShipmentEditModal } from '@/components/admin/ShipmentEditModal';
import { ShipmentDetailDialog } from './parts/ShipmentDetailDialog';

import { TrackingTimeline } from '@/components/admin/TrackingTimeline';

import { Edit3 } from 'lucide-react';

import { fetchShipments as fetchShipmentsAPI, createShipment as createShipmentAPI, trackShipment as trackShipmentAPI, updateShipment as updateShipmentAPI, fetchShipmentById as fetchShipmentByIdAPI, fetchReadyOrders as fetchReadyOrdersAPI, fetchShipmentLabelJson as fetchShipmentLabelJsonAPI } from '@/lib/api/admin/shipments';
import {
  Shipment,
  ShipmentStatus,
  CarrierType,
  SHIPMENT_STATUS_NAMES,
  CARRIER_NAMES,
} from '@/types/shipment';

type FilterState = {
  status: ShipmentStatus | 'all';
  carrier: CarrierType | 'all';
  search: string;
};

type TabType = 'shipments' | 'ready-orders';

export default function AdminShipmentsClient() {
  const [activeTab, setActiveTab] = useState<TabType>('shipments');
  const { showError, showSuccess } = useToastContext();
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    carrier: 'all',
    search: '',
  });

  // Shipments state
  const [shipments, setShipments] = useState<any[]>([]);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  // Ready orders state
  const [readyOrders, setReadyOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Detail modal state
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Fetch shipments
  const fetchShipments = async () => {
    setLoadingShipments(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.carrier !== 'all') params.append('carrier', filters.carrier);
      if (filters.search) params.append('search', filters.search);

      const data = await fetchShipmentsAPI({ page, limit: pageSize, status: filters.status !== 'all' ? filters.status : undefined }) as any;

      if (data.success) {
        setShipments(data.shipments);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    } finally {
      setLoadingShipments(false);
    }
  };

  // Fetch ready orders
  const fetchReadyOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchReadyOrdersAPI() as any;

      if (data.success) {
        setReadyOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch ready orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Refresh tracking for a shipment
  const refreshTracking = async (shipmentId: string) => {
    setRefreshingId(shipmentId);
    try {
      const data = await trackShipmentAPI(shipmentId, {}) as any;

      if (data.success) {
        // Refresh shipments list
        await fetchShipments();
      }
    } catch (error) {
      console.error('Failed to refresh tracking:', error);
      showError('追跡情報の更新に失敗しました');
    } finally {
      setRefreshingId(null);
    }
  };

  // Download shipping label
  const downloadLabel = async (shipmentId: string) => {
    try {
      const data = await fetchShipmentLabelJsonAPI(shipmentId) as any;

      if (data.success && data.label_data) {
        // Convert base64 to blob and download
        const byteCharacters = atob(data.label_data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shipping-label-${shipmentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download label:', error);
      showError('ラベルのダウンロードに失敗しました');
    }
  };

  // Create shipment
  const createShipment = async (data: any) => {
    try {
      const result = await createShipmentAPI(data) as any;

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create shipment');
      }

      // Refresh both lists
      await fetchShipments();
      await fetchReadyOrders();

      return result;
    } catch (error) {
      throw error;
    }
  };

  // Fetch shipment details
  const fetchShipmentDetails = async (shipmentId: string) => {
    try {
      const data = await fetchShipmentByIdAPI(shipmentId) as any;

      if (data.success) {
        setSelectedShipment(data.shipment);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch shipment details:', error);
    }
  };

  // Update shipment
  const updateShipment = async (shipmentId: string, data: any) => {
    try {
      const result = await updateShipmentAPI(shipmentId, data) as any;

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update shipment');
      }

      // Refresh shipments list and shipment details
      await fetchShipments();

      // Update selected shipment with new data
      if (selectedShipment?.id === shipmentId) {
        setSelectedShipment(result.shipment);
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  // Effects
  useEffect(() => {
    if (activeTab === 'shipments') {
      fetchShipments();
    } else {
      fetchReadyOrders();
    }
  }, [activeTab, page, filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">配送管理</h1>
              <p className="mt-1 text-sm text-gray-600">
                配送の作成、追跡、管理を行います
              </p>
            </div>
            {activeTab === 'ready-orders' && readyOrders.length > 0 && (
              <Button
                onClick={() => {
                  // Bulk create would be here
                  showError('一括作成機能は開発中です');
                }}
                variant="primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                一括作成
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => {
                  setActiveTab('shipments');
                  setPage(1);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'shipments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                配送一覧
                {shipments.length > 0 && (
                  <span className="ml-2 py-0.5 px-2 rounded-full bg-blue-100 text-blue-800 text-xs">
                    {total}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('ready-orders');
                  setPage(1);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'ready-orders'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                配送準備完了
                {readyOrders.length > 0 && (
                  <span className="ml-2 py-0.5 px-2 rounded-full bg-green-100 text-green-800 text-xs">
                    {readyOrders.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Filters */}
          {activeTab === 'shipments' && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="配送番号、お客様名で検索..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>

              <select
                className="w-full md:w-auto rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              >
                <option value="all">すべてのステータス</option>
                {Object.values(ShipmentStatus).map((status) => (
                  <option key={status} value={status}>
                    {SHIPMENT_STATUS_NAMES[status].ja}
                  </option>
                ))}
              </select>

              <select
                className="w-full md:w-auto rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filters.carrier}
                onChange={(e) => setFilters({ ...filters, carrier: e.target.value as any })}
              >
                <option value="all">すべての配送業者</option>
                {Object.values(CarrierType).map((carrier) => (
                  <option key={carrier} value={carrier}>
                    {CARRIER_NAMES[carrier].ja}
                  </option>
                ))}
              </select>

              <Button
                variant="secondary"
                onClick={() => setFilters({ status: 'all', carrier: 'all', search: '' })}
              >
                <Filter className="w-4 h-4 mr-2" />
                フィルターをクリア
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Shipments List */}
        {activeTab === 'shipments' && (
          <div>
            {loadingShipments ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                <p className="mt-2 text-gray-600">読み込み中...</p>
              </div>
            ) : shipments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">配送がありません</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                            配送番号
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                            注文番号
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                            お客様名
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                            配送業者
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                            追跡番号
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                            集荷予定
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                            配達予定
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                            配送先
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                            ステータス
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                            アクション
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {shipments.map((shipment) => (
                          <tr key={shipment.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium">{shipment.shipment_number}</td>
                            <td className="px-4 py-3 text-sm font-mono">{shipment.order?.order_number || '-'}</td>
                            <td className="px-4 py-3 text-sm">{shipment.order?.customer_name || '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              {CARRIER_NAMES[shipment.carrier as CarrierType]?.ja || shipment.carrier || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {shipment.tracking_number ? (
                                <a
                                  href={shipment.tracking_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-blue-600 hover:underline"
                                >
                                  {shipment.tracking_number}
                                </a>
                              ) : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {shipment.pickup_date ? new Date(shipment.pickup_date).toLocaleDateString('ja-JP') : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {shipment.estimated_delivery_date ? new Date(shipment.estimated_delivery_date).toLocaleDateString('ja-JP') : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                              {shipment.order?.delivery_address ?
                                `${shipment.order.delivery_address.prefecture} ${shipment.order.delivery_address.city}`
                                : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                shipment.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                shipment.status === 'in_transit' ? 'bg-purple-100 text-purple-800' :
                                shipment.status === 'out_for_delivery' ? 'bg-yellow-100 text-yellow-800' :
                                shipment.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {SHIPMENT_STATUS_NAMES[shipment.status as ShipmentStatus]?.ja || shipment.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => refreshTracking(shipment.id)}
                                  disabled={refreshingId === shipment.id}
                                  title="追跡更新"
                                >
                                  <RefreshCw className={`w-3 h-3 ${refreshingId === shipment.id ? 'animate-spin' : ''}`} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => fetchShipmentDetails(shipment.id)}
                                  title="詳細"
                                >
                                  詳細
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => downloadLabel(shipment.id)}
                                  title="ラベル"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {total > pageSize && (
                  <div className="mt-6 flex justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      前へ
                    </Button>
                    <span className="py-2 px-4 text-sm text-gray-600">
                      {page} / {Math.ceil(total / pageSize)}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))}
                      disabled={page >= Math.ceil(total / pageSize)}
                    >
                      次へ
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Ready Orders */}
        {activeTab === 'ready-orders' && (
          <div>
            {loadingOrders ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                <p className="mt-2 text-gray-600">読み込み中...</p>
              </div>
            ) : readyOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">配送準備が完了した注文はありません</p>
                <p className="text-sm text-gray-500 mt-2">
                  注文ステータスが「製造中(PRODUCTION)」の注文が表示されます
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          注文番号
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          お客様名
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          配送先
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          ステータス
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          作成日
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                          アクション
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {readyOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{order.order_number}</td>
                          <td className="px-4 py-3 text-sm">{order.customer_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {order.delivery_address?.prefecture} {order.delivery_address?.city}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              {order.status === 'READY_TO_SHIP' ? '出荷予定' : '製造中'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowCreateModal(true);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              配送作成
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Shipment Modal */}
      {showCreateModal && selectedOrder && (
        <ShipmentCreateModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onCreateShipment={createShipment}
        />
      )}

      {/* Shipment Detail Modal */}
      <ShipmentDetailDialog
        selectedShipment={selectedShipment}
        showDetailModal={showDetailModal}
        setShowDetailModal={setShowDetailModal}
        onEdit={(s) => { setSelectedShipment(s); setShowEditModal(true); }}
        setShowEditModal={setShowEditModal}
        setSelectedShipment={setSelectedShipment}
      />
      {/* Shipment Edit Modal */}
      {showEditModal && selectedShipment && (
        <ShipmentEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
          }}
          shipment={selectedShipment}
          onUpdateShipment={async (id, data) => {
            await updateShipment(id, data);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}
