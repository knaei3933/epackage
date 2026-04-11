/**
 * Admin Shipments Page (Server Component)
 *
 * 出荷管理ページ - Server Component
 * - RBAC認証チェック
 * - Client ComponentでSWRデータフェッチ
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../loader';
import AdminShipmentsClient from './AdminShipmentsClient';
import { FullPageSpinner } from '@/components/ui';

async function ShipmentsContent() {
  let authContext;
  try {
    authContext = await requireAdminAuth(['shipment:read']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/shipments');
  }

  return <AdminShipmentsClient authContext={authContext} />;
}

export default async function AdminShipmentsPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="出荷管理を読み込み中..." />}>
      <ShipmentsContent />
    </Suspense>
  );
}

export const metadata = {
  title: '出荷管理 | Epackage Lab Admin',
  description: '出荷管理ページ',
};

export const dynamic = 'force-dynamic';
