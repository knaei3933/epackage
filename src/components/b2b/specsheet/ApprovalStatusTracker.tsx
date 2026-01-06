'use client';

/**
 * Specification Sheet Approval Status Tracker Component
 *
 * 仕様書承認ステータストラッカーコンポーネント
 * - 承認状況の可視化
 * - 履歴管理
 * - タイムライン表示
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface ApproverInfo {
  userId: string;
  name: string;
  email: string;
  title?: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  respondedAt?: string;
}

interface ApprovalRequest {
  id: string;
  specSheetId: string;
  specNumber: string;
  revision: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  approvers: ApproverInfo[];
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  title?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  deadline?: string;
}

interface ApprovalStatusTrackerProps {
  specNumber: string;
  revision: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onApprove?: (approvalId: string, comment: string) => void;
  onReject?: (approvalId: string, comment: string) => void;
  onCancel?: (approvalId: string) => void;
  className?: string;
}

// ============================================================
// Helper Functions
// ============================================================

function getStatusIcon(status: ApproverInfo['status'] | ApprovalRequest['status']) {
  switch (status) {
    case 'approved':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'rejected':
      return <XCircle className="w-5 h-5 text-red-600" />;
    case 'cancelled':
      return <XCircle className="w-5 h-5 text-gray-400" />;
    case 'pending':
    default:
      return <Clock className="w-5 h-5 text-yellow-600" />;
  }
}

function getStatusText(status: ApprovalRequest['status']) {
  switch (status) {
    case 'approved':
      return '承認済み';
    case 'rejected':
      return '拒否';
    case 'cancelled':
      return 'キャンセル済み';
    case 'pending':
    default:
      return '承認待ち';
  }
}

function getStatusColor(status: ApprovalRequest['status']) {
  switch (status) {
    case 'approved':
      return 'bg-green-50 border-green-200';
    case 'rejected':
      return 'bg-red-50 border-red-200';
    case 'cancelled':
      return 'bg-gray-50 border-gray-200';
    case 'pending':
    default:
      return 'bg-yellow-50 border-yellow-200';
  }
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================
// Component
// ============================================================

export default function ApprovalStatusTracker({
  specNumber,
  revision,
  autoRefresh = false,
  refreshInterval = 10000,
  onApprove,
  onReject,
  onCancel,
  className = '',
}: ApprovalStatusTrackerProps) {
  const [approval, setApproval] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================
  // Fetch Approval Status
  // ============================================================

  const fetchApprovalStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        specNumber,
        revision,
      });

      const response = await fetch(`/api/specsheet/approval?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '取得に失敗しました');
      }

      if (data.approvals && data.approvals.length > 0) {
        // Get the most recent pending approval, or the most recent overall
        const sorted = data.approvals.sort(
          (a: ApprovalRequest, b: ApprovalRequest) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setApproval(sorted[0]);
      } else {
        setApproval(null);
      }
    } catch (err) {
      console.error('Fetch approval status error:', err);
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [specNumber, revision]);

  // ============================================================
  // Approval Actions
  // ============================================================

  const handleApprove = useCallback(async () => {
    if (!approval || !onApprove) return;

    setIsSubmitting(true);
    await onApprove(approval.id, commentInput);
    setCommentInput('');
    setShowCommentInput(false);
    setIsSubmitting(false);
    await fetchApprovalStatus();
  }, [approval, commentInput, onApprove, fetchApprovalStatus]);

  const handleReject = useCallback(async () => {
    if (!approval || !onReject) return;

    setIsSubmitting(true);
    await onReject(approval.id, commentInput);
    setCommentInput('');
    setShowCommentInput(false);
    setIsSubmitting(false);
    await fetchApprovalStatus();
  }, [approval, commentInput, onReject, fetchApprovalStatus]);

  const handleCancel = useCallback(async () => {
    if (!approval || !onCancel) return;

    setIsSubmitting(true);
    await onCancel(approval.id);
    setIsSubmitting(false);
    await fetchApprovalStatus();
  }, [approval, onCancel, fetchApprovalStatus]);

  // ============================================================
  // Effects
  // ============================================================

  useEffect(() => {
    fetchApprovalStatus();
  }, [fetchApprovalStatus]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchApprovalStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchApprovalStatus]);

  // ============================================================
  // Render
  // ============================================================

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 bg-red-50 border-red-200 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-800">エラー</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchApprovalStatus}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  if (!approval) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">承認リクエストはありません</p>
        </div>
      </Card>
    );
  }

  const approvedCount = approval.approvers.filter(a => a.status === 'approved').length;
  const rejectedCount = approval.approvers.filter(a => a.status === 'rejected').length;
  const pendingCount = approval.approvers.filter(a => a.status === 'pending').length;
  const isCompleted = approval.status !== 'pending';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Header */}
      <Card className={`p-6 border-2 ${getStatusColor(approval.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(approval.status)}
            <div>
              <h3 className="text-lg font-semibold">
                {getStatusText(approval.status)}
              </h3>
              <p className="text-sm text-gray-600">
                {approvedCount}名承認 / {rejectedCount}名拒否
                {pendingCount > 0 && ` / ${pendingCount}名保留中`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchApprovalStatus}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Summary Info */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">リクエスト者:</span>
            <span className="font-medium">{approval.requesterName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">作成日時:</span>
            <span className="font-medium">{formatDate(approval.createdAt)}</span>
          </div>
          {approval.deadline && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">期限:</span>
              <span
                className={`font-medium ${
                  new Date(approval.deadline) < new Date()
                    ? 'text-red-600'
                    : ''
                }`}
              >
                {formatDate(approval.deadline)}
              </span>
            </div>
          )}
        </div>

        {approval.description && (
          <div className="mt-3 p-3 bg-white/50 rounded-lg">
            <p className="text-sm">{approval.description}</p>
          </div>
        )}
      </Card>

      {/* Expanded Details */}
      {expanded && (
        <>
          {/* Progress Timeline */}
          <Card className="p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              承認進捗
            </h4>

            <div className="space-y-4">
              {approval.approvers.map((approver, index) => (
                <div
                  key={approver.userId}
                  className="flex gap-4 p-4 rounded-lg border bg-gray-50"
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(approver.status)}
                  </div>

                  {/* Approver Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{approver.name}</p>
                        <p className="text-sm text-gray-600">
                          {approver.title && `${approver.title} | `}
                          {approver.email}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          approver.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : approver.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {approver.status === 'approved'
                          ? '承認済み'
                          : approver.status === 'rejected'
                            ? '拒否'
                            : '保留中'}
                      </span>
                    </div>

                    {/* Comment */}
                    {approver.comment && (
                      <div className="mt-2 p-2 bg-white rounded border">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                          <p className="text-sm">{approver.comment}</p>
                        </div>
                      </div>
                    )}

                    {/* Response Time */}
                    {approver.respondedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        回答日時: {formatDate(approver.respondedAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Buttons (for pending approvals) */}
          {approval.status === 'pending' && (onApprove || onReject || onCancel) && (
            <Card className="p-6">
              <h4 className="font-semibold mb-4">アクション</h4>

              {/* Comment Input */}
              {showCommentInput && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    コメント（オプション）
                  </label>
                  <textarea
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    rows={3}
                    className="w-full p-3 border rounded-lg resize-none"
                    placeholder="承認・拒否に関するコメント..."
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                {onApprove && (
                  <Button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    承認
                  </Button>
                )}

                {onReject && (
                  <Button
                    onClick={handleReject}
                    disabled={isSubmitting}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    拒否
                  </Button>
                )}

                {!showCommentInput && (onApprove || onReject) && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCommentInput(true)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    コメントを追加
                  </Button>
                )}

                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="text-gray-600"
                  >
                    リクエストをキャンセル
                  </Button>
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// Mini Status Badge Component
// ============================================================

interface ApprovalStatusBadgeProps {
  approval: ApprovalRequest;
  showLabel?: boolean;
  onClick?: () => void;
}

export function ApprovalStatusBadge({
  approval,
  showLabel = true,
  onClick,
}: ApprovalStatusBadgeProps) {
  const approvedCount = approval.approvers.filter(a => a.status === 'approved').length;
  const totalCount = approval.approvers.length;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${getStatusColor(approval.status)}`}
    >
      {getStatusIcon(approval.status)}
      {showLabel && (
        <span>
          {getStatusText(approval.status)} ({approvedCount}/{totalCount})
        </span>
      )}
    </div>
  );
}

