/**
 * Designer Order Detail Client Component
 *
 * デザイナー注文詳細クライアント
 * - 注文詳細表示
 * - 教正データアップロード
 * - 過去のリビジョン表示
 *
 * @client
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDateTimeJa } from '@/utils/formatters';
import {
  ArrowLeft,
  FileImage,
  FileText,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  Calendar,
  User,
  Package,
  MapPin,
} from 'lucide-react';

// =====================================================
// Types
// =====================================================

interface DesignerOrderItem {
  id: string;
  product_name: string;
  quantity: number;
  specifications?: Record<string, any>;
}

interface DesignerOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: DesignerOrderItem[];
  delivery_address?: any;
  billing_address?: any;
  notes?: string;
}

interface DesignRevision {
  id: string;
  order_item_id?: string | null;
  revision_number: number;
  approval_status: 'pending' | 'approved' | 'rejected';
  partner_comment: string | null;
  preview_image_url: string;
  original_file_url: string;
  created_at: string;
}

interface DesignerOrderDetailClientProps {
  designerEmail: string;
  designerName?: string;
  order: DesignerOrder;
  initialRevisions: DesignRevision[];
  isAdmin?: boolean;
}

// =====================================================
// Constants
// =====================================================

const FILE_SIZE_LIMITS = {
  PREVIEW_IMAGE: 5 * 1024 * 1024, // 5MB
  ORIGINAL_FILE: 50 * 1024 * 1024, // 50MB
} as const;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  CORRECTION_IN_PROGRESS: {
    label: '教正作業中',
    color: 'bg-brand-muted text-brand border-brand-soft',
  },
  CUSTOMER_APPROVAL_PENDING: {
    label: '顧客承認待ち',
    color: 'bg-warning-muted text-on-warning-muted border-warning',
  },
  APPROVED: {
    label: '承認済み',
    color: 'bg-success-muted text-on-success-muted border-success',
  },
};

// =====================================================
// Main Component
// =====================================================

export function DesignerOrderDetailClient({
  designerEmail,
  designerName,
  order,
  initialRevisions,
}: DesignerOrderDetailClientProps) {
  const router = useRouter();
  const previewInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [koreanComment, setKoreanComment] = useState('');
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<string | null>(
    order.items.length === 1 ? order.items[0].id : null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [revisions, setRevisions] = useState<DesignRevision[]>(initialRevisions);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Handle file selection
  const handlePreviewFileSelect = useCallback((files: FileList | null) => {
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
  }, []);

  const handleOriginalFileSelect = useCallback((files: FileList | null) => {
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

  // Upload correction
  const handleUpload = async () => {
    if (!previewFile || !originalFile) {
      setError('プレビュー画像と原版ファイルの両方を選択してください');
      return;
    }

    if (!selectedOrderItemId && order.items.length > 1) {
      setError('SKUを選択してください');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('preview_image', previewFile);
      formData.append('original_file', originalFile);
      formData.append('partner_comment', koreanComment);
      formData.append('notify_customer', 'true'); // デザイナーは常に通知を送信

      if (selectedOrderItemId) {
        formData.append('order_item_id', selectedOrderItemId);
      }

      // Upload with progress simulation
      const uploadPromise = fetch(`/api/designer/orders/${order.id}/correction`, {
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
        setKoreanComment('');

        // Reload revisions
        const revisionsResponse = await fetch(`/api/designer/orders/${order.id}/revisions`);
        if (revisionsResponse.ok) {
          const revisionsData = await revisionsResponse.json();
          setRevisions(revisionsData.revisions || []);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const statusInfo = STATUS_LABELS[order.status] || {
    label: order.status,
    color: 'bg-bg-muted text-text-primary border-border-medium',
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/designer"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        ダッシュボードに戻る
      </Link>

      {/* Error Display */}
      {error && (
        <div role="alert" aria-live="assertive" className="bg-error-muted border border-error rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-error mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-on-error-muted">エラー</h3>
              <p className="text-sm text-on-error-muted mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-error hover:text-on-error-muted"
              aria-label="エラーメッセージを閉じる"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Success Display */}
      {successMessage && (
        <div role="status" aria-live="polite" className="bg-success-muted border border-success rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-6 w-6 text-success mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-on-success-muted">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-success hover:text-on-success-muted"
              aria-label="成功メッセージを閉じる"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Order Header */}
      <div className="bg-white rounded-container shadow-sm border border-border-medium p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-text-primary">{order.order_number}</h1>
              <span className={`
                px-3 py-1 rounded-inner text-sm font-medium border
                ${statusInfo.color}
              `}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-text-secondary">注文詳細・教正データアップロード</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-muted">注文金額</p>
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(order.total_amount)}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-bg-secondary rounded-lg">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">顧客名</p>
              <p className="font-medium text-text-primary">{order.customer_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">注文日</p>
              <p className="font-medium text-text-primary">{formatDateTimeJa(order.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-text-muted" />
            <div>
              <p className="text-xs text-text-muted">SKU</p>
              <div className="flex flex-wrap gap-1">
                {order.items.map((item) => (
                  <span key={item.id} className="bg-white px-2 py-0.5 rounded text-xs">
                    {item.product_name} x {item.quantity}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {order.delivery_address && (
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-text-muted" />
              <div>
                <p className="text-xs text-text-muted">納品先</p>
                <p className="font-medium text-text-primary text-sm">
                  {order.delivery_address.prefecture} {order.delivery_address.city}
                </p>
              </div>
            </div>
          )}
        </div>

        {order.notes && (
          <div className="mt-4 p-4 bg-brand-muted rounded-lg">
            <p className="text-sm text-text-secondary">
              <span className="font-medium">備考:</span> {order.notes}
            </p>
          </div>
        )}
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-container shadow-sm border border-border-medium p-6">
        <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <Upload className="w-6 h-6 text-brand" />
          教正データアップロード
        </h2>

        {/* SKU Selection */}
        {order.items.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              SKU <span className="text-error">*</span>
            </label>
            <select
              value={selectedOrderItemId || ''}
              onChange={(e) => setSelectedOrderItemId(e.target.value || null)}
              className="h-10 max-sm:h-11 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted"
              disabled={isUploading}
              required
            >
              <option value="">選択してください</option>
              {order.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.product_name} (数量: {item.quantity})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Upload Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isUploading
                  ? 'border-border-strong bg-bg-secondary cursor-not-allowed'
                  : 'border-brand-soft hover:border-brand hover:bg-brand-subtle'
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

              {previewFile ? (
                <div>
                  <CheckCircle className="mx-auto h-12 w-12 text-success" />
                  <p className="mt-4 text-sm font-medium text-text-primary">
                    {previewFile.name}
                  </p>
                  <p className="text-sm text-text-muted mt-1">
                    {formatFileSize(previewFile.size)}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewFile(null);
                    }}
                    className="mt-2 text-sm text-error hover:text-on-error-muted"
                  >
                    クリア
                  </button>
                </div>
              ) : (
                <div>
                  <FileImage className="mx-auto h-12 w-12 text-text-muted" />
                  <p className="mt-4 text-sm text-text-secondary">
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
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isUploading
                  ? 'border-border-strong bg-bg-secondary cursor-not-allowed'
                  : 'border-brand-soft hover:border-brand hover:bg-brand-subtle'
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
                  <CheckCircle className="mx-auto h-12 w-12 text-success" />
                  <p className="mt-4 text-sm font-medium text-text-primary">
                    {originalFile.name}
                  </p>
                  <p className="text-sm text-text-muted mt-1">
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
                  <FileText className="mx-auto h-12 w-12 text-text-muted" />
                  <p className="mt-4 text-sm text-text-secondary">
                    クリックまたはドラッグ&ドロップ
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Korean Comment */}
        <div className="mt-6">
          <label htmlFor="korean-comment" className="block text-sm font-medium text-text-primary mb-2">
            韓国語コメント（修正内容など）
          </label>
          <textarea
            id="korean-comment"
            value={koreanComment}
            onChange={(e) => setKoreanComment(e.target.value)}
            placeholder="한국어로 수정 내용을 입력하세요..."
            rows={4}
            className="min-h-24 py-2 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted"
            disabled={isUploading}
          />
          <p className="text-sm text-text-muted mt-2">
            修正内容について顧客への説明を韓国語で入力してください（任意）
          </p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-6 p-4 bg-brand-muted rounded-lg">
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
              <span className="text-sm text-text-secondary">{uploadProgress}%</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!previewFile || !originalFile || isUploading}
            className={`
              px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all
              ${!previewFile || !originalFile || isUploading
                ? 'bg-bg-muted text-text-muted cursor-not-allowed'
                : 'bg-brand text-white hover:bg-brand-hover'
              }
            `}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                アップロード中...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                教正データをアップロード
              </>
            )}
          </button>
        </div>
      </div>

      {/* Previous Revisions */}
      {revisions.length > 0 && (
        <div className="bg-white rounded-container shadow-sm border border-border-medium p-6">
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand" />
            過去の教正データ ({revisions.length})
          </h2>

          <div className="space-y-4">
            {revisions.map((revision) => (
              <div
                key={revision.id}
                className="p-4 bg-bg-secondary rounded-lg border border-border-medium"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-text-primary">
                        リビジョン #{revision.revision_number}
                      </h3>
                      {revision.order_item_id && (
                        <span className="bg-brand-muted text-brand px-2 py-0.5 rounded text-xs font-medium">
                          {order.items.find(i => i.id === revision.order_item_id)?.product_name}
                        </span>
                      )}
                      <span className={`
                        px-2 py-1 rounded-inner text-xs font-medium
                        ${revision.approval_status === 'approved' ? 'bg-success-muted text-on-success-muted' : ''}
                        ${revision.approval_status === 'pending' ? 'bg-warning-muted text-on-warning-muted' : ''}
                        ${revision.approval_status === 'rejected' ? 'bg-error-muted text-on-error-muted' : ''}
                      `}>
                        {revision.approval_status === 'approved' && '承認済み'}
                        {revision.approval_status === 'pending' && '承認待ち'}
                        {revision.approval_status === 'rejected' && '却下'}
                      </span>
                    </div>

                    <p className="text-sm text-text-secondary mb-2">
                      {formatDateTimeJa(revision.created_at)}
                    </p>

                    {revision.partner_comment && (
                      <div className="p-3 bg-white rounded border border-border-medium mb-3">
                        <p className="text-sm text-text-secondary">{revision.partner_comment}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <a
                        href={revision.preview_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-brand-muted text-brand rounded hover:bg-brand-subtle transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        プレビュー
                      </a>
                      <a
                        href={revision.original_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-brand-muted text-brand rounded hover:bg-brand-subtle transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        原版ダウンロード
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
