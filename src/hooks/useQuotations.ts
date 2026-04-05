/**
 * useQuotations Hook
 *
 * 見積もりデータのフェッチ・ページネーション・フィルタリングを扱うカスタムフック
 * - メンバー用と管理者用の両方をサポート
 * - URLパラメータとの同期（window.location.href と useRouter の両方をサポート）
 * - ページネーションとステータスフィルタリング
 * - PDFエクスポート機能
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 型定義（既存のQuotation型を使用）
export interface Quotation {
  id: string;
  user_id: string;
  company_id: string | null;
  quotation_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  subtotal: number;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  valid_until: string | null;
  notes: string | null;
  pdf_url: string | null;
  admin_notes: string | null;
  sales_rep: string | null;
  estimated_delivery_date: string | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  items?: any[];
}

export type QuotationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CONVERTED'
  | 'QUOTATION_PENDING'
  | 'QUOTATION_APPROVED'
  | 'DATA_UPLOAD_PENDING'
  | 'DATA_UPLOADED'
  | 'CORRECTION_IN_PROGRESS'
  | 'CORRECTION_COMPLETED'
  | 'CUSTOMER_APPROVAL_PENDING'
  | 'PRODUCTION'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'CANCELLED';

// =====================================================
// Types
// =====================================================

export interface UseQuotationsParams {
  initialStatus?: string;
  initialPage?: number;
  initialData?: {
    quotations: Quotation[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  };
  limit?: number;
  userId?: string; // メンバー用
  role?: 'ADMIN' | 'OPERATOR' | 'SALES'; // 管理者用
  isAdmin?: boolean; // 管理者モードかどうか
}

export interface UseQuotationsReturn {
  quotations: Quotation[];
  loading: boolean;
  error: Error | null;
  currentPage: number;
  totalPages: number;
  total: number;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  exportPDF: (id: string) => Promise<void>;
  downloadingQuoteId: string | null;
}

// =====================================================
// Constants
// =====================================================

const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;
const DEFAULT_STATUS = 'all';

// =====================================================
// Helper Functions
// =====================================================

/**
 * ステータス値を正規化（10段階ワークフロー用UPPERCASE）
 */
function normalizeStatus(status: string): string {
  if (!status) return 'QUOTATION_PENDING';

  const legacyMap: Record<string, string> = {
    'draft': 'QUOTATION_PENDING',
    'sent': 'QUOTATION_PENDING',
    'pending': 'QUOTATION_PENDING',
    'approved': 'QUOTATION_APPROVED',
    'rejected': 'REJECTED',
    'expired': 'EXPIRED',
    'converted': 'CONVERTED',
  };

  return legacyMap[status.toLowerCase()] || status.toUpperCase();
}

/**
 * APIエンドポイントを取得
 */
function getApiEndpoint(isAdmin: boolean): string {
  return isAdmin ? '/api/admin/quotations' : '/api/member/quotations';
}

/**
 * URLを構築
 */
function buildUrl(
  baseUrl: string,
  status: string,
  page: number,
  limit: number
): string {
  const url = new URL(baseUrl, window.location.origin);

  if (status !== 'all') {
    url.searchParams.set('status', status);
  }

  if (page > 1) {
    url.searchParams.set('page', page.toString());
  }

  // 管理者用APIは page_size、メンバー用は limit
  const pageSizeParam = baseUrl.includes('/admin/') ? 'page_size' : 'limit';
  url.searchParams.set(pageSizeParam, limit.toString());

  return url.toString();
}

// =====================================================
// Hook Implementation
// =====================================================

/**
 * 見積もりデータを管理するカスタムフック
 */
