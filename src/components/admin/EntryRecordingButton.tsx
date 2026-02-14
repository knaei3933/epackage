'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface EntryRecordingButtonProps {
  productId: string;
  productName: string;
  productCode: string;
  warehouseLocation: string;
  binLocation: string | null;
  onEntryRecorded?: () => void;
}

export function EntryRecordingButton({
  productId,
  productName,
  productCode,
  warehouseLocation,
  binLocation,
  onEntryRecorded,
}: EntryRecordingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [transactionType, setTransactionType] = useState<'receipt' | 'issue' | 'adjustment'>('receipt');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const transactionTypes = [
    { value: 'receipt', label: '入庫' },
    { value: 'issue', label: '出庫' },
    { value: 'adjustment', label: '調整' },
  ] as const;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const qty = parseInt(quantity);
      if (isNaN(qty) || qty <= 0) {
        throw new Error('有効な数量を入力してください');
      }

      const response = await fetch('/api/admin/inventory/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          productCode,
          warehouseLocation,
          binLocation,
          quantity: qty,
          transactionType,
          reason: reason || '手動入録',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '在庫入録に失敗しました');
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setQuantity('1');
        setReason('');
        onEntryRecorded?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="w-full"
      >
        入録
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            在庫入録
          </h3>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{productName}</p>
            <p className="text-xs text-gray-600">
              コード: {productCode}
            </p>
            <p className="text-xs text-gray-600">
              場所: {warehouseLocation}
              {binLocation && ` / ${binLocation}`}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">在庫を入録しました</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                入録タイプ
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {transactionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                数量
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="入録数量"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                理由
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="棚卸、破損、返品など"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                  setSuccess(false);
                  setQuantity('1');
                  setReason('');
                }}
                variant="outline"
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || success || !quantity || parseInt(quantity) <= 0}
                className="min-w-[100px]"
              >
                {loading ? '入録中...' : success ? '完了' : '入録'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
