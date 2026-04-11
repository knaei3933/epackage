'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Mail,
  Download,
  Eye,
  Filter,
  X,
  Loader2,
  Check,
  AlertCircle,
  ChevronRight,
  Users,
  Calendar,
  Phone,
  Building2,
  FileText,
  Send,
  MoreVertical,
  Archive,
  Trash2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/types/portal';
import type { UserStatus, UserRole } from '@/types/auth';
import { EmailComposer, type Recipient } from '@/components/admin/EmailComposer';

// =====================================================
// Types
// =====================================================

interface Profile {
  id: string;
  email: string;
  kanji_last_name: string;
  kanji_first_name: string;
  kana_last_name: string;
  kana_first_name: string;
  corporate_phone: string | null;
  personal_phone: string | null;
  business_type: 'INDIVIDUAL' | 'CORPORATION' | 'SOLE_PROPRIETOR';
  company_name: string | null;
  legal_entity_number: string | null;
  position: string | null;
  department: string | null;
  company_url: string | null;
  product_category: string;
  acquisition_channel: string | null;
  postal_code: string | null;
  prefecture: string | null;
  city: string | null;
  street: string | null;
  building: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  // Statistics
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string | null;
  // Quotation information
  latestQuotation?: {
    id: string;
    quotation_number: string;
    status: string;
    total_amount: number;
    created_at: string;
  };
  totalQuotations?: number;
  pendingQuotations?: number;
}

interface CustomerFilters {
  status: UserStatus | 'ALL';
  search: string;
  registrationPeriod: 'all' | 'week' | 'month' | 'quarter' | 'year';
}

