'use client';

/**
 * Admin Quotations Client Component
 *
 * 見積管理ページ - Client Component
 * - Server Componentから認証コンテキストと初期データを受け取る
 * - UI/インタラクションを担当
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui';
import { EmailComposer } from '@/components/admin/EmailComposer';
import type { Recipient } from '@/components/admin/EmailComposer';
import {
  AdminQuotationFilters,
  AdminQuotationList,
  AdminQuotationStats,
  AdminQuotationPagination,
  AdminQuotationDetailPanel,
} from '@/components/admin/quotations';
import { normalizeStatus, STATUS_LABELS } from '@/components/admin/quotations/quotation-utils';
import type { Quotation } from '@/types/quotation';

import type { AdminAuthContext } from '@/types/admin';

interface AdminQuotationsClientProps {
  initialStatus: string;
}

/**
 * AdminQuotationsClient - メインの管理者用見積管理コンポーネント
 * 状態管理とデータフェッチ、コンポーネントの合成のみ担当
 */
function AdminQuotationsClientContent({ authContext, initialStatus }: AdminQuotationsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>(initialStatus);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [selectedCustomersForEmail, setSelectedCustomersForEmail] = useState<Recipient[]>([]);

  // Fetch quotations
  useEffect(() => {
    fetchQuotations();
  }, [filterStatus, page]);

  // URLパラメータから見積もりIDを取得して自動選択
  useEffect(() => {
    if (quotations.length > 0) {
      const selectedId = searchParams.get('selectedId');
      if (selectedId) {
        const found = quotations.find(q => q.id === selectedId);
        if (found) {
          setSelectedQuotation(found);
          console.log('[Auto-select] Selected quotation from URL param:', found.quotation_number);
        }
      } else if (!selectedQuotation && quotations.length > 0) {
        // URLパラメータがない場合、最初の見積もりを選択
        setSelectedQuotation(quotations[0]);
        console.log('[Auto-select] Selected first quotation:', quotations[0].quotation_number);
      }
    }
  }, [quotations]);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/quotations', window.location.origin);
      if (filterStatus !== 'all') {
        url.searchParams.set('status', filterStatus);
      }
      url.searchParams.set('page', page.toString());
      url.searchParams.set('page_size', pageSize.toString());

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        const normalizedQuotations = (result.quotations || []).map((q: any) => ({
          ...q,
          status: normalizeStatus(q.status),
        }));
        setQuotations(normalizedQuotations);
        setTotal(result.pagination?.total || 0);
      } else {
        throw new Error(result.error || 'Failed to fetch quotations');
      }
    } catch (error) {
      console.error('見積もりリスト取得失敗:', error);
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  // ステータスフィルター変更 - URLパラメータを更新
  const handleStatusChange = (newStatus: string) => {
    setFilterStatus(newStatus);
    setPage(1); // Reset to page 1 when status changes
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === 'all') {
      params.delete('status');
    } else {
      params.set('status', newStatus);
    }
    router.push(`/admin/quotations?${params.toString()}`);
  };

  // Approve quotation
  const approveQuotation = async (quotationId: string) => {
    try {
      const response = await fetch(`/api/admin/quotations?id=${quotationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      fetchQuotations();
      alert('見積もりを承認しました。');
    } catch (error) {
      console.error('見積もり承認失敗:', error);
      alert('見積もりの承認に失敗しました。');
    }
  };

  // Reject quotation
  const rejectQuotation = async (quotationId: string) => {
    try {
      const response = await fetch(`/api/admin/quotations?id=${quotationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      fetchQuotations();
      alert('見積もりを拒否しました。');
    } catch (error) {
      console.error('見積もり拒否失敗:', error);
      alert('見積もりの拒否に失敗しました。');
    }
  };

  // Handle send email
  const handleSendEmail = (quotation: Quotation) => {
    if (!quotation.customer_email) {
      alert('顧客のメールアドレスが登録されていません。');
      return;
    }

    const recipient: Recipient = {
      id: quotation.id,
      email: quotation.customer_email,
      name: quotation.company_name || quotation.customer_name,
    };

    setSelectedCustomersForEmail([recipient]);
    setEmailComposerOpen(true);
  };

  const stats = {
    total: total,
    draft: quotations.filter(q => q.status === 'DRAFT').length,
    sent: quotations.filter(q => q.status === 'SENT').length,
    approved: quotations.filter(q => q.status === 'APPROVED').length,
    rejected: quotations.filter(q => q.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              見積もり管理
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ようこそ、{authContext.userName}さん
            </p>
          </div>
        </div>

        {/* Statistics Summary */}
        <AdminQuotationStats stats={stats} />

        {/* Filters */}
        <AdminQuotationFilters
          filterStatus={filterStatus}
          onStatusChange={handleStatusChange}
          onRefresh={fetchQuotations}
        />

        {/* Quotations List & Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <AdminQuotationList
              quotations={quotations}
              selectedQuotation={selectedQuotation}
              onSelectQuotation={setSelectedQuotation}
              onSendEmail={handleSendEmail}
              statusLabels={STATUS_LABELS}
            />
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedQuotation ? (
              <AdminQuotationDetailPanel
                quotation={selectedQuotation}
                onApprove={() => approveQuotation(selectedQuotation.id)}
                onReject={() => rejectQuotation(selectedQuotation.id)}
                onUpdate={fetchQuotations}
                onSendEmail={() => handleSendEmail(selectedQuotation)}
              />
            ) : (
              <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                見積もりを選択してください
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <AdminQuotationPagination
          currentPage={page}
          totalPages={Math.ceil(total / pageSize)}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />

        {/* Email Composer */}
        {emailComposerOpen && (
          <EmailComposer
            open={emailComposerOpen}
            onOpenChange={(open) => {
              setEmailComposerOpen(open);
              if (!open) setSelectedCustomersForEmail([]);
            }}
            recipients={selectedCustomersForEmail}
          />
        )}
      </div>
    </div>
  );
}

export default function AdminQuotationsClient(props: AdminQuotationsClientProps) {
  return (
    <AdminQuotationsClientContent {...props} />
  );
}
