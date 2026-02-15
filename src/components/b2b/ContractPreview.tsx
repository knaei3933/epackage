'use client';

/**
 * Contract PDF Preview Component
 *
 * 契約書PDFプレビューコンポーネント
 * - 契約書データをリアルタイムでPDFとしてプレビュー
 * - contractPdfGenerator.ts と API を連携
 * - ローディング・エラー状態表示
 * - 印刷プレビュー対応
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  Eye,
  Download,
  RefreshCw,
  X,
  FileText,
  AlertCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Calendar,
  Building2,
  User,
  Package,
  CheckCircle2,
  Clock,
  Info,
} from 'lucide-react';
import type { ContractData, ContractItem, ContractParty } from '@/types/contract';

// ============================================================
// Types
// ============================================================

interface ContractPreviewProps {
  data: ContractData;
  onClose?: () => void;
  onDownload?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
  viewMode?: 'pdf' | 'html';
}

interface PreviewState {
  loading: boolean;
  error: string | null;
  pdfUrl: string | null;
  zoom: number;
}

// ============================================================
// Status Badge Component
// ============================================================

interface StatusBadgeProps {
  status: ContractData['status'];
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    draft: { label: '草案', color: 'bg-gray-100 text-gray-800 border-gray-300' },
    pending: { label: '承認待ち', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    active: { label: '有効', color: 'bg-green-100 text-green-800 border-green-300' },
    completed: { label: '完了', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    cancelled: { label: '取消', color: 'bg-red-100 text-red-800 border-red-300' },
    expired: { label: '失効', color: 'bg-gray-200 text-gray-600 border-gray-400' },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {status === 'active' && <CheckCircle2 className="w-3.5 h-3.5" />}
      {status === 'pending' && <Clock className="w-3.5 h-3.5" />}
      {status === 'draft' && <Info className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
}

// ============================================================
// Party Display Component
// ============================================================

interface PartyDisplayProps {
  label: string;
  party: ContractParty;
  icon: React.ReactNode;
}

function PartyDisplay({ label, party, icon }: PartyDisplayProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 border-b pb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">会社名:</span>
          <p className="font-medium">{party.name}</p>
          {party.nameKana && <p className="text-xs text-gray-500">{party.nameKana}</p>}
        </div>
        <div>
          <span className="text-gray-600">住所:</span>
          <p className="text-gray-800">〒{party.postalCode}</p>
          <p className="text-gray-800">{party.address}</p>
        </div>
        <div>
          <span className="text-gray-600">代表者:</span>
          <p className="font-medium">
            {party.representativeTitle} {party.representative}
          </p>
        </div>
        {party.contact && (
          <div className="text-xs text-gray-600 space-y-1">
            {party.contact.phone && <p>TEL: {party.contact.phone}</p>}
            {party.contact.email && <p>Email: {party.contact.email}</p>}
            {party.contact.fax && <p>FAX: {party.contact.fax}</p>}
          </div>
        )}
        {party.bankInfo && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <p className="font-medium text-gray-700 mb-1">振込先情報</p>
            <p>銀行: {party.bankInfo.bankName}</p>
            <p>支店: {party.bankInfo.branchName}</p>
            <p>口座: {party.bankInfo.accountType} {party.bankInfo.accountNumber}</p>
            <p>名義: {party.bankInfo.accountHolder}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Items Table Component
// ============================================================

interface ItemsTableProps {
  items: ContractItem[];
}

function ItemsTable({ items }: ItemsTableProps) {
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = 0.1; // 10% consumption tax
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Package className="w-5 h-5" />
        契約品目
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-3 py-2 text-left font-medium">No.</th>
              <th className="px-3 py-2 text-left font-medium">品名</th>
              <th className="px-3 py-2 text-left font-medium">型式・仕様</th>
              <th className="px-3 py-2 text-right font-medium">数量</th>
              <th className="px-3 py-2 text-right font-medium">単位</th>
              <th className="px-3 py-2 text-right font-medium">単価</th>
              <th className="px-3 py-2 text-right font-medium">金額</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-600">{index + 1}</td>
                <td className="px-3 py-2 font-medium">{item.name}</td>
                <td className="px-3 py-2 text-gray-600">{item.specification}</td>
                <td className="px-3 py-2 text-right">{item.quantity.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{item.unit}</td>
                <td className="px-3 py-2 text-right">
                  ¥{item.unitPrice.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  ¥{item.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={6} className="px-3 py-2 text-right font-medium">
                小計
              </td>
              <td className="px-3 py-2 text-right font-medium">
                ¥{subtotal.toLocaleString()}
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td colSpan={6} className="px-3 py-2 text-right font-medium">
                消費税 (10%)
              </td>
              <td className="px-3 py-2 text-right font-medium">
                ¥{tax.toLocaleString()}
              </td>
            </tr>
            <tr className="bg-gray-100 font-bold">
              <td colSpan={6} className="px-3 py-2 text-right">
                合計
              </td>
              <td className="px-3 py-2 text-right text-lg">
                ¥{total.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// Terms Display Component
// ============================================================

interface TermsDisplayProps {
  terms: ContractData['terms'];
}

function TermsDisplay({ terms }: TermsDisplayProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">契約条件</h3>

      {/* Payment Terms */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">支払条件</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">支払方法:</span>
            <p className="font-medium">{terms.payment.method}</p>
          </div>
          <div>
            <span className="text-gray-600">支払期限:</span>
            <p className="font-medium">{terms.payment.deadline}</p>
          </div>
          {terms.payment.depositPercentage && (
            <div>
              <span className="text-gray-600">前金率:</span>
              <p className="font-medium">{terms.payment.depositPercentage * 100}%</p>
            </div>
          )}
          {terms.payment.depositAmount && (
            <div>
              <span className="text-gray-600">前金額:</span>
              <p className="font-medium">¥{terms.payment.depositAmount.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Terms */}
      <div className="p-4 bg-green-50 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2">納品条件</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">納期:</span>
            <p className="font-medium">{terms.delivery.period}</p>
          </div>
          <div>
            <span className="text-gray-600">納品場所:</span>
            <p className="font-medium">{terms.delivery.location}</p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">納品条件:</span>
            <p className="font-medium">{terms.delivery.conditions}</p>
          </div>
          {terms.delivery.partialDelivery !== undefined && (
            <div className="col-span-2">
              <span className="text-gray-600">分割納品:</span>
              <p className="font-medium">
                {terms.delivery.partialDelivery ? '可能' : '不可'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contract Period */}
      {terms.period && (
        <div className="p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-2">契約期間</h4>
          <div className="text-sm">
            <div>
              <span className="text-gray-600">開始日:</span>
              <p className="font-medium">{terms.period.startDate}</p>
            </div>
            {terms.period.endDate && (
              <div>
                <span className="text-gray-600">終了日:</span>
                <p className="font-medium">{terms.period.endDate}</p>
              </div>
            )}
            {terms.period.validity && (
              <div>
                <span className="text-gray-600">有効期間:</span>
                <p className="font-medium">{terms.period.validity}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Special Terms */}
      {terms.specialTerms && terms.specialTerms.length > 0 && (
        <div className="p-4 bg-orange-50 rounded-lg">
          <h4 className="font-medium text-orange-900 mb-2">特別条項</h4>
          <ul className="list-disc list-inside text-sm space-y-1">
            {terms.specialTerms.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Signatory Display Component
// ============================================================

interface SignatoryDisplayProps {
  sellerSignatory?: ContractData['sellerSignatory'];
  buyerSignatory?: ContractData['buyerSignatory'];
}

function SignatoryDisplay({ sellerSignatory, buyerSignatory }: SignatoryDisplayProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Seller Signatory */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <h4 className="font-medium text-gray-700 mb-3">販売者署名</h4>
        {sellerSignatory ? (
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">氏名:</span>
              <p className="font-medium">{sellerSignatory.name}</p>
            </div>
            <div>
              <span className="text-gray-600">役職:</span>
              <p className="font-medium">{sellerSignatory.title}</p>
            </div>
            {sellerSignatory.department && (
              <div>
                <span className="text-gray-600">部署:</span>
                <p>{sellerSignatory.department}</p>
              </div>
            )}
            {sellerSignatory.stamp && (
              <div className="mt-2 p-2 bg-white rounded border border-dashed">
                <p className="text-xs text-gray-500 mb-1">はんこ</p>
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">印鑑</span>
                </div>
              </div>
            )}
            {sellerSignatory.date && (
              <div>
                <span className="text-gray-600">署名日:</span>
                <p>{sellerSignatory.date}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">未署名</p>
        )}
      </div>

      {/* Buyer Signatory */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <h4 className="font-medium text-gray-700 mb-3">購入者署名</h4>
        {buyerSignatory ? (
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">氏名:</span>
              <p className="font-medium">{buyerSignatory.name}</p>
            </div>
            <div>
              <span className="text-gray-600">役職:</span>
              <p className="font-medium">{buyerSignatory.title}</p>
            </div>
            {buyerSignatory.department && (
              <div>
                <span className="text-gray-600">部署:</span>
                <p>{buyerSignatory.department}</p>
              </div>
            )}
            {buyerSignatory.stamp && (
              <div className="mt-2 p-2 bg-white rounded border border-dashed">
                <p className="text-xs text-gray-500 mb-1">はんこ</p>
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">印鑑</span>
                </div>
              </div>
            )}
            {buyerSignatory.date && (
              <div>
                <span className="text-gray-600">署名日:</span>
                <p>{buyerSignatory.date}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">未署名</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function ContractPreview({
  data,
  onClose,
  onDownload,
  autoRefresh = false,
  refreshInterval = 5000,
  className = '',
  viewMode = 'html',
}: ContractPreviewProps) {
  const [state, setState] = useState<PreviewState>({
    loading: false,
    error: null,
    pdfUrl: null,
    zoom: 1,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentViewMode, setCurrentViewMode] = useState<'pdf' | 'html'>(viewMode);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ============================================================
  // PDF Generation
  // ============================================================

  const generatePdf = useCallback(async () => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/contract/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          options: {
            returnBase64: true,
          },
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'PDF生成に失敗しました');
      }

      // Create blob URL from base64
      const binaryString = atob(result.pdfBuffer);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
        pdfUrl: url,
      }));

      // Cleanup old URL if exists
      return () => {
        if (state.pdfUrl) {
          URL.revokeObjectURL(state.pdfUrl);
        }
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '予期しないエラーが発生しました',
        pdfUrl: null,
      }));
    }
  }, [data, state.pdfUrl]);

  // ============================================================
  // Refresh Handler
  // ============================================================

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await generatePdf();
    setIsRefreshing(false);
  }, [generatePdf]);

  // ============================================================
  // Download Handler
  // ============================================================

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch('/api/contract/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          options: {
            filename: `${data.contractNumber}.pdf`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get blob from response
      const blob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.contractNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Download error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'ダウンロードに失敗しました',
      }));
    }
  }, [data, onDownload]);

  // ============================================================
  // Print Handler
  // ============================================================

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ============================================================
  // Zoom Handlers
  // ============================================================

  const handleZoomIn = useCallback(() => {
    setState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 0.25, 3) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 0.25, 0.5) }));
  }, []);

  const handleResetZoom = useCallback(() => {
    setState(prev => ({ ...prev, zoom: 1 }));
  }, []);

  // ============================================================
  // Effects
  // ============================================================

  // Generate PDF on mount and data change
  useEffect(() => {
    if (currentViewMode === 'pdf') {
      generatePdf();
    }

    return () => {
      // Cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (state.pdfUrl) {
        URL.revokeObjectURL(state.pdfUrl);
      }
    };
  }, [data, currentViewMode]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh || currentViewMode !== 'pdf') return;

    const interval = setInterval(() => {
      handleRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, handleRefresh, currentViewMode]);

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {data.contractNumber}
              <StatusBadge status={data.status} />
            </h2>
            <p className="text-sm text-gray-600">
              発行日: {data.issueDate}
              {data.validUntil && ` | 有効期限: ${data.validUntil}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white rounded border overflow-hidden mr-2">
            <button
              onClick={() => setCurrentViewMode('html')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                currentViewMode === 'html'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              HTML表示
            </button>
            <button
              onClick={() => setCurrentViewMode('pdf')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                currentViewMode === 'pdf'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              PDF表示
            </button>
          </div>

          {/* Zoom Controls (PDF only) */}
          {currentViewMode === 'pdf' && (
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={state.zoom <= 0.5}
                title="縮小"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="px-3 py-1 text-sm font-medium bg-white border rounded min-w-[60px] text-center">
                {Math.round(state.zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={state.zoom >= 3}
                title="拡大"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
                disabled={state.zoom === 1}
                title="リセット"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Refresh (PDF only) */}
          {currentViewMode === 'pdf' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || state.loading}
              title="再読み込み"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </Button>
          )}

          {/* Print */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            title="印刷"
          >
            <Printer className="w-4 h-4" />
          </Button>

          {/* Download */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            title="PDFダウンロード"
          >
            <Download className="w-4 h-4" />
          </Button>

          {/* Close */}
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              title="閉じる"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-200">
        {currentViewMode === 'pdf' ? (
          <Card className="h-full m-4 overflow-hidden">
            {state.loading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">PDFを生成中...</p>
              </div>
            )}

            {state.error && (
              <div className="flex flex-col items-center justify-center h-full">
                <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
                <p className="text-red-600 font-medium mb-2">PDF生成エラー</p>
                <p className="text-gray-600 text-sm">{state.error}</p>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="mt-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  再試行
                </Button>
              </div>
            )}

            {!state.loading && !state.error && state.pdfUrl && (
              <iframe
                src={state.pdfUrl}
                className="w-full h-full border-0"
                style={{
                  transform: `scale(${state.zoom})`,
                  transformOrigin: 'top center',
                }}
                title="契約書プレビュー"
              />
            )}
          </Card>
        ) : (
          <Card className="m-4">
            <CardContent className="p-8 space-y-8">
              {/* Contract Header */}
              <div className="text-center pb-6 border-b-2 border-gray-300">
                <h1 className="text-2xl font-bold mb-2">前金契約書</h1>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mt-4">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    契約番号: {data.contractNumber}
                  </span>
                  {data.orderNumber && (
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-4" />
                      注文番号: {data.orderNumber}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    発行日: {data.issueDate}
                  </span>
                </div>
              </div>

              {/* Parties Section */}
              <div className="grid grid-cols-2 gap-8">
                <PartyDisplay
                  label="販売者（甲）"
                  party={data.seller}
                  icon={<Building2 className="w-4 h-4" />}
                />
                <PartyDisplay
                  label="購入者（乙）"
                  party={data.buyer}
                  icon={<User className="w-4 h-4" />}
                />
              </div>

              {/* Items Table */}
              <ItemsTable items={data.items} />

              {/* Terms */}
              <TermsDisplay terms={data.terms} />

              {/* Remarks */}
              {data.remarks && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">備考</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.remarks}</p>
                </div>
              )}

              {/* Signatories */}
              <div className="pt-6 border-t-2 border-gray-300">
                <SignatoryDisplay
                  sellerSignatory={data.sellerSignatory}
                  buyerSignatory={data.buyerSignatory}
                />
              </div>

              {/* Attachments */}
              {data.attachments && data.attachments.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-3">添付ファイル</h3>
                  <ul className="space-y-2">
                    {data.attachments.map(file => (
                      <li
                        key={file.id}
                        className="flex items-center justify-between text-sm p-2 bg-white rounded border"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          {file.name}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Legal Notice */}
              <div className="text-xs text-gray-500 text-center pt-4 border-t">
                <p>本契約書は電子署名法および電子契約法に準拠しています</p>
                <p className="mt-1">
                  This contract is compliant with the Electronic Signature Act and Electronic Contract Act
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between text-sm text-gray-600">
        <div>
          販売者: {data.seller.name} | 購入者: {data.buyer.name}
        </div>
        <div>
          契約金額合計: ¥
          {data.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Standalone Preview Modal Component
// ============================================================

interface ContractPreviewModalProps extends ContractPreviewProps {
  isOpen: boolean;
}

export function ContractPreviewModal({
  isOpen,
  ...props
}: ContractPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        <ContractPreview {...props} onClose={props.onClose} />
      </div>
    </div>
  );
}

// ============================================================
// Inline Preview Panel Component
// ============================================================

interface ContractPreviewPanelProps extends ContractPreviewProps {
  width?: string;
}

export function ContractPreviewPanel({
  width = '50%',
  ...props
}: ContractPreviewPanelProps) {
  return (
    <div className="border-l" style={{ width }}>
      <ContractPreview {...props} />
    </div>
  );
}
