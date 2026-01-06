'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { Card, Badge, Button } from '@/components/ui';
import { EntryRecordingButton } from '@/components/admin';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  warehouseLocation: string;
  binLocation: string | null;
  quantityOnHand: number;
  quantityAllocated: number;
  quantityAvailable: number;
  reorderPoint: number;
  maxStockLevel: number | null;
  needsReorder: boolean;
  updatedAt: string;
}

const TRANSACTION_TYPES: Record<string, string> = {
  'receipt': '入庫',
  'issue': '出庫',
  'adjustment': '調整',
  'transfer': '移動',
  'return': '返品',
  'production_in': '生産入庫',
  'production_out': '生産消費'
};

export default function InventoryManagementPage() {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [showReorderOnly, setShowReorderOnly] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);

  const { data: inventory, error, mutate } = useSWR(
    '/api/admin/inventory/items',
    fetcher,
    { refreshInterval: 30000 } // 30秒ごとに更新
  );

  // リアルタイム更新の購読
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory'
        },
        () => {
          mutate();
        }
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [supabase, mutate]);

  // inventory가 배열인지 확인 (에러 응답일 경우 대비)
  const inventoryArray = Array.isArray(inventory) ? inventory : [];
  const errorResponse = inventory && !Array.isArray(inventory) && 'error' in inventory
    ? (inventory as { error: string }).error
    : null;

  const filteredInventory = inventoryArray.filter((item: InventoryItem) => {
    const locationMatch = filterLocation === 'all' || item.warehouseLocation === filterLocation;
    const reorderMatch = !showReorderOnly || item.needsReorder;
    return locationMatch && reorderMatch;
  });

  const stats = {
    totalProducts: new Set(inventoryArray.map((i: InventoryItem) => i.productId)).size || 0,
    totalLocations: new Set(inventoryArray.map((i: InventoryItem) => i.warehouseLocation)).size || 0,
    reorderNeeded: inventoryArray.filter((i: InventoryItem) => i.needsReorder).length || 0,
    totalStock: inventoryArray.reduce((sum: number, i: InventoryItem) => sum + i.quantityOnHand, 0) || 0,
    allocatedStock: inventoryArray.reduce((sum: number, i: InventoryItem) => sum + i.quantityAllocated, 0) || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              在庫管理
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              倉庫別在庫の追跡・管理
            </p>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatsCard label="総製品数" value={stats.totalProducts} color="blue" />
          <StatsCard label="倉庫数" value={stats.totalLocations} color="gray" />
          <StatsCard label="発注必要" value={stats.reorderNeeded} color="red" />
          <StatsCard label="総在庫数" value={stats.totalStock.toLocaleString()} color="green" />
          <StatsCard label="引当数" value={stats.allocatedStock.toLocaleString()} color="yellow" />
        </div>

        {/* 在庫警告 */}
        {stats.reorderNeeded > 0 && (
          <Card className="border-red-200 bg-red-50">
            <div className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-medium text-red-900">
                    {stats.reorderNeeded}点の商品が発注ポイントを下回っています
                  </p>
                  <p className="text-sm text-red-700">
                    至急補充してください
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* フィルター */}
        <div className="flex gap-4 items-center">
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">すべての倉庫</option>
            <option value="MAIN">メイン倉庫</option>
            <option value="TOKYO">東京倉庫</option>
            <option value="OSAKA">大阪倉庫</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showReorderOnly}
              onChange={(e) => setShowReorderOnly(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">発注必要のみ表示</span>
          </label>
        </div>

        {/* 在庫リスト */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">在庫一覧</h2>
                <div className="space-y-3">
                  {filteredInventory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      在庫がありません
                    </div>
                  ) : (
                    filteredInventory.map((item: InventoryItem) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                          item.needsReorder ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{item.productName}</p>
                              {item.needsReorder && (
                                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                                  発注必要
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">コード: {item.productCode}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              倉庫: {item.warehouseLocation}
                              {item.binLocation && ` | ロケーション: ${item.binLocation}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {item.quantityAvailable}
                            </p>
                            <p className="text-xs text-gray-500">利用可能在庫</p>
                            <div className="text-xs text-gray-600 mt-1">
                              <span>手持ち: {item.quantityOnHand}</span>
                              <span className="ml-2">引当中: {item.quantityAllocated}</span>
                            </div>
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
            {selectedItem ? (
              <InventoryDetailPanel
                item={selectedItem}
                onUpdate={mutate}
                onAdjustment={() => setAdjustmentModalOpen(true)}
              />
            ) : (
              <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                在庫を選択してください
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 在庫調整モーダル */}
      {adjustmentModalOpen && selectedItem && (
        <InventoryAdjustmentModal
          item={selectedItem}
          onClose={() => setAdjustmentModalOpen(false)}
          onConfirmed={() => {
            setAdjustmentModalOpen(false);
            mutate();
          }}
        />
      )}
    </div>
  );
}

function StatsCard({ label, value, color }: { label: string; value: string | number; color: string }) {
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

function InventoryDetailPanel({
  item,
  onUpdate,
  onAdjustment
}: {
  item: InventoryItem;
  onUpdate: () => void;
  onAdjustment: () => void;
}) {
  const { data: history } = useSWR(
    `/api/admin/inventory/history/${item.productId}`,
    fetcher
  );

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{item.productName}</h3>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">製品コード</p>
            <p className="font-medium text-gray-900">{item.productCode}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">利用可能在庫</p>
              <p className="text-2xl font-bold text-gray-900">{item.quantityAvailable}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">発注ポイント</p>
              <p className={`font-medium ${item.quantityAvailable <= item.reorderPoint ? 'text-red-600' : 'text-gray-900'}`}>
                {item.reorderPoint}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
            <div>
              <p className="text-gray-500">手持ち在庫</p>
              <p className="font-medium text-gray-900">{item.quantityOnHand}</p>
            </div>
            <div>
              <p className="text-gray-500">引当中</p>
              <p className="font-medium text-yellow-600">{item.quantityAllocated}</p>
            </div>
            <div>
              <p className="text-gray-500">最大在庫</p>
              <p className="font-medium text-gray-900">{item.maxStockLevel || '---'}</p>
            </div>
            <div>
              <p className="text-gray-500">倉庫</p>
              <p className="font-medium text-gray-900">{item.warehouseLocation}</p>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <EntryRecordingButton
              productId={item.productId}
              productName={item.productName}
              productCode={item.productCode}
              warehouseLocation={item.warehouseLocation}
              binLocation={item.binLocation || undefined}
              onSuccess={onUpdate}
            />
            <Button className="w-full" onClick={onAdjustment}>
              在庫調整
            </Button>
            <Button className="w-full" variant="outline">
              移動履歴
            </Button>
          </div>

          {/* 最近の移動 */}
          {history && history.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-2">最近の移動</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.slice(0, 5).map((h: any) => (
                  <div key={h.id} className="text-xs p-2 bg-gray-50 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">{TRANSACTION_TYPES[h.transaction_type] || h.transaction_type}</span>
                      <span className={h.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                        {h.quantity > 0 ? '+' : ''}{h.quantity}
                      </span>
                    </div>
                    <p className="text-gray-500">{new Date(h.transaction_at).toLocaleDateString('ja-JP')}</p>
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

function InventoryAdjustmentModal({
  item,
  onClose,
  onConfirmed
}: {
  item: InventoryItem;
  onClose: () => void;
  onConfirmed: () => void;
}) {
  const [quantity, setQuantity] = useState('0');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryId: item.id,
          quantity: parseInt(quantity),
          reason: reason || '手動調整'
        })
      });

      if (response.ok) {
        onConfirmed();
      } else {
        alert('調整に失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">在庫調整</h3>

          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">{item.productName}</p>
              <p className="text-xs text-gray-500">
                現在在庫: {item.quantityAvailable}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                調整数量
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+で増加、-で減少"
              />
              <p className="text-xs text-gray-500 mt-1">
                例: +10 で増加、-5 で減少
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                理由
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="棚卸、破損、など"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button onClick={onClose} variant="outline" disabled={submitting}>
                キャンセル
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || !quantity}>
                {submitting ? '処理中...' : '調整実行'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
