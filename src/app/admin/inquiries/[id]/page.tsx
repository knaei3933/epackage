/**
 * Admin Inquiry Detail Page (Server Component)
 *
 * お問い合わせ詳細ページ（管理者） - Server Component
 * - RBAC 認証チェック（ADMIN/operator/sales/accounting ロール + ACTIVE のみ）
 * - inquiry 系の個別権限が未定義のため requireAdminAuth() は権限なしで呼ぶ
 * - Client Component でスレッド表示 + 回答フォームを操作
 */

import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../../loader';
import AdminInquiryDetailClient from './AdminInquiryDetailClient';
import { FullPageSpinner } from '@/components/ui';

async function InquiryDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: inquiryId } = await params;

  try {
    await requireAdminAuth();
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/inquiries');
  }

  return <AdminInquiryDetailClient inquiryId={inquiryId} />;
}

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <InquiryDetailContent params={params} />
  );
}

export const metadata = {
  title: 'お問い合わせ詳細 | Epackage Lab Admin',
  description: 'お問い合わせ詳細ページ',
};

export const dynamic = 'force-dynamic';
