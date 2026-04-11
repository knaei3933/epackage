'use client';

import { useEffect, useState, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Package,
  Printer,
  Layers,
  Slash,
  Coins,
  Search,
  Save,
  Check,
  X,
  AlertCircle,
  Loader2,
  ChevronRight,
  Settings2,
  TrendingUp,
  Truck,
  Factory,
  Tag,
  RotateCcw,
  PercentIcon,
  Plus,
  Mail,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const dynamic = "force-dynamic";

// Types
interface SettingValue {
  value: number;
  description: string;
  unit: string;
  originalValue?: number;
}

interface CategoryData {
  [key: string]: SettingValue;
}

// Customer markup rate types
interface CustomerMarkupData {
  id: string;
  email: string;
  fullName?: string | null;
  companyName?: string | null;
  role: string;
  markupRate: number;
  markupRateNote?: string | null;
  createdAt: string;
}

type TabKey = 'film_material' | 'pouch_processing' | 'printing' | 'lamination' | 'slitter' | 'exchange_rate' | 'delivery' | 'production' | 'pricing' | 'designer' | 'email';

interface SettingGroup {
  title: string;
  description: string;
  icon: any;
  keywords: string[];
}

// Enhanced tab configuration with groups
const tabConfig: Record<TabKey, { name: string; nameJa: string; icon: any; groups: SettingGroup[] }> = {
  film_material: {
    name: '필름 재료',
    nameJa: 'フィルム材料',
    icon: Package,
    groups: [
      { title: '가격 설정', description: '필름 재료의 단가 관리', icon: Tag, keywords: ['PRICE', '가격', '단가', '원가'] },
      { title: '밀도 설정', description: '재료별 물리적 밀도값', icon: Layers, keywords: ['DENSITY', '밀도', '무게'] },
    ]
  },
  pouch_processing: {
    name: '파우치 가공',
    nameJa: 'ポーチ加工',
    icon: Layers,
    groups: [
      { title: '가공비', description: '파우치 가공 공정 비용', icon: Coins, keywords: ['가공', 'COST', '비용', 'PRICE'] },
      { title: '추가 옵션', description: '추가 작업 및 옵션 비용', icon: Settings2, keywords: ['추가', 'OPTION', '마무리', 'MATCHE'] },
    ]
  },
  printing: {
    name: '인쇄',
    nameJa: '印刷',
    icon: Printer,
    groups: [
      { title: '인쇄 비용', description: '인쇄 방식별 비용', icon: DollarSign, keywords: ['인쇄', 'PRINT', '비용', 'COST', 'PRICE'] },
      { title: '판매비', description: '인쇄판 제작 비용', icon: Factory, keywords: ['판', 'PLATE', '제작'] },
    ]
  },
  lamination: {
    name: '라미네이트',
    nameJa: 'ラミネート',
    icon: Layers,
    groups: [
      { title: '라미 가공', description: '라미네이트 가공 비용', icon: Layers, keywords: ['라미', 'LAMINATION', '가공', '비용'] },
      { title: '코팅', description: '코팅 처리 비용', icon: Package, keywords: ['코팅', 'COATING'] },
    ]
  },
  slitter: {
    name: '슬리터',
    nameJa: 'スリッター',
    icon: Slash,
    groups: [
      { title: '슬리팅 비용', description: '재단 공정 비용', icon: Slash, keywords: ['슬리', 'SLIT', '재단', 'COST'] },
    ]
  },
  exchange_rate: {
    name: '환율/관세',
    nameJa: '為替/関税',
    icon: TrendingUp,
    groups: [
      { title: '환율 정보', description: '통화별 환율', icon: TrendingUp, keywords: ['환율', 'EXCHANGE', 'RATE'] },
      { title: '관세 및 부가세', description: '수입 관련 세율', icon: Coins, keywords: ['관세', 'TAX', '부가세', 'VAT'] },
    ]
  },
  delivery: {
    name: '배송',
    nameJa: '配送',
    icon: Truck,
    groups: [
      { title: '배송비', description: '지역별 배송 비용', icon: Truck, keywords: ['배송', 'DELIVERY', '운송'] },
      { title: '추가 비용', description: '배송 관련 추가 비용', icon: Package, keywords: ['추가', '필수', 'ADDITIONAL'] },
    ]
  },
  production: {
    name: '생산 설정',
    nameJa: '生産設定',
    icon: Factory,
    groups: [
      { title: '생산 파라미터', description: '생산 공정 설정값', icon: Settings2, keywords: ['생산', 'PRODUCTION', '설정'] },
    ]
  },
  pricing: {
    name: '가격 설정',
    nameJa: '価格設定',
    icon: Coins,
    groups: [
      { title: '마진율', description: '가격 정책 설정', icon: TrendingUp, keywords: ['마진', 'MARGIN', '마크업', 'MARKUP', '기본', '제조업체', '최소', '판매'] },
      { title: '고객별 할인율', description: '고객별 할인율 관리 (0% ~ -50%)', icon: PercentIcon, keywords: ['__CUSTOMER_MARKUP__'] },
    ]
  },
  designer: {
    name: '디자이너',
    nameJa: 'デザイナー設定',
    icon: Mail,
    groups: [
      { title: '메일 주소 관리', description: '한국 디자이너의 이메일 주소 설정', icon: Mail, keywords: ['DESIGNER', 'EMAIL', '메일'] },
    ]
  },
  email: {
    name: '이메일 설정',
    nameJa: 'メール設定',
    icon: Mail,
    groups: [
      { title: 'SMTP 설정', description: '이메일 서버 연결 설정', icon: Settings2, keywords: ['SMTP', '서버', '포트', 'HOST'] },
      { title: '기능 토글', description: '이메일 자동 발송 설정', icon: Tag, keywords: ['TOGGLE', '사용', '비활성'] },
      { title: '회사 정보', description: '이메일 서명용 회사 정보', icon: Package, keywords: ['회사', 'COMPANY', '주소'] },
      { title: '은행 계좌', description: '청구서용 은행 계좌 정보', icon: Coins, keywords: ['은행', 'BANK', '계좌'] },
      { title: '알림 수신자', description: '관리자/영업/생산팀 알림 이메일', icon: Mail, keywords: ['RECIPIENT', '수신자', '팀'] },
    ]
  },
};

// Helper function to clean descriptions
function cleanDescription(description: string): string {
  return description
    .replace(/\s*\(CONSTANCES\.[^)]+\)\s*/g, '')
    .replace(/\s*\(CONSTANTS\.[^)]+\)\s*/g, '')
    .replace(/\s*\([^)]*CONSTANTS[^)]*\)\s*/g, '')
    .trim();
}

