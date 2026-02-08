/**
 * Member Profile Page
 *
 * 会員プロフィール表示ページ（読み取り専用）
 * - Supabaseベースのプロフィール表示
 * - 日本語UI
 * - 編集は /member/edit ページで可能
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Button, Badge } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Pencil } from 'lucide-react';
import {
  BusinessType,
  ProductCategory,
  type User,
} from '@/types/auth';

// =====================================================
// Constants
// =====================================================

const PRODUCT_CATEGORY_OPTIONS = [
  { value: ProductCategory.COSMETICS, label: '化粧品' },
  { value: ProductCategory.CLOTHING, label: '衣類' },
  { value: ProductCategory.ELECTRONICS, label: '家電製品' },
  { value: ProductCategory.KITCHEN, label: '台所用品' },
  { value: ProductCategory.FURNITURE, label: '家具' },
  { value: ProductCategory.OTHER, label: 'その他' },
];

const PREFECTURE_OPTIONS = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

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

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    console.log('[ProfilePage] Auth state:', { isLoading, isAuthenticated, hasUser: !!user });
    if (!isLoading && !isAuthenticated) {
      console.log('[ProfilePage] Not authenticated, redirecting to signin...');
      router.push('/auth/signin?redirect=/member/profile');
    }
  }, [isLoading, isAuthenticated, router, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
        <div className="text-text-muted">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Display name helper
  const displayName = `${user.kanjiLastName || ''} ${user.kanjiFirstName || ''}`.trim() || user.email;

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
                  {user.kanjiLastName?.[0] || user.email[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">
                    {displayName} 様
                  </h2>
                  <p className="text-text-muted">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={user.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {STATUS_LABELS[user.status]?.label || user.status}
                </Badge>
                <Badge variant="info">
                  {ROLE_LABELS[user.role] || user.role}
                </Badge>
                {user.businessType && (
                  <Badge variant="secondary">
                    {BUSINESS_TYPE_LABELS[user.businessType]}
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-text-muted">登録日</p>
              <p className="text-text-primary">
                {new Date(user.createdAt).toLocaleDateString('ja-JP')}
              </p>
              {user.lastLoginAt && (
                <>
                  <p className="text-sm text-text-muted mt-2">最終ログイン</p>
                  <p className="text-text-primary">
                    {new Date(user.lastLoginAt).toLocaleDateString('ja-JP')}
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
              value={user.email}
              disabled
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="姓（漢字）"
                value={user.kanjiLastName || ''}
                disabled
              />
              <Input
                label="名（漢字）"
                value={user.kanjiFirstName || ''}
                disabled
              />
              <Input
                label="姓（ひらがな）"
                value={user.kanaLastName || ''}
                disabled
              />
              <Input
                label="名（ひらがな）"
                value={user.kanaFirstName || ''}
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
                value={user.corporatePhone || ''}
                disabled
                placeholder="未登録"
              />
              <Input
                label="携帯電話"
                type="tel"
                value={user.personalPhone || ''}
                disabled
                placeholder="未登録"
              />
            </div>
          </div>
        </Card>

        {/* =====================================================
            SECTION 3: 会社情報 (読み取り専用)
            ===================================================== */}
        {user.businessType === BusinessType.CORPORATION && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              会社情報
            </h2>

            <div className="space-y-4">
              <Input
                label="会社名"
                value={user.companyName || ''}
                disabled
                placeholder="未登録"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="役職"
                  value={user.position || ''}
                  disabled
                  placeholder="未登録"
                />
                <Input
                  label="部署"
                  value={user.department || ''}
                  disabled
                  placeholder="未登録"
                />
              </div>

              <Input
                label="会社URL"
                type="url"
                value={user.companyUrl || ''}
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
              value={user.postalCode || ''}
              disabled
              placeholder="未登録"
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                都道府県
              </label>
              <div className="w-full px-3 py-2 border border-border-medium rounded-md bg-bg-muted text-text-muted">
                {user.prefecture || '未登録'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="市区町村"
                value={user.city || ''}
                disabled
                placeholder="未登録"
              />
              <Input
                label="番地・建物名"
                value={user.street || ''}
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
            {PRODUCT_CATEGORY_OPTIONS.find(opt => opt.value === user.productCategory)?.label || '未登録'}
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
