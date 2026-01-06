/**
 * B2B Email Verification Page
 *
 * B2B 회원가입 이메일 인증 페이지
 * - 이메일 인증 토큰 검증
 * - 회원가입 완료 처리
 */

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const email = searchParams.get('email');
      const token = searchParams.get('token');

      if (!email || !token) {
        setStatus('error');
        setMessage('必要な情報が不足しています。');
        return;
      }

      try {
        const response = await fetch('/api/b2b/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, token }),
        });

        const result = await response.json();

        if (!response.ok) {
          if (result.code === 'TOKEN_EXPIRED') {
            setStatus('expired');
          } else {
            setStatus('error');
          }
          setMessage(result.error || '認証に失敗しました。');
          return;
        }

        setStatus('success');
        setMessage(result.message || 'メールアドレス認証が完了しました。');
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('認証処理中にエラーが発生しました。');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleResendEmail = async () => {
    const email = searchParams.get('email');
    if (!email) return;

    try {
      const response = await fetch('/api/b2b/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || '再送に失敗しました。');
        return;
      }

      alert('認証メールを再送しました。');
    } catch (error) {
      console.error('Resend error:', error);
      alert('再送中にエラーが発生しました。');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              EPACKAGE Lab
            </h1>
          </Link>
        </div>

        {/* Card */}
        <Card className="p-8">
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                認証処理中
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                しばらくお待ちください...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                認証完了
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                現在、管理者の承認待ちです。承認完了次第、メールにてお知らせいたします。
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/b2b/login')}
                  variant="primary"
                  className="w-full"
                >
                  ログインページへ
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full"
                >
                  トップページへ
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                認証エラー
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  variant="primary"
                  className="w-full"
                >
                  認証メールを再送する
                </Button>
                <Button
                  onClick={() => router.push('/b2b/register')}
                  variant="outline"
                  className="w-full"
                >
                  会員登録に戻る
                </Button>
              </div>
            </div>
          )}

          {/* Expired State */}
          {status === 'expired' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                有効期限切れ
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                認証リンクの有効期限が切れています。
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                認証メールは24時間有効です。再度認証メールを送信してください。
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  variant="primary"
                  className="w-full"
                >
                  認証メールを再送する
                </Button>
                <Button
                  onClick={() => router.push('/b2b/register')}
                  variant="outline"
                  className="w-full"
                >
                  会員登録に戻る
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <Link href="/b2b/login" className="text-amber-600 hover:text-amber-700 dark:text-amber-500 font-medium">
              ログイン
            </Link>
            {' '} | {' '}
            <Link href="/" className="text-amber-600 hover:text-amber-700 dark:text-amber-500 font-medium">
              トップページ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
