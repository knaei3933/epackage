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
  JAPANESE_PREFECTURES,
  isCompletePostalCode,
  normalizePostalCodeInput,
  POSTAL_CODE_PATTERN,
} from '@/lib/address/postal-code';
import { usePostalCodeLookup } from '@/hooks/usePostalCodeLookup';
import {
  BusinessType,
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
  completionMode?: boolean;
  returnTo?: string;
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

export interface ProfileCompletionFormData {
  kanjiLastName: string;
  kanjiFirstName: string;
  kanaLastName: string;
  kanaFirstName: string;
  corporatePhone: string;
  personalPhone: string;
  postalCode: string;
  prefecture: string;
  city: string;
  street: string;
}

type ProfileCompletionField = keyof ProfileCompletionFormData;

const COMPLETION_FIELD_TO_API: Record<ProfileCompletionField, string> = {
  kanjiLastName: 'kanji_last_name',
  kanjiFirstName: 'kanji_first_name',
  kanaLastName: 'kana_last_name',
  kanaFirstName: 'kana_first_name',
  corporatePhone: 'corporate_phone',
  personalPhone: 'personal_phone',
  postalCode: 'postal_code',
  prefecture: 'prefecture',
  city: 'city',
  street: 'street',
};

const safeReturnPath = (value?: string) => {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/samples';
  }
  return value;
};

