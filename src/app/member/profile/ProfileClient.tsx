/**
 * Profile Page Client Component
 *
 * 会員プロフィール表示ページのクライアントコンポーネント
 * - プロフィール情報の表示
 * - 編集ページへのナビゲーション
 * - サーバーコンポーネントからユーザーデータを受け取る
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { useToastContext } from '@/components/ui/Toast';
import {
  BusinessType,
  type User,
  type UserEditableFields,
} from '@/types/auth';
import { getProductCategoryLabel } from '@/types/enums';

// =====================================================
// Types
// =====================================================

export interface ProfileClientProps {
  userId: string;
  userEmail: string;
  userName: string;
  userLastName: string;
  userFirstName: string;
  userKanaLastName?: string;
  userKanaFirstName?: string;
  userCompanyName?: string;
  userPosition?: string;
  userDepartment?: string;
  userCompanyUrl?: string;
  userCorporatePhone?: string;
  userPersonalPhone?: string;
  userFax?: string;
  userPostalCode?: string;
  userPrefecture?: string;
  userCity?: string;
  userStreet?: string;
  userProductCategory?: string;
  userBusinessType?: string;
  userRole: string;
  userStatus: string;
  userCreatedAt: string;
  userLastLoginAt?: string;
  // AuthContext の updateProfile を wrapper 経由で注入
  updateProfile: (updates: Partial<UserEditableFields>) => Promise<void>;
}

// 連絡先フォーム（電話番号・FAX のみ編集可能・EditClient と同一構造）
interface ProfileFormData {
  corporatePhone: string;
  personalPhone: string;
  fax: string;
}

// =====================================================
// Constants
// =====================================================

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '管理者',
  MEMBER: '会員',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: '承認待ち', color: 'bg-warning-100 text-warning-800' },
  ACTIVE: { label: '有効', color: 'bg-success-100 text-success-800' },
  SUSPENDED: { label: '停止', color: 'bg-error-100 text-error-800' },
  DELETED: { label: '削除', color: 'bg-bg-muted text-text-muted' },
};

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL: '個人',
  CORPORATION: '法人',
};

// =====================================================
// Component
// =====================================================

export function ProfileClient({
  userId,
  userEmail,
  userName,
  userLastName,
  userFirstName,
  userKanaLastName,
  userKanaFirstName,
  userCompanyName,
  userPosition,
  userDepartment,
  userCompanyUrl,
  userCorporatePhone,
  userPersonalPhone,
  userFax,
  userPostalCode,
  userPrefecture,
  userCity,
  userStreet,
  userProductCategory,
  userBusinessType,
  userRole,
  userStatus,
  userCreatedAt,
  userLastLoginAt,
  updateProfile,
}: ProfileClientProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  const [isSaving, setIsSaving] = useState(false);

  // 連絡先フォーム（電話番号・FAX のみ編集可能・EditClient から移管）
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    corporatePhone: userCorporatePhone || '',
    personalPhone: userPersonalPhone || '',
    fax: userFax || '',
  });
  const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});

  // props 変更時にフォーム状態へ同期
  useEffect(() => {
    setProfileForm({
      corporatePhone: userCorporatePhone || '',
      personalPhone: userPersonalPhone || '',
      fax: userFax || '',
    });
  }, [userCorporatePhone, userPersonalPhone, userFax]);

  // Display name helper
  const displayName = `${userLastName || ''} ${userFirstName || ''}`.trim() || userEmail;

  // プロフィールバリデーション（電話番号・FAX番号の形式チェック・EditClient と同一ロジック）
  const validateProfile = (): boolean => {
    const phoneRe = /^\d{2,4}-?\d{2,4}-?\d{3,4}$/;
    const errors: Partial<Record<keyof ProfileFormData, string>> = {};
    if (profileForm.corporatePhone && !phoneRe.test(profileForm.corporatePhone)) {
      errors.corporatePhone = '有効な電話番号の形式ではありません。';
    }
    if (profileForm.personalPhone && !phoneRe.test(profileForm.personalPhone)) {
      errors.personalPhone = '有効な電話番号の形式ではありません。';
    }
    if (profileForm.fax && !phoneRe.test(profileForm.fax)) {
      errors.fax = '有効なFAX番号の形式ではありません。';
    }
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 連絡先更新（電話番号・FAX のみ）
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfile()) {
      return;
    }

    setIsSaving(true);

    try {
      // 連絡先3項目をそのまま送信（空文字 = 削除・SoT: route.ts の `|| null` と整合）
      await updateProfile({
        corporatePhone: profileForm.corporatePhone,
        personalPhone: profileForm.personalPhone,
        fax: profileForm.fax,
      });

      showSuccess('連絡先を更新しました');
    } catch (err) {
      console.error('Failed to update profile:', err);
      showError('連絡先の更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg-secondary py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              マイページ
            </h1>
            <p className="text-text-muted">
              会員情報を確認できます。
            </p>
          </div>
        </div>

        {/* Profile Overview Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brixa-400 to-brixa-600 flex items-center justify-center text-white text-2xl font-bold">
                  {userLastName?.[0] || userEmail?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">
                    {displayName} 様
                  </h2>
                  <p className="text-text-muted">{userEmail}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={userStatus === 'ACTIVE' ? 'success' : 'warning'}>
                  {STATUS_LABELS[userStatus]?.label || userStatus}
                </Badge>
                <Badge variant="info">
                  {ROLE_LABELS[userRole] || userRole}
                </Badge>
                {userBusinessType && (
                  <Badge variant="secondary">
                    {BUSINESS_TYPE_LABELS[userBusinessType]}
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-text-muted">登録日</p>
              <p className="text-text-primary">
                {new Date(userCreatedAt).toLocaleDateString('ja-JP')}
              </p>
              {userLastLoginAt && (
                <>
                  <p className="text-sm text-text-muted mt-2">最終ログイン</p>
                  <p className="text-text-primary">
                    {new Date(userLastLoginAt).toLocaleDateString('ja-JP')}
                  </p>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* =====================================================
            SECTION 1: 認証情報 (読み取り専用)
            ===================================================== */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              認証情報
            </h2>
            <span className="text-xs text-text-muted bg-bg-muted px-2 py-1 rounded">
              読み取り専用
            </span>
          </div>

          <div className="space-y-4">
            <Input
              label="メールアドレス"
              value={userEmail}
              disabled
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="姓（漢字）"
                value={userLastName || ''}
                disabled
              />
              <Input
                label="名（漢字）"
                value={userFirstName || ''}
                disabled
              />
              <Input
                label="姓（ひらがな）"
                value={userKanaLastName || ''}
                disabled
              />
              <Input
                label="名（ひらがな）"
                value={userKanaFirstName || ''}
                disabled
              />
            </div>

            <p className="text-sm text-text-muted mt-2">
              ※ これらの情報を変更する場合は、
              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/contact');
                }}
                className="text-brixa-500 hover:underline ml-1 cursor-pointer"
              >
                お問い合わせ
              </a>
              からご連絡ください。
            </p>
          </div>
        </Card>

        {/* =====================================================
            SECTION 2: 連絡先 (編集可能)
            ===================================================== */}
        <Card className="p-6 mb-6">
          <form onSubmit={handleProfileUpdate}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                連絡先（編集可能）
              </h2>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '変更を保存'}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="会社電話番号"
                  type="tel"
                  data-testid="company-phone-input"
                  value={profileForm.corporatePhone}
                  onChange={(e) => setProfileForm({ ...profileForm, corporatePhone: e.target.value })}
                  placeholder="例: 03-1234-5678"
                  error={profileErrors.corporatePhone}
                />
                <Input
                  label="携帯電話"
                  type="tel"
                  data-testid="personal-phone-input"
                  value={profileForm.personalPhone}
                  onChange={(e) => setProfileForm({ ...profileForm, personalPhone: e.target.value })}
                  placeholder="例: 090-1234-5678"
                  error={profileErrors.personalPhone}
                />
                <Input
                  label="FAX番号"
                  type="tel"
                  data-testid="fax-input"
                  value={profileForm.fax}
                  onChange={(e) => setProfileForm({ ...profileForm, fax: e.target.value })}
                  placeholder="例: 03-1234-4567"
                  error={profileErrors.fax}
                />
              </div>
            </div>
          </form>
        </Card>

        {/* =====================================================
            SECTION 3: 会社情報 (読み取り専用)
            ===================================================== */}
        {userBusinessType === BusinessType.CORPORATION && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              会社情報
            </h2>

            <div className="space-y-4">
              <Input
                label="会社名"
                value={userCompanyName || ''}
                disabled
                placeholder="未登録"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="役職"
                  value={userPosition || ''}
                  disabled
                  placeholder="未登録"
                />
                <Input
                  label="部署"
                  value={userDepartment || ''}
                  disabled
                  placeholder="未登録"
                />
              </div>

              <Input
                label="会社URL"
                type="url"
                value={userCompanyUrl || ''}
                disabled
                placeholder="未登録"
              />
            </div>
          </Card>
        )}

        {/* =====================================================
            SECTION 4: 住所 (読み取り専用・承認済み)
            ===================================================== */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              住所情報（承認済み）
            </h2>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
              変更には管理者承認が必要
            </span>
          </div>

          <div className="space-y-4">
            <Input
              label="郵便番号"
              value={userPostalCode || ''}
              disabled
              placeholder="未登録"
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                都道府県
              </label>
              <div className="w-full px-3 py-2 border border-border-medium rounded-md bg-bg-muted text-text-muted">
                {userPrefecture || '未登録'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="市区町村"
                value={userCity || ''}
                disabled
                placeholder="未登録"
              />
              <Input
                label="番地・建物名"
                value={userStreet || ''}
                disabled
                placeholder="未登録"
              />
            </div>

            <p className="text-sm text-text-muted mt-2">
              ※ 住所を変更する場合は、
              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/contact');
                }}
                className="text-primary hover:underline ml-1 cursor-pointer"
              >
                お問い合わせ
              </a>
              からご連絡ください。
            </p>
          </div>
        </Card>

        {/* =====================================================
            SECTION 5: 商品種別 (読み取り専用)
            ===================================================== */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            商品種別
          </h2>

          <div className="w-full px-3 py-2 border border-border-medium rounded-md bg-bg-muted text-text-muted">
            {getProductCategoryLabel(userProductCategory) || '未登録'}
          </div>
        </Card>

        {/* =====================================================
            Additional Actions
            ===================================================== */}
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            その他
          </h2>

          <div className="space-y-4">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => router.push('/member/settings#security')}
            >
              パスワード変更
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
