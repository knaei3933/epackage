/**
 * Order History Page (Redirect)
 *
 * 注文履歴ページ - メインページにリダイレクト
 */

import { redirect } from 'next/navigation';

export default function OrderHistoryPage() {
  // メインページの「履歴」タブにリダイレクト
  redirect('/member/orders?tab=history');
}
