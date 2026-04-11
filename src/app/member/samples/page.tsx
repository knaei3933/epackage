/**
 * Sample Requests Page (Server Component)
 *
 * サンプル依頼一覧ページ - Server Component
 * - サーバーサイドで認証チェック
 * - Client Componentに初期データを渡す
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { SamplesClient } from './SamplesClient';

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function SamplesPage({ searchParams }: PageProps) {
  // Check authentication
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/samples');
    }
    throw error;
  }

  // Get query parameters
  const params = await searchParams;
  const initialStatus = params.status as any;

  return <SamplesClient initialStatus={initialStatus} />;
}
