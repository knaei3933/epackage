/**
 * Token Upload Form Component
 *
 * トークンアップロードフォームコンポーネント
 * - プレビュー画像アップロード
 * - 原版ファイルアップロード
 * - 韓国語コメント入力
 * - ファイルドラッグ&ドロップ対応
 * - ファイルサイズ・タイプバリデーション
 *
 * @client
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileImage,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// =====================================================
// Types
// =====================================================

interface DesignerUploadToken {
  id: string;
  order_id: string;
  status: string;
  upload_count: number;
}

interface TokenUploadFormProps {
  token: string;
  tokenData: DesignerUploadToken;
  onUploadSuccess: (revisionInfo?: UploadRevisionInfo) => void;
  onError: (error: string) => void;
}

interface UploadRevisionInfo {
  id: string;
  revision_number: number;
  original_customer_filename?: string;
  generated_correction_filename?: string;
  preview_image_url?: string;
  original_file_url?: string;
}

// =====================================================
// Constants
// =====================================================

const FILE_SIZE_LIMITS = {
  PREVIEW_IMAGE: 5 * 1024 * 1024, // 5MB
  ORIGINAL_FILE: 50 * 1024 * 1024, // 50MB
} as const;

const ALLOWED_PREVIEW_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_ORIGINAL_EXTENSIONS = ['.ai', '.pdf', '.psd', '.eps'];

// =====================================================
// Helper Functions
// =====================================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// =====================================================
// Main Component
// =====================================================

export function TokenUploadForm({
  token,
  tokenData,
  onUploadSuccess,
  onError,
}: TokenUploadFormProps) {
  const previewInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [koreanComment, setKoreanComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewPreview, setPreviewPreview] = useState<string | null>(null);
  const [lastUploadedRevision, setLastUploadedRevision] = useState<UploadRevisionInfo | null>(null);

  // Clear local error when it changes
  const handleClearError = () => {
    setLocalError(null);
    onError('');
  };

  // Handle preview file selection
  const handlePreviewFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!ALLOWED_PREVIEW_TYPES.includes(file.type)) {
      setLocalError('プレビュー画像はJPG/PNG形式のみ対応しています');
      onError('プレビュー画像はJPG/PNG形式のみ対応しています');
      return;
    }

    // Validate file size
    if (file.size > FILE_SIZE_LIMITS.PREVIEW_IMAGE) {
      setLocalError('プレビュー画像は5MB以下にしてください');
      onError('プレビュー画像は5MB以下にしてください');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setPreviewFile(file);
    setLocalError(null);
    onError('');
  }, [onError]);

  // Handle original file selection
  const handleOriginalFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_ORIGINAL_EXTENSIONS.includes(ext)) {
      setLocalError('原版ファイルはAI/PDF/PSD/EPS形式のみ対応しています');
      onError('原版ファイルはAI/PDF/PSD/EPS形式のみ対応しています');
      return;
    }

    // Validate file size
    if (file.size > FILE_SIZE_LIMITS.ORIGINAL_FILE) {
      setLocalError('原版ファイルは50MB以下にしてください');
      onError('原版ファイルは50MB以下にしてください');
      return;
    }

    setOriginalFile(file);
    setLocalError(null);
    onError('');
  }, [onError]);

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

  // Handle upload
  const handleUpload = async () => {
    if (!previewFile || !originalFile) {
      setLocalError('プレビュー画像と原版ファイルの両方を選択してください');
      onError('プレビュー画像と原版ファイルの両方を選択してください');
      return;
    }

    setIsUploading(true);
    setLocalError(null);
    onError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('preview_image', previewFile);
      formData.append('original_file', originalFile);
      formData.append('comment_ko', koreanComment);

      // Upload with progress simulation
      const uploadPromise = fetch(`/api/upload/${token}`, {
        method: 'POST',
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
        // Save revision info for display
        const revisionInfo: UploadRevisionInfo = result.revision;
        setLastUploadedRevision(revisionInfo);

        // Reset form
        setPreviewFile(null);
        setOriginalFile(null);
        setKoreanComment('');
        setPreviewPreview(null);
        onUploadSuccess(revisionInfo);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      setLocalError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Check if form can be submitted
  const canSubmit = previewFile && originalFile && !isUploading;

  // Check if already has uploads
  const hasExistingUploads = tokenData.upload_count > 0;

  return (
    <section className="bg-white rounded-container border border-border-medium p-6">
      <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <Upload className="w-6 h-6 text-brand" />
        修正データアップロード
        {hasExistingUploads && (
          <span className="text-sm font-normal text-text-muted">
            (追加アップロード)
          </span>
        )}
      </h2>

      {/* Local Error Display */}
      {localError && (
        <div role="alert" aria-live="assertive" className="mb-4 bg-error-muted border border-error rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-error mr-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-on-error-muted">{localError}</p>
            </div>
            <button
              onClick={handleClearError}
              className="text-error hover:text-on-error-muted"
              aria-label="エラーメッセージを閉じる"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Preview Image Upload */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
            <FileImage className="w-5 h-5 text-brand" />
            プレビュー画像 (JPG/PNG)
          </h3>
          <p className="text-sm text-text-secondary mb-4">1920x1080px以上、5MB以下</p>

          <div
            role="button"
            tabIndex={isUploading ? -1 : 0}
            aria-label="プレビュー画像をアップロード（クリックまたはドラッグ＆ドロップ）"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'preview')}
            onClick={() => !isUploading && previewInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
              ${isUploading
                ? 'border-border-strong bg-bg-secondary cursor-not-allowed opacity-60'
                : 'border-brand-soft hover:border-brand hover:bg-brand-subtle hover:shadow-low'
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
            />

            {previewPreview ? (
              <div>
                <img
                  src={previewPreview}
                  alt="プレビュー"
                  className="mx-auto h-32 object-contain rounded mb-3"
                />
                <CheckCircle className="mx-auto h-8 w-8 text-success mb-2" />
                <p className="text-sm font-medium text-text-primary truncate">
                  {previewFile?.name}
                </p>
                <p className="text-xs text-text-muted">
                  {previewFile && formatFileSize(previewFile.size)}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewFile(null);
                    setPreviewPreview(null);
                  }}
                  className="mt-2 text-sm text-error hover:text-on-error-muted"
                >
                  クリア
                </button>
              </div>
            ) : (
              <div>
                <FileImage className="mx-auto h-12 w-12 text-text-muted mb-3" />
                <p className="text-sm text-text-secondary">
                  クリックまたはドラッグ&ドロップ
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Original File Upload */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand" />
            原版デザインファイル (AI/PDF/PSD)
          </h3>
          <p className="text-sm text-text-secondary mb-4">50MB以下</p>

          <div
            role="button"
            tabIndex={isUploading ? -1 : 0}
            aria-label="原版デザインファイルをアップロード（クリックまたはドラッグ＆ドロップ）"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'original')}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
              ${isUploading
                ? 'border-border-strong bg-bg-secondary cursor-not-allowed opacity-60'
                : 'border-brand-soft hover:border-brand hover:bg-brand-subtle hover:shadow-low'
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
            />

            {originalFile ? (
              <div>
                <CheckCircle className="mx-auto h-12 w-12 text-success mb-3" />
                <p className="text-sm font-medium text-text-primary truncate">
                  {originalFile.name}
                </p>
                <p className="text-xs text-text-muted">
                  {formatFileSize(originalFile.size)}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOriginalFile(null);
                  }}
                  className="mt-2 text-sm text-error hover:text-on-error-muted"
                >
                  クリア
                </button>
              </div>
            ) : (
              <div>
                <FileText className="mx-auto h-12 w-12 text-text-muted mb-3" />
                <p className="text-sm text-text-secondary">
                  クリックまたはドラッグ&ドロップ
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Korean Comment */}
      <div className="mb-6">
        <label htmlFor="korean-comment" className="block text-sm font-medium text-text-primary mb-2">
          韓国語コメント（修正内容など）
          <span className="text-text-muted font-normal ml-1">任意</span>
        </label>
        <textarea
          id="korean-comment"
          value={koreanComment}
          onChange={(e) => setKoreanComment(e.target.value)}
          placeholder="한국어로 수정 내용을 입력하세요..."
          rows={4}
          className="min-h-24 py-2 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted resize-none"
          disabled={isUploading}
        />
        <p className="text-sm text-text-muted mt-2">
          修正内容について顧客への説明を韓国語で入力してください
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-6 p-4 bg-brand-muted rounded-lg border border-brand-soft">
          <div className="flex items-center gap-4">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">アップロード中...</p>
              <div className="w-full bg-bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-brand h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium text-text-secondary">{uploadProgress}%</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!canSubmit}
          className={`
            px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200
            ${!canSubmit
              ? 'bg-bg-muted text-text-muted cursor-not-allowed'
              : 'bg-brand text-white hover:bg-brand-hover'
            }
          `}
          aria-label={!canSubmit ? 'ファイルを選択してください' : '修正データをアップロード'}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              アップロード中...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              修正データをアップロード
            </>
          )}
        </button>
      </div>

      {/* Filename Info Display (after successful upload) */}
      {lastUploadedRevision && (
        <div className="mt-6 p-4 bg-success-muted rounded-lg border border-success">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            アップロード完了 - ファイル名情報
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-text-secondary font-medium min-w-[120px]">元ファイル名:</span>
              <span className="text-text-primary break-all font-mono text-xs">
                {lastUploadedRevision.original_customer_filename || '-'}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-text-secondary font-medium min-w-[120px]">生成ファイル名:</span>
              <span className="text-text-primary break-all font-mono text-xs">
                {lastUploadedRevision.generated_correction_filename || '-'}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-text-secondary font-medium min-w-[120px]">リビジョン番号:</span>
              <span className="text-text-primary">
                R{lastUploadedRevision.revision_number}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
