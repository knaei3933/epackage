/**
 * Admin Approvals Client Component
 *
 * 管理者承認ページ - クライアントコンポーネント
 * - インタラクティブ操作（承認・拒否）を処理
 * - Server Componentから初期データを受け取る
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  StatusBadge,
  EmptyState,
  LoadingSpinner,
  Textarea,
} from '@/components/ui';

// ============================================================
// Types
// ============================================================

interface PendingMember {
  id: string;
  email: string;
  user_type: 'B2C' | 'B2B' | null;
  business_type: 'INDIVIDUAL' | 'CORPORATION' | 'SOLE_PROPRIETOR' | null;
  company_name: string | null;
  legal_entity_number: string | null;
  kanji_last_name: string;
  kanji_first_name: string;
  kana_last_name: string;
  kana_first_name: string;
  corporate_phone: string | null;
  personal_phone: string | null;
  postal_code: string | null;
  prefecture: string | null;
  city: string | null;
  street: string | null;
  business_document_path: string | null;
  position: string | null;
  department: string | null;
  company_url: string | null;
  product_category: string | null;
  acquisition_channel: string | null;
  created_at: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

interface ApprovalResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface FetchPendingMembersResponse {
  success: boolean;
  data?: PendingMember[];
  error?: string;
}

interface AuthContext {
  userId: string;
  role: 'ADMIN' | 'OPERATOR' | 'SALES' | 'ACCOUNTING';
  userName: string;
  isDevMode: boolean;
}

interface AdminApprovalsClientProps {
  authContext: AuthContext;
}

// ============================================================
// Constants
// ============================================================

const USER_TYPE_LABELS: Record<string, string> = {
  B2B: '法人会員',
  B2C: '個人会員',
};

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  CORPORATION: '株式会社',
  INDIVIDUAL: '個人',
  SOLE_PROPRIETOR: '個人事業主',
};

const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  COSMETICS: '化粧品',
  CLOTHING: '衣料品',
  ELECTRONICS: '電子機器',
  KITCHEN: 'キッチン用品',
  FURNITURE: '家具',
  OTHER: 'その他',
};

const ACQUISITION_CHANNEL_LABELS: Record<string, string> = {
  web_search: '検索エンジン',
  social_media: 'SNS',
  referral: '紹介',
  exhibition: '展示会',
  advertisement: '広告',
  other: 'その他',
};

// ============================================================
// Component
// ============================================================

export default function AdminApprovalsClient({ authContext }: AdminApprovalsClientProps) {
  const [rejectUserId, setRejectUserId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch pending members on mount
  useEffect(() => {
    const fetchPendingMembers = async () => {
      try {
        const response = await fetch('/api/admin/approve-member', {
          credentials: 'include',
        });
        const data: FetchPendingMembersResponse = await response.json();
        if (data.success) {
          setPendingMembers(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch pending members:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPendingMembers();
  }, []);

  // ============================================================
  // Action Handlers
  // ============================================================

  const handleApprove = async (userId: string) => {
    setIsProcessing(userId);
    try {
      const response = await fetch('/api/admin/approve-member', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'approve' }),
      });

      const result: ApprovalResponse = await response.json();

      if (result.success) {
        setToast({ type: 'success', message: '会員を承認しました' });
        // Remove approved user from list
        setPendingMembers(prev => prev.filter(m => m.id !== userId));
      } else {
        setToast({ type: 'error', message: result.error || '承認に失敗しました' });
      }
    } catch {
      setToast({ type: 'error', message: 'エラーが発生しました' });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (userId: string) => {
    setIsProcessing(userId);
    try {
      const response = await fetch('/api/admin/approve-member', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'reject',
          reason: rejectReason || undefined,
        }),
      });

      const result: ApprovalResponse = await response.json();

      if (result.success) {
        setToast({ type: 'success', message: '会員を拒否しました' });
        setRejectUserId(null);
        setRejectReason('');
        // Remove rejected user from list
        setPendingMembers(prev => prev.filter(m => m.id !== userId));
      } else {
        setToast({ type: 'error', message: result.error || '拒否に失敗しました' });
      }
    } catch {
      setToast({ type: 'error', message: 'エラーが発生しました' });
    } finally {
      setIsProcessing(null);
    }
  };

  // ============================================================
  // Render Helpers
  // ============================================================

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPhoneNumber = (phone?: string | null) => {
    if (!phone) return '-';
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  };

  // ============================================================
  // Render
  // ============================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              会員承認待ち
            </h1>
            <p className="text-gray-500 mt-1">
              {pendingMembers.length}件の承認待ちがあります
            </p>
          </div>
        </div>

        {/* Pending Members List */}
        {pendingMembers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                title="承認待ちがありません"
                description="現在、承認待ちの会員登録はありません。"
                icon={
                  <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden">
                <CardHeader className="border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {member.company_name || `${member.kanji_last_name} ${member.kanji_first_name}`}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {member.email}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {member.user_type && (
                        <Badge variant="secondary">
                          {USER_TYPE_LABELS[member.user_type]}
                        </Badge>
                      )}
                      <StatusBadge.Processing>
                        承認待ち
                      </StatusBadge.Processing>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-4">
                  {/* Business Type */}
                  {member.business_type && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-500">種別</span>
                      <span className="text-sm font-medium">
                        {BUSINESS_TYPE_LABELS[member.business_type] || member.business_type}
                      </span>
                    </div>
                  )}

                  {/* Representative Name */}
                  {member.representative_name && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-500">代表者名</span>
                      <span className="text-sm font-medium">{member.representative_name}</span>
                    </div>
                  )}

                  {/* Contact Person */}
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-500">担当者名</span>
                    <span className="text-sm font-medium">
                      {member.kanji_last_name} {member.kanji_first_name}
                      {' '}
                      <span className="text-gray-400">
                        ({member.kana_last_name} {member.kana_first_name})
                      </span>
                    </span>
                  </div>

                  {/* Position & Department */}
                  {(member.position || member.department) && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-500">役職</span>
                      <span className="text-sm font-medium">
                        {[member.position, member.department].filter(Boolean).join(' / ')}
                      </span>
                    </div>
                  )}

                  {/* Corporate Number */}
                  {member.legal_entity_number && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-500">法人番号</span>
                      <span className="text-sm font-medium font-mono">{member.legal_entity_number}</span>
                    </div>
                  )}

                  {/* Corporate Phone */}
                  {member.corporate_phone && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-500">会社電話番号</span>
                      <span className="text-sm font-medium">
                        {formatPhoneNumber(member.corporate_phone)}
                      </span>
                    </div>
                  )}

                  {/* Personal Phone */}
                  {member.personal_phone && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-500">携帯電話</span>
                      <span className="text-sm font-medium">
                        {formatPhoneNumber(member.personal_phone)}
                      </span>
                    </div>
                  )}

                  {/* Postal Code */}
                  {member.postal_code && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-500">郵便番号</span>
                      <span className="text-sm font-medium font-mono">{member.postal_code}</span>
                    </div>
                  )}

                  {/* Address */}
                  {(member.prefecture || member.city || member.street) && (
                    <div className="flex justify-between items-start py-2 border-b">
                      <span className="text-sm text-gray-500">住所</span>
                      <span className="text-sm font-medium text-right max-w-xs">
                        〒{member.postal_code || ''}
                        {[member.prefecture, member.city, member.street]
                          .filter(Boolean)
                          .join('')}
                      </span>
                    </div>
                  )}

                  {/* Company URL */}
                  {member.company_url && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-500">会社URL</span>
                      <a
                        href={member.company_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline truncate max-w-xs"
                      >
                        {member.company_url}
                      </a>
                    </div>
                  )}

                  {/* Product Category */}
                  {member.product_category && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-500">業種</span>
                      <span className="text-sm font-medium">
                        {PRODUCT_CATEGORY_LABELS[member.product_category] || member.product_category}
                      </span>
                    </div>
                  )}

                  {/* Acquisition Channel */}
                  {member.acquisition_channel && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-500">知ったきっかけ</span>
                      <span className="text-sm font-medium">
                        {ACQUISITION_CHANNEL_LABELS[member.acquisition_channel] || member.acquisition_channel}
                      </span>
                    </div>
                  )}

                  {/* Founded Year */}
                  {member.founded_year && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-500">設立年</span>
                      <span className="text-sm font-medium">{member.founded_year}年</span>
                    </div>
                  )}

                  {/* Capital */}
                  {member.capital && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-500">資本金</span>
                      <span className="text-sm font-medium">{member.capital}</span>
                    </div>
                  )}

                  {/* Applied Date */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">申請日</span>
                    <span className="text-sm font-medium">{formatDate(member.created_at)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => handleApprove(member.id)}
                      disabled={isProcessing === member.id}
                    >
                      {isProcessing === member.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          承認
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => setRejectUserId(member.id)}
                      disabled={isProcessing === member.id}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      拒否
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reject Confirmation Modal */}
        {rejectUserId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>拒否の確認</CardTitle>
                <CardDescription>
                  この会員登録を拒否しますか？
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="拒否理由（任意）"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setRejectUserId(null);
                      setRejectReason('');
                    }}
                  >
                    キャンセル
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(rejectUserId)}
                    disabled={isProcessing !== null}
                  >
                    {isProcessing ? <LoadingSpinner size="sm" /> : '拒否する'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
