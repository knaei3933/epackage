'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { Download, Mail } from 'lucide-react';
import { adminFetch } from '@/lib/auth-client';
import { DetailedCostBreakdown } from '@/components/admin/quotation/DetailedCostBreakdown';
import { PostProcessingPreview } from '@/components/quote-simulator/PostProcessingPreview';
import { formatDateJa } from '@/utils/formatters';
import { AdminQuotationActions } from './AdminQuotationActions';
import { AdminQuotationItemDetail } from './AdminQuotationItemDetail';
import { normalizeStatus, STATUS_LABELS, BAG_TYPE_IMAGES, convertToPreviewOptions } from './quotation-utils';
import type { Quotation } from '@/types/quotation';

interface AdminQuotationDetailPanelProps {
  quotation: Quotation;
  onApprove: () => void;
  onReject: () => void;
  onUpdate: () => void;
  onSendEmail: () => void;
}

/**
 * AdminQuotationDetailPanel - 管理者用見積詳細パネルコンポーネント
 */
export function AdminQuotationDetailPanel({
  quotation,
  onApprove,
  onReject,
  onUpdate,
  onSendEmail,
}: AdminQuotationDetailPanelProps) {
  const [detailData, setDetailData] = useState<Quotation | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showFormula, setShowFormula] = useState(true);
  const [relatedOrderId, setRelatedOrderId] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // 選択された見積の詳細を取得
  useEffect(() => {
    if (quotation.id) {
      fetchQuotationDetail();
    }
  }, [quotation.id]);

  const fetchQuotationDetail = async () => {
    console.log('[fetchQuotationDetail] 開始 - quotation.id:', quotation.id);
    setLoadingDetail(true);
    try {
      const url = `/api/admin/quotations/${quotation.id}`;
      console.log('[fetchQuotationDetail] APIリクエスト:', url);
      const response = await adminFetch(url);
      console.log('[fetchQuotationDetail] レスポンスステータス:', response.status, response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('[fetchQuotationDetail] レスポンス全体:', result);
        if (result.success && result.quotation) {
          console.log('[fetchQuotationDetail] items数:', result.quotation.items?.length || 0);
          setDetailData(result.quotation);
          console.log('[fetchQuotationDetail] detailDataをセット完了');
          fetchRelatedOrder();
        } else {
          console.error('[fetchQuotationDetail] レスポンスにsuccessまたはquotationがありません:', result);
        }
      } else {
        const errorText = await response.text();
        console.error('[fetchQuotationDetail] APIエラー:', response.status, errorText);
      }
    } catch (error) {
      console.error('[fetchQuotationDetail] 例外発生:', error);
    } finally {
      setLoadingDetail(false);
      console.log('[fetchQuotationDetail] loadingDetailをfalseに設定');
    }
  };

  // 関連する注文を検索
  const fetchRelatedOrder = async () => {
    try {
      const response = await adminFetch(`/api/admin/orders?quotation_id=${quotation.id}`);
      if (response.ok) {
        const { data } = await response.json();
        if (data && data.length > 0) {
          setRelatedOrderId(data[0].id);
          console.log('[fetchRelatedOrder] 関連注文 found:', data[0].id);
        }
      }
    } catch (error) {
      console.error('[fetchRelatedOrder] Error:', error);
    }
  };

  // PDF表示 - 保存済みPDFを新しいタブで開く
  const handleDownloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      const displayQuotation = detailData || quotation;
      console.log('[handleDownloadPDF] Admin PDF open for:', displayQuotation.quotation_number);

      // 保存済みPDF URLがある場合は新しいタブで開く
      if (displayQuotation.pdf_url) {
        console.log('[handleDownloadPDF] Opening saved PDF URL:', displayQuotation.pdf_url);
        window.open(displayQuotation.pdf_url, '_blank');
        console.log('[handleDownloadPDF] PDF opened successfully');
        return;
      }

      // PDF URLがない場合: 既存のexport APIを呼び出し
      console.log('[handleDownloadPDF] No saved PDF, calling export API...');

      const response = await fetch(`/api/admin/quotations/${quotation.id}/export`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format: 'pdf' }),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }

      // PDFファイルダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `見積書_${displayQuotation.quotation_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('[handleDownloadPDF] PDF downloaded successfully via export API');

      // データ更新
      await fetchQuotationDetail();
    } catch (error) {
      console.error('[handleDownloadPDF] Failed:', error);
      alert(`PDFを開くのに失敗しました:\n${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // 表示するデータ（詳細データがあれば優先）
  const displayQuotation = detailData || quotation;
  const items = displayQuotation.items || [];

  // ステータスを正規化
  const normalizedStatus = normalizeStatus(displayQuotation.status);

  // 合計を計算（DBのtotal_amountではなく、subtotal + taxを使用）
  const subtotal = displayQuotation.subtotal_amount || 0;
  const tax = displayQuotation.tax_amount || 0;
  const calculatedTotal = subtotal + tax;

  if (loadingDetail) {
    return (
      <Card>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{displayQuotation.quotation_number}</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="text-xs"
            >
              <Download className={`w-4 h-4 mr-1 ${downloadingPdf ? 'animate-spin' : ''}`} />
              {downloadingPdf ? '作成中...' : 'PDF'}
            </Button>
            <button
              onClick={() => setShowFormula(!showFormula)}
              className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
            >
              {showFormula ? '計算式を非表示' : '計算式を表示'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* 基本情報 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">顧客名</p>
              <p className="font-medium">{displayQuotation.company_name || displayQuotation.customer_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">メールアドレス</p>
              <p className="font-medium text-sm">{displayQuotation.customer_email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ステータス</p>
              <Badge variant={STATUS_LABELS[normalizedStatus]?.variant || 'default'}>
                {STATUS_LABELS[normalizedStatus]?.label || normalizedStatus}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500">作成日</p>
              <p className="font-medium text-sm">{formatDateJa(displayQuotation.created_at)}</p>
            </div>
            {(displayQuotation.valid_until) && (
              <div>
                <p className="text-xs text-gray-500">有効期限</p>
                <p className="font-medium text-sm">{formatDateJa(displayQuotation.valid_until)}</p>
              </div>
            )}
            {relatedOrderId && (
              <div>
                <p className="text-xs text-gray-500">関連注文</p>
                <p className="font-medium text-sm">{relatedOrderId}</p>
              </div>
            )}
          </div>

          {/* 金額情報 */}
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">小計</span>
              <span className="font-medium">¥{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">消費税</span>
              <span className="font-medium">¥{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2 mt-2">
              <span className="text-sm font-medium">合計</span>
              <span className="text-lg font-bold text-blue-600">¥{calculatedTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* メモ */}
          {displayQuotation.notes && (
            <div>
              <p className="text-xs text-gray-500 mb-1">顧客メモ</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{displayQuotation.notes}</p>
            </div>
          )}

          {displayQuotation.admin_notes && (
            <div>
              <p className="text-xs text-gray-500 mb-1">管理者メモ</p>
              <p className="text-sm bg-blue-50 p-2 rounded">{displayQuotation.admin_notes}</p>
            </div>
          )}

          {/* アクション */}
          <AdminQuotationActions
            quotation={displayQuotation}
            onApprove={onApprove}
            onReject={onReject}
            onSendEmail={onSendEmail}
          />

          {/* 明細リスト */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">明細 ({items.length}件)</h4>
            {items.map((item, index) => (
              <AdminQuotationItemDetail
                key={item.id || index}
                item={item}
                showFormula={showFormula}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