// Helper function to group settings by their group
function groupSettingsByCategory(settings: CategoryData, category: TabKey): Map<string, CategoryData> {
  const groups = new Map<string, CategoryData>();
  const config = tabConfig[category];

  // Initialize all groups
  config.groups.forEach(group => {
    groups.set(group.title, {});
  });

  // Ungrouped settings
  const ungrouped: CategoryData = {};

  // Categorize each setting
  Object.entries(settings).forEach(([key, data]) => {
    const cleanDesc = cleanDescription(data.description || key).toLowerCase();
    let grouped = false;

    // Try to match with groups
    for (const group of config.groups) {
      const matchesKeyword = group.keywords.some(keyword =>
        cleanDesc.includes(keyword.toLowerCase()) ||
        key.toLowerCase().includes(keyword.toLowerCase())
      );

      if (matchesKeyword) {
        groups.set(group.title, {
          ...groups.get(group.title),
          [key]: data
        });
        grouped = true;
        break;
      }
    }

    if (!grouped) {
      ungrouped[key] = data;
    }
  });

  // Add ungrouped settings to the first group or create "기타" group
  if (Object.keys(ungrouped).length > 0) {
    const firstGroup = config.groups[0];
    groups.set(firstGroup.title, {
      ...groups.get(firstGroup.title),
      ...ungrouped
    });
  }

  return groups;
}

