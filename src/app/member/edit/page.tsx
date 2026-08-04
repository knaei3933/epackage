/**
 * Member Edit Page (廃止・リダイレクト)
 *
 * 編集機能は SettingsClient（パスワード・削除）と ProfileClient（連絡先インライン編集）に統合済み。
 * このルートは後方互換のため `/member/profile` へリダイレクトする。
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';

export default async function EditPage() {
  // サーバーサイド認証（未認証なら signin へ）
  try {
    await requireAuth();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/edit');
    }
    throw error;
  }

  // 認証済みならプロフィールページへ
  redirect('/member/profile');
}

export const metadata = {
  title: '会員情報編集 | Epackage Lab',
  description: 'Epackage Lab会員情報編集ページ',
};

// 認証状態に依存するため動的レンダリング
export const dynamic = 'force-dynamic';