interface CustomerListResponse {
  success: boolean;
  data?: Profile[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

interface ContactHistory {
  id: string;
  type: 'email' | 'call' | 'note';
  subject?: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

interface QuotationItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications: any;
  notes: string | null;
}

interface CustomerQuotation {
  id: string;
  quotation_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  valid_until: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  notes: string | null;
  admin_notes: string | null;
  items?: QuotationItem[];
}

interface CustomerDetailResponse {
  success: boolean;
  data?: {
    customer: Profile;
    statistics: {
      totalOrders: number;
      totalSpent: number;
      lastOrderDate: string | null;
      totalQuotations: number;
      pendingQuotations: number;
    };
    recentOrders: any[];
    quotations: CustomerQuotation[];
    contactHistory: ContactHistory[];
  };
  error?: string;
}

// =====================================================
// Main Component
// =====================================================

export default function AdminCustomerManagementClient() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | 'ALL'>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'week' | 'month' | 'quarter' | 'year'>('all');
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [loadingCustomerDetail, setLoadingCustomerDetail] = useState(false);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetailResponse['data'] | null>(null);

  // Email Composer states
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [selectedCustomersForEmail, setSelectedCustomersForEmail] = useState<Recipient[]>([]);

  // Load customers
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchQuery,
        status: selectedStatus,
        period: selectedPeriod,
      });

      const response = await fetch(`/api/admin/customers/management?${params}`);
      const result: CustomerListResponse = await response.json();

      if (result.success && result.data) {
        setCustomers(result.data);
        setTotalItems(result.pagination?.total || 0);
        setTotalPages(result.pagination?.totalPages || 1);
      } else {
        showMessage('error', result.error || '顧客データの読み込みに失敗しました');
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      showMessage('error', '顧客データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedStatus, selectedPeriod]);

  // Load customer detail
  const loadCustomerDetail = async (customerId: string) => {
    setLoadingCustomerDetail(true);
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`);
      const result: CustomerDetailResponse = await response.json();

      if (result.success && result.data) {
        setCustomerDetail(result.data);
      } else {
        showMessage('error', result.error || '顧客詳細の読み込みに失敗しました');
      }
    } catch (error) {
      console.error('Failed to load customer detail:', error);
      showMessage('error', '顧客詳細の読み込みに失敗しました');
    } finally {
      setLoadingCustomerDetail(false);
    }
  };

  // Initial load and refresh on filter changes
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Bulk selection
  const toggleCustomerSelection = (customerId: string) => {
    const newSelection = new Set(selectedCustomers);
    if (newSelection.has(customerId)) {
      newSelection.delete(customerId);
    } else {
      newSelection.add(customerId);
    }
    setSelectedCustomers(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const toggleAllSelection = () => {
    if (selectedCustomers.size === customers.length) {
      setSelectedCustomers(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedCustomers(new Set(customers.map(c => c.id)));
      setShowBulkActions(true);
    }
  };

  // Email functionality
  const handleSendEmail = (customer?: Profile) => {
    let recipients: Recipient[] = [];

    if (customer) {
      // Single customer email
      recipients = [{
        id: customer.email,
        email: customer.email,
        name: customer.kanji_last_name && customer.kanji_first_name
          ? `${customer.kanji_last_name} ${customer.kanji_first_name}`
          : customer.company_name || undefined,
      }];
    } else if (selectedCustomers.size > 0) {
      // Bulk email
      recipients = customers
        .filter(c => selectedCustomers.has(c.id))
        .map(c => ({
          id: c.email,
          email: c.email,
          name: c.kanji_last_name && c.kanji_first_name
            ? `${c.kanji_last_name} ${c.kanji_first_name}`
            : c.company_name || undefined,
        }));
    }

    if (recipients.length > 0) {
      setSelectedCustomersForEmail(recipients);
      setEmailComposerOpen(true);
    }
  };

  const handleEmailSuccess = () => {
    showMessage('success', 'メールを送信しました');
    setSelectedCustomers(new Set());
    setShowBulkActions(false);
  };

  const handleEmailError = (error: string) => {
    showMessage('error', error);
  };

  // Export functionality
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const response = await fetch('/api/admin/customers/management/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerIds: Array.from(selectedCustomers),
          format,
          filters: {
            status: selectedStatus,
            search: searchQuery,
            period: selectedPeriod,
          },
        }),
      });

      if (response.ok) {
        // Download file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showMessage('success', `${format.toUpperCase()}形式でエクスポートしました`);
        setShowExportModal(false);
      } else {
        showMessage('error', 'エクスポートに失敗しました');
      }
    } catch (error) {
      console.error('Export error:', error);
      showMessage('error', 'エクスポートに失敗しました');
    }
  };

  // Open customer detail modal
  const openCustomerDetail = async (customer: Profile) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
    await loadCustomerDetail(customer.id);
  };

  // Status badge component
  const getStatusBadge = (status: UserStatus) => {
    const variants = {
      ACTIVE: { variant: 'success' as const, label: 'アクティブ' },
      PENDING: { variant: 'warning' as const, label: '承認待ち' },
      SUSPENDED: { variant: 'error' as const, label: '停止中' },
      DELETED: { variant: 'secondary' as const, label: '削除済み' },
    };

    const config = variants[status];
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  // Quotation status badge component
  const getQuotationStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'success' | 'warning' | 'error' | 'secondary' | 'info'; label: string }> = {
      'QUOTATION_PENDING': { variant: 'warning', label: '見積待ち' },
      'draft': { variant: 'secondary', label: '下書き' },
      'sent': { variant: 'info', label: '送信済み' },
      'pending': { variant: 'warning', label: '承認待ち' },
      'QUOTATION_APPROVED': { variant: 'success', label: '承認済み' },
      'approved': { variant: 'success', label: '承認済み' },
      'REJECTED': { variant: 'error', label: '拒否' },
      'rejected': { variant: 'error', label: '拒否' },
      'EXPIRED': { variant: 'secondary', label: '期限切れ' },
      'expired': { variant: 'secondary', label: '期限切れ' },
      'CONVERTED': { variant: 'info', label: '注文化済み' },
      'converted': { variant: 'info', label: '注文化済み' },
    };

    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  // Calculate stats
  const stats = useMemo(() => ({
    total: customers.length + totalItems - customers.length, // Approximate total
    active: customers.filter(c => c.status === 'ACTIVE').length,
    pending: customers.filter(c => c.status === 'PENDING').length,
    newThisMonth: customers.filter(c => {
      const daysAgo = Math.floor(
        (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysAgo <= 30;
    }).length,
  }), [customers, totalItems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                顧客管理
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                顧客情報の検索・管理・連絡
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddCustomerModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              顧客追加
            </motion.button>
          </div>
        </div>
      </div>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50"
          >
            <div className={cn(
              "px-6 py-4 rounded-lg shadow-lg border flex items-center gap-3",
              message.type === 'success'
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200"
            )}>
              {message.type === 'success' ? (
                <Check className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card variant="default" className="p-3 md:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">総顧客数</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                  {totalItems}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card variant="default" className="p-3 md:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">アクティブ</p>
                <p className="text-xl md:text-2xl font-bold text-green-600 mt-1">
                  {stats.active}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card variant="default" className="p-3 md:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">承認待ち</p>
                <p className="text-xl md:text-2xl font-bold text-yellow-600 mt-1">
                  {stats.pending}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card variant="default" className="p-3 md:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">今月新規</p>
                <p className="text-xl md:text-2xl font-bold text-blue-600 mt-1">
                  {stats.newThisMonth}
                </p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card variant="default" className="p-4 md:p-6 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="顧客検索... (名前、メール、会社名、電話番号)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
                className="w-full pl-10 md:pl-12 pr-10 md:pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                  className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
            </div>

            {/* Filter Chips - Scrollable on mobile */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600 flex-shrink-0">
                <Filter className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">ステータス:</span>
                <span className="sm:hidden">状態:</span>
              </div>
              {(['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'] as (UserStatus | 'ALL')[]).map((status) => (
                <button
                  key={status}
                  onClick={() => { setSelectedStatus(status); setCurrentPage(1); }}
                  className={cn(
                    "px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all flex-shrink-0",
                    selectedStatus === status
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {status === 'ALL' ? 'すべて' : status === 'ACTIVE' ? 'アクティブ' : status === 'PENDING' ? '承認待ち' : '停止中'}
                </button>
              ))}

              <div className="w-px h-4 md:h-6 bg-gray-300 mx-1 md:mx-2 flex-shrink-0" />

              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600 flex-shrink-0">
                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">期間:</span>
                <span className="sm:hidden">期間:</span>
              </div>
              {(['all', 'week', 'month', 'quarter', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => { setSelectedPeriod(period); setCurrentPage(1); }}
                  className={cn(
                    "px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all flex-shrink-0",
                    selectedPeriod === period
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {period === 'all' ? 'すべて' : period === 'week' ? '1週間' : period === 'month' ? '1ヶ月' : period === 'quarter' ? '3ヶ月' : '1年'}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {showBulkActions && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <input
                  type="checkbox"
                  checked={selectedCustomers.size === customers.length}
                  onChange={toggleAllSelection}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-blue-900">
                  {selectedCustomers.size}件選択中
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendEmail()}
                    className="px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 md:gap-2 text-xs md:text-sm"
                  >
                    <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">メール送信</span>
                    <span className="sm:hidden">メール</span>
                  </button>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="px-3 md:px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors flex items-center gap-1.5 md:gap-2 text-xs md:text-sm"
                  >
                    <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">エクスポート</span>
                    <span className="sm:hidden">出力</span>
                  </button>
                </div>
                <button
                  onClick={() => {
                    setSelectedCustomers(new Set());
                    setShowBulkActions(false);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Customer List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <Card variant="default" className="overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.size === customers.length && customers.length > 0}
                          onChange={toggleAllSelection}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        顧客名
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        会社名
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        メールアドレス
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        電話番号
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        登録日
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        注文数
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        見積情報
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {customers.map((customer, index) => (
                        <motion.tr
                          key={customer.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={cn(
                            "hover:bg-gray-50 transition-colors",
                            selectedCustomers.has(customer.id) && "bg-blue-50"
                          )}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedCustomers.has(customer.id)}
                              onChange={() => toggleCustomerSelection(customer.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                                {(customer.kanji_last_name || customer.email)[0]}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.kanji_last_name} {customer.kanji_first_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {customer.kana_last_name} {customer.kana_first_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-900">
                              {customer.company_name ? (
                                <>
                                  <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                                  {customer.company_name}
                                </>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                            {customer.position && (
                              <div className="text-xs text-gray-500 mt-1">{customer.position}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{customer.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {customer.corporate_phone || customer.personal_phone || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {formatDate(customer.created_at, 'ja')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.floor((Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24))}日前
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-medium">
                              {customer.totalOrders || 0}
                            </div>
                            <div className="text-xs text-gray-500">
                              ¥{(((customer.totalSpent || 0) / 10000).toFixed(1))}万
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {customer.latestQuotation ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <a
                                    href={`/admin/quotations?id=${customer.latestQuotation.id}`}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    {customer.latestQuotation.quotation_number}
                                  </a>
                                  {getQuotationStatusBadge(customer.latestQuotation.status)}
                                </div>
                                <div className="text-xs text-gray-600">
                                  ¥{(customer.latestQuotation.total_amount || 0).toLocaleString()}
                                </div>
                              </div>
                            ) : customer.totalQuotations && customer.totalQuotations > 0 ? (
                              <div className="text-sm text-gray-600">
                                {customer.totalQuotations}件の見積
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">-</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(customer.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openCustomerDetail(customer)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="詳細を表示"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSendEmail(customer)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="メール送信"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="その他"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination Desktop */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  全 {totalItems}件中 {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)}件を表示
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    前へ
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    次へ
                  </button>
                </div>
              </div>
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              <AnimatePresence>
                {customers.map((customer, index) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 active:shadow-md transition-shadow",
                      selectedCustomers.has(customer.id) && "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    )}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.has(customer.id)}
                        onChange={() => toggleCustomerSelection(customer.id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 text-sm">
                            {(customer.kanji_last_name || customer.email)[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-semibold text-gray-900 truncate">
                                {customer.kanji_last_name} {customer.kanji_first_name}
                              </h3>
                              {getStatusBadge(customer.status)}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {customer.kana_last_name} {customer.kana_first_name}
                            </p>
                          </div>
                        </div>
                        {customer.company_name && (
                          <div className="flex items-center text-xs text-gray-700 mb-1.5">
                            <Building2 className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-gray-400" />
                            <span className="truncate">{customer.company_name}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-900 mb-1 truncate">{customer.email}</div>
                        {customer.corporate_phone && (
                          <div className="flex items-center text-xs text-gray-600">
                            <Phone className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                            <span>{customer.corporate_phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-base font-bold text-gray-900">
                          {customer.totalOrders || 0}
                        </div>
                        <div className="text-[10px] text-gray-500">注文</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base font-bold text-green-600">
                          ¥{(((customer.totalSpent || 0) / 10000).toFixed(1))}万
                        </div>
                        <div className="text-[10px] text-gray-500">購入額</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base font-bold text-gray-600">
                          {Math.floor((Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="text-[10px] text-gray-500">日前</div>
                      </div>
                    </div>

                    {/* Quotation info */}
                    {customer.latestQuotation && (
                      <div className="mb-3 p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-1">
                          <a
                            href={`/admin/quotations?id=${customer.latestQuotation.id}`}
                            className="text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline"
                          >
                            {customer.latestQuotation.quotation_number}
                          </a>
                          {getQuotationStatusBadge(customer.latestQuotation.status)}
                        </div>
                        <div className="text-xs text-gray-700 font-medium">
                          ¥{(customer.latestQuotation.total_amount || 0).toLocaleString()}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleSendEmail(customer)}
                        className="flex-1 py-2.5 px-3 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 active:bg-green-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Mail className="w-4 h-4" />
                        メール
                      </button>
                      <button
                        onClick={() => openCustomerDetail(customer)}
                        className="flex-1 py-2.5 px-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        詳細
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

            {/* Pagination Mobile */}
            <div className="sticky bottom-0 bg-gray-50 px-3 py-2.5 rounded-lg shadow-lg border border-gray-200 flex items-center justify-between mt-4">
              <div className="text-xs text-gray-600 font-medium">
                {(() => {
                  const start = ((currentPage - 1) * itemsPerPage) + 1;
                  const end = Math.min(currentPage * itemsPerPage, totalItems);
                  return `${start}-${end} / ${totalItems}`;
                })()}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[72px]"
                >
                  前へ
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[72px]"
                >
                  次へ
                </button>
              </div>
            </div>
            </div>
          </>
        )}
      </div>

      {/* Customer Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={(open) => {
        setShowDetailModal(open);
        if (!open) {
          setCustomerDetail(null);
          setSelectedCustomer(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {(selectedCustomer.kanji_last_name || selectedCustomer.email)[0]}
                  </div>
                  <div>
                    {selectedCustomer.kanji_last_name} {selectedCustomer.kanji_first_name}
                    <div className="text-sm font-normal text-gray-500">
                      {selectedCustomer.kana_last_name} {selectedCustomer.kana_first_name}
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  {selectedCustomer.email}
                </DialogDescription>
              </DialogHeader>

              {loadingCustomerDetail ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  <p className="mt-4 text-gray-600">読み込み中...</p>
                </div>
              ) : customerDetail ? (
                <div className="space-y-6 mt-6">
                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">基本情報</h4>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">ステータス</dt>
                          <dd>{getStatusBadge(selectedCustomer.status)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">種別</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedCustomer.business_type === 'CORPORATION' ? '法人' :
                             selectedCustomer.business_type === 'SOLE_PROPRIETOR' ? '個人事業主' : '個人'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">登録日</dt>
                          <dd className="text-sm text-gray-900">
                            {formatDate(selectedCustomer.created_at, 'ja')}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">最終ログイン</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedCustomer.last_login_at
                              ? formatDate(selectedCustomer.last_login_at, 'ja')
                              : '-'}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">連絡先</h4>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">会社電話</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedCustomer.corporate_phone || '-'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">携帯電話</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedCustomer.personal_phone || '-'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">会社名</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedCustomer.company_name || '-'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">役職</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedCustomer.position || '-'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {/* Order Statistics */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">注文・見積統計</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {customerDetail.statistics.totalOrders}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">総注文数</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ¥{(((customerDetail.statistics.totalSpent || 0) / 10000).toFixed(1))}万
                        </div>
                        <div className="text-xs text-gray-600 mt-1">総購入額</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {customerDetail.statistics.totalQuotations || 0}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">総見積数</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">
                          {customerDetail.statistics.pendingQuotations || 0}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">見積待ち</div>
                      </div>
                    </div>
                  </div>

                  {/* Contact History */}
                  {customerDetail.contactHistory && customerDetail.contactHistory.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">連絡履歴</h4>
                      <div className="space-y-3">
                        {customerDetail.contactHistory.map((contact) => (
                          <div
                            key={contact.id}
                            className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                              contact.type === 'email' && "bg-blue-100 text-blue-600",
                              contact.type === 'call' && "bg-green-100 text-green-600",
                              contact.type === 'note' && "bg-yellow-100 text-yellow-600"
                            )}>
                              {contact.type === 'email' && <Mail className="w-5 h-5" />}
                              {contact.type === 'call' && <Phone className="w-5 h-5" />}
                              {contact.type === 'note' && <FileText className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {contact.subject || (contact.type === 'email' ? 'メール送信' : contact.type === 'call' ? '電話対応' : 'メモ')}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {formatDate(contact.createdAt, 'ja')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{contact.content}</p>
                              <p className="text-xs text-gray-500 mt-1">作成者: {contact.createdBy}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quotations History */}
                  {customerDetail.quotations && customerDetail.quotations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center justify-between">
                        <span>見積もり履歴</span>
                        <span className="text-xs text-gray-500">{customerDetail.quotations.length}件</span>
                      </h4>
                      <div className="space-y-3">
                        {customerDetail.quotations.map((quotation) => (
                          <div
                            key={quotation.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">
                                    {quotation.quotation_number}
                                  </span>
                                  {getQuotationStatusBadge(quotation.status)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(quotation.created_at, 'ja')}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                  ¥{((quotation.total_amount || 0).toLocaleString())}
                                </div>
                              </div>
                            </div>

                            {/* Quotation Items Summary */}
                            {quotation.items && quotation.items.length > 0 && (
                              <div className="mb-3 p-3 bg-gray-50 rounded text-sm">
                                <div className="text-gray-600 mb-1">明細:</div>
                                <div className="space-y-1">
                                  {quotation.items.slice(0, 3).map((item, index) => (
                                    <div key={item.id} className="flex justify-between text-xs">
                                      <span className="text-gray-700">
                                        {item.product_name} × {item.quantity}
                                      </span>
                                      <span className="text-gray-600">
                                        ¥{item.total_price.toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                  {quotation.items.length > 3 && (
                                    <div className="text-xs text-gray-500 italic">
                                      他 {quotation.items.length - 3} 品目...
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Quotation Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <div className="text-xs text-gray-500">
                                {quotation.admin_notes && (
                                  <span className="inline-flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    管理者メモあり
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {quotation.pdf_url && (
                                  <a
                                    href={quotation.pdf_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                  >
                                    <Download className="w-3 h-3" />
                                    PDF
                                  </a>
                                )}
                                <a
                                  href={`/admin/quotations?id=${quotation.id}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                >
                                  <Eye className="w-3 h-3" />
                                  詳細
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <DialogFooter className="gap-3">
                <button
                  onClick={() => {
                    handleSendEmail(selectedCustomer!);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  メール送信
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowExportModal(true);
                  }}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  エクスポート
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors"
                >
                  閉じる
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>データエクスポート</DialogTitle>
            <DialogDescription>
              選択した顧客データをエクスポートします
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <button
              onClick={() => handleExport('csv')}
              className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">CSV形式</div>
                <div className="text-sm text-gray-500">Excelで開ける汎用フォーマット</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </button>

            <button
              onClick={() => handleExport('excel')}
              className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Excel形式</div>
                <div className="text-sm text-gray-500">書式設定済みのExcelファイル</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </button>
          </div>

          <DialogFooter>
            <button
              onClick={() => setShowExportModal(false)}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Customer Modal */}
      <Dialog open={showAddCustomerModal} onOpenChange={setShowAddCustomerModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新規顧客追加</DialogTitle>
            <DialogDescription>
              新しい顧客アカウントを作成します
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-center text-gray-500 py-8">
              顧客登録フォームがここに表示されます
            </p>
          </div>

          <DialogFooter>
            <button
              onClick={() => setShowAddCustomerModal(false)}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={() => {
                showMessage('success', '顧客を追加しました');
                setShowAddCustomerModal(false);
                loadCustomers();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              追加する
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Composer Modal */}
      <EmailComposer
        open={emailComposerOpen}
        onOpenChange={(open) => setEmailComposerOpen(open)}
        recipients={selectedCustomersForEmail.map(c => ({
          id: c.email,
          email: c.email,
          name: c.name
        }))}
        onSuccess={handleEmailSuccess}
      />
    </div>
  );
}
