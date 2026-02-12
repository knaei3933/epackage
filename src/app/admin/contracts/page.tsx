'use client';

import { useState, useEffect, useMemo } from 'react';

import useSWR from 'swr';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { ContractWorkflowList } from '@/components/admin/contract-workflow/ContractWorkflowList';
import { ContractTimeline } from '@/components/admin/contract-workflow/ContractTimeline';
import { ContractReminderModal } from '@/components/admin/contract-workflow/ContractReminderModal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Contract {
  id: string;
  contractNumber: string;
  orderId: string;
  customerName: string;
  customerEmail?: string;
  status: 'DRAFT' | 'SENT' | 'PENDING_SIGNATURE' | 'CUSTOMER_SIGNED' | 'ADMIN_SIGNED' | 'SIGNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  sentAt: string | null;
  customerSignedAt: string | null;
  adminSignedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export default function ContractWorkflowPage() {
  const { supabase } = useSupabaseClient();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const { data: contracts, mutate } = useSWR(
    `/api/admin/contracts/workflow?page=${page}&page_size=${pageSize}`,
    fetcher,
    { refreshInterval: 10000 } // 10秒ごとに更新
  );

  // リアルタイム更新の購読
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('contracts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contracts'
        },
        () => {
          mutate(); // データを再取得
        }
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [supabase, mutate]);

  // contractsが配列か確認 (エラー応答の場合に備え)
  const contractsArray = Array.isArray(contracts) ? contracts : [];
  const paginationData = (contracts as any)?.pagination;
  const totalContracts = paginationData?.total || contractsArray.length;

  const filteredContracts = contractsArray.filter((c: Contract) =>
    filterStatus === 'all' || c.status === filterStatus
  );

  const stats = useMemo(() => ({
    total: totalContracts || 0,
    draft: contractsArray.filter((c: Contract) => c.status === 'DRAFT').length || 0,
    sent: contractsArray.filter((c: Contract) => c.status === 'SENT').length || 0,
    pending: contractsArray.filter((c: Contract) => ['PENDING_SIGNATURE', 'CUSTOMER_SIGNED', 'ADMIN_SIGNED'].includes(c.status)).length || 0,
    signed: contractsArray.filter((c: Contract) => c.status === 'SIGNED').length || 0,
    active: contractsArray.filter((c: Contract) => c.status === 'ACTIVE').length || 0,
  }), [contractsArray, totalContracts]);

  // Calculate expiring contracts safely (avoid Date.now() in render)
  const expiringSoonCount = useMemo(() => {
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return contractsArray.filter((c: Contract) => {
      if (!c.expiresAt || c.status === 'SIGNED' || c.status === 'ACTIVE') return false;
      return new Date(c.expiresAt) < sevenDaysFromNow;
    }).length || 0;
  }, [contractsArray]);

  // Reset page when filter changes
  const handleFilterChange = (newStatus: string) => {
    setFilterStatus(newStatus);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              契約ワークフロー管理
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              契約書の送付から署名完了までの追跡・管理
            </p>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatsCard label="総契約数" value={stats.total} color="blue" />
          <StatsCard label="下書き" value={stats.draft} color="gray" />
          <StatsCard label="送付済み" value={stats.sent} color="yellow" />
          <StatsCard label="署名待ち" value={stats.pending} color="orange" />
          <StatsCard label="署名済み" value={stats.signed} color="green" />
          <StatsCard label="有効中" value={stats.active} color="blue" />
          <StatsCard
            label="期限切れリスク"
            value={expiringSoonCount}
            color="red"
          />
        </div>

        {/* フィルターとアクション */}
        <div className="flex gap-4 items-center">
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">すべてのステータス</option>
            <option value="DRAFT">下書き</option>
            <option value="SENT">送付済み</option>
            <option value="PENDING_SIGNATURE">署名待ち</option>
            <option value="CUSTOMER_SIGNED">顧客署名済み</option>
            <option value="ADMIN_SIGNED">管理者署名済み</option>
            <option value="SIGNED">署名済み</option>
            <option value="ACTIVE">有効中</option>
            <option value="COMPLETED">完了</option>
          </select>
        </div>

        {/* Pagination */}
        {totalContracts > pageSize && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              前へ
            </button>
            <span className="text-sm text-gray-600">
              {page} / {Math.ceil(totalContracts / pageSize)} ページ (全{totalContracts}件)
            </span>
            <button
              onClick={() => setPage((p) => Math.min(Math.ceil(totalContracts / pageSize), p + 1))}
              disabled={page >= Math.ceil(totalContracts / pageSize)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
            </button>
          </div>
        )}

        {/* 契約リスト */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ContractWorkflowList
              contracts={filteredContracts}
              onSelectContract={setSelectedContract}
              onRefresh={mutate}
            />
          </div>

          {/* 詳細パネル */}
          <div className="lg:col-span-1">
            {selectedContract ? (
              <ContractTimeline
                contract={selectedContract}
                onSendReminder={() => setReminderModalOpen(true)}
              />
            ) : (
              <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                契約を選択してください
              </div>
            )}
          </div>
        </div>
      </div>

      {/* リマインダーモーダル */}
      {reminderModalOpen && selectedContract && (
        <ContractReminderModal
          contract={selectedContract}
          onClose={() => setReminderModalOpen(false)}
          onSent={() => {
            setReminderModalOpen(false);
            mutate();
          }}
        />
      )}
    </div>
  );
}

function StatsCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
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
