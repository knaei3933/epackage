/**
 * B2B Registration Page
 *
 * B2B 회원가입 페이지 (다단계 폼)
 * - /api/b2b/register API 연동
 * - React Hook Form + Zod 검증
 * - 일본어 UI
 * - 사업자등록증 업로드
 */

'use client';

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input, Button, Card } from '@/components/ui';
import { z } from 'zod';

// =====================================================
// Validation Schemas
// =====================================================

const businessInfoSchema = z.object({
  businessType: z.enum(['CORPORATION', 'SOLE_PROPRIETOR'], {
    required_error: '法人形態を選択してください。',
  }),
  companyName: z.string().min(1, '会社名を入力してください。'),
  corporateNumber: z.string().optional(),
  foundedYear: z.string().optional(),
  capital: z.string().optional(),
  representativeName: z.string().optional(),
});

const personalInfoSchema = z.object({
  kanjiLastName: z.string().min(1, '姓（漢字）を入力してください。'),
  kanjiFirstName: z.string().min(1, '名（漢字）を入力してください。'),
  kanaLastName: z.string().min(1, '姓（カナ）を入力してください。'),
  kanaFirstName: z.string().min(1, '名（カナ）を入力してください。'),
  email: z.string().min(1, 'メールアドレスを入力してください。').email('正しいメールアドレスを入力してください。'),
  corporatePhone: z.string().min(1, '電話番号を入力してください。'),
});

const addressSchema = z.object({
  postalCode: z.string().min(1, '郵便番号を入力してください。'),
  prefecture: z.string().min(1, '都道府県を選択してください。'),
  city: z.string().min(1, '市区町村を入力してください。'),
  street: z.string().min(1, '番地を入力してください。'),
  building: z.string().optional(),
});

const passwordSchema = z.object({
  password: z.string().min(8, 'パスワードは8文字以上で入力してください。'),
  confirmPassword: z.string().min(1, '確認用パスワードを入力してください。'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません。',
  path: ['confirmPassword'],
});

const b2bRegistrationSchema = businessInfoSchema
  .merge(personalInfoSchema)
  .merge(addressSchema)
  .merge(passwordSchema);

type B2BRegistrationFormData = z.infer<typeof b2bRegistrationSchema>;

// =====================================================
// Step Components
// =====================================================

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  currentStep: number;
  totalSteps: number;
}

// Step 1: Business Information
function BusinessInfoStep({
  register,
  errors,
  watch,
}: {
  register: any;
  errors: any;
  watch: any;
}) {
  const businessType = watch('businessType');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          法人情報
        </h3>

        {/* 법인 형태 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            法人形態 <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="CORPORATION"
                {...register('businessType')}
                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                株式会社
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="SOLE_PROPRIETOR"
                {...register('businessType')}
                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                個人事業主
              </span>
            </label>
          </div>
          {errors.businessType && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.businessType.message}
            </p>
          )}
        </div>

        {/* 회사명 */}
        <Input
          label="会社名"
          placeholder="株式会社〇〇"
          error={errors.companyName?.message}
          required
          {...register('companyName')}
          className="mb-4"
        />

        {/*法人番号 (법인만) */}
        {businessType === 'CORPORATION' && (
          <Input
            label="法人番号"
            placeholder="1234567890123"
            error={errors.corporateNumber?.message}
            {...register('corporateNumber')}
            className="mb-4"
          />
        )}

        {/* 설립 연도 */}
        <Input
          label="設立年"
          placeholder="2020"
          error={errors.foundedYear?.message}
          {...register('foundedYear')}
          className="mb-4"
        />

        {/* 자본금 */}
        <Input
          label="資本金"
          placeholder="1,000万円"
          error={errors.capital?.message}
          {...register('capital')}
          className="mb-4"
        />

        {/* 대표자명 */}
        <Input
          label="代表者名"
          placeholder="山田 太郎"
          error={errors.representativeName?.message}
          {...register('representativeName')}
        />
      </div>
    </div>
  );
}

// Step 2: Personal Information
function PersonalInfoStep({
  register,
  errors,
}: {
  register: any;
  errors: any;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          担当者情報
        </h3>

        {/* 성 (한자) */}
        <Input
          label="姓（漢字）"
          placeholder="山田"
          error={errors.kanjiLastName?.message}
          required
          {...register('kanjiLastName')}
          className="mb-4"
        />

        {/* 명 (한자) */}
        <Input
          label="名（漢字）"
          placeholder="太郎"
          error={errors.kanjiFirstName?.message}
          required
          {...register('kanjiFirstName')}
          className="mb-4"
        />

        {/* 성 (카타카나) */}
        <Input
          label="姓（カタカナ）"
          placeholder="ヤマダ"
          error={errors.kanaLastName?.message}
          required
          {...register('kanaLastName')}
          className="mb-4"
        />

        {/* 명 (카타카나) */}
        <Input
          label="名（カタカナ）"
          placeholder="タロウ"
          error={errors.kanaFirstName?.message}
          required
          {...register('kanaFirstName')}
          className="mb-4"
        />

        {/* 이메일 */}
        <Input
          label="メールアドレス"
          type="email"
          placeholder="example@company.com"
          error={errors.email?.message}
          required
          {...register('email')}
          className="mb-4"
        />

        {/* 전화번호 */}
        <Input
          label="電話番号"
          type="tel"
          placeholder="03-1234-5678"
          error={errors.corporatePhone?.message}
          required
          {...register('corporatePhone')}
        />
      </div>
    </div>
  );
}