export function ProfileClient({
  userEmail,
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
  completionMode = false,
  returnTo,
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
  const safeReturnTo = safeReturnPath(returnTo);
  const approvedCompletionValues: Record<ProfileCompletionField, string> = {
    kanjiLastName: userLastName || '',
    kanjiFirstName: userFirstName || '',
    kanaLastName: userKanaLastName || '',
    kanaFirstName: userKanaFirstName || '',
    corporatePhone: userCorporatePhone || '',
    personalPhone: userPersonalPhone || '',
    postalCode: userPostalCode || '',
    prefecture: userPrefecture || '',
    city: userCity || '',
    street: userStreet || '',
  };
  const [completionForm, setCompletionForm] = useState<ProfileCompletionFormData>(() => ({
    kanjiLastName: userLastName || '',
    kanjiFirstName: userFirstName || '',
    kanaLastName: userKanaLastName || '',
    kanaFirstName: userKanaFirstName || '',
    corporatePhone: userCorporatePhone || '',
    personalPhone: userPersonalPhone || '',
    postalCode: normalizePostalCodeInput(userPostalCode || ''),
    prefecture: userPrefecture || '',
    city: userCity || '',
    street: userStreet || '',
  }));
  const [completionErrors, setCompletionErrors] = useState<Partial<Record<ProfileCompletionField | '_form', string>>>({});
  const [isCompleting, setIsCompleting] = useState(false);

  const handlePostalAddressFound = ({
    postalCode,
    prefecture,
    city,
    street,
  }: {
    postalCode: string;
    prefecture: string;
    city: string;
    street: string;
  }) => {
    // Keep the exact signup address split: registry district data belongs to
    // city, while the customer adds the lot/building portion to street.
    setCompletionForm((current) => ({
      ...current,
      postalCode,
      prefecture,
      city: street ? `${city}${street}` : city,
      street: '',
    }));
  };

  const {
    lookupPostalCode,
    isSearchingPostal,
    postalSearchError,
    clearPostalSearchError,
  } = usePostalCodeLookup({ onAddressFound: handlePostalAddressFound });

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

  const validateCompletion = (): boolean => {
    const phoneRe = /^\d{2,4}-?\d{2,4}-?\d{3,4}$/;
    const kanaRe = /^[\u3040-\u309F\u30A0-\u30FF\u30FC\s]*$/;
    const postalRe = POSTAL_CODE_PATTERN;
    const errors: Partial<Record<ProfileCompletionField | '_form', string>> = {};
    const currentValues = approvedCompletionValues;
    const isEditable = (field: ProfileCompletionField) => !currentValues[field].trim();
    const required: Array<[ProfileCompletionField, string]> = [
      ['kanjiLastName', '姓を入力してください。'],
      ['kanjiFirstName', '名を入力してください。'],
      ['kanaLastName', '姓（カナ）を入力してください。'],
      ['kanaFirstName', '名（カナ）を入力してください。'],
      ['postalCode', '郵便番号を入力してください。'],
      ['prefecture', '都道府県を選択してください。'],
      ['city', '市区町村を入力してください。'],
      ['street', '番地を入力してください。'],
    ];

    for (const [field, message] of required) {
      if (isEditable(field) && !completionForm[field].trim()) {
        errors[field] = message;
      }
    }

    if (isEditable('kanjiLastName') && completionForm.kanjiLastName.trim().length > 50) {
      errors.kanjiLastName = '姓は50文字以内で入力してください。';
    }
    if (isEditable('kanjiFirstName') && completionForm.kanjiFirstName.trim().length > 50) {
      errors.kanjiFirstName = '名は50文字以内で入力してください。';
    }
    if (isEditable('kanaLastName') && completionForm.kanaLastName.trim()) {
      if (!kanaRe.test(completionForm.kanaLastName)) {
        errors.kanaLastName = 'ひらがなで入力してください。';
      } else if (completionForm.kanaLastName.trim().length > 50) {
        errors.kanaLastName = '姓は50文字以内で入力してください。';
      }
    }
    if (isEditable('kanaFirstName') && completionForm.kanaFirstName.trim()) {
      if (!kanaRe.test(completionForm.kanaFirstName)) {
        errors.kanaFirstName = 'ひらがなで入力してください。';
      } else if (completionForm.kanaFirstName.trim().length > 50) {
        errors.kanaFirstName = '名は50文字以内で入力してください。';
      }
    }
    if (isEditable('postalCode') && completionForm.postalCode.trim() && !postalRe.test(completionForm.postalCode)) {
      errors.postalCode = '有効な郵便番号を入力してください。（例：123-4567）';
    }
    if (isEditable('corporatePhone') && completionForm.corporatePhone.trim() && !phoneRe.test(completionForm.corporatePhone)) {
      errors.corporatePhone = '有効な電話番号の形式ではありません。';
    }
    if (isEditable('personalPhone') && completionForm.personalPhone.trim() && !phoneRe.test(completionForm.personalPhone)) {
      errors.personalPhone = '有効な電話番号の形式ではありません。';
    }
    if (
      !(userCorporatePhone || '').trim() &&
      !(userPersonalPhone || '').trim() &&
      !completionForm.corporatePhone.trim() &&
      !completionForm.personalPhone.trim()
    ) {
      errors.corporatePhone = '法人電話番号または携帯電話のいずれかを入力してください。';
    }

    setCompletionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileComplete = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateCompletion()) {
      return;
    }

    setIsCompleting(true);
    setCompletionErrors({});

    try {
      // 非空の承認済み値は UI に入力欄を作らない。さらに送信時にも二重排除する。
      const payload: Record<string, string> = {};
      const currentValues = approvedCompletionValues;

      for (const [field, apiKey] of Object.entries(COMPLETION_FIELD_TO_API)) {
        const completionField = field as ProfileCompletionField;
        const value = completionForm[completionField].trim();
        if (value && !currentValues[completionField].trim()) {
          payload[apiKey] = value;
        }
      }

      const response = await fetch('/api/member/profile/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, returnTo: safeReturnTo }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        const details = result.details || {};
        const nextErrors: Partial<Record<ProfileCompletionField | '_form', string>> = {};
        for (const [apiKey, messages] of Object.entries(details)) {
          const field = (
            Object.entries(COMPLETION_FIELD_TO_API) as Array<[ProfileCompletionField, string]>
          ).find(([, value]) => value === apiKey)?.[0];
          const message = Array.isArray(messages) ? messages[0] : undefined;
          if (field && message) {
            nextErrors[field] = message;
          }
        }
        nextErrors._form = result.error || 'プロフィールの保存に失敗しました。';
        setCompletionErrors(nextErrors);
        showError(nextErrors._form);
        return;
      }

      showSuccess('プロフィールを保存しました');
      router.replace(safeReturnTo);
      router.refresh();
    } catch (error) {
      console.error('Failed to complete profile:', error);
      setCompletionErrors({ _form: 'プロフィールの保存に失敗しました。' });
      showError('プロフィールの保存に失敗しました。');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg-secondary py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        {completionMode ? (
          <div className="mb-8" data-testid="profile-completion-title">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              サンプル依頼に必要な情報
            </h1>
            <p className="text-text-muted">
              未入力の必須項目だけをご入力ください。
            </p>
          </div>
        ) : (
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
        )}

        {/* Profile Overview Card */}
        {!completionMode && (
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
        )}

        {completionMode && (
          <Card className="p-6 mb-6 border-warning-300 bg-warning-50" data-testid="profile-completion-mode">
            <div
              className="mb-4 rounded-md border border-warning-300 bg-warning-100 p-3 text-sm text-warning-800"
              role="status"
              data-testid="profile-completion-notice"
            >
              サンプル依頼には氏名・電話番号・住所が必要です。未入力の必須項目だけをご入力ください。
              保存後は「{safeReturnTo}」へ戻ります。
            </div>

            <form onSubmit={handleProfileComplete} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!(userLastName || '').trim() && (
                  <Input
                    label="姓（漢字）"
                    data-testid="completion-kanji-last-name"
                    required
                    value={completionForm.kanjiLastName}
                    onChange={(e) => setCompletionForm({ ...completionForm, kanjiLastName: e.target.value })}
                    error={completionErrors.kanjiLastName}
                  />
                )}
                {!(userFirstName || '').trim() && (
                  <Input
                    label="名（漢字）"
                    data-testid="completion-kanji-first-name"
                    required
                    value={completionForm.kanjiFirstName}
                    onChange={(e) => setCompletionForm({ ...completionForm, kanjiFirstName: e.target.value })}
                    error={completionErrors.kanjiFirstName}
                  />
                )}
                {!(userKanaLastName || '').trim() && (
                  <Input
                    label="姓（ひらがな）"
                    data-testid="completion-kana-last-name"
                    required
                    value={completionForm.kanaLastName}
                    onChange={(e) => setCompletionForm({ ...completionForm, kanaLastName: e.target.value })}
                    error={completionErrors.kanaLastName}
                  />
                )}
                {!(userKanaFirstName || '').trim() && (
                  <Input
                    label="名（ひらがな）"
                    data-testid="completion-kana-first-name"
                    required
                    value={completionForm.kanaFirstName}
                    onChange={(e) => setCompletionForm({ ...completionForm, kanaFirstName: e.target.value })}
                    error={completionErrors.kanaFirstName}
                  />
                )}
                {!(userCorporatePhone || '').trim() && (
                  <Input
                    label="会社電話番号"
                    type="tel"
                    data-testid="completion-corporate-phone"
                    value={completionForm.corporatePhone}
                    onChange={(e) => setCompletionForm({ ...completionForm, corporatePhone: e.target.value })}
                    error={completionErrors.corporatePhone}
                  />
                )}
                {!(userPersonalPhone || '').trim() && (
                  <Input
                    label="携帯電話"
                    type="tel"
                    data-testid="completion-personal-phone"
                    value={completionForm.personalPhone}
                    onChange={(e) => setCompletionForm({ ...completionForm, personalPhone: e.target.value })}
                    error={completionErrors.personalPhone}
                  />
                )}
                {!(userPostalCode || '').trim() && (
                  <Input
                    label="郵便番号"
                    data-testid="completion-postal-code"
                    required
                    value={completionForm.postalCode}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    onChange={(e) => {
                      const value = normalizePostalCodeInput(e.target.value);
                      setCompletionForm((current) => ({ ...current, postalCode: value }));
                      clearPostalSearchError();
                      if (isCompletePostalCode(value)) {
                        void lookupPostalCode(value);
                      }
                    }}
                    error={completionErrors.postalCode}
                  />
                )}
                {!(userPrefecture || '').trim() && (
                  <select
                    data-testid="completion-prefecture"
                    required
                    value={completionForm.prefecture}
                    onChange={(e) => setCompletionForm({ ...completionForm, prefecture: e.target.value })}
                    className="w-full h-10 px-3 py-2 bg-bg-primary border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-brixa-500 text-text-primary dark:bg-bg-secondary dark:border-border-dark dark:text-text-primary"
                  >
                    <option value="">選択</option>
                    {JAPANESE_PREFECTURES.map((prefecture) => (
                      <option key={prefecture} value={prefecture}>
                        {prefecture}
                      </option>
                    ))}
                  </select>
                )}
                {!(userCity || '').trim() && (
                  <Input
                    label="市区町村"
                    data-testid="completion-city"
                    required
                    value={completionForm.city}
                    onChange={(e) => setCompletionForm({ ...completionForm, city: e.target.value })}
                    error={completionErrors.city}
                  />
                )}
                {!(userStreet || '').trim() && (
                  <Input
                    label="番地"
                    data-testid="completion-street"
                    required
                    value={completionForm.street}
                    onChange={(e) => setCompletionForm({ ...completionForm, street: e.target.value })}
                    error={completionErrors.street}
                  />
                )}
              </div>

              {isSearchingPostal ? (
                <p role="status" data-testid="profile-postal-loading" className="mt-3 text-sm text-text-muted">
                  住所を検索しています...
                </p>
              ) : null}
              {postalSearchError ? (
                <p role="alert" data-testid="profile-postal-error" className="mt-3 text-sm text-warning-600">
                  {postalSearchError}
                </p>
              ) : null}

              {completionErrors._form && (
                <p className="mt-3 text-sm text-error-600" role="alert">{completionErrors._form}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                className="mt-4"
                data-testid="profile-completion-submit"
                disabled={isCompleting}
              >
                {isCompleting ? '送信中...' : '確認画面へ進む'}
              </Button>
            </form>
          </Card>
        )}

        {/* =====================================================
            SECTION 1: 認証情報 (読み取り専用)
            ===================================================== */}
        {!completionMode && (
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
        )}

        {/* =====================================================
            SECTION 2: 連絡先 (編集可能)
            ===================================================== */}
        {!completionMode && (
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
        )}

        {/* =====================================================
            SECTION 3: 会社情報 (読み取り専用)
            ===================================================== */}
        {!completionMode && userBusinessType === BusinessType.CORPORATION && (
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
        {!completionMode && (
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
        )}

        {/* =====================================================
            SECTION 5: 商品種別 (読み取り専用)
            ===================================================== */}
        {!completionMode && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            商品種別
          </h2>

          <div className="w-full px-3 py-2 border border-border-medium rounded-md bg-bg-muted text-text-muted">
            {getProductCategoryLabel(userProductCategory) || '未登録'}
          </div>
        </Card>
        )}

        {/* =====================================================
            Additional Actions
            ===================================================== */}
        {!completionMode && (
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
        )}
      </div>
    </main>
  );
}
