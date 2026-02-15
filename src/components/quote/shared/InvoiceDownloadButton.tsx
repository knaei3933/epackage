/**
 * Invoice Download Button Component
 *
 * 請求書ダウンロードボタンコンポーネント
 * - Fetches invoice data from API
 * - Generates PDF client-side
 * - Triggers download
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import type { InvoiceData } from '@/lib/pdf-generator';

// ============================================================
// Props
// ============================================================

interface InvoiceDownloadButtonProps {
  /** Quotation ID */
  quotationId: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

// ============================================================
// Component
// ============================================================

export function InvoiceDownloadButton({
  quotationId,
  variant = 'outline',
  size = 'md',
  className = '',
}: InvoiceDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch invoice data from member-specific API
      const response = await fetch(`/api/member/quotations/${quotationId}/invoice`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '請求書データの取得に失敗しました');
      }

      const { success, invoice, requiresClientSideGeneration } = await response.json();

      if (!success || !invoice) {
        throw new Error('請求書データが見つかりませんでした');
      }

      // 2. Generate PDF client-side
      const pdfResult = await generateInvoicePDF(invoice as InvoiceData);

      if (!pdfResult.success) {
        throw new Error(pdfResult.error || 'PDF生成に失敗しました');
      }

      // 3. Download is triggered automatically by generateInvoicePDF
      // unless returnBase64 or returnBuffer options are used
    } catch (err) {
      console.error('Error downloading invoice:', err);
      setError(err instanceof Error ? err.message : '請求書のダウンロードに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleDownload}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? '生成中...' : '請求書PDF'}
      </Button>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </>
  );
}
