/**
 * Member Notifications Page (Server Component)
 *
 * 通知一覧ページ - Server Component
 * - サーバーサイドで認証チェック
 * - Client Componentに渡す
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { NotificationsClient } from './NotificationsClient';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  // Check authentication
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/notifications');
    }
    throw error;
  }

  return <NotificationsClient userId={user.id} />;
}
