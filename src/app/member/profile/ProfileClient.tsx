/**
 * Profile Page Client Component
 *
 * 会員プロフィール表示ページのクライアントコンポーネント
 * - プロフィール情報の表示
 * - 編集ページへのナビゲーション
 * - サーバーコンポーネントからユーザーデータを受け取る
 */

'use client';

import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Pencil } from 'lucide-react';
import {
  BusinessType,
  ProductCategory,
  type User,
} from '@/types/auth';

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
}

// =====================================================
// Constants
// =====================================================

const PRODUCT_CATEGORY_OPTIONS: Record<string, string> = {
  [ProductCategory.COSMETICS]: '化粧品',
  [ProductCategory.CLOTHING]: '衣類',
  [ProductCategory.ELECTRONICS]: '家電製品',
  [ProductCategory.KITCHEN]: '台所用品',
  [ProductCategory.FURNITURE]: '家具',
  [ProductCategory.OTHER]: 'その他',
};

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
}: ProfileClientProps) {
  const router = useRouter();

  // Display name helper
  const displayName = `${userLastName || ''} ${userFirstName || ''}`.trim() || userEmail;

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
          <a
            href="/member/edit"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/member/edit';
            }}
          >
            <Button
              type="button"
              variant="primary"
            >
              編集
            </Button>
          </a>
        </div>

        {/* Profile Overview Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brixa-400 to-brixa-600 flex items-center justify-center text-white text-2xl font-bold">
                  {userLastName?.[0] || userEmail[0].toUpperCase()}
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
                  window.location.href = '/contact';
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
            SECTION 2: 連絡先 (読み取り専用・編集可能)
            ===================================================== */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              連絡先（編集可能）
            </h2>
            <a
              href="/member/edit"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/member/edit';
              }}
            >
              <Button variant="outline" size="sm">
                <Pencil className="w-3 h-3 mr-1" />
                編集
              </Button>
            </a>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="会社電話番号"
                type="tel"
                value={userCorporatePhone || ''}
                disabled
                placeholder="未登録"
              />
              <Input
                label="携帯電話"
                type="tel"
                value={userPersonalPhone || ''}
                disabled
                placeholder="未登録"
              />
            </div>
          </div>
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
                  window.location.href = '/contact';
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
            {userProductCategory && PRODUCT_CATEGORY_OPTIONS[userProductCategory] ? PRODUCT_CATEGORY_OPTIONS[userProductCategory] : '未登録'}
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
              onClick={() => router.push('/member/edit')}
            >
              会員情報を編集
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto ml-2"
              onClick={() => router.push('/auth/reset-password')}
            >
              パスワード変更
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