export default function AdminSettingsClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('film_material');
  const [settings, setSettings] = useState<Record<TabKey, CategoryData>>({} as Record<TabKey, CategoryData>);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modifiedSettings, setModifiedSettings] = useState<Set<string>>(new Set());
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

  // Load settings
  useEffect(() => {
    loadSettings();
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(modifiedSettings.size > 0);
  }, [modifiedSettings]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      const result = await response.json();

      if (result.success) {
        // Store original values for change detection
        const settingsWithOriginals: Record<TabKey, CategoryData> = {
          film_material: {},
          pouch_processing: {},
          printing: {},
          lamination: {},
          slitter: {},
          exchange_rate: {},
          delivery: {},
          production: {},
          pricing: {},
          designer: {},
          email: {}
        };
        Object.entries(result.data).forEach(([category, data]: [string, any]) => {
          settingsWithOriginals[category as TabKey] = {};
          // data is an array, use forEach with the item's key property
          data.forEach((item: any) => {
            settingsWithOriginals[category as TabKey][item.key] = {
              value: item.value,
              description: item.description || item.key,
              unit: item.unit || '',
              originalValue: item.value
            };
          });
        });
        setSettings(settingsWithOriginals);
        setModifiedSettings(new Set());
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      showMessage('error', '설정 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSettingChange = (category: TabKey, key: string, newValue: number) => {
    const settingKey = `${category}.${key}`;
    const currentValue = settings[category]?.[key]?.originalValue ?? settings[category]?.[key]?.value ?? 0;

    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: {
          ...prev[category][key],
          value: newValue
        }
      }
    }));

    // Track modifications
    setModifiedSettings(prev => {
      const newSet = new Set(prev);
      if (newValue !== currentValue) {
        newSet.add(settingKey);
      } else {
        newSet.delete(settingKey);
      }
      return newSet;
    });
  };

  const handleSaveOne = async (category: TabKey, key: string) => {
    const settingKey = `${category}.${key}`;
    const newValue = settings[category]?.[key]?.value;

    if (newValue === undefined) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/settings/${category}/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newValue })
      });

      const result = await response.json();

      if (result.success) {
        // Update original value
        setSettings(prev => ({
          ...prev,
          [category]: {
            ...prev[category],
            [key]: {
              ...prev[category][key],
              originalValue: newValue
            }
          }
        }));

        // Clear modified state
        setModifiedSettings(prev => {
          const newSet = new Set(prev);
          newSet.delete(settingKey);
          return newSet;
        });

        // Clear cache
        await invalidateCache();
        showMessage('success', '저장되었습니다');
      } else {
        showMessage('error', result.error || '저장 실패');
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
      showMessage('error', '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (modifiedSettings.size === 0) return;

    setSavingAll(true);
    const saves: Promise<void>[] = [];

    modifiedSettings.forEach(settingKey => {
      const [category, key] = settingKey.split('.');
      const newValue = settings[category as TabKey]?.[key]?.value;

      if (newValue !== undefined) {
        saves.push(
          fetch(`/api/admin/settings/${category}/${key}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newValue })
          })
            .then(res => res.json())
            .then(result => {
              if (!result.success) {
                throw new Error(result.error || '저장 실패');
              }
            })
        );
      }
    });

    try {
      await Promise.all(saves);

      // Update all original values
      const updatedSettings: Record<TabKey, CategoryData> = { ...settings };
      modifiedSettings.forEach(settingKey => {
        const [category, key] = settingKey.split('.');
        updatedSettings[category as TabKey] = {
          ...updatedSettings[category as TabKey],
          [key]: {
            ...updatedSettings[category as TabKey][key],
            originalValue: updatedSettings[category as TabKey][key].value
          }
        };
      });
      setSettings(updatedSettings);
      setModifiedSettings(new Set());

      // Clear cache
      await invalidateCache();
      showMessage('success', `${modifiedSettings.size}개 설정이 저장되었습니다`);
    } catch (error) {
      console.error('Failed to save settings:', error);
      showMessage('error', '일부 설정 저장 실패');
    } finally {
      setSavingAll(false);
    }
  };

  const handleResetOne = (category: TabKey, key: string) => {
    const originalValue = settings[category]?.[key]?.originalValue;
    if (originalValue !== undefined) {
      handleSettingChange(category, key, originalValue);
    }
  };

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

  const invalidateCache = async () => {
    try {
      console.log('[AdminSettings] キャッシュ無効化開始...');
      const response = await fetch('/api/admin/settings/cache/invalidate', {
        method: 'POST'
      });
      if (response.ok) {
        console.log('[AdminSettings] キャッシュ無効化成功 - ページをリロードして新しい設定を適用します');
        // ページをリロードしてクライアント側のキャッシュをクリア
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        console.warn('[AdminSettings] キャッシュ無効化失敗:', response.status);
      }
    } catch (cacheError) {
      console.error('Failed to clear cache:', cacheError);
    }
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

      const response = await fetch(`/api/admin/settings/customer-markup?${params}`);
      const result = await response.json();

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
      const response = await fetch('/api/admin/settings/email-config');
      const result = await response.json();

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
      const response = await fetch('/api/admin/settings/email-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data })
      });

      const result = await response.json();

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
      const response = await fetch(`/api/admin/settings/customer-markup?id=${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markupRate: editFormData.markupRate,
          markupRateNote: editFormData.markupRateNote || null
        })
      });

      const result = await response.json();

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
      const response = await fetch('/api/admin/settings/designer-emails');
      const result = await response.json();

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
      const response = await fetch('/api/admin/settings/designer-emails', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails })
      });

      const result = await response.json();

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
            {/* For special tabs (designer, email, pricing), skip the "no settings" message */}
            {!['designer', 'email', 'pricing'].includes(activeTab) && settingCount === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchQuery ? '검색 결과가 없습니다.' : '이 카테고리에는 설정이 없습니다.'}
                </p>
              </div>
            ) : !['designer', 'email', 'pricing'].includes(activeTab) ? (
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
                        {Object.entries(groupData).map(([key, data]) => {
                          const settingKey = `${activeTab}.${key}`;
                          const isModified = modifiedSettings.has(settingKey);
                          const cleanDesc = cleanDescription(data.description || key);

                          return (
                            <div
                              key={key}
                              className={cn(
                                "px-6 py-4 hover:bg-gray-50/50 transition-colors",
                                isModified && "bg-blue-50/30"
                              )}
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-1 min-w-0">
                                  <label className="block text-sm font-medium text-gray-900 mb-1">
                                    {cleanDesc}
                                  </label>
                                  <p className="text-xs text-gray-500 mb-2 font-mono">{key}</p>
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
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    {/* Group Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <PercentIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">고객별 할인율</h3>
                          <p className="text-sm text-gray-500">고객별 할인율 관리 (0% ~ -50%)</p>
                        </div>
                      </div>
                      <button
                        onClick={() => loadCustomers()}
                        disabled={loadingCustomers}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        {loadingCustomers ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                        새로고침
                      </button>
                    </div>

                    {/* Customer Search */}
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="고객 검색... (이메일, 회사명)"
                          value={customerSearch}
                          onChange={(e) => handleCustomerSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Customer Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">고객 정보</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">회사명</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">할인율</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">메모</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">작업</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {loadingCustomers ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                                <p className="text-sm text-gray-500">로딩 중...</p>
                              </td>
                            </tr>
                          ) : filteredCustomers.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center">
                                <p className="text-sm text-gray-500">
                                  {customerSearch ? '검색 결과가 없습니다.' : '고객 데이터가 없습니다.'}
                                </p>
                              </td>
                            </tr>
                          ) : (
                            filteredCustomers.map((customer) => (
                              <tr key={customer.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                                    <p className="text-xs text-gray-500">{customer.role}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-sm text-gray-700">{customer.companyName || '-'}</p>
                                </td>
                                <td className="px-6 py-4">
                                  {editingCustomerId === customer.id ? (
                                    <div>
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="-0.5"
                                        max="0"
                                        value={editFormData.markupRate}
                                        onChange={(e) => setEditFormData({ ...editFormData, markupRate: parseFloat(e.target.value) || 0 })}
                                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                      />
                                      <p className="text-xs text-gray-400 mt-1">
                                        예: -0.1 (10% 할인), -0.2 (20% 할인)
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-sm font-medium text-gray-900">
                                      {((customer.markupRate ?? 0) * 100).toFixed(0)}%
                                    </p>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {editingCustomerId === customer.id ? (
                                    <input
                                      type="text"
                                      value={editFormData.markupRateNote}
                                      onChange={(e) => setEditFormData({ ...editFormData, markupRateNote: e.target.value })}
                                      placeholder="메모 입력..."
                                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                  ) : (
                                    <p className="text-sm text-gray-600">{customer.markupRateNote || '-'}</p>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {editingCustomerId === customer.id ? (
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={handleCancelEdit}
                                        disabled={savingCustomer === customer.id}
                                        className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                                      >
                                        취소
                                      </button>
                                      <button
                                        onClick={() => handleSaveCustomerMarkup(customer.id)}
                                        disabled={savingCustomer === customer.id}
                                        className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                                      >
                                        {savingCustomer === customer.id ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <>
                                            <Save className="w-3 h-3" />
                                            저장
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleStartEdit(customer)}
                                      className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                                    >
                                      편집
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            총 <span className="font-medium">{totalCustomers}</span>명의 고객
                            <span className="mx-2">•</span>
                            <span className="font-medium">{currentPage}</span> / {totalPages} 페이지
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1 || loadingCustomers}
                              className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              <ChevronRight className="w-4 h-4 rotate-180" />
                              이전
                            </button>
                            <div className="flex items-center gap-1">
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
                                    onClick={() => handlePageChange(pageNum)}
                                    className={cn(
                                      "min-w-[2rem] px-3 py-1 text-sm font-medium border rounded-lg",
                                      currentPage === pageNum
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "border-gray-300 hover:bg-gray-50"
                                    )}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                            </div>
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages || loadingCustomers}
                              className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              다음
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Designer Email Management */}
                {activeTab === 'designer' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">디자이너 이메일 주소</h3>
                          <p className="text-sm text-gray-500">데이터 입고 알림의 수신 이메일 주소</p>
                        </div>
                      </div>
                      <button
                        onClick={loadDesignerEmails}
                        disabled={loadingDesignerEmails}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        {loadingDesignerEmails ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                        새로고침
                      </button>
                    </div>

                    {/* Add Email Form */}
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <input
                            type="email"
                            placeholder="이메일 주소를 입력하세요..."
                            value={newDesignerEmail}
                            onChange={(e) => {
                              setNewDesignerEmail(e.target.value);
                              setEmailError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddDesignerEmail();
                              }
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          {emailError && (
                            <p className="text-xs text-red-600 mt-1">{emailError}</p>
                          )}
                        </div>
                        <button
                          onClick={handleAddDesignerEmail}
                          disabled={savingDesignerEmails || !newDesignerEmail.trim()}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                          {savingDesignerEmails ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          추가
                        </button>
                      </div>
                    </div>

                    {/* Email List */}
                    <div className="divide-y divide-gray-100">
                      {loadingDesignerEmails ? (
                        <div className="px-6 py-12 text-center">
                          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-500">로딩 중...</p>
                        </div>
                      ) : designerEmails.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-sm text-gray-500">등록된 이메일 주소가 없습니다</p>
                          <p className="text-xs text-gray-400 mt-1">위의 양식에서 이메일 주소를 추가하세요</p>
                        </div>
                      ) : (
                        designerEmails.map((email) => (
                          <div
                            key={email}
                            className="px-6 py-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <Mail className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{email}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveDesignerEmail(email)}
                              disabled={savingDesignerEmails}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Info Box */}
                    <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">알림 정보</p>
                          <p className="mt-1">여기에 설정된 이메일 주소로 고객이 데이터를 업로드할 때 알림이 발송됩니다.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Email Settings Management */}
                {activeTab === 'email' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {loadingEmailSettings ? (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-500">로딩 중...</p>
                      </div>
                    ) : emailSettings ? (
                      <>
                        {/* SMTP Settings */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Settings2 className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">SMTP 설정</h3>
                                <p className="text-sm text-gray-500">이메일 서버 연결 설정</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                                <input
                                  type="text"
                                  value={emailSettings.smtp.host}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    smtp: { ...emailSettings.smtp, host: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="sv12515.xserver.jp"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                                <input
                                  type="number"
                                  value={emailSettings.smtp.port}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    smtp: { ...emailSettings.smtp, port: parseInt(e.target.value) || 587 }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                  type="text"
                                  value={emailSettings.smtp.user}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    smtp: { ...emailSettings.smtp, user: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                  type="password"
                                  value={emailSettings.smtp.password}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    smtp: { ...emailSettings.smtp, password: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="••••••••"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                                <input
                                  type="email"
                                  value={emailSettings.smtp.from_email}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    smtp: { ...emailSettings.smtp, from_email: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reply-To</label>
                                <input
                                  type="email"
                                  value={emailSettings.smtp.reply_to}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    smtp: { ...emailSettings.smtp, reply_to: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                                <input
                                  type="email"
                                  value={emailSettings.smtp.admin_email}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    smtp: { ...emailSettings.smtp, admin_email: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => saveEmailSettingsSection('smtp', emailSettings.smtp)}
                                disabled={savingEmailSettings}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                              >
                                {savingEmailSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                저장
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Email Toggles */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Tag className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">기능 토글</h3>
                                <p className="text-sm text-gray-500">이메일 자동 발송 설정</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                              {Object.entries(emailSettings.toggles).map(([key, value]) => (
                                <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                  <span className="text-sm font-medium text-gray-700">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={(e) => setEmailSettings({
                                      ...emailSettings,
                                      toggles: { ...emailSettings.toggles, [key]: e.target.checked }
                                    })}
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                </label>
                              ))}
                            </div>
                            <div className="flex justify-end mt-4">
                              <button
                                onClick={() => saveEmailSettingsSection('toggles', emailSettings.toggles)}
                                disabled={savingEmailSettings}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                              >
                                {savingEmailSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                저장
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Company Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <Package className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">회사 정보</h3>
                                <p className="text-sm text-gray-500">이메일 서명용 회사 정보</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">회사명 (日本語)</label>
                                <input
                                  type="text"
                                  value={emailSettings.companyInfo.company_name_ja}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    companyInfo: { ...emailSettings.companyInfo, company_name_ja: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">회사명 (English)</label>
                                <input
                                  type="text"
                                  value={emailSettings.companyInfo.company_name_en}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    companyInfo: { ...emailSettings.companyInfo, company_name_en: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">지원 이메일</label>
                                <input
                                  type="email"
                                  value={emailSettings.companyInfo.support_email}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    companyInfo: { ...emailSettings.companyInfo, support_email: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">지원 전화</label>
                                <input
                                  type="text"
                                  value={emailSettings.companyInfo.support_phone}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    companyInfo: { ...emailSettings.companyInfo, support_phone: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">우편번호</label>
                                <input
                                  type="text"
                                  value={emailSettings.companyInfo.postal_code}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    companyInfo: { ...emailSettings.companyInfo, postal_code: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                                <input
                                  type="text"
                                  value={emailSettings.companyInfo.address}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    companyInfo: { ...emailSettings.companyInfo, address: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => saveEmailSettingsSection('companyInfo', emailSettings.companyInfo)}
                                disabled={savingEmailSettings}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                              >
                                {savingEmailSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                저장
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Bank Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-100 rounded-lg">
                                <Coins className="w-5 h-5 text-amber-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">은행 계좌</h3>
                                <p className="text-sm text-gray-500">청구서용 은행 계좌 정보</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">은행명</label>
                                <input
                                  type="text"
                                  value={emailSettings.bankInfo.bank_name}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    bankInfo: { ...emailSettings.bankInfo, bank_name: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">지점명</label>
                                <input
                                  type="text"
                                  value={emailSettings.bankInfo.branch_name}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    bankInfo: { ...emailSettings.bankInfo, branch_name: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">계좌 종류</label>
                                <input
                                  type="text"
                                  value={emailSettings.bankInfo.account_type}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    bankInfo: { ...emailSettings.bankInfo, account_type: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">계좌 번호</label>
                                <input
                                  type="text"
                                  value={emailSettings.bankInfo.account_number}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    bankInfo: { ...emailSettings.bankInfo, account_number: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">예금주</label>
                                <input
                                  type="text"
                                  value={emailSettings.bankInfo.account_holder}
                                  onChange={(e) => setEmailSettings({
                                    ...emailSettings,
                                    bankInfo: { ...emailSettings.bankInfo, account_holder: e.target.value }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => saveEmailSettingsSection('bankInfo', emailSettings.bankInfo)}
                                disabled={savingEmailSettings}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                              >
                                {savingEmailSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                저장
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Notification Recipients */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-cyan-100 rounded-lg">
                                <Mail className="w-5 h-5 text-cyan-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">알림 수신자</h3>
                                <p className="text-sm text-gray-500">관리자/영업/생산팀 알림 이메일</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-6 space-y-6">
                            {/* Admin Emails */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">관리자 알림</h4>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {emailSettings.recipients.admin_emails.map((email, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {email}
                                    <button
                                      onClick={() => setEmailSettings({
                                        ...emailSettings,
                                        recipients: {
                                          ...emailSettings.recipients,
                                          admin_emails: emailSettings.recipients.admin_emails.filter((_, i) => i !== idx)
                                        }
                                      })}
                                      className="hover:text-red-600"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="email"
                                  placeholder="이메일 주소"
                                  value={newRecipientEmail.type === 'admin' ? newRecipientEmail.email : ''}
                                  onChange={(e) => setNewRecipientEmail({ type: 'admin', email: e.target.value })}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <button
                                  onClick={() => {
                                    if (newRecipientEmail.type === 'admin' && newRecipientEmail.email) {
                                      setEmailSettings({
                                        ...emailSettings,
                                        recipients: {
                                          ...emailSettings.recipients,
                                          admin_emails: [...emailSettings.recipients.admin_emails, newRecipientEmail.email]
                                        }
                                      });
                                      setNewRecipientEmail({ type: 'admin', email: '' });
                                    }
                                  }}
                                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                  추가
                                </button>
                              </div>
                            </div>
                            {/* Sales Emails */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">영업팀 알림</h4>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {emailSettings.recipients.sales_emails.map((email, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                    {email}
                                    <button
                                      onClick={() => setEmailSettings({
                                        ...emailSettings,
                                        recipients: {
                                          ...emailSettings.recipients,
                                          sales_emails: emailSettings.recipients.sales_emails.filter((_, i) => i !== idx)
                                        }
                                      })}
                                      className="hover:text-red-600"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="email"
                                  placeholder="이메일 주소"
                                  value={newRecipientEmail.type === 'sales' ? newRecipientEmail.email : ''}
                                  onChange={(e) => setNewRecipientEmail({ type: 'sales', email: e.target.value })}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <button
                                  onClick={() => {
                                    if (newRecipientEmail.type === 'sales' && newRecipientEmail.email) {
                                      setEmailSettings({
                                        ...emailSettings,
                                        recipients: {
                                          ...emailSettings.recipients,
                                          sales_emails: [...emailSettings.recipients.sales_emails, newRecipientEmail.email]
                                        }
                                      });
                                      setNewRecipientEmail({ type: 'sales', email: '' });
                                    }
                                  }}
                                  className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                                >
                                  추가
                                </button>
                              </div>
                            </div>
                            {/* Production Emails */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">생산팀 알림</h4>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {emailSettings.recipients.production_emails.map((email, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                                    {email}
                                    <button
                                      onClick={() => setEmailSettings({
                                        ...emailSettings,
                                        recipients: {
                                          ...emailSettings.recipients,
                                          production_emails: emailSettings.recipients.production_emails.filter((_, i) => i !== idx)
                                        }
                                      })}
                                      className="hover:text-red-600"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="email"
                                  placeholder="이메일 주소"
                                  value={newRecipientEmail.type === 'production' ? newRecipientEmail.email : ''}
                                  onChange={(e) => setNewRecipientEmail({ type: 'production', email: e.target.value })}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <button
                                  onClick={() => {
                                    if (newRecipientEmail.type === 'production' && newRecipientEmail.email) {
                                      setEmailSettings({
                                        ...emailSettings,
                                        recipients: {
                                          ...emailSettings.recipients,
                                          production_emails: [...emailSettings.recipients.production_emails, newRecipientEmail.email]
                                        }
                                      });
                                      setNewRecipientEmail({ type: 'production', email: '' });
                                    }
                                  }}
                                  className="px-3 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700"
                                >
                                  추가
                                </button>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => saveEmailSettingsSection('recipients', emailSettings.recipients)}
                                disabled={savingEmailSettings}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                              >
                                {savingEmailSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                저장
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <p className="text-sm text-gray-500">이메일 설정을 불러올 수 없습니다</p>
                        <button
                          onClick={loadEmailSettings}
                          className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                        >
                          다시 시도
                        </button>
                      </div>
                    )}
                  </motion.div>
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
