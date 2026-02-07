/**
 * Admin Approvals Page (Server Component)
 *
 * 管理者承認ページ - Server Component
 * - RBAC認証チェック（user:approve必須）
 * - Server Side Renderingでデータ取得
 * - Client Componentでインタラクティブ操作
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../loader';
import AdminApprovalsClient from './AdminApprovalsClient';
import { FullPageSpinner } from '@/components/ui';

// ============================================================
// Types
// ============================================================

interface PendingMember {
  id: string;
  email: string;
  user_type: 'B2C' | 'B2B' | null;
  business_type: 'INDIVIDUAL' | 'CORPORATION' | 'SOLE_PROPRIETOR' | null;
  company_name: string | null;
  legal_entity_number: string | null;
  kanji_last_name: string;
  kanji_first_name: string;
  kana_last_name: string;
  kana_first_name: string;
  corporate_phone: string | null;
  personal_phone: string | null;
  postal_code: string | null;
  prefecture: string | null;
  city: string | null;
  street: string | null;
  business_document_path: string | null;
  position: string | null;
  department: string | null;
  company_url: string | null;
  product_category: string | null;
  acquisition_channel: string | null;
  created_at: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

interface FetchPendingMembersResponse {
  success: boolean;
  data?: PendingMember[];
  error?: string;
}

// ============================================================
// Server-Side Data Fetching
// ============================================================

async function ApprovalsContent() {
  // RBAC認証チェック（ユーザー承認権限必須）
  let authContext;
  try {
    authContext = await requireAdminAuth(['user:approve']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/approvals');
  }

  // Pass auth context to client component for API calls
  return (
    <AdminApprovalsClient
      authContext={authContext}
    />
  );
}

// ============================================================
// Page Component
// ============================================================

export default async function AdminApprovalsPage() {
  return (
    <Suspense fallback={<FullPageSpinner label="承認待ちリストを読み込み中..." />}>
      <ApprovalsContent />
    </Suspense>
  );
}

export const metadata = {
  title: '会員承認 | Epackage Lab Admin',
  description: '会員登録承認ページ',
};

export const dynamic = 'force-dynamic';
