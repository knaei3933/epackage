/**
 * Shared Document Download Component
 * 共用ドキュメントダウンロードコンポーネント
 *
 * Unified document download component supporting:
 * - Simple card display (Portal style)
 * - Batch download (B2B style)
 * - Button/link variants
 * - Download status tracking
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, FileText, Check, AlertCircle, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

// =====================================================
// Types
// =====================================================

export interface DownloadableDocument {
  id: string;
  name_ja: string;
  type: 'quotation' | 'work_order' | 'contract' | 'spec_sheet' | 'other';
  file_url?: string;
  file_size?: number;
  is_available: boolean;
}

export type DocumentDownloadVariant = 'button' | 'link' | 'card';
export type DocumentDownloadSize = 'sm' | 'md' | 'lg';

interface DocumentDownloadBaseProps {
  documentId: string;
  type: 'quotation' | 'work_order' | 'contract';
  documentNumber?: string;
  variant?: DocumentDownloadVariant;
  size?: DocumentDownloadSize;
  className?: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: Error) => void;
}

// =====================================================
// Document Type Labels
// =====================================================

const DOCUMENT_TYPE_LABELS: Record<string, { ja: string }> = {
  quotation: { ja: '見積書' },
  work_order: { ja: '作業標準書' },
  contract: { ja: '契約書' },
  spec_sheet: { ja: '仕様書' },
  other: { ja: 'ドキュメント' },
};

function getDocumentTypeLabel(type: string, locale: 'ja' | 'en' = 'ja'): string {
  return DOCUMENT_TYPE_LABELS[type]?.ja || type;
}

// =====================================================
// Button/Link Variant Component
// =====================================================

export function DocumentDownloadButton({
  documentId,
  type,
  documentNumber,
  variant = 'button',
  size = 'md',
  className = '',
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
}: DocumentDownloadBaseProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleDownload = useCallback(async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setStatus({ type: null, message: '' });
    onDownloadStart?.();

    try {
      const response = await fetch(
        `/api/member/documents/${documentId}/download?type=${type}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'ダウンロード中にエラーが発生しました。');
      }

      // Get filename from content-disposition header or use default
      const contentDisposition = response.headers.get('content-disposition');
      const labels = DOCUMENT_TYPE_LABELS[type];
      let filename = `${labels.ja}_${documentNumber || 'download'}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setStatus({
        type: 'success',
        message: 'ダウンロードが完了しました。'
      });

      onDownloadComplete?.();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus({ type: null, message: '' });
      }, 3000);

    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'ダウンロード中にエラーが発生しました。';

      setStatus({
        type: 'error',
        message: errorMessage
      });

      onDownloadError?.(error instanceof Error ? error : new Error(errorMessage));

      // Clear error message after 5 seconds
      setTimeout(() => {
        setStatus({ type: null, message: '' });
      }, 5000);
    } finally {
      setIsDownloading(false);
    }
  }, [documentId, type, documentNumber, isDownloading, onDownloadStart, onDownloadComplete, onDownloadError]);

  const labels = DOCUMENT_TYPE_LABELS[type];
  const buttonText = `${labels.ja} ダウンロード`;

  if (variant === 'link') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="text-blue-600 hover:text-blue-800 hover:underline disabled:text-gray-400 disabled:no-underline flex items-center gap-1"
        >
          {isDownloading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {labels.ja}
        </button>

        {status.type && (
          <span className={cn(
            'text-sm flex items-center gap-1',
            status.type === 'success' ? 'text-green-600' : 'text-red-600'
          )}>
            {status.type === 'success' ? (
              <Check className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {status.message}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        variant="outline"
        size={size}
      >
        {isDownloading ? (
          <Loader className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        <FileText className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>

      {status.type && (
        <div className={cn(
          'mt-2 text-sm flex items-center gap-1',
          status.type === 'success' ? 'text-green-600' : 'text-red-600'
        )}>
          {status.type === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {status.message}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Card Variant Component (Portal style)
// =====================================================

interface DocumentDownloadCardProps {
  documents: DownloadableDocument[];
  onDownload?: (document: DownloadableDocument) => Promise<void>;
  emptyMessage?: string;
}

export function DocumentDownloadCard({
  documents,
  onDownload,
  emptyMessage = 'ダウンロード可能なドキュメントはありません'
}: DocumentDownloadCardProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (document: DownloadableDocument) => {
    if (downloadingId) return;

    setDownloadingId(document.id);
    try {
      await onDownload?.(document);
    } finally {
      setDownloadingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 text-center">
        <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-slate-600 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white">ドキュメント</h3>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {documents.map((document) => {
          const label = getDocumentTypeLabel(document.type);
          const isDownloading = downloadingId === document.id;

          return (
            <div key={document.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center gap-3">
                {/* File Icon */}
                <div className="w-10 h-10 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {document.name_ja}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                      {label}
                    </span>
                    {document.file_size && (
                      <span>{(document.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Button */}
              {document.is_available ? (
                <button
                  onClick={() => handleDownload(document)}
                  disabled={isDownloading || !document.file_url}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    'hover:bg-blue-50 dark:hover:bg-blue-900/20',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  title="ダウンロード"
                >
                  {isDownloading ? (
                    <svg className="w-5 h-5 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                </button>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1">
                  準備中
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================
// Batch Download Component (B2B style)
// =====================================================

interface BatchDocumentDownloadProps {
  documents: Array<{
    id: string;
    type: 'quotation' | 'work_order' | 'contract';
    number?: string;
  }>;
  onComplete?: (results: { completed: number; errors: string[] }) => void;
}

export function BatchDocumentDownload({
  documents,
  onComplete
}: BatchDocumentDownloadProps) {
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<{
    completed: number;
    total: number;
    errors: string[];
  }>({
    completed: 0,
    total: documents.length,
    errors: []
  });

  const downloadAll = useCallback(async () => {
    setStatus({ completed: 0, total: documents.length, errors: [] });

    for (const doc of documents) {
      setDownloading(prev => new Set(prev).add(doc.id));

      try {
        const response = await fetch(
          `/api/member/documents/${doc.id}/download?type=${doc.type}`
        );

        if (!response.ok) {
          throw new Error('Download failed');
        }

        const contentDisposition = response.headers.get('content-disposition');
        const labels = DOCUMENT_TYPE_LABELS[doc.type];
        let filename = `${doc.type}_${doc.number || 'download'}.pdf`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setStatus(prev => ({
          ...prev,
          completed: prev.completed + 1
        }));

      } catch (error) {
        console.error(`Error downloading ${doc.id}:`, error);
        setStatus(prev => ({
          ...prev,
          errors: [...prev.errors, doc.id]
        }));
      } finally {
        setDownloading(prev => {
          const next = new Set(prev);
          next.delete(doc.id);
          return next;
        });
      }

      // Add small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    onComplete?.(status);
  }, [documents, onComplete]);

  const isAllDownloading = downloading.size > 0;
  const isAllComplete = status.completed === status.total;

  return (
    <div className="space-y-4">
      <Button
        onClick={downloadAll}
        disabled={isAllDownloading || isAllComplete}
        size="lg"
      >
        {isAllDownloading ? (
          <Loader className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Download className="w-5 h-5 mr-2" />
        )}
        すべての文書ダウンロード ({status.completed}/{status.total})
      </Button>

      {status.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-medium mb-2">
            一部の文書ダウンロードに失敗しました:
          </p>
          <ul className="text-sm text-red-700 list-disc list-inside">
            {status.errors.map((id, index) => (
              <li key={index}>文書ID: {id}</li>
            ))}
          </ul>
        </div>
      )}

      {isAllComplete && status.errors.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <Check className="w-5 h-5" />
            <span className="font-medium">すべての文書ダウンロード完了</span>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// Default Export
// =====================================================

export default DocumentDownloadButton;
