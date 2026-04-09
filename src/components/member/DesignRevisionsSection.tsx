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
import { PostProcessingPositionDisplay } from '@/components/member/PostProcessingPositionDisplay';

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
  // 後加工位置情報State / 후가공 위치 정보 상태
  const [postProcessingPositions, setPostProcessingPositions] = useState<Map<string, any>>(new Map());
  const [loadingPostProcessing, setLoadingPostProcessing] = useState<string | null>(null);
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

      // 後加工位置情報を読み込み / 후가공 위치 정보 로드
      if (result.success && result.revisions && result.revisions.length > 0) {
        await loadPostProcessingPositions(result.revisions.map((r: DesignRevision) => r.id));
      }
    } catch (err) {
      console.error('[DesignRevisionsSection] Load error:', err);
      setError('予期しないエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // 後加工位置情報読み込み関수 / 후가공 위치 정보 로드 함수
  const loadPostProcessingPositions = useCallback(async (revisionIds: string[]) => {
    if (revisionIds.length === 0) return;

    setLoadingPostProcessing('loading');

    const positionsMap = new Map<string, any>();

    for (const revisionId of revisionIds) {
      try {
        const response = await fetch(`/api/design-revisions/${revisionId}/postprocessing-positions`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.positions) {
            data.positions.forEach((pos: any) => {
              positionsMap.set(pos.sku_name, pos);
            });
          }
        }
      } catch (err) {
        console.error(`[DesignRevisionsSection] Failed to load post-processing for revision ${revisionId}:`, err);
      }
    }

    setPostProcessingPositions(positionsMap);
    setLoadingPostProcessing(null);
  }, []);

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

  // Format revision name from "リビジョン N" to "第N版"
  const formatRevisionName = (revisionName: string | null, revisionNumber: number) => {
    if (revisionName && revisionName.includes('リビジョン')) {
      return revisionName.replace(/リビジョン\s*(\d+)/, '第$1版');
    }
    return revisionName || `第${revisionNumber}版`;
  };

  // Get status label with improved styling
  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; className: string; icon: React.ReactNode }> = {
      pending: {
        text: '承認待ち',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <Clock className="w-3.5 h-3.5" />
      },
      approved: {
        text: '承認済み',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle className="w-3.5 h-3.5" />
      },
      rejected: {
        text: '却下',
        className: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: <XCircle className="w-3.5 h-3.5" />
      },
    };
    return labels[status] || { text: status, className: 'bg-gray-50 text-gray-700 border-gray-200', icon: null };
  };

  // Get SKU name helper function
  const getSkuName = (revision: DesignRevision) => {
    // Use sku_name snapshot if available, parse and reformat it
    if (revision.sku_name) {
      return parseAndFormatSkuName(revision.sku_name);
    }

    // Fallback to order_item_id lookup
    if (!revision.order_item_id) return 'すべてのSKU (All SKUs)';
    const item = orderItems.find(i => i.id === revision.order_item_id);
    if (!item) return 'Unknown SKU';

    // Extract product type from product_name or use a default
    const productType = extractProductType(item.product_name);
    const simplifiedName = simplifyProductName(item.product_name);

    return `SKU-${revision.order_item_id}_${simplifiedName}_${productType}_${item.quantity}`;
  };

  // Parse and reformat existing SKU name to new format
  const parseAndFormatSkuName = (skuName: string): string => {
    // Extract SKU number from existing format: "SKU-{uuid}_スタンドパウチ - アルミ箔ラミネートによる高バリア性 (SKU 1)_1000"
    const skuNumberMatch = skuName.match(/\(SKU\s+(\d+)\)/);
    const skuNumber = skuNumberMatch ? skuNumberMatch[1] : '1';

    // Extract product type (スタンドパウチ, 三方詰, etc.)
    const productType = extractProductType(skuName);

    // Extract quantity from end of string
    const quantityMatch = skuName.match(/_(\d+)(?:枚)?$/);
    const quantity = quantityMatch ? quantityMatch[1] : '0';

    // Extract product name:
    // 1. Remove the initial "SKU-{uuid}_" or "SKU-" prefix
    // 2. Find and extract the product type name
    // 3. Get everything between the first underscore and " (SKU n)"
    let productName = '미입력';

    // Remove "SKU-{uuid}_" prefix first
    const withoutPrefix = skuName.replace(/^SKU-[\w-]+_/, '');

    // Now extract product name (between first occurrence and " (SKU n)")
    const skuNumberIndex = withoutPrefix.indexOf(' (SKU ');
    if (skuNumberIndex !== -1) {
      let rawName = withoutPrefix.substring(0, skuNumberIndex);
      // Remove product type from the name
      rawName = rawName.replace(new RegExp(`^${productType}\\s*[-–]?\\s*`, 'i'), '');
      // Clean up
      rawName = rawName.trim().replace(/^[-–]?\s*/, '');
      productName = rawName || '미입력';
    } else {
      // Fallback: try to extract something meaningful
      const withoutQuantity = withoutPrefix.replace(/_\d+$/, '');
      productName = withoutQuantity || '미입력';
    }

    return `SKU-${skuNumber}_${productName}_${productType}_${quantity}`;
  };

  // Extract SKU number from UUID or generate a sequential number
  const extractNumberFromId = (id: string): string => {
    // Try to extract a number from the string
    const match = id.match(/(\d+)/);
    return match ? match[1] : '1';
  };

  // Extract product type from string
  const extractProductType = (str: string): string => {
    const types = [
      'スタンドパウチ',
      '三方詰',
      'ピローパウチ',
      'ギューズマウチ',
      'チャック付き平袋',
      'レトルトパウチ'
    ];

    for (const type of types) {
      if (str.includes(type)) {
        return type;
      }
    }

    return 'パウチ';
  };

  // Simplify product name by removing type suffixes
  const simplifyProductName = (productName: string): string => {
    let simplified = productName;

    // Remove product type from name to avoid duplication
    const types = [
      'スタンドパウチ',
      '三方詰',
      'ピローパウチ',
      'ギューズマウチ',
      'チャック付き平袋',
      'レトルトパウチ'
    ];

    types.forEach(type => {
      simplified = simplified.replace(new RegExp(`${type}`, 'g'), '');
    });

    // Clean up separators and extra spaces
    simplified = simplified
      .replace(/^[\s\-_]+/, '')
      .replace(/[\s\-_]+$/, '')
      .replace(/[\s\-_]{2,}/, ' ')
      .trim();

    return simplified || '商品';
  };

  // Get preview URL - use proxy endpoint to avoid CORS issues
  const getPreviewUrl = (revision: DesignRevision) => {
    // Always use the proxy endpoint for all uploads to avoid CORS issues
    // This works for both Korean designer uploads and admin uploads
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.package-lab.com';
    return `${appUrl}/api/designer/orders/${orderId}/correction/${revision.id}/preview`;
  };

  // Filter pending revisions
  const pendingRevisions = revisions.filter((r) => r.approval_status === 'pending');
  const hasPendingRevisions = pendingRevisions.length > 0;
  const hasRevisions = revisions.length > 0;

  return (
    <Card className="p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <FileImage className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">デザイン校正データ</h2>
            {revisions.length > 0 && (
              <p className="text-sm text-gray-600 mt-0.5">全 {revisions.length} 件</p>
            )}
          </div>
        </div>
        {hasPendingRevisions && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-sm font-bold text-amber-800">
              {pendingRevisions.length} 件の承認待ち
            </span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-5 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg shadow-sm">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-900">エラーが発生しました</p>
              <p className="text-sm text-rose-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="mb-5 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-900">完了しました</p>
              <p className="text-sm text-emerald-700 mt-1">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-blue-50 rounded-2xl border border-blue-200">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-blue-700 font-medium">データを読み込み中...</span>
          </div>
        </div>
      ) : !hasRevisions ? (
        <div className="text-center py-16">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
              <FileImage className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <p className="text-gray-700 font-medium mb-1">まだ校正データがありません</p>
              <p className="text-sm text-gray-500">デザイナーが校正データをアップロードするまでお待ちください</p>
            </div>
          </div>
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
                className={`border rounded-xl overflow-hidden shadow-sm transition-all duration-200 ${
                  isPending
                    ? 'border-amber-300 bg-gradient-to-br from-amber-50/80 to-orange-50/50 hover:shadow-md'
                    : 'border-gray-200 bg-white hover:shadow-sm'
                }`}
              >
                {/* Header */}
                <div
                  className={`p-5 cursor-pointer transition-colors ${
                    isPending ? 'hover:bg-amber-100/50' : 'hover:bg-gray-50/50'
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : revision.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Version Number and Status */}
                      <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                        <h3 className="font-bold text-lg text-gray-900">
                          {formatRevisionName(revision.revision_name, revision.revision_number)}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full border ${statusInfo.className}`}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </span>
                      </div>

                      {/* SKU Badge */}
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                          {getSkuName(revision)}
                        </span>
                      </div>

                      {/* Date and Uploader */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-medium">{formatDate(revision.created_at)}</span>
                        {revision.uploaded_by_name && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5" />
                              <span className="font-medium">{revision.uploaded_by_name}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                      {isExpanded ? (
                        <>折りたたむ</>
                      ) : (
                        <>詳細を表示</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="p-5 pt-0 space-y-5 border-t border-gray-200/60 mt-4">
                    {/* Partner comment - Bilingual Display */}
                    {(revision.partner_comment || revision.comment_ko || revision.comment_ja) && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-sm font-bold text-gray-800 mb-2.5 flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          パートナーからのコメント
                        </p>
                        {/* Use bilingual display when bilingual data is available OR uploaded by Korean designer */}
                        {(revision.uploaded_by_type === 'korea_designer' || revision.comment_ko || revision.comment_ja) ? (
                          <BilingualCommentDisplay
                            commentKo={revision.comment_ko || revision.partner_comment || ''}
                            commentJa={revision.comment_ja || revision.partner_comment || ''}
                            translationStatus={revision.translation_status || 'pending'}
                            showStatus={false}
                            defaultLanguage={revision.comment_ja ? 'ja' : 'ko'}
                            variant="bordered"
                            isAdmin={false}
                          />
                        ) : (
                          /* Legacy display for admin uploads without bilingual data */
                          <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                            {revision.partner_comment}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Preview image */}
                    {revision.preview_image_url && (
                      <div>
                        <p className="text-sm font-bold text-gray-800 mb-2.5 flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          プレビュー画像
                        </p>
                        <a
                          href={getPreviewUrl(revision)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group"
                        >
                          <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 group-hover:border-blue-400 transition-colors">
                            <img
                              src={getPreviewUrl(revision)}
                              alt="プレビュー"
                              className="w-full h-auto transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white bg-black/60 px-4 py-2 rounded-lg text-sm font-medium">
                                クリックして拡大
                              </span>
                            </div>
                          </div>
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
                          className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                            <FileImage className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">プレビュー画像</p>
                            <p className="text-xs text-gray-600">クリックして開く</p>
                          </div>
                          <Download className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors" />
                        </a>
                      )}
                      {revision.original_file_url && (
                        <a
                          href={revision.original_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 rounded-xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-400 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 transition-colors">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">原版ファイル</p>
                            <p className="text-xs text-gray-600">クリックして開く</p>
                          </div>
                          <Download className="w-5 h-5 text-purple-600 group-hover:text-purple-700 transition-colors" />
                        </a>
                      )}
                    </div>

                    {/* 後加工位置情報表示 / 후가공 위치 정보 표시 */}
                    {revision.sku_name && postProcessingPositions.has(revision.sku_name) && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <span>📏</span>
                          <span>後加工位置情報 / 후가공 위치 정보</span>
                        </h4>
                        <PostProcessingPositionDisplay
                          skuName={revision.sku_name}
                          data={postProcessingPositions.get(revision.sku_name)}
                        />
                      </div>
                    )}

                    {/* Customer response (for approved/rejected) */}
                    {!isPending && revision.customer_comment && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-sm font-bold text-gray-800 mb-2">ご回答:</p>
                        <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                          {revision.customer_comment}
                        </p>
                      </div>
                    )}

                    {/* Action buttons for pending revisions */}
                    {isPending && (
                      <>
                        {/* Comment input */}
                        <div>
                          <label className="text-sm font-bold text-gray-800 mb-2.5 flex items-center gap-1.5 block">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            コメント（任意）
                          </label>
                          <textarea
                            value={customerComment}
                            onChange={(e) => setCustomerComment(e.target.value)}
                            placeholder="承認・却下の理由やご意見をご入力ください..."
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm"
                            disabled={submitting === revision.id}
                          />
                        </div>

                        {/* Action buttons - Improved styling */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => handleRespond(revision.id, 'approved')}
                            disabled={submitting === revision.id}
                            className="flex-1 h-14 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:shadow-md"
                          >
                            <CheckCircle className="w-6 h-6 mr-2" />
                            承認して進める
                          </Button>
                          <Button
                            onClick={() => handleRespond(revision.id, 'rejected')}
                            disabled={submitting === revision.id}
                            variant="outline"
                            className="flex-1 h-14 text-base font-bold border-2 border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-sm"
                          >
                            <XCircle className="w-6 h-6 mr-2" />
                            修正を依頼する
                          </Button>
                        </div>

                        {submitting === revision.id && (
                          <div className="text-center py-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              送信中...
                            </div>
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
