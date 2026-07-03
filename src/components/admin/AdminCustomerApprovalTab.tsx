/**
 * Admin Customer Approval Tab
 *
 * 管理者用顧客承認タブ
 * - 校正データの承認状況表示
 * - 顧客への承認リクエスト送信
 * - design_revisions の状況表示
 *
 * @client
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { CheckCircle, Clock, XCircle, Mail, ExternalLink, RefreshCw, Send } from 'lucide-react';
import type { Order as DashboardOrder } from '@/types/dashboard';

interface Revision {
  id: string;
  revision_number: number;
  approval_status: 'pending' | 'approved' | 'rejected';
  preview_image_url: string | null;
  created_at: string;
  responded_at: string | null;
}

interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requested_at: string;
  responded_at: string | null;
  response_notes: string | null;
}

interface AdminCustomerApprovalTabProps {
  orderId: string;
  order: DashboardOrder;
}

export function AdminCustomerApprovalTab({ orderId, order }: AdminCustomerApprovalTabProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approvals`);
      if (res.ok) {
        const data = await res.json();
        setRevisions(data.data?.revisions || []);
        setApprovals(data.data?.approvals || []);
      }
    } catch (err) {
      console.error('Failed to load approval data:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendApprovalRequest = async () => {
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '校正データの承認をお願いします',
          description: '校正データが準備されました。ご確認の上、承認または修正依頼をお願いいたします。',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: '承認リクエストを送信しました。' });
        loadData();
      } else {
        setMessage({ type: 'error', text: data.error || '送信に失敗しました。' });
      }
    } catch {
      setMessage({ type: 'error', text: '通信エラーが発生しました。' });
    } finally {
      setSending(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return '承認済み';
      case 'rejected':
        return '差し戻し';
      case 'pending':
        return '承認待ち';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>読み込み中...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 説明 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">顧客承認状況</h3>
        <p className="text-sm text-gray-600 mb-4">
          校正データの承認状況を確認し、顧客に承認リクエストを送信できます。
        </p>

        {/* 校正データ一覧 */}
        <div className="space-y-3 mb-4">
          <h4 className="text-sm font-semibold text-gray-700">校正データ（design_revisions）</h4>
          {revisions.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500">校正データがまだありません。「データ・校正管理」タブからアップロードしてください。</p>
            </div>
          ) : (
            revisions.map((rev) => (
              <div key={rev.id} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                {statusIcon(rev.approval_status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Rev.{rev.revision_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      rev.approval_status === 'approved' ? 'bg-green-100 text-green-700' :
                      rev.approval_status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {statusLabel(rev.approval_status)}
                    </span>
                  </div>
                  {rev.preview_image_url && (
                    <p className="text-xs text-gray-500 mt-1">プレビュー画像あり</p>
                  )}
                </div>
                {rev.preview_image_url && (
                  <a
                    href={rev.preview_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))
          )}
        </div>

        {/* 承認リクエスト履歴 */}
        {approvals.length > 0 && (
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-semibold text-gray-700">承認リクエスト履歴</h4>
            {approvals.map((req) => (
              <div key={req.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  {statusIcon(req.status)}
                  <span className="font-medium text-gray-900">{req.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    req.status === 'approved' ? 'bg-green-100 text-green-700' :
                    req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {statusLabel(req.status)}
                  </span>
                </div>
                {req.response_notes && (
                  <p className="text-sm text-gray-600 mt-1">顧客コメント: {req.response_notes}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 顧客ページへのリンク */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
            顧客承認ページ:
            <a
              href={`/member/orders/${orderId}/spec-approval`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              別タブで開く
            </a>
          </p>
        </div>

        {/* メッセージ */}
        {message && (
          <div className={`p-3 rounded-lg mb-3 text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-3">
          <button
            onClick={handleSendApprovalRequest}
            disabled={sending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            {sending ? '送信中...' : '顧客に承認依頼メールを送信'}
          </button>
        </div>
      </Card>
    </div>
  );
}
