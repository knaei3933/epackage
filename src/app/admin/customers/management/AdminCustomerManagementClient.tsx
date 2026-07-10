'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import nextDynamic from 'next/dynamic';
import type { UserStatus } from '@/types/auth';
import type { Recipient } from '@/components/admin/EmailComposer';
import { fetchCustomers as fetchCustomersAPI, fetchCustomerById as fetchCustomerByIdAPI, exportCustomers as exportCustomersAPI } from '@/lib/api/admin/customers';
import type { Profile, CustomerListResponse, CustomerDetailResponse } from './parts/types';
import { getStatusBadge, getQuotationStatusBadge } from './parts/badges';
import { Header } from './parts/Header';
import { StatsCards } from './parts/StatsCards';
import { SearchAndFilters } from './parts/SearchAndFilters';
import { BulkActionsBar } from './parts/BulkActionsBar';
import { DesktopCustomerTable } from './parts/DesktopCustomerTable';
import { MobileCustomerList } from './parts/MobileCustomerList';
import { MobilePagination } from './parts/Pagination';
import { CustomerDetailModal } from './parts/CustomerDetailModal';
import { ExportModal } from './parts/ExportModal';
import { AddCustomerModal } from './parts/AddCustomerModal';

// Defer the EmailComposer bundle until it is actually opened.
const EmailComposer = nextDynamic(() =>
  import('@/components/admin/EmailComposer').then((m) => m.EmailComposer)
);

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
      const result: CustomerListResponse = await fetchCustomersAPI({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        status: selectedStatus,
        period: selectedPeriod,
      }) as CustomerListResponse;

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
      const result: CustomerDetailResponse = await fetchCustomerByIdAPI(customerId) as CustomerDetailResponse;

      if (result.success && result.data) {
        setCustomerDetail(result.data);
      } else {
        showMessage('error', result.error || '顧客詳細の読進みに失敗しました');
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
      recipients = [{
        id: customer.email,
        email: customer.email,
        name: customer.kanji_last_name && customer.kanji_first_name
          ? `${customer.kanji_last_name} ${customer.kanji_first_name}`
          : customer.company_name || undefined,
      }];
    } else if (selectedCustomers.size > 0) {
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

  // Export functionality
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await exportCustomersAPI({
        format,
        status: selectedStatus,
        search: searchQuery,
      });
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

  // Calculate stats
  const stats = useMemo(() => ({
    total: customers.length + totalItems - customers.length,
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
      <Header message={message} setShowAddCustomerModal={setShowAddCustomerModal} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards
          totalItems={totalItems}
          active={stats.active}
          pending={stats.pending}
          newThisMonth={stats.newThisMonth}
        />

        <SearchAndFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          setCurrentPage={setCurrentPage}
        />

        <BulkActionsBar
          showBulkActions={showBulkActions}
          selectedCustomers={selectedCustomers}
          customersLength={customers.length}
          toggleAllSelection={toggleAllSelection}
          handleSendEmail={() => handleSendEmail()}
          setShowExportModal={setShowExportModal}
          clearSelection={() => {
            setSelectedCustomers(new Set());
            setShowBulkActions(false);
          }}
        />

        {/* Customer List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
          </div>
        ) : (
          <>
            <DesktopCustomerTable
              customers={customers}
              selectedCustomers={selectedCustomers}
              toggleCustomerSelection={toggleCustomerSelection}
              toggleAllSelection={toggleAllSelection}
              handleSendEmail={handleSendEmail}
              openCustomerDetail={openCustomerDetail}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              setCurrentPage={setCurrentPage}
            />

            <MobileCustomerList
              customers={customers}
              selectedCustomers={selectedCustomers}
              toggleCustomerSelection={toggleCustomerSelection}
              handleSendEmail={handleSendEmail}
              openCustomerDetail={openCustomerDetail}
            />

            <MobilePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              setCurrentPage={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        showDetailModal={showDetailModal}
        selectedCustomer={selectedCustomer}
        customerDetail={customerDetail}
        loadingCustomerDetail={loadingCustomerDetail}
        setShowDetailModal={setShowDetailModal}
        setCustomerDetail={setCustomerDetail}
        setSelectedCustomer={setSelectedCustomer}
        getStatusBadge={getStatusBadge}
        getQuotationStatusBadge={getQuotationStatusBadge}
        handleSendEmail={handleSendEmail}
        setShowExportModal={setShowExportModal}
      />

      {/* Export Modal */}
      <ExportModal showExportModal={showExportModal} setShowExportModal={setShowExportModal} handleExport={handleExport} />

      {/* Add Customer Modal */}
      <AddCustomerModal showAddCustomerModal={showAddCustomerModal} setShowAddCustomerModal={setShowAddCustomerModal} showMessage={showMessage} loadCustomers={loadCustomers} />

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
