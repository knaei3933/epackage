/**
 * Admin Contracts Page (Server Component)
 *
 * 契約ワークフロー管理ページ - Server Component
 * - RBAC認証チェック
 * - Client ComponentでSWR/リアルタイムデータフェッチ
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../loader';
import AdminContractsClient from './AdminContractsClient';
import { FullPageSpinner } from '@/components/ui';

async function ContractsContent() {
  let authContext;
  try {
    authContext = await requireAdminAuth(['contract:read']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/contracts');
  }

  return <AdminContractsClient />;
}

export default async function AdminContractsPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="契約管理を読み込み中..." />}>
      <ContractsContent />
    </Suspense>
  );
}

export const metadata = {
  title: '契約管理 | Epackage Lab Admin',
  description: '契約ワークフロー管理ページ',
};

export const dynamic = 'force-dynamic';
