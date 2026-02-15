'use client';

import React, { useState, useEffect } from 'react';
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { Button } from '@/components/ui/Button';
import {
  ExternalLink,
  Download,
  Trash2,
  Calendar,
  Eye,
  FileText,
  Share2
} from 'lucide-react';

interface SavedComparisonsListProps {
  onLoadComparison?: (shareId: string) => void;
}

export function SavedComparisonsList({ onLoadComparison }: SavedComparisonsListProps) {
  const { state, loadSavedComparisons, deleteComparison, loadComparison, exportComparison } = useMultiQuantityQuote();
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSavedComparisons();
  }, [loadSavedComparisons]);

  const handleDelete = async (shareId: string) => {
    if (!confirm('この比較結果を削除してもよろしいですか？')) {
      return;
    }

    setActionLoading(shareId);
    try {
      const result = await deleteComparison(shareId);
      if (!result.success) {
        alert(`削除に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('削除中にエラーが発生しました');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLoad = async (shareId: string) => {
    setActionLoading(shareId);
    try {
      const result = await loadComparison(shareId);
      if (result.success) {
        onLoadComparison?.(shareId);
      } else {
        alert(`読み込みに失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error('Load error:', error);
      alert('読み込み中にエラーが発生しました');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async (shareId: string, format: 'pdf' | 'excel' | 'csv') => {
    setActionLoading(`${shareId}-${format}`);
    try {
      const result = await exportComparison(format);
      if (!result.success) {
        alert(`エクスポートに失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('エクスポート中にエラーが発生しました');
    } finally {
      setActionLoading(null);
    }
  };

  const handleShare = (shareUrl: string) => {
    navigator.clipboard.writeText(shareUrl);
    alert('共有URLをクリップボードにコピーしました');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading && state.savedComparisons.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (state.savedComparisons.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          保存された比較結果がありません
        </h3>
        <p className="text-gray-600 mb-4">
          比較結果を保存すると、ここに表示されます。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          保存された比較結果
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => loadSavedComparisons()}
          disabled={isLoading}
        >
          更新
        </Button>
      </div>

      <div className="grid gap-4">
        {state.savedComparisons.map((comparison: any) => (
          <div
            key={comparison.id}
            className={`border rounded-lg p-4 ${
              isExpired(comparison.expiresAt)
                ? 'border-gray-200 bg-gray-50'
                : 'border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-base font-medium text-gray-900 truncate">
                    {comparison.title || '無題の比較'}
                  </h4>
                  {isExpired(comparison.expiresAt) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      期限切れ
                    </span>
                  )}
                </div>

                {comparison.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {comparison.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(comparison.createdAt)}
                  </div>
                  {comparison.viewCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {comparison.viewCount}回表示
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {new Date(comparison.expiresAt) > new Date()
                      ? `${Math.ceil((new Date(comparison.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}日間有効`
                      : '期限切れ'}
                  </div>
                </div>

                {comparison.customerName && (
                  <div className="text-xs text-gray-600">
                    お客様: {comparison.customerName}
                  </div>
                )}
                {comparison.projectName && (
                  <div className="text-xs text-gray-600">
                    プロジェクト: {comparison.projectName}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
              {!isExpired(comparison.expiresAt) && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleLoad(comparison.shareId)}
                    disabled={actionLoading === comparison.shareId}
                    className="flex items-center gap-1"
                  >
                    {actionLoading === comparison.shareId ? (
                      <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ExternalLink className="w-3 h-3" />
                    )}
                    読み込む
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleShare(comparison.shareUrl)}
                    className="flex items-center gap-1"
                  >
                    <Share2 className="w-3 h-3" />
                    共有
                  </Button>

                  <div className="flex items-center gap-1 border-l border-gray-300 pl-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleExport(comparison.shareId, 'pdf')}
                      disabled={actionLoading === `${comparison.shareId}-pdf`}
                      title="PDFでエクスポート"
                    >
                      <FileText className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleExport(comparison.shareId, 'excel')}
                      disabled={actionLoading === `${comparison.shareId}-excel`}
                      title="Excelでエクスポート"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(comparison.shareId)}
                disabled={actionLoading === comparison.shareId}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}