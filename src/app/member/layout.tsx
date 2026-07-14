/**
 * Member Dashboard Layout (Server Component)
 *
 * 会員ダッシュボードレイアウト。
 * - サーバーコンポーネントとして metadata（robots noindex）を export
 * - クライアント部分は MemberLayoutClient に抽出
 * - 認証リダイレクトは各ページの Server Component (requireAuth) が担当
 * - 認証後ページのため noindex,nofollow を設定
 *
 * @module app/member
 */

import type { Metadata } from 'next';
import { MemberLayoutClient } from './MemberLayoutClient';

// 認証後ページ（会員ダッシュボード）は検索エンジンにインデックスさせない
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MemberLayoutClient>{children}</MemberLayoutClient>;
}
