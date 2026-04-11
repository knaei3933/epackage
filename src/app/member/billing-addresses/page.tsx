/**
 * Billing Addresses Page (Server Component)
 *
 * 請求先住所一覧・管理ページ - Server Component
 * - サーバーサイドで認証チェック
 * - Client Componentに渡す
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { BillingAddressesClient } from './BillingAddressesClient';

export const dynamic = 'force-dynamic';

export default async function BillingAddressesPage() {
  // Check authentication
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/billing-addresses');
    }
    throw error;
  }

  return <BillingAddressesClient userId={user.id} />;
}
