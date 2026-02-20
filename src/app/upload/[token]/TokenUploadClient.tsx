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
import TokenUploadForm from '@/components/upload/TokenUploadForm';
import CommentSection from '@/components/upload/CommentSection';
import BilingualText from '@/components/upload/BilingualText';

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

interface CorrectionComment {
  id: string;
  korea_correction_id: string;
  author_name: string;
  content: string;
  content_translated: string | null;
  original_language: 'ko' | 'ja' | 'en';
  is_designer: boolean;
  created_at: string;
}

interface KoreaCorrection {
  id: string;
  order_id: string;
  order_item_id: string | null;
  token_hash: string;
  token_expires_at: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  customer_files: string[] | null;
  corrected_files: string[] | null;
  preview_image_url: string | null;
  original_file_url: string | null;
  comment_ko: string | null;
  comment_ja: string | null;
  translation_status: 'pending' | 'translated' | 'failed' | 'manual';
  created_at: string;
  updated_at: string;
  sku_name?: string | null;
}

interface TokenUploadClientProps {
  token: string;
  correction: KoreaCorrection;
  order: Order;
  initialComments: CorrectionComment[];
}

// =====================================================
// Main Component
// =====================================================

export function TokenUploadClient({
  token,
  correction,
  order,
  initialComments,
}: TokenUploadClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [comments, setComments] = useState<CorrectionComment[]>(initialComments);
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
    switch (correction.status) {
      case 'pending':
        return {
          label: '保留中',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
        };
      case 'in_progress':
        return {
          label: '作業中',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Loader2,
        };
      case 'completed':
        return {
          label: '完了',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
        };
      case 'cancelled':
        return {
          label: 'キャンセル',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: X,
        };
      default:
        return {
          label: correction.status,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Check if token is expiring soon (within 7 days)
  const daysUntilExpiry = Math.ceil(
    (new Date(correction.token_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
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
                    {correction.sku_name || order.items.map(i => i.product_name).join(', ')}
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

            {/* Customer Files (if any) */}
            {correction.customer_files && correction.customer_files.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-slate-900 mb-2">顧客アップロードファイル</h3>
                <div className="space-y-2">
                  {correction.customer_files.map((fileUrl, index) => (
                    <a
                      key={index}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900"
                    >
                      <Download className="w-4 h-4" />
                      {fileUrl.split('/').pop() || `ファイル ${index + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Upload Form */}
          <TokenUploadForm
            token={token}
            correction={correction}
            onUploadSuccess={handleUploadSuccess}
            onError={setError}
          />

          {/* Existing Corrections (if any) */}
          {correction.corrected_files && correction.corrected_files.length > 0 && (
            <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-green-600" />
                アップロード済み修正データ ({correction.corrected_files.length})
              </h2>

              <div className="space-y-3">
                {correction.corrected_files.map((fileUrl, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-slate-900">
                        {fileUrl.split('/').pop() || `修正ファイル ${index + 1}`}
                      </span>
                    </div>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      ダウンロード
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Initial Comment (if any) */}
          {correction.comment_ko && (
            <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Send className="w-6 h-6 text-purple-600" />
                初期コメント
              </h2>
              <BilingualText
                content={correction.comment_ko}
                content_translated={correction.comment_ja}
                original_language="ko"
              />
            </section>
          )}
        </div>

        {/* Sidebar (Right column) */}
        <div className="space-y-6">
          {/* Comments Section */}
          <CommentSection
            token={token}
            correctionId={correction.id}
            initialComments={comments}
            onCommentsUpdate={setComments}
            isLoading={isLoadingComments}
          />
        </div>
      </div>
    </div>
  );
}
