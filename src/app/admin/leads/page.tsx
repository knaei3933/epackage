/**
 * Admin Leads Page (Server Component)
 *
 * リード管理ページ - Server Component
 * - RBAC認証チェック
 * - Client Componentでインタラクティブ操作
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../loader';
import AdminLeadsClient from './AdminLeadsClient';
import { FullPageSpinner } from '@/components/ui';

async function LeadsContent() {
  let authContext;
  try {
    authContext = await requireAdminAuth(['user:read']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/leads');
  }

  return <AdminLeadsClient authContext={authContext} />;
}

export default async function AdminLeadsPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="リード管理を読み込み中..." />}>
      <LeadsContent />
    </Suspense>
  );
}

export const metadata = {
  title: 'リード管理 | Epackage Lab Admin',
  description: 'リード管理ページ',
};

export const dynamic = 'force-dynamic';
