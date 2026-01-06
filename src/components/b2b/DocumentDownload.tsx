'use client';

/**
 * 문서 다운로드 컴포넌트 (Document Download Component)
 * 견적서, 작업표준서, 계약서 다운로드 버튼
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Download,
  FileText,
  Check,
  AlertCircle,
  Loader
} from 'lucide-react';

interface DocumentDownloadProps {
  documentId: string;
  type: 'quotation' | 'work_order' | 'contract';
  documentNumber?: string;
  variant?: 'button' | 'link';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

type DocumentTypeLabels = {
  [key in DocumentDownloadProps['type']]: { ko: string; ja: string };
};

const DOCUMENT_TYPE_LABELS: DocumentTypeLabels = {
  quotation: { ko: '견적서', ja: '見積書' },
  work_order: { ko: '작업표준서', ja: '作業標準書' },
  contract: { ko: '계약서', ja: '契約書' }
};

export default function DocumentDownload({
  documentId,
  type,
  documentNumber,
  variant = 'button',
  size = 'md',
  className = ''
}: DocumentDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch(
        `/api/b2b/documents/${documentId}/download?type=${type}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '다운로드 중 오류가 발생했습니다.');
      }

      // Get filename from content-disposition header or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${DOCUMENT_TYPE_LABELS[type].ko}_${documentNumber || 'download'}.pdf`;

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
        message: '다운로드가 완료되었습니다.'
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus({ type: null, message: '' });
      }, 3000);

    } catch (error) {
      console.error('Download error:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : '다운로드 중 오류가 발생했습니다.'
      });

      // Clear error message after 5 seconds
      setTimeout(() => {
        setStatus({ type: null, message: '' });
      }, 5000);
    } finally {
      setIsDownloading(false);
    }
  }, [documentId, type, documentNumber]);

  const labels = DOCUMENT_TYPE_LABELS[type];
  const buttonText = `${labels.ko} 다운로드`;

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
          {labels.ko}
        </button>

        {status.type && (
          <span className={`text-sm flex items-center gap-1 ${
            status.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
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
        <div className={`mt-2 text-sm flex items-center gap-1 ${
          status.type === 'success' ? 'text-green-600' : 'text-red-600'
        }`}>
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

/**
 * Batch Document Download Component
 * Download multiple documents at once
 */
interface BatchDocumentDownloadProps {
  documents: Array<{
    id: string;
    type: 'quotation' | 'work_order' | 'contract';
    number?: string;
  }>;
}

export function BatchDocumentDownload({ documents }: BatchDocumentDownloadProps) {
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
          `/api/b2b/documents/${doc.id}/download?type=${doc.type}`
        );

        if (!response.ok) {
          throw new Error('Download failed');
        }

        const contentDisposition = response.headers.get('content-disposition');
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
  }, [documents]);

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
        모든 문서 다운로드 ({status.completed}/{status.total})
      </Button>

      {status.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-medium mb-2">
            일부 문서 다운로드에 실패했습니다:
          </p>
          <ul className="text-sm text-red-700 list-disc list-inside">
            {status.errors.map((id, index) => (
              <li key={index}>문서 ID: {id}</li>
            ))}
          </ul>
        </div>
      )}

      {isAllComplete && status.errors.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <Check className="w-5 h-5" />
            <span className="font-medium">모든 문서 다운로드 완료</span>
          </div>
        </div>
      )}
    </div>
  );
}
