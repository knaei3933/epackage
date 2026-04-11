/**
 * Inquiries History Page (Server Component)
 *
 * お問い合わせ履歴ページ - Server Component
 * - サーバーサイドで認証チェック
 * - Client Componentに渡す
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { InquiriesClient } from './InquiriesClient';

export const dynamic = 'force-dynamic';

export default async function InquiriesPage() {
  // Check authentication
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/inquiries');
    }
    throw error;
  }

  return <InquiriesClient userId={user.id} />;
}
