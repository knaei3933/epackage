/**
 * Customer Spec Approval Client Component
 *
 * 顧客教正データ確認クライアント
 * - Display preview image from Korea partner
 * - Show partner comment
 * - Three actions: Approve, Request Revision, Cancel
 *
 * @client
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal, useConfirmModal } from '@/components/ui/ConfirmModal';
import {
  CheckCircle,
  RotateCcw,
  XCircle,
  FileImage,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Order } from '@/types/dashboard';

// =====================================================
// Props
// =====================================================

interface SpecApprovalClientProps {
  order: Order;
}

interface DesignRevision {
  id: string;
  revision_number: number;
  preview_image_url: string;
  original_file_url: string;
  partner_comment: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// =====================================================
// Main Component
// =====================================================

export function SpecApprovalClient({ order }: SpecApprovalClientProps) {
  const router = useRouter();

  // Custom Modal State
  const { isOpen: isConfirmModalOpen, openConfirmModal, closeConfirmModal, modalProps } = useConfirmModal();

  // State
  const [revisions, setRevisions] = useState<DesignRevision[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customerComment, setCustomerComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNavigateButton, setShowNavigateButton] = useState(false);
  const [navigatePath, setNavigatePath] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'cancel' | null>(null);

  const currentRevision = revisions[currentIndex];

  // Keyboard navigation for revisions and actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Revision navigation with arrow keys
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < revisions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
      // Action shortcuts (when not typing in textarea)
      else if (e.key === 'a' || e.key === 'A') {
        if (document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleAction('approve');
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleAction('reject');
        }
      } else if (e.key === 'c' || e.key === 'C') {
        if (document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleAction('cancel');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, revisions.length, currentRevision]);

  // Load revisions
  useEffect(() => {
    loadRevisions();
  }, [order.id]);

  // Handle navigate button display (removed auto-redirect)
  // User now has control over when to navigate
  // const navigateTimer = setTimeout(() => {
  //   const redirectPath = redirectAction();
  //   router.push(redirectPath);
  // }, 2000);
  // return () => clearTimeout(navigateTimer);

  const loadRevisions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/member/orders/${order.id}/spec-approval`);
      if (response.ok) {
        const data = await response.json();
        setRevisions(data.revisions || []);
      }
    } catch (err) {
      console.error('Failed to load revisions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle approval actions
  const handleAction = async (action: 'approve' | 'reject' | 'cancel') => {
    if (!currentRevision) return;

    if (action === 'reject' && !customerComment.trim()) {
      setError('修正要求の場合はコメントを入力してください');
      return;
    }

    // Set pending action and show custom modal
    setPendingAction(action);

    if (action === 'approve') {
      openConfirmModal({
        title: '教正データの承認',
        message: 'この教正データを承認します。よろしいですか？',
        confirmLabel: '承認する',
        cancelLabel: 'キャンセル',
        variant: 'info',
        onConfirm: () => executeAction(action),
      });
    } else if (action === 'reject') {
      openConfirmModal({
        title: '修正要求の送信',
        message: '修正要求を送信します。よろしいですか？',
        confirmLabel: '送信する',
        cancelLabel: 'キャンセル',
        variant: 'warning',
        onConfirm: () => executeAction(action),
      });
    } else {
      openConfirmModal({
        title: '注文のキャンセル',
        message: '注文をキャンセルします。よろしいですか？\nこの操作は取り消せません。',
        confirmLabel: 'キャンセルする',
        cancelLabel: '戻る',
        variant: 'danger',
        onConfirm: () => executeAction(action),
      });
    }
  };

  // Execute action after confirmation
  const executeAction = async (action: 'approve' | 'reject' | 'cancel') => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/member/orders/${order.id}/spec-approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action,
          revisionId: currentRevision.id,
          comment: customerComment,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '操作に失敗しました');
      }

      if (result.success) {
        if (action === 'approve') {
          setSuccessMessage('教正データを承認しました。次のステップに進みます。');
          setNavigatePath(`/member/orders/${order.id}`);
          setShowNavigateButton(true);
        } else if (action === 'reject') {
          setSuccessMessage('修正要求を送信しました。');
          loadRevisions();
        } else {
          setSuccessMessage('注文をキャンセルしました。');
          setNavigatePath('/member/orders');
          setShowNavigateButton(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // No revisions
  if (revisions.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileImage className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">教正データがありません</h2>
        <p className="text-gray-600 mb-6">
          まだ韓国パートナーから教正データが送信されていません。
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          戻る
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <XCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
              aria-label="エラーメッセージを閉じる"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Success Display */}
      {successMessage && (
        <div role="status" aria-live="polite" className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
              {/* Navigate Button (instead of auto-redirect) */}
              {showNavigateButton && navigatePath && (
                <div className="mt-4">
                  <Button
                    variant="primary"
                    onClick={() => router.push(navigatePath)}
                    className="flex items-center gap-2"
                  >
                    次へ
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revision Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            リビジョン #{currentRevision.revision_number}
          </h2>
          <p className="text-sm text-gray-600">
            {new Date(currentRevision.created_at).toLocaleString('ja-JP')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0 || isSubmitting}
            aria-label="前のリビジョンを表示 (←)"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            前へ
          </Button>
          <span className="text-sm text-gray-600">
            {currentIndex + 1} / {revisions.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(Math.min(revisions.length - 1, currentIndex + 1))}
            disabled={currentIndex === revisions.length - 1 || isSubmitting}
            aria-label="次のリビジョンを表示 (→)"
          >
            次へ
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          キーボード: ←→ リビジョン切り替え | A: 承認 | R: 修正要求 | C: キャンセル
        </p>
      </div>

      {/* Preview Image */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">プレビュー画像</h3>
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={currentRevision.preview_image_url}
            alt={`リビジョン #${currentRevision.revision_number}`}
            className="w-full h-auto"
          />
        </div>
        <div className="mt-4">
          <a
            href={currentRevision.original_file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            原版ファイルをダウンロード (AI/PDF/PSD)
          </a>
        </div>
      </Card>

      {/* Partner Comment */}
      {currentRevision.partner_comment && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">パートナーコメント</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{currentRevision.partner_comment}</p>
          </div>
        </Card>
      )}

      {/* Customer Comment */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">コメント</h3>
        <textarea
          id="customer-comment"
          value={customerComment}
          onChange={(e) => setCustomerComment(e.target.value)}
          placeholder="修正要求の場合は、具体的な修正内容を入力してください..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
          aria-label="顧客コメント入力"
          aria-describedby="customer-comment-description"
        />
        <p id="customer-comment-description" className="text-sm text-gray-500 mt-2">
          修正要求の場合は、具体的な修正内容を入力してください
        </p>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Approve */}
          <Button
            variant="primary"
            onClick={() => handleAction('approve')}
            disabled={isSubmitting || currentRevision.approval_status === 'approved'}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
            aria-label="この教正データを承認する"
          >
            <CheckCircle className="w-5 h-5" aria-hidden="true" />
            {isSubmitting ? '処理中...' : '承認する'}
          </Button>

          {/* Request Revision */}
          <Button
            variant="outline"
            onClick={() => handleAction('reject')}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 border-yellow-600 text-yellow-700 hover:bg-yellow-50"
            aria-label="修正を要求する"
          >
            <RotateCcw className="w-5 h-5" aria-hidden="true" />
            {isSubmitting ? '処理中...' : '修正要求'}
          </Button>

          {/* Cancel Order */}
          <Button
            variant="outline"
            onClick={() => handleAction('cancel')}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 border-red-600 text-red-700 hover:bg-red-50"
            aria-label="注文をキャンセルする"
          >
            <XCircle className="w-5 h-5" aria-hidden="true" />
            {isSubmitting ? '処理中...' : 'キャンセル'}
          </Button>
        </div>

        <div className="mt-6 space-y-2 text-sm text-gray-600">
          <p><strong>承認する:</strong> この教正データで問題ない場合、次のステップ（契約）に進みます。</p>
          <p><strong>修正要求:</strong> 修正が必要な場合、コメントを入力して韓国パートナーに再依頼します。</p>
          <p><strong>キャンセル:</strong> 注文をキャンセルします。（この操作は取り消せません）</p>
        </div>
      </Card>

      {/* Custom Confirm Modal */}
      {isConfirmModalOpen && modalProps && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={closeConfirmModal}
          {...modalProps}
        />
      )}
    </div>
  );
}
