'use client';

/**
 * Specification Sheet PDF Preview Component
 *
 * 仕様書PDFプレビューコンポーネント
 * - 編集中の仕様書データをリアルタイムでPDFとしてプレビュー
 * - specSheetPdfGenerator.ts と API を連携
 * - ローディング・エラー状態表示
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
} from 'lucide-react';
import type { SpecSheetData } from '@/types/specsheet';

// ============================================================
// Types
// ============================================================

interface SpecSheetPreviewProps {
  data: SpecSheetData;
  onClose?: () => void;
  onDownload?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

interface PreviewState {
  loading: boolean;
  error: string | null;
  pdfUrl: string | null;
  zoom: number;
}

// ============================================================
// Component
// ============================================================

export default function SpecSheetPreview({
  data,
  onClose,
  onDownload,
  autoRefresh = false,
  refreshInterval = 5000,
  className = '',
}: SpecSheetPreviewProps) {
  const [state, setState] = useState<PreviewState>({
    loading: true,
    error: null,
    pdfUrl: null,
    zoom: 1,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
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
      const response = await fetch('/api/specsheet/pdf', {
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
      const response = await fetch('/api/specsheet/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          options: {
            filename: `${data.specNumber}_v${data.revision}.pdf`,
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
      link.download = `${data.specNumber}_v${data.revision}.pdf`;
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
    generatePdf();

    return () => {
      // Cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (state.pdfUrl) {
        URL.revokeObjectURL(state.pdfUrl);
      }
    };
  }, [data]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, handleRefresh]);

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
            <h2 className="text-lg font-semibold">
              {data.specNumber} - {data.title}
            </h2>
            <p className="text-sm text-gray-600">
              バージョン {data.revision} | {data.status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
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

          {/* Refresh */}
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
      <div className="flex-1 overflow-auto bg-gray-200 p-4">
        <Card className="h-full overflow-hidden">
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
              ref={iframeRef}
              src={state.pdfUrl}
              className="w-full h-full border-0"
              style={{
                transform: `scale(${state.zoom})`,
                transformOrigin: 'top center',
              }}
              title="仕様書プレビュー"
            />
          )}
        </Card>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between text-sm text-gray-600">
        <div>
          発行日: {data.issueDate}
          {data.validUntil && ` | 有効期限: ${data.validUntil}`}
        </div>
        <div>
          顧客: {data.customer.name} | {data.product.name}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Standalone Preview Modal Component
// ============================================================

interface SpecSheetPreviewModalProps extends SpecSheetPreviewProps {
  isOpen: boolean;
}

export function SpecSheetPreviewModal({
  isOpen,
  ...props
}: SpecSheetPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        <SpecSheetPreview {...props} onClose={props.onClose} />
      </div>
    </div>
  );
}

// ============================================================
// Inline Preview Panel Component
// ============================================================

interface SpecSheetPreviewPanelProps extends SpecSheetPreviewProps {
  width?: string;
}

export function SpecSheetPreviewPanel({
  width = '50%',
  ...props
}: SpecSheetPreviewPanelProps) {
  return (
    <div className="border-l" style={{ width }}>
      <SpecSheetPreview {...props} />
    </div>
  );
}
