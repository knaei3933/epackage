/**
 * Admin Shipping Management Page (Server Component)
 *
 * 配送管理ページ - Server Component
 * - RBAC認証チェック
 * - Client Componentでインタラクティブ操作
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../loader';
import AdminShippingClient from './AdminShippingClient';
import { FullPageSpinner } from '@/components/ui';

async function ShippingContent() {
  let authContext;
  try {
    authContext = await requireAdminAuth(['shipment:read']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/shipping');
  }

  return <AdminShippingClient authContext={authContext} />;
}

export default async function AdminShippingPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="配送管理を読み込み中..." />}>
      <ShippingContent />
    </Suspense>
  );
}

export const metadata = {
  title: '配送管理 | Epackage Lab Admin',
  description: '配送管理ページ',
};

export const dynamic = 'force-dynamic';
