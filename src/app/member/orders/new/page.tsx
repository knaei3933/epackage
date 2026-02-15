/**
 * New Orders Page (Redirect)
 *
 * 処理中の注文ページ - メインページにリダイレクト
 */

import { redirect } from 'next/navigation';

export default function NewOrdersPage() {
  // メインページの「処理中」タブにリダイレクト
  redirect('/member/orders?tab=active');
}
