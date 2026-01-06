/**
 * Customer Profile Management Page
 * プロフィール設定ページ
 *
 * Allows customers to view and update their profile information
 */

import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ProfileData } from '@/types/portal';

// Force dynamic rendering - this page requires authentication and cannot be pre-rendered
export const dynamic = 'force-dynamic';

async function getProfileData() {
  const cookieStore = await cookies();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/customer/profile`,
    {
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join('; '),
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) return null;

  const result = await response.json();
  return result.data;
}

async function updateProfile(data: any) {
  const cookieStore = await cookies();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/customer/profile`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join('; '),
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
}

export default async function CustomerProfilePage() {
  const profileData = await getProfileData();

  if (!profileData) {
    redirect('/portal');
  }

  const { user, company } = profileData;

  async function handleUpdate(formData: FormData) {
    'use server';

    const updates = {
      corporate_phone: formData.get('corporate_phone') || undefined,
      personal_phone: formData.get('personal_phone') || undefined,
      position: formData.get('position') || undefined,
      department: formData.get('department') || undefined,
      company_url: formData.get('company_url') || undefined,
      postal_code: formData.get('postal_code') || undefined,
      prefecture: formData.get('prefecture') || undefined,
      city: formData.get('city') || undefined,
      street: formData.get('street') || undefined,
      building: formData.get('building') || undefined,
    };

    await updateProfile(updates);
    redirect('/portal/profile?updated=true');
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          プロフィール設定
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          お客様情報の確認・変更ができます
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <form action={handleUpdate} className="space-y-6">
          {/* Basic Information (Read-only) */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              基本情報
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  氏名
                </label>
                <p className="text-slate-900 dark:text-white">
                  {user.kanji_last_name} {user.kanji_first_name}
                </p>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  フリガナ
                </label>
                <p className="text-slate-900 dark:text-white">
                  {user.kana_last_name} {user.kana_first_name}
                </p>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  メールアドレス
                </label>
                <p className="text-slate-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  種別
                </label>
                <p className="text-slate-900 dark:text-white">
                  {user.business_type === 'CORPORATION' ? '法人' : user.business_type === 'SOLE_PROPRIETOR' ? '個人事業主' : '個人'}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information (Editable) */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              連絡先情報
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  会社電話番号
                </label>
                <input
                  type="tel"
                  name="corporate_phone"
                  defaultValue={user.corporate_phone || ''}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="03-1234-5678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  携帯電話番号
                </label>
                <input
                  type="tel"
                  name="personal_phone"
                  defaultValue={user.personal_phone || ''}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="090-1234-5678"
                />
              </div>
            </div>
          </div>

          {/* Company Information */}
          {user.company_name && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                会社情報
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">
                    会社名
                  </label>
                  <p className="text-slate-900 dark:text-white">{user.company_name}</p>
                </div>
                {company && (
                  <>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">
                        法人番号
                      </label>
                      <p className="text-slate-900 dark:text-white font-mono">
                        {company.corporate_number || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">
                        業種
                      </label>
                      <p className="text-slate-900 dark:text-white">{company.industry || '-'}</p>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    役職
                  </label>
                  <input
                    type="text"
                    name="position"
                    defaultValue={user.position || ''}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="部長"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    部署
                  </label>
                  <input
                    type="text"
                    name="department"
                    defaultValue={user.department || ''}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="購買部"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    会社URL
                  </label>
                  <input
                    type="url"
                    name="company_url"
                    defaultValue={user.company_url || ''}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Address Information */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              住所情報
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  郵便番号
                </label>
                <input
                  type="text"
                  name="postal_code"
                  defaultValue={user.postal_code || ''}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  都道府県
                </label>
                <input
                  type="text"
                  name="prefecture"
                  defaultValue={user.prefecture || ''}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="東京都"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  市区町村
                </label>
                <input
                  type="text"
                  name="city"
                  defaultValue={user.city || ''}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="千代田区"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  番地
                </label>
                <input
                  type="text"
                  name="street"
                  defaultValue={user.street || ''}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="1-2-3"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  建物名
                </label>
                <input
                  type="text"
                  name="building"
                  defaultValue={user.building || ''}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="〇〇ビル 5階"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              変更を保存
            </button>
          </div>
        </form>
      </div>

      {/* Account Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          アカウント操作
        </h2>
        <div className="flex flex-wrap gap-3">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              ログアウト
            </button>
          </form>
          <a
            href="mailto:support@epackage-lab.com"
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors inline-block"
          >
            アカウント削除リクエスト
          </a>
        </div>
      </div>
    </div>
  );
}
