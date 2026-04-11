/**
 * Admin Customer Management Page (Server Component)
 *
 * 顧客管理ページ - Server Component
 * - RBAC認証チェック
 * - Client Componentでインタラクティブ操作
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../../loader';
import AdminCustomerManagementClient from './AdminCustomerManagementClient';
import { FullPageSpinner } from '@/components/ui';

async function CustomerManagementContent() {
  let authContext;
  try {
    authContext = await requireAdminAuth(['user:read']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/customers/management');
  }

  return <AdminCustomerManagementClient authContext={authContext} />;
}

export default async function AdminCustomerManagementPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="顧客管理を読み込み中..." />}>
      <CustomerManagementContent />
    </Suspense>
  );
}

export const metadata = {
  title: '顧客管理 | Epackage Lab Admin',
  description: '顧客管理ページ',
};

export const dynamic = 'force-dynamic';
