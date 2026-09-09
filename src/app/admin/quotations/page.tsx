/**
 * Admin Quotations Page (Server Component)
 *
 * 見積管理ページ - Server Component
 * - RBAC認証チェック
 * - Client Componentでインタラクティブ操作
 */

import { Suspense } from 'react';
import { getAdminAuth } from '../loader';
import { getInitialAdminQuotations } from './loader';
import AdminQuotationsClient from './AdminQuotationsClient';

// ============================================================
// Server-Side Data Fetching
// ============================================================

function AdminQuotationsRouteShell() {
  return (
    <div className="min-h-screen bg-gray-50" aria-busy="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div
            aria-hidden="true"
            className="h-8 w-48 bg-gray-200 rounded animate-pulse"
          />
          <p className="mt-2 text-sm text-gray-600">読み込み中です。</p>
        </div>
        <section aria-label="見積もり一覧を読み込み中" data-testid="admin-quotations-list-shell">
          <div className="space-y-4" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="mt-4 h-3 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export async function QuotationsContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  // Preserve server-side authorization and its exact redirect after the shell.
  const authContext = await getAdminAuth(['quotation:read'], '/auth/signin?redirect=/admin/quotations');
  const params = await searchParams;

  // URLパラメータからステータスを取得
  const initialStatus = params.status || 'all';
  const initialQuotationData = await getInitialAdminQuotations({ status: initialStatus });

  return (
    <AdminQuotationsClient
      authContext={authContext}
      initialStatus={initialStatus}
      initialQuotations={initialQuotationData.quotations}
      initialTotal={initialQuotationData.pagination.total}
    />
  );
}

// ============================================================
// Page Component
// ============================================================

export default function AdminQuotationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <Suspense fallback={<AdminQuotationsRouteShell />}>
      <QuotationsContent searchParams={searchParams} />
    </Suspense>
  );
}

export const metadata = {
  title: '見積管理 | Epackage Lab Admin',
  description: '見積管理ページ',
};

export const dynamic = 'force-dynamic';
