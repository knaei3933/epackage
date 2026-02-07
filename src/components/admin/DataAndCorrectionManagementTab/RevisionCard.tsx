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
import { FileText, Download, Trash2, MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react';
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
          <div>
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              {revision.revision_number}次校正
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(revision.created_at).toLocaleString('ja-JP')}
            </p>
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

        {/* Partner Comment */}
        {revision.partner_comment && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">パートナーコメント</p>
                <p className="text-sm text-gray-600 mt-1">{revision.partner_comment}</p>
              </div>
            </div>
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
