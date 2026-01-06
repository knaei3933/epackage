/**
 * B2B Login Page
 *
 * B2B 専用ログインページ
 * - /api/b2b/login API 連携
 * - React Hook Form + Zod 検証
 * - 日本語 UI
 * - パスワード表示切替
 * - 「ログイン状態を保持」機能
 * - パスワード再設定リンク
 * - エラーコード別日本語メッセージ
 */

'use client';

import React, { useState, Suspense } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input, Button, Card } from '@/components/ui';
import { z } from 'zod';

// =====================================================
// Validation Schema
// =====================================================

const b2bLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください。')
    .email('有効なメールアドレスを入力してください。'),
  password: z.string().min(1, 'パスワードを入力してください。'),
  remember: z.boolean().optional(),
});

type B2BLoginFormData = z.infer<typeof b2bLoginSchema>;

// =====================================================
// Client Component with useSearchParams
// =====================================================

function B2BLoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('redirect') || searchParams.get('callbackUrl') || '/member/dashboard';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // React Hook Form 設定
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<B2BLoginFormData>({
    resolver: zodResolver(b2bLoginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
    mode: 'onBlur',
  });

  // エラーコード別日本語メッセージマップ
  const getErrorMessage = (code: string, defaultMessage: string): string => {
    const errorMessages: Record<string, string> = {
      INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません。',
      PROFILE_NOT_FOUND: 'ユーザープロフィールが見つかりません。管理者にお問い合わせください。',
      NOT_B2B_USER: 'このページはB2B会員専用です。通常の会員ログインをご利用ください。',
      EMAIL_NOT_VERIFIED: 'メールアドレス認証が完了していません。認証メールを確認してください。',
      PENDING_APPROVAL: '会員登録はまだ承認されていません。管理者の承認をお待ちください。',
      ACCOUNT_SUSPENDED: 'このアカウントは停止されています。お問い合わせください。',
      ACCOUNT_DELETED: 'このアカウントは削除されています。',
      VALIDATION_ERROR: '入力内容を確認してください。',
      INTERNAL_ERROR: 'ログイン処理中にエラーが発生しました。',
    };
    return errorMessages[code] || defaultMessage;
  };

  // フォーム送信ハンドラー
  const onSubmit: SubmitHandler<B2BLoginFormData> = async (data) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      // B2B ログイン API 呼び出し
      const response = await fetch('/api/b2b/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // エラーコードに基づいて日本語エラーメッセージを表示
        const errorCode = result.code || 'INTERNAL_ERROR';
        throw new Error(getErrorMessage(errorCode, result.error || 'ログインに失敗しました。'));
      }

      // 成功処理
      console.log('[B2B Login] Success:', result);

      // リダイレクト（window.location.hrefを使用して完全リロード）
      window.location.href = callbackUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました。';
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* ロゴおよびヘディング */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              EPACKAGE Lab
            </h1>
          </Link>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
            B2B会員ログイン
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            B2B会員登録がお済みの方はこちらからログインしてください
          </p>
        </div>

        {/* フォームカード */}
        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* サーバーエラーメッセージ */}
            {serverError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
              </div>
            )}

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
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                  aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              }
              {...register('password')}
              className="mb-4"
            />

            {/* ログイン維持およびパスワード再設定 */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  {...register('remember')}
                  type="checkbox"
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  ログイン状態を保持
                </span>
              </label>

              <Link
                href="/auth/forgot-password"
                className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 font-medium"
              >
                パスワードを忘れた方
              </Link>
            </div>

            {/* 送信ボタン */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full mb-4"
            >
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </Button>

            {/* 会員登録リンク */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                まだB2B会員登録がお済みでない方{' '}
                <Link
                  href="/b2b/register"
                  className="text-amber-600 hover:text-amber-700 dark:text-amber-500 font-medium"
                >
                  B2B会員登録
                </Link>
              </p>
            </div>
          </form>
        </Card>

        {/* 通常会員ログインリンク */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            通常の会員の方は{' '}
            <Link
              href="/auth/signin"
              className="text-amber-600 hover:text-amber-700 dark:text-amber-500 font-medium"
            >
              こちら
            </Link>
          </p>
        </div>

        {/* お問い合わせリンク */}
        <div className="text-center mt-4">
          <Link
            href="/contact"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ログインにお困りの方はお問い合わせください
          </Link>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Page Component (with Suspense boundary)
// =====================================================

export default function B2BLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
      <B2BLoginFormContent />
    </Suspense>
  );
}
