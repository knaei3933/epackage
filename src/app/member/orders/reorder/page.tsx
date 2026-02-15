/**
 * Reorder Page (Redirect)
 *
 * 再注文ページ - メインページにリダイレクト
 */

import { redirect } from 'next/navigation';

export default function ReorderPage() {
  // メインページの「再注文」タブにリダイレクト
  redirect('/member/orders?tab=reorder');
}
