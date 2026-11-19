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
import { Clock, Loader2, Mail, MailWarning, XCircle } from 'lucide-react';
import { AuthStatusCard, AuthNotice, AUTH_TEXT_LINK } from '@/components/auth/AuthShell';
import { buttonVariants } from '@/components/ui';
import { cn } from '@/lib/utils';
import { GoogleAdsConversion } from '@/components/analytics/GoogleAdsConversion';

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

        // Check if profile already exists or has foreign key error (trigger might have created it)
        const errorCode = errorData.error?.code || errorData.details?.includes('23505') ? '23505' :
                        errorData.details?.includes('profiles_id_fkey') ? 'FK_EXISTS' :
                        errorData.details?.includes('duplicate') ? 'DUPLICATE' : null;

        if (errorCode || response.status === 409 || errorData.error?.includes('already exists')) {
          // Profile already exists (created by trigger or duplicate request), show pending approval
          console.log('[PendingClient] Profile already exists or created by trigger');
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

  const loginLink = (extra?: string) => (
    <Link
      href="/auth/signin"
      className={cn(buttonVariants({ variant: 'primary', size: 'lg', fullWidth: true }), extra)}
    >
      ログインページへ
    </Link>
  );

  // 登録メールアドレスの表示（状態色の面の中の、白い小さな箱）
  const emailBox = userEmail ? (
    <div className="rounded-inner border border-border-medium bg-bg-primary p-3 text-text-primary">
      <p className="mb-1 text-xs text-text-secondary">登録メールアドレス:</p>
      <p className="break-all font-mono text-sm">{userEmail}</p>
    </div>
  ) : null;

  // Loading state
  if (status === 'loading') {
    return <AuthStatusCard tone="neutral" icon={Loader2} spin title="読み込み中..." />;
  }

  // Error state
  if (status === 'error') {
    return (
      <AuthStatusCard tone="error" icon={XCircle} title="エラー">
        <p className="mb-6 text-text-secondary">{errorMessage}</p>
        {loginLink()}
      </AuthStatusCard>
    );
  }

  // No session - email verification needed
  if (status === 'no_session') {
    return (
      <AuthStatusCard tone="info" icon={Mail} title="メール認証が必要です">
        {/* 説明 */}
        <AuthNotice tone="info">
          <p className="mb-2">
            入力されたメールアドレスに確認メールを送信しました。
          </p>
          <p className={cn('text-sm', userEmail && 'mb-3')}>
            メール内のリンクをクリックして、メール認証を完了してください。
          </p>
          {emailBox}
        </AuthNotice>

        {/* ログインページリンク */}
        {loginLink('mb-3')}

        {/* ホームへリンク */}
        <Link href="/" className={AUTH_TEXT_LINK}>
          ホームへ戻る
        </Link>
      </AuthStatusCard>
    );
  }

  // Email not verified
  if (status === 'email_not_verified') {
    return (
      <AuthStatusCard tone="warning" icon={MailWarning} title="メール認証が必要です">
        <AuthNotice tone="warning">
          <p className="mb-2">
            メールアドレスの認証がまだ完了していません。
          </p>
          <p className="text-sm">
            入力されたメールアドレスに確認メールを送信しました。メール内のリンクをクリックして認証を完了してください。
          </p>
        </AuthNotice>
        {loginLink()}
      </AuthStatusCard>
    );
  }

  // Pending approval
  return (
    <>
      <GoogleAdsConversion />
      <AuthStatusCard tone="warning" icon={Clock} title="承認待ち">
        {/* 説明 */}
        <AuthNotice tone="warning">
          <p className="mb-2">
            {displayMessage || `${userName}様、会員登録が完了しました！`}
          </p>
          <p className="mb-3 text-sm">
            現在、管理者による承認審査中です。承認完了次第、ログイン可能になります。
          </p>
          {emailBox}
          <p className="mt-3 text-xs">
            通常、1〜2営業日以内に承認処理が完了します。
          </p>
        </AuthNotice>

        {/* ログインページリンク */}
        {loginLink('mb-3')}

        {/* ホームへリンク */}
        <Link href="/" className={AUTH_TEXT_LINK}>
          ホームへ
        </Link>
      </AuthStatusCard>
    </>
  );
}
