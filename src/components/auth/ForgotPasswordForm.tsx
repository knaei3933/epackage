/**
 * Forgot Password Form Component
 *
 * パスワード再設定メール送信フォーム
 * - メールアドレス入力
 * - React Hook Form + Zod 検証
 * - API: /api/auth/forgot-password
 */

'use client';

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Input, Button, Card } from '@/components/ui';
import { z } from 'zod';

// =====================================================
// Schema
// =====================================================

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください。')
    .email('有効なメールアドレスを入力してください。'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// =====================================================
// Props
// =====================================================

export interface ForgotPasswordFormProps {
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

export default function ForgotPasswordForm({
  onSuccess,
  onError,
  className,
}: ForgotPasswordFormProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // React Hook Form 設定
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onBlur',
  });

  // フォーム提出ハンドラー
  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      console.log('[ForgotPasswordForm] Sending reset email for:', data.email);

      // API呼び出し
      const response = await fetch('/api/auth/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'メールの送信に失敗しました。');
      }

      console.log('[ForgotPasswordForm] Reset email sent successfully');

      // 成功処理
      setSuccessMessage(
        'パスワード再設定用のリンクをメールでお送りしました。メールをご確認ください。'
      );
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'メールの送信に失敗しました。';
      console.error('[ForgotPasswordForm] Error:', errorMessage);
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

        {/* 成功メッセージ */}
        {successMessage && (
          <div className="mb-6 p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
            <p className="text-sm text-success-600 dark:text-success-400">
              {successMessage}
            </p>
            <p className="text-xs text-success-600 dark:text-success-400 mt-2">
              メールが届かない場合は、迷惑メールフォルダをご確認ください。
            </p>
          </div>
        )}

        {/* =====================================================
            メールアドレス
            ===================================================== */}
        <div className="mb-6">
          <Input
            label="メールアドレス"
            type="email"
            placeholder="example@company.com"
            error={errors.email?.message}
            required
            {...register('email')}
          />
          <p className="text-xs text-text-muted mt-2">
            ご登録のメールアドレスにパスワード再設定用のリンクをお送りします。
          </p>
        </div>

        {/* =====================================================
            送信ボタン
            ===================================================== */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting || !!successMessage}
          className="w-full mb-4"
        >
          {isSubmitting ? '送信中...' : '再設定メールを送信'}
        </Button>
      </form>
    </Card>
  );
}
