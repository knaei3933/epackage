/**
 * Token Upload Client Component
 *
 * トークンアップロードクライアントコンポーネント
 * - 修正データのアップロード
 * - コメントの表示と入力
 * - 既存修正データの表示
 * - ファイルドラッグ＆ドロップ対応
 *
 * @client
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Upload,
  FileImage,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  Calendar,
  User,
  Package,
  Send,
  Clock,
} from 'lucide-react';
import { TokenUploadForm } from '@/components/upload/TokenUploadForm';
import { CommentSection } from '@/components/upload/CommentSection';
import { BilingualText } from '@/components/upload/BilingualText';

// =====================================================
// Types
// =====================================================

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  sku_name: string | null;
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

interface DesignRevision {
  id: string;
  revision_number: number;
  preview_image_url: string | null;
  original_file_url: string | null;
  korean_designer_comment: string | null;
  korean_designer_comment_ja: string | null;
  approval_status: string;
  created_at: string;
  original_customer_filename?: string | null;
  generated_correction_filename?: string | null;
}

interface DesignerUploadToken {
  id: string;
  order_id: string;
  order_item_id: string | null;
  token_hash: string;
  expires_at: string;
  status: 'active' | 'used' | 'expired' | 'revoked';
  upload_count: number;
  created_at: string;
  last_accessed_at: string | null;
  last_uploaded_at: string | null;
  sku_name?: string | null;
}

interface TokenUploadClientProps {
  token: string;
  tokenData: DesignerUploadToken;
  order: Order;
  initialRevisions: DesignRevision[];
  initialComments: DesignReviewComment[];
}

// =====================================================
// Main Component
// =====================================================

export function TokenUploadClient({
  token,
  tokenData,
  order,
  initialRevisions,
  initialComments,
}: TokenUploadClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [revisions, setRevisions] = useState<DesignRevision[]>(initialRevisions);
  const [comments, setComments] = useState<DesignReviewComment[]>(initialComments);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
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

  // Handle upload success
  const handleUploadSuccess = () => {
    setSuccessMessage('修正データをアップロードしました');
    // Refresh comments to get any auto-generated ones
    fetchComments();
  };

  // Fetch comments
  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/upload/${token}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Get status info
  const getStatusInfo = () => {
    switch (tokenData.status) {
      case 'active':
        return {
          label: '有効',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
        };
      case 'used':
        return {
          label: '使用済み',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CheckCircle,
        };
      case 'expired':
        return {
          label: '期限切れ',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: X,
        };
      case 'revoked':
        return {
          label: '無効',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: X,
        };
      default:
        return {
          label: tokenData.status,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Check if token is expiring soon (within 7 days)
  const daysUntilExpiry = Math.ceil(
    (new Date(tokenData.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <header className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                修正データアップロード
              </h1>
              <p className="text-slate-600">
                注文番号: <span className="font-semibold text-slate-900">{order.order_number}</span>
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="flex items-center gap-2">
                <StatusIcon className="w-5 h-5" />
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium border
                  ${statusInfo.color}
                `}>
                  {statusInfo.label}
                </span>
              </div>
              {isExpiringSoon && (
                <p className="text-sm text-orange-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  トークン有効期限まであと {daysUntilExpiry} 日
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div role="alert" aria-live="assertive" className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
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
        <div role="status" aria-live="polite" className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              注文詳細
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">顧客名</p>
                  <p className="font-medium text-slate-900">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">注文日</p>
                  <p className="font-medium text-slate-900">{formatDate(order.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Package className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">SKU</p>
                  <p className="font-medium text-slate-900">
                    {tokenData.sku_name || '全製品'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-2xl">¥</span>
                <div>
                  <p className="text-xs text-slate-500">注文金額</p>
                  <p className="font-medium text-slate-900">{formatCurrency(order.total_amount)}</p>
                </div>
              </div>
            </div>

            {/* Upload count info */}
            {tokenData.upload_count > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-700">
                  これまで {tokenData.upload_count} 回のアップロードがあります
                </p>
              </div>
            )}
          </section>

          {/* Upload Form */}
          <TokenUploadForm
            token={token}
            tokenData={tokenData}
            onUploadSuccess={handleUploadSuccess}
            onError={setError}
          />

          {/* Existing Revisions (if any) */}
          {revisions.length > 0 && (
            <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-green-600" />
                アップロード済み修正データ ({revisions.length})
              </h2>

              <div className="space-y-4">
                {revisions.map((revision) => (
                  <div
                    key={revision.id}
                    className="p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-slate-900">
                          リビジョン {revision.revision_number}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(revision.created_at)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {revision.preview_image_url && (
                          <a
                            href={revision.preview_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            プレビュー
                          </a>
                        )}
                        {revision.original_file_url && (
                          <a
                            href={revision.original_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            ダウンロード
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Filename Information */}
                    {(revision.original_customer_filename || revision.generated_correction_filename) && (
                      <div className="mb-2 p-2 bg-white rounded text-xs space-y-1">
                        {revision.original_customer_filename && (
                          <div className="flex items-start gap-2">
                            <span className="text-slate-500 font-medium min-w-[80px]">元ファイル:</span>
                            <span className="text-slate-700 break-all font-mono">
                              {revision.original_customer_filename}
                            </span>
                          </div>
                        )}
                        {revision.generated_correction_filename && (
                          <div className="flex items-start gap-2">
                            <span className="text-slate-500 font-medium min-w-[80px]">生成ファイル:</span>
                            <span className="text-slate-900 break-all font-mono font-medium">
                              {revision.generated_correction_filename}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {revision.korean_designer_comment && (
                      <div className="mt-2 p-2 bg-white rounded text-sm">
                        <BilingualText
                          content={revision.korean_designer_comment}
                          content_translated={revision.korean_designer_comment_ja}
                          original_language="ko"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar (Right column) */}
        <div className="space-y-6">
          {/* Comments Section */}
          <CommentSection
            token={token}
            orderId={tokenData.order_id}
            initialComments={comments}
            onCommentsUpdate={setComments}
            isLoading={isLoadingComments}
          />
        </div>
      </div>
    </div>
  );
}
