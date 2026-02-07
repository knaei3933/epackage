/**
 * Admin Correction Upload Client Component
 *
 * 管理者教正データアップロードクライアント
 * Handles:
 * - Preview image upload (JPG)
 * - Original design file upload (AI/PDF/PSD)
 * - Partner comment input
 * - Submit to API
 *
 * @client
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Send, FileImage, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import type { Order } from '@/types/dashboard';

// =====================================================
// Constants
// =====================================================

const FILE_SIZE_LIMITS = {
  PREVIEW_IMAGE: 5 * 1024 * 1024, // 5MB
  ORIGINAL_FILE: 50 * 1024 * 1024, // 50MB
} as const;

// =====================================================
// Props
// =====================================================

interface CorrectionUploadClientProps {
  order: Order;
}

// =====================================================
// Main Component
// =====================================================

export function CorrectionUploadClient({ order }: CorrectionUploadClientProps) {
  const router = useRouter();
  const previewInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [partnerComment, setPartnerComment] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load previous revisions
  const [previousRevisions, setPreviousRevisions] = useState<Array<{
    id: string;
    revision_number: number;
    approval_status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    partner_comment: string | null;
    preview_image_url?: string;
  }>>([]);

  useEffect(() => {
    loadPreviousRevisions();
  }, [order.id]);

  const loadPreviousRevisions = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/correction`);
      if (response.ok) {
        const data = await response.json();
        setPreviousRevisions(data.revisions || []);
      }
    } catch (err) {
      console.error('Failed to load revisions:', err);
    }
  };

  // Clear success message after 3 seconds with cleanup
  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  // Handle file selection
  const handlePreviewFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate image file
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
  }, []);

  const handleOriginalFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate design file type
    const validTypes = ['application/pdf', 'application/postscript', 'application/illustrator', 'application/photoshop', 'image/vnd.adobe.photoshop'];
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
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'preview' | 'original') => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (type === 'preview') {
      handlePreviewFileSelect(files);
    } else {
      handleOriginalFileSelect(files);
    }
  }, [handlePreviewFileSelect, handleOriginalFileSelect]);

  // Handle keyboard activation for accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent, type: 'preview' | 'original') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (type === 'preview') {
        !isUploading && previewInputRef.current?.click();
      } else {
        !isUploading && fileInputRef.current?.click();
      }
    }
  }, [isUploading]);

  // Upload correction
  const handleUpload = async () => {
    if (!previewFile || !originalFile) {
      setError('プレビュー画像と原版ファイルの両方を選択してください');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('preview_image', previewFile);
      formData.append('original_file', originalFile);
      formData.append('partner_comment', partnerComment);
      formData.append('notify_customer', notifyCustomer ? 'true' : 'false');

      // Upload with progress simulation
      const uploadPromise = fetch(`/api/admin/orders/${order.id}/correction`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await uploadPromise;
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'アップロードに失敗しました');
      }

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('教正データをアップロードしました');
        setPreviewFile(null);
        setOriginalFile(null);
        setPartnerComment('');
        loadPreviousRevisions();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">エラー</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
              aria-label="エラーメッセージを閉じる"
            >
              <X className="h-5 w-5" />
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
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 hover:text-green-800"
              aria-label="成功メッセージを閉じる"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preview Image Upload */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileImage className="w-5 h-5 text-blue-600" />
            プレビュー画像 (JPG)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            1920x1080px以上、2MB以下
          </p>

          <div
            role="button"
            tabIndex={isUploading ? -1 : 0}
            aria-label="プレビュー画像をアップロード（クリックまたはドラッグ＆ドロップ）"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'preview')}
            onClick={() => !isUploading && previewInputRef.current?.click()}
            onKeyDown={(e) => handleKeyDown(e, 'preview')}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isUploading
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
              }
            `}
          >
            <input
              ref={previewInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => handlePreviewFileSelect(e.target.files)}
              className="hidden"
              disabled={isUploading}
              aria-label="プレビュー画像ファイル選択"
            />

            {previewFile ? (
              <div>
                <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                <p className="mt-4 text-sm font-medium text-gray-900">
                  {previewFile.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatFileSize(previewFile.size)}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewFile(null);
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  クリア
                </button>
              </div>
            ) : (
              <div>
                <FileImage className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm text-gray-600">
                  クリックまたはドラッグ&ドロップ
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Original File Upload */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            原版デザインファイル (AI/PDF/PSD)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            50MB以下
          </p>

          <div
            role="button"
            tabIndex={isUploading ? -1 : 0}
            aria-label="原版デザインファイルをアップロード（クリックまたはドラッグ＆ドロップ）"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'original')}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onKeyDown={(e) => handleKeyDown(e, 'original')}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isUploading
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-purple-300 hover:border-purple-500 hover:bg-purple-50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".ai,.pdf,.psd,.eps"
              onChange={(e) => handleOriginalFileSelect(e.target.files)}
              className="hidden"
              disabled={isUploading}
              aria-label="原版デザインファイル選択"
            />

            {originalFile ? (
              <div>
                <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                <p className="mt-4 text-sm font-medium text-gray-900">
                  {originalFile.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatFileSize(originalFile.size)}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOriginalFile(null);
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  クリア
                </button>
              </div>
            ) : (
              <div>
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm text-gray-600">
                  クリックまたはドラッグ&ドロップ
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Partner Comment */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          パートナーコメント
        </h3>
        <textarea
          id="partner-comment"
          value={partnerComment}
          onChange={(e) => setPartnerComment(e.target.value)}
          placeholder="韓国パートナーからのコメント、修正内容など..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isUploading}
          aria-label="韓国パートナーコメント入力"
          aria-describedby="partner-comment-description"
        />
        <p id="partner-comment-description" className="text-sm text-gray-500 mt-2">
          韓国パートナーからのコメント、修正内容などを入力してください（任意）
        </p>
      </Card>

      {/* Notify Customer Option */}
      <Card className="p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            id="notify-customer"
            type="checkbox"
            checked={notifyCustomer}
            onChange={(e) => setNotifyCustomer(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            disabled={isUploading}
            aria-describedby="notify-customer-description"
          />
          <div>
            <span className="font-medium text-gray-900">
              顧客に即時承認依頼を送信
            </span>
            <p id="notify-customer-description" className="text-sm text-gray-600 mt-1">
              チェックを入れると、アップロード完了後に顧客に承認依頼メールが送信されます
            </p>
          </div>
        </label>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">アップロード中...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <span className="text-sm text-gray-600">{uploadProgress}%</span>
          </div>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          disabled={isUploading}
          aria-label="キャンセルして前のページに戻る"
        >
          キャンセル
        </Button>
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!previewFile || !originalFile || isUploading}
          className="flex items-center gap-2"
          aria-label={isUploading ? 'アップロード中' : '教正データをアップロード'}
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          {isUploading ? 'アップロード中...' : 'アップロード'}
        </Button>
      </div>

      {/* Previous Revisions */}
      {previousRevisions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            過去の教正データ ({previousRevisions.length})
          </h3>
          <div className="space-y-3">
            {previousRevisions.map((revision) => (
              <div
                key={revision.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    リビジョン #{revision.revision_number}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(revision.created_at).toLocaleString('ja-JP')}
                  </p>
                  {revision.partner_comment && (
                    <p className="text-sm text-gray-700 mt-1">
                      {revision.partner_comment}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded
                    ${revision.approval_status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                    ${revision.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${revision.approval_status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {revision.approval_status === 'approved' && '承認済み'}
                    {revision.approval_status === 'pending' && '承認待ち'}
                    {revision.approval_status === 'rejected' && '却下'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
