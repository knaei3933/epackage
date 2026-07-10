/**
 * Download History and Status Message section
 */

'use client';

import { Card, Badge, Button } from '@/components/ui';
import { Download, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { formatPrice } from '@/utils/formatters';

interface DownloadHistoryAndStatusProps {
  downloadHistory: any[];
  downloadCount: number;
  lastDownloadedAt: string | null;
  quotation: any;
}

export function DownloadHistoryAndStatus({ downloadHistory, downloadCount, lastDownloadedAt, quotation }: DownloadHistoryAndStatusProps) {
  const statusUpper = (quotation?.status || '').toUpperCase();
  return (
    <>
      {/* Download History */}
      {downloadCount > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Download className="w-5 h-5" />
              PDFダウンロード履歴
            </h3>
            <Badge variant="secondary" size="sm">
              計{downloadCount}回
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">最終ダウンロード</span>
              <span className="text-text-primary">
                {lastDownloadedAt
                  ? new Date(lastDownloadedAt).toLocaleString('ja-JP')
                  : '-'}
              </span>
            </div>
            {downloadHistory.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-text-muted hover:text-text-primary">
                  全履歴を表示 ({downloadHistory.length}件)
                </summary>
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                  {downloadHistory.map((log, index) => (
                    <div
                      key={log.id || index}
                      className="flex items-center justify-between text-sm p-2 rounded bg-bg-secondary"
                    >
                      <span className="text-text-muted">
                        {new Date(log.accessed_at).toLocaleString('ja-JP')}
                      </span>
                      <span className="text-xs text-text-muted">
                        {log.ip_address || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </Card>
      )}

      {/* Status Message - Separate Card based on quotation status */}
      {(statusUpper === 'DRAFT' || statusUpper === 'QUOTATION_PENDING') ? (
        // ⏳ ドラフト/見積承認待ち: 注文可能だが、管理者審査中の案内
        <Card className="bg-blue-50 border-blue-200 p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-blue-800">
                この見積はご注文可能です
              </p>
              <p className="text-xs text-blue-600 mt-1">
                内容をご確認のうえ「注文確定」ボタンからご発注ください
              </p>
            </div>
          </div>
        </Card>
      ) : statusUpper === 'CONVERTED' ? (
        // ✓ 変換済み: 注文済みメッセージ
        <Card className="bg-green-50 border-green-200 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-green-800">
                この見積は既に注文に変換されています
              </p>
              <p className="text-xs text-green-600 mt-1">
                注文一覧ページからご確認いただけます
              </p>
            </div>
          </div>
        </Card>
      ) : statusUpper === 'CANCELLED' ? (
        // ✗ キャンセル: キャンセルメッセージ
        <Card className="bg-gray-50 border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700">
                この見積はキャンセルされています
              </p>
            </div>
          </div>
        </Card>
      ) : statusUpper === 'REJECTED' ? (
        // ✗ 却下: 却下メッセージ
        <Card className="bg-red-50 border-red-200 p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-red-800">
                この見積は却下されました
              </p>
              <p className="text-xs text-red-600 mt-1">
                お問い合わせフォームよりご連絡ください
              </p>
            </div>
          </div>
        </Card>
      ) : (
        // その他の注文可能状態（APPROVED / SENT / QUOTATION_APPROVED 等）: ご注文可能
        <Card className="bg-blue-50 border-blue-200 p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-blue-800">
                この見積はご注文可能です
              </p>
              <p className="text-xs text-blue-600 mt-1">
                内容をご確認のうえ「注文確定」ボタンからご発注ください
              </p>
            </div>
          </div>
        </Card>
      )}

    </>
  );
}
