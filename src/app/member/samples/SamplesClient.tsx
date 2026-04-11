/**
 * Samples Page Client Component
 *
 * サンプル依頼一覧ページ - Client Component
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Badge, Button, PageLoadingState } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Eye } from 'lucide-react';
import type { DashboardSampleRequest, DashboardSampleRequestStatus } from '@/types/dashboard';
import { fetchSampleRequests } from '@/lib/api/member/samples';

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
          <div className="space-y-4">
            <div>
              <p className="text-sm text-text-muted">依頼番号</p>
              <p className="font-medium">{sample.requestNumber}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted">ステータス</p>
              <Badge variant={sampleStatusVariants[sample.status]} size="sm">
                {sampleStatusLabels[sample.status]}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-text-muted">サンプル品目</p>
              <ul className="mt-2 space-y-1">
                {sample.samples.map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <span>{item.productName}</span>
                    <span className="text-border-secondary">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
            {sample.createdAt && (
              <div>
                <p className="text-sm text-text-muted">依頼日時</p>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(sample.createdAt), { addSuffix: true, locale: ja })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Page Component
// =====================================================

interface SamplesClientProps {
  initialStatus?: DashboardSampleRequestStatus;
}

function SamplesPageContent({ initialStatus }: SamplesClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [samples, setSamples] = useState<DashboardSampleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSample, setSelectedSample] = useState<DashboardSampleRequest | null>(null);

  const selectedStatus = (searchParams.get('status') as DashboardSampleRequestStatus | undefined) || initialStatus;

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

  const handleStatusFilter = (statusValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (statusValue === 'all') {
      params.delete('status');
    } else {
      params.set('status', statusValue);
    }
    router.push(`/member/samples?${params.toString()}`);
  };

  return (
    <PageLoadingState isLoading={isLoading} error={null} message="読み込み中...">
      {samples.length === 0 ? (
        <>
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
          </div>
          <Card className="p-12 text-center">
            <p className="text-text-muted">
              {!selectedStatus
                ? 'サンプル依頼がありません'
                : statusFilterOptions.find((o) => o.value === selectedStatus)?.label + "の依頼はありません"}
            </p>
          </Card>
        </>
      ) : (
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {statusFilterOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedStatus === option.value ? 'primary' : 'secondary'}
                onClick={() => handleStatusFilter(option.value)}
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
        </div>
      )}

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

// Wrapper component with Suspense for useSearchParams
export function SamplesClient({ initialStatus }: SamplesClientProps) {
  return (
    <Suspense fallback={<PageLoadingState isLoading={true} message="読み込み中..." />}>
      <SamplesPageContent initialStatus={initialStatus} />
    </Suspense>
  );
}
