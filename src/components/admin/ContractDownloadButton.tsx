'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, FileText, Loader2 } from 'lucide-react';

interface Contract {
  id: string;
  contract_number: string;
  final_contract_url?: string | null;
  status: string;
  customer_name: string;
}

interface ContractDownloadButtonProps {
  contract: Contract;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onDownloadComplete?: (url: string) => void;
}

/**
 * Contract Download Button Component
 *
 * 契約書PDFダウンロードボタン
 * - 既存のPDFを直接ダウンロード
 * - PDFが存在しない場合は自動生成
 * - 生成完了後、ダウンロードリンクを提供
 */
export function ContractDownloadButton({
  contract,
  variant = 'outline',
  size = 'default',
  className = '',
  onDownloadComplete,
}: ContractDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(contract.final_contract_url || null);

  /**
   * Handle contract PDF download
   */
  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      // If PDF already exists and is recent, download directly
      if (pdfUrl) {
        // Download existing PDF
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `契約書_${contract.contract_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        onDownloadComplete?.(pdfUrl);
        return;
      }

      // Generate new PDF
      const response = await fetch(`/api/admin/contracts/${contract.id}/download`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'PDFの生成に失敗しました');
      }

      const data = await response.json();

      if (data.success && data.url) {
        setPdfUrl(data.url);

        // Trigger download
        const link = document.createElement('a');
        link.href = data.url;
        link.download = `契約書_${contract.contract_number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        onDownloadComplete?.(data.url);
      } else {
        throw new Error('PDFの生成に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('Contract download error:', err);

      // Show error for 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleDownload}
        variant={variant}
        size={size}
        disabled={loading}
        className={className}
        title={pdfUrl ? 'PDFをダウンロード' : 'PDFを生成してダウンロード'}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            {pdfUrl ? 'PDFダウンロード' : 'PDF生成'}
          </>
        )}
      </Button>

      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
          <p className="text-sm font-medium">エラー</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Contract Preview & Download Button Component
 *
 * 契約書プレビュー・ダウンロードボタン
 * - プレビュー機能付き
 * - 新規タブでPDFを開く
 */
interface ContractPreviewButtonProps extends ContractDownloadButtonProps {
  showPreview?: boolean;
}

export function ContractPreviewButton({
  contract,
  variant = 'outline',
  size = 'default',
  className = '',
  showPreview = true,
  onDownloadComplete,
}: ContractPreviewButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(contract.final_contract_url || null);

  const handlePreview = async () => {
    setLoading(true);
    setError(null);

    try {
      // Generate or get PDF URL
      if (!pdfUrl) {
        const response = await fetch(`/api/admin/contracts/${contract.id}/download`, {
          method: 'GET',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'PDFの生成に失敗しました');
        }

        const data = await response.json();

        if (data.success && data.url) {
          setPdfUrl(data.url);
          window.open(data.url, '_blank');
          onDownloadComplete?.(data.url);
        } else {
          throw new Error('PDFの生成に失敗しました');
        }
      } else {
        // Open existing PDF in new tab
        window.open(pdfUrl, '_blank');
        onDownloadComplete?.(pdfUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('Contract preview error:', err);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handlePreview}
        variant={variant}
        size={size}
        disabled={loading}
        className={className}
        title="契約書をプレビュー"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            読み込み中...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            プレビュー
          </>
        )}
      </Button>

      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
          <p className="text-sm font-medium">エラー</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Contract Actions Component
 *
 * 契約書アクションコンポーネント
 * - ダウンロードとプレビューを組み合わせたUI
 */
interface ContractActionsProps {
  contract: Contract;
  onDownloadComplete?: (url: string) => void;
}

export function ContractActions({
  contract,
  onDownloadComplete,
}: ContractActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <ContractPreviewButton
        contract={contract}
        size="sm"
        onDownloadComplete={onDownloadComplete}
      />
      <ContractDownloadButton
        contract={contract}
        size="sm"
        onDownloadComplete={onDownloadComplete}
      />
    </div>
  );
}
