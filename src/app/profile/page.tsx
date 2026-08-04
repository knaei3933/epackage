/**
 * /profile Route (廃止・リダイレクト)
 *
 * 旧プロフィール編集ページ。機能は `/member/profile`（表示・連絡先インライン編集）と
 * `/member/settings`（パスワード・削除）に統合済み。
 * このルートは後方互換のため `/member/profile` へリダイレクトする。
 * リダイレクト先で認証されるため、ここでは認証不要。
 */

import { redirect } from 'next/navigation';

export default function ProfilePage() {
  redirect('/member/profile');
}

export const metadata = {
  title: 'プロフィール | Epackage Lab',
};
