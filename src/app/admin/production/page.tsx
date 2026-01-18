'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { Card, Badge, Button } from '@/components/ui';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ProductionJob {
  id: string;
  jobNumber: string;
  jobName: string;
  jobType: string;
  status: string;
  progressPercentage: number;
  priority: number;
  orderNumber: string;
  customerName: string;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  actualStartAt: string | null;
  actualEndAt: string | null;
  assignedTo?: string;
  outputQuantity: number;
  rejectedQuantity: number;
}

// 9段階生産プロセス (production_orders テーブルのcurrent_stageと一致)
const PRODUCTION_STAGES = [
  { key: 'data_received', label: 'データ受領', icon: '📥' },
  { key: 'inspection', label: '検査', icon: '🔍' },
  { key: 'design', label: 'デザイン', icon: '🎨' },
  { key: 'plate_making', label: '版下作成', icon: '📐' },
  { key: 'printing', label: '印刷', icon: '🖨️' },
  { key: 'surface_finishing', label: '表面加工', icon: '✨' },
  { key: 'die_cutting', label: '抜き加工', icon: '✂️' },
  { key: 'lamination', label: 'ラミネート', icon: '🔲' },
  { key: 'final_inspection', label: '最終検査', icon: '✅' }
];

const STATUS_LABELS: Record<string, string> = {
  'pending': '待機',
  'scheduled': '予定済み',
  'in_progress': '進行中',
  'paused': '一時停止',
  'completed': '完了',
  'failed': '失敗',
  'cancelled': 'キャンセル'
};

export default function ProductionManagementPage() {
  const [selectedJob, setSelectedJob] = useState<ProductionJob | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const { data: jobs, error, mutate } = useSWR(
    '/api/admin/production/jobs',
    fetcher,
    { refreshInterval: 15000 } // 15秒ごとに更新
  );

  // リアルタイム更新の購読 (production_orders テーブル)
  useEffect(() => {
    const channel = supabase
      .channel('production_orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'production_orders'
        },
        () => {
          mutate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, mutate]);

  const filteredJobs = jobs?.filter((job: ProductionJob) => {
    const statusMatch = filterStatus === 'all' || job.status === filterStatus;
    const typeMatch = filterType === 'all' || job.jobType === filterType;
    return statusMatch && typeMatch;
  }) || [];

  const stats = {
    total: jobs?.length || 0,
    pending: jobs?.filter((j: ProductionJob) => j.status === 'pending').length || 0,
    inProgress: jobs?.filter((j: ProductionJob) => j.status === 'in_progress').length || 0,
    completed: jobs?.filter((j: ProductionJob) => j.status === 'completed').length || 0,
    failed: jobs?.filter((j: ProductionJob) => j.status === 'failed').length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              生産管理
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              9段階生産プロセスの追跡・管理
            </p>
          </div>
          <Button onClick={() => mutate()}>
            更新
          </Button>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatsCard label="総ジョブ数" value={stats.total} color="blue" />
          <StatsCard label="待機中" value={stats.pending} color="gray" />
          <StatsCard label="進行中" value={stats.inProgress} color="yellow" />
          <StatsCard label="完了" value={stats.completed} color="green" />
          <StatsCard label="失敗" value={stats.failed} color="red" />
        </div>

        {/* 生産プロセス概要 */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              生産プロセス（9段階）
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
              {PRODUCTION_STAGES.map((stage, index) => (
                <div key={stage.key} className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-xl mb-1">
                    {stage.icon}
                  </div>
                  <p className="text-xs font-medium text-gray-900">{index + 1}</p>
                  <p className="text-xs text-gray-600">{stage.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* フィルター */}
        <div className="flex gap-4 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">すべてのステータス</option>
            <option value="pending">待機</option>
            <option value="scheduled">予定済み</option>
            <option value="in_progress">進行中</option>
            <option value="paused">一時停止</option>
            <option value="completed">完了</option>
            <option value="failed">失敗</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">すべての工程</option>
            {PRODUCTION_STAGES.map(stage => (
              <option key={stage.key} value={stage.key}>{stage.label}</option>
            ))}
          </select>
        </div>

        {/* ジョブリスト */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">生産ジョブ一覧</h2>
                <div className="space-y-3">
                  {filteredJobs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      ジョブがありません
                    </div>
                  ) : (
                    filteredJobs.map((job: ProductionJob) => (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{job.jobNumber}</p>
                              <Badge variant={getStatusVariant(job.status)}>
                                {STATUS_LABELS[job.status] || job.status}
                              </Badge>
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                優先度: {job.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{job.jobName}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              注文: {job.orderNumber} | 顧客: {job.customerName}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="w-16 h-16 relative">
                              <svg className="w-16 h-16 transform -rotate-90">
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke="#e5e7eb"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke={getProgressColor(job.progressPercentage)}
                                  strokeWidth="4"
                                  fill="none"
                                  strokeDasharray={`${job.progressPercentage * 1.76} 176`}
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                {job.progressPercentage}%
                              </span>
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
            {selectedJob ? (
              <JobDetailPanel job={selectedJob} onUpdate={mutate} />
            ) : (
              <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                ジョブを選択してください
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, color }: { label: string; value: number; color: string }) {
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

function getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'completed': return 'success';
    case 'in_progress': return 'warning';
    case 'failed': return 'error';
    default: return 'default';
  }
}

function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#10b981';
  if (percentage >= 50) return '#3b82f6';
  if (percentage >= 25) return '#f59e0b';
  return '#ef4444';
}

function JobDetailPanel({ job, onUpdate }: { job: ProductionJob; onUpdate: () => void }) {
  const stageInfo = PRODUCTION_STAGES.find(s => s.key === job.jobType) || PRODUCTION_STAGES[8];

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{stageInfo.icon}</span>
          <h3 className="text-lg font-semibold text-gray-900">{job.jobName}</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">ジョブ番号</p>
            <p className="font-medium text-gray-900">{job.jobNumber}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">ステータス</p>
              <Badge variant={getStatusVariant(job.status)}>
                {STATUS_LABELS[job.status] || job.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500">優先度</p>
              <p className="font-medium text-gray-900">{job.priority}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">進捗</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${job.progressPercentage}%`,
                  backgroundColor: getProgressColor(job.progressPercentage)
                }}
              />
            </div>
            <p className="text-right text-sm text-gray-600 mt-1">{job.progressPercentage}%</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">生産数</p>
              <p className="font-medium text-gray-900">{job.outputQuantity} {job.outputQuantity > 0 ? 'pcs' : ''}</p>
            </div>
            <div>
              <p className="text-gray-500">不合格数</p>
              <p className="font-medium text-red-600">{job.rejectedQuantity}</p>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <Button className="w-full" variant="outline">
              詳細を表示
            </Button>
            {['pending', 'scheduled'].includes(job.status) && (
              <Button className="w-full">
                開始
              </Button>
            )}
            {job.status === 'in_progress' && (
              <>
                <Button className="w-full" variant="outline">
                  一時停止
                </Button>
                <Button className="w-full">
                  完了
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