export function useQuotations({
  initialStatus = DEFAULT_STATUS,
  initialPage = DEFAULT_PAGE,
  initialData,
  limit = DEFAULT_LIMIT,
  userId,
  role,
  isAdmin = false,
}: UseQuotationsParams): UseQuotationsReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMountedRef = useRef(true);

  // State
  const [quotations, setQuotations] = useState<Quotation[]>(
    initialData?.quotations || []
  );
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [total, setTotal] = useState<number>(
    initialData?.pagination?.total || 0
  );
  const [filterStatus, setFilterStatus] = useState<string>(initialStatus);
  const [downloadingQuoteId, setDownloadingQuoteId] = useState<string | null>(null);

  // 計算値
  const totalPages = Math.ceil(total / limit);

  // データフェッチ関数
  const fetchQuotations = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const apiEndpoint = getApiEndpoint(isAdmin);
      const url = buildUrl(apiEndpoint, filterStatus, currentPage, limit);

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.quotations) {
        const normalizedQuotations = result.quotations.map((q: any) => ({
          ...q,
          status: normalizeStatus(q.status),
        }));

        if (isMountedRef.current) {
          setQuotations(normalizedQuotations);
          setTotal(result.pagination?.total || result.total || 0);
        }
      } else {
        throw new Error(result.error || 'Failed to fetch quotations');
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error('[useQuotations] Fetch error:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [filterStatus, currentPage, limit, isAdmin]);

  // 再取得関数
  const refetch = useCallback(async () => {
    await fetchQuotations();
  }, [fetchQuotations]);

  // ステータスフィルター変更
  const setFilterStatusWithNavigation = useCallback((newStatus: string) => {
    setFilterStatus(newStatus);
    setCurrentPage(1); // ステータス変更時にページ1に戻る

    // URLを更新してサーバーサイドフェッチをトリガー
    const params = new URLSearchParams(searchParams.toString());

    if (newStatus === 'all') {
      params.delete('status');
    } else {
      params.set('status', newStatus);
    }

    // ページをリセット
    params.delete('page');

    // window.location.hrefを使用して完全リロード（サーバーサイドフェッチ）
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  }, [searchParams]);

  // ページ変更
  const setPageWithNavigation = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    setCurrentPage(newPage);

    // URLを更新してサーバーサイドフェッチをトリガー
    const params = new URLSearchParams(searchParams.toString());

    if (filterStatus !== 'all') {
      params.set('status', filterStatus);
    }

    if (newPage > 1) {
      params.set('page', newPage.toString());
    } else {
      params.delete('page');
    }

    // window.location.hrefを使用して完全リロード（サーバーサイドフェッチ）
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  }, [filterStatus, searchParams, totalPages]);

  // PDFエクスポート関数
  const exportPDF = useCallback(async (id: string) => {
    setDownloadingQuoteId(id);

    try {
      const endpoint = isAdmin
        ? `/api/admin/quotations/${id}/export`
        : `/api/member/quotations/${id}/export`;

      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to export PDF: ${response.statusText}`);
      }

      const { data } = await response.json();

      if (!data) {
        throw new Error('No data received from export API');
      }

      // PDF生成ライブラリを動的インポート
      // @ts-ignore - 動的インポートの型エラーを無視
      const { generateQuotePDF } = await import('@/lib/pdf-generator');
      // @ts-ignore - 動的インポートの型エラーを無視
      const { mapDatabaseQuotationToExcel } = await import('@/lib/excel/excelDataMapper');
      // @ts-ignore - 動的インポートの型エラーを無視
      const { mapQuotationDataToQuoteData } = await import('@/lib/excel/quotationToPdfMapper');

      // データマッピング
      const excelData = await mapDatabaseQuotationToExcel(
        data.quotation,
        data.items || [],
        data.userProfile
      );

      const quoteData = mapQuotationDataToQuoteData(excelData);

      // PDF生成
      const pdfResult = await generateQuotePDF(quoteData, {
        filename: `${data.quotation.quotation_number}.pdf`
      });

      if (!pdfResult.success) {
        throw new Error(pdfResult.error || 'PDF生成に失敗しました');
      }

      // PDFダウンロード
      if (pdfResult.pdfBuffer) {
        const pdfBlob = new Blob([pdfResult.pdfBuffer], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdfResult.filename || `${data.quotation.quotation_number}.pdf`;
        document.body.appendChild(a);
        a.click();

        // クリーンアップ
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
      }
    } catch (err) {
      console.error('[useQuotations] PDF export error:', err);
      throw err;
    } finally {
      setDownloadingQuoteId(null);
    }
  }, [isAdmin]);

  // 初期マウント時にデータ取得（初期データがない場合のみ）
  useEffect(() => {
    if (!initialData) {
      fetchQuotations();
    }
  }, []); // 初期マウント時のみ

  // クリーンアップ
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    quotations,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    filterStatus,
    setFilterStatus: setFilterStatusWithNavigation,
    setPage: setPageWithNavigation,
    refetch,
    exportPDF,
    downloadingQuoteId,
  };
}

// =====================================================
// Server-Side Data Fetching Helper
// =====================================================

/**
 * サーバーサイドで見積もりデータを取得（Server Component用）
 * この関数はuseQuotationsフックからも呼び出される可能性があります
 */
export async function fetchQuotationsServerSide(
  userId: string,
  status?: string,
  limit: number = 20,
  offset: number = 0
): Promise<{
  quotations: Quotation[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}> {
  // この実装は既存のloader.tsのロジックを再利用します
  // 実際の実装はloader.tsにあるfetchQuotationsServerSideを使用

  // @ts-ignore - 動的インポートの型エラーを無視
  const { fetchQuotationsServerSide: loaderFetch } = await import(
    '@/app/member/quotations/loader'
  );

  return loaderFetch(userId, status, limit, offset);
}
