/**
 * Account Suspended Page
 *
 * アカウント停止ページです。
 * - 停止されたアカウントでログインを試みた場合に表示
 */

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'アカウント停止 | Epackage Lab',
  description: 'アカウントが停止されました。',
};

export default function SuspendedPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-accent flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-bg-secondary rounded-lg shadow-lg p-8 text-center">
          {/* アイコン */}
          <div className="w-16 h-16 mx-auto mb-6 bg-error-100 dark:bg-error-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-error-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>

          {/* タイトル */}
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            アカウントが停止されました
          </h1>

          {/* 説明 */}
          <p className="text-text-muted mb-6">
            あなたのアカウントは停止されました。詳細は管理者にお問い合わせください。
          </p>

          {/* 問い合わせリンク */}
          <a
            href="mailto:admin@epackage-lab.com"
            className="inline-block w-full px-4 py-2 bg-brixa-500 hover:bg-brixa-600 text-white font-medium rounded-md transition-colors"
          >
            管理者にお問い合わせ
          </a>

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
