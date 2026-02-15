'use client';

/**
 * Specification Sheet Version Manager Component
 *
 * 仕様書バージョン管理コンポーネント
 * - バージョン履歴表示
 * - バージョン比較
 * - 変更点のハイライト
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  GitCompare,
  History,
  ChevronDown,
  ChevronUp,
  FileText,
  Check,
  X,
  Plus,
  Minus,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  Copy,
} from 'lucide-react';
import type { SpecSheetData } from '@/types/specsheet';

// ============================================================
// Types
// ============================================================

interface SpecSheetVersion {
  id: string;
  specNumber: string;
  revision: string;
  issueDate: string;
  status: SpecSheetData['status'];
  title: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  data: SpecSheetData;
}

interface VersionDiff {
  field: string;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'removed' | 'modified';
}

interface VersionManagerProps {
  specNumber: string;
  currentRevision: string;
  onVersionSelect?: (version: SpecSheetVersion) => void;
  onCompare?: (version1: SpecSheetVersion, version2: SpecSheetVersion) => void;
  className?: string;
}

// ============================================================
// Helper Functions
// ============================================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Field labels in Japanese
const fieldLabels: Record<string, string> = {
  revision: '版数',
  issueDate: '発行日',
  title: 'タイトル',
  description: '説明',
  'customer.name': '顧客名',
  'customer.contactPerson': '担当者',
  'product.name': '製品名',
  'product.productCode': '製品コード',
  'product.dimensions.length': '長さ (mm)',
  'product.dimensions.width': '幅 (mm)',
  'product.dimensions.height': '高さ (mm)',
  'product.dimensions.thickness': '厚み (μm)',
  'production.method': '生産方法',
  'production.delivery.leadTime': 'リードタイム',
  'production.delivery.minLotSize': '最小ロット',
  status: 'ステータス',
  remarks: '備考',
};

// ============================================================
// Diff Calculation
// ============================================================

function calculateDiffs(
  version1: SpecSheetData,
  version2: SpecSheetData
): VersionDiff[] {
  const diffs: VersionDiff[] = [];

  // Helper function to compare nested objects
  function compareObjects(
    obj1: any,
    obj2: any,
    prefix = ''
  ): VersionDiff[] {
    const results: VersionDiff[] = [];
        const allKeys = new Set([
      ...Object.keys(obj1 || {}),
      ...Object.keys(obj2 || {}),
    ]);

    allKeys.forEach(key => {
      const field = prefix ? `${prefix}.${key}` : key;
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];

      // Skip null/undefined comparison if both are empty
      if ((val1 === null || val1 === undefined) && (val2 === null || val2 === undefined)) {
        return;
      }

      // Handle nested objects
      if (
        typeof val1 === 'object' &&
        val1 !== null &&
        !Array.isArray(val1) &&
        typeof val2 === 'object' &&
        val2 !== null &&
        !Array.isArray(val2)
      ) {
        results.push(...compareObjects(val1, val2, field));
        return;
      }

      // Handle arrays
      if (Array.isArray(val1) || Array.isArray(val2)) {
        const arr1 = val1 || [];
        const arr2 = val2 || [];

        if (JSON.stringify(arr1) !== JSON.stringify(arr2)) {
          results.push({
            field,
            fieldLabel: fieldLabels[field] || field,
            oldValue: arr1.length > 0 ? arr1 : undefined,
            newValue: arr2.length > 0 ? arr2 : undefined,
            changeType: !val1 ? 'added' : !val2 ? 'removed' : 'modified',
          });
        }
        return;
      }

      // Handle primitive values
      if (val1 !== val2) {
        results.push({
          field,
          fieldLabel: fieldLabels[field] || field,
          oldValue: val1,
          newValue: val2,
          changeType: val1 === undefined || val1 === null ? 'added' :
                     val2 === undefined || val2 === null ? 'removed' : 'modified',
        });
      }
    });

    return results;
  }

  diffs.push(...compareObjects(version1, version2));

  return diffs;
}

// ============================================================
// Component
// ============================================================

export default function VersionManager({
  specNumber,
  currentRevision,
  onVersionSelect,
  onCompare,
  className = '',
}: VersionManagerProps) {
  const [versions, setVersions] = useState<SpecSheetVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set());
  const [diffs, setDiffs] = useState<VersionDiff[]>([]);

  // ============================================================
  // Fetch Versions
  // ============================================================

  const fetchVersions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/specsheet/versions?specNumber=${specNumber}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '取得に失敗しました');
      }

      setVersions(data.versions || []);
    } catch (err) {
      console.error('Fetch versions error:', err);
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [specNumber]);

  // ============================================================
  // Version Selection
  // ============================================================

  const toggleVersionSelection = useCallback((versionId: string) => {
    setSelectedVersions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(versionId)) {
        newSet.delete(versionId);
      } else if (newSet.size < 2) {
        newSet.add(versionId);
      }
      return newSet;
    });
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedVersions.size !== 2) return;

    const [id1, id2] = Array.from(selectedVersions);
    const version1 = versions.find(v => v.id === id1);
    const version2 = versions.find(v => v.id === id2);

    if (!version1 || !version2) return;

    // Calculate diffs
    const calculatedDiffs = calculateDiffs(version1.data, version2.data);
    setDiffs(calculatedDiffs);

    if (onCompare) {
      onCompare(version1, version2);
    }
  }, [selectedVersions, versions, onCompare]);

  const exitCompareMode = useCallback(() => {
    setCompareMode(false);
    setSelectedVersions(new Set());
    setDiffs([]);
  }, []);

  // ============================================================
  // Effects
  // ============================================================

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  // ============================================================
  // Render
  // ============================================================

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 bg-red-50 border-red-200 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-800">エラー</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center py-8">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">バージョン履歴はありません</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">バージョン履歴</h3>
              <p className="text-sm text-gray-600">
                {versions.length}件のバージョン
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!compareMode ? (
              <>
                {versions.length > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCompareMode(true)}
                  >
                    <GitCompare className="w-4 h-4 mr-2" />
                    比較
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={exitCompareMode}
                >
                  <X className="w-4 h-4 mr-2" />
                  キャンセル
                </Button>
                <Button
                  onClick={handleCompare}
                  disabled={selectedVersions.size !== 2}
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  比較実行
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Version List */}
      {expanded && (
        <div className="space-y-3">
          {versions.map((version, index) => {
            const isCurrent = version.revision === currentRevision;
            const isSelected = selectedVersions.has(version.id);

            return (
              <Card
                key={version.id}
                className={`p-4 ${
                  isCurrent ? 'border-blue-500 border-2' : ''
                } ${isSelected ? 'bg-blue-50' : ''} ${
                  compareMode ? 'cursor-pointer hover:bg-gray-50' : ''
                }`}
                onClick={() => compareMode && toggleVersionSelection(version.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Compare Mode Checkbox */}
                    {compareMode && (
                      <div
                        className={`w-5 h-5 border rounded flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    )}

                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">
                        {versions.length - index}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          v{version.revision}
                        </p>
                        {isCurrent && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            現在
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(version.issueDate)} | {version.createdBy}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        version.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : version.status === 'superseded'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {version.status === 'active'
                        ? '有効'
                        : version.status === 'superseded'
                          ? '旧版'
                          : '下書き'}
                    </span>

                    {!compareMode && onVersionSelect && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVersionSelect(version);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {version.description && (
                  <p className="text-sm text-gray-600 mt-2 ml-14">
                    {version.description}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Compare Mode Selection Hint */}
      {compareMode && selectedVersions.size < 2 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            比較する2つのバージョンを選択してください ({selectedVersions.size}/2)
          </p>
        </Card>
      )}

      {/* Diff Results */}
      {diffs.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <GitCompare className="w-5 h-5" />
              変更点 ({diffs.length}件)
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={exitCompareMode}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {diffs.map((diff, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  diff.changeType === 'added'
                    ? 'bg-green-50 border-green-500'
                    : diff.changeType === 'removed'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {diff.changeType === 'added' ? (
                    <Plus className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : diff.changeType === 'removed' ? (
                    <Minus className="w-5 h-5 text-red-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  )}

                  <div className="flex-1">
                    <p className="font-medium">{diff.fieldLabel}</p>
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      {diff.oldValue !== undefined && (
                        <div>
                          <span className="text-gray-600">旧値:</span>
                          <div className="mt-1 p-2 bg-white rounded border">
                            {formatDiffValue(diff.oldValue)}
                          </div>
                        </div>
                      )}
                      {diff.newValue !== undefined && (
                        <div>
                          <span className="text-gray-600">新値:</span>
                          <div className="mt-1 p-2 bg-white rounded border">
                            {formatDiffValue(diff.newValue)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {diffs.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p>変更点はありません</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ============================================================
// Helper to format diff values for display
// ============================================================

function formatDiffValue(value: any): string {
  if (value === null || value === undefined) {
    return '-';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '(空)';
    return value.map((v, i) => `${i + 1}. ${JSON.stringify(v)}`).join('\n');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

// ============================================================
// Standalone Version Comparison Component
// ============================================================

interface VersionComparisonProps {
  version1: SpecSheetVersion;
  version2: SpecSheetVersion;
  onClose?: () => void;
}

export function VersionComparison({
  version1,
  version2,
  onClose,
}: VersionComparisonProps) {
  const diffs = calculateDiffs(version1.data, version2.data);

  return (
    <div className="space-y-6">
      {/* Version Info */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">バージョン 1</p>
          <p className="font-semibold">v{version1.revision}</p>
          <p className="text-sm">{formatDate(version1.issueDate)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">バージョン 2</p>
          <p className="font-semibold">v{version2.revision}</p>
          <p className="text-sm">{formatDate(version2.issueDate)}</p>
        </Card>
      </div>

      {/* Diffs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">
            変更点 ({diffs.length}件)
          </h4>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {diffs.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p>変更点はありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {diffs.map((diff, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  diff.changeType === 'added'
                    ? 'bg-green-50 border-green-500'
                    : diff.changeType === 'removed'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <p className="font-medium">{diff.fieldLabel}</p>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  {diff.oldValue !== undefined && (
                    <div>
                      <span className="text-gray-600">旧値:</span>
                      <div className="mt-1 p-2 bg-white rounded border">
                        {formatDiffValue(diff.oldValue)}
                      </div>
                    </div>
                  )}
                  {diff.newValue !== undefined && (
                    <div>
                      <span className="text-gray-600">新値:</span>
                      <div className="mt-1 p-2 bg-white rounded border">
                        {formatDiffValue(diff.newValue)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ============================================================
// Version History List Component (Compact)
// ============================================================

interface VersionHistoryListProps {
  versions: SpecSheetVersion[];
  currentRevision: string;
  onSelect?: (version: SpecSheetVersion) => void;
  className?: string;
}

export function VersionHistoryList({
  versions,
  currentRevision,
  onSelect,
  className = '',
}: VersionHistoryListProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="font-semibold text-sm text-gray-700">バージョン履歴</h4>

      <div className="space-y-2">
        {versions.map((version, index) => {
          const isCurrent = version.revision === currentRevision;

          return (
            <div
              key={version.id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                isCurrent
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => onSelect?.(version)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCurrent ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`font-bold text-sm ${
                      isCurrent ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {versions.length - index}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">v{version.revision}</p>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded">
                        現在
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    {formatDate(version.issueDate)}
                  </p>
                </div>
              </div>

              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
