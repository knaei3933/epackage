/**
 * Delivery Addresses Page (Server Component)
 *
 * 納品先住所一覧・管理ページ - Server Component
 * - サーバーサイドで認証チェック
 * - Client Componentに渡す
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { DeliveriesClient } from './DeliveriesClient';

export const dynamic = 'force-dynamic';

export default async function DeliveryAddressesPage() {
  // Check authentication
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/deliveries');
    }
    throw error;
  }

  return <DeliveriesClient userId={user.id} />;
}
