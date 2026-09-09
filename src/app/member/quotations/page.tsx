/**
 * Quotations Page (Server Component)
 *
 * 見積一覧ページ - Server Component
 * - サーバーサイドでデータを取得
 * - Client Componentにデータを渡す
 */

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { fetchQuotationsServerSide } from './loader';
import type { QuotationsData } from './loader';
import QuotationsClient from './QuotationsClient';

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const ITEMS_PER_PAGE = 5;

export default async function QuotationsPage({ searchParams }: PageProps) {
  // Check authentication first
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/quotations');
    }
    throw error;
  }

  // Get query parameters
  const params = await searchParams;
  const status = params.status || 'all';
  const pageParam = params.page || '1';
  const currentPage = parseInt(pageParam, 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Begin the user-scoped fetch after authorization, but let the shell and
  // selector flush while it is still in flight.
  const initialDataPromise = fetchQuotationsServerSide(user.id, status, ITEMS_PER_PAGE, offset);

  // Pass data to client component
  return (
    <QuotationsClient
      initialDataPromise={initialDataPromise as Promise<QuotationsData>}
      initialStatus={status}
      currentPage={currentPage}
    />
  );
}
