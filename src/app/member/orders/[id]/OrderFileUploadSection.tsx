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
import { ConfirmModal, useConfirmModal } from '@/components/ui/ConfirmModal';
import type { Order } from '@/types/dashboard';

// =====================================================
// Props & Types
// =====================================================

interface OrderFileUploadSectionProps {
  order: Order;
  fetchFn?: typeof fetch; // Optional custom fetch function (e.g., adminFetch)
  onFileUploaded?: () => void; // Callback after successful upload
}

interface UploadedFile {
  id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  uploaded_at: string;
  validation_status: 'PENDING' | 'VALID' | 'INVALID';
  order_item_id?: string | null;  // NEW: SKU association
  sku_name?: string | null;  // NEW: SKU name snapshot
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
}

interface ValidationError {
  message_ja: string;
  message_en: string;
  code: string;
  category: string;
}

type FileType = 'production_data' | 'reference' | 'other';

// =====================================================
// Main Component
// =====================================================

export function OrderFileUploadSection({ order, fetchFn = fetch, onFileUploaded }: OrderFileUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Modal State
  const { isOpen: isConfirmModalOpen, openConfirmModal, closeConfirmModal, modalProps } = useConfirmModal();

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [description, setDescription] = useState('');
  const [productName, setProductName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [pendingDeleteFile, setPendingDeleteFile] = useState<{ id: string; name: string } | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<string | null>(null);
  const [skuSubmissionStatus, setSkuSubmissionStatus] = useState<{
    totalSkus: number;
    submittedSkus: number;
    isComplete: boolean;
    pendingSkus: Array<{ id: string; productName: string; quantity: number }>;
  } | null>(null);

  // Load existing files on mount
  useEffect(() => {
    loadUploadedFiles();
  }, [order.id]);

  // Initialize order items from order prop
  useEffect(() => {
    if (order.items && order.items.length > 0) {
      const items: OrderItem[] = order.items.map(item => ({
        id: item.id,
        product_name: item.productName,
        quantity: item.quantity,
      }));
      setOrderItems(items);
      // Auto-select first item if only one item exists
      if (items.length === 1) {
        setSelectedOrderItemId(items[0].id);
      }
    }
  }, [order.items]);

  // Format SKU display name: "SKU번호_스탠드파우치(제품명만)_1000枚"
  const formatSkuDisplayName = (productName: string, quantity: number): string => {
    // Extract SKU number from pattern like "(SKU 1)" or "SKU 1"
    const skuMatch = productName.match(/[（(]SKU\s*(\d+)[）)]/i);
    const skuNumber = skuMatch ? skuMatch[1] : '?';

    // Extract main product name and description
    // Format: "스탠드 파우치 - 알루미늄 박 라미네이트 (SKU 1)"
    // or "スタンドパウチ - アルミ箔ラミネートによる高バリア性 (SKU 1)"
    let mainProduct = '';
    let description = '';

    // Try to split by " - " or " -" or "-"
    if (productName.includes(' - ')) {
      const parts = productName.split(' - ');
      mainProduct = parts[0].trim();
      description = parts[1]?.replace(/\s*[（(]SKU\s*\d+[）)]/i, '').trim() || '';
    } else {
      mainProduct = productName.split(/\s+[（(]SKU/i)[0].trim();
    }

    // Simplify main product name (remove extra spaces, get first meaningful part)
    const simplifiedProduct = mainProduct.split(/\s+/)[0];

    // Simplify description (remove common suffixes)
    const simplifiedDesc = description
      .replace(/による.*$/, '')  // Remove "による高バリア性" etc.
      .replace(/高バリア性$/, '')
      .replace(/ laminate$/i, '')
      .trim();

    // Build format: "SKU번호_스탠드파우치(알루미늄박)_1000枚"
    const productPart = simplifiedDesc ? `${simplifiedProduct}(${simplifiedDesc})` : simplifiedProduct;
    return `${skuNumber}_${productPart}_${quantity}枚`;
  };

  // Load uploaded files
  const loadUploadedFiles = async () => {
    try {
      const response = await fetchFn(`/api/member/orders/${order.id}/data-receipt`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(data.data.files || []);
        setSkuSubmissionStatus(data.data.skuSubmissionStatus || null);
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

    // Validate product name is required
    if (!productName.trim()) {
      setError('製品名を入力してください');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('product_name', productName.trim());
      // Always use production_data for AI files
      formData.append('data_type', 'production_data');
      if (description) {
        formData.append('description', description);
      }
      // Add order_item_id if SKU is selected
      if (selectedOrderItemId) {
        formData.append('order_item_id', selectedOrderItemId);
      }

      // Upload with progress simulation
      const uploadPromise = fetchFn(`/api/member/orders/${order.id}/data-receipt`, {
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
        const details = errorData.details ? ` (${errorData.details})` : '';
        const code = errorData.code ? ` [${errorData.code}]` : '';
        throw new Error((errorData.error || errorData.errorEn || 'アップロードに失敗しました') + code + details);
      }

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('入稿データをアップロードしました。韓国担当者に送信されました。');
        setSelectedFile(null);
        setDescription('');
        setProductName('');
        loadUploadedFiles();

        // Callback to notify parent component
        onFileUploaded?.();

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
  const handleDelete = (fileId: string, fileName: string) => {
    // Set pending delete and show custom modal
    setPendingDeleteFile({ id: fileId, name: fileName });

    openConfirmModal({
      title: 'ファイル削除の確認',
      message: `「${fileName}」を削除してもよろしいですか？`,
      confirmLabel: '削除する',
      cancelLabel: 'キャンセル',
      variant: 'danger',
      onConfirm: () => executeDelete(fileId),
    });
  };

  // Execute file deletion
  const executeDelete = async (fileId: string) => {
    setDeletingFileId(fileId);

    try {
      const response = await fetch(`/api/member/orders/${order.id}/data-receipt/files/${fileId}`, {
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
      setPendingDeleteFile(null);
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

  // Get SKU name helper function for files
  const getFileSkuName = (file: UploadedFile) => {
    // Use sku_name snapshot if available (most accurate)
    if (file.sku_name) {
      return file.sku_name;
    }

    // Fallback to order_item_id lookup with new format
    if (!file.order_item_id) return 'すべてのSKU (All SKUs)';
    const item = orderItems.find(i => i.id === file.order_item_id);
    if (item) {
      return formatSkuDisplayName(item.product_name, item.quantity);
    }
    return 'Unknown SKU';
  };

  return (
    <>
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  入稿データ（AI）のアップロードが必須です
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  生産を開始するために、必ず入稿データ（AI）をアップロードしてください。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Partial SKU Submission Warning */}
        {skuSubmissionStatus && skuSubmissionStatus.totalSkus > 1 && !skuSubmissionStatus.isComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5"
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
                <h3 className="text-sm font-medium text-amber-800">
                  すべてのSKUの入稿データをアップロードしてください
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  {skuSubmissionStatus.submittedSkus} / {skuSubmissionStatus.totalSkus} SKUのデータがアップロードされています。
                </p>
                {skuSubmissionStatus.pendingSkus.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-amber-800 mb-1">未アップロードのSKU:</p>
                    <ul className="text-xs text-amber-700 list-disc list-inside">
                      {skuSubmissionStatus.pendingSkus.map((sku) => {
                        const displayName = formatSkuDisplayName(sku.productName, sku.quantity);
                        return <li key={sku.id}>{displayName}</li>;
                      })}
                    </ul>
                  </div>
                )}
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
          {/* Product Name (Required) */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              製品名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="例: EPAC-001"
              className="w-full px-3 py-2 border border-border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={isUploading}
              required
            />
            <p className="text-xs text-text-muted mt-1">
              ※ ファイル名に使用されます（例: 製品名_入稿データ_注文番号_日付）
            </p>
          </div>

          {/* SKU Selector (conditional - only show when orderItems.length > 1) */}
          {orderItems.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                SKU選択 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedOrderItemId || ''}
                onChange={(e) => setSelectedOrderItemId(e.target.value || null)}
                className="w-full px-3 py-2 border border-border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                disabled={isUploading}
                required
              >
                <option value="">選択してください</option>
                {orderItems.map((item) => {
                  const displayName = formatSkuDisplayName(item.product_name, item.quantity);
                  return (
                    <option key={item.id} value={item.id}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-text-muted mt-1">
                ※ 複数のSKUがある場合は、該当するSKUを選択してください
              </p>
            </div>
          )}

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
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              入稿データアップロードガイドライン
            </h3>
            <ul className="text-sm space-y-1 text-gray-700">
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
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {getFileSkuName(file)}
                        </span>
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

    {/* Custom Confirm Modal */}
    {isConfirmModalOpen && modalProps && (
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        {...modalProps}
      />
    )}
    </>
  );
}
