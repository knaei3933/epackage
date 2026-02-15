'use client';

/**
 * Specification Sheet Approval Request Form Component
 *
 * 仕様書承認リクエストフォームコンポーネント
 * - 承認者選択・リクエスト送信
 * - 進捗状況表示
 * - メール通知統合
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  Send,
  UserPlus,
  X,
  Check,
  AlertCircle,
  Mail,
  Clock,
  Loader2,
  Users,
  FileText,
  Calendar,
} from 'lucide-react';
import type { SpecSheetData } from '@/types/specsheet';

// ============================================================
// Types
// ============================================================

interface Approver {
  userId: string;
  name: string;
  email: string;
  title?: string;
}

interface ApprovalRequestFormProps {
  specSheetData: SpecSheetData;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  availableApprovers: Approver[];
  onSend?: (approvalId: string) => void;
  onCancel?: () => void;
  className?: string;
}

interface ApprovalRequest {
  specSheetData: SpecSheetData;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  approvers: Approver[];
  title?: string;
  description?: string;
  deadline?: string;
}

interface SendResult {
  success: boolean;
  approvalId?: string;
  message?: string;
  error?: string;
}

// ============================================================
// Component
// ============================================================

export default function ApprovalRequestForm({
  specSheetData,
  requester,
  availableApprovers = [],
  onSend,
  onCancel,
  className = '',
}: ApprovalRequestFormProps) {
  // Form state
  const [selectedApprovers, setSelectedApprovers] = useState<Approver[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  // UI state
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Set default title
  useEffect(() => {
    setTitle(`仕様書承認リクエスト: ${specSheetData.specNumber}`);
  }, [specSheetData.specNumber]);

  // ============================================================
  // Handlers
  // ============================================================

  const addApprover = useCallback(
    (approver: Approver) => {
      if (!selectedApprovers.find(a => a.userId === approver.userId)) {
        setSelectedApprovers(prev => [...prev, approver]);
      }
    },
    [selectedApprovers]
  );

  const removeApprover = useCallback((userId: string) => {
    setSelectedApprovers(prev => prev.filter(a => a.userId !== userId));
  }, []);

  const handleSend = useCallback(async () => {
    if (selectedApprovers.length === 0) {
      setResult({
        success: false,
        error: '承認者を少なくとも1名選択してください',
      });
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const requestData: ApprovalRequest = {
        specSheetData,
        requesterId: requester.id,
        requesterName: requester.name,
        requesterEmail: requester.email,
        approvers: selectedApprovers,
        title: title || undefined,
        description: description || undefined,
        deadline: deadline || undefined,
      };

      const response = await fetch('/api/specsheet/approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = (await response.json()) as SendResult;

      if (data.success) {
        setResult({
          success: true,
          approvalId: data.approvalId,
          message: data.message,
        });

        if (onSend && data.approvalId) {
          onSend(data.approvalId);
        }
      } else {
        setResult({
          success: false,
          error: data.error || '送信に失敗しました',
        });
      }
    } catch (error) {
      console.error('Send approval request error:', error);
      setResult({
        success: false,
        error: '予期しないエラーが発生しました',
      });
    } finally {
      setIsSending(false);
    }
  }, [
    selectedApprovers,
    specSheetData,
    requester,
    title,
    description,
    deadline,
    onSend,
  ]);

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-600" />
          承認リクエスト送信
        </h2>
        <p className="text-gray-600 mt-2">
          仕様書「{specSheetData.specNumber} - {specSheetData.title}」の承認をリクエストします
        </p>
      </Card>

      {/* Spec Sheet Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          仕様書情報
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">仕様書番号:</span>
            <p className="font-medium">{specSheetData.specNumber}</p>
          </div>
          <div>
            <span className="text-gray-600">版数:</span>
            <p className="font-medium">{specSheetData.revision}</p>
          </div>
          <div>
            <span className="text-gray-600">カテゴリー:</span>
            <p className="font-medium">{specSheetData.category}</p>
          </div>
          <div>
            <span className="text-gray-600">ステータス:</span>
            <p className="font-medium">{specSheetData.status}</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm">
            <span className="font-medium">製品:</span> {specSheetData.product.name} |
            <span className="font-medium ml-2">顧客:</span> {specSheetData.customer.name}
          </p>
        </div>
      </Card>

      {/* Request Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">リクエスト詳細</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル
            </label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="仕様書承認リクエスト"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明（オプション）
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 border rounded-lg resize-none"
              placeholder="承認リクエストに関する補足情報..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              期限（オプション）
            </label>
            <Input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Approver Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          承認者選択
        </h3>

        {/* Available Approvers */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            利用可能な承認者
          </label>
          <div className="space-y-2">
            {availableApprovers.length === 0 ? (
              <p className="text-gray-500 text-sm">
                利用可能な承認者がいません
              </p>
            ) : (
              availableApprovers
                .filter(
                  approver =>
                    !selectedApprovers.find(
                      selected => selected.userId === approver.userId
                    )
                )
                .map(approver => (
                  <div
                    key={approver.userId}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {approver.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{approver.name}</p>
                        <p className="text-sm text-gray-600">
                          {approver.title && `${approver.title} | `}
                          {approver.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addApprover(approver)}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      追加
                    </Button>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Selected Approvers */}
        {selectedApprovers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              選択した承認者 ({selectedApprovers.length}名)
            </label>
            <div className="space-y-2">
              {selectedApprovers.map((approver, index) => (
                <div
                  key={approver.userId}
                  className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{approver.name}</p>
                      <p className="text-sm text-gray-600">
                        {approver.title && `${approver.title} | `}
                        {approver.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeApprover(approver.userId)}
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Result Message */}
      {result && (
        <Card
          className={`p-4 ${
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <Check className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.success ? '送信成功' : 'エラー'}
              </p>
              <p
                className={`text-sm ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {result.success ? result.message : result.error}
              </p>
            </div>
            <button onClick={() => setResult(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSending}
          >
            キャンセル
          </Button>
        )}
        <Button
          onClick={handleSend}
          disabled={isSending || selectedApprovers.length === 0}
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              送信中...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              承認リクエスト送信
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Inline Approver Selection Component
// ============================================================

interface ApproverSelectorProps {
  availableApprovers: Approver[];
  selectedApprovers: Approver[];
  onAdd: (approver: Approver) => void;
  onRemove: (userId: string) => void;
  readOnly?: boolean;
}

export function ApproverSelector({
  availableApprovers,
  selectedApprovers,
  onAdd,
  onRemove,
  readOnly = false,
}: ApproverSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        承認者
      </label>

      {/* Selected Approvers Pills */}
      {selectedApprovers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedApprovers.map(approver => (
            <span
              key={approver.userId}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              <Mail className="w-3 h-3" />
              {approver.name}
              {!readOnly && (
                <button
                  onClick={() => onRemove(approver.userId)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Add Approver Dropdown */}
      {!readOnly && (
        <select
          className="w-full p-2 border rounded-lg"
          onChange={e => {
            const approver = availableApprovers.find(
              a => a.userId === e.target.value
            );
            if (approver) {
              onAdd(approver);
            }
          }}
          value=""
        >
          <option value="">承認者を追加...</option>
          {availableApprovers
            .filter(
              approver =>
                !selectedApprovers.find(
                  selected => selected.userId === approver.userId
                )
            )
            .map(approver => (
              <option key={approver.userId} value={approver.userId}>
                {approver.title ? `${approver.title} - ` : ''}
                {approver.name} ({approver.email})
              </option>
            ))}
        </select>
      )}
    </div>
  );
}
