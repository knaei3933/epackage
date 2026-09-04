/**
 * Admin Samples Page (Server Component)
 *
 * サンプル依頼管理ページ - Server Component
 * - RBAC 認証チェック（requireAdminAuth・inquiries と同一パターン）
 * - Client Component でインタラクティブ操作（ラベル再印字ボタン）
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../loader';
import AdminSamplesClient from './AdminSamplesClient';
import { FullPageSpinner } from '@/components/ui';

async function SamplesContent() {
  try {
    const context = await requireAdminAuth();
    // API(/api/admin/samples*)는 ADMIN만 허용(withAdminAuth) → 페이지도 동일 RBAC로 정렬
    if (context.role !== 'admin') {
      redirect('/admin/dashboard');
    }
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/samples');
  }

  return <AdminSamplesClient />;
}

export default async function AdminSamplesPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="サンプル依頼を読み込み中..." />}>
      <SamplesContent />
    </Suspense>
  );
}

export const metadata = {
  title: 'サンプル依頼管理 | Epackage Lab Admin',
  description: 'サンプル依頼とラベル印刷の管理ページ',
};
