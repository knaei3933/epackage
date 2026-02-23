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
import { CheckCircle, XCircle, FileImage, FileText, Download, Clock, User, RefreshCw } from 'lucide-react';
import { BilingualCommentDisplay } from '@/components/shared/BilingualCommentDisplay';
import { TranslationStatusBadge } from '@/components/shared/TranslationStatusBadge';
import { RejectionReasonModal } from '@/components/member/RejectionReasonModal';

// =====================================================
// Types
// =====================================================

interface DesignRevision {
  id: string;
  order_id: string;
  revision_number: number;
  revision_name: string | null;
  order_item_id?: string | null;  // NEW: SKU association
  sku_name?: string | null;  // NEW: SKU name snapshot
  approval_status: 'pending' | 'approved' | 'rejected';
  preview_image_url: string | null;
  original_file_url: string | null;
  partner_comment: string | null;
  // Bilingual comment fields
  comment_ko?: string | null;
  comment_ja?: string | null;
  translation_status?: 'pending' | 'translated' | 'failed' | 'manual' | null;
  // Designer upload tracking
  uploaded_by_type?: 'admin' | 'korea_designer' | null;
  uploaded_by_name?: string | null;
  customer_comment: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
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
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [customerComment, setCustomerComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Rejection modal state
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectingRevisionId, setRejectingRevisionId] = useState<string | null>(null);
  const [rejectingRevisionName, setRejectingRevisionName] = useState<string | null>(null);
  // Retry translation state
  const [retryingTranslationId, setRetryingTranslationId] = useState<string | null>(null);

  // Load revisions and order items
  const loadRevisions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch revisions
      const response = await fetch(`/api/member/orders/${orderId}/design-revisions`);
      const result = await response.json();

