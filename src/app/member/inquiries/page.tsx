/**
 * Inquiries History Page (Server Component)
 *
 * お問い合わせ履歴ページ - Server Component
 * - サーバーサイドで認証チェック
 * - プロフィール取得（新規作成モーダルの自動補完用・表示のみ）
 * - Client Componentに渡す
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { createServiceClient } from '@/lib/supabase';
import { InquiriesClient } from './InquiriesClient';
import type { MemberProfileSummary } from '@/components/inquiries/InquiryCreateModal';

export const dynamic = 'force-dynamic';

export default async function InquiriesPage() {
  // Check authentication
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/inquiries');
    }
    throw error;
  }

  // プロフィール取得（新規作成モーダルの自動補完用・表示のみ）
  // 失敗時は undefined でフォールバック（モーダルの情報表示セクションが省略されるのみ・ページ全体は壊さない）
  let profile: MemberProfileSummary | undefined;
  try {
    const supabase = createServiceClient();
    const { data: profileRow } = await supabase
      .from('profiles')
      .select(
        'kanji_last_name, kanji_first_name, kana_last_name, kana_first_name, company_name, email, corporate_phone, personal_phone'
      )
      .eq('id', user.id)
      .maybeSingle();

    if (profileRow) {
      // Supabase の生成型が未更新の可能性があるため any で受ける（runtime 値は安全）
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = profileRow as any;
      profile = {
        fullName: [p.kanji_last_name, p.kanji_first_name].filter(Boolean).join(' ').trim(),
        email: p.email || user.email || '',
        companyName: p.company_name || undefined,
        phone: p.corporate_phone || p.personal_phone || undefined,
      };
    }
  } catch (error) {
    console.error('[inquiries page] Profile fetch error:', error);
  }

  return <InquiriesClient userId={user.id} profile={profile} />;
}
