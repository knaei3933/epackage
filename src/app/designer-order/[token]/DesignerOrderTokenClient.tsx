/**
 * Designer Order Token Client Component
 *
 * 디자이너 주문 토큰 클라이언트 컴포넌트
 * - 주문 상세 표시
 * - 기존 수정 데이터 표시
 * - 코멘트 표시
 * - 교정 데이터 업로드
 *
 * @client
 */

'use client';

import { useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import {
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
} from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { PostProcessingPositionInput } from '@/components/designer/PostProcessingPositionInput';

// =====================================================
// Types
// =====================================================

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  sku_name: string | null;
  specifications?: {
    customProductName?: string;
    [key: string]: any;
  } | null;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

interface DesignerTaskAssignment {
  id: string;
  designer_id: string;
  order_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_at: string;
  completed_at: string | null;
  notes: string | null;
  access_token_hash: string | null;
  access_token_expires_at: string | null;
  last_accessed_at: string | null;
  sku_name?: string | null;
}

interface DesignRevision {
  id: string;
  revision_number: number;
  preview_image_url: string | null;
  original_file_url: string | null;
  comment_ko: string | null;
  comment_ja: string | null;
  translation_status: string | null;
  approval_status: string;
  created_at: string;
  original_customer_filename?: string | null;
  generated_correction_filename?: string | null;
  order_item_id?: string | null;
}

interface DesignReviewComment {
  id: string;
  order_id: string;
  revision_id: string | null;
  content: string;
  content_translated: string | null;
  original_language: string;
  author_name_display: string;
  author_role: string;
  created_at: string;
}

interface CustomerFileUpload {
  id: string;
  file_name: string;
  file_type: string;
  drive_view_link: string | null;
  drive_content_link: string | null;
  drive_file_name: string | null;
  uploaded_at: string;
}

interface DesignerOrderTokenClientProps {
  token: string;
  assignmentData: DesignerTaskAssignment;
  order: Order;
  initialRevisions: DesignRevision[];
  initialComments: DesignReviewComment[];
  initialCustomerUploads: CustomerFileUpload[];
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
    label: '교정 작업 중',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  CUSTOMER_APPROVAL_PENDING: {
    label: '고객 승인 대기',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  APPROVED: {
    label: '승인 완료',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
};

// =====================================================
// Component
// =====================================================

export function DesignerOrderTokenClient({
  token,
  assignmentData,
  order,
  initialRevisions,
  initialComments,
  initialCustomerUploads,
}: DesignerOrderTokenClientProps): ReactNode {
  const { tn } = useTranslation();
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
  const [customerUploads, setCustomerUploads] = useState<CustomerFileUpload[]>(initialCustomerUploads);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  // 後加工位置情報State / 후가공 위치 정보 상태
  const [showPostProcessingInput, setShowPostProcessingInput] = useState(false);
  const [currentRevisionId, setCurrentRevisionId] = useState<string | null>(null);
  const [postProcessingSaved, setPostProcessingSaved] = useState(false);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Format date (UTC-based to avoid hydration errors from timezone differences)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes} UTC`;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Simple Japanese to Korean product name dictionary for common terms
  const jaKoProductNames: Record<string, string> = {
    'ヴァセリン': '바세린',
    'バセリン': '바세린',
    'ヴァセリン2': '바세린2',
    'バセリン2': '바세린2',
    'オリーブオイル': '올리브 오일',
    'コーヒー': '커피',
    '醤油': '간장',
    'シャンプー': '샴푸',
    '洗剤': '세제',
    '化粧水': '화장수',
    // Add more mappings as needed
  };

  // Simple Japanese detection (check for common Japanese characters)
  function isJapanese(text: string): boolean {
    return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
  }

  // Translate Japanese product name to Korean (simple version)
  function translateProductName(jaName: string): string {
    // Remove common suffixes
    const cleanName = jaName.replace(/\(.*?\)/g, '').trim();

    // Check dictionary first
    if (jaKoProductNames[cleanName]) {
      return jaKoProductNames[cleanName];
    }

    // If it's Japanese but not in dictionary, return with (일본어) suffix
    if (isJapanese(cleanName)) {
      return `${cleanName} (일본어)`;
    }

    // Otherwise return as is
    return cleanName;
  }

  // Format SKU name: SKU-{番号}_{商品名/미입력}_{製品タイプ}_{数量}
  const formatSkuName = (item: OrderItem, index: number): string => {
    // Extract sequential number from sku_name (e.g., "1" from "(SKU 1)")
    const skuMatch = item.sku_name?.match(/\(SKU\s*(\d+)\)/);
    const skuNumber = skuMatch ? skuMatch[1] : String(index + 1);

    // Extract product type from sku_name (e.g., "スタンドパウチ" from "スタンドパウチ - ...")
    let productType = '';
    if (item.sku_name) {
      const typeMatch = item.sku_name.match(/^([^-]+)/);
      if (typeMatch) {
        productType = typeMatch[1].trim();
        // Map Japanese product types
        const typeMap: Record<string, string> = {
          'スタンドパウチ': '스탠드 파우치',
          '三方パウチ': '삼방 봉투',
          'チャック付き袋': '지퍼백',
          'ガセット袋': '가셋봉투',
          '平袋': '플랫 봉투',
        };
        productType = typeMap[productType] || productType;
      }
    }

    // Get product name - extract from sku_name first, then fallback to specifications or product_name
    let productName = item.product_name?.trim() || '미입력';

    // Try to extract actual product name from sku_name (format: "ProductType - ActualName (SKU N)")
    if (item.sku_name) {
      // Match pattern like "スタンドパウチ - 実際の製品名 (SKU 1)"
      const nameMatch = item.sku_name.match(/-\s*([^(]+?)\s*\(SKU\s*\d+\)/);
      if (nameMatch && nameMatch[1]) {
        productName = nameMatch[1].trim();
      }
    }

    // Fallback: extract from uploaded file names (format: "ProductName_入稿データ_OrderNumber_Date.pdf")
    if (productName === 'カスタム製品' || productName === '미입력' || productName.includes('カスタム製品')) {
      // Find files uploaded for this order item
      const itemUploads = initialCustomerUploads.filter(upload =>
        upload.file_name.includes('_入稿データ_')
      );

      // Use the file that matches the SKU index (SKU1 = first file, SKU2 = second file, etc.)
      // Sort by upload date to ensure consistent ordering
      const sortedUploads = [...itemUploads].sort((a, b) =>
        new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime()
      );

      // Find the file that corresponds to this SKU based on index
      // SKU index 0 = first file, SKU index 1 = second file, etc.
      const skuIndex = order.items.findIndex(i => i.id === item.id);
      if (skuIndex >= 0 && skuIndex < sortedUploads.length) {
        const matchingFile = sortedUploads[skuIndex];
        const fileMatch = matchingFile.file_name.match(/^([^_]+)_入稿データ_/);
        if (fileMatch && fileMatch[1]) {
          productName = fileMatch[1];
        }
      }
    }

    // Fallback: extract from specifications if available
    if (productName === 'カスタム製品' || productName === '미입력' || productName.includes('カスタム製品')) {
      if (item.specifications) {
        const specs = item.specifications;
        if (specs.customProductName) {
          productName = specs.customProductName;
        }
      }
    }

    // Clean up productName - remove trailing "(SKU...)" if present
    productName = productName.replace(/\(SKU\s*\d+\)/g, '').trim();

    // Translate Japanese product name to Korean if it's Japanese
    productName = translateProductName(productName);

    // Get quantity
    const quantity = item.quantity;

    return `SKU-${skuNumber}_${productName}_${productType}_${quantity}`;
  };

  // Handle file selection
  const handlePreviewFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.type.startsWith('image/')) {
      setError('프리뷰 이미지는 JPG/PNG 형식만 지원합니다');
      return;
    }

    if (file.size > FILE_SIZE_LIMITS.PREVIEW_IMAGE) {
      setError('프리뷰 이미지는 5MB 이하여야 합니다');
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
      setError('원본 파일은 AI/PDF/PSD/EPS 형식만 지원합니다');
      return;
    }

    if (file.size > FILE_SIZE_LIMITS.ORIGINAL_FILE) {
      setError('원본 파일은 50MB 이하여야 합니다');
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

  // Handle file deletion
  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('このファイルを削除してもよろしいですか？')) {
      return;
    }

    setDeletingFileId(fileId);
    setError(null);

    try {
      const response = await fetch(
        `/api/designer/orders/${order.id}/data-receipt/${fileId}?token=${encodeURIComponent(token)}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '削除に失敗しました');
      }

      // Reload customer uploads
      const uploadsResponse = await fetch(`/api/designer/orders/${order.id}?token=${encodeURIComponent(token)}`);
      if (uploadsResponse.ok) {
        const uploadsData = await uploadsResponse.json();
        setCustomerUploads(uploadsData.customerUploads || []);
        setSuccessMessage('ファイルを削除しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setDeletingFileId(null);
    }
  };

  // Upload correction
  const handleUpload = async () => {
    if (!previewFile || !originalFile) {
      setError('프리뷰 이미지와 원본 파일을 모두 선택해주세요');
      return;
    }

    if (!selectedOrderItemId && order.items.length > 1) {
      setError('SKU를 선택해주세요');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('preview_image', previewFile);
      formData.append('original_file', originalFile);
      formData.append('comment_ko', koreanComment);
      formData.append('token', token); // Token authentication

      if (selectedOrderItemId) {
        formData.append('order_item_id', selectedOrderItemId);
      }

      // Upload with progress simulation
      const uploadPromise = fetch(`/api/designer/orders/${order.id}/correction`, {
        method: 'POST',
        body: formData,
        // No credentials: 'include' needed - token only authentication
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
        throw new Error(errorData.error || '업로드에 실패했습니다');
      }

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('교정 데이터를 업로드했습니다');
        setPreviewFile(null);
        setOriginalFile(null);
        setKoreanComment('');

        // Reload revisions
        const revisionsResponse = await fetch(`/api/designer/orders/${order.id}/revisions?token=${token}`);
        if (revisionsResponse.ok) {
          const revisionsData = await revisionsResponse.json();
          const newRevisions = revisionsData.revisions || [];
          setRevisions(newRevisions);

          // Show post-processing input for the latest revision
          if (newRevisions.length > 0) {
            const latestRevision = newRevisions[0]; // Most recent first
            setCurrentRevisionId(latestRevision.id);
            setShowPostProcessingInput(true);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '예기치 않은 오류가 발생했습니다');
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {tn('designer', 'order.details')}
                </h1>
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium border
                  ${statusInfo.color}
                `}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-gray-600">
                {tn('designer', 'order.orderNumber')}: {order.order_number}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">오류</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
                aria-label="오류 메시지 닫기"
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
                aria-label="성공 메시지 닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            {tn('designer', 'order.orderInfo')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">{tn('designer', 'dashboard.customerName')}</p>
                <p className="font-medium text-slate-900">{order.customer_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">{tn('designer', 'order.createdAt')}</p>
                <p className="font-medium text-slate-900">{formatDate(order.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        {order.items && order.items.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{tn('designer', 'order.orderItems')}</h2>
            <ul className="space-y-2">
              {order.items.map((item, index) => (
                <li key={item.id} className="border-b pb-2">
                  {formatSkuName(item, index)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Customer Upload Files */}
        {customerUploads.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-600" />
              고객 입고 데이터 ({customerUploads.length})
            </h2>

            <div className="space-y-3">
              {customerUploads.map((file) => (
                <div
                  key={file.id}
                  className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-slate-900">{file.drive_file_name || file.file_name}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {formatDate(file.uploaded_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {/* Google Drive Preview (if available) */}
                    {file.drive_view_link && (
                      <a
                        href={file.drive_view_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        미리보기
                      </a>
                    )}
                    {/* Direct Download (always available via API) */}
                    <a
                      href={`/api/designer/download-file/${file.id}?token=${encodeURIComponent(token)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      다운로드
                    </a>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={deletingFileId === file.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                      {deletingFileId === file.id ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-600" />
            교정 데이터 업로드
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
                <option value="">선택해주세요</option>
                {order.items.map((item, index) => (
                  <option key={item.id} value={item.id}>
                    {formatSkuName(item, index)}
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
                프리뷰 이미지 (JPG/PNG)
              </h3>
              <p className="text-sm text-slate-600 mb-4">1920x1080px 이상, 5MB 이하</p>

              <div
                role="button"
                tabIndex={isUploading ? -1 : 0}
                aria-label="프리뷰 이미지 업로드 (클릭 또는 드래그 앤 드롭)"
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
                      지우기
                    </button>
                  </div>
                ) : (
                  <div>
                    <FileImage className="mx-auto h-12 w-12 text-slate-400" />
                    <p className="mt-4 text-sm text-slate-600">
                      클릭 또는 드래그 앤 드롭
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Original File Upload */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                원본 디자인 파일 (AI/PDF/PSD)
              </h3>
              <p className="text-sm text-slate-600 mb-4">50MB 이하</p>

              <div
                role="button"
                tabIndex={isUploading ? -1 : 0}
                aria-label="원본 디자인 파일 업로드 (클릭 또는 드래그 앤 드롭)"
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
                      지우기
                    </button>
                  </div>
                ) : (
                  <div>
                    <FileText className="mx-auto h-12 w-12 text-slate-400" />
                    <p className="mt-4 text-sm text-slate-600">
                      클릭 또는 드래그 앤 드롭
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Korean Comment */}
          <div className="mt-6">
            <label htmlFor="korean-comment" className="block text-sm font-medium text-slate-900 mb-2">
              한국어 코멘트 (수정 내용 등)
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
              수정 내용에 대한 설명을 고객에게 한국어로 입력해주세요 (선택 사항)
            </p>
          </div>

          {/* 後加工位置入力フォーム / 후가공 위치 입력 폼 */}
          {showPostProcessingInput && currentRevisionId && selectedOrderItemId && (
            <div className="mt-6">
              <PostProcessingPositionInput
                skuName={
                  order.items.find(item => item.id === selectedOrderItemId)?.sku_name ||
                  order.items.find(item => item.id === selectedOrderItemId)?.product_name ||
                  '미입력'
                }
                initialData={{}}
                onSave={async (data) => {
                  // 後加工位置情報を保存
                  const response = await fetch(
                    `/api/design-revisions/${currentRevisionId}/postprocessing-positions`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        sku_name: order.items.find(item => item.id === selectedOrderItemId)?.sku_name ||
                                   order.items.find(item => item.id === selectedOrderItemId)?.product_name ||
                                   '미입력',
                        ...data,
                      }),
                    }
                  );

                  if (response.ok) {
                    setSuccessMessage('후가공 위치 정보를 저장했습니다 / 後加工位置情報を保存しました');
                    setPostProcessingSaved(true);
                    setTimeout(() => setPostProcessingSaved(false), 3000);
                  } else {
                    const error = await response.json();
                    setError(error.error || '저장에 실패했습니다 / 保存に失敗しました');
                  }
                }}
                disabled={postProcessingSaved}
              />
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-4">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">업로드 중...</p>
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
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  교정 데이터 업로드
                </>
              )}
            </button>
          </div>
        </div>

        {/* Previous Revisions */}
        {revisions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              과거 교정 데이터 ({revisions.length})
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
                          리비전 #{revision.revision_number}
                        </h3>
                        {revision.order_item_id && (() => {
                          const item = order.items.find(i => i.id === revision.order_item_id);
                          const index = order.items.findIndex(i => i.id === revision.order_item_id);
                          return item ? (
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                              {formatSkuName(item, index)}
                            </span>
                          ) : null;
                        })()}
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${revision.approval_status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                          ${revision.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${revision.approval_status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {revision.approval_status === 'approved' && '승인 완료'}
                          {revision.approval_status === 'pending' && '승인 대기'}
                          {revision.approval_status === 'rejected' && '거절'}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 mb-2">
                        {formatDate(revision.created_at)}
                      </p>

                      {revision.comment_ko && (
                        <div className="p-3 bg-white rounded border border-slate-200 mb-3">
                          <p className="text-sm text-slate-700">{revision.comment_ko}</p>
                          {revision.comment_ja && (
                            <p className="text-sm text-slate-500 mt-2">{revision.comment_ja}</p>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {revision.preview_image_url && (
                          <a
                            href={revision.preview_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            프리뷰
                          </a>
                        )}
                        {revision.original_file_url && (
                          <a
                            href={revision.original_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            원본 다운로드
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        {initialComments.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{tn('designer', 'order.comments')}</h2>
            <ul className="space-y-3">
              {initialComments.map((comment) => (
                <li key={comment.id} className="border-b pb-3">
                  <p className="font-semibold">{comment.author_name_display} ({comment.author_role})</p>
                  <p className="text-gray-700">{comment.content}</p>
                  {comment.content_translated && (
                    <p className="text-gray-500 text-sm">{comment.content_translated}</p>
                  )}
                  <p className="text-gray-400 text-sm">{formatDate(comment.created_at)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Assignment Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">{tn('designer', 'order.assignmentStatus')}</h2>
          <div className="space-y-2">
            <p><strong>{tn('designer', 'dashboard.status')}:</strong> {assignmentData.status}</p>
            <p><strong>{tn('designer', 'dashboard.assignedAt')}:</strong> {formatDate(assignmentData.assigned_at)}</p>
            {assignmentData.completed_at && (
              <p><strong>{tn('designer', 'order.completedAt')}:</strong> {formatDate(assignmentData.completed_at)}</p>
            )}
            {assignmentData.last_accessed_at && (
              <p><strong>{tn('designer', 'order.lastAccess')}:</strong> {formatDate(assignmentData.last_accessed_at)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