      if (result.success) {
        setRevisions(result.revisions || []);

        // Fetch order items from the revisions data
        // We'll extract unique order items from the revisions
        const uniqueOrderItems = new Map<string, OrderItem>();
        result.revisions?.forEach((revision: DesignRevision) => {
          if (revision.order_item_id && !uniqueOrderItems.has(revision.order_item_id)) {
            // We'll need to fetch order item details separately
            // For now, store the ID and fetch details below
            uniqueOrderItems.set(revision.order_item_id, {
              id: revision.order_item_id,
              product_name: 'Loading...', // Will be updated
              quantity: 0,
            });
          }
        });

        // If we have order_item_ids, fetch their details
        if (uniqueOrderItems.size > 0) {
          try {
            const itemsResponse = await fetch(`/api/member/orders/${orderId}/items`);
            const itemsResult = await itemsResponse.json();
            if (itemsResult.success && itemsResult.items) {
              const itemsMap = new Map(itemsResult.items.map((item: OrderItem) => [item.id, item]));
              uniqueOrderItems.forEach((value, key) => {
                const detailedItem = itemsMap.get(key);
                if (detailedItem) {
                  uniqueOrderItems.set(key, detailedItem);
                }
              });
              setOrderItems(Array.from(uniqueOrderItems.values()));
            }
          } catch (err) {
            console.error('[DesignRevisionsSection] Failed to load order items:', err);
          }
        }
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
    // For rejection: open modal instead of direct submission
    if (status === 'rejected') {
      const revision = revisions.find(r => r.id === revisionId);
      setRejectingRevisionId(revisionId);
      setRejectingRevisionName(revision?.revision_name || null);
      setShowRejectionModal(true);
      return;
    }

    // For approval: direct submission
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
        setSuccessMessage('校正データを承認しました。');
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
  }, [orderId, customerComment, loadRevisions, revisions]);

  // Handle rejection submission from modal
  const handleRejectionSubmit = useCallback(async (reason: string, translatedReason: string) => {
    if (!rejectingRevisionId) return;

    try {
      setSubmitting(rejectingRevisionId);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(
        `/api/member/orders/${orderId}/design-revisions`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            revisionId: rejectingRevisionId,
            status: 'rejected',
            rejectionReason: reason,
            customerComment: customerComment || undefined,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('校正データを却下しました。');
        setCustomerComment('');
        setExpandedId(null);
        setShowRejectionModal(false);
        setRejectingRevisionId(null);
        setRejectingRevisionName(null);
        await loadRevisions(); // Reload list

        // Callback to notify parent component
        onRevisionResponded?.();
      } else {
        setError(result.error || '却下の送信に失敗しました。');
      }
    } catch (err) {
      console.error('[DesignRevisionsSection] Rejection error:', err);
      setError('予期しないエラーが発生しました。');
    } finally {
      setSubmitting(null);
    }
  }, [orderId, rejectingRevisionId, customerComment, loadRevisions, onRevisionResponded]);

  // Handle rejection modal close
  const handleRejectionModalClose = useCallback(() => {
    setShowRejectionModal(false);
    setRejectingRevisionId(null);
    setRejectingRevisionName(null);
  }, []);

  // Handle retry translation
  const handleRetryTranslation = useCallback(async (revisionId: string) => {
    try {
      setRetryingTranslationId(revisionId);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(
        `/api/member/orders/${orderId}/design-revisions/${revisionId}/retry-translation`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('翻訳を再試行しました。');
        await loadRevisions(); // Reload list
      } else {
        setError(result.error || '翻訳の再試行に失敗しました。');
      }
    } catch (err) {
      console.error('[DesignRevisionsSection] Retry translation error:', err);
      setError('予期しないエラーが発生しました。');
    } finally {
      setRetryingTranslationId(null);
    }
  }, [orderId, loadRevisions]);

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

  // Get SKU name helper function
  const getSkuName = (revision: DesignRevision) => {
    // Use sku_name snapshot if available (most accurate)
    if (revision.sku_name) {
      return revision.sku_name;
    }

    // Fallback to order_item_id lookup
    if (!revision.order_item_id) return 'すべてのSKU (All SKUs)';
    const item = orderItems.find(i => i.id === revision.order_item_id);
    return item ? `SKU-${item.id}_${item.product_name}_${item.quantity}` : 'Unknown SKU';
  };

  // Get preview URL - use proxy endpoint for proper authentication
  const getPreviewUrl = (revision: DesignRevision) => {
    // For Korean designer uploads, use the designer preview proxy endpoint
    if (revision.uploaded_by_type === 'korea_designer') {
      const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.package-lab.com';
      return `${appUrl}/api/designer/orders/${orderId}/correction/${revision.id}/preview`;
    }
    // For admin uploads, use the original URL or admin proxy
    return revision.preview_image_url;
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
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium">
                          {revision.revision_name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                        {/* Designer badge */}
                        {revision.uploaded_by_type === 'korea_designer' && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded flex items-center gap-1">
                            <User className="w-3 h-3" />
                            韓国デザイナー
                          </span>
                        )}
                        {/* Translation status badge */}
                        {revision.uploaded_by_type === 'korea_designer' && revision.translation_status && (
                          <TranslationStatusBadge
                            status={revision.translation_status}
                            size="sm"
                            animated={false}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {getSkuName(revision)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(revision.created_at)}
                        {revision.uploaded_by_name && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {revision.uploaded_by_name}
                            </span>
                          </>
                        )}
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
                    {/* Partner comment - Bilingual Display */}
                    {(revision.partner_comment || revision.comment_ko || revision.comment_ja) && (
                      <div>
                        <p className="text-sm font-medium mb-2">パートナーコメント:</p>
                        {/* Use bilingual display when bilingual data is available OR uploaded by Korean designer */}
                        {(revision.uploaded_by_type === 'korea_designer' || revision.comment_ko || revision.comment_ja) ? (
                          <BilingualCommentDisplay
                            commentKo={revision.comment_ko || revision.partner_comment || ''}
                            commentJa={revision.comment_ja || ''}
                            translationStatus={revision.translation_status || 'pending'}
                            showStatus={false}
                            defaultLanguage="ja"
                            variant="bordered"
                            isAdmin={false}
                          />
                        ) : (
                          /* Legacy display for admin uploads without bilingual data */
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                            {revision.partner_comment}
                          </p>
                        )}
                        {/* Failed translation notice for member */}
                        {revision.translation_status === 'failed' && (
                          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs text-amber-800">
                                翻訳エラーが発生しました。韓国語の原文のみ表示されています。
                              </p>
                              <Button
                                onClick={() => handleRetryTranslation(revision.id)}
                                disabled={retryingTranslationId === revision.id}
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs border-amber-300 text-amber-700 hover:bg-amber-100 whitespace-nowrap"
                              >
                                {retryingTranslationId === revision.id ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                    再試行中...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    再翻訳
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Preview image */}
                    {revision.preview_image_url && (
                      <div>
                        <p className="text-sm font-medium mb-2">プレビュー画像:</p>
                        <a
                          href={getPreviewUrl(revision)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={getPreviewUrl(revision)}
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
                          href={getPreviewUrl(revision)}
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

      {/* Rejection Reason Modal */}
      <RejectionReasonModal
        isOpen={showRejectionModal}
        onClose={handleRejectionModalClose}
        onSubmit={handleRejectionSubmit}
        submitting={submitting !== null}
        revisionName={rejectingRevisionName || undefined}
      />
    </Card>
  );
}
