/**
 * Custom hook for admin settings API operations
 *
 * Encapsulates all fetch/save logic for system settings.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { getJson, postJson, patchJson } from '@/lib/api-fetch';
import type { CategoryData, TabKey } from './types';

const TAB_KEYS: TabKey[] = [
  'film_material', 'pouch_processing', 'printing', 'lamination', 'slitter',
  'exchange_rate', 'delivery', 'production', 'pricing', 'designer', 'email', 'integrations'
];

const tabForCategory = (cat: string): TabKey => {
  if (cat === 'tax') return 'exchange_rate';
  return cat as TabKey;
};

function emptySettings(): Record<TabKey, CategoryData> {
  const obj = {} as Record<TabKey, CategoryData>;
  TAB_KEYS.forEach(k => { obj[k] = {}; });
  return obj;
}

export function useSettingsApi() {
  const [settings, setSettings] = useState<Record<TabKey, CategoryData>>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [modifiedSettings, setModifiedSettings] = useState<Set<string>>(new Set());

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const invalidateCache = useCallback(async () => {
    try {
      await postJson('/api/admin/settings/cache/invalidate');
      {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch {
      // cache invalidation is best-effort
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getJson<any>('/api/admin/settings');

      if (result.success) {
        const settingsWithOriginals = emptySettings();
        Object.entries(result.data).forEach(([category, data]: [string, any]) => {
          const tabKey = tabForCategory(category);
          if (!settingsWithOriginals[tabKey]) return;
          data.forEach((item: any) => {
            settingsWithOriginals[tabKey][item.key] = {
              value: item.value,
              description: item.description || item.key,
              unit: item.unit || '',
              originalValue: item.value,
              dbCategory: category,
              isActive: item.isActive !== false
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
  }, [showMessage]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSettingChange = useCallback((category: TabKey, key: string, newValue: number) => {
    const settingKey = `${category}.${key}`;
    setSettings(prev => {
      const currentValue = prev[category]?.[key]?.originalValue ?? prev[category]?.[key]?.value ?? 0;
      setModifiedSettings(modified => {
        const newSet = new Set(modified);
        if (newValue !== currentValue) {
          newSet.add(settingKey);
        } else {
          newSet.delete(settingKey);
        }
        return newSet;
      });
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: { ...prev[category][key], value: newValue }
        }
      };
    });
  }, []);

  const handleSaveOne = useCallback(async (category: TabKey, key: string) => {
    const settingKey = `${category}.${key}`;
    const newValue = settings[category]?.[key]?.value;
    const dbCategory = settings[category]?.[key]?.dbCategory || category;
    if (newValue === undefined) return;

    setSaving(true);
    try {
      const result = await patchJson<any>(`/api/admin/settings/${dbCategory}/${key}`, { value: newValue });
      if (result.success) {
        setSettings(prev => ({
          ...prev,
          [category]: { ...prev[category], [key]: { ...prev[category][key], originalValue: newValue } }
        }));
        setModifiedSettings(prev => { const n = new Set(prev); n.delete(settingKey); return n; });
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
  }, [settings, invalidateCache, showMessage]);

  const handleSaveAll = useCallback(async () => {
    if (modifiedSettings.size === 0) return;
    setSavingAll(true);
    const saves: Promise<void>[] = [];
    modifiedSettings.forEach(settingKey => {
      const [category, key] = settingKey.split('.');
      const tabData = settings[category as TabKey]?.[key];
      const newValue = tabData?.value;
      const dbCategory = tabData?.dbCategory || category;
      if (newValue !== undefined) {
        saves.push(
          patchJson<any>(`/api/admin/settings/${dbCategory}/${key}`, { value: newValue }).then(result => {
            if (!result.success) throw new Error(result.error || '저장 실패');
          })
        );
      }
    });
    try {
      await Promise.all(saves);
      const updatedSettings = { ...settings };
      modifiedSettings.forEach(settingKey => {
        const [category, key] = settingKey.split('.');
        updatedSettings[category as TabKey] = {
          ...updatedSettings[category as TabKey],
          [key]: { ...updatedSettings[category as TabKey][key], originalValue: updatedSettings[category as TabKey][key].value }
        };
      });
      setSettings(updatedSettings);
      setModifiedSettings(new Set());
      await invalidateCache();
      showMessage('success', `${modifiedSettings.size}개 설정이 저장되었습니다`);
    } catch (error) {
      console.error('Failed to save settings:', error);
      showMessage('error', '일부 설정 저장 실패');
    } finally {
      setSavingAll(false);
    }
  }, [modifiedSettings, settings, invalidateCache, showMessage]);

  const handleResetOne = useCallback((category: TabKey, key: string) => {
    const originalValue = settings[category]?.[key]?.originalValue;
    if (originalValue !== undefined) {
      handleSettingChange(category, key, originalValue);
    }
  }, [settings, handleSettingChange]);

  return {
    settings, setSettings, loading, saving, savingAll, message,
    modifiedSettings, setModifiedSettings,
    showMessage, loadSettings, handleSettingChange,
    handleSaveOne, handleSaveAll, handleResetOne,
  };
}

export type UseSettingsApiReturn = ReturnType<typeof useSettingsApi>;
