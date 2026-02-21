/**
 * Revision Card Component
 *
 * 校正リビジョンカード
 * - 各校正のプレビュー表示
 * - ファイルダウンロード
 * - パートナーコメント表示
 * - ステータス表示
 * - 削除機能（編集不可）
 *
 * @client
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Download, Trash2, MessageSquare, CheckCircle, Clock, XCircle, User } from 'lucide-react';
import { BilingualCommentDisplay } from '@/components/shared/BilingualCommentDisplay';
import { TranslationStatusBadge } from '@/components/shared/TranslationStatusBadge';
import type { DesignRevision } from './types';

interface RevisionCardProps {
  revision: DesignRevision;
  onDelete: (revisionId: string) => void;
  fetchFn?: typeof fetch;
}

export function RevisionCard({ revision, onDelete, fetchFn = fetch }: RevisionCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`この校正データ（${revision.revision_number}次校正）を削除してもよろしいですか？`)) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetchFn(`/api/admin/orders/${revision.order_id}/correction/${revision.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        onDelete(revision.id);
      } else {
        alert(result.error || '削除に失敗しました');
      }
    } catch (err) {
      console.error('Failed to delete revision:', err);
      alert('削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async () => {
    if (revision.original_file_url) {
      window.open(revision.original_file_url, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return '承認完了';
      case 'rejected':
        return '却下';
      default:
        return '承認待ち';
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">
                {revision.revision_number}次校正
              </h4>
              {revision.sku_name && (
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                  {revision.sku_name}
                </span>
              )}
              {/* Designer badge */}
              {revision.uploaded_by_type === 'korea_designer' && (
                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                  <User className="w-3 h-3" />
                  韓国デザイナー
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{new Date(revision.created_at).toLocaleString('ja-JP')}</span>
              {revision.uploaded_by_name && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {revision.uploaded_by_name}
                </span>
              )}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(revision.approval_status)}`}>
            {getStatusIcon(revision.approval_status)}
            {getStatusLabel(revision.approval_status)}
          </span>
        </div>

        {/* Preview and File */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preview Image */}
          {revision.preview_image_url && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">プレビュー</p>
              <div className="relative group">
                <img
                  src={revision.preview_image_url}
                  alt={`${revision.revision_number}次校正 プレビュー`}
                  className="w-full h-40 object-cover rounded-lg border border-gray-200"
                  loading="lazy"
                />
                <a
                  href={revision.preview_image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                >
                  <span className="text-white text-sm">拡大表示</span>
                </a>
              </div>
            </div>
          )}

          {/* Original File */}
          {revision.original_file_url && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">原版ファイル</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="w-full flex items-center gap-2 justify-start"
              >
                <FileText className="w-4 h-4" />
                <Download className="w-4 h-4" />
                原版ファイルをダウンロード
              </Button>
            </div>
          )}
        </div>

        {/* Partner Comment - Bilingual Display */}
        {(revision.partner_comment || revision.comment_ko || revision.comment_ja) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-700">パートナーコメント</p>
              {/* Show translation status badge if available */}
              {revision.translation_status && (revision.uploaded_by_type === 'korea_designer' || revision.comment_ko || revision.comment_ja) && (
                <TranslationStatusBadge
                  status={revision.translation_status}
                  size="sm"
                  animated={false}
                />
              )}
            </div>
            {/* Use bilingual display when bilingual data is available OR uploaded by Korean designer */}
            {(revision.uploaded_by_type === 'korea_designer' || revision.comment_ko || revision.comment_ja) ? (
              <BilingualCommentDisplay
                commentKo={revision.comment_ko || revision.partner_comment || ''}
                commentJa={revision.comment_ja || ''}
                translationStatus={revision.translation_status || 'pending'}
                showStatus={false}
                defaultLanguage="ja"
                variant="default"
                isAdmin={true}
              />
            ) : (
              /* Legacy display for admin uploads without bilingual data */
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">{revision.partner_comment}</p>
              </div>
            )}
          </div>
        )}

        {/* Delete Button */}
        <div className="flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? '削除中...' : '削除'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
