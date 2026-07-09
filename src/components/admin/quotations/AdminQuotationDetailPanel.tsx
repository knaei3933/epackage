'use client';

import { useState, useEffect, Fragment } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { Download, Mail, ChevronDown, ChevronRight } from 'lucide-react';
import { adminFetch } from '@/lib/auth-client';
import { DetailedCostBreakdown } from '@/components/admin/quotation/DetailedCostBreakdown';
import { PostProcessingPreview } from '@/components/quote-simulator/PostProcessingPreview';
import { formatDateJa } from '@/utils/formatters';

import { AdminQuotationItemDetail } from './AdminQuotationItemDetail';
import { normalizeStatus, STATUS_LABELS, BAG_TYPE_IMAGES, convertToPreviewOptions } from './quotation-utils';
import type { Quotation } from '@/types/quotation';
import { formatPrice } from '@/utils/formatters';

interface AdminQuotationDetailPanelProps {
  quotation: Quotation;
  onApprove: () => void;
  onReject: () => void;
  onUpdate: () => void;
  onSendEmail: () => void;
}

/**
 * CostSummaryTable - 数量別の原価サマリーをコンパクトに表示
 * 各数量の詳細はクリックで展開
 */
function CostSummaryTable({ items, showFormula }: { items: any[]; showFormula: boolean }) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const extractCost = (item: any): { unitCost: number; totalCost: number; hasData: boolean } => {
    const specs = item.specifications || {};
    // API処理済みbreakdown（baseCost付き）を優先、なければ生DB列
    const cb = item.breakdown?.breakdown || specs.cost_breakdown || item.cost_breakdown;
    if (cb) {
      // cost_breakdown の値は該当数量の「総原価」(単価ではない)
      // totalCost>0 の場合はそれを総原価として使用、totalCost=0 の場合はコンポーネントから合成
      const hasComponents = (cb.materialCost || 0) > 0 || (cb.printingCost || 0) > 0 || (cb.laminationCost || 0) > 0;
      const synthesized = (cb.totalCost && cb.totalCost > 0)
        ? cb.totalCost
        : (cb.materialCost || 0) + (cb.printingCost || 0) + (cb.laminationCost || 0)
          + (cb.slitterCost || 0) + (cb.surfaceTreatmentCost || 0) + (cb.pouchProcessingCost || 0)
          + (cb.manufacturingMargin || 0) + (cb.duty || 0) + (cb.delivery || 0) + (cb.salesMargin || 0);
      if (synthesized > 0) {
        // unitCost = 総原価 / 数量 (1個あたりの原価)
        const qty = item.quantity > 0 ? item.quantity : 1;
        return { unitCost: Math.round(synthesized / qty), totalCost: synthesized, hasData: true };
      }
      if (hasComponents) {
        const qty = item.quantity > 0 ? item.quantity : 1;
        return { unitCost: Math.round(synthesized / qty), totalCost: synthesized, hasData: true };
      }
    }
    return { unitCost: 0, totalCost: 0, hasData: false };
  };

  const allCosts = items.map(extractCost);
  const grandTotalCost = allCosts.reduce((sum, c) => sum + c.totalCost, 0);
  const grandTotalRevenue = items.reduce((sum, i) => sum + (i.total_price || i.unit_price * i.quantity), 0);
  const grandMargin = grandTotalRevenue > 0 ? ((grandTotalRevenue - grandTotalCost) / grandTotalRevenue) * 100 : 0;

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">原価サマリー</h4>

      {/* サマリーテーブル */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-500">
              <th className="text-right font-medium py-2 px-2 w-16">数量</th>
              <th className="text-right font-medium py-2 px-2 w-24">売単価</th>
              <th className="text-right font-medium py-2 px-2 w-24">原単価</th>
              <th className="text-right font-medium py-2 px-2 w-20">原価計</th>
              <th className="text-right font-medium py-2 px-2 w-16">利益率</th>
              <th className="text-center font-medium py-2 px-1 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const cost = allCosts[index];
              const revenue = item.total_price || item.unit_price * item.quantity;
              const margin = revenue > 0 && cost.hasData ? ((revenue - cost.totalCost) / revenue) * 100 : 0;
              const isExpanded = expandedRow === index;

              return (
                <Fragment key={item.id || index}>
                  <tr
                    className={`border-t border-gray-100 ${isExpanded ? 'bg-blue-50/50' : 'hover:bg-gray-50'} ${cost.hasData ? 'cursor-pointer' : ''}`}
                    onClick={() => cost.hasData && setExpandedRow(isExpanded ? null : index)}
                  >
                    <td className="py-1.5 px-2 text-right text-gray-700 tabular-nums">{item.quantity.toLocaleString()}</td>
                    <td className="py-1.5 px-2 text-right text-gray-700 tabular-nums">¥{formatPrice(item.unit_price)}</td>
                    <td className="py-1.5 px-2 text-right tabular-nums">
                      {cost.hasData ? `¥${formatPrice(Math.round(cost.unitCost))}` : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="py-1.5 px-2 text-right tabular-nums">
                      {cost.hasData ? `¥${formatPrice(Math.round(cost.totalCost))}` : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="py-1.5 px-2 text-right tabular-nums">
                      {cost.hasData ? (
                        <span className={margin > 30 ? 'text-green-600 font-medium' : margin > 15 ? 'text-yellow-600' : 'text-red-600'}>
                          {margin.toFixed(1)}%
                        </span>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="py-1.5 px-1 text-center text-gray-400">
                      {cost.hasData && (isExpanded ? <ChevronDown className="w-3.5 h-3.5 inline" /> : <ChevronRight className="w-3.5 h-3.5 inline" />)}
                    </td>
                  </tr>

                  {/* 展開時の詳細原価内訳 */}
                  {isExpanded && cost.hasData && (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <div className="bg-white border-t border-blue-100 p-3">
                          <DetailedCostBreakdown
                            breakdown={item.breakdown?.breakdown || item.specifications?.cost_breakdown || item.cost_breakdown || {}}
                            filmCostDetails={item.specifications?.film_cost_details || item.film_cost_details || item.breakdown?.filmCostDetails}
                            specifications={item.specifications || {}}
                            quotationSubtotal={revenue}
                            showFormula={showFormula}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
          {/* 合計行 */}
          {grandTotalCost > 0 && (
            <tfoot>
              <tr className="bg-gray-100 font-medium border-t-2 border-gray-200">
                <td className="py-2 px-2 text-right text-gray-500" colSpan={3}>合計</td>
                <td className="py-2 px-2 text-right text-gray-900 tabular-nums">¥{formatPrice(Math.round(grandTotalCost))}</td>
                <td className="py-2 px-2 text-right">
                  <span className={grandMargin > 30 ? 'text-green-600' : grandMargin > 15 ? 'text-yellow-600' : 'text-red-600'}>
                    {grandMargin.toFixed(1)}%
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* 原価データなしの警告 */}
      {!allCosts.some(c => c.hasData) && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          原価データがありません
        </div>
      )}
    </div>
  );
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
  const [sendingManufacturerEmail, setSendingManufacturerEmail] = useState(false);
  

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

  // G007: 한국 제조사 발주 메일 발송
  const handleSendManufacturerOrderEmail = async () => {
    if (!confirm('한국 제조사에게 KRW 발주 메일을 발송하시겠습니까?')) return;
    setSendingManufacturerEmail(true);
    try {
      const response = await adminFetch(`/api/admin/quotations/${quotation.id}/manufacturer-order-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        alert(`발주 메일 발송 완료${result.previewUrl ? '\n\nPreview: ' + result.previewUrl : ''}`);
      } else {
        alert(`발송 실패: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('[handleSendManufacturerOrderEmail] Error:', error);
      alert('발송 중 오류가 발생했습니다.');
    } finally {
      setSendingManufacturerEmail(false);
    }
  };

  // PDF表示 - 保存済みPDFを新しいタブで開く
  const handleDownloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      const displayQuotation = detailData || quotation;

      // 保存済みPDF URLがある場合はfetch+blobで開く（CORS回避）
      if (displayQuotation.pdf_url) {
        const response = await fetch(displayQuotation.pdf_url);
        if (!response.ok) {
          throw new Error('保存済みPDFの取得に失敗しました');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 2000);
        return;
      }

      // PDF URLがない場合: export APIで生成
      const response = await fetch(`/api/admin/quotations/${quotation.id}/export`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'pdf' }),
      });

      if (!response.ok) {
        throw new Error(`PDF生成に失敗しました: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);

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

  // film_cost_detailsがあるかチェック
  const hasFilmCostDetails = items?.some(
    (item: any) => item.specifications?.film_cost_details
  );

  // 個別コストフィールド（laminationCostなど）が含まれているかチェック
  const hasDetailedCostBreakdown = items?.some((item: any) => {
    const filmCostDetails = item.specifications?.film_cost_details;
    const costBreakdown = item.specifications?.cost_breakdown;
    // film_cost_detailsに個別コストフィールドがあるか、cost_breakdownがあるか
    return (filmCostDetails && filmCostDetails.laminationCost !== undefined) ||
           (costBreakdown && costBreakdown.laminationCost !== undefined);
  });

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
              <span className="font-medium">¥{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">消費税</span>
              <span className="font-medium">¥{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2 mt-2">
              <span className="text-sm font-medium">合計</span>
              <span className="text-lg font-bold text-blue-600">¥{formatPrice(calculatedTotal)}</span>
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
          <div className="flex gap-2 flex-wrap">
            {displayQuotation.pdf_url && (
              <a
                href={displayQuotation.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  PDFを開く
                </Button>
              </a>
            )}
            <Button size="sm" variant="outline" onClick={onSendEmail}>
              <Mail className="w-4 h-4 mr-1" />
              メール送信
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSendManufacturerOrderEmail}
              disabled={sendingManufacturerEmail}
              className="text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Mail className="w-4 h-4 mr-1" />
              {sendingManufacturerEmail ? '발송중...' : '제조사 발주 메일'}
            </Button>
          </div>

          {/* 原価サマリーテーブル（コンパクト） */}
          {displayQuotation.items && displayQuotation.items.length > 0 && (
            <CostSummaryTable
              items={displayQuotation.items}
              showFormula={showFormula}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
