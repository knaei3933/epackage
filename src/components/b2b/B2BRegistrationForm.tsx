/**
 * B2B Registration Form Component
 *
 * B2B会員登録フォームコンポーネントです。
 * - 事業登記証アップロード
 * - 法人/個人事業者選択
 * - 担当者情報入力
 * - メール認証
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import { JapaneseNameInputController } from '@/components/ui/JapaneseNameInput';

// ============================================================
// Types
// ============================================================

export interface B2BRegistrationFormData {
  // 事業者タイプ
  businessType: 'CORPORATION' | 'SOLE_PROPRIETOR';

  // 会社情報
  companyName: string;
  corporateNumber?: string;
  foundedYear?: string;
  capital?: string;
  representativeName?: string;

  // 担当者情報 (日本語名前)
  kanjiLastName: string;
  kanjiFirstName: string;
  kanaLastName: string;
  kanaFirstName: string;

  // 連絡先
  email: string;
  corporatePhone: string;
  postalCode: string;
  prefecture: string;
  city: string;
  street: string;
  building?: string;

  // 認証
  password: string;
  passwordConfirm: string;

  // 書類
  businessRegistrationFile?: File;
  termsAgreed: true;
  privacyAgreed: true;
}

// ============================================================
// Validation Schema
// ============================================================

const b2bRegistrationSchema = z
  .object({
    // 事業者種別
    businessType: z.enum(['CORPORATION', 'SOLE_PROPRIETOR'], {
      required_error: '事業者種別を選択してください。',
    }),

    // 会社情報
    companyName: z
      .string()
      .min(1, '会社名を入力してください。')
      .max(200, '会社名は200文字以内で入力してください。'),
    corporateNumber: z
      .string()
      .regex(/^\d{13}$/, '正しい法人番号(13桁)を入力してください。')
      .optional(),
    foundedYear: z
      .string()
      .regex(/^\d{4}$/, '正しい年度を入力してください。')
      .optional(),
    capital: z.string().optional(),
    representativeName: z.string().optional(),

    // 担当者情報 (日本語)
    kanjiLastName: z
      .string()
      .min(1, '姓（漢字）を入力してください。')
      .regex(/^[\u4E00-\u9FFF\s]+$/, '漢字のみ入力可能です。'),
    kanjiFirstName: z
      .string()
      .min(1, '名（漢字）を入力してください。')
      .regex(/^[\u4E00-\u9FFF\s]+$/, '漢字のみ入力可能です。'),
    kanaLastName: z
      .string()
      .min(1, '姓（ひらがな）を入力してください。')
      .regex(/^[\u3040-\u309F\s]+$/, 'ひらがなのみ入力可能です。'),
    kanaFirstName: z
      .string()
      .min(1, '名（ひらがな）を入力してください。')
      .regex(/^[\u3040-\u309F\s]+$/, 'ひらがなのみ入力可能です。'),

    // 連絡先
    email: z
      .string()
      .min(1, 'メールアドレスを入力してください。')
      .email('有効なメールアドレスを入力してください。'),
    corporatePhone: z
      .string()
      .regex(/^\d{2,4}-?\d{2,4}-?\d{3,4}$/, '有効な電話番号形式ではありません。'),
    postalCode: z
      .string()
      .regex(/^\d{3}-?\d{4}$/, '郵便番号の形式が正しくありません (例: 123-4567).'),
    prefecture: z.string().min(1, '都道府県を選択してください。'),
    city: z.string().min(1, '市区町村を入力してください。'),
    street: z.string().min(1, '番地を入力してください。'),
    building: z.string().optional(),

    // パスワード
    password: z
      .string()
      .min(8, 'パスワードは最低8文字以上である必要があります。')
      .regex(/[A-Z]/, 'パスワードには最低1つの大文字が含まれている必要があります。')
      .regex(/[a-z]/, 'パスワードには最低1つの小文字が含まれている必要があります。')
      .regex(/[0-9]/, 'パスワードには最低1つの数字が含まれている必要があります。'),
    passwordConfirm: z.string().min(1, 'パスワード確認を入力してください。'),

    // 書類
    businessRegistrationFile: z.any().optional(),

    // 利用規約同意
    termsAgreed: z.literal(true, {
      errorMap: () => ({ message: '利用規約に同意してください。' }),
    }),
    privacyAgreed: z.literal(true, {
      errorMap: () => ({ message: 'プライバシーポリシーに同意してください。' }),
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'パスワードが一致しません。',
    path: ['passwordConfirm'],
  });

// ============================================================
// Component
// ============================================================

export default function B2BRegistrationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<B2BRegistrationFormData>({
    resolver: zodResolver(b2bRegistrationSchema),
    defaultValues: {
      businessType: 'CORPORATION',
    },
    mode: 'onBlur',
  });

  const businessType = watch('businessType');
  const password = watch('password');

  // File upload handler
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setServerError('PDF、JPEG、PNG形式のファイルのみアップロード可能です。');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setServerError('ファイルサイズは5MB以下である必要があります。');
      return;
    }

    setUploadedFileName(file.name);
    setValue('businessRegistrationFile', file);
    setServerError(null);
  }, [setValue]);

  // Form submit handler
  const onSubmit: SubmitHandler<B2BRegistrationFormData> = async (data) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('businessType', data.businessType);
      formData.append('companyName', data.companyName);
      if (data.corporateNumber) formData.append('corporateNumber', data.corporateNumber);
      if (data.foundedYear) formData.append('foundedYear', data.foundedYear);
      if (data.capital) formData.append('capital', data.capital);
      if (data.representativeName) formData.append('representativeName', data.representativeName);
      formData.append('kanjiLastName', data.kanjiLastName);
      formData.append('kanjiFirstName', data.kanjiFirstName);
      formData.append('kanaLastName', data.kanaLastName);
      formData.append('kanaFirstName', data.kanaFirstName);
      formData.append('email', data.email);
      formData.append('corporatePhone', data.corporatePhone);
      formData.append('postalCode', data.postalCode);
      formData.append('prefecture', data.prefecture);
      formData.append('city', data.city);
      formData.append('street', data.street);
      if (data.building) formData.append('building', data.building);
      formData.append('password', data.password);
      if (data.businessRegistrationFile) {
        formData.append('businessRegistrationFile', data.businessRegistrationFile);
      }

      const response = await fetch('/api/member/auth/register', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '登録に失敗しました。');
      }

      // Success - redirect to email verification page
      router.push(`/b2b/register/verify?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : '登録に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Message */}
        {serverError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{serverError}</p>
          </div>
        )}

        {/* 事業者タイプ選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            事業者タイプ <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                businessType === 'CORPORATION'
                  ? 'border-brixa-500 bg-brixa-50 dark:bg-brixa-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <input
                type="radio"
                {...register('businessType')}
                value="CORPORATION"
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-1">🏢</div>
                <div className="font-medium">法人事業者</div>
                <div className="text-xs text-gray-500">株式会社、有限会社など</div>
              </div>
            </label>
            <label
              className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                businessType === 'SOLE_PROPRIETOR'
                  ? 'border-brixa-500 bg-brixa-50 dark:bg-brixa-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <input
                type="radio"
                {...register('businessType')}
                value="SOLE_PROPRIETOR"
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-1">👤</div>
                <div className="font-medium">個人事業者</div>
                <div className="text-xs text-gray-500">個人事業者、フリーランサー</div>
              </div>
            </label>
          </div>
          {errors.businessType && (
            <p className="mt-1 text-sm text-red-600">{errors.businessType.message}</p>
          )}
        </div>

        {/* 会社情報 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
            会社情報
          </h3>

          <Input
            label="会社名 *"
            {...register('companyName')}
            placeholder="株式会社EPACKAGE Lab"
            error={errors.companyName?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="法人番号 / 事業登記番号"
              {...register('corporateNumber')}
              placeholder="1234567890123"
              error={errors.corporateNumber?.message}
            />
            <Input
              label="設立年度"
              {...register('foundedYear')}
              placeholder="2020"
              type="number"
              error={errors.foundedYear?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="資本金"
              {...register('capital')}
              placeholder="1,000万円"
              error={errors.capital?.message}
            />
            <Input
              label="代表者名"
              {...register('representativeName')}
              placeholder="山田 太郎"
              error={errors.representativeName?.message}
            />
          </div>
        </div>

        {/* 担当者情報 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
            担当者情報
          </h3>

          <JapaneseNameInputController
            control={control}
            setValue={setValue}
            trigger={trigger}
            kanjiLastNameName="kanjiLastName"
            kanjiFirstNameName="kanjiFirstName"
            kanaLastNameName="kanaLastName"
            kanaFirstNameName="kanaFirstName"
            kanjiLastNameError={errors.kanjiLastName?.message}
            kanjiFirstNameError={errors.kanjiFirstName?.message}
            kanaLastNameError={errors.kanaLastName?.message}
            kanaFirstNameError={errors.kanaFirstName?.message}
            required
          />
        </div>

        {/* 連絡先情報 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
            連絡先情報
          </h3>

          <Input
            label="メールアドレス *"
            {...register('email')}
            type="email"
            placeholder="example@company.com"
            error={errors.email?.message}
          />

          <Input
            label="電話番号 *"
            {...register('corporatePhone')}
            placeholder="03-1234-5678"
            error={errors.corporatePhone?.message}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="郵便番号 *"
              {...register('postalCode')}
              placeholder="123-4567"
              error={errors.postalCode?.message}
            />
            <Input
              label="都道府県 *"
              {...register('prefecture')}
              placeholder="東京都"
              error={errors.prefecture?.message}
            />
            <Input
              label="市区町村 *"
              {...register('city')}
              placeholder="渋谷区"
              error={errors.city?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="番地 *"
              {...register('street')}
              placeholder="道玄坂1-2-3"
              error={errors.street?.message}
            />
            <Input
              label="建物名"
              {...register('building')}
              placeholder="EPACKAGEビル5F"
              error={errors.building?.message}
            />
          </div>
        </div>

        {/* パスワード */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
            パスワード設定
          </h3>

          <div className="relative">
            <Input
              label="パスワード *"
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="8文字以上（大文字・小文字・数字を含む）"
              error={errors.password?.message}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <Input
            label="パスワード確認 *"
            {...register('passwordConfirm')}
            type="password"
            placeholder="パスワードを再入力"
            error={errors.passwordConfirm?.message}
          />
        </div>

        {/* 書類アップロード */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
            書類アップロード
          </h3>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <label className="block cursor-pointer">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadedFileName || '法人登記証をドラッグまたはクリックしてアップロード'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF、JPEG、PNG (最大5MB)
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 利用規約同意 */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('termsAgreed')}
              className="mt-1 w-4 h-4 text-brixa-600 border-gray-300 rounded focus:ring-brixa-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              <Link href="/terms" target="_blank" className="text-brixa-600 hover:underline">
                利用規約
              </Link>
              に同意します
            </span>
          </label>
          {errors.termsAgreed && (
            <p className="text-sm text-red-600">{errors.termsAgreed.message}</p>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('privacyAgreed')}
              className="mt-1 w-4 h-4 text-brixa-600 border-gray-300 rounded focus:ring-brixa-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              <Link href="/privacy" target="_blank" className="text-brixa-600 hover:underline">
                個人情報処理方針
              </Link>
              に同意します
            </span>
          </label>
          {errors.privacyAgreed && (
            <p className="text-sm text-red-600">{errors.privacyAgreed.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 text-base font-semibold"
        >
          {isSubmitting ? '送信中...' : '会員登録申請'}
        </Button>
      </form>
    </Card>
  );
}
