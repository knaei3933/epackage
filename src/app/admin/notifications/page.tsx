/**
 * Admin Notifications Page (Server Component)
 *
 * お知らせ管理ページ - Server Component
 * - RBAC認証チェック
 * - Client Componentでインタラクティブ操作
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../loader';
import AdminNotificationsClient from './AdminNotificationsClient';
import { FullPageSpinner } from '@/components/ui';

async function NotificationsContent() {
  let authContext;
  try {
    authContext = await requireAdminAuth(['notification:read']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/notifications');
  }

  return <AdminNotificationsClient authContext={authContext} />;
}

export default async function AdminNotificationsPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="お知らせ管理を読み込み中..." />}>
      <NotificationsContent />
    </Suspense>
  );
}

export const metadata = {
  title: 'お知らせ管理 | Epackage Lab Admin',
  description: 'お知らせ管理ページ',
};

export const dynamic = 'force-dynamic';
