'use client';

/**
 * Customer Approval Section Component
 *
 * 顧客承認セクションコンポーネント
 * - 承認待ちリクエスト一覧表示
 * - リクエスト詳細表示 (ファイル、説明)
 * - 承認/拒否応答
 * - 有効期限警告
 *
 * @module components/orders/CustomerApprovalSection
 */

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Textarea,
  Badge,
  Alert,
  AlertDescription,
} from '@/components/ui';
import { CheckCircle2, XCircle, FileText, Clock, AlertTriangle } from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface ApprovalRequestFile {
  id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  file_size_bytes: number;
  file_category: string;
  uploaded_at: string;
}

interface ApprovalRequest {
  id: string;
  order_id: string;
  korea_correction_id: string | null;
  title: string;
  description: string;
  approval_type: 'correction' | 'spec_change' | 'price_adjustment' | 'delay';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  response_notes: string | null;
  responded_at: string | null;
  responded_by: string | null;
  expires_at: string;
  requested_by: string;
  requested_at: string;
  created_at: string;
  metadata: Record<string, any>;
  files?: ApprovalRequestFile[];
}

interface CustomerApprovalSectionProps {
  orderId: string;
}

// ============================================================
// Component
// ============================================================

export function CustomerApprovalSection({ orderId }: CustomerApprovalSectionProps) {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [responseNotes, setResponseNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load approval requests - memoized with useCallback
  const loadApprovals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/member/orders/${orderId}/approvals`);
      const result = await response.json();

      if (result.success) {
        setApprovals(result.data || []);
      } else {
        setError(result.error || '承認リクエストの読み込みに失敗しました。');
      }
    } catch (err) {
      console.error('[CustomerApprovalSection] Load error:', err);
      setError('予期しないエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Respond to approval request - memoized with useCallback
  const handleRespond = useCallback(async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      setSubmitting(requestId);
      setError(null);

      const response = await fetch(
        `/api/member/orders/${orderId}/approvals/${requestId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status,
            response_notes: responseNotes[requestId] || '',
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Clear response notes for this request
        setResponseNotes((prev) => {
          const updated = { ...prev };
          delete updated[requestId];
          return updated;
        });
        setExpandedId(null);
        await loadApprovals(); // Reload list
      } else {
        setError(result.error || '応答の送信に失敗しました。');
      }
    } catch (err) {
      console.error('[CustomerApprovalSection] Respond error:', err);
      setError('予期しないエラーが発生しました。');
    } finally {
      setSubmitting(null);
    }
  }, [orderId, responseNotes, loadApprovals]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Check if request is expired
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  // Check if request is expiring soon (within 24 hours)
  const isExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
  };

  // Get approval type label
  const getApprovalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      correction: '修正',
      spec_change: '仕様変更',
      price_adjustment: '価格調整',
      delay: '遅延',
    };
    return labels[type] || type;
  };

  // Load approvals on mount
  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  // Filter pending approvals - memoized with useMemo
  const pendingApprovals = useMemo(
    () => approvals.filter((a) => a.status === 'pending'),
    [approvals]
  );
  const hasPendingApprovals = pendingApprovals.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          承認待ちリクエスト
          {hasPendingApprovals && (
            <Badge variant="error" className="text-xs">
              {pendingApprovals.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            承認リクエストを読み込み中...
          </div>
        ) : !hasPendingApprovals ? (
          <div className="text-center py-8 text-muted-foreground">
            承認待ちのリクエストはありません。
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((approval) => {
              const expired = isExpired(approval.expires_at);
              const expiringSoon = isExpiringSoon(approval.expires_at);
              const isExpanded = expandedId === approval.id;

              return (
                <div
                  key={approval.id}
                  className={`p-4 rounded-lg border ${
                    expired
                      ? 'bg-muted/50 border-muted'
                      : expiringSoon
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-card'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{approval.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {getApprovalTypeLabel(approval.approval_type)}
                        </Badge>
                        {expired && (
                          <Badge variant="error" className="text-xs">
                            期限切れ
                          </Badge>
                        )}
                        {expiringSoon && !expired && (
                          <Badge variant="outline" className="text-xs border-orange-500 text-orange-700">
                            まもなく期限切れ
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        期限: {formatDate(approval.expires_at)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : approval.id)}
                    >
                      {isExpanded ? '折りたたむ' : '詳細を表示'}
                    </Button>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="space-y-4">
                      {/* Description */}
                      <div>
                        <p className="text-sm whitespace-pre-wrap">
                          {approval.description}
                        </p>
                      </div>

                      {/* Files */}
                      {approval.files && approval.files.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">添付ファイル:</p>
                          <div className="space-y-2">
                            {approval.files.map((file) => (
                              <a
                                key={file.id}
                                href={file.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                              >
                                <FileText className="w-4 h-4" />
                                <span className="text-sm">{file.file_name}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Response notes input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          応答メモ (任意)
                        </label>
                        <Textarea
                          placeholder="コメントや追加情報を入力してください..."
                          value={responseNotes[approval.id] || ''}
                          onChange={(e) =>
                            setResponseNotes((prev) => ({
                              ...prev,
                              [approval.id]: e.target.value,
                            }))
                          }
                          rows={3}
                          disabled={expired || submitting === approval.id}
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRespond(approval.id, 'approved')}
                          disabled={expired || submitting === approval.id}
                          className="flex-1"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          承認する
                        </Button>
                        <Button
                          onClick={() => handleRespond(approval.id, 'rejected')}
                          disabled={expired || submitting === approval.id}
                          variant="outline"
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          拒否する
                        </Button>
                      </div>

                      {submitting === approval.id && (
                        <div className="text-center text-sm text-muted-foreground">
                          送信中...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Memoize component to prevent unnecessary re-renders
export const MemoizedCustomerApprovalSection = memo(CustomerApprovalSection);