// Step 3: Address Information
function AddressInfoStep({
  register,
  errors,
}: {
  register: any;
  errors: any;
}) {
  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          住所情報
        </h3>

        {/* 우편번호 */}
        <Input
          label="郵便番号"
          placeholder="123-4567"
          error={errors.postalCode?.message}
          required
          {...register('postalCode')}
          className="mb-4"
        />

        {/* 도도부현 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            都道府県 <span className="text-red-500">*</span>
          </label>
          <select
            {...register('prefecture')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">選択してください</option>
            {prefectures.map((pref) => (
              <option key={pref} value={pref}>
                {pref}
              </option>
            ))}
          </select>
          {errors.prefecture && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.prefecture.message}
            </p>
          )}
        </div>

        {/* 시구정촌 */}
        <Input
          label="市区町村"
          placeholder="〇〇市"
          error={errors.city?.message}
          required
          {...register('city')}
          className="mb-4"
        />

        {/* 번지 */}
        <Input
          label="番地"
          placeholder="1-2-3"
          error={errors.street?.message}
          required
          {...register('street')}
          className="mb-4"
        />

        {/* 빌딩명 */}
        <Input
          label="建物名"
          placeholder="〇〇ビル 5階"
          error={errors.building?.message}
          {...register('building')}
        />
      </div>
    </div>
  );
}

// Step 4: Password & Document Upload
function PasswordDocumentStep({
  register,
  errors,
  fileError,
  file,
  onFileChange,
}: {
  register: any;
  errors: any;
  fileError: string | null;
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          パスワード設定
        </h3>

        {/* 비밀번호 */}
        <Input
          label="パスワード"
          type="password"
          placeholder="8文字以上"
          error={errors.password?.message}
          required
          {...register('password')}
          className="mb-4"
        />

        {/* 비밀번호 확인 */}
        <Input
          label="パスワード（確認）"
          type="password"
          placeholder="同じパスワードを入力"
          error={errors.confirmPassword?.message}
          required
          {...register('confirmPassword')}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          書類アップロード
        </h3>

        {/* 사업자등록증 업로드 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            事業証明書（任意）
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={onFileChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            PDF, JPG, PNG形式（最大10MB）
          </p>
          {file && (
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              選択されたファイル: {file.name}
            </p>
          )}
          {fileError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fileError}
            </p>
          )}
        </div>
      </div>

      {/* 이용약관 동의 */}
      <div className="space-y-4">
        <label className="flex items-start space-x-2 cursor-pointer">
          <input
            {...register('agreeTerms' as any, { required: true })}
            type="checkbox"
            className="w-4 h-4 mt-1 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            <a href="/terms" className="text-amber-600 hover:text-amber-700">
              利用規約
            </a>
            に同意する
          </span>
        </label>
        {errors.agreeTerms && (
          <p className="text-sm text-red-600 dark:text-red-400">
            利用規約に同意してください。
          </p>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Main Page Component
// =====================================================

export default function B2BRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [businessFile, setBusinessFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<B2BRegistrationFormData>({
    resolver: zodResolver(b2bRegistrationSchema),
    mode: 'onBlur',
  });

  // 스텝 유효성 검사 및 이동
  const handleNext = async () => {
    const fieldsToValidate: Record<number, string[]> = {
      1: ['businessType', 'companyName'],
      2: ['kanjiLastName', 'kanjiFirstName', 'kanaLastName', 'kanaFirstName', 'email', 'corporatePhone'],
      3: ['postalCode', 'prefecture', 'city', 'street'],
      4: ['password', 'confirmPassword'],
    };

    const fields = fieldsToValidate[currentStep as keyof typeof fieldsToValidate];
    const isValid = await trigger(fields as any);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // 파일 변경 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (file) {
      // 파일 크기 검증 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFileError('ファイルサイズは10MB以下にしてください。');
        return;
      }

      // 파일 형식 검증
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setFileError('PDF、JPG、PNG形式のみ対応しています。');
        return;
      }

      setBusinessFile(file);
    }
  };

  // 폼 제출 핸들러
  const onSubmit: SubmitHandler<B2BRegistrationFormData> = async (data) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      if (businessFile) {
        formData.append('businessRegistrationFile', businessFile);
      }

      const response = await fetch('/api/b2b/register', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '会員登録に失敗しました。');
      }

      // 성공: 이메일 인증 페이지로 이동
      router.push('/b2b/register/sent');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '会員登録に失敗しました。';
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* 로고 및 헤딩 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              EPACKAGE Lab
            </h1>
          </Link>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
            B2B会員登録
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            ステップ {currentStep} / {totalSteps}
          </p>
        </div>

        {/* 진행 바 */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 mx-1 rounded ${
                  index + 1 <= currentStep
                    ? 'bg-amber-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>法人情報</span>
            <span>担当者情報</span>
            <span>住所情報</span>
            <span>パスワード</span>
          </div>
        </div>

        {/* 폼 카드 */}
        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* 서버 에러 메시지 */}
            {serverError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
              </div>
            )}

            {/* 스텝별 폼 */}
            {currentStep === 1 && (
              <BusinessInfoStep register={register} errors={errors} watch={watch} />
            )}
            {currentStep === 2 && (
              <PersonalInfoStep register={register} errors={errors} />
            )}
            {currentStep === 3 && (
              <AddressInfoStep register={register} errors={errors} />
            )}
            {currentStep === 4 && (
              <PasswordDocumentStep
                register={register}
                errors={errors}
                fileError={fileError}
                file={businessFile}
                onFileChange={handleFileChange}
              />
            )}

            {/* 네비게이션 버튼 */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  disabled={isSubmitting}
                >
                  前へ
                </Button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  次へ
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '送信中...' : '登録する'}
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* 로그인 링크 */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            すでにB2B会員登録がお済みの方{' '}
            <Link
              href="/b2b/login"
              className="text-amber-600 hover:text-amber-700 dark:text-amber-500 font-medium"
            >
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
