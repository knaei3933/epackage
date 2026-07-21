/**
 * Admin Inquiries Page (Server Component)
 *
 * お問い合わせ管理ページ - Server Component
 * - RBAC 認証チェック（ADMIN/operator/sales/accounting ロール + ACTIVE のみ）
 * - inquiry 系の個別権限が未定義のため requireAdminAuth() は権限なしで呼ぶ
 *   （Phase 4 の管理者 API withAdminAuth<any> と整合）
 * - Client Component でインタラクティブ操作
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../loader';
import AdminInquiriesClient from './AdminInquiriesClient';
import { FullPageSpinner } from '@/components/ui';

async function InquiriesContent() {
  try {
    await requireAdminAuth();
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/inquiries');
  }

  return <AdminInquiriesClient />;
}

export default async function AdminInquiriesPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="お問い合わせ管理を読み込み中..." />}>
      <InquiriesContent />
    </Suspense>
  );
}

export const metadata = {
  title: 'お問い合わせ管理 | Epackage Lab Admin',
  description: 'お問い合わせ管理ページ',
};

export const dynamic = 'force-dynamic';
