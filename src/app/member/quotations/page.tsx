/**
 * Quotations Page (Server Component)
 *
 * 見積一覧ページ - Server Component
 * - サーバーサイドでデータを取得
 * - Client Componentにデータを渡す
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { fetchQuotationsServerSide } from './loader';
import type { QuotationsData } from './loader';
import QuotationsClient from './QuotationsClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const ITEMS_PER_PAGE = 5;

function MemberQuotationsRouteShell() {
  return (
    <div className="min-h-screen bg-bg-primary" aria-busy="true">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div
            aria-hidden="true"
            className="h-7 w-40 bg-border-light rounded animate-pulse"
          />
          <p className="mt-2 text-sm text-text-muted">読み込み中です。</p>
        </div>
        <section aria-label="見積もり一覧を読み込み中" data-testid="member-quotations-list-shell">
          <div className="space-y-4" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md border border-border-light">
                <div className="h-4 w-32 bg-border-light rounded animate-pulse" />
                <div className="mt-4 h-3 w-48 bg-border-light rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export async function AuthenticatedQuotations({ searchParams }: PageProps) {
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

  const params = await searchParams;
  const status = params.status || 'all';
  const pageParam = params.page || '1';
  const parsedPage = Number.parseInt(pageParam, 10);
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Begin the user-scoped fetch after authorization, but let the shell and
  // selector flush while it is still in flight.
  const initialDataPromise = fetchQuotationsServerSide(user.id, status, ITEMS_PER_PAGE, offset);

  return (
    <QuotationsClient
      initialDataPromise={initialDataPromise as Promise<QuotationsData>}
      initialStatus={status}
      currentPage={currentPage}
    />
  );
}

export default function QuotationsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<MemberQuotationsRouteShell />}>
      <AuthenticatedQuotations searchParams={searchParams} />
    </Suspense>
  );
}
