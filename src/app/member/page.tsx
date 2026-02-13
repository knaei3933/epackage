/**
 * Member Index Page - Redirect to Dashboard
 *
 * /member にアクセスした場合、/member/dashboard にリダイレクト
 * RSC (React Server Components) リクエストに対しても正しく動作するように実装
 */

import { redirect } from 'next/navigation';

// RSCリクエスト対応: redirect()は同期実行される
export default function MemberPage() {
  // RSCリクエストの場合、redirect()が正しく動作する
  redirect('/member/dashboard');
}

// ダイナミックレンダリングを強制（RSCキャッシュ対策）
export const dynamic = 'force-dynamic';

// RSCリクエストが404を返さないように metadata を定義
export const metadata = {
  title: 'マイページ',
};
