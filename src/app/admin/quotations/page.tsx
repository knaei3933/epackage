'use client';

/**
 * Admin Quotations Page
 *
 * Admin quotations management page for viewing and managing customer quotations
 * - List all quotations
 * - View quotation details
 * - Approve/Reject quotations
 * - Convert quotations to orders
 * - Japanese UI with proper styling
 *
 * Access: Admin only
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, Badge, Button } from '@/components/ui';

interface Quotation {
  id: string;
  quote_number: string;
  customer_name: string;
  customer_email: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'converted';
  total_amount: number;
  valid_until: string | null;
  created_at: string;
  items_count?: number;
}

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  'pending': { label: '保留中', variant: 'warning' },
  'approved': { label: '承認済み', variant: 'success' },
  'rejected': { label: '拒否', variant: 'error' },
  'expired': { label: '期限切れ', variant: 'default' },
  'converted': { label: '注文変換済み', variant: 'success' },
};

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Fetch quotations
  useEffect(() => {
    fetchQuotations();
  }, [filterStatus]);

  const fetchQuotations = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setQuotations(data || []);
    } catch (error) {
      console.error('見積もりリスト取得失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // Approve quotation
  const approveQuotation = async (quotationId: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('quotations')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', quotationId);

      if (error) throw error;
      fetchQuotations();
      alert('見積もりを承認しました。');
    } catch (error) {
      console.error('見積もり承認失敗:', error);
      alert('見積もりの承認に失敗しました。');
    }
  };

  // Reject quotation
  const rejectQuotation = async (quotationId: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('quotations')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', quotationId);

      if (error) throw error;
      fetchQuotations();
      alert('見積もりを拒否しました。');
    } catch (error) {
      console.error('見積もり拒否失敗:', error);
      alert('見積もりの拒否に失敗しました。');
    }
  };

  const stats = {
    total: quotations.length,
    pending: quotations.filter(q => q.status === 'pending').length,
    approved: quotations.filter(q => q.status === 'approved').length,
    rejected: quotations.filter(q => q.status === 'rejected').length,
    converted: quotations.filter(q => q.status === 'converted').length,
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
              顧客からの見積もり依頼の管理
            </p>
          </div>
          <Button onClick={() => fetchQuotations()}>
            更新
          </Button>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatsCard label="総見積数" value={stats.total} color="blue" />
          <StatsCard label="保留中" value={stats.pending} color="yellow" />
          <StatsCard label="承認済み" value={stats.approved} color="green" />
          <StatsCard label="拒否" value={stats.rejected} color="red" />
          <StatsCard label="変換済み" value={stats.converted} color="purple" />
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">すべてのステータス</option>
            <option value="pending">保留中</option>
            <option value="approved">承認済み</option>
            <option value="rejected">拒否</option>
            <option value="expired">期限切れ</option>
            <option value="converted">注文変換済み</option>
          </select>
        </div>

        {/* Quotations List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">見積もり一覧</h2>
                <div className="space-y-3">
                  {quotations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      見積もりがありません
                    </div>
                  ) : (
                    quotations.map((quotation) => (
                      <div
                        key={quotation.id}
                        onClick={() => setSelectedQuotation(quotation)}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{quotation.quote_number}</p>
                              <Badge variant={STATUS_LABELS[quotation.status]?.variant || 'default'}>
                                {STATUS_LABELS[quotation.status]?.label || quotation.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{quotation.customer_name}</p>
                            <p className="text-xs text-gray-500 mt-1">{quotation.customer_email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ¥{quotation.total_amount?.toLocaleString() || '0'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(quotation.created_at).toLocaleDateString('ja-JP')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedQuotation ? (
              <QuotationDetailPanel
                quotation={selectedQuotation}
                onApprove={() => approveQuotation(selectedQuotation.id)}
                onReject={() => rejectQuotation(selectedQuotation.id)}
                onUpdate={() => fetchQuotations()}
              />
            ) : (
              <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                見積もりを選択してください
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
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[color as keyof typeof colors]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function QuotationDetailPanel({
  quotation,
  onApprove,
  onReject,
  onUpdate,
}: {
  quotation: Quotation;
  onApprove: () => void;
  onReject: () => void;
  onUpdate: () => void;
}) {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{quotation.quote_number}</h3>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">見積もり番号</p>
            <p className="font-medium text-gray-900">{quotation.quote_number}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">ステータス</p>
              <Badge variant={STATUS_LABELS[quotation.status]?.variant || 'default'}>
                {STATUS_LABELS[quotation.status]?.label || quotation.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500">金額</p>
              <p className="font-medium text-gray-900">
                ¥{quotation.total_amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500">顧客名</p>
            <p className="font-medium text-gray-900">{quotation.customer_name}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">メールアドレス</p>
            <p className="font-medium text-gray-900 text-sm">{quotation.customer_email}</p>
          </div>

          {quotation.valid_until && (
            <div>
              <p className="text-xs text-gray-500">有効期限</p>
              <p className="font-medium text-gray-900">
                {new Date(quotation.valid_until).toLocaleDateString('ja-JP')}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500">作成日</p>
            <p className="font-medium text-gray-900">
              {new Date(quotation.created_at).toLocaleDateString('ja-JP')}
            </p>
          </div>

          <div className="pt-4 border-t space-y-2">
            {quotation.status === 'pending' && (
              <>
                <Button className="w-full" onClick={onApprove}>
                  承認
                </Button>
                <Button className="w-full" variant="destructive" onClick={onReject}>
                  拒否
                </Button>
              </>
            )}
            {quotation.status === 'approved' && (
              <Button className="w-full" variant="outline">
                注文に変換
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
