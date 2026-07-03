/**
 * Admin Settings Page (Server Component)
 *
 * 設定ページ - Server Component
 * - RBAC認証チェック
 * - Client Componentでインタラクティブ操作
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../loader';
import { FullPageSpinner } from '@/components/ui';
// Client wrapper so that next/dynamic { ssr: false } is allowed in a Server
// Component (Next.js 16 forbids ssr: false directly in Server Components).
import AdminSettingsClient from './AdminSettingsClientLazy';

async function SettingsContent() {
  let authContext;
  try {
    authContext = await requireAdminAuth(['settings:read']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/settings');
  }

  return <AdminSettingsClient {...({ authContext } as any)} />;
}

export default async function AdminSettingsPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="設定を読み込み中..." />}>
      <SettingsContent />
    </Suspense>
  );
}

export const metadata = {
  title: '設定 | Epackage Lab Admin',
  description: '管理設定ページ',
};

export const dynamic = 'force-dynamic';
