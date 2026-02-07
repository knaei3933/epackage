/**
 * Admin Quotations Page (Server Component)
 *
 * 見積管理ページ - Server Component
 * - RBAC認証チェック
 * - Client Componentでインタラクティブ操作
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../loader';
import AdminQuotationsClient from './AdminQuotationsClient';
import { FullPageSpinner } from '@/components/ui';

// ============================================================
// Types
// ============================================================

interface AuthContext {
  userId: string;
  role: 'ADMIN' | 'OPERATOR' | 'SALES' | 'ACCOUNTING';
  userName: string;
  isDevMode: boolean;
}

// ============================================================
// Server-Side Data Fetching
// ============================================================

async function QuotationsContent({ searchParams }: { searchParams: { status?: string } }) {
  // RBAC認証チェック
  let authContext: AuthContext;
  try {
    authContext = await requireAdminAuth(['quotation:read']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/quotations');
  }

  // URLパラメータからステータスを取得
  const initialStatus = searchParams.status || 'all';

  // Pass auth context to client component for API calls
  return (
    <AdminQuotationsClient
      authContext={authContext}
      initialStatus={initialStatus}
    />
  );
}

// ============================================================
// Page Component
// ============================================================

export default async function AdminQuotationsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  return (
    <Suspense fallback={<FullPageSpinner label="見積もりリストを読み込み中..." />}>
      <QuotationsContent searchParams={searchParams} />
    </Suspense>
  );
}

export const metadata = {
  title: '見積管理 | Epackage Lab Admin',
  description: '見積管理ページ',
};

export const dynamic = 'force-dynamic';
