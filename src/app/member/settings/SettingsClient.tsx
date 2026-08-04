/**
 * Settings Page Client Component
 *
 * 会員設定ページのクライアントコンポーネントです。
 * - すべてのインタラクティブな状態管理
 * - サーバーコンポーネントからユーザーデータを受け取る
 * - 通知設定の保存
 * - アカウント削除機能
 * - 日本語UI
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge, Input } from '@/components/ui';
import { PageLoadingState } from '@/components/ui';
import { useToastContext } from '@/components/ui/Toast';
import { fetchSettings as fetchSettingsAPI, updateSettings as updateSettingsAPI, deleteAccount as deleteAccountAPI } from '@/lib/api/member/settings';
import { getJson } from '@/lib/api-fetch';

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

// EditClient から移管: アカウント削除サマリー（any 廃止・明示的型）
interface DeletionSummary {
  sampleRequests: number;
  notifications: number;
  contracts: number;
  quotations: number;
  orders: number;
  activeOrders: number;
  canDelete: boolean;
  warning?: string;
}

// EditClient から移管: パスワード変更フォーム
interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SettingsClientProps {
  userId: string;
  userEmail: string;
  userName: string;
  userLastName: string;
  userFirstName: string;
  userCreatedAt: string;
  userStatus: string;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// =====================================================
// Component
// =====================================================

export function SettingsClient({
  userId,
  userEmail,
  userName,
  userLastName,
  userFirstName,
  userCreatedAt,
  userStatus,
  updatePassword,
  signOut,
}: SettingsClientProps) {
  const router = useRouter();
  const { showError } = useToastContext();

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Account deletion states（EditClient 2段階確認フローから移管・旧 state 完全置換）
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDoubleConfirmation, setShowDoubleConfirmation] = useState(false);
  const [deletionSummary, setDeletionSummary] = useState<DeletionSummary | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  // パスワードフォーム（EditClient から移管）
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof PasswordFormData, string>>>({});
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchSettingsAPI() as any;
        if (data.success && data.data) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

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
      await updateSettingsAPI(settings);

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

  // =====================================================
  // Password Handlers（EditClient から移管）
  // =====================================================

  // パスワードバリデーション（現在パスワード必須・8文字以上・一致チェック）
  const validatePassword = (): boolean => {
    const errors: Partial<Record<keyof PasswordFormData, string>> = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = '現在のパスワードを入力してください。';
    }
    if (passwordForm.newPassword && passwordForm.newPassword.length < 8) {
      errors.newPassword = 'パスワードは8文字以上で入力してください';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'パスワードが一致しません';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // パスワード更新
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage(null);

    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);

      setPasswordMessage({ type: 'success', text: 'パスワードを更新しました' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('Failed to update password:', err);
      setPasswordMessage({ type: 'error', text: 'パスワードの更新に失敗しました' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // =====================================================
  // Account Deletion Handlers（EditClient 2段階確認フローから移管）
  // =====================================================

  /**
   * 削除サマリーを取得して確認画面を表示
   */
  const fetchDeletionSummary = async () => {
    try {
      const summary = await getJson<DeletionSummary>('/api/member/delete-account');
      setDeletionSummary(summary);

      if (!summary.canDelete) {
        // canDelete === false（有効な契約あり）の場合は警告表示でブロック
        showError(summary.warning || 'アカウントを削除できません');
        return;
      }

      setShowDeleteConfirmation(true);
    } catch (err) {
      console.error('Failed to fetch deletion summary:', err);
      showError('削除サマリーの取得に失敗しました。時間をおいて再度お試しください。');
    }
  };

  /**
   * 第1段階: サマリー取得
   */
  const handleDeleteAccountFirstStep = async () => {
    await fetchDeletionSummary();
  };

  /**
   * 第2段階: 「DELETE」入力画面へ遷移
   */
  const handleDeleteAccountSecondStep = () => {
    setShowDoubleConfirmation(true);
  };

  /**
   * 最終確認: 削除実行
   */
  const handleDeleteAccountFinal = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      showError('「DELETE」と入力してください');
      return;
    }
    if (!deletePassword) {
      showError('確認のため、現在のパスワードを入力してください');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      // サーバーで currentPassword 再認証（パスワード変更と対称・なりすまし/CSRF 防衛）
      await deleteAccountAPI({ confirmation: 'DELETE', currentPassword: deletePassword });

      setSaveMessage({
        type: 'success',
        text: 'アカウントを削除しました。削除確認メールを送信いたしました。',
      });

      // 成功メッセージを2秒間表示してからサインアウト・遷移（旧 EditClient のパターンを踏襲）
      // 即座に signOut するとメッセージが見えなくなるため待機。
      await new Promise(resolve => setTimeout(resolve, 2000));

      // サインアウトしてホームへ遷移
      await signOut();
      router.push('/?accountDeleted=true');
    } catch (err) {
      console.error('Account deletion error:', err);
      // deleteAccountAPI は error_code ごとにユーザーフレンドリーなメッセージへ変換済み
      // （パスワード誤り＝「現在のパスワードが正しくありません。」など）
      const msg = err instanceof Error ? err.message : 'アカウント削除に失敗しました';
      setDeleteError(msg);
      showError(msg);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
      setShowDoubleConfirmation(false);
      setDeleteConfirmationText('');
      setDeletePassword('');
    }
  };

  /**
   * 削除フローをキャンセル
   */
  const handleCancelDeletion = () => {
    setShowDeleteConfirmation(false);
    setShowDoubleConfirmation(false);
    setDeleteConfirmationText('');
    setDeletePassword('');
    setDeletionSummary(null);
    setDeleteError(null);
  };

  // Display name helper - use props from server component
  const displayEmail = userEmail;
  const displayLastName = userLastName;
  const displayFirstName = userFirstName;
  const displayUserId = userId;
  const displayCreatedAt = userCreatedAt;
  const displayStatus = userStatus;
  const displayName = userName || displayEmail;

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
                  {displayLastName?.[0] || displayEmail?.[0]?.toUpperCase() || 'U'}
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
                SECTION 3: セキュリティ設定（パスワード変更を含む）
                ===================================================== */}
            <Card id="security" className="p-6 mb-6 scroll-mt-8">
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

              {/* パスワード変更フォーム（EditClient から移管） */}
              <div className="mt-6 pt-6 border-t border-border-medium">
                <h3 className="text-base font-semibold text-text-primary mb-4">
                  パスワード変更
                </h3>

                {passwordMessage && (
                  <div
                    className={`mb-4 p-3 rounded-md text-sm ${
                      passwordMessage.type === 'success'
                        ? 'bg-success-50 text-success-700 border border-success-200'
                        : 'bg-error-50 text-error-700 border border-error-200'
                    }`}
                  >
                    {passwordMessage.text}
                  </div>
                )}

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      現在のパスワード<span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="password"
                      data-testid="current-password-input"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="現在のパスワードを入力"
                      error={passwordErrors.currentPassword}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      新しいパスワード<span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="password"
                      data-testid="new-password-input"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="8文字以上"
                      error={passwordErrors.newPassword}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      パスワード確認<span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="password"
                      data-testid="confirm-password-input"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="同じパスワードを入力"
                      error={passwordErrors.confirmPassword}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" variant="primary" disabled={isUpdatingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}>
                      {isUpdatingPassword ? '更新中...' : 'パスワードを更新'}
                    </Button>
                  </div>
                </form>
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
                SECTION 4: アカウント削除（EditClient 2段階確認フローから移管）
                ===================================================== */}
            <Card className="p-6 border-red-200 bg-red-50">
              <h2 className="text-lg font-semibold text-red-700 mb-2">
                アカウント削除
              </h2>
              <p className="text-sm text-text-muted mb-4">
                アカウントを削除すると、全てのデータが完全に削除されます。この操作は取り消せません。
              </p>

              {deleteError && (
                <div className="mb-4 p-3 bg-error-50 text-error-700 border border-error-200 rounded-md text-sm">
                  {deleteError}
                </div>
              )}

              {/* canDelete === false の場合の警告表示（有効な契約あり） */}
              {!showDeleteConfirmation && !showDoubleConfirmation && deletionSummary && !deletionSummary.canDelete && (
                <div className="mb-4 p-3 bg-warning-50 text-warning-700 border border-warning-200 rounded-md text-sm">
                  {deletionSummary.warning}
                </div>
              )}

              {/* 初期状態 */}
              {!showDeleteConfirmation && !showDoubleConfirmation && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="secondary"
                    onClick={async () => { await signOut(); router.push('/'); }}
                    className="border-error-300 text-error-600 hover:bg-error-50"
                  >
                    ログアウト
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                    onClick={handleDeleteAccountFirstStep}
                    disabled={isDeleting}
                  >
                    アカウントを削除
                  </Button>
                </div>
              )}

              {/* 第1段階: サマリー表示 */}
              {showDeleteConfirmation && !showDoubleConfirmation && (
                <div className="space-y-4">
                  <div className="bg-white border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-700 mb-2">削除されるデータ</h3>
                    {deletionSummary && (
                      <ul className="text-sm space-y-1">
                        <li>• サンプル要求: {deletionSummary.sampleRequests}件</li>
                        <li>• 通知: {deletionSummary.notifications}件</li>
                        <li>• 契約（下書き・拒否）: {deletionSummary.contracts}件</li>
                        <li>• 見積もり（未承認）: {deletionSummary.quotations}件</li>
                        <li>• 注文（キャンセル・完了）: {deletionSummary.orders}件</li>
                      </ul>
                    )}
                    {deletionSummary && deletionSummary.activeOrders > 0 && (
                      <p className="text-sm text-amber-600 mt-2">
                        ⚠️ 進行中の注文 {deletionSummary.activeOrders}件 は維持されます
                      </p>
                    )}
                    <p className="text-xs text-text-muted mt-3">
                      ※有効な契約がある場合は削除できません
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                      onClick={handleDeleteAccountSecondStep}
                      disabled={isDeleting}
                    >
                      削除を確認
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelDeletion}
                      disabled={isDeleting}
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              )}

              {/* 第2段階: 「DELETE」入力 + 現在パスワード再入力による最終確認 */}
              {showDoubleConfirmation && (
                <div className="space-y-4">
                  <div className="bg-white border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-700 mb-2">最終確認</h3>
                    <p className="text-sm mb-3">
                      本当にアカウントを削除しますか？<br />
                      この操作は取り消すことができません。
                    </p>
                    <p className="text-sm font-medium mb-2">
                      確認のため、「DELETE」と入力してください：
                    </p>
                    <Input
                      type="text"
                      value={deleteConfirmationText}
                      onChange={(e) => setDeleteConfirmationText(e.target.value)}
                      placeholder="DELETE と入力"
                      className="max-w-xs"
                      disabled={isDeleting}
                    />
                    <p className="text-sm font-medium mb-2 mt-4">
                      本人確認のため、現在のパスワードを入力してください：
                    </p>
                    <Input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="現在のパスワード"
                      className="max-w-xs"
                      disabled={isDeleting}
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                      onClick={handleDeleteAccountFinal}
                      disabled={isDeleting || deleteConfirmationText !== 'DELETE' || !deletePassword}
                    >
                      {isDeleting ? '削除中...' : 'アカウントを削除する'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelDeletion}
                      disabled={isDeleting}
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              )}
            </Card>

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
