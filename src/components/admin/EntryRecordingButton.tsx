'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Calendar } from 'lucide-react';

interface EntryRecordingButtonProps {
  productId: string;
  productName: string;
  productCode: string;
  warehouseLocation?: string;
  binLocation?: string;
  onSuccess?: () => void;
}

export function EntryRecordingButton({
  productId,
  productName,
  productCode,
  warehouseLocation = 'MAIN',
  binLocation,
  onSuccess,
}: EntryRecordingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const quantityNum = parseInt(quantity);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        throw new Error('有効な数量を入力してください（0より大きい値）');
      }

      if (!referenceNumber.trim()) {
        throw new Error('参照番号を入力してください');
      }

      const response = await fetch('/api/admin/inventory/record-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          productName,
          productCode,
          quantity: quantityNum,
          warehouseLocation,
          binLocation,
          referenceNumber: referenceNumber.trim(),
          supplierName: supplierName.trim() || null,
          entryDate: entryDate || new Date().toISOString(),
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '入庫記録に失敗しました');
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuantity('');
    setReferenceNumber('');
    setSupplierName('');
    setEntryDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="w-full"
      >
        <Calendar className="w-4 h-4 mr-2" />
        入庫記録
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            入庫記録
          </h3>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{productName}</p>
            <p className="text-xs text-gray-600">
              コード: {productCode} | 倉庫: {warehouseLocation}
              {binLocation && ` | ロケーション: ${binLocation}`}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">入庫を記録しました</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  入庫数量 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                  min="1"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  入庫日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                参照番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="PO-2024-001, INV-12345, etc."
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                発注書番号、請求書番号、納品書番号など
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                サプライヤー名
              </label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="サプライヤーまたはベンダー名"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メモ
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="特記事項、検品結果、など"
                disabled={loading}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>記録内容:</strong><br />
                ・入庫数量を在庫に反映<br />
                ・入庫トランザクションを記録<br />
                ・参照番号とサプライヤー情報を保存
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                onClick={handleClose}
                variant="outline"
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  success ||
                  !quantity ||
                  !referenceNumber.trim() ||
                  parseInt(quantity) <= 0
                }
                className="min-w-[100px]"
              >
                {loading ? '記録中...' : success ? '完了' : '記録'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
