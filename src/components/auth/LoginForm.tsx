/**
 * Login Form Component
 *
 * 로그인 폼 컴포넌트입니다.
 * - Supabase Authentication (via /api/auth/signin)
 * - React Hook Form + Zod 검증
 * - 서버 사이드 쿠키 설정
 */

'use client';

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Button, Card } from '@/components/ui';
import { loginSchema, type LoginFormData } from '@/types/auth';

// =====================================================
// Props
// =====================================================

export interface LoginFormProps {
  /** 제출 성공 시 콜백 */
  onSuccess?: () => void;
  /** 제출 실패 시 콜백 */
  onError?: (error: string) => void;
  /** 추가 클래스명 */
  className?: string;
}

// =====================================================
// Component
// =====================================================

export default function LoginForm({ onSuccess, onError, className }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Default redirect based on user role
  const getDefaultRedirect = (role?: string) => {
    if (role === 'ADMIN') {
      return '/admin/dashboard';
    }
    return '/member/dashboard';
  };

  // Use redirect param if provided
  const callbackUrl = searchParams.get('redirect') || searchParams.get('callbackUrl');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // React Hook Form 설정
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

  // 폼 제출 핸들러
  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      console.log('[LoginForm] Attempting login for:', data.email);

      // API를 호출하여 로그인 (서버 사이드에서 쿠키 설정)
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
        throw new Error(result.error || '로그인에 실패했습니다.');
      }

      console.log('[LoginForm] Login successful:', result);

      // 성공 처리
      onSuccess?.();

      // Determine redirect URL based on user role from API response
      const redirectParam = searchParams.get('redirect') || searchParams.get('callbackUrl');
      const redirectUrl = redirectParam || getDefaultRedirect(result.user?.role);

      console.log('[LoginForm] Redirecting to:', redirectUrl, '(role:', result.user?.role, ')');

      // Use window.location.href to force full page reload
      // This ensures Supabase cookies are properly set before navigation
      window.location.href = redirectUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました。';
      console.error('[LoginForm] Login error:', errorMessage);
      setServerError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 md:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className={className}>
        {/* 서버 에러 메시지 */}
        {serverError && (
          <div className="mb-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
            <p className="text-sm text-error-600 dark:text-error-400">{serverError}</p>
          </div>
        )}

        {/* =====================================================
            이메일
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
            로그인 유지 & 비밀번호 재설정
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
            전송 버튼
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
            회원가입 링크
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
