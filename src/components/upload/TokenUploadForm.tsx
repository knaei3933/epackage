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
  order_item_id: string | null;
  status: 'active' | 'used' | 'expired' | 'revoked';
  upload_count: number;
}

interface TokenUploadFormProps {
  token: string;
  tokenData: DesignerUploadToken;
  onUploadSuccess: () => void;
  onError: (error: string) => void;
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
      if (tokenData.order_item_id) {
        formData.append('order_item_id', tokenData.order_item_id);
      }

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
        // Reset form
        setPreviewFile(null);
        setOriginalFile(null);
        setKoreanComment('');
        setPreviewPreview(null);
        onUploadSuccess();
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
    <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Upload className="w-6 h-6 text-blue-600" />
        修正データアップロード
        {hasExistingUploads && (
          <span className="text-sm font-normal text-slate-500">
            (追加アップロード)
          </span>
        )}
      </h2>

      {/* Local Error Display */}
      {localError && (
        <div role="alert" aria-live="assertive" className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{localError}</p>
            </div>
            <button
              onClick={handleClearError}
              className="text-red-600 hover:text-red-800"
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
          <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <FileImage className="w-5 h-5 text-blue-600" />
            プレビュー画像 (JPG/PNG)
          </h3>
          <p className="text-sm text-slate-600 mb-4">1920x1080px以上、5MB以下</p>

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
                ? 'border-slate-300 bg-slate-50 cursor-not-allowed opacity-60'
                : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md'
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
                <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                <p className="text-sm font-medium text-slate-900 truncate">
                  {previewFile?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {previewFile && formatFileSize(previewFile.size)}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewFile(null);
                    setPreviewPreview(null);
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  クリア
                </button>
              </div>
            ) : (
              <div>
                <FileImage className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                <p className="text-sm text-slate-600">
                  クリックまたはドラッグ&ドロップ
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Original File Upload */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            原版デザインファイル (AI/PDF/PSD)
          </h3>
          <p className="text-sm text-slate-600 mb-4">50MB以下</p>

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
                ? 'border-slate-300 bg-slate-50 cursor-not-allowed opacity-60'
                : 'border-purple-300 hover:border-purple-500 hover:bg-purple-50 hover:shadow-md'
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
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-3" />
                <p className="text-sm font-medium text-slate-900 truncate">
                  {originalFile.name}
                </p>
                <p className="text-xs text-slate-500">
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
                <FileText className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                <p className="text-sm text-slate-600">
                  クリックまたはドラッグ&ドロップ
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Korean Comment */}
      <div className="mb-6">
        <label htmlFor="korean-comment" className="block text-sm font-medium text-slate-900 mb-2">
          韓国語コメント（修正内容など）
          <span className="text-slate-400 font-normal ml-1">任意</span>
        </label>
        <textarea
          id="korean-comment"
          value={koreanComment}
          onChange={(e) => setKoreanComment(e.target.value)}
          placeholder="한국어로 수정 내용을 입력하세요..."
          rows={4}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          disabled={isUploading}
        />
        <p className="text-sm text-slate-500 mt-2">
          修正内容について顧客への説明を韓国語で入力してください
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">アップロード中...</p>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium text-slate-600">{uploadProgress}%</span>
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
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
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
    </section>
  );
}
