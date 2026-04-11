/**
 * Admin Customer Settings Page (Server Component)
 *
 * 顧客設定ページ - Server Component
 * - RBAC認証チェック
 * - Client Componentでインタラクティブ操作
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../../loader';
import AdminCustomerSettingsClient from './AdminCustomerSettingsClient';
import { FullPageSpinner } from '@/components/ui';

async function CustomerSettingsContent() {
  let authContext;
  try {
    authContext = await requireAdminAuth(['settings:read']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/settings/customers');
  }

  return <AdminCustomerSettingsClient authContext={authContext} />;
}

export default async function AdminCustomerSettingsPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="顧客設定を読み込み中..." />}>
      <CustomerSettingsContent />
    </Suspense>
  );
}

export const metadata = {
  title: '顧客設定 | Epackage Lab Admin',
  description: '顧客マークアップ設定ページ',
};

export const dynamic = 'force-dynamic';
