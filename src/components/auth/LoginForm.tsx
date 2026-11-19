/**
 * Login Form Component
 *
 * ログインフォームコンポーネントです。
 * - Attempt 52: URL parameter-based auth for Next.js 15/16
 * - Uses URL hash to pass auth token to dashboard (bypasses cookie limitations)
 *
 * @updated 2026-02-10-attempt52 URL parameter auth
 */

'use client';

import React, { useState, Suspense } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Button, Card, Alert } from '@/components/ui';
import { loginSchema, type LoginFormData } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

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
  const { signIn } = useAuth(); // ✅ AuthContextを使用

  // Default redirect based on user role
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

  // =====================================================
  // フォーム送信ハンドラー (AuthContext.signIn()を使用)
  // =====================================================
  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      console.log('[LoginForm] Using AuthContext.signIn for:', data.email);

      // ✅ CRITICAL FIX: AuthContext.signIn()を使用してステートスを更新
      // これにより、Header.tsxのisAuthenticatedステートスが更新される
      await signIn(data.email, data.password);

      console.log('[LoginForm] Login successful');

      // Success callback
      onSuccess?.();

      // Determine redirect URL (AuthContext.signIn()がステートスを更新済み）
      const redirectUrl = callbackUrl || getDefaultRedirect();
      console.log('[LoginForm] Redirecting to:', redirectUrl);

      // ✅ CRITICAL FIX: router.refresh()をawaitする
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay for cookie processing
      router.push(redirectUrl);
      await router.refresh(); // ✅ awaitする
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
          <Alert variant="destructive" className="mb-6">{serverError}</Alert>
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
          placeholder="•••••••••"
          error={errors.password?.message}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex h-10 w-10 items-center justify-center rounded-md text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand max-sm:h-11 max-sm:w-11"
              aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          }
          {...register('password')}
          className="mb-4"
        />

        {/* =====================================================
            ログイン維持 & パスワード再設定
            ===================================================== */}
        <div className="flex items-center justify-between mb-6">
          <label className="flex min-h-11 cursor-pointer items-center space-x-2">
            <input
              {...register('remember')}
              type="checkbox"
              className="h-4 w-4 rounded-inner border-border-strong accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            />
            <span className="text-sm text-text-primary">
              ログイン状態を保持
            </span>
          </label>

          <a
            href="/auth/forgot-password"
            className="inline-flex min-h-11 items-center rounded-inner text-sm text-brand underline underline-offset-4 hover:text-brand-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
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
          <p className="text-sm text-text-secondary">
            まだアカウントをお持ちでない方{' '}
            <a
              href="/auth/register"
              className="inline-flex min-h-11 items-center rounded-inner font-medium text-brand underline underline-offset-4 hover:text-brand-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              会員登録
            </a>
          </p>
        </div>
      </form>
    </Card>
  );
}

// Export with Suspense boundary for useSearchParams()
export default function LoginForm(props: LoginFormProps) {
  return (
    <Suspense fallback={<div className="text-text-secondary">Loading...</div>}>
      <LoginFormContent {...props} />
    </Suspense>
  );
}
