/**
 * Order File Upload Section
 *
 * 注文詳細ページの入稿データセクション
 * - 入稿データ（AI）のアップロード
 * - 韓国担当者へのメール送信
 * - アップロード済みファイルの表示・削除
 * - AIファイルが必須
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import type { Order } from '@/types/dashboard';

// =====================================================
// Props & Types
// =====================================================

interface OrderFileUploadSectionProps {
  order: Order;
}

interface UploadedFile {
  id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  uploaded_at: string;
  validation_status: string;
}

interface ValidationError {
  message_ja: string;
  message_en: string;
  code: string;
  category: string;
}

// =====================================================
// Main Component
// =====================================================

export function OrderFileUploadSection({ order }: OrderFileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  // Load existing files on mount
  useEffect(() => {
    loadUploadedFiles();
  }, [order.id]);

  // Load uploaded files
  const loadUploadedFiles = async () => {
    try {
      const response = await fetch(`/api/member/orders/${order.id}/data-receipt`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(data.data.files || []);
      }
    } catch (err) {
      console.error('Failed to load uploaded files:', err);
    }
  };

  // Check if AI file (production_data) is already uploaded
  const hasAIFile = uploadedFiles.some(
    (file) => file.file_type.toLowerCase() === 'production_data'
  );

  // Handle file selection - AI files only (.ai, .eps, .pdf)
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type - only AI files allowed
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.ai', '.eps', '.pdf'];
    const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isAllowed) {
      setError('⚠️ 入稿データはAI、EPS、PDF形式のみ可能です。');
      setSelectedFile(null);
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('ファイルサイズは10MB以下にしてください');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccessMessage(null);
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      // Always use production_data for AI files
      formData.append('data_type', 'production_data');
      if (description) {
        formData.append('description', description);
      }

      // Upload with progress simulation
      const uploadPromise = fetch(`/api/member/orders/${order.id}/data-receipt`, {
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
      }, 100);

      const response = await uploadPromise;
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.errorEn || 'アップロードに失敗しました');
      }

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('入稿データをアップロードしました。韓国担当者に送信されました。');
        setSelectedFile(null);
        setDescription('');
        loadUploadedFiles();

        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete file
  const handleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`「${fileName}」を削除してもよろしいですか？`)) {
      return;
    }

    setDeletingFileId(fileId);

    try {
      const response = await fetch(`/api/member/orders/${order.id}/data-receipt/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '削除に失敗しました');
      }

      // Reload the file list
      await loadUploadedFiles();
      setSuccessMessage('ファイルを削除しました');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeletingFileId(null);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Get validation status badge
  const getValidationStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: '検証待ち', className: 'bg-yellow-100 text-yellow-800' },
      VALID: { label: '有効', className: 'bg-green-100 text-green-800' },
      INVALID: { label: '無効', className: 'bg-red-100 text-red-800' },
    };
    const s = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.className}`}>
        {s.label}
      </span>
    );
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              入稿データ
            </h2>
            <p className="text-sm text-text-muted mt-1">
              入稿データ（AI）をアップロードすると、韓国担当者に送信されます
            </p>
          </div>
          {uploadedFiles.length > 0 && (
            <div className="text-sm text-text-muted">
              {uploadedFiles.length}件のファイル
            </div>
          )}
        </div>

        {/* AI Required Warning */}
        {!hasAIFile && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  入稿データ（AI）のアップロードが必須です
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  生産を開始するために、必ず入稿データ（AI）をアップロードしてください。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  エラーが発生しました
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Success Display */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-600 hover:text-green-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Upload Form */}
        <div className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              備考（任意）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="入稿データに関する補足事項があれば入力してください"
              rows={2}
              className="w-full px-3 py-2 border border-border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={isUploading}
            />
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isUploading
                ? 'border-border-secondary bg-bg-secondary cursor-not-allowed'
                : 'border-red-300 hover:border-red-400 hover:bg-red-50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".ai,.eps,.pdf"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={isUploading}
            />

            {isUploading ? (
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 border-4 border-border-tertiary border-t-primary rounded-full animate-spin"></div>
                <div>
                  <p className="text-sm font-medium text-text-primary">アップロード中...</p>
                  <p className="text-sm text-text-muted mt-1">{uploadProgress}%</p>
                </div>
                <div className="w-full bg-bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : selectedFile ? (
              <div>
                <svg
                  className="mx-auto h-10 w-10 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-3 text-sm font-medium text-text-primary">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-text-muted mt-1">
                  {formatFileSize(selectedFile.size)}
                </p>
                <p
                  className="text-sm text-primary mt-2 cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                >
                  別のファイルを選択
                </p>
              </div>
            ) : (
              <div>
                <svg
                  className="mx-auto h-10 w-10 text-text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-3 text-sm text-text-muted">
                  AIファイルをドラッグ&ドロップまたは
                  <span className="text-primary font-medium"> クリックして選択</span>
                </p>
                <p className="text-xs text-text-muted mt-1">
                  対応形式: .ai, .eps, .pdf
                </p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          {selectedFile && (
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setSelectedFile(null)}
                disabled={isUploading}
              >
                キャンセル
              </Button>
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={isUploading}
              >
                入稿データをアップロード
              </Button>
            </div>
          )}

          {/* Guidelines */}
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-sm font-medium text-red-900 mb-2">
              ⚠️ 入稿データアップロードガイドライン
            </h3>
            <ul className="text-sm space-y-1 text-red-800">
              <li>• <strong>入稿データ（AI）は必須です</strong> - 生産開始前に必ずアップロードしてください</li>
              <li>• 対応ファイル形式: AI (Adobe Illustrator), EPS, PDF</li>
              <li>• 最大ファイルサイズ: 10MB</li>
              <li>• ファイルはセキュリティチェックが行われます</li>
              <li>• アップロード後、韓国担当者に自動送信されます</li>
              <li>• 間違ったファイルをアップロードした場合は、削除して再アップロードしてください</li>
            </ul>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="border-t border-border-secondary pt-4">
            <h3 className="text-sm font-medium text-text-primary mb-3">
              アップロード済みファイル ({uploadedFiles.length})
            </h3>
            <div className="space-y-2">
              {uploadedFiles.map((file) => {
                const isAIFile = file.file_type.toLowerCase() === 'production_data';
                return (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isAIFile ? 'bg-green-50 border border-green-200' : 'bg-bg-secondary'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-text-primary truncate">
                          {file.file_name}
                        </p>
                        {getValidationStatusBadge(file.validation_status)}
                        {isAIFile && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ 必須データ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-text-muted">
                        <span>入稿データ</span>
                        <span>•</span>
                        <span>{new Date(file.uploaded_at).toLocaleString('ja-JP')}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark text-sm"
                      >
                        ダウンロード
                      </a>
                      <button
                        onClick={() => handleDelete(file.id, file.file_name)}
                        disabled={deletingFileId === file.id}
                        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingFileId === file.id ? '削除中...' : '削除'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show completion message when AI file is uploaded */}
            {hasAIFile && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-green-800">
                    ✓ 入稿データ（AI）がアップロードされました。追加でアップロードする場合は、上記の手順で行ってください。
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
