'use client';

import { useEffect, useState, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Save,
  Check,
  X,
  AlertCircle,
  Loader2,
  ChevronRight,
  Settings2,
  RotateCcw,
  Plus,
  Mail,
  Trash2,
  Cloud,
  Users,
  ExternalLink,
  Package,
  Tag,
  Coins,
  PercentIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import type { TabKey, CategoryData, CustomerMarkupData } from './parts/types';
import { tabConfig } from './parts/tab-config';
import { cleanDescription, groupSettingsByCategory } from './parts/helpers';
import { useSettingsApi } from './parts/useSettingsApi';

import { PricingTab } from './parts/PricingTab';
import { DesignerTab } from './parts/DesignerTab';
import { EmailTab } from './parts/EmailTab';
import { IntegrationsTab } from './parts/IntegrationsTab';
import { fetchCustomerMarkup as fetchCustomerMarkupAPI, updateCustomerMarkup as updateCustomerMarkupAPI, fetchEmailConfig as fetchEmailConfigAPI, updateEmailConfig as updateEmailConfigAPI, fetchDesignerEmails as fetchDesignerEmailsAPI, updateDesignerEmails as updateDesignerEmailsAPI, fetchGoogleDriveStatus as fetchGoogleDriveStatusAPI } from '@/lib/api/admin/settings';

export const dynamic = "force-dynamic";

export default function AdminSettingsClient() {
  const {
    settings, setSettings, loading, saving, savingAll, message,
    modifiedSettings, setModifiedSettings,
    showMessage, handleSettingChange,
    handleSaveOne, handleSaveAll, handleResetOne,
  } = useSettingsApi();

  const [activeTab, setActiveTab] = useState<TabKey>('film_material');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Customer markup rate management
  const [customers, setCustomers] = useState<CustomerMarkupData[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ markupRate: number; markupRateNote: string }>({
    markupRate: 0.0,
    markupRateNote: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const perPage = 20;

  // Designer emails management
  const [designerEmails, setDesignerEmails] = useState<string[]>([]);
  const [loadingDesignerEmails, setLoadingDesignerEmails] = useState(false);
  const [savingDesignerEmails, setSavingDesignerEmails] = useState(false);
  const [newDesignerEmail, setNewDesignerEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  // Email settings management
  const [emailSettings, setEmailSettings] = useState<{
    smtp: { host: string; port: number; user: string; password: string; from_email: string; reply_to: string; admin_email: string };
    toggles: { order_confirmation: boolean; shipping_notification: boolean; quote_approval: boolean; production_status: boolean; admin_notifications: boolean; designer_notifications: boolean; data_upload_reminders: boolean; approval_reminders: boolean };
    companyInfo: { company_name_ja: string; company_name_en: string; support_email: string; support_phone: string; postal_code: string; address: string };
    bankInfo: { bank_name: string; branch_name: string; account_type: string; account_number: string; account_holder: string };
    recipients: { admin_emails: string[]; sales_emails: string[]; production_emails: string[] };
  } | null>(null);
  const [loadingEmailSettings, setLoadingEmailSettings] = useState(false);
  const [savingEmailSettings, setSavingEmailSettings] = useState(false);
  const [newRecipientEmail, setNewRecipientEmail] = useState<{ type: 'admin' | 'sales' | 'production'; email: string }>({ type: 'admin', email: '' });

  // Check for unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(modifiedSettings.size > 0);
  }, [modifiedSettings]);

  const handleResetAll = () => {
    const resetSettings: Record<TabKey, CategoryData> = { ...settings };
    const tabData = settings[activeTab];

    Object.entries(tabData).forEach(([key, data]) => {
      if (data.originalValue !== undefined) {
        resetSettings[activeTab] = {
          ...resetSettings[activeTab],
          [key]: {
            ...data,
            value: data.originalValue
          }
        };
      }
    });

    setSettings(resetSettings);
    setModifiedSettings(new Set());
  };

  // Customer markup rate management functions
  const loadCustomers = async (page: number = currentPage) => {
    setLoadingCustomers(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
        ...(customerSearch && { search: customerSearch })
      });

      const result = await fetchCustomerMarkupAPI({ page: 1, limit: 100 }) as any;

      if (result.success) {
        setCustomers(result.data || []);
        setTotalPages(result.pagination?.totalPages || 1);
        setTotalCustomers(result.pagination?.total || 0);
        setCurrentPage(page);
      } else {
        showMessage('error', result.error || '고객 데이터 로드 실패');
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      showMessage('error', '고객 데이터 로드 실패');
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadCustomers(newPage);
    }
  };

  // Handle search with page reset
  const handleCustomerSearch = (search: string) => {
    setCustomerSearch(search);
    setCurrentPage(1);
  };

  // Load customers when pricing tab is activated
  useEffect(() => {
    if (activeTab === 'pricing' && customers.length === 0) {
      loadCustomers();
    }
  }, [activeTab]);

  // Load designer emails when designer tab is activated
  useEffect(() => {
    if (activeTab === 'designer' && designerEmails.length === 0) {
      loadDesignerEmails();
    }
  }, [activeTab]);

  // Load email settings when email tab is activated
  useEffect(() => {
    if (activeTab === 'email' && !emailSettings) {
      loadEmailSettings();
    }
  }, [activeTab]);

  // Email settings management functions
  const loadEmailSettings = async () => {
    setLoadingEmailSettings(true);
    try {
      const result = await fetchEmailConfigAPI() as any;

      if (result.success) {
        setEmailSettings(result.data);
      } else {
        showMessage('error', result.error || '이메일 설정을 불러오지 못했습니다');
      }
    } catch (error) {
      console.error('Failed to load email settings:', error);
      showMessage('error', '이메일 설정을 불러오지 못했습니다');
    } finally {
      setLoadingEmailSettings(false);
    }
  };

  const saveEmailSettingsSection = async (section: 'smtp' | 'toggles' | 'companyInfo' | 'bankInfo' | 'recipients', data: any) => {
    setSavingEmailSettings(true);
    try {
      const result = await updateEmailConfigAPI({ section, data }) as any;

      if (result.success) {
        showMessage('success', '설정을 저장했습니다');
        // Reload settings
        await loadEmailSettings();
      } else {
        showMessage('error', result.error || '저장에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to save email settings:', error);
      showMessage('error', '저장에 실패했습니다');
    } finally {
      setSavingEmailSettings(false);
    }
  };

  const handleStartEdit = (customer: CustomerMarkupData) => {
    setEditingCustomerId(customer.id);
    setEditFormData({
      markupRate: customer.markupRate,
      markupRateNote: customer.markupRateNote || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingCustomerId(null);
    setEditFormData({ markupRate: 0.0, markupRateNote: '' });
  };

  const handleSaveCustomerMarkup = async (customerId: string) => {
    setSavingCustomer(customerId);
    try {
      const result = await updateCustomerMarkupAPI(customerId, {
        markupRate: editFormData.markupRate,
        markupRateNote: editFormData.markupRateNote || null
      }) as any;

      if (result.success) {
        // Update local state
        setCustomers(prev => prev.map(c =>
          c.id === customerId
            ? { ...c, markupRate: result.data.markupRate, markupRateNote: result.data.markupRateNote }
            : c
        ));
        showMessage('success', '할인율이 저장되었습니다');
        setEditingCustomerId(null);
      } else {
        showMessage('error', result.error || '저장 실패');
      }
    } catch (error) {
      console.error('Failed to save customer markup:', error);
      showMessage('error', '저장 실패');
    } finally {
      setSavingCustomer(null);
    }
  };

  // Designer emails management functions
  const loadDesignerEmails = async () => {
    setLoadingDesignerEmails(true);
    try {
      const result = await fetchDesignerEmailsAPI() as any;

      if (result.success) {
        setDesignerEmails(result.emails || []);
      } else {
        showMessage('error', result.error || '디자이너 메일을 불러오지 못했습니다');
      }
    } catch (error) {
      console.error('Failed to load designer emails:', error);
      showMessage('error', '디자이너 메일을 불러오지 못했습니다');
    } finally {
      setLoadingDesignerEmails(false);
    }
  };

  const saveDesignerEmails = async (emails: string[]) => {
    setSavingDesignerEmails(true);
    try {
      const result = await updateDesignerEmailsAPI({ emails }) as any;

      if (result.success) {
        setDesignerEmails(result.emails || []);
        showMessage('success', '디자이너 메일을 저장했습니다');
      } else {
        showMessage('error', result.error || '저장에 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to save designer emails:', error);
      showMessage('error', '저장에 실패했습니다');
    } finally {
      setSavingDesignerEmails(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddDesignerEmail = async () => {
    if (!newDesignerEmail.trim()) return;

    if (!validateEmail(newDesignerEmail)) {
      setEmailError('유효한 이메일 주소를 입력해주세요');
      return;
    }

    if (designerEmails.includes(newDesignerEmail.trim())) {
      setEmailError('이미 등록된 이메일 주소입니다');
      return;
    }

    setEmailError(null);
    const updatedEmails = [...designerEmails, newDesignerEmail.trim()];
    await saveDesignerEmails(updatedEmails);
    setNewDesignerEmail('');
  };

  const handleRemoveDesignerEmail = async (email: string) => {
    const updatedEmails = designerEmails.filter(e => e !== email);
    await saveDesignerEmails(updatedEmails);
  };

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;

    const query = customerSearch.toLowerCase();
    return customers.filter(c =>
      c.email?.toLowerCase().includes(query) ||
      c.companyName?.toLowerCase().includes(query) ||
      c.fullName?.toLowerCase().includes(query)
    );
  }, [customers, customerSearch]);

  // Filter settings based on search query
  const filteredSettings = useMemo(() => {
    if (!searchQuery) return settings[activeTab] || {};

    const query = searchQuery.toLowerCase();
    const tabData = settings[activeTab] || {};
    const filtered: CategoryData = {};

    Object.entries(tabData).forEach(([key, data]) => {
      const cleanDesc = cleanDescription(data.description || key);
      if (
        key.toLowerCase().includes(query) ||
        cleanDesc.toLowerCase().includes(query) ||
        data.unit.toLowerCase().includes(query)
      ) {
        filtered[key] = data;
      }
    });

    return filtered;
  }, [settings, activeTab, searchQuery]);

  // Get grouped settings
  const groupedSettings = useMemo(() => {
    return groupSettingsByCategory(filteredSettings, activeTab);
  }, [filteredSettings, activeTab]);

  // Check if any settings in current tab are modified
  const hasTabModifications = useMemo(() => {
    return Array.from(modifiedSettings).some(key => key.startsWith(`${activeTab}.`));
  }, [modifiedSettings, activeTab]);

  const currentTabConfig = tabConfig[activeTab];
  const settingCount = Object.keys(filteredSettings).length;
  const modifiedCount = Array.from(modifiedSettings).filter(key => key.startsWith(`${activeTab}.`)).length;

  // Google Drive connection status
  const [googleDriveStatus, setGoogleDriveStatus] = useState<{ connected: boolean; loading: boolean }>({ connected: false, loading: false });

  useEffect(() => {
    if (activeTab !== 'integrations') return;
    setGoogleDriveStatus(prev => ({ ...prev, loading: true }));
    fetchGoogleDriveStatusAPI()
      .then((data) => {
        setGoogleDriveStatus({ connected: data?.data?.tokenStatus?.hasTokenInDb ?? false, loading: false });
      })
      .catch(() => setGoogleDriveStatus({ connected: false, loading: false }));
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Settings2 className="w-8 h-8 text-blue-600" />
                시스템 설정
              </h1>
              <p className="text-sm text-gray-500 mt-2">단가 및 설정값 관리</p>
            </div>
            {hasTabModifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3"
              >
                <span className="text-sm text-gray-600">
                  {modifiedCount}개 변경사항
                </span>
                <button
                  onClick={handleResetAll}
                  disabled={savingAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  초기화
                </button>
                <button
                  onClick={handleSaveAll}
                  disabled={savingAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                  {savingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      모두 저장
                    </>
                  )}
                </button>
              </motion.div>
            )}
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
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="설정 검색... (이름, 설명, 단위)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Tabs">
            {Object.entries(tabConfig).map(([key, config]) => {
              const Icon = config.icon;
              const isActive = activeTab === key;
              const hasModifications = Array.from(modifiedSettings).some(m => m.startsWith(`${key}.`));

              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as TabKey)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative flex-shrink-0",
                    isActive
                      ? "text-blue-700 bg-blue-50/50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {hasModifications && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                  <Icon className="w-4 h-4" />
                  <span>{config.name}</span>
                  {hasModifications && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                      {Array.from(modifiedSettings).filter(m => m.startsWith(`${key}.`)).length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <p className="mt-4 text-gray-600 font-medium">로딩 중...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* For special tabs (designer, email), skip the "no settings" message */}
            {!['designer', 'email'].includes(activeTab) && settingCount === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchQuery ? '검색 결과가 없습니다.' : '이 카테고리에는 설정이 없습니다.'}
                </p>
              </div>
            ) : !['designer', 'email'].includes(activeTab) ? (
              <div className="space-y-6">
                {Array.from(groupedSettings.entries()).map(([groupTitle, groupData]) => {
                  const groupConfig = currentTabConfig.groups.find(g => g.title === groupTitle);
                  const Icon = groupConfig?.icon || Settings2;
                  const hasModificationsInGroup = Object.entries(groupData).some(
                    ([key]) => modifiedSettings.has(`${activeTab}.${key}`)
                  );

                  if (Object.keys(groupData).length === 0) return null;

                  return (
                    <motion.div
                      key={groupTitle}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      {/* Group Header */}
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{groupTitle}</h3>
                            <p className="text-sm text-gray-500">{groupConfig?.description || ''}</p>
                          </div>
                        </div>
                        {hasModificationsInGroup && (
                          <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                            수정됨
                          </span>
                        )}
                      </div>

                      {/* Settings Table */}
                      <div className="divide-y divide-gray-100">
                      {Object.entries(groupData).map(([key, data], index) => {
                        const settingKey = `${activeTab}.${key}`;
                        const isModified = modifiedSettings.has(settingKey);
                        const cleanDesc = cleanDescription(data.description || key);
                        const isInactive = data.isActive === false;

                        return (
                          <div
                            key={key}
                            className={cn(
                              "flex items-center px-6 py-4 hover:bg-gray-50/50 transition-colors gap-4",
                              isModified && "bg-blue-50/30",
                              isInactive && "opacity-50"
                            )}
                          >
                              <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
                                {index + 1}
                              </span>
                             <div className="flex-1 min-w-0">
                               <label className="block text-sm font-medium text-gray-900 mb-1">
                                 {cleanDesc}
                                  {isInactive && (
                                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-100 rounded">비활성</span>
                                  )}
                               </label>
                               <p className="text-xs text-gray-400 mb-0 font-mono">{key}</p>
                                {activeTab === 'film_material' && key.endsWith('_unit_price') && (() => {
                                  const markupRate = (settings['film_material']?.['material_markup_rate']?.value as number) ?? 0;
                                  const basePrice = data.value as number;
                                  const appliedPrice = Math.round(basePrice * (1 + markupRate));
                                  return markupRate > 0 ? (
                                    <p className="text-xs text-blue-600 mt-1">
                                      적용단가: ₩{appliedPrice.toLocaleString()}/kg (₩{basePrice.toLocaleString()} × {((1 + markupRate) * 100).toFixed(0)}%)
                                    </p>
                                  ) : null;
                                })()}
                             </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <input
                                    type="number"
                                    step="0.01"
                                    data-testid={`setting-${activeTab}-${key}`}
                                    value={data.value}
                                    onChange={(e) => {
                                      const newValue = parseFloat(e.target.value) || 0;
                                      handleSettingChange(activeTab, key, newValue);
                                    }}
                                    disabled={saving || savingAll}
                                    className={cn(
                                      "w-32 px-3 py-2 text-right border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition-shadow",
                                      isModified
                                        ? "border-blue-300 bg-blue-50"
                                        : "border-gray-300"
                                    )}
                                  />
                                  <span className="text-sm text-gray-500 w-12 text-right">{data.unit}</span>
                                  {isModified && (
                                    <button
                                      onClick={() => handleResetOne(activeTab, key)}
                                      disabled={saving || savingAll}
                                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                      title="원래 값으로 복원"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleSaveOne(activeTab, key)}
                                    disabled={saving || savingAll || !isModified}
                                    className={cn(
                                      "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                                      isModified
                                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    )}
                                  >
                                    {saving ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : isModified ? (
                                      <>
                                        <Save className="w-4 h-4" />
                                        저장
                                      </>
                                    ) : (
                                      '저장'
                                    )}
                                </button>
                                </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
                </div>
              ) : null}

                {/* Customer Markup Rate Management */}
                {activeTab === 'pricing' && (
                  <PricingTab
                    customers={customers}
                    loadingCustomers={loadingCustomers}
                    savingCustomer={savingCustomer}
                    customerSearch={customerSearch}
                    editingCustomerId={editingCustomerId}
                    editFormData={editFormData}
                    filteredCustomers={filteredCustomers}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCustomers={totalCustomers}
                    setCustomerSearch={setCustomerSearch}
                    setCurrentPage={setCurrentPage}
                    setEditFormData={setEditFormData}
                    setEditingCustomerId={setEditingCustomerId}
                    handleStartEdit={handleStartEdit}
                    handleCancelEdit={handleCancelEdit}
                    handleSaveCustomerMarkup={handleSaveCustomerMarkup}
                    handlePageChange={handlePageChange}
                    loadCustomers={loadCustomers}
                    handleCustomerSearch={handleCustomerSearch}
                  />
                )}

                {/* Designer Email Management */}
                {activeTab === 'designer' && (
                  <DesignerTab
                    designerEmails={designerEmails}
                    loadingDesignerEmails={loadingDesignerEmails}
                    savingDesignerEmails={savingDesignerEmails}
                    newDesignerEmail={newDesignerEmail}
                    emailError={emailError}
                    setNewDesignerEmail={setNewDesignerEmail}
                    setEmailError={setEmailError}
                    handleAddDesignerEmail={handleAddDesignerEmail}
                    handleRemoveDesignerEmail={handleRemoveDesignerEmail}
                    loadDesignerEmails={loadDesignerEmails}
                  />
                )}

                {/* Email Settings Management */}
                {activeTab === 'email' && (
                  <EmailTab
                    emailSettings={emailSettings}
                    loadingEmailSettings={loadingEmailSettings}
                    savingEmailSettings={savingEmailSettings}
                    newRecipientEmail={newRecipientEmail}
                    setEmailSettings={setEmailSettings}
                    setNewRecipientEmail={setNewRecipientEmail}
                    saveEmailSettingsSection={saveEmailSettingsSection}
                    loadEmailSettings={loadEmailSettings}
                  />
                )}

                {/* Integrations / External Services */}
                {activeTab === 'integrations' && (
                  <IntegrationsTab googleDriveStatus={googleDriveStatus} />
                )}

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 max-w-sm"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">저장되지 않은 변경사항</p>
              <p className="text-xs text-amber-700 mt-1">
                {modifiedSettings.size}개 설정이 변경되었습니다. 저장을 눌러 변경사항을 적용하세요.
              </p>
            </div>
          </div>
        </motion.div>
      )}
      </div>
      )}
      </div>
    </div>
  );
}
