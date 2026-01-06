/**
 * Admin Production Detail Page
 *
 * 管理者製造詳細ページ
 *
 * Detailed view of a production job with:
 * - Production job details from production_orders table
 * - Current stage and status display
 * - Stage history/timeline
 * - Action buttons for stage advancement
 * - Japanese language UI
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { getProductionStages, PRODUCTION_STAGE_LABELS, STAGE_STATUS_LABELS } from '@/types/production';
import type { ProductionStage } from '@/types/production';

// =====================================================
// Types
// =====================================================

interface ProductionJob {
  id: string;
  order_id: string;
  current_stage: ProductionStage;
  stage_data: Record<string, any>;
  started_at: string;
  estimated_completion_date: string | null;
  actual_completion_date: string | null;
  progress_percentage: number;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface OrderDetails {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
}

interface StageAction {
  id: string;
  production_order_id: string;
  stage: ProductionStage;
  action: string;
  performed_by: string;
  performed_at: string;
  notes: string | null;
}

// =====================================================
// Main Component
// =====================================================

interface ProductionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductionDetailPage({ params }: ProductionDetailPageProps) {
  const [jobId, setJobId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productionJob, setProductionJob] = useState<ProductionJob | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [stageHistory, setStageHistory] = useState<StageAction[]>([]);
  const [selectedStage, setSelectedStage] = useState<ProductionStage | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setJobId(id);
      fetchProductionData(id);
    });
  }, [params]);

  const fetchProductionData = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch production job details using MCP would be here
      // For now, we'll use the API route
      const response = await fetch(`/api/admin/production-jobs/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch production job');
      }

      const data = await response.json();
      setProductionJob(data.productionJob);
      setOrderDetails(data.orderDetails);
      setStageHistory(data.stageHistory || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load production data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStage = async () => {
    if (!productionJob) return;

    try {
      const response = await fetch(`/api/admin/production-jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance' }),
      });

      if (response.ok) {
        fetchProductionData(jobId);
      }
    } catch (err) {
      console.error('Failed to advance stage:', err);
    }
  };

  const handleRollbackStage = async () => {
    if (!productionJob) return;

    const reason = prompt('ロールバックの理由を入力してください:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/admin/production-jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rollback', reason }),
      });

      if (response.ok) {
        fetchProductionData(jobId);
      }
    } catch (err) {
      console.error('Failed to rollback stage:', err);
    }
  };

  // =====================================================
  // Loading State
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </Card>
      </div>
    );
  }

  // =====================================================
  // Error State
  // =====================================================

  if (error || !productionJob) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <div className="p-12 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">エラー</h2>
            <p className="text-gray-600 mb-6">{error || '製造ジョブが見つかりません'}</p>
            <Button onClick={() => window.history.back()}>戻る</Button>
          </div>
        </Card>
      </div>
    );
  }

  // =====================================================
  // Main Render
  // =====================================================

  const currentStageLabel = PRODUCTION_STAGE_LABELS[productionJob.current_stage];
  const stages = getProductionStages();
  const currentStageIndex = stages.indexOf(productionJob.current_stage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    製造詳細
                  </h1>
                  <Badge className={getPriorityBadgeClass(productionJob.priority)}>
                    {productionJob.priority.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  注文番号: {orderDetails?.order_number || jobId.substring(0, 8)}
                </p>
              </div>
            </div>
            <Button onClick={() => fetchProductionData(jobId)}>
              更新
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Progress Overview */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              製造進捗 (9段階)
            </h2>
            <ProductionProgressVisualizer
              currentStage={productionJob.current_stage}
              stageData={productionJob.stage_data}
              onStageClick={setSelectedStage}
            />
          </div>
        </Card>

        {/* Order Summary */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              注文サマリー
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">注文番号</p>
                <p className="font-medium text-gray-900">{orderDetails?.order_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">顧客名</p>
                <p className="font-medium text-gray-900">{orderDetails?.customer_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">メールアドレス</p>
                <p className="font-medium text-gray-900 text-sm">{orderDetails?.customer_email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">開始日</p>
                <p className="font-medium text-gray-900">
                  {new Date(productionJob.started_at).toLocaleDateString('ja-JP')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">予定完了日</p>
                <p className="font-medium text-gray-900">
                  {productionJob.estimated_completion_date
                    ? new Date(productionJob.estimated_completion_date).toLocaleDateString('ja-JP')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">進捗率</p>
                <p className="font-medium text-blue-600">{productionJob.progress_percentage}%</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Stage Detail */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                現在のステージ
              </h2>
              <div className="flex gap-2">
                {currentStageIndex > 0 && (
                  <Button variant="outline" onClick={handleRollbackStage}>
                    前に戻る
                  </Button>
                )}
                {currentStageIndex < stages.length - 1 && (
                  <Button onClick={handleAdvanceStage}>
                    次へ進む
                  </Button>
                )}
              </div>
            </div>

            <CurrentStagePanel
              stage={productionJob.current_stage}
              stageData={productionJob.stage_data[productionJob.current_stage]}
            />
          </div>
        </Card>

        {/* Stage History Timeline */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ステージ履歴
            </h2>
            <StageTimeline
              history={stageHistory}
              currentStage={productionJob.current_stage}
            />
          </div>
        </Card>

        {/* All Stages Overview */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              全ステージ一覧
            </h2>
            <AllStagesGrid
              stageData={productionJob.stage_data}
              currentStage={productionJob.current_stage}
              onStageClick={setSelectedStage}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

// =====================================================
// Sub-Components
// =====================================================

function ProductionProgressVisualizer({
  currentStage,
  stageData,
  onStageClick,
}: {
  currentStage: ProductionStage;
  stageData: Record<string, any>;
  onStageClick: (stage: ProductionStage) => void;
}) {
  const stages = getProductionStages();
  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="flex items-center justify-between">
      {stages.map((stage, index) => {
        const stageLabel = PRODUCTION_STAGE_LABELS[stage];
        const stageInfo = stageData[stage] || {};
        const status = stageInfo.status || 'pending';
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <div key={stage} className="flex-1 flex flex-col items-center">
            {/* Stage Icon */}
            <button
              onClick={() => onStageClick(stage)}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 transition-all
                ${isCompleted ? 'bg-green-500 text-white' : ''}
                ${isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-200' : ''}
                ${isPending ? 'bg-gray-200 text-gray-500' : ''}
                hover:scale-110 cursor-pointer
              `}
            >
              {stageLabel.icon}
            </button>

            {/* Stage Label */}
            <div className="text-center">
              <p className={`text-xs font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-600'}`}>
                {stageLabel.ja}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stageLabel.stepNumber}
              </p>
            </div>

            {/* Connector Line (except last) */}
            {index < stages.length - 1 && (
              <div className="absolute left-1/2 top-6 w-full h-1 -translate-y-1/2" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CurrentStagePanel({
  stage,
  stageData,
}: {
  stage: ProductionStage;
  stageData: any;
}) {
  const stageLabel = PRODUCTION_STAGE_LABELS[stage];
  const statusLabel = STAGE_STATUS_LABELS[stageData?.status || 'pending'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-5xl">{stageLabel.icon}</span>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {stageLabel.ja}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={statusLabel.bgColor}>
              {statusLabel.ja}
            </Badge>
            <span className="text-sm text-gray-600">
              ステップ {stageLabel.stepNumber} / 9
            </span>
          </div>
        </div>
      </div>

      {stageData?.notes && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">メモ</h4>
          <p className="text-sm text-gray-700">{stageData.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">開始日時</p>
          <p className="text-sm font-medium text-gray-900">
            {stageData?.started_at
              ? new Date(stageData.started_at).toLocaleString('ja-JP')
              : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">完了日時</p>
          <p className="text-sm font-medium text-gray-900">
            {stageData?.completed_at
              ? new Date(stageData.completed_at).toLocaleString('ja-JP')
              : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}

function StageTimeline({
  history,
  currentStage,
}: {
  history: StageAction[];
  currentStage: ProductionStage;
}) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        履歴はありません
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {history.map((action, index) => {
        const stageLabel = PRODUCTION_STAGE_LABELS[action.stage];
        const isLast = index === history.length - 1;

        return (
          <div key={action.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              {!isLast && <div className="w-0.5 h-full bg-gray-200 min-h-[40px]" />}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{stageLabel.icon}</span>
                  <p className="font-medium text-gray-900">{getActionLabel(action.action)}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(action.performed_at).toLocaleString('ja-JP')}
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                ステージ: {stageLabel.ja}
              </p>
              {action.notes && (
                <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                  {action.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AllStagesGrid({
  stageData,
  currentStage,
  onStageClick,
}: {
  stageData: Record<string, any>;
  currentStage: ProductionStage;
  onStageClick: (stage: ProductionStage) => void;
}) {
  const stages = getProductionStages();
  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stages.map((stage) => {
        const stageLabel = PRODUCTION_STAGE_LABELS[stage];
        const stageIndex = stages.indexOf(stage);
        const stageInfo = stageData[stage] || {};
        const status = stageInfo.status || 'pending';
        const statusLabel = STAGE_STATUS_LABELS[status];
        const isCurrent = stageIndex === currentIndex;

        return (
          <button
            key={stage}
            onClick={() => onStageClick(stage)}
            className={`
              p-4 rounded-lg border-2 text-left transition-all hover:shadow-md
              ${isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
            `}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{stageLabel.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{stageLabel.ja}</p>
                <Badge size="sm" className={statusLabel.bgColor}>
                  {statusLabel.ja}
                </Badge>
              </div>
            </div>
            {stageInfo.notes && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                {stageInfo.notes}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

// =====================================================
// Helper Functions
// =====================================================

function getPriorityBadgeClass(priority: string): string {
  const classes: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700 hover:bg-red-200',
    high: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    normal: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    low: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  };
  return classes[priority] || classes.normal;
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    started: '開始',
    completed: '完了',
    paused: '一時停止',
    resumed: '再開',
    rolled_back: 'ロールバック',
    note_added: 'メモ追加',
    photo_uploaded: '写真アップロード',
    assigned: '担当者割り当て',
  };
  return labels[action] || action;
}

