/**
 * Admin Coupons Page (Server Component)
 *
 * クーポン管理ページ - Server Component
 * - RBAC認証チェック
 * - Client Componentでインタラクティブ操作
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../loader';
import AdminCouponsClient from './AdminCouponsClient';
import { FullPageSpinner } from '@/components/ui';

async function CouponsContent() {
  let authContext;
  try {
    authContext = await requireAdminAuth(['settings:read']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/coupons');
  }

  return <AdminCouponsClient authContext={authContext} />;
}

export default async function AdminCouponsPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="クーポン管理を読み込み中..." />}>
      <CouponsContent />
    </Suspense>
  );
}

export const metadata = {
  title: 'クーポン管理 | Epackage Lab Admin',
  description: 'クーポン管理ページ',
};

export const dynamic = 'force-dynamic';
