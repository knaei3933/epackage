/**
 * B2B Contracts Management Page
 *
 * B2B契約管理ページ
 * - 契約書一覧表示（ステータス、署名状態、関連注文）
 * - 検索・フィルタ機能
 * - ページネーション
 * - はんこ（印鑑）表示
 * - PDFダウンロード・署名アクション
 * - 日本語UI
 * - レスポンシブデザイン
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  Button,
  Badge,
  Input,
  EmptyState,
  LoadingSpinner,
} from '@/components/ui';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  DollarSign,
  Filter,
  CheckCircle,
  Clock,
  PenTool,
  Send,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Stamp,
  User,
  Building2,
  Package,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

// =====================================================
// Types
// =====================================================

type ContractStatus =
  | 'DRAFT'
  | 'SENT'
  | 'CUSTOMER_SIGNED'
  | 'ADMIN_SIGNED'
  | 'SIGNED'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'CANCELLED';

interface Contract {
  id: string;
  contract_number: string;
  status: ContractStatus;
  order_id: string;
  quotation_id: string | null;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  currency: string;
  valid_from: string | null;
  valid_until: string | null;
  customer_signature_url: string | null;
  customer_signed_at: string | null;
  admin_signature_url: string | null;
  admin_signed_at: string | null;
  final_contract_url: string | null;
  sent_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
  // Related data from API
  orders?: {
    id: string;
    order_number: string;
    customer_name: string;
  };
  quotations?: {
    id: string;
    quotation_number: string;
  };
}

interface ContractListResponse {
  data: Contract[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// =====================================================
// Status Badge Component with Icons
// =====================================================

interface StatusConfig {
  color: string;
  label: string;
  icon: any;
  description: string;
}

function getStatusConfig(status: ContractStatus): StatusConfig {
  const configs: Record<ContractStatus, StatusConfig> = {
    DRAFT: {
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      label: '下書き',
      icon: FileText,
      description: '作成中',
    },
    SENT: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      label: '送付済',
      icon: Send,
      description: '顧客へ送付済み',
    },
    CUSTOMER_SIGNED: {
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      label: '顧客署名済',
      icon: PenTool,
      description: '顧客の署名完了',
    },
    ADMIN_SIGNED: {
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      label: '管理者署名済',
      icon: Stamp,
      description: '管理者署名完了',
    },
    SIGNED: {
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      label: '署名完了',
      icon: FileCheck,
      description: '双方署名完了',
    },
    ACTIVE: {
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      label: '有効',
      icon: CheckCircle,
      description: '契約有効期間中',
    },
    EXPIRED: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      label: '期限切れ',
      icon: AlertCircle,
      description: '契約期限切れ',
    },
    CANCELLED: {
      color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
      label: 'キャンセル',
      icon: AlertCircle,
      description: '契約キャンセル済',
    },
  };
  return configs[status] || configs.DRAFT;
}

function StatusBadge({ status }: { status: ContractStatus }) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    </div>
  );
}

// =====================================================
// Hanko (Stamp) Display Component
// =====================================================

interface HankoStampProps {
  signatureUrl: string | null;
  signedAt: string | null;
  label: string;
  isPending?: boolean;
}

function HankoStamp({
  signatureUrl,
  signedAt,
  label,
  isPending = false,
}: HankoStampProps) {
  if (isPending || !signatureUrl) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
        <Stamp className="w-8 h-8 text-gray-400" />
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-xs text-gray-400">未署名</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
      <div className="relative">
        {signatureUrl && (
          <img
            src={signatureUrl}
            alt={label}
            className="w-16 h-16 object-contain rounded-full border-2 border-red-600 shadow-md"
          />
        )}
        <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-green-600 bg-white rounded-full" />
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
      {signedAt && (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {new Date(signedAt).toLocaleDateString('ja-JP')}
        </span>
      )}
    </div>
  );
}

// =====================================================
// Contract Card Component
// =====================================================

interface ContractCardProps {
  contract: Contract;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onSign: (id: string) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

function ContractCard({
  contract,
  onView,
  onDownload,
  onSign,
  isExpanded = false,
  onToggle,
}: ContractCardProps) {
  const statusConfig = getStatusConfig(contract.status);

  const canSign = contract.status === 'SENT';
  const canDownload =
    contract.status !== 'DRAFT' && contract.final_contract_url !== null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Main Content */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Contract Info */}
          <div className="flex-1 min-w-0">
            {/* Contract Number & Status */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-bold text-text-primary">
                {contract.contract_number}
              </h3>
              <StatusBadge status={contract.status} />
            </div>

            {/* Customer Info */}
            <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
              <User className="w-4 h-4" />
              <span className="font-medium">{contract.customer_name}</span>
              <span className="text-gray-400">•</span>
              <span className="text-xs">{contract.customer_email}</span>
            </div>

            {/* Amount & Dates */}
            <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-text-primary">
                  {Number(contract.total_amount).toLocaleString()} {contract.currency}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted">
                <Calendar className="w-4 h-4" />
                <span>
                  作成: {new Date(contract.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
              {contract.valid_from && (
                <div className="flex items-center gap-1.5 text-text-muted">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>
                    効力: {new Date(contract.valid_from).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              )}
              {contract.valid_until && (
                <div className="flex items-center gap-1.5 text-text-muted">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>
                    有効期限: {new Date(contract.valid_until).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              )}
            </div>

            {/* Related Documents */}
            <div className="flex flex-wrap gap-2 text-xs">
              {contract.quotations && (
                <Link
                  href={`/b2b/quotations?search=${contract.quotations.quotation_number}`}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <FileText className="w-3 h-3" />
                  見積: {contract.quotations.quotation_number}
                </Link>
              )}
              {contract.orders && (
                <Link
                  href={`/b2b/orders?search=${contract.orders.order_number}`}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                >
                  <Package className="w-3 h-3" />
                  注文: {contract.orders.order_number}
                </Link>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(contract.id)}
              className="gap-1.5"
            >
              <Eye className="w-4 h-4" />
              詳細
            </Button>
            {canDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(contract.id)}
                className="gap-1.5"
              >
                <Download className="w-4 h-4" />
                PDF
              </Button>
            )}
            {canSign && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSign(contract.id)}
                className="gap-1.5"
              >
                <PenTool className="w-4 h-4" />
                署名する
              </Button>
            )}
            {onToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="gap-1.5"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {isExpanded ? '折りたたむ' : '署名状態'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Section: Signature Status */}
      {isExpanded && (
        <div className="border-t border-border-secondary bg-bg-secondary/30 p-6">
          <h4 className="text-sm font-semibold text-text-primary mb-4">
            署名状況 / Signature Status
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Signature */}
            <HankoStamp
              signatureUrl={contract.customer_signature_url}
              signedAt={contract.customer_signed_at}
              label="顧客署名"
              isPending={!contract.customer_signed_at}
            />

            {/* Admin Signature */}
            <HankoStamp
              signatureUrl={contract.admin_signature_url}
              signedAt={contract.admin_signed_at}
              label="管理者署名"
              isPending={!contract.admin_signed_at}
            />
          </div>

          {/* Signature Timeline */}
          {(contract.customer_signed_at || contract.admin_signed_at) && (
            <div className="mt-4 pt-4 border-t border-border-secondary">
              <div className="space-y-2 text-xs">
                {contract.sent_at && (
                  <div className="flex items-center gap-2 text-text-muted">
                    <Send className="w-3 h-3" />
                    <span>
                      送付: {new Date(contract.sent_at).toLocaleString('ja-JP')}
                    </span>
                  </div>
                )}
                {contract.customer_signed_at && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>
                      顧客署名: {new Date(contract.customer_signed_at).toLocaleString('ja-JP')}
                    </span>
                  </div>
                )}
                {contract.admin_signed_at && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>
                      管理者署名: {new Date(contract.admin_signed_at).toLocaleString('ja-JP')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// =====================================================
// Main Page Component
// =====================================================

export default function B2BContractsPage() {
  const router = useRouter();

  // State
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);

  // Fetch contracts via API
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (filterStatus !== 'ALL') {
        params.set('status', filterStatus);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery);
      }
      params.set('limit', String(limit));
      params.set('offset', String((page - 1) * limit));

      const response = await fetch(`/api/b2b/contracts?${params}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/b2b/login?redirect=/b2b/contracts');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch contracts');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch contracts');
      }

      // Transform API response to match our interface
      const transformedContracts: Contract[] = (result.data || []).map((item: any) => ({
        ...item,
        customer_email: item.customer_email || '',
        currency: item.currency || 'JPY',
      }));

      setContracts(transformedContracts);
      setTotal(result.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError(err instanceof Error ? err.message : '契約データの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, searchQuery, router, limit]);

  // Initial fetch
  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Handle view
  const handleView = (contractId: string) => {
    router.push(`/b2b/contracts/${contractId}`);
  };

  // Handle download
  const handleDownload = async (contractId: string) => {
    try {
      const contract = contracts.find((c) => c.id === contractId);
      if (!contract?.final_contract_url) {
        alert('PDFがまだ利用できません。');
        return;
      }

      // Download directly from storage URL
      const link = document.createElement('a');
      link.href = contract.final_contract_url;
      link.download = `契約書_${contract.contract_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading contract:', err);
      alert('契約書のダウンロードに失敗しました。');
    }
  };

  // Handle sign
  const handleSign = async (contractId: string) => {
    try {
      const contract = contracts.find((c) => c.id === contractId);
      if (!contract) return;

      if (!confirm(`契約書「${contract.contract_number}」に署名します。よろしいですか？`)) {
        return;
      }

      // Call API to sign
      const response = await fetch(`/api/b2b/contracts/${contractId}/sign`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '署名に失敗しました。');
      }

      alert('契約書に署名しました。');
      fetchContracts(); // Refresh list
    } catch (err) {
      console.error('Error signing contract:', err);
      alert(err instanceof Error ? err.message : '署名に失敗しました。');
    }
  };

  // Toggle expanded
  const toggleExpanded = (contractId: string) => {
    setExpandedContractId((prev) => (prev === contractId ? null : contractId));
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-border-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                契約管理
              </h1>
              <p className="mt-1 text-sm text-text-muted">
                すべての契約書を表示・管理できます
              </p>
            </div>
            <Link href="/b2b/dashboard">
              <Button variant="outline" size="sm">
                ダッシュボードへ戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <Input
                type="search"
                placeholder="契約番号、顧客名で検索..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-text-muted" />
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    'ALL',
                    'DRAFT',
                    'SENT',
                    'CUSTOMER_SIGNED',
                    'ADMIN_SIGNED',
                    'SIGNED',
                    'ACTIVE',
                    'EXPIRED',
                  ] as const
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === status
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-bg-tertiary text-text-muted hover:bg-bg-secondary'
                    }`}
                  >
                    {status === 'ALL'
                      ? 'すべて'
                      : getStatusConfig(status as ContractStatus).label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" label="契約データを読み込み中..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </Card>
        )}

        {/* Contracts List */}
        {!loading && !error && (
          <div className="space-y-4">
            {contracts.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="契約書がありません"
                description={
                  searchQuery || filterStatus !== 'ALL'
                    ? '検索条件に一致する契約書がありません。'
                    : '注文が作成されると契約書が生成されます。'
                }
              />
            ) : (
              <>
                <div className="text-sm text-text-muted mb-4">
                  全 {total} 件中 {Math.min((page - 1) * limit + 1, total)} -{' '}
                  {Math.min(page * limit, total)} 件を表示
                </div>
                {contracts.map((contract) => (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    onView={handleView}
                    onDownload={handleDownload}
                    onSign={handleSign}
                    isExpanded={expandedContractId === contract.id}
                    onToggle={() => toggleExpanded(contract.id)}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && total > limit && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-text-muted">
              全 {total} 件中 {Math.min((page - 1) * limit + 1, total)} -{' '}
              {Math.min(page * limit, total)} 件を表示
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                前へ
              </Button>
              <span className="text-sm text-text-muted px-2">
                ページ {page} / {Math.ceil(total / limit)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * limit >= total}
              >
                次へ
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Force dynamic rendering for this authenticated page
export const dynamic = 'force-dynamic';
