/**
 * Quotations Page (Server Component)
 *
 * 見積一覧ページ - Server Component
 * - サーバーサイドでデータを取得
 * - Client Componentにデータを渡す
 */

import { redirect } from 'next/navigation';
import { fetchQuotationsServerSide } from './loader';
import QuotationsClient from './QuotationsClient';

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const ITEMS_PER_PAGE = 5;

export default async function QuotationsPage({ searchParams }: PageProps) {
  // Get query parameters
  const params = await searchParams;
  const status = params.status || 'all';
  const pageParam = params.page || '1';
  const currentPage = parseInt(pageParam, 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Fetch quotations on server side (no browser fetch = no redirect loop)
  const data = await fetchQuotationsServerSide(status, ITEMS_PER_PAGE, offset);

  // Redirect to login if no data (likely not authenticated)
  if (data.quotations.length === 0 && data.pagination.total === 0) {
    // User might not be authenticated, let client handle redirect
  }

  // Calculate total pages
  const totalPages = Math.ceil(data.pagination.total / ITEMS_PER_PAGE);

  // Pass data to client component
  return (
    <QuotationsClient
      initialData={data}
      initialStatus={status}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}
