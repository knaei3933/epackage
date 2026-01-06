/**
 * B2B Admin Approval Dashboard
 *
 * B2B 관리자 승인 대시보드 컴포넌트입니다.
 * - PENDING 상태 회원 목록 조회
 * - 회원 승인/거부 처리
 * - 상세 정보 보기
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Button, Card } from '@/components/ui';

// ============================================================
// Types
// ============================================================

interface PendingUser {
  id: string;
  email: string;
  user_type: string;
  business_type: string;
  company_name: string;
  corporate_number?: string;
  founded_year?: string;
  capital?: string;
  representative_name?: string;
  kanji_last_name: string;
  kanji_first_name: string;
  kana_last_name: string;
  kana_first_name: string;
  corporate_phone: string;
  postal_code?: string;
  prefecture: string;
  city: string;
  street: string;
  building?: string;
  business_document_path?: string;
  created_at: string;
}

interface ApprovalDashboardProps {
  currentUserId: string;
}

// ============================================================
// Component
// ============================================================

export default function B2BApprovalDashboard({ currentUserId }: ApprovalDashboardProps) {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load pending users
  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/b2b/admin/pending-users');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load pending users');
      }

      setPendingUsers(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/b2b/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve user');
      }

      setSuccessMessage('ユーザーを承認しました。');
      loadPendingUsers();
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve user');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    if (!confirm('本当に拒否しますか？')) return;

    setProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/b2b/admin/reject-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject user');
      }

      setSuccessMessage('ユーザーを拒否しました。');
      loadPendingUsers();
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject user');
    } finally {
      setProcessing(false);
    }
  };

  const getBusinessTypeLabel = (type: string) => {
    switch (type) {
      case 'CORPORATION':
        return '법인사업자';
      case 'SOLE_PROPRIETOR':
        return '개인사업자';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            会員登録承認待ち
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            B2B会員登録申請の承認・拒否を行います
          </p>
        </div>
        <Button onClick={loadPendingUsers} variant="outline" disabled={loading}>
          {loading ? '読み込み中...' : '更新'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && pendingUsers.length === 0 && (
        <Card className="p-12 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            承認待ちのユーザーはいません
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            新しい会員登録申請はここに表示されます
          </p>
        </Card>
      )}

      {/* Pending Users List */}
      {!loading && pendingUsers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              申請一覧 ({pendingUsers.length}件)
            </h3>
            {pendingUsers.map((user) => (
              <Card
                key={user.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedUser?.id === user.id
                    ? 'border-brixa-500 bg-brixa-50 dark:bg-brixa-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="font-semibold text-gray-900 dark:text-white">
                  {user.company_name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getBusinessTypeLabel(user.business_type)}
                </div>
                <div className="text-xs text-gray-500">
                  申請日: {new Date(user.created_at).toLocaleDateString('ja-JP')}
                </div>
              </Card>
            ))}
          </div>

          {/* User Details */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <Card className="p-6">
                <div className="space-y-6">
                  {/* Company Info */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      会社情報
                    </h4>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-gray-500">会社名</dt>
                        <dd className="text-gray-900 dark:text-white font-medium">
                          {selectedUser.company_name}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">業態</dt>
                        <dd className="text-gray-900 dark:text-white font-medium">
                          {getBusinessTypeLabel(selectedUser.business_type)}
                        </dd>
                      </div>
                      {selectedUser.corporate_number && (
                        <div>
                          <dt className="text-gray-500">法人番号</dt>
                          <dd className="text-gray-900 dark:text-white font-medium">
                            {selectedUser.corporate_number}
                          </dd>
                        </div>
                      )}
                      {selectedUser.founded_year && (
                        <div>
                          <dt className="text-gray-500">設立年度</dt>
                          <dd className="text-gray-900 dark:text-white font-medium">
                            {selectedUser.founded_year}年
                          </dd>
                        </div>
                      )}
                      {selectedUser.capital && (
                        <div>
                          <dt className="text-gray-500">資本金</dt>
                          <dd className="text-gray-900 dark:text-white font-medium">
                            {selectedUser.capital}
                          </dd>
                        </div>
                      )}
                      {selectedUser.representative_name && (
                        <div>
                          <dt className="text-gray-500">代表者名</dt>
                          <dd className="text-gray-900 dark:text-white font-medium">
                            {selectedUser.representative_name}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      担当者情報
                    </h4>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-gray-500">氏名</dt>
                        <dd className="text-gray-900 dark:text-white font-medium">
                          {selectedUser.kanji_last_name} {selectedUser.kanji_first_name}
                          <br />
                          <span className="text-gray-500">
                            ({selectedUser.kana_last_name} {selectedUser.kana_first_name})
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">メールアドレス</dt>
                        <dd className="text-gray-900 dark:text-white font-medium">
                          {selectedUser.email}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">電話番号</dt>
                        <dd className="text-gray-900 dark:text-white font-medium">
                          {selectedUser.corporate_phone}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">住所</dt>
                        <dd className="text-gray-900 dark:text-white font-medium">
                          〒{selectedUser.postal_code}
                          <br />
                          {selectedUser.prefecture}{selectedUser.city}{selectedUser.street}
                          {selectedUser.building && ` ${selectedUser.building}`}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Document */}
                  {selectedUser.business_document_path && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        提出書類
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedUser.business_document_path, '_blank')}
                      >
                        📄 事業登録証明書を表示
                      </Button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(selectedUser.id)}
                      disabled={processing}
                      className="flex-1"
                    >
                      {processing ? '処理中...' : '✅ 承認する'}
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedUser.id, '管理员拒绝')}
                      variant="destructive"
                      disabled={processing}
                      className="flex-1"
                    >
                      {processing ? '処理中...' : '❌ 拒否する'}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 11zm-3 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  ユーザーを選択してください
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  左のリストから詳細を表示したいユーザーを選択してください
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
