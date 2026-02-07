/**
 * Login Form Component
 *
 * ログインフォームコンポーネントです。
 * - Supabase Authentication (via /api/auth/signin)
 * - React Hook Form + Zod検証
 * - サーバーサイドCookie設定
 */

'use client';

import React, { useState, Suspense } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Button, Card } from '@/components/ui';
import { loginSchema, type LoginFormData } from '@/types/auth';

// =====================================================
// Props
// =====================================================

export interface LoginFormProps {
  /** 送信成功時コールバック */
  onSuccess?: () => void;
  /** 送信失敗時コールバック */
  onError?: (error: string) => void;
  /** 追加クラス名 */
  className?: string;
}

// =====================================================
// Component
// =====================================================

function LoginFormContent({ onSuccess, onError, className }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Default redirect based on user role (normalize to lowercase for consistency)
  const getDefaultRedirect = (role?: string) => {
    if (role?.toLowerCase() === 'admin') {
      return '/admin/dashboard';
    }
    return '/member/dashboard';
  };

  // Use redirect param if provided
  const callbackUrl = searchParams.get('redirect') || searchParams.get('callbackUrl');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // React Hook Form設定
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  // フォーム送信ハンドラー
  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      console.log('[LoginForm] Attempting login for:', data.email);

      // APIを呼び出してログイン (サーバーサイドでCookie設定)
      // Note: Use trailing slash to avoid 308 redirect (next.config.ts has trailingSlash: true)
      const response = await fetch('/api/auth/signin/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies for authentication
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'ログインに失敗しました。');
      }

      console.log('[LoginForm] Login successful:', result);

      // 成功処理
      onSuccess?.();

      // Use redirect URL from server response (determined by role)
      // Server has already computed the correct redirect based on user role
      const redirectUrl = result.redirectUrl || getDefaultRedirect(result.user?.role);

      console.log('[LoginForm] Redirecting to:', redirectUrl, '(role:', result.user?.role, ')');

      // Wait for cookies to be set in browser, then navigate
      // Use a simple timeout approach - this is more reliable than session verification
      // because the cookies are already set by the server response
      setTimeout(() => {
        console.log('[LoginForm] Navigating to:', redirectUrl);
        // Use window.location.href for full page reload
        // This ensures cookies are sent with the request
        window.location.href = redirectUrl;
      }, 100);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました。';
      console.warn('[LoginForm] Login failed:', errorMessage);
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
            メールアドレス
            ===================================================== */}
        <Input
          label="メールアドレス"
          type="email"
          placeholder="example@company.com"
          error={errors.email?.message}
          required
          {...register('email')}
          className="mb-4"
        />

        {/* =====================================================
            パスワード
            ===================================================== */}
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
          className="mb-4"
        />

        {/* =====================================================
            ログイン維持 & パスワード再設定
            ===================================================== */}
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              {...register('remember')}
              type="checkbox"
              className="w-4 h-4 text-brixa-500"
            />
            <span className="text-sm text-text-primary">
              ログイン状態を保持
            </span>
          </label>

          <a
            href="/auth/forgot-password"
            className="text-sm text-brixa-500 hover:text-brixa-600"
          >
            パスワードを忘れた方
          </a>
        </div>

        {/* =====================================================
            送信ボタン
            ===================================================== */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="w-full mb-4"
        >
          {isSubmitting ? 'ログイン中...' : 'ログイン'}
        </Button>

        {/* =====================================================
            会員登録リンク
            ===================================================== */}
        <div className="text-center">
          <p className="text-sm text-text-muted">
            まだアカウントをお持ちでない方{' '}
            <a
              href="/auth/register"
              className="text-brixa-500 hover:text-brixa-600 font-medium"
            >
              会員登録
            </a>
          </p>
        </div>
      </form>
    </Card>
  );
}

// Export without Suspense boundary to avoid router issues
// Note: This component uses useSearchParams which requires Suspense in Next.js 15+
// To avoid router issues, we're using window.location.replace() instead of router.push()
export default function LoginForm(props: LoginFormProps) {
  return <LoginFormContent {...props} />;
}
