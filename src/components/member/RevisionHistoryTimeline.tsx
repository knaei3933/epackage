/**
 * Data History Timeline Component
 *
 * データ履歴タイムラインコンポーネント
 * - 入稿データ〜校正データの時系列履歴を表示
 * - 顧客ファイル提出、校正データ、承認/拒否情報を表示
 * - 展開可能な詳細セクション
 * - ファイルダウンロードリンク
 *
 * @client
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { FileImage, FileText, Download, Clock, User, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// =====================================================
// Types
// =====================================================

interface RevisionHistoryEntry {
  revision: {
    id: string;
    revision_number: number;
    approval_status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    original_customer_filename: string | null;
    generated_correction_filename: string | null;
    preview_image_url: string | null;
    original_file_url: string | null;
    partner_comment: string | null;
    customer_comment: string | null;
  };
  submission: {
    id: string | null;
    original_filename: string | null;
    submission_number: number | null;
    file_url: string | null;  // 入稿ファイルのURL
  } | null;
  rejection: {
    reason: string | null;
    rejected_at: string | null;
    rejected_by_name: string | null;
  } | null;
  approval: {
    approved_at: string | null;
    approved_by_name: string | null;
  } | null;
}

interface RevisionHistoryTimelineProps {
  orderId: string;
}

interface HistoryResponse {
  success: boolean;
  history?: RevisionHistoryEntry[];
  error?: string;
}

// =====================================================
// Component
// =====================================================

export function RevisionHistoryTimeline({ orderId }: RevisionHistoryTimelineProps) {
  const [history, setHistory] = useState<RevisionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Get preview URL via proxy to avoid CORS issues
  const getPreviewUrl = (revisionId: string) => {
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.package-lab.com';
    return `${appUrl}/api/designer/orders/${orderId}/correction/${revisionId}/preview`;
  };

  // Load revision history
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/member/orders/${orderId}/revision-history`);
      const result: HistoryResponse = await response.json();

      if (result.success && result.history) {
        setHistory(result.history);
      } else {
        setError(result.error || 'データ履歴の読み込みに失敗しました。');
      }
    } catch (err) {
      console.error('[DataHistoryTimeline] Load error:', err);
      setError('予期しないエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Toggle expanded state
  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: '承認待ち',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="w-4 h-4" />,
      },
      approved: {
        label: '承認済み',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      rejected: {
        label: '却下',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="w-4 h-4" />,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={cn(
        'inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border',
        config.className
      )}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          データ履歴
        </h2>
        {history.length > 0 && (
          <span className="text-sm text-muted-foreground">
            全 {history.length} 件
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          データを読み込み中...
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>まだデータ履歴がありません。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => {
            const isExpanded = expandedIds.has(entry.revision.id);

            return (
              <div
                key={entry.revision.id}
                className="border rounded-lg overflow-hidden border-border-secondary"
              >
                {/* Header - Always Visible */}
                <div
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExpanded(entry.revision.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Expand/Collapse Icon */}
                    <button
                      className="flex-shrink-0 mt-1 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(entry.revision.id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>

                    {/* Timeline Icon */}
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2",
                        entry.revision.approval_status === 'pending' && "bg-yellow-100 border-yellow-400",
                        entry.revision.approval_status === 'approved' && "bg-green-100 border-green-400",
                        entry.revision.approval_status === 'rejected' && "bg-red-100 border-red-400"
                      )}>
                        <span className="text-sm font-bold">
                          R{entry.revision.revision_number}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium">
                          リビジョン {entry.revision.revision_number}
                        </h3>
                        {getStatusBadge(entry.revision.approval_status)}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <Clock className="w-3 h-3" />
                        {formatDate(entry.revision.created_at)}
                      </div>

                      {/* Quick Summary */}
                      <div className="text-sm space-y-1">
                        {entry.submission && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-medium">入稿ファイル:</span>
                            <span className="truncate">{entry.submission.original_filename}</span>
                          </div>
                        )}
                        {entry.revision.generated_correction_filename && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-medium">校正ファイル:</span>
                            <span className="truncate">{entry.revision.generated_correction_filename}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Summary */}
                      {entry.rejection && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                          <div className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-red-900">却下されました</p>
                              {entry.rejection.reason && (
                                <p className="text-red-700 text-xs mt-1 line-clamp-2">{entry.rejection.reason}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {entry.approval && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-green-900">承認されました</p>
                              {entry.approval.approved_by_name && (
                                <p className="text-green-700 text-xs mt-1">
                                  承認者: {entry.approval.approved_by_name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-border-secondary space-y-4">
                    {/* Customer Submission Details */}
                    {entry.submission && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          入稿ファイル
                        </h4>
                        <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ファイル名:</span>
                            <span className="font-medium">{entry.submission.original_filename}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">提出番号:</span>
                            <span className="font-medium">#{entry.submission.submission_number}</span>
                          </div>
                        </div>
                        {/* 入稿ファイルダウンロードリンク */}
                        {entry.submission.file_url && (
                          <a
                            href={entry.submission.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-2 p-3 rounded-lg border border-border-secondary hover:bg-muted/50 transition-colors"
                          >
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">入稿ファイルをダウンロード</p>
                              <p className="text-xs text-muted-foreground">クリックして開く</p>
                            </div>
                            <Download className="w-4 h-4 text-muted-foreground" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Correction File Details */}
                    {entry.revision.generated_correction_filename && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <FileImage className="w-4 h-4 text-purple-600" />
                          校正データ
                        </h4>
                        <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ファイル名:</span>
                            <span className="font-medium">{entry.revision.generated_correction_filename}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">作成日時:</span>
                            <span className="font-medium">{formatDateTime(entry.revision.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* File Download Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {entry.revision.preview_image_url && (
                        <a
                          href={getPreviewUrl(entry.revision.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 rounded-lg border border-border-secondary hover:bg-muted/50 transition-colors"
                        >
                          <FileImage className="w-5 h-5 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">プレビュー画像</p>
                            <p className="text-xs text-muted-foreground">クリックして開く</p>
                          </div>
                          <Download className="w-4 h-4 text-muted-foreground" />
                        </a>
                      )}
                      {entry.revision.original_file_url && (
                        <a
                          href={entry.revision.original_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 rounded-lg border border-border-secondary hover:bg-muted/50 transition-colors"
                        >
                          <FileText className="w-5 h-5 text-purple-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">原版ファイル</p>
                            <p className="text-xs text-muted-foreground">クリックして開く</p>
                          </div>
                          <Download className="w-4 h-4 text-muted-foreground" />
                        </a>
                      )}
                    </div>

                    {/* Partner Comment */}
                    {entry.revision.partner_comment && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <User className="w-4 h-4 text-orange-600" />
                          パートナーコメント
                        </h4>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                          {entry.revision.partner_comment}
                        </p>
                      </div>
                    )}

                    {/* Customer Comment */}
                    {entry.revision.customer_comment && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <User className="w-4 h-4 text-green-600" />
                          顧客コメント
                        </h4>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                          {entry.revision.customer_comment}
                        </p>
                      </div>
                    )}

                    {/* Rejection Details */}
                    {entry.rejection && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          却下詳細
                        </h4>
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg space-y-2">
                          {entry.rejection.reason && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">却下理由:</p>
                              <p className="text-sm text-red-900">{entry.rejection.reason}</p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {entry.rejection.rejected_at && (
                              <div>
                                <span className="text-muted-foreground">却下日時:</span>
                                <p className="font-medium">{formatDateTime(entry.rejection.rejected_at)}</p>
                              </div>
                            )}
                            {entry.rejection.rejected_by_name && (
                              <div>
                                <span className="text-muted-foreground">却下者:</span>
                                <p className="font-medium">{entry.rejection.rejected_by_name}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Approval Details */}
                    {entry.approval && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          承認詳細
                        </h4>
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {entry.approval.approved_at && (
                              <div>
                                <span className="text-muted-foreground">承認日時:</span>
                                <p className="font-medium">{formatDateTime(entry.approval.approved_at)}</p>
                              </div>
                            )}
                            {entry.approval.approved_by_name && (
                              <div>
                                <span className="text-muted-foreground">承認者:</span>
                                <p className="font-medium">{entry.approval.approved_by_name}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