// ============================================================
// Approval History List Component
// ============================================================

interface ApprovalHistoryListProps {
  specNumber: string;
  className?: string;
}

export function ApprovalHistoryList({
  specNumber,
  className = '',
}: ApprovalHistoryListProps) {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/specsheet/approval?specNumber=${specNumber}`);
        const data = await response.json();

        if (data.success) {
          setApprovals(data.approvals || []);
        }
      } catch (error) {
        console.error('Fetch history error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [specNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">承認履歴はありません</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold">承認履歴</h3>

      {approvals.map(approval => (
        <Card
          key={approval.id}
          className={`p-4 border-2 ${getStatusColor(approval.status)}`}
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() =>
              setExpandedId(expandedId === approval.id ? null : approval.id)
            }
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(approval.status)}
              <div>
                <p className="font-medium">
                  {approval.specNumber} v{approval.revision}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(approval.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ApprovalStatusBadge approval={approval} showLabel={false} />
              {expandedId === approval.id ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>

          {expandedId === approval.id && (
            <div className="mt-4 pt-4 border-t">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">リクエスト者:</span>{' '}
                  {approval.requesterName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">承認者:</span>{' '}
                  {approval.approvers.map(a => a.name).join(', ')}
                </p>
                {approval.description && (
                  <p className="text-sm">
                    <span className="font-medium">説明:</span>{' '}
                    {approval.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
