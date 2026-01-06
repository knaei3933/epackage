'use client';

/**
 * Contract Completion Notification System Component
 *
 * 契約完了通知システムコンポーネント
 * - 契約完了時の通知送信
 * - 証明書配信
 * - メール・プッシュ通知
 * - 通知履歴管理
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  Mail,
  Send,
  Check,
  AlertCircle,
  Loader2,
  Bell,
  FileText,
  Download,
  Eye,
  X,
  Users,
  Clock,
  RefreshCw,
  Settings,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface ContractNotificationProps {
  contractId: string;
  contractNumber: string;
  contractData: {
    sellerName: string;
    buyerName: string;
    sellerEmail?: string;
    buyerEmail?: string;
  };
  onSend?: (result: NotificationResult) => void;
  className?: string;
}

export interface NotificationResult {
  success: boolean;
  sentAt: string;
  recipients: NotificationRecipient[];
  certificateUrl?: string;
  error?: string;
}

interface NotificationRecipient {
  type: 'seller' | 'buyer' | 'admin';
  name: string;
  email: string;
  sent: boolean;
  sentAt?: string;
  error?: string;
}

interface NotificationPreferences {
  emailSeller: boolean;
  emailBuyer: boolean;
  emailAdmin: boolean;
  sendCertificate: boolean;
  includeSummary: boolean;
  customMessage?: string;
}

interface NotificationHistoryItem {
  id: string;
  type: 'email' | 'push' | 'sms';
  recipient: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
}

// ============================================================
// Component
// ============================================================

export default function ContractNotification({
  contractId,
  contractNumber,
  contractData,
  onSend,
  className = '',
}: ContractNotificationProps) {
  // State
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailSeller: true,
    emailBuyer: true,
    emailAdmin: true,
    sendCertificate: true,
    includeSummary: true,
    customMessage: '',
  });

  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<NotificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);

  // ============================================================
  // Data Fetching
  // ============================================================

  useEffect(() => {
    if (showHistory) {
      fetchNotificationHistory();
    }
  }, [showHistory]);

  const fetchNotificationHistory = async () => {
    try {
      const response = await fetch(`/api/contract/notifications/history?contractId=${contractId}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch notification history:', err);
    }
  };

  // ============================================================
  // Handlers
  // ============================================================

  const handleSendNotification = useCallback(async () => {
    setIsSending(true);
    setError(null);
    setResult(null);

    try {
      const recipients: NotificationRecipient[] = [];

      // Build recipient list
      if (preferences.emailSeller && contractData.sellerEmail) {
        recipients.push({
          type: 'seller',
          name: contractData.sellerName,
          email: contractData.sellerEmail,
          sent: false,
        });
      }

      if (preferences.emailBuyer && contractData.buyerEmail) {
        recipients.push({
          type: 'buyer',
          name: contractData.buyerName,
          email: contractData.buyerEmail,
          sent: false,
        });
      }

      if (preferences.emailAdmin) {
        recipients.push({
          type: 'admin',
          name: '管理者',
          email: 'admin@epackage-lab.com',
          sent: false,
        });
      }

      if (recipients.length === 0) {
        throw new Error('通知先が選択されていません');
      }

      // Send notification request
      const response = await fetch('/api/contract/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId,
          contractNumber,
          recipients,
          preferences,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as { success: boolean; result?: NotificationResult; error?: string };

      if (!data.success || !data.result) {
        throw new Error(data.error || '通知の送信に失敗しました');
      }

      setResult(data.result);

      if (onSend) {
        onSend(data.result);
      }

      // Refresh history
      await fetchNotificationHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsSending(false);
    }
  }, [contractId, contractNumber, contractData, preferences, onSend]);

  const handleResendToRecipient = async (recipient: NotificationRecipient) => {
    setError(null);

    try {
      const response = await fetch('/api/contract/notifications/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId,
          recipient,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '再送に失敗しました');
      }

      // Refresh history
      await fetchNotificationHistory();

      // Update result if exists
      if (result) {
        const updatedRecipients = result.recipients.map((r) =>
          r.email === recipient.email ? { ...r, sent: true, sentAt: new Date().toISOString() } : r
        );

        setResult({
          ...result,
          recipients: updatedRecipients,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    }
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Notification Settings Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                完了通知送信
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                契約完了時の通知送信・証明書配信
              </p>
            </div>

            {/* Settings Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? (
                <>
                  <Settings className="w-4 h-4 mr-1" />
                  設定
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-1" />
                  履歴
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Contract Info */}
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <FileText className="w-4 h-4" />
              契約書情報
            </div>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <div>
                <span className="text-gray-500">契約番号:</span>
                <p className="font-mono">{contractNumber}</p>
              </div>
              <div>
                <span className="text-gray-500">契約ID:</span>
                <p className="font-mono">{contractId}</p>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4" />
              通知先設定
            </h4>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-white border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={preferences.emailSeller}
                  onChange={(e) =>
                    setPreferences({ ...preferences, emailSeller: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">販売者へ通知</p>
                  <p className="text-xs text-gray-500">
                    {contractData.sellerName} ({contractData.sellerEmail || 'メール未設定'})
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-white border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={preferences.emailBuyer}
                  onChange={(e) =>
                    setPreferences({ ...preferences, emailBuyer: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">購入者へ通知</p>
                  <p className="text-xs text-gray-500">
                    {contractData.buyerName} ({contractData.buyerEmail || 'メール未設定'})
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-white border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={preferences.emailAdmin}
                  onChange={(e) =>
                    setPreferences({ ...preferences, emailAdmin: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">管理者へ通知</p>
                  <p className="text-xs text-gray-500">admin@epackage-lab.com</p>
                </div>
              </label>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">追加オプション</h4>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.sendCertificate}
                onChange={(e) =>
                  setPreferences({ ...preferences, sendCertificate: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm">契約証明書を添付</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.includeSummary}
                onChange={(e) =>
                  setPreferences({ ...preferences, includeSummary: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm">契約概要を含める</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カスタムメッセージ（オプション）
              </label>
              <textarea
                value={preferences.customMessage}
                onChange={(e) =>
                  setPreferences({ ...preferences, customMessage: e.target.value })
                }
                rows={2}
                className="w-full p-2 border rounded-lg text-sm"
                placeholder="通知に追加するメッセージ..."
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-green-800">通知を送信しました</p>
                    <p className="text-xs text-green-700 mt-1">
                      送信日時: {new Date(result.sentAt).toLocaleString('ja-JP')}
                    </p>
                  </div>

                  {/* Recipients Status */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-green-900">送信状況:</p>
                    {result.recipients.map((recipient, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-xs p-2 bg-white rounded border"
                      >
                        <div>
                          <p className="font-medium">{recipient.name}</p>
                          <p className="text-gray-600">{recipient.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {recipient.sent ? (
                            <span className="text-green-600">送信済み</span>
                          ) : (
                            <>
                              <span className="text-red-600">失敗</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResendToRecipient(recipient)}
                                className="h-6 px-2 text-xs"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                再送
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Certificate Link */}
                  {result.certificateUrl && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Download className="w-4 h-4 text-green-700" />
                      <a
                        href={result.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-700 hover:underline"
                      >
                        契約証明書をダウンロード
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Send Button */}
          <Button
            onClick={handleSendNotification}
            disabled={isSending}
            className="w-full"
            size="lg"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                送信中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                通知を送信
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notification History */}
      {showHistory && (
        <Card>
          <CardHeader className="pb-4">
            <h4 className="text-md font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              通知履歴
            </h4>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                履歴がありません
              </p>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      item.status === 'sent'
                        ? 'bg-green-50 border-green-200'
                        : item.status === 'failed'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.type === 'email' && <Mail className="w-4 h-4 text-gray-600" />}
                      <div>
                        <p className="text-sm font-medium">{item.recipient}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(item.sentAt).toLocaleString('ja-JP')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'sent' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : item.status === 'failed' ? (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-xs">
                        {item.status === 'sent'
                          ? '送信済み'
                          : item.status === 'failed'
                            ? '失敗'
                            : '送信中'}
                      </span>
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
