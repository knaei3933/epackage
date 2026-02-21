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
  order_id: string;
  order_item_id?: string | null;
  revision_number: number;
  revision_name: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  partner_comment: string | null;
  preview_image_url: string;
  original_file_url: string;
  created_at: string;
  updated_at: string;
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
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  CUSTOMER_APPROVAL_PENDING: {
    label: '顧客承認待ち',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  APPROVED: {
    label: '承認済み',
    color: 'bg-green-100 text-green-800 border-green-200',
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/designer"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        ダッシュボードに戻る
      </Link>

      {/* Error Display */}
      {error && (
        <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
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
            <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
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

      {/* Order Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{order.order_number}</h1>
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium border
                ${statusInfo.color}
              `}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-slate-600">注文詳細・教正データアップロード</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">注文金額</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(order.total_amount)}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">顧客名</p>
              <p className="font-medium text-slate-900">{order.customer_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">注文日</p>
              <p className="font-medium text-slate-900">{formatDate(order.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">SKU</p>
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
              <MapPin className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">納品先</p>
                <p className="font-medium text-slate-900 text-sm">
                  {order.delivery_address.prefecture} {order.delivery_address.city}
                </p>
              </div>
            </div>
          )}
        </div>

        {order.notes && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-slate-700">
              <span className="font-medium">備考:</span> {order.notes}
            </p>
          </div>
        )}
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Upload className="w-6 h-6 text-blue-600" />
          教正データアップロード
        </h2>

        {/* SKU Selection */}
        {order.items.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-900 mb-2">
              SKU <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedOrderItemId || ''}
              onChange={(e) => setSelectedOrderItemId(e.target.value || null)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isUploading
                  ? 'border-slate-300 bg-slate-50 cursor-not-allowed'
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
              />

              {previewFile ? (
                <div>
                  <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                  <p className="mt-4 text-sm font-medium text-slate-900">
                    {previewFile.name}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
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
                  <FileImage className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="mt-4 text-sm text-slate-600">
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
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isUploading
                  ? 'border-slate-300 bg-slate-50 cursor-not-allowed'
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
              />

              {originalFile ? (
                <div>
                  <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                  <p className="mt-4 text-sm font-medium text-slate-900">
                    {originalFile.name}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
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
                  <FileText className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="mt-4 text-sm text-slate-600">
                    クリックまたはドラッグ&ドロップ
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Korean Comment */}
        <div className="mt-6">
          <label htmlFor="korean-comment" className="block text-sm font-medium text-slate-900 mb-2">
            韓国語コメント（修正内容など）
          </label>
          <textarea
            id="korean-comment"
            value={koreanComment}
            onChange={(e) => setKoreanComment(e.target.value)}
            placeholder="한국어로 수정 내용을 입력하세요..."
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isUploading}
          />
          <p className="text-sm text-slate-500 mt-2">
            修正内容について顧客への説明を韓国語で入力してください（任意）
          </p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
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
              <span className="text-sm text-slate-600">{uploadProgress}%</span>
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
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            過去の教正データ ({revisions.length})
          </h2>

          <div className="space-y-4">
            {revisions.map((revision) => (
              <div
                key={revision.id}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900">
                        リビジョン #{revision.revision_number}
                      </h3>
                      {revision.order_item_id && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                          {order.items.find(i => i.id === revision.order_item_id)?.product_name}
                        </span>
                      )}
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${revision.approval_status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                        ${revision.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${revision.approval_status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {revision.approval_status === 'approved' && '承認済み'}
                        {revision.approval_status === 'pending' && '承認待ち'}
                        {revision.approval_status === 'rejected' && '却下'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mb-2">
                      {formatDate(revision.created_at)}
                    </p>

                    {revision.partner_comment && (
                      <div className="p-3 bg-white rounded border border-slate-200 mb-3">
                        <p className="text-sm text-slate-700">{revision.partner_comment}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <a
                        href={revision.preview_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        プレビュー
                      </a>
                      <a
                        href={revision.original_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
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
