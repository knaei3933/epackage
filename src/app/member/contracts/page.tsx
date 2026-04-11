/**
 * Member Contracts Management Page (Server Component)
 *
 * 統合契約管理ページ - Server Component
 * - サーバーサイドで認証チェック
 * - Client Componentに渡す
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { ContractsClient } from './ContractsClient';

export const dynamic = 'force-dynamic';

export default async function ContractsPage() {
  // Check authentication
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/contracts');
    }
    throw error;
  }

  return <ContractsClient userId={user.id} />;
}
