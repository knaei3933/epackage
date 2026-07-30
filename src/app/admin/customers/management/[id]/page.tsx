/**
 * Admin Customer Detail Page (Server Component)
 *
 * 顧客詳細ページ - Server Component
 * - RBAC認証チェック（user:read）
 * - Client Component（タブ式）へ customerId を渡す
 *
 * Next.js 16 では params は Promise<{ id }> として受け取る。
 * Client Component は next/dynamic { ssr: false } ラッパー経由で読み込む
 * （Next.js 16 は Server Component 内での ssr: false を禁止するため）。
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../../../loader';
import { FullPageSpinner } from '@/components/ui';
import CustomerDetailClient from './CustomerDetailClientLazy';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function CustomerDetailContent({ id }: { id: string }) {
  let authContext;
  try {
    authContext = await requireAdminAuth(['user:read']);
  } catch (error) {
    // Next.js の redirect が投げた例外はそのまま投げ直す
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/customers/management');
  }

  return <CustomerDetailClient customerId={id} />;
}

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<FullPageSpinner label="顧客詳細を読み込み中..." />}>
      <CustomerDetailContent id={id} />
    </Suspense>
  );
}

export const metadata = {
  title: '顧客詳細 | Epackage Lab Admin',
  description: '顧客詳細ページ',
};

export const dynamic = 'force-dynamic';
