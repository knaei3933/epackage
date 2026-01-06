/**
 * Order Data Receipt Upload Client Component
 *
 * 注文データ入稿アップロードクライアント
 * Handles file upload with drag-drop interface
 * Uses security-validator for comprehensive validation
 *
 * @client
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Order } from '@/types/dashboard';

// =====================================================
// Props
// =====================================================

interface DataReceiptUploadClientProps {
  order: Order;
  canUploadData: boolean;
}

interface UploadedFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  dataType: string;
  uploadedAt: string;
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

export function DataReceiptUploadClient({ order, canUploadData }: DataReceiptUploadClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dataType, setDataType] = useState<'production_data' | 'design_file' | 'specification' | 'other'>('production_data');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load existing files on mount
  useEffect(() => {
    loadUploadedFiles();
  }, [order.id]);

  // Load uploaded files
  const loadUploadedFiles = async () => {
    try {
      const response = await fetch(`/api/member/orders/${order.id}/data-receipt`);
      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(data.data.files || []);
      }
    } catch (err) {
      console.error('Failed to load uploaded files:', err);
    }
  };

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('ファイルサイズは10MB以下にしてください');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setValidationErrors([]);
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
    if (canUploadData) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [canUploadData, handleFileSelect]);

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile || !canUploadData) return;

    setIsUploading(true);
    setError(null);
    setValidationErrors([]);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('data_type', dataType);
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

        // Handle validation errors
        if (errorData.details && Array.isArray(errorData.details)) {
          setValidationErrors(errorData.details);
        }

        throw new Error(errorData.error || errorData.errorEn || 'アップロードに失敗しました');
      }

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('ファイルをアップロードしました');
        setSelectedFile(null);
        setDescription('');
        loadUploadedFiles();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
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

  // Get data type label
  const getDataTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      production_data: '生産データ',
      design_file: 'デザインファイル',
      specification: '仕様書',
      other: 'その他',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="h-6 w-6 text-red-600 mr-3 flex-shrink-0"
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
              {validationErrors.length > 0 && (
                <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err.message_ja}</li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={() => {
                setError(null);
                setValidationErrors([]);
              }}
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
              className="h-6 w-6 text-green-600 mr-3 flex-shrink-0"
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
          </div>
        </div>
      )}

      {/* Upload Area */}
      {canUploadData && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ファイルをアップロード
          </h2>

          {/* Data Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              データタイプ <span className="text-red-500">*</span>
            </label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isUploading}
            >
              <option value="production_data">生産データ</option>
              <option value="design_file">デザインファイル</option>
              <option value="specification">仕様書</option>
              <option value="other">その他</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明（任意）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ファイルに関する説明を入力してください"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isUploading
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png,.ai,.psd,.eps"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={isUploading}
            />

            {isUploading ? (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">アップロード中...</p>
                  <p className="text-sm text-gray-500 mt-1">{uploadProgress}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : selectedFile ? (
              <div>
                <svg
                  className="mx-auto h-12 w-12 text-green-600"
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
                <p className="mt-4 text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatFileSize(selectedFile.size)}
                </p>
                <p
                  className="text-sm text-blue-600 mt-2 cursor-pointer hover:underline"
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
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-4 text-sm text-gray-600">
                  ファイルをドラッグ&ドロップまたは
                  <span className="text-blue-600 font-medium"> クリックして選択</span>
                </p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          {selectedFile && (
            <div className="mt-4 flex justify-end space-x-4">
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
                loading={isUploading}
              >
                アップロード
              </Button>
            </div>
          )}

          {/* Guidelines */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              アップロードガイドライン
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 最大ファイルサイズ: 10MB</li>
              <li>• 対応フォーマット: PDF, Excel, 画像 (JPG, PNG), AI, PSD</li>
              <li>• ファイルはセキュリティチェックが行われます</li>
              <li>• 機密情報を含むファイルは慎重に取り扱ってください</li>
            </ul>
          </div>
        </Card>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            アップロード済みファイル ({uploadedFiles.length})
          </h2>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{file.fileName}</p>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>{formatFileSize(file.fileSize)}</span>
                    <span>{getDataTypeLabel(file.dataType)}</span>
                    <span>{new Date(file.uploadedAt).toLocaleString('ja-JP')}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={file.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ダウンロード
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="secondary"
          onClick={() => router.push(`/member/orders/${order.id}`)}
        >
          注文詳細に戻る
        </Button>
      </div>
    </div>
  );
}
