/**
 * B2B Registration Sent Page
 *
 * B2B 회원가입 완료 페이지 (이메일 발송 후)
 * - 이메일 인증 대기 안내
 * - 재발송 기능
 */

'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';

function SentEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (!email) return;

    setIsResending(true);
    setResendMessage('');

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
        setResendMessage(result.error || '再送に失敗しました。');
        return;
      }

      setResendMessage('認証メールを再送しました。');
    } catch (error) {
      console.error('Resend error:', error);
      setResendMessage('再送中にエラーが発生しました。');
    } finally {
      setIsResending(false);
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
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              会員登録申請ありがとうございます
            </h2>

            <p className="text-gray-600 dark:text-gray-400">
              以下のメールアドレスに認証メールを送信しました。
            </p>
          </div>

          {/* Email Display */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              送信先メールアドレス
            </p>
            <p className="text-base font-medium text-gray-900 dark:text-white break-all">
              {email || 'example@company.com'}
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold">1</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                メールに記載された認証リンクをクリックしてください。
              </p>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold">2</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                認証後、管理者による審査が行われます。
              </p>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold">3</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                審査完了次第、ログイン可能になります。
              </p>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                  ご注意ください
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  認証リンクの有効期限は<strong>24時間</strong>です。期限切れの場合は、以下のボタンから再送してください。
                </p>
              </div>
            </div>
          </div>

          {/* Resend Message */}
          {resendMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              resendMessage.includes('失敗')
                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
            }`}>
              {resendMessage}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? '送信中...' : '認証メールを再送する'}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => router.push('/b2b/login')}
                variant="primary"
              >
                ログイン
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
              >
                トップページ
              </Button>
            </div>
          </div>
        </Card>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            メールが届かない場合は？
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
            迷惑メールフォルダをご確認ください。
          </p>
          <Link
            href="/contact"
            className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 font-medium"
          >
            お問い合わせ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterSentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      </div>
    }>
      <SentEmailContent />
    </Suspense>
  );
}
