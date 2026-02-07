/**
 * Correction Revisions Manager Component
 *
 * 校正リビジョン管理コンポーネント
 * - 複数の校正を管理
 * - 新規校正追加フォーム
 * - 既存校正の一覧表示
 *
 * @client
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, FileImage, FileText, X, AlertCircle } from 'lucide-react';
import { RevisionCard } from './RevisionCard';
import type { DesignRevision } from './types';

interface CorrectionRevisionsManagerProps {
  orderId: string;
  fetchFn?: typeof fetch;
}

const FILE_SIZE_LIMITS = {
  PREVIEW_IMAGE: 5 * 1024 * 1024, // 5MB
  ORIGINAL_FILE: 50 * 1024 * 1024, // 50MB
} as const;

export function CorrectionRevisionsManager({ orderId, fetchFn = fetch }: CorrectionRevisionsManagerProps) {
  const [revisions, setRevisions] = useState<DesignRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // File input refs
  const previewInputRef = useRef<HTMLInputElement>(null);
  const originalInputRef = useRef<HTMLInputElement>(null);

  // New revision form state
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [partnerComment, setPartnerComment] = useState('');

  const loadRevisions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchFn(`/api/admin/orders/${orderId}/correction`);

      // Check if response is OK
      if (!response.ok) {
        setError(`校正データの読み込みに失敗しました (${response.status})`);
        return;
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setError('サーバーエラーが発生しました');
        return;
      }

      const result = await response.json();

      if (result.success) {
        setRevisions(result.revisions || []);
      } else {
        setError(result.error || '校正データの読み込みに失敗しました');
      }
    } catch (err) {
      console.error('Failed to load revisions:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, orderId]);

  useEffect(() => {
    loadRevisions();
  }, [loadRevisions]);

  const getNextRevisionNumber = useCallback(() => {
    if (revisions.length === 0) return 1;
    return Math.max(...revisions.map(r => r.revision_number)) + 1;
  }, [revisions]);

  const handlePreviewFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.type.startsWith('image/')) {
      setError('プレビュー画像はJPG/PNG形式のみ対応しています');
      return;
    }

    if (file.size > FILE_SIZE_LIMITS.PREVIEW_IMAGE) {
      setError('プレビュー画像は5MB以下にしてください');
      return;
    }

    setPreviewFile(file);
    setError(null);
  };

  const handleOriginalFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    const validTypes = ['application/pdf', 'application/postscript'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(ai|pdf|psd|eps)$/i)) {
      setError('原版ファイルはAI/PDF/PSD/EPS形式のみ対応しています');
      return;
    }

    if (file.size > FILE_SIZE_LIMITS.ORIGINAL_FILE) {
      setError('原版ファイルは50MB以下にしてください');
      return;
    }

    setOriginalFile(file);
    setError(null);
  };

  const handleSubmitNewRevision = async () => {
    if (!previewFile || !originalFile) {
      setError('プレビュー画像と原版ファイルの両方を選択してください');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('preview_image', previewFile);
      formData.append('original_file', originalFile);
      formData.append('partner_comment', partnerComment);
      formData.append('revision_number', String(getNextRevisionNumber()));

      console.log('[CorrectionRevisionsManager] Uploading files:', {
        preview: previewFile.name,
        original: originalFile.name,
      });

      // Use native fetch for FormData upload to avoid Content-Type header issues
      const response = await fetch(`/api/admin/orders/${orderId}/correction`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type - let browser set it automatically for FormData
      });

      const result = await response.json();

      if (result.success) {
        setPreviewFile(null);
        setOriginalFile(null);
        setPartnerComment('');
        setIsAddingNew(false);
        await loadRevisions();
      } else {
        setError(result.error || 'アップロードに失敗しました');
      }
    } catch (err) {
      console.error('Failed to upload revision:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRevision = async (revisionId: string) => {
    setRevisions(prev => prev.filter(r => r.id !== revisionId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">校正データ管理</h3>
        <Button
          onClick={() => setIsAddingNew(!isAddingNew)}
          variant={isAddingNew ? 'outline' : 'default'}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isAddingNew ? 'キャンセル' : '新規校正追加'}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">エラー</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* New Revision Form */}
      {isAddingNew && (
        <Card className="p-6 border-2 border-blue-200 bg-blue-50/30">
          <h4 className="font-semibold text-gray-900 mb-4">
            {getNextRevisionNumber()}次校正を追加
          </h4>

          <div className="space-y-4">
            {/* Preview Image Upload */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">プレビュー画像 (JPG/PNG)</p>
              <input
                ref={previewInputRef}
                type="file"
                id={`preview-image-input-${orderId}`}
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  console.log('[CorrectionRevisionsManager] Preview input changed, files:', e.target.files?.length);
                  handlePreviewFileSelect(e.target.files);
                }}
                disabled={uploading}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }}
              />
              <label
                htmlFor={`preview-image-input-${orderId}`}
                className={`block border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  uploading
                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                    : 'border-blue-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                {previewFile ? (
                  <div>
                    <FileImage className="mx-auto h-10 w-10 text-green-600" />
                    <p className="mt-2 text-sm font-medium text-gray-900">{previewFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(previewFile.size)}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setPreviewFile(null);
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      クリア
                    </button>
                  </div>
                ) : (
                  <div>
                    <FileImage className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">クリックして選択</p>
                  </div>
                )}
              </label>
            </div>

            {/* Original File Upload */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">原版ファイル (AI/PDF/PSD)</p>
              <input
                ref={originalInputRef}
                type="file"
                id={`original-file-input-${orderId}`}
                accept=".ai,.pdf,.psd,.eps"
                onChange={(e) => {
                  console.log('[CorrectionRevisionsManager] Original input changed, files:', e.target.files?.length);
                  handleOriginalFileSelect(e.target.files);
                }}
                disabled={uploading}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }}
              />
              <label
                htmlFor={`original-file-input-${orderId}`}
                className={`block border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  uploading
                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                    : 'border-purple-300 cursor-pointer hover:border-purple-500 hover:bg-purple-50'
                }`}
              >
                {originalFile ? (
                  <div>
                    <FileText className="mx-auto h-10 w-10 text-green-600" />
                    <p className="mt-2 text-sm font-medium text-gray-900">{originalFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(originalFile.size)}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setOriginalFile(null);
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      クリア
                    </button>
                  </div>
                ) : (
                  <div>
                    <FileText className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">クリックして選択</p>
                  </div>
                )}
              </label>
            </div>

            {/* Partner Comment */}
            <div>
              <label htmlFor="partner-comment" className="block text-sm font-medium text-gray-700 mb-2">
                パートナーコメント（任意）
              </label>
              <textarea
                id="partner-comment"
                value={partnerComment}
                onChange={(e) => setPartnerComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="韓国パートナーからのコメント、修正内容など..."
                disabled={uploading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingNew(false);
                  setPreviewFile(null);
                  setOriginalFile(null);
                  setPartnerComment('');
                }}
                disabled={uploading}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSubmitNewRevision}
                disabled={!previewFile || !originalFile || uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {uploading ? 'アップロード中...' : 'アップロード'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Revisions List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">
          校正データを読み込み中...
        </div>
      ) : revisions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          まだ校正データがありません
        </div>
      ) : (
        <div className="space-y-4">
          {revisions
            .sort((a, b) => b.revision_number - a.revision_number)
            .map((revision) => (
              <RevisionCard
                key={revision.id}
                revision={revision}
                onDelete={handleDeleteRevision}
                fetchFn={fetchFn}
              />
            ))}
        </div>
      )}
    </div>
  );
}
