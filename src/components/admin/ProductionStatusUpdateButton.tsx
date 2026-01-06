'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ProductionStage, StageStatus } from '@/types/production';

interface ProductionStatusUpdateButtonProps {
  jobId: string;
  currentStage: ProductionStage;
  currentStatus: StageStatus;
  onUpdate?: () => void;
}

export function ProductionStatusUpdateButton({
  jobId,
  currentStage,
  currentStatus,
  onUpdate,
}: ProductionStatusUpdateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ProductionStage>(currentStage);
  const [selectedStatus, setSelectedStatus] = useState<StageStatus>(currentStatus);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const stages: { value: ProductionStage; label: string }[] = [
    { value: 'data_received', label: 'データ受領' },
    { value: 'inspection', label: '検品' },
    { value: 'design', label: '設計' },
    { value: 'plate_making', label: '製版' },
    { value: 'printing', label: '印刷' },
    { value: 'surface_finishing', label: '表面加工' },
    { value: 'die_cutting', label: '打ち抜き' },
    { value: 'lamination', label: '貼り合わせ' },
    { value: 'final_inspection', label: '検品・出荷' },
  ];

  const statuses: { value: StageStatus; label: string }[] = [
    { value: 'pending', label: '待機中' },
    { value: 'in_progress', label: '進行中' },
    { value: 'completed', label: '完了' },
    { value: 'delayed', label: '遅延' },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/production/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          stage: selectedStage,
          status: selectedStatus,
          notes: notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'ステータス更新に失敗しました');
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setNotes('');
        onUpdate?.();
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
        ステータス更新
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            製造ステータス更新
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">ステータスを更新しました</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                製造ステージ
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value as ProductionStage)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {stages.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as StageStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メモ（任意）
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="変更理由や詳細を入力..."
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                  setSuccess(false);
                  setNotes('');
                }}
                variant="outline"
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || success}
                className="min-w-[100px]"
              >
                {loading ? '更新中...' : success ? '完了' : '更新'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
