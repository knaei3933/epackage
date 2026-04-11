/**
 * B2B Quotation Request Page (Server Component)
 *
 * 見積リクエストページ - Server Component
 * - サーバーサイドで認証チェック
 * - 企業データを取得
 * - Client Componentにデータを渡す
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { createClient } from '@/lib/supabase/server';
import { QuotationRequestClient } from './QuotationRequestClient';

interface Company {
  id: string;
  name: string;
  name_kana: string;
  corporate_number: string;
}

export const dynamic = 'force-dynamic';

export default async function B2BQuotationRequestPage() {
  // Check authentication
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/quotations/request');
    }
    throw error;
  }

  // Load user's companies
  const supabase = await createClient();
  const { data: companiesData, error: companiesError } = await supabase
    .from('companies')
    .select('id, name, name_kana, corporate_number')
    .eq('status', 'ACTIVE');

  if (companiesError) {
    console.error('Error loading companies:', companiesError);
  }

  const companies: Company[] = (companiesData || []) as Company[];

  return (
    <QuotationRequestClient
      userId={user.id}
      companies={companies}
    />
  );
}
