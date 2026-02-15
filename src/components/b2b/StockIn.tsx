'use client';

/**
 * 入荷処理コンポーネント (Stock In Component)
 * 生産完了製品の入荷処理
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  Package,
  Save,
  Check,
  AlertCircle,
  Warehouse,
  Scale,
  Calendar,
  Camera
} from 'lucide-react';

interface StockInProps {
  orderId: string;
  onComplete?: () => void;
}

export default function StockInComponent({ orderId, onComplete }: StockInProps) {
  const [quantity, setQuantity] = useState<number>(0);
  const [warehouseLocation, setWarehouseLocation] = useState<string>('');
  const [qualityStatus, setQualityStatus] = useState<'PASSED' | 'FAILED' | 'REWORK'>('PASSED');
  const [qcNotes, setQcNotes] = useState<string>('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleStockIn = useCallback(async () => {
    if (quantity <= 0) {
      setStatus({ type: 'error', message: '数量を入力してください。' });
      return;
    }

    if (!warehouseLocation) {
      setStatus({ type: 'error', message: '倉庫の場所を入力してください。' });
      return;
    }

    setIsSaving(true);
    setStatus({ type: null, message: '' });

    try {
      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('quantity', quantity.toString());
      formData.append('warehouse_location', warehouseLocation);
      formData.append('quality_status', qualityStatus);
      formData.append('notes', qcNotes);

      if (photo) {
        formData.append('photo', photo);
      }

      const response = await fetch('/api/member/stock-in', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setStatus({ type: 'success', message: '入荷処理が完了しました。' });

        if (onComplete) {
          onComplete();
        }
      } else {
        setStatus({ type: 'error', message: result.error || '入荷処理中にエラーが発生しました。' });
      }
    } catch (error) {
      console.error('Stock in error:', error);
      setStatus({ type: 'error', message: '入荷処理中にエラーが発生しました。' });
    } finally {
      setIsSaving(false);
    }
  }, [orderId, quantity, warehouseLocation, qualityStatus, qcNotes, photo, onComplete]);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Warehouse className="w-5 h-5" />
        入荷処理
      </h2>

      <div className="space-y-4">
        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Scale className="w-4 h-4 inline mr-1" />
            入荷数量
          </label>
          <Input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            placeholder="入荷する数量を入力してください"
          />
        </div>

        {/* Warehouse Location */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Package className="w-4 h-4 inline mr-1" />
            倉庫の場所
          </label>
          <Input
            type="text"
            value={warehouseLocation}
            onChange={(e) => setWarehouseLocation(e.target.value)}
            placeholder="例: A-01-03 (エリア-棚-列)"
          />
        </div>

        {/* Quality Status */}
        <div>
          <label className="block text-sm font-medium mb-2">品質検査結果</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="quality_status"
                value="PASSED"
                checked={qualityStatus === 'PASSED'}
                onChange={() => setQualityStatus('PASSED')}
                className="rounded"
              />
              <span>合格</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="quality_status"
                value="FAILED"
                checked={qualityStatus === 'FAILED'}
                onChange={() => setQualityStatus('FAILED')}
                className="rounded"
              />
              <span>不合格</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="quality_status"
                value="REWORK"
                checked={qualityStatus === 'REWORK'}
                onChange={() => setQualityStatus('REWORK')}
                className="rounded"
              />
              <span>再作業</span>
            </label>
          </div>
        </div>

        {/* QC Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">検査メモ</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg min-h-[80px]"
            placeholder="品質検査結果に関するメモ..."
            value={qcNotes}
            onChange={(e) => setQcNotes(e.target.value)}
          />
        </div>

        {/* Photo */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Camera className="w-4 h-4 inline mr-1" />
            入荷写真
          </label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
        </div>

        {/* Status Message */}
        {status.type && (
          <div className={`p-4 rounded-lg ${
            status.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {status.type === 'success' ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={status.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {status.message}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleStockIn}
            disabled={isSaving}
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            入荷完了
          </Button>
        </div>
      </div>
    </Card>
  );
}
