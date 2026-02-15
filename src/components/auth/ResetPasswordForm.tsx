/**
 * Reset Password Form Component
 *
 * パスワード再設定フォーム
 * - 新しいパスワード入力
 * - トークン検証
 * - React Hook Form + Zod 検証
 * - API: /api/auth/reset-password
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Button, Card } from '@/components/ui';
import { z } from 'zod';

// =====================================================
// Schema
// =====================================================

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'パスワードは最低8文字以上である必要があります。')
      .regex(/[A-Z]/, 'パスワードには少なくとも1つの大文字を含める必要があります。')
      .regex(/[a-z]/, 'パスワードには少なくとも1つの小文字を含める必要があります。')
      .regex(/[0-9]/, 'パスワードには少なくとも1つの数字を含める必要があります。'),
    passwordConfirm: z.string().min(1, 'パスワード確認を入力してください。'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'パスワードが一致しません。',
    path: ['passwordConfirm'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// =====================================================
// Props
// =====================================================

export interface ResetPasswordFormProps {
  /** 提出成功時のコールバック */
  onSuccess?: () => void;
  /** 提出失敗時のコールバック */
  onError?: (error: string) => void;
  /** 追加クラス名 */
  className?: string;
}

// =====================================================
// Component
// =====================================================

function ResetPasswordFormContent({
  onSuccess,
  onError,
  className,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLからトークンを取得
  const token = searchParams.get('token');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // トークン検証
  useEffect(() => {
    if (!token) {
      setServerError(
        '無効なリンクです。再度パスワード再設定をやり直してください。'
      );
    }
  }, [token]);

  // React Hook Form 設定
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      passwordConfirm: '',
    },
    mode: 'onBlur',
  });

  // フォーム提出ハンドラー
  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    if (!token) {
      setServerError('無効なリンクです。再度パスワード再設定をやり直してください。');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      console.log('[ResetPasswordForm] Resetting password with token');

      // API呼び出し
      const response = await fetch('/api/auth/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          token,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'パスワードの再設定に失敗しました。');
      }

      console.log('[ResetPasswordForm] Password reset successfully');

      // 成功処理
      alert('パスワードを再設定しました。ログイン画面に移動します。');
      onSuccess?.();

      // ログインページへリダイレクト
      router.push('/auth/signin');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'パスワードの再設定に失敗しました。';
      console.error('[ResetPasswordForm] Error:', errorMessage);
      setServerError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // トークンがない場合はエラーを表示
  if (!token) {
    return (
      <Card className="p-6 md:p-8">
        <div className="mb-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
          <p className="text-sm text-error-600 dark:text-error-400 mb-4">
            {serverError || '無効なリンクです。'}
          </p>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => router.push('/auth/forgot-password')}
          >
            パスワード再設定をやり直す
          </Button>
        </div>
      </Card>
    );
  }

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
            新しいパスワード
            ===================================================== */}
        <Input
          label="新しいパスワード"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.password?.message}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-text-muted hover:text-text-primary"
              tabIndex={-1}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          }
          {...register('password')}
          className="mb-4"
        />

        {/* =====================================================
            パスワード確認
            ===================================================== */}
        <Input
          label="パスワード確認"
          type={showPasswordConfirm ? 'text' : 'password'}
          placeholder="••••••••"
          error={errors.passwordConfirm?.message}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="text-text-muted hover:text-text-primary"
              tabIndex={-1}
            >
              {showPasswordConfirm ? '👁️' : '👁️‍🗨️'}
            </button>
          }
          {...register('passwordConfirm')}
          className="mb-6"
        />

        {/* =====================================================
            送信ボタン
            ===================================================== */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? '設定中...' : 'パスワードを再設定'}
        </Button>
      </form>
    </Card>
  );
}

//Suspense boundary for useSearchParams
export default function ResetPasswordForm(props: ResetPasswordFormProps) {
  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-lg h-96" />}>
      <ResetPasswordFormContent {...props} />
    </Suspense>
  );
}
