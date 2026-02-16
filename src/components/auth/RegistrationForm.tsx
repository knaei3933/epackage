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
import { JapaneseNameInputController } from '@/components/ui/JapaneseNameInput';
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState<number>(-1);
  const [isSearchingPostal, setIsSearchingPostal] = useState(false);
  const [postalSearchError, setPostalSearchError] = useState<string | null>(null);

  // React Hook Form設定
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    trigger,
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

  // 法人番号検索関数（適格請求書発行事業者登録番号公表サイトAPI）
  const searchCorporateNumber = async (name: string) => {
    if (!name || name.length < 2) {
      setCorporateSearchError('会社名を2文字以上入力してください。');
      return;
    }

    setIsSearchingCorporate(true);
    setCorporateSearchError(null);
    setSearchResults([]);
    setSelectedSearchIndex(-1);

    try {
      const response = await fetch(`/api/registry/search?name=${encodeURIComponent(name)}`);

      if (!response.ok) {
        throw new Error('法人番号の検索に失敗しました。');
      }

      const data = await response.json();

      if (data.length > 0) {
        setSearchResults(data);

        // 結果が1つのみの場合は自動入力
        if (data.length === 1) {
          const result = data[0];
          applySearchResult(result);
        }
        // 複数の場合はドロップダウンを表示（ユーザーが選択するのを待つ）
      } else {
        setCorporateSearchError('検索結果が見つかりませんでした。※データベースに未登録の場合は、会社名と法人番号を手動で入力してください（例: アイネコスメティクス株式会社 / 3140001129128）');
      }
    } catch (error) {
      setCorporateSearchError(error instanceof Error ? error.message : '法人番号の検索に失敗しました。');
    } finally {
      setIsSearchingCorporate(false);
    }
  };

  // 検索結果をフォームに適用する関数
  const applySearchResult = (result: any) => {
    setValue('legalEntityNumber', result.corporateNumber);
    setValue('companyName', result.name);

    // addressフィールドから郵便番号と住所を解析して自動入力
    if (result.address) {
      // 郵便番号抽出 (〒XXX-XXXX 形式)
      const postalMatch = result.address.match(/〒(\d{3})-(\d{4})/);
      if (postalMatch) {
        setValue('postalCode', `${postalMatch[1]}-${postalMatch[2]}`);
      }

      // 都道府県と市区町村抽出
      let addressWithoutPostal = result.address.replace(/〒\d{3}-\d{4}\s*/, '');

      // 都道府県のマッチング
      const prefectureMatch = PREFECTURE_OPTIONS.find(p => addressWithoutPostal.includes(p));
      if (prefectureMatch) {
        setValue('prefecture', prefectureMatch);
        addressWithoutPostal = addressWithoutPostal.replace(prefectureMatch, '');
      }

      // 残りを市区町村として設定
      setValue('city', addressWithoutPostal.trim());
    }
  };

  // ドロップダウンで検索結果を選択したときの関数
  const handleSelectSearchResult = (index: number) => {
    setSelectedSearchIndex(index);
    if (searchResults[index]) {
      applySearchResult(searchResults[index]);
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

      if (data.prefecture || data.city) {
        // 都道府県はドロップダウンから自動選択
        if (data.prefecture) {
          const prefectureMatch = PREFECTURE_OPTIONS.find(p => data.prefecture.includes(p));
          if (prefectureMatch) {
            setValue('prefecture', prefectureMatch);
          }
        }
        // 市区町村＋番地まで自動入力（例: 加古郡稲美町六分一）
        if (data.city) {
          const cityValue = data.street ? `${data.city}${data.street}` : data.city;
          setValue('city', cityValue);
        }
        // streetフィールドはクリア（追加番地はユーザーが直接入力）
        setValue('street', '');
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
      const response = await fetch('/api/auth/register', {
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

      // 성공 처리
      onSuccess?.(data);

      // 이메일 인증이 필요한 경우 확인 메시지 표시
      if (result.requiresEmailConfirmation) {
        // 이메일 인증 안내 페이지로 이동하거나 메시지 표시
        router.push('/auth/pending?email=' + encodeURIComponent(data.email));
        return;
      }

      // 이메일 인증 완료 후 바로 승인 대기 페이지로 이동
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
            label="メールアドレス *"
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
              label="パスワード *"
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
              label="パスワード確認 *"
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

          <JapaneseNameInputController
            control={control}
            setValue={setValue}
            trigger={trigger}
            kanjiLastNameName="kanjiLastName"
            kanjiFirstNameName="kanjiFirstName"
            kanaLastNameName="kanaLastName"
            kanaFirstNameName="kanaFirstName"
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
                  helperText="会社名を入力してください。法人番号自動検索も利用できます（※検索対象外の場合は手動で法人番号を入力してください）"
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
                {searchResults.length > 1 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      検索結果が{searchResults.length}件見つかりました。選択してください：
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={selectedSearchIndex}
                      onChange={(e) => handleSelectSearchResult(parseInt(e.target.value))}
                    >
                      <option value={-1}>選択してください...</option>
                      {searchResults.map((result, index) => (
                        <option key={index} value={index}>
                          {result.name} - {result.corporateNumber}
                          {result.address && ` (${result.address})`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {searchResults.length === 1 && (
                  <p className="mt-2 text-sm text-success-600">
                    ✓ 検索結果が1件見かりました。自動入力されました。
                  </p>
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
                  helperText="※自動検索対象外の場合は、手動で法人番号を入力してください（例: 3140001129128）"
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
            {/* 郵便番号入力 - 自動検索 */}
            <div>
              <Input
                label="郵便番号"
                placeholder="123-4567"
                error={errors.postalCode?.message}
                {...register('postalCode', {
                  onChange: (e) => {
                    const value = e.target.value.replace('-', '')
                    // 7桁入力されたら自動検索
                    if (value.length === 7) {
                      searchAddressByPostalCode(e.target.value)
                    }
                  }
                })}
              />
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
                {errors.prefecture && (
                  <p className="mt-1 text-sm text-error-500">{errors.prefecture.message}</p>
                )}
              </div>

              <div>
                <Input
                  label="市区町村"
                  placeholder="加古郡稲美町六分一"
                  error={errors.city?.message}
                  {...register('city')}
                />
              </div>
              <div>
                <Input
                  label="番地"
                  placeholder="1-2-3"
                  error={errors.street?.message}
                  {...register('street')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            SECTION 7: 商品種別
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
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-brixa-500 hover:underline">
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
