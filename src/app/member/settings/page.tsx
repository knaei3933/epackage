/**
 * Member Settings Page
 *
 * 会員設定ページコンポーネントです。
 * - アカウント設定
 * - 通知設定
 * - セキュリティ設定
 * - 日本語UI
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Input, Button, Badge } from '@/components/ui';
import { PageLoadingState } from '@/components/ui';

// =====================================================
// Types
// =====================================================

interface NotificationSettings {
  email_notifications: boolean;
  order_updates: boolean;
  quotation_updates: boolean;
  shipment_notifications: boolean;
  production_updates: boolean;
  marketing_emails: boolean;
  login_notifications: boolean;
  security_alerts: boolean;
}

interface UserSettings {
  notifications: NotificationSettings;
  language: 'ja' | 'en' | 'ko';
  timezone: string;
}

// =====================================================
// Component
// =====================================================

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletionSummary, setDeletionSummary] = useState<any>(null);

  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email_notifications: true,
      order_updates: true,
      quotation_updates: true,
      shipment_notifications: true,
      production_updates: true,
      marketing_emails: false,
      login_notifications: true,
      security_alerts: true,
    },
    language: 'ja',
    timezone: 'Asia/Tokyo',
  });

  // NOTE: Authentication is handled by middleware server-side.
  // The client-side redirect is removed to prevent race conditions with AuthContext.
  // If user reaches this page unauthenticated, middleware will redirect to login.
  // The useEffect was causing premature redirects when AuthContext wasn't fully initialized.

  // Load settings on mount
  // Note: Always try to load settings - API handles auth via cookies
  // Don't gate on isAuthenticated to avoid race conditions with AuthContext
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Use credentials: include for cookie-based auth
        const response = await fetch('/api/member/settings', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSettings(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, []); // Empty deps - run once on mount, API handles auth via cookies

  // Handle notification setting change
  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] }
    }));
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Use credentials: include for cookie-based auth
      const response = await fetch('/api/member/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('設定の保存に失敗しました。');
      }

      setSaveMessage({ type: 'success', text: '設定を保存しました。' });
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'エラーが発生しました。',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Fetch deletion summary before showing confirmation
  const handleDeleteAccountClick = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch('/api/member/delete-account', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('削除情報の取得に失敗しました');
      }

      const summary = await response.json();
      setDeletionSummary(summary);
      setShowDeleteConfirm(true);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : 'エラーが発生しました'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirm account deletion
  const handleConfirmDelete = async () => {
    if (!deletionSummary?.canDelete) {
      setDeleteError(deletionSummary?.warning || 'アカウントを削除できません');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch('/api/member/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.reason || '削除に失敗しました');
      }

      // Show success message before redirecting
      setSaveMessage({
        type: 'success',
        text: 'アカウントを削除しました。まもなくリダイレクトします...'
      });

      // Sign out and redirect after a short delay
      setTimeout(async () => {
        await signOut();
        router.push('/');
      }, 2000);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : 'エラーが発生しました'
      );
      setIsDeleting(false);
    }
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletionSummary(null);
    setDeleteError(null);
  };

  // Extract display info - prefer user from AuthContext, fallback to defaults
  const displayEmail = user?.email || 'user@example.com';
  const displayLastName = user?.kanjiLastName || '';
  const displayFirstName = user?.kanjiFirstName || '';
  const displayUserId = user?.id || '';
  const displayCreatedAt = user?.createdAt || new Date().toISOString();
  const displayStatus = user?.status || 'ACTIVE';

  // Display name helper
  const displayName = `${displayLastName} ${displayFirstName}`.trim() || displayEmail;

  return (
    <PageLoadingState isLoading={isLoadingSettings} error={null} message="読み込み中...">
      <main className="min-h-screen bg-bg-secondary py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                設定
              </h1>
              <p className="text-text-muted">
                アカウント設定を変更できます。
              </p>
            </div>

            {/* Save message */}
            {saveMessage && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  saveMessage.type === 'success'
                    ? 'bg-success-50 text-success-700 border border-success-200'
                    : 'bg-error-50 text-error-700 border border-error-200'
                }`}
              >
                {saveMessage.text}
              </div>
            )}

            {/* =====================================================
                SECTION 1: アカウント情報 (読み取り専用)
                ===================================================== */}
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                アカウント情報
              </h2>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brixa-400 to-brixa-600 flex items-center justify-center text-white text-xl font-bold">
                  {displayLastName?.[0] || displayEmail[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-text-primary">{displayName} 様</p>
                  <p className="text-sm text-text-muted">{displayEmail}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">会員ID</span>
                  <span className="text-text-primary font-mono">{displayUserId ? `${displayUserId.slice(0, 8)}...` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">登録日</span>
                  <span className="text-text-primary">
                    {new Date(displayCreatedAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">ステータス</span>
                  <Badge variant={displayStatus === 'ACTIVE' ? 'success' : 'warning'}>
                    {displayStatus === 'ACTIVE' ? '有効' : displayStatus === 'PENDING' ? '承認待ち' : displayStatus}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* =====================================================
                SECTION 2: 通知設定
                ===================================================== */}
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                通知設定
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">見積更新通知</p>
                    <p className="text-sm text-text-muted">見積のステータス変更をメールでお知らせします</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.quotation_updates}
                      onChange={() => handleNotificationChange('quotation_updates')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brixa-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brixa-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">注文更新通知</p>
                    <p className="text-sm text-text-muted">注文のステータス変更をメールでお知らせします</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.order_updates}
                      onChange={() => handleNotificationChange('order_updates')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brixa-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brixa-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">配送通知</p>
                    <p className="text-sm text-text-muted">配送状況の更新をメールでお知らせします</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.shipment_notifications}
                      onChange={() => handleNotificationChange('shipment_notifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brixa-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brixa-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">生産進捗通知</p>
                    <p className="text-sm text-text-muted">生産状況の更新をメールでお知らせします</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.production_updates}
                      onChange={() => handleNotificationChange('production_updates')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brixa-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brixa-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">マーケティングメール</p>
                    <p className="text-sm text-text-muted">特別オファーや新商品情報をお送りします</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.marketing_emails}
                      onChange={() => handleNotificationChange('marketing_emails')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brixa-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brixa-500"></div>
                  </label>
                </div>
              </div>
            </Card>

            {/* =====================================================
                SECTION 3: セキュリティ設定
                ===================================================== */}
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                セキュリティ設定
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">ログイン通知</p>
                    <p className="text-sm text-text-muted">新しいログイン時にメール通知を送信</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.login_notifications}
                      onChange={() => handleNotificationChange('login_notifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brixa-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brixa-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary">セキュリティアラート</p>
                    <p className="text-sm text-text-muted">重要なセキュリティイベントをメールで通知</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.security_alerts}
                      onChange={() => handleNotificationChange('security_alerts')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brixa-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brixa-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between opacity-50">
                  <div>
                    <p className="font-medium text-text-primary">二要素認証</p>
                    <p className="text-sm text-text-muted">近日公開予定</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={false}
                      className="sr-only peer"
                      disabled
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brixa-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brixa-500 disabled:opacity-50"></div>
                  </label>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border-medium">
                <Button
                  variant="secondary"
                  onClick={() => router.push('/auth/reset-password')}
                  className="w-full sm:w-auto"
                >
                  パスワード変更
                </Button>
              </div>
            </Card>

            {/* =====================================================
                Action Buttons
                ===================================================== */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end mb-8">
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '変更を保存'}
              </Button>
            </div>

            {/* =====================================================
                SECTION 4: 危険なゾーン
                ===================================================== */}
            <Card className="p-6 border-error-200">
              <h2 className="text-lg font-semibold text-error-600 mb-2">
                アカウント削除
              </h2>
              <p className="text-sm text-text-muted mb-4">
                アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
              </p>

              {deleteError && (
                <div className="mb-4 p-3 bg-error-50 text-error-700 border border-error-200 rounded-md text-sm">
                  {deleteError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  className="border-error-300 text-error-600 hover:bg-error-50"
                >
                  ログアウト
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccountClick}
                  loading={isDeleting}
                  loadingText="確認中..."
                  disabled={isDeleting}
                >
                  アカウントを削除
                </Button>
              </div>
            </Card>

            {/* =====================================================
                削除確認モーダル
                ===================================================== */}
            {showDeleteConfirm && deletionSummary && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-text-primary mb-4">
                    アカウント削除の確認
                  </h3>

                  {!deletionSummary.canDelete ? (
                    <>
                      <p className="text-error-600 mb-4">
                        {deletionSummary.warning}
                      </p>
                      <div className="flex justify-end">
                        <Button
                          variant="secondary"
                          onClick={handleCancelDelete}
                        >
                          閉じる
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-text-primary mb-4">
                        本当にアカウントを削除しますか？以下のデータが削除されます：
                      </p>

                      <div className="bg-bg-secondary rounded-md p-4 mb-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-muted">サンプルリクエスト</span>
                          <span className="font-medium">{deletionSummary.sampleRequests} 件</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">通知</span>
                          <span className="font-medium">{deletionSummary.notifications} 件</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">契約書（下書き/却下）</span>
                          <span className="font-medium">{deletionSummary.contracts} 件</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">見積書</span>
                          <span className="font-medium">{deletionSummary.quotations} 件</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">注文（完了/キャンセル）</span>
                          <span className="font-medium">{deletionSummary.orders} 件</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">プロフィール</span>
                          <span className="font-medium">1 件</span>
                        </div>
                      </div>

                      {deletionSummary.activeOrders > 0 && (
                        <div className="bg-warning-50 text-warning-700 border border-warning-200 rounded-md p-3 mb-4 text-sm">
                          <p className="font-medium mb-1">⚠️ 進行中の注文があります</p>
                          <p>
                            {deletionSummary.activeOrders} 件の進行中の注文は削除されず、維持されます。
                          </p>
                        </div>
                      )}

                      <p className="text-sm text-text-muted mb-6">
                        この操作は取り消すことができません。
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <Button
                          variant="secondary"
                          onClick={handleCancelDelete}
                          disabled={isDeleting}
                        >
                          キャンセル
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleConfirmDelete}
                          loading={isDeleting}
                          loadingText="削除中..."
                          disabled={isDeleting}
                        >
                          アカウントを削除する
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Navigation links */}
            <div className="mt-8">
              <a
                href="/member/profile"
                className="text-sm text-text-muted hover:text-brixa-500 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/member/profile');
                }}
              >
                ← プロフィールへ
              </a>
            </div>
          </div>
        </main>
    </PageLoadingState>
  );
}
