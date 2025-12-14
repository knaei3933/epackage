'use client';

import React, { useState } from 'react';
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { Button } from '@/components/ui/Button';
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Loader2,
  Check,
  X
} from 'lucide-react';

interface ExportMenuProps {
  onClose?: () => void;
  onExport?: (result: { success: boolean; format: string; error?: string }) => void;
}

export function ExportMenu({ onClose, onExport }: ExportMenuProps) {
  const { exportComparison, state } = useMultiQuantityQuote();
  const [exportOptions, setExportOptions] = useState({
    includeBreakdown: true,
    includeRecommendations: true,
    includeCharts: true,
    language: 'ja' as 'ja' | 'en',
    currency: 'JPY',
  });
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<{ [key: string]: 'success' | 'error' | null }>({});

  const formats = [
    {
      id: 'pdf',
      name: 'PDF',
      description: '印刷用の高品質な書類',
      icon: FileText,
      mimeType: 'application/pdf',
      extension: 'pdf'
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'データ分析用のスプレッドシート',
      icon: FileSpreadsheet,
      mimeType: 'application/vnd.ms-excel',
      extension: 'csv'
    },
    {
      id: 'csv',
      name: 'CSV',
      description: '表計算ソフト用のデータ',
      icon: File,
      mimeType: 'text/csv',
      extension: 'csv'
    }
  ];

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!state.comparison) {
      alert('エクスポートできる比較結果がありません');
      return;
    }

    setIsExporting(format);
    setExportStatus(prev => ({ ...prev, [format]: null }));

    try {
      const result = await exportComparison(format, exportOptions);

      if (result.success) {
        setExportStatus(prev => ({ ...prev, [format]: 'success' }));
        onExport?.({ success: true, format });

        // Clear success status after 3 seconds
        setTimeout(() => {
          setExportStatus(prev => ({ ...prev, [format]: null }));
        }, 3000);
      } else {
        setExportStatus(prev => ({ ...prev, [format]: 'error' }));
        onExport?.({ success: false, format, error: result.error });

        // Clear error status after 3 seconds
        setTimeout(() => {
          setExportStatus(prev => ({ ...prev, [format]: null }));
        }, 3000);
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus(prev => ({ ...prev, [format]: 'error' }));
      onExport?.({ success: false, format, error: 'エクスポート中にエラーが発生しました' });
    } finally {
      setIsExporting(null);
    }
  };

  const getStatusIcon = (format: string) => {
    const status = exportStatus[format];
    if (status === 'success') {
      return <Check className="w-4 h-4 text-green-600" />;
    } else if (status === 'error') {
      return <X className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  if (!state.comparison) {
    return (
      <div className="text-center py-6">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          エクスポートできるデータがありません
        </h3>
        <p className="text-gray-600 text-sm">
          まず比較を実行して結果を生成してください。
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">エクスポート</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          比較結果を様々な形式でエクスポートできます。
        </p>
      </div>

      {/* Export Options */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">エクスポートオプション</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={exportOptions.includeBreakdown}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeBreakdown: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">価格詳細を含める</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={exportOptions.includeRecommendations}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">推奨事項を含める</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={exportOptions.includeCharts}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">グラフを含める（PDFのみ）</span>
          </label>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">言語</label>
            <select
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={exportOptions.language}
              onChange={(e) => setExportOptions(prev => ({ ...prev, language: e.target.value as 'ja' | 'en' }))}
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">通貨</label>
            <select
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={exportOptions.currency}
              onChange={(e) => setExportOptions(prev => ({ ...prev, currency: e.target.value }))}
            >
              <option value="JPY">円 (JPY)</option>
              <option value="USD">ドル (USD)</option>
              <option value="EUR">ユーロ (EUR)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Format Selection */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">フォーマットを選択</h4>
        <div className="space-y-2">
          {formats.map((format) => {
            const Icon = format.icon;
            const isCurrentlyExporting = isExporting === format.id;
            const status = exportStatus[format.id];

            return (
              <div
                key={format.id}
                className={`relative border rounded-lg p-3 transition-colors ${
                  status === 'success' ? 'border-green-200 bg-green-50' :
                  status === 'error' ? 'border-red-200 bg-red-50' :
                  'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-md ${
                      format.id === 'pdf' ? 'bg-red-100 text-red-600' :
                      format.id === 'excel' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{format.name}</div>
                      <div className="text-sm text-gray-600">{format.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(format.id)}
                    <Button
                      size="sm"
                      onClick={() => handleExport(format.id as 'pdf' | 'excel' | 'csv')}
                      disabled={isCurrentlyExporting}
                      className="flex items-center gap-2"
                    >
                      {isCurrentlyExporting ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          エクスポート中...
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3" />
                          エクスポート
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          エクスポートされたファイルには比較結果のすべてが含まれます。
          <br />
          機密情報が含まれる場合は、共有先にご注意ください。
        </div>
      </div>
    </div>
  );
}