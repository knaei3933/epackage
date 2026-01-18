'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Package, Printer, Layers, Slash, Coins } from 'lucide-react';

// Types
interface SettingValue {
  value: number;
  description: string;
  unit: string;
}

interface CategoryData {
  [key: string]: SettingValue;
}

type TabKey = 'film_material' | 'pouch_processing' | 'printing' | 'lamination' | 'slitter' | 'exchange_rate' | 'delivery' | 'production' | 'pricing';

const tabs = [
  { key: 'film_material' as TabKey, name: '필름 재료', nameJa: 'フィルム材料', icon: Package },
  { key: 'pouch_processing' as TabKey, name: '파우치 가공', nameJa: 'ポーチ加工', icon: Layers },
  { key: 'printing' as TabKey, name: '인쇄', nameJa: '印刷', icon: Printer },
  { key: 'lamination' as TabKey, name: '라미네이트', nameJa: 'ラミネート', icon: Layers },
  { key: 'slitter' as TabKey, name: '슬리터', nameJa: 'スリッター', icon: Slash },
  { key: 'exchange_rate' as TabKey, name: '환율/관세', nameJa: '為替/関税', icon: DollarSign },
  { key: 'delivery' as TabKey, name: '배송', nameJa: '配送', icon: Package },
  { key: 'production' as TabKey, name: '생산 설정', nameJa: '生産設定', icon: Package },
  { key: 'pricing' as TabKey, name: '가격 설정', nameJa: '価格設定', icon: Coins },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('film_material');
  const [settings, setSettings] = useState<Record<TabKey, CategoryData>>({} as Record<TabKey, CategoryData>);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
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

  const handleUpdate = async (category: string, key: string, value: number) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/settings/${category}/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setSettings(prev => ({
          ...prev,
          [category]: {
            ...prev[category as TabKey],
            [key]: {
              ...prev[category as TabKey][key],
              value
            }
          }
        }));
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

  const currentData = settings[activeTab] || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">시스템 설정</h1>
          <p className="text-sm text-gray-500 mt-1">단가 및 설정값 관리</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 overflow-x-auto p-2" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex items-center px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors
                      ${activeTab === tab.key
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{tab.name}</span>
                    <span className="sm:hidden">{tab.nameJa}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(currentData).map(([key, data]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {data.description || key}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={data.value}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        setSettings(prev => ({
                          ...prev,
                          [activeTab]: {
                            ...prev[activeTab],
                            [key]: { ...data, value: newValue }
                          }
                        }));
                      }}
                      disabled={saving}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-500 whitespace-nowrap">{data.unit}</span>
                    <button
                      onClick={() => handleUpdate(activeTab, key, data.value)}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(currentData).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                이 카테고리에는 설정이 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
