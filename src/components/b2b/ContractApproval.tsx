'use client';

/**
 * Contract Return/Approval Workflow Component
 *
 * 契約書返却・承認ワークフローコンポーネント
 * - 契約書の返却・承認リクエスト
 * - ステータス追跡
 * - アクション履歴
 * - メール通知連携
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  Send,
  Check,
  X,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
  User,
  Calendar,
  MessageSquare,
  Eye,
  Download,
  History,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import type { ContractData } from '@/types/contract';

// ============================================================
// Types
// ============================================================

interface ContractApprovalProps {
  contractId: string;
  contractData: ContractData;
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: 'seller' | 'buyer' | 'admin';
  };
  onStatusChange?: (newStatus: ContractWorkflowStatus) => void;
  onSendRequest?: (action: WorkflowAction) => void;
  className?: string;
}

export type ContractWorkflowStatus =
  | 'draft'
  | 'pending_seller_review'
  | 'pending_buyer_review'
  | 'pending_seller_signature'
  | 'pending_buyer_signature'
  | 'pending_timestamp'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type WorkflowAction =
  | 'send_to_buyer'
  | 'send_to_seller'
  | 'approve'
  | 'reject'
  | 'request_changes'
  | 'sign'
  | 'request_timestamp'
  | 'complete'
  | 'cancel';

interface WorkflowActionRequest {
  contractId: string;
  action: WorkflowAction;
  userId: string;
  message?: string;
  timestamp?: string;
}

interface WorkflowActionResponse {
  success: boolean;
  status?: ContractWorkflowStatus;
  error?: string;
}

interface WorkflowHistoryItem {
  id: string;
  action: WorkflowAction;
  fromStatus: ContractWorkflowStatus;
  toStatus: ContractWorkflowStatus;
  performedBy: {
    id: string;
    name: string;
    role: string;
  };
  performedAt: string;
  message?: string;
}

// ============================================================
// Constants
// ============================================================

const STATUS_LABELS: Record<ContractWorkflowStatus, string> = {
  draft: '草案',
  pending_seller_review: '販売者レビュー待ち',
  pending_buyer_review: '購入者レビュー待ち',
  pending_seller_signature: '販売者署名待ち',
  pending_buyer_signature: '購入者署名待ち',
  pending_timestamp: 'タイムスタンプ付与待ち',
  active: '有効',
  completed: '完了',
  cancelled: '取消',
  rejected: '拒否',
};

const STATUS_COLORS: Record<ContractWorkflowStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-300',
  pending_seller_review: 'bg-blue-100 text-blue-800 border-blue-300',
  pending_buyer_review: 'bg-purple-100 text-purple-800 border-purple-300',
  pending_seller_signature: 'bg-orange-100 text-orange-800 border-orange-300',
  pending_buyer_signature: 'bg-pink-100 text-pink-800 border-pink-300',
  pending_timestamp: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  active: 'bg-green-100 text-green-800 border-green-300',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  rejected: 'bg-red-200 text-red-900 border-red-400',
};

// ============================================================
// Component
// ============================================================

export default function ContractApproval({
  contractId,
  contractData,
  currentUser,
  onStatusChange,
  onSendRequest,
  className = '',
}: ContractApprovalProps) {
  // State
  const [currentStatus, setCurrentStatus] = useState<ContractWorkflowStatus>('draft');
  const [history, setHistory] = useState<WorkflowHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [selectedAction, setSelectedAction] = useState<WorkflowAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // ============================================================
  // Data Fetching
  // ============================================================

  useEffect(() => {
    fetchWorkflowStatus();
    fetchWorkflowHistory();
  }, [contractId]);

  const fetchWorkflowStatus = async () => {
    try {
      const response = await fetch(`/api/contract/workflow/status?contractId=${contractId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentStatus(data.status || 'draft');
      }
    } catch (err) {
      console.error('Failed to fetch workflow status:', err);
    }
  };

  const fetchWorkflowHistory = async () => {
    try {
      const response = await fetch(`/api/contract/workflow/history?contractId=${contractId}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch workflow history:', err);
    }
  };

  // ============================================================
  // Handlers
  // ============================================================

  const handleAction = useCallback(
    async (action: WorkflowAction) => {
      setIsProcessing(true);
      setError(null);

      try {
        const requestBody: WorkflowActionRequest = {
          contractId,
          action,
          userId: currentUser.id,
          message: showMessageInput ? message : undefined,
        };

        const response = await fetch('/api/contract/workflow/action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = (await response.json()) as WorkflowActionResponse;

        if (!data.success) {
          throw new Error(data.error || 'アクションの実行に失敗しました');
        }

        // Update status
        if (data.status) {
          setCurrentStatus(data.status);
          if (onStatusChange) {
            onStatusChange(data.status);
          }
        }

        // Reset message input
        setMessage('');
        setShowMessageInput(false);
        setSelectedAction(null);

        // Refresh history
        await fetchWorkflowHistory();

        if (onSendRequest) {
          onSendRequest(action);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      } finally {
        setIsProcessing(false);
      }
    },
    [contractId, currentUser.id, showMessageInput, message, onStatusChange, onSendRequest]
  );

  const handleActionClick = (action: WorkflowAction) => {
    setSelectedAction(action);
    if (
      action === 'reject' ||
      action === 'request_changes' ||
      action === 'approve' ||
      action === 'sign'
    ) {
      setShowMessageInput(true);
    } else {
      handleAction(action);
    }
  };

  const handleConfirmAction = () => {
    if (selectedAction) {
      handleAction(selectedAction);
    }
  };

  // ============================================================
  // Available Actions
  // ============================================================

  const getAvailableActions = (): WorkflowAction[] => {
    switch (currentStatus) {
      case 'draft':
        return currentUser.role === 'seller' ? ['send_to_buyer'] : [];
      case 'pending_seller_review':
        return currentUser.role === 'seller'
          ? ['approve', 'reject', 'request_changes']
          : [];
      case 'pending_buyer_review':
        return currentUser.role === 'buyer'
          ? ['approve', 'reject', 'request_changes']
          : [];
      case 'pending_seller_signature':
        return currentUser.role === 'seller' ? ['sign'] : [];
      case 'pending_buyer_signature':
        return currentUser.role === 'buyer' ? ['sign'] : [];
      case 'pending_timestamp':
        return ['request_timestamp'];
      case 'active':
        return ['complete'];
      default:
        return [];
    }
  };

  const availableActions = getAvailableActions();

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                契約書ワークフロー
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                契約番号: {contractData.contractNumber}
              </p>
            </div>

            {/* Status Badge */}
            <div
              className={`px-3 py-1.5 rounded-full text-sm font-medium border ${STATUS_COLORS[currentStatus]}`}
            >
              {STATUS_LABELS[currentStatus]}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Current Step Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">現在のステータス</p>
                <p className="text-sm text-gray-600">{STATUS_LABELS[currentStatus]}</p>
              </div>
            </div>
          </div>

          {/* Message Input */}
          {showMessageInput && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                メッセージ（オプション）
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full p-3 border rounded-lg resize-none"
                placeholder={getMessagePlaceholder(selectedAction)}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleConfirmAction}
                  disabled={isProcessing}
                  size="sm"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      送信
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMessageInput(false);
                    setSelectedAction(null);
                    setMessage('');
                  }}
                  disabled={isProcessing}
                  size="sm"
                >
                  キャンセル
                </Button>
              </div>
            </div>
          )}

          {/* Available Actions */}
          {availableActions.length > 0 && !showMessageInput && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                利用可能なアクション
              </label>
              <div className="flex flex-wrap gap-2">
                {availableActions.map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    onClick={() => handleActionClick(action)}
                    disabled={isProcessing}
                    size="sm"
                  >
                    {getActionIcon(action)}
                    {getActionLabel(action)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* No Actions Available */}
          {availableActions.length === 0 && !showMessageInput && (
            <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
              現在、実行可能なアクションはありません
            </div>
          )}

          {/* View History Toggle */}
          <Button
            variant="ghost"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full"
            size="sm"
          >
            <History className="w-4 h-4 mr-2" />
            {showHistory ? '履歴を非表示' : '履歴を表示'}
          </Button>
        </CardContent>
      </Card>

      {/* Workflow History */}
      {showHistory && (
        <Card>
          <CardHeader className="pb-4">
            <h4 className="text-md font-semibold flex items-center gap-2">
              <History className="w-4 h-4" />
              ワークフロー履歴
            </h4>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                履歴がありません
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-700">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {getActionLabel(item.action)}
                        </p>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[item.toStatus]}`}>
                          {STATUS_LABELS[item.toStatus]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.performedBy.name} ({item.performedBy.role})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.performedAt).toLocaleString('ja-JP')}
                        </span>
                      </div>
                      {item.message && (
                        <div className="mt-2 p-2 bg-white rounded border text-sm text-gray-700">
                          <MessageSquare className="w-3 h-3 inline mr-1" />
                          {item.message}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// Helper Functions
// ============================================================

function getActionLabel(action: WorkflowAction): string {
  const labels: Record<WorkflowAction, string> = {
    send_to_buyer: '購入者に送信',
    send_to_seller: '販売者に送信',
    approve: '承認',
    reject: '拒否',
    request_changes: '変更リクエスト',
    sign: '署名',
    request_timestamp: 'タイムスタンプ付与',
    complete: '完了',
    cancel: '取消',
  };
  return labels[action];
}

function getActionIcon(action: WorkflowAction): React.ReactNode {
  const icons: Record<WorkflowAction, React.ReactNode> = {
    send_to_buyer: <Send className="w-4 h-4 mr-1" />,
    send_to_seller: <Send className="w-4 h-4 mr-1" />,
    approve: <Check className="w-4 h-4 mr-1 text-green-600" />,
    reject: <X className="w-4 h-4 mr-1 text-red-600" />,
    request_changes: <RefreshCw className="w-4 h-4 mr-1 text-orange-600" />,
    sign: <FileText className="w-4 h-4 mr-1" />,
    request_timestamp: <Clock className="w-4 h-4 mr-1 text-blue-600" />,
    complete: <Check className="w-4 h-4 mr-1 text-emerald-600" />,
    cancel: <X className="w-4 h-4 mr-1 text-gray-600" />,
  };
  return icons[action];
}

function getMessagePlaceholder(action: WorkflowAction | null): string {
  if (!action) return '';

  const placeholders: Record<WorkflowAction, string> = {
    send_to_buyer: '購入者へのメッセージを入力してください...',
    send_to_seller: '販売者へのメッセージを入力してください...',
    approve: '承認のコメントがあれば入力してください...',
    reject: '拒否の理由を入力してください...',
    request_changes: 'リクエストする変更内容を入力してください...',
    sign: '署名時のメッセージがあれば入力してください...',
    request_timestamp: 'タイムスタンプ付与のコメントがあれば入力してください...',
    complete: '完了のコメントがあれば入力してください...',
    cancel: '取消の理由を入力してください...',
  };

  return placeholders[action];
}

// ============================================================
// Compact Status Badge Component
// ============================================================

interface WorkflowStatusBadgeProps {
  status: ContractWorkflowStatus;
}

export function WorkflowStatusBadge({ status }: WorkflowStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[status]}`}
    >
      {status === 'active' && <Check className="w-3 h-3" />}
      {status === 'draft' && <FileText className="w-3 h-3" />}
      {(status.startsWith('pending_') || status === 'pending_timestamp') && (
        <Clock className="w-3 h-3" />
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}
