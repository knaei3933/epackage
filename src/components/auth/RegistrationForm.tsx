/**
 * Registration Form Component
 *
 * 18フィールド会員登録フォームコンポーネントです。
 * - React Hook Form + Zod検証
 * - JapaneseNameInput統合
 * - 法人番号API連動 (会社名自動検索)
 * - 日本語対応
 */

'use client';

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  Input,
  Button,
  Card,
} from '@/components/ui';
import JapaneseNameInput from '@/components/ui/JapaneseNameInput';
import {
  registrationSchema,
  type RegistrationFormData,
  BusinessType,
  ProductCategory,
} from '@/types/auth';

// =====================================================
// Props
// =====================================================

export interface RegistrationFormProps {
  /** 送信成功時コールバック */
  onSuccess?: (data: RegistrationFormData) => void;
  /** 送信失敗時コールバック */
  onError?: (error: string) => void;
  /** 初期データ */
  defaultValues?: Partial<RegistrationFormData>;
  /** 追加クラス名 */
  className?: string;
}

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

const ACQUISITION_CHANNEL_OPTIONS = [
  { value: 'web_search', label: '検索エンジン' },
  { value: 'social_media', label: 'SNS' },
  { value: 'referral', label: '紹介' },
  { value: 'exhibition', label: '展示会' },
  { value: 'advertisement', label: '広告' },
  { value: 'other', label: 'その他' },
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

// =====================================================
// Component
// =====================================================

export default function RegistrationForm({
  onSuccess,
  onError,
  defaultValues,
  className,
}: RegistrationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSearchingCorporate, setIsSearchingCorporate] = useState(false);
  const [corporateSearchError, setCorporateSearchError] = useState<string | null>(null);
  const [isSearchingPostal, setIsSearchingPostal] = useState(false);
  const [postalSearchError, setPostalSearchError] = useState<string | null>(null);

  // React Hook Form設定
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      businessType: BusinessType.INDIVIDUAL,
      productCategory: ProductCategory.OTHER,
      ...defaultValues,
    },
    mode: 'onBlur',
  });

  // 事業者タイプ監視
  const businessType = watch('businessType');
  const companyName = watch('companyName', '');
  const postalCode = watch('postalCode', '');

  // 法人番号検索関数
  const searchCorporateNumber = async (name: string) => {
    if (!name || name.length < 2) {
      setCorporateSearchError('会社名を2文字以上入力してください。');
      return;
    }

    setIsSearchingCorporate(true);
    setCorporateSearchError(null);

    try {
      const response = await fetch(`/api/registry/corporate-number?name=${encodeURIComponent(name)}`);

      if (!response.ok) {
        throw new Error('法人番号の検索に失敗しました。');
      }

      const data = await response.json();

      if (data.length > 0) {
        const result = data[0];
        // 検索結果をフォームに自動反映
        setValue('legalEntityNumber', result.corporateNumber);
        setValue('companyName', result.name);
        if (result.postalCode) setValue('postalCode', result.postalCode);
        if (result.prefecture) setValue('prefecture', result.prefecture);
        if (result.city) setValue('city', result.city);
        if (result.street) setValue('street', result.street);
        setCorporateSearchError(null);
      } else {
        setCorporateSearchError('法人番号が見つかりませんでした。正式名称（「株式会社」なども含む）で再度入力してください。');
      }
    } catch (error) {
      setCorporateSearchError(error instanceof Error ? error.message : '法人番号の検索に失敗しました。');
    } finally {
      setIsSearchingCorporate(false);
    }
  };

  // 郵便番号から住所検索関数
  const searchAddressByPostalCode = async (code: string) => {
    if (!code || code.length < 7) {
      setPostalSearchError('郵便番号を正しく入力してください（例: 123-4567）');
      return;
    }

    setIsSearchingPostal(true);
    setPostalSearchError(null);

    try {
      const response = await fetch(`/api/registry/postal-code?postalCode=${encodeURIComponent(code)}`);

      if (!response.ok) {
        throw new Error('住所検索に失敗しました。');
      }

      const data = await response.json();

      if (data.prefecture || data.city || data.street) {
        // 検索結果をフォームに自動反映
        if (data.prefecture) setValue('prefecture', data.prefecture);
        if (data.city) setValue('city', data.city);
        if (data.street) setValue('street', data.street);
        setPostalSearchError(null);
      } else {
        setPostalSearchError('住所が見つかりませんでした。郵便番号を確認してください。');
      }
    } catch (error) {
      setPostalSearchError(error instanceof Error ? error.message : '住所検索に失敗しました。');
    } finally {
      setIsSearchingPostal(false);
    }
  };

  // フォーム送信ハンドラー
  const onSubmit: SubmitHandler<RegistrationFormData> = async (data) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      // API呼び出し
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '会員登録に失敗しました。');
      }

      // 成功処理
      onSuccess?.(data);

      // 承認待ちページへ移動
      router.push('/auth/pending?email=' + encodeURIComponent(data.email));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '会員登録に失敗しました。';
      setServerError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 md:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className={className}>
        {/* サーバーエラーメッセージ */}
        {serverError && (
          <div className="mb-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
            <p className="text-sm text-error-600 dark:text-error-400">{serverError}</p>
          </div>
        )}

        {/* =====================================================
            SECTION 1: 認証情報
            ===================================================== */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            認証情報
          </h2>

          {/* メールアドレス */}
          <Input
            label="メールアドレス"
            type="email"
            placeholder="example@company.com"
            error={errors.email?.message}
            required
            {...register('email')}
            className="mb-4"
          />

          {/* パスワード */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="パスワード"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password?.message}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-muted hover:text-text-primary"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              }
              {...register('password')}
            />
            <Input
              label="パスワード確認"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.passwordConfirm?.message}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-text-muted hover:text-text-primary"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              }
              {...register('passwordConfirm')}
            />
          </div>
        </div>

        {/* =====================================================
            SECTION 2: 氏名
            ===================================================== */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            氏名
          </h2>

          <JapaneseNameInput
            kanjiLastName={watch('kanjiLastName')}
            kanjiFirstName={watch('kanjiFirstName')}
            kanaLastName={watch('kanaLastName')}
            kanaFirstName={watch('kanaFirstName')}
            onKanjiLastNameChange={(value) => setValue('kanjiLastName', value)}
            onKanjiFirstNameChange={(value) => setValue('kanjiFirstName', value)}
            onKanaLastNameChange={(value) => setValue('kanaLastName', value)}
            onKanaFirstNameChange={(value) => setValue('kanaFirstName', value)}
            kanjiLastNameError={errors.kanjiLastName?.message}
            kanjiFirstNameError={errors.kanjiFirstName?.message}
            kanaLastNameError={errors.kanaLastName?.message}
            kanaFirstNameError={errors.kanaFirstName?.message}
            required
          />
        </div>

        {/* =====================================================
            SECTION 3: 連絡先
            ===================================================== */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            連絡先
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="会社電話番号"
              type="tel"
              placeholder="03-1234-5678"
              error={errors.corporatePhone?.message}
              {...register('corporatePhone')}
            />
            <Input
              label="携帯電話"
              type="tel"
              placeholder="090-1234-5678"
              error={errors.personalPhone?.message}
              {...register('personalPhone')}
            />
          </div>
        </div>

        {/* =====================================================
            SECTION 4: 事業形態
            ===================================================== */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            事業形態
          </h2>

          <div className="flex gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                {...register('businessType')}
                type="radio"
                value={BusinessType.INDIVIDUAL}
                className="w-4 h-4 text-brixa-500"
              />
              <span className="text-sm text-text-primary">
                個人
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                {...register('businessType')}
                type="radio"
                value={BusinessType.CORPORATION}
                className="w-4 h-4 text-brixa-500"
              />
              <span className="text-sm text-text-primary">
                法人
              </span>
            </label>
          </div>
          {errors.businessType && (
            <p className="mt-2 text-sm text-error-500">{errors.businessType.message}</p>
          )}
        </div>

        {/* =====================================================
            SECTION 5: 会社情報 (法人のみ表示)
            ===================================================== */}
        {businessType === BusinessType.CORPORATION && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              会社情報
            </h2>

            <div className="space-y-4">
              {/* 会社名入力 - 自動検索表示 */}
              <div>
                <Input
                  label="会社名"
                  placeholder="株式会社イパッケージLab"
                  {...register('companyName')}
                  helperText="会社名を入力して「法人番号自動検索」ボタンをクリックすると、正式名称と所在地が自動反映されます。"
                />
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => searchCorporateNumber(companyName || '')}
                    disabled={isSearchingCorporate || !companyName}
                  >
                    {isSearchingCorporate ? '検索中...' : '法人番号自動検索'}
                  </Button>
                </div>
                {corporateSearchError && (
                  <p className="mt-2 text-sm text-warning-600">{corporateSearchError}</p>
                )}
              </div>

              {/* 法人番号 - 自動入力 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="法人番号"
                  placeholder="1234567890123"
                  error={errors.legalEntityNumber?.message}
                  maxLength={13}
                  {...register('legalEntityNumber')}
                  helperText="※会社名から自動検索されます"
                />
                <Input
                  label="役職"
                  placeholder="代表取締役"
                  {...register('position')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="部署 (任意)"
                  placeholder="営業チーム"
                  {...register('department')}
                />
                <Input
                  label="会社URL"
                  type="url"
                  placeholder="https://example.com"
                  error={errors.companyUrl?.message}
                  {...register('companyUrl')}
                />
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            SECTION 6: 住所
            ===================================================== */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            住所
          </h2>

          <div className="space-y-4">
            {/* 郵便番号入力 - 自動検索ボタン付き */}
            <div>
              <Input
                label="郵便番号"
                placeholder="123-4567"
                error={errors.postalCode?.message}
                {...register('postalCode')}
                helperText="郵便番号を入力して「住所自動検索」ボタンをクリックすると、住所が自動入力されます。"
              />
              <div className="mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => searchAddressByPostalCode(postalCode || '')}
                  disabled={isSearchingPostal || !postalCode}
                >
                  {isSearchingPostal ? '検索中...' : '住所自動検索'}
                </Button>
              </div>
              {postalSearchError && (
                <p className="mt-2 text-sm text-warning-600">{postalSearchError}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  都道府県
                </label>
                <select
                  {...register('prefecture')}
                  className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-brixa-500"
                >
                  <option value="">選択</option>
                  {PREFECTURE_OPTIONS.map((pref) => (
                    <option key={pref} value={pref}>
                      {pref}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="市区町村"
                placeholder="渋谷区"
                {...register('city')}
              />
              <Input
                label="番地・建物名"
                placeholder="1-2-3 イパッケージビル"
                {...register('street')}
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            SECTION 7: B2B追加情報 (法人のみ表示)
            ===================================================== */}
        {businessType === BusinessType.CORPORATION && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              法人追加情報
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="設立年"
                  placeholder="2020"
                  error={errors.foundedYear?.message}
                  {...register('foundedYear')}
                  helperText="西暦4桁（例: 2020）"
                />
                <Input
                  label="資本金"
                  placeholder="1,000万円"
                  error={errors.capital?.message}
                  {...register('capital')}
                  helperText="例: 1,000万円、5億円"
                />
                <Input
                  label="代表者名"
                  placeholder="山田 太郎"
                  error={errors.representativeName?.message}
                  {...register('representativeName')}
                  helperText="姓と名の間にスペース"
                />
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            SECTION 8: 商品種別
            ===================================================== */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            商品種別
          </h2>

          <select
            {...register('productCategory')}
            className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-brixa-500"
          >
            {PRODUCT_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.productCategory && (
            <p className="mt-2 text-sm text-error-500">{errors.productCategory.message}</p>
          )}
        </div>

        {/* =====================================================
            SECTION 9: 知ったきっかけ
            ===================================================== */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            知ったきっかけ
          </h2>

          <select
            {...register('acquisitionChannel')}
            className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-brixa-500"
          >
            <option value="">選択</option>
            {ACQUISITION_CHANNEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* =====================================================
            SECTION 10: プライバシーポリシー同意
            ===================================================== */}
        <div className="mb-8">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              {...register('privacyConsent')}
              type="checkbox"
              className="w-4 h-4 mt-1 text-brixa-500"
            />
            <span className="text-sm text-text-primary">
              <a href="/privacy" className="text-brixa-500 hover:underline">
                プライバシーポリシー
              </a>
              に同意します。
              {errors.privacyConsent && (
                <span className="text-error-500 ml-1">{errors.privacyConsent.message}</span>
              )}
            </span>
          </label>
        </div>

        {/* =====================================================
            SECTION 11: 送信ボタン
            ===================================================== */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? '処理中...' : '会員登録'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </Card>
  );
}
