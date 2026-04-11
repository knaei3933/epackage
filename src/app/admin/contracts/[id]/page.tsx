/**
 * Admin Contract Detail Page (Server Component)
 *
 * 契約書詳細ページ - Server Component
 * - RBAC認証チェック
 * - Client Componentでインタラクティブ操作
 */

import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../../loader';
import AdminContractDetailClient from './AdminContractDetailClient';

async function ContractDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: contractId } = await params;

  let authContext;
  try {
    authContext = await requireAdminAuth(['contract:read']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/contracts');
  }

  return <AdminContractDetailClient contractId={contractId} authContext={authContext} />;
}

export default async function AdminContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ContractDetailContent params={params} />;
}

export const metadata = {
  title: '契約詳細 | Epackage Lab Admin',
  description: '契約書詳細ページ',
};

export const dynamic = 'force-dynamic';
