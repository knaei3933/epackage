/**
 * Korea Send Section Component
 *
 * データ送信セクション
 * - 韓国パートナーへの送信
 * - 管理者メモ入力
 * - 送信ステータス表示
 * - コメント欄
 *
 * @client
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send, CheckCircle, AlertCircle, MessageSquare, Clock } from 'lucide-react';
import type { KoreaSendStatus } from './types';

interface KoreaSendSectionProps {
  orderId: string;
  adminNotes: string;
  onAdminNotesChange: (notes: string) => void;
  onUpdateNotes: () => void;
  onSendToKorea: () => void;
  sendingToKorea: boolean;
  koreaMessage: { type: 'success' | 'error'; text: string } | null;
  fetchFn?: typeof fetch;
}

export function KoreaSendSection({
  orderId,
  adminNotes,
  onAdminNotesChange,
  onUpdateNotes,
  onSendToKorea,
  sendingToKorea,
  koreaMessage,
  fetchFn = fetch,
}: KoreaSendSectionProps) {
  const [sendStatus, setSendStatus] = useState<KoreaSendStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSendStatus();
  }, [orderId]);

  const loadSendStatus = async () => {
    try {
      setLoading(true);
      const response = await fetchFn(`/api/admin/orders/${orderId}/korea-send-status`);

      // Check if response is OK
      if (!response.ok) {
        console.error('Failed to load send status:', response.status);
        return;
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid content type:', contentType);
        return;
      }

      const result = await response.json();
      if (result.success) {
        setSendStatus(result.status);
      }
    } catch (err) {
      console.error('Failed to load send status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              データを韓国パートナーに送信
            </h3>
            <p className="text-sm text-gray-600">
              入稿データを確認し、韓国パートナーに送信してください。
            </p>
          </div>

          {/* Status Display */}
          {sendStatus?.sent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">送信完了</span>
              </div>
              <div className="mt-2 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {new Date(sendStatus.sent_at!).toLocaleString('ja-JP')}
                </div>
                {sendStatus.message_sent && (
                  <p className="mt-1">メッセージ: {sendStatus.message_sent}</p>
                )}
              </div>
            </div>
          )}

          {/* Pre-send Checklist */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              送信前の確認事項
            </h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>入稿データ（AI）がアップロードされていること</li>
              <li>入金が確認されていること</li>
              <li>仕様が確定していること</li>
            </ul>
          </div>

          {/* Admin Notes */}
          <div>
            <label htmlFor="admin-notes-korea" className="block text-sm font-medium text-gray-700 mb-2">
              管理者メモ・送信メッセージ
            </label>
            <textarea
              id="admin-notes-korea"
              value={adminNotes}
              onChange={(e) => onAdminNotesChange(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="韓国パートナーへのメッセージを入力..."
              disabled={sendingToKorea}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onUpdateNotes}
              disabled={sendingToKorea}
              variant="outline"
            >
              メモを更新
            </Button>
            <Button
              onClick={onSendToKorea}
              disabled={sendingToKorea}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sendingToKorea ? '送信中...' : '韓国パートナーに送信'}
            </Button>
          </div>

          {/* Message Display */}
          {koreaMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              koreaMessage.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {koreaMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {koreaMessage.text}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
