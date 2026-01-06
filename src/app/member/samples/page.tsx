/**
 * Sample Requests Page
 *
 * サンプル依頼一覧ページ
 * - サンプル依頼一覧表示
 * - ステータス管理
 * - 詳細モーダル表示
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Eye } from 'lucide-react';
import type { DashboardSampleRequest, DashboardSampleRequestStatus, SampleItem } from '@/types/dashboard';

// =====================================================
// API Client Function
// =====================================================

async function fetchSampleRequests(status?: DashboardSampleRequestStatus): Promise<DashboardSampleRequest[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);

  const response = await fetch(`/api/member/samples?${params.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'サンプル依頼の取得に失敗しました');
  }

  const result = await response.json();
  return result.data || [];
}

// =====================================================
// Constants
// =====================================================

const sampleStatusLabels: Record<DashboardSampleRequestStatus, string> = {
  received: '受付済',
  processing: '処理中',
  shipped: '発送済',
  delivered: '配送完了',
  cancelled: 'キャンセル',
};

const sampleStatusVariants: Record<DashboardSampleRequestStatus, 'info' | 'warning' | 'secondary' | 'success' | 'error'> = {
  received: 'info',
  processing: 'warning',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'error',
};

const statusFilterOptions = [
  { value: 'all', label: 'すべて' },
  { value: 'received', label: '受付済' },
  { value: 'processing', label: '処理中' },
  { value: 'shipped', label: '発送済' },
  { value: 'delivered', label: '配送完了' },
  { value: 'cancelled', label: 'キャンセル' },
];

// =====================================================
// Modal Component
// =====================================================

interface SampleDetailModalProps {
  sample: DashboardSampleRequest | null;
  onClose: () => void;
}

function SampleDetailModal({ sample, onClose }: SampleDetailModalProps) {
  if (!sample) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              サンプル依頼詳細
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Request Number & Status */}
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">依頼番号</p>
                <p className="font-medium text-gray-900 dark:text-white">{sample.requestNumber}</p>
              </div>
              <Badge variant={sampleStatusVariants[sample.status]} size="sm">
                {sampleStatusLabels[sample.status]}
              </Badge>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">依頼日</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(sample.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
              {sample.shippedAt && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">発送日</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(sample.shippedAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              )}
            </div>

            {/* Tracking Number */}
            {sample.trackingNumber && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">追跡番号</p>
                <p className="font-medium text-gray-900 dark:text-white">{sample.trackingNumber}</p>
              </div>
            )}

            {/* Sample Items */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">サンプル品目</p>
              <div className="space-y-2">
                {sample.samples.map((item: SampleItem, index: number) => (
                  <div key={item.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">カテゴリ: {item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">数量: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            {sample.deliveryAddress && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">配送先</p>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <p className="font-medium text-gray-900 dark:text-white">{sample.deliveryAddress.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    〒{sample.deliveryAddress.postalCode}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {sample.deliveryAddress.prefecture} {sample.deliveryAddress.city} {sample.deliveryAddress.address}
                  </p>
                  {sample.deliveryAddress.building && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {sample.deliveryAddress.building}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    電話: {sample.deliveryAddress.phone}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              閉じる
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Page Component
// =====================================================

export default function SamplesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const [samples, setSamples] = useState<DashboardSampleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSample, setSelectedSample] = useState<DashboardSampleRequest | null>(null);

  const selectedStatus = (searchParams.status as DashboardSampleRequestStatus | undefined) || undefined;

  // Fetch samples
  useEffect(() => {
    async function loadSamples() {
      setIsLoading(true);
      try {
        const data = await fetchSampleRequests(selectedStatus);
        setSamples(data);
      } catch (error) {
        console.error('Failed to fetch samples:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSamples();
  }, [selectedStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text-muted">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (samples.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">サンプル依頼</h1>
            <p className="text-text-muted mt-1">サンプル依頼の一覧とステータス確認</p>
          </div>
          <Button variant="primary" onClick={() => (window.location.href = '/samples')}>
            <span className="mr-2">+</span>新規依頼
          </Button>
        </div>

        <Card className="p-12 text-center">
          <p className="text-text-muted">
            {!selectedStatus
              ? 'サンプル依頼がありません'
              : statusFilterOptions.find((o) => o.value === selectedStatus)?.label + "の依頼はありません"}
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => (window.location.href = '/samples')}
          >
            サンプルを依頼する
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">サンプル依頼</h1>
          <p className="text-text-muted mt-1">サンプル依頼の一覧とステータス確認</p>
        </div>
        <Button variant="primary" onClick={() => (window.location.href = '/samples')}>
          <span className="mr-2">+</span>新規依頼
        </Button>
      </div>

      <div className="space-y-4">
        {samples.map((sample) => (
          <Card key={sample.id} className="p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-text-primary">
                    {sample.requestNumber}
                  </span>
                  <Badge variant={sampleStatusVariants[sample.status]} size="sm">
                    {sampleStatusLabels[sample.status]}
                  </Badge>
                </div>

                <div className="text-sm text-text-muted space-y-1 mb-3">
                  {sample.samples.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span>{item.productName}</span>
                      <span className="text-border-secondary">x{item.quantity}</span>
                    </div>
                  ))}
                  {sample.samples.length > 3 && (
                    <p className="text-text-muted">
                      他 {sample.samples.length - 3} 点
                    </p>
                  )}
                </div>

                {sample.trackingNumber && (
                  <p className="text-sm text-text-muted">
                    追跡番号: {sample.trackingNumber}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-text-muted mb-2">
                  {formatDistanceToNow(new Date(sample.createdAt), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </div>
                <Button variant="secondary" size="sm" onClick={() => setSelectedSample(sample)}>
                  <Eye className="w-4 h-4 mr-1" />
                  詳細を見る
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Sample Detail Modal */}
      {selectedSample && (
        <SampleDetailModal
          sample={selectedSample}
          onClose={() => setSelectedSample(null)}
        />
      )}
    </div>
  );
}
