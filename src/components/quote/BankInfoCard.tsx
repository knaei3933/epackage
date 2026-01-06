/**
 * BankInfoCard Component
 *
 * 銀行口座情報表示カード
 * - 見積書IDから請求書APIを呼び出して銀行情報を取得
 * - 日本語の銀行口座情報を表示
 * - サーバーコンポーネントとして実装
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { Building2, Copy, Check } from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface BankInfo {
  bankName: string;
  branchName?: string;
  accountType?: string;
  accountNumber: string;
  accountHolder: string;
}

interface InvoiceResponse {
  success: boolean;
  invoice?: {
    bankInfo?: BankInfo;
  };
  error?: string;
}

// ============================================================
// Component
// ============================================================

interface BankInfoCardProps {
  quotationId: string;
}

export function BankInfoCard({ quotationId }: BankInfoCardProps) {
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBankInfo() {
      try {
        setLoading(true);
        const response = await fetch(`/api/member/quotations/${quotationId}/invoice`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('銀行情報の取得に失敗しました');
        }

        const data: InvoiceResponse = await response.json();

        if (data.success && data.invoice?.bankInfo) {
          setBankInfo(data.invoice.bankInfo);
        } else {
          setError('銀行情報が見つかりません');
        }
      } catch (err) {
        console.error('Error fetching bank info:', err);
        setError(err instanceof Error ? err.message : '銀行情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchBankInfo();
  }, [quotationId]);

  // Copy to clipboard function
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-text-muted animate-pulse" />
          <div className="flex-1">
            <div className="h-5 bg-bg-secondary rounded animate-pulse mb-2" />
            <div className="h-4 bg-bg-secondary rounded animate-pulse w-2/3" />
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (error || !bankInfo) {
    return null; // Don't show card if bank info is not available
  }

  // Success state
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Building2 className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-text-primary">
          振込先銀行口座
        </h2>
      </div>

      <div className="space-y-4">
        {/* Bank Name */}
        <div className="flex items-start justify-between group">
          <div className="flex-1">
            <p className="text-sm text-text-muted mb-1">銀行名</p>
            <p className="text-base font-medium text-text-primary">
              {bankInfo.bankName}
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(bankInfo.bankName, 'bankName')}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Copy bank name"
          >
            {copiedField === 'bankName' ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4 text-text-muted" />
            )}
          </button>
        </div>

        {/* Branch Name (if available) */}
        {bankInfo.branchName && (
          <div className="flex items-start justify-between group">
            <div className="flex-1">
              <p className="text-sm text-text-muted mb-1">支店名</p>
              <p className="text-base font-medium text-text-primary">
                {bankInfo.branchName}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(bankInfo.branchName, 'branchName')}
              className="p-2 hover:bg-bg-secondary rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Copy branch name"
            >
              {copiedField === 'branchName' ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-text-muted" />
              )}
            </button>
          </div>
        )}

        {/* Account Type (if available) */}
        {bankInfo.accountType && (
          <div className="flex items-start justify-between group">
            <div className="flex-1">
              <p className="text-sm text-text-muted mb-1">口座種別</p>
              <p className="text-base font-medium text-text-primary">
                {bankInfo.accountType}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(bankInfo.accountType, 'accountType')}
              className="p-2 hover:bg-bg-secondary rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Copy account type"
            >
              {copiedField === 'accountType' ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-text-muted" />
              )}
            </button>
          </div>
        )}

        {/* Account Number */}
        <div className="flex items-start justify-between group">
          <div className="flex-1">
            <p className="text-sm text-text-muted mb-1">口座番号</p>
            <p className="text-base font-medium text-text-primary font-mono">
              {bankInfo.accountNumber}
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(bankInfo.accountNumber, 'accountNumber')}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Copy account number"
          >
            {copiedField === 'accountNumber' ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4 text-text-muted" />
            )}
          </button>
        </div>

        {/* Account Holder */}
        <div className="flex items-start justify-between group">
          <div className="flex-1">
            <p className="text-sm text-text-muted mb-1">口座名義</p>
            <p className="text-base font-medium text-text-primary">
              {bankInfo.accountHolder}
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(bankInfo.accountHolder, 'accountHolder')}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Copy account holder"
          >
            {copiedField === 'accountHolder' ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4 text-text-muted" />
            )}
          </button>
        </div>
      </div>

      {/* Note */}
      <div className="mt-4 pt-4 border-t border-border-secondary">
        <p className="text-xs text-text-muted">
          ※お振込の際は、必ずお客様名義でお願いいたします。
        </p>
      </div>
    </Card>
  );
}

// ============================================================
// Export
// ============================================================

export default BankInfoCard;
