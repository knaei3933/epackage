/**
 * Pending Approval Page
 *
 * アカウント承認待ちページです。
 * - 会員登録後、承認待ち状態の場合に表示
 */

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '承認待ち | Epackage Lab',
  description: 'アカウント承認待ちです。',
};

export default function PendingPage() {
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
          <p className="text-text-muted mb-6">
            会員登録が完了しました。管理者の承認後、ログイン可能です。
          </p>

          {/* ログインページリンク */}
          <Link
            href="/auth/signin"
            className="inline-block w-full px-4 py-2 bg-brixa-500 hover:bg-brixa-600 text-white font-medium rounded-md transition-colors"
          >
            ログインページへ
          </Link>

          {/* ホームへリンク */}
          <Link
            href="/"
            className="block mt-4 text-sm text-text-muted hover:text-brixa-500"
          >
            ホームへ
          </Link>
        </div>
      </div>
    </main>
  );
}
