/**
 * Admin Google Drive Settings Page (Server Component)
 *
 * Google Drive連携設定ページ - Server Component
 * - RBAC認証チェック
 * - Client Componentでインタラクティブ操作
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../../loader';
import AdminGoogleDriveClient from './AdminGoogleDriveClient';
import { FullPageSpinner } from '@/components/ui';

async function GoogleDriveContent() {
  let authContext;
  try {
    authContext = await requireAdminAuth(['settings:read']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/settings/google-drive');
  }

  return <AdminGoogleDriveClient authContext={authContext} />;
}

export default async function AdminGoogleDrivePage() {
  return (
    <Suspense fallback={<FullPageSpinner label="Google Drive設定を読み込み中..." />}>
      <GoogleDriveContent />
    </Suspense>
  );
}

export const metadata = {
  title: 'Google Drive設定 | Epackage Lab Admin',
  description: 'Google Drive連携設定ページ',
};

export const dynamic = 'force-dynamic';
