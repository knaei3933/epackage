/**
 * Account Suspended Page
 *
 * アカウント停止ページです。
 * - 停止されたアカウントでログインを試みた場合に表示
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Ban } from 'lucide-react';
import { AuthStatusCard, AUTH_TEXT_LINK } from '@/components/auth/AuthShell';
import { buttonVariants } from '@/components/ui';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'アカウント停止 | Epackage Lab',
  description: 'アカウントが停止されました。',
};

export default function SuspendedPage() {
  return (
    <AuthStatusCard
      tone="error"
      icon={Ban}
      title={
        <>
          アカウントが<wbr />停止されました
        </>
      }
    >
      {/* 説明 */}
      <p className="mb-6 text-text-secondary">
        あなたのアカウントは停止されました。詳細は管理者にお問い合わせください。
      </p>

      {/* 問い合わせリンク */}
      <a
        href="mailto:info@package-lab.com"
        className={buttonVariants({ variant: 'primary', size: 'lg', fullWidth: true })}
      >
        管理者にお問い合わせ
      </a>

      {/* ホームへリンク */}
      <Link href="/" className={cn(AUTH_TEXT_LINK, 'mt-3')}>
        ホームへ
      </Link>
    </AuthStatusCard>
  );
}
