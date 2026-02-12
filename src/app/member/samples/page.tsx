/**
 * Sample Requests Page
 *
 * サンプル依頼一覧ページ
 * - サンプルで「処理中」「履歴」「再注文」を切り替え
 * - ステータス管理・検索・フィルタリング・ソート
 * - 進捗状況表示
 */
// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Badge, Button } from '@/components/ui';
import { PageLoadingState } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Eye } from 'lucide-react';
import type { DashboardSampleRequest, DashboardSampleRequestStatus, SampleItem } from '@/types/dashboard';

// =====================================================
// API Client Function
// =====================================================
async function fetchSampleRequests(status?: DashboardSampleRequestStatus): Promise<DashboardSampleRequest[]> {
  const params = await searchParams();
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
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
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Page Component
// =====================================================
export default async function SamplesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams();
  const [samples, setSamples] = useState<DashboardSampleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSample, setSelectedSample] = useState<DashboardSampleRequest | null>(null);

  const selectedStatus = (params.status as DashboardSampleRequestStatus | undefined) || undefined;

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

  return (
    <PageLoading isLoading={isLoading} error={null} message="読み込み中...">
      {samples.length === 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
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
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-text-primary">サンプル依頼</h1>
            <p className="text-text-muted mt-1">サンプル依頼の一覧とステータス確認</p>
          </div>
          <Button variant="primary" onClick={() => (window.location.href = '/samples')}>
            <span className="mr-2">+</span>新規依頼
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statusFilterOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedStatus === option.value ? 'primary' : 'secondary'}
              onClick={() => {
                const url = new URL(window.location.href);
                if (selectedStatus === option.value) {
                  url.searchParams.delete('status');
                } else {
                  url.searchParams.set('status', option.value);
                }
                window.location.href = url.toString();
              }}
              className="mb-2"
            >
              {option.label}
            </Button>
          ))}
        </div>

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
              </div>
              <div className="text-right shrink-0">
                <Button variant="primary" onClick={() => setSelectedSample(sample)}>
                  <Eye className="w-4 h-4 mr-1" />
                  詳細を見る
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {sample.trackingNumber && (
          <div className="mt-4">
            <p className="text-sm text-text-muted">
              追跡番号: {sample.trackingNumber}
            </p>
          </div>
        )}

        {samples.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={() => (window.location.href = '/samples')}>
              <span className="mr-2">+</span>新規依頼
            </Button>
          </div>
        )}
      </div>

      {/* Sample Detail Modal */}
      {selectedSample && (
        <SampleDetailModal
          sample={selectedSample}
          onClose={() => setSelectedSample(null)}
        />
      )}
    </PageLoadingState>
  );
}
