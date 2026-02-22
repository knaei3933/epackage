/**
 * File Resubmission Section Component (Member)
 *
 * Phase 3: Customer File Re-submission UI
 * - Drag & drop file upload
 * - Current file display
 * - Re-submission history
 * - Optional reason input
 * - Integration with resubmit-file API
 *
 * @client
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, FileText, History, RefreshCw, AlertCircle, CheckCircle, X } from 'lucide-react';

// =====================================================
// Types
// =====================================================

interface FileResubmissionSectionProps {
  orderId: string;
  orderNumber: string;
  onFileResubmitted?: () => void;
}

interface CustomerFileSubmission {
  id: string;
  order_id: string;
  original_filename: string;
  file_url: string;
  file_type: string;
  file_size_bytes: number;
  submission_number: number;
  is_current: boolean;
  uploaded_at: string;
  replaced_at: string | null;
}

interface SubmissionHistoryItem {
  submission_number: number;
  filename: string;
  file_url: string;
  uploaded_at: string;
  is_current: boolean;
}

// =====================================================
// Component
// =====================================================

export function FileResubmissionSection({
  orderId,
  orderNumber,
  onFileResubmitted,
}: FileResubmissionSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentSubmission, setCurrentSubmission] = useState<CustomerFileSubmission | null>(null);
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionHistoryItem[]>([]);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  // Load submission history on mount
  useEffect(() => {
    loadSubmissionHistory();
  }, [orderId]);

  // Load submission history
  const loadSubmissionHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/member/orders/${orderId}/resubmit-file`);
      const result = await response.json();

      if (result.success) {
        const submissions = result.submissions || [];

        // Transform to history items
        const historyItems: SubmissionHistoryItem[] = submissions.map((s: CustomerFileSubmission) => ({
          submission_number: s.submission_number,
          filename: s.original_filename,
          file_url: s.file_url,
          uploaded_at: s.uploaded_at,
          is_current: s.is_current,
        }));

        setSubmissionHistory(historyItems);

        // Set current submission
        const current = submissions.find((s: CustomerFileSubmission) => s.is_current);
        setCurrentSubmission(current || null);
      }
    } catch (err) {
      console.error('[FileResubmissionSection] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Handle file selection - AI files only (.ai, .eps, .pdf)
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type - only AI files allowed
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.ai', '.eps', '.pdf'];
    const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isAllowed) {
      setError('入稿データはAI、EPS、PDF形式のみ可能です。');
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

      if (currentSubmission) {
        formData.append('originalSubmissionId', currentSubmission.id);
      }

      if (reason.trim()) {
        formData.append('reason', reason.trim());
      }

      // Upload with progress simulation
      const uploadPromise = fetch(`/api/member/orders/${orderId}/resubmit-file`, {
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
        setSuccessMessage(`ファイルを再提出しました（提出番号: ${result.submission.submission_number}）`);
        setSelectedFile(null);
        setReason('');
        loadSubmissionHistory();

        // Callback to notify parent component
        onFileResubmitted?.();

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

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            ファイル再提出
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            入稿データを再提出できます
          </p>
        </div>

        {/* History Toggle */}
        {submissionHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="w-4 h-4 mr-2" />
            履歴 ({submissionHistory.length})
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Success Display */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Current File Display */}
      {currentSubmission && !showHistory && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">現在のファイル</p>
                <p className="text-xs text-blue-700 mt-1">
                  {currentSubmission.original_filename}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  提出番号: {currentSubmission.submission_number} • {formatDate(currentSubmission.uploaded_at)}
                </p>
              </div>
            </div>
            <a
              href={currentSubmission.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ダウンロード
            </a>
          </div>
        </div>
      )}

      {/* Submission History */}
      {showHistory && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            提出履歴
          </h3>
          {submissionHistory.length === 0 ? (
            <p className="text-sm text-gray-500">まだ提出履歴がありません。</p>
          ) : (
            <div className="space-y-2">
              {submissionHistory.map((item) => (
                <div
                  key={item.submission_number}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.is_current ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.is_current ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${
                        item.is_current ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {item.filename}
                        {item.is_current && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            現在
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        提出番号: {item.submission_number} • {formatDate(item.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ダウンロード
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Form */}
      <div className="space-y-4">
        {/* Reason Input (Optional) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            再提出の理由（任意）
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="再提出の理由があれば入力してください..."
            rows={2}
            className="w-full px-3 py-2 border border-border-secondary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
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
              <div className="mx-auto w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div>
                <p className="text-sm font-medium">アップロード中...</p>
                <p className="text-sm text-muted-foreground mt-1">{uploadProgress}%</p>
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
              <CheckCircle className="mx-auto h-10 w-10 text-green-600" />
              <p className="mt-3 text-sm font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
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
              <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                ファイルをドラッグ&ドロップまたは
                <span className="text-blue-600 font-medium"> クリックして選択</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
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
              <RefreshCw className="w-4 h-4 mr-2" />
              再提出する
            </Button>
          </div>
        )}

        {/* Guidelines */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            ファイル再提出について
          </h3>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• 対応ファイル形式: AI (Adobe Illustrator), EPS, PDF</li>
            <li>• 最大ファイルサイズ: 10MB</li>
            <li>• 再提出すると、以前のファイルは履歴に保存されます</li>
            <li>• ファイル名は自動的に生成されます（例: 入稿データ_ORD-001_20260221_R2.ai）</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
