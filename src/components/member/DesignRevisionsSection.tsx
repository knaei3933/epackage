/**
 * Design Revisions Section Component (Member)
 *
 * デザイン改訂セクションコンポーネント (会員用)
 * - 管理者がアップロードした校正データの表示
 * - プレビュー画像と原版ファイルの表示
 * - 承認/拒否の応答
 *
 * @client
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, FileImage, FileText, Download, Clock } from 'lucide-react';

// =====================================================
// Types
// =====================================================

interface DesignRevision {
  id: string;
  order_id: string;
  revision_number: number;
  revision_name: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  preview_image_url: string;
  original_file_url: string;
  partner_comment: string | null;
  customer_comment: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

interface DesignRevisionsSectionProps {
  orderId: string;
  onRevisionResponded?: () => void; // Callback after approve/reject
}

// =====================================================
// Component
// =====================================================

export function DesignRevisionsSection({ orderId, onRevisionResponded }: DesignRevisionsSectionProps) {
  const [revisions, setRevisions] = useState<DesignRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [customerComment, setCustomerComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load revisions
  const loadRevisions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/member/orders/${orderId}/design-revisions`);
      const result = await response.json();

      if (result.success) {
        setRevisions(result.revisions || []);
      } else {
        setError(result.error || 'デザイン改訂データの読み込みに失敗しました。');
      }
    } catch (err) {
      console.error('[DesignRevisionsSection] Load error:', err);
      setError('予期しないエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Respond to revision (approve/reject)
  const handleRespond = useCallback(async (revisionId: string, status: 'approved' | 'rejected') => {
    try {
      setSubmitting(revisionId);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(
        `/api/member/orders/${orderId}/design-revisions`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            revisionId,
            status,
            customerComment: customerComment || undefined,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(
          status === 'approved' ? '校正データを承認しました。' : '校正データを却下しました。'
        );
        setCustomerComment('');
        setExpandedId(null);
        await loadRevisions(); // Reload list

        // Callback to notify parent component
        onRevisionResponded?.();
      } else {
        setError(result.error || '応答の送信に失敗しました。');
      }
    } catch (err) {
      console.error('[DesignRevisionsSection] Respond error:', err);
      setError('予期しないエラーが発生しました。');
    } finally {
      setSubmitting(null);
    }
  }, [orderId, customerComment, loadRevisions]);

  // Load revisions on mount
  useEffect(() => {
    loadRevisions();
  }, [loadRevisions]);

  // Auto-expand first pending revision
  useEffect(() => {
    if (revisions.length > 0 && !expandedId) {
      const firstPending = revisions.find((r) => r.approval_status === 'pending');
      if (firstPending) {
        setExpandedId(firstPending.id);
      }
    }
  }, [revisions, expandedId]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Get file name from URL
  const getFileName = (url: string): string => {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'ファイル';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; className: string }> = {
      pending: { text: '承認待ち', className: 'bg-yellow-100 text-yellow-800' },
      approved: { text: '承認済み', className: 'bg-green-100 text-green-800' },
      rejected: { text: '却下', className: 'bg-red-100 text-red-800' },
    };
    return labels[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
  };

  // Filter pending revisions
  const pendingRevisions = revisions.filter((r) => r.approval_status === 'pending');
  const hasPendingRevisions = pendingRevisions.length > 0;
  const hasRevisions = revisions.length > 0;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileImage className="w-5 h-5" />
          デザイン校正データ
          {hasPendingRevisions && (
            <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800">
              {pendingRevisions.length} 件の承認待ち
            </span>
          )}
        </h2>
        {revisions.length > 0 && (
          <span className="text-sm text-muted-foreground">
            全 {revisions.length} 件
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          データを読み込み中...
        </div>
      ) : !hasRevisions ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>まだ校正データがありません。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {revisions.map((revision) => {
            const statusInfo = getStatusLabel(revision.approval_status);
            const isExpanded = expandedId === revision.id;
            const isPending = revision.approval_status === 'pending';

            return (
              <div
                key={revision.id}
                className={`border rounded-lg overflow-hidden ${
                  isPending ? 'border-orange-200 bg-orange-50/30' : 'border-border-secondary'
                }`}
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : revision.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">
                          {revision.revision_name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(revision.created_at)}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {isExpanded ? '折りたたむ' : '詳細を表示'}
                    </Button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="p-4 pt-0 space-y-4 border-t border-border-secondary">
                    {/* Partner comment */}
                    {revision.partner_comment && (
                      <div>
                        <p className="text-sm font-medium mb-1">パートナーコメント:</p>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                          {revision.partner_comment}
                        </p>
                      </div>
                    )}

                    {/* Preview image */}
                    {revision.preview_image_url && (
                      <div>
                        <p className="text-sm font-medium mb-2">プレビュー画像:</p>
                        <a
                          href={revision.preview_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={revision.preview_image_url}
                            alt="プレビュー"
                            className="max-w-full h-auto rounded-lg border border-border-secondary hover:opacity-80 transition-opacity"
                          />
                        </a>
                      </div>
                    )}

                    {/* Files */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {revision.preview_image_url && (
                        <a
                          href={revision.preview_image_url}
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
                      {revision.original_file_url && (
                        <a
                          href={revision.original_file_url}
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

                    {/* Customer response (for approved/rejected) */}
                    {!isPending && revision.customer_comment && (
                      <div>
                        <p className="text-sm font-medium mb-1">ご回答:</p>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                          {revision.customer_comment}
                        </p>
                      </div>
                    )}

                    {/* Action buttons for pending revisions */}
                    {isPending && (
                      <>
                        {/* Comment input */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            コメント (任意)
                          </label>
                          <textarea
                            value={customerComment}
                            onChange={(e) => setCustomerComment(e.target.value)}
                            placeholder="承認/拒否の理由やコメントを入力してください..."
                            rows={3}
                            className="w-full px-3 py-2 border border-border-secondary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={submitting === revision.id}
                          />
                        </div>

                        {/* Action buttons - 强调样式 */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleRespond(revision.id, 'approved')}
                            disabled={submitting === revision.id}
                            className="flex-1 h-12 text-base font-semibold bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            承認する
                          </Button>
                          <Button
                            onClick={() => handleRespond(revision.id, 'rejected')}
                            disabled={submitting === revision.id}
                            variant="outline"
                            className="flex-1 h-12 text-base border-2 border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-5 h-5 mr-2" />
                            却下する
                          </Button>
                        </div>

                        {submitting === revision.id && (
                          <div className="text-center text-sm text-muted-foreground">
                            送信中...
                          </div>
                        )}
                      </>
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
