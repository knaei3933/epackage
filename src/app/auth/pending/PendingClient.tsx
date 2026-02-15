/**
 * Pending Page Client Component
 *
 * サーバーコンポーネントからデータを受け取って表示
 * - 認証チェック
 * - プロフィール自動作成
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Initialize Supabase client for browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PendingClientProps {
  message?: string;
  email?: string;
}

type ProfileStatus = 'loading' | 'no_session' | 'email_not_verified' | 'pending_approval' | 'error';

// Parse URL hash parameters
function parseHashParams(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  const hashWithoutHash = hash.startsWith('#') ? hash.slice(1) : hash;

  hashWithoutHash.split('&').forEach(param => {
    const [key, value] = param.split('=');
    if (key && value) {
      params[key] = decodeURIComponent(value);
    }
  });

  return params;
}

export default function PendingClient({
  message,
  email,
}: PendingClientProps) {
  const [status, setStatus] = useState<ProfileStatus>('loading');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function checkAuthAndCreateProfile() {
      try {
        // First, check if there are tokens in the URL hash (from email verification link)
        const hashParams = parseHashParams(window.location.hash);

        if (hashParams.access_token) {
          console.log('[PendingClient] Found access_token in URL hash, setting session...');

          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: hashParams.access_token,
            refresh_token: hashParams.refresh_token || '',
          });

          if (sessionError) {
            console.error('[PendingClient] Error setting session:', sessionError);
            setStatus('error');
            setErrorMessage('セッションの設定に失敗しました。');
            return;
          }

          console.log('[PendingClient] Session set successfully:', sessionData.user?.email);

          // Clear the hash from URL to avoid re-processing
          window.history.replaceState({}, document.title, window.location.pathname);

          // Continue with profile creation using the new session
          if (sessionData.user) {
            await processUser(sessionData.user);
            return;
          }
        }

        // Check if there's an existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.log('[PendingClient] No session found');
          setStatus('no_session');
          setUserEmail(email || '');
          return;
        }

        console.log('[PendingClient] Session found:', session.user?.email);

        const user = session.user;
        await processUser(user);
      } catch (error) {
        console.error('[PendingClient] Error:', error);
        setStatus('error');
        setErrorMessage('エラーが発生しました。もう一度お試しください。');
      }
    }

    async function processUser(user: any) {
      setUserEmail(user.email || '');

      // Check if email is verified
      if (!user.email_confirmed_at) {
        console.log('[PendingClient] Email not verified');
        setStatus('email_not_verified');
        return;
      }

      console.log('[PendingClient] Email verified, creating profile...');

      // Create profile directly using service role
      const response = await fetch('/api/auth/register/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          userMetadata: user.user_metadata || {},
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[PendingClient] Profile created:', data);

        // Get user metadata for name
        const metadata = user.user_metadata || {};
        setUserName(`${metadata.kanji_last_name || ''} ${metadata.kanji_first_name || ''}`.trim());
        setStatus('pending_approval');
      } else {
        const errorData = await response.json();
        console.error('[PendingClient] Profile creation failed:', errorData);

        // Check if profile already exists
        if (errorData.error?.code === '23505') {
          // Profile already exists, just show pending approval
          console.log('[PendingClient] Profile already exists');
          const metadata = user.user_metadata || {};
          setUserName(`${metadata.kanji_last_name || ''} ${metadata.kanji_first_name || ''}`.trim());
          setStatus('pending_approval');
        } else {
          setStatus('error');
          setErrorMessage('プロフィールの作成に失敗しました。');
        }
      }
    }

    checkAuthAndCreateProfile();
  }, [email]);

  // メッセージがあればデコード
  const displayMessage = message ? decodeURIComponent(message) : null;

  // Loading state
  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-accent flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-bg-secondary rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <h1 className="text-xl font-bold text-text-primary mb-2">
              読み込み中...
            </h1>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-accent flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-bg-secondary rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              エラー
            </h1>
            <p className="text-text-muted mb-6">{errorMessage}</p>
            <Link
              href="/auth/signin"
              className="inline-block w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
            >
              ログインページへ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // No session - email verification needed
  if (status === 'no_session') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-accent flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-bg-secondary rounded-lg shadow-lg p-8 text-center">
            {/* アイコン */}
            <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0l7.08-5.26a2 2 0 002.22 0l7.89-5.26M3 16l7.89-5.26a2 2 0 002.22 0l7.08-5.26M3 8l7.89 5.26a2 2 0 002.22 0l7.08-5.26M3 16l7.89-5.26a2 2 0 002.22 0l7.08-5.26"
                />
              </svg>
            </div>

            {/* タイトル */}
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              メール認証が必要です
            </h1>

            {/* 説明 */}
            <div className="text-left bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg mb-6">
              <p className="text-text-primary mb-2">
                入力されたメールアドレスに確認メールを送信しました。
              </p>
              <p className="text-text-muted text-sm mb-3">
                メール内のリンクをクリックして、メール認証を完了してください。
              </p>
              {userEmail && (
                <div className="bg-white dark:bg-bg-secondary p-3 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-text-muted mb-1">登録メールアドレス:</p>
                  <p className="text-sm font-mono break-all">{userEmail}</p>
                </div>
              )}
            </div>

            {/* ログインページリンク */}
            <Link
              href="/auth/signin"
              className="inline-block w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors mb-3"
            >
              ログインページへ
            </Link>

            {/* ホームへリンク */}
            <Link
              href="/"
              className="block text-sm text-text-muted hover:text-brixa-500"
            >
              ホームへ戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Email not verified
  if (status === 'email_not_verified') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-accent flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-bg-secondary rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0l7.08-5.26a2 2 0 002.22 0l7.89-5.26M3 16l7.89-5.26a2 2 0 002.22 0l7.08-5.26M3 8l7.89 5.26a2 2 0 002.22 0l7.08-5.26M3 16l7.89-5.26a2 2 0 002.22 0l7.08-5.26"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              メール認証が必要です
            </h1>
            <div className="text-left bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg mb-6">
              <p className="text-primary mb-2">
                メールアドレスの認証がまだ完了していません。
              </p>
              <p className="text-text-muted text-sm">
                入力されたメールアドレスに確認メールを送信しました。メール内のリンクをクリックして認証を完了してください。
              </p>
            </div>
            <Link
              href="/auth/signin"
              className="inline-block w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
            >
              ログインページへ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Pending approval
  return (
    <main className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-accent flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-bg-secondary rounded-lg shadow-lg p-8 text-center">
          {/* アイコン */}
          <div className="w-16 h-16 mx-auto mb-6 bg-warning-100 dark:bg-warning-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-warning-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* タイトル */}
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            承認待ち
          </h1>

          {/* 説明 */}
          <div className="text-left bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg mb-6">
            <p className="text-text-primary mb-2">
              {displayMessage || `${userName}様、会員登録が完了しました！`}
            </p>
            <p className="text-text-muted text-sm mb-3">
              現在、管理者による承認審査中です。承認完了次第、ログイン可能になります。
            </p>
            {userEmail && (
              <div className="bg-white dark:bg-bg-secondary p-3 rounded border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-text-muted mb-1">登録メールアドレス:</p>
                <p className="text-sm font-mono break-all">{userEmail}</p>
              </div>
            )}
            <p className="text-xs text-text-muted mt-3">
              通常、1〜2営業日以内に承認処理が完了します。
            </p>
          </div>

          {/* ログインページリンク */}
          <Link
            href="/auth/signin"
            className="inline-block w-full px-4 py-2 bg-brixa-500 hover:bg-brixa-600 text-white font-medium rounded-md transition-colors mb-3"
          >
            ログインページへ
          </Link>

          {/* ホームへリンク */}
          <Link
            href="/"
            className="block text-sm text-text-muted hover:text-brixa-500"
          >
            ホームへ
          </Link>
        </div>
      </div>
    </main>
  );
}
