/**
 * Member Edit Page
 *
 * 会員情報編集ページ（サーバーコンポーネント）
 * - requireAuth()でサーバーサイド認証
 * - ユーザーデータをクライアントコンポーネントに渡す
 * - 日本語UI
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { EditSignOutProvider } from './EditSignOutProvider';

// =====================================================
// Helper Functions
// =====================================================

/**
 * 安全な日付フォーマット関数
 */
function formatDateToISO(date: string | Date | null | undefined): string {
  if (!date) return new Date().toISOString();
  try {
    return new Date(date).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

// =====================================================
// Server Component Content
// =====================================================

async function EditContent() {
  console.log('[EditContent] START: Rendering edit content');

  // Use requireAuth helper - works in both Dev Mode and Production
  let user;
  try {
    console.log('[EditContent] Calling requireAuth...');
    user = await requireAuth();
    console.log('[EditContent] requireAuth SUCCESS:', user.id);
  } catch (error) {
    console.error('[EditContent] requireAuth FAILED:', error);
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/edit');
    }
    throw error;
  }

  // Extract user metadata with fallbacks
  const userMetadata = user.user_metadata || {};
  const userEmail = user.email || '';
  const userId = user.id || '';

  // Contact info
  const userCorporatePhone = userMetadata.corporate_phone || '';
  const userPersonalPhone = userMetadata.personal_phone || '';

  console.log('[EditContent] User data extracted:', {
    userId,
    userEmail,
    userCorporatePhone,
    userPersonalPhone,
  });

  return (
    <EditSignOutProvider
      userId={userId}
      userEmail={userEmail}
      userCorporatePhone={userCorporatePhone}
      userPersonalPhone={userPersonalPhone}
    />
  );
}

// =====================================================
// Page Component (Server Component)
// =====================================================

export default async function EditPage() {
  return <EditContent />;
}

// =====================================================
// Server Component Metadata
// =====================================================

export const metadata = {
  title: '会員情報編集 | Epackage Lab',
  description: 'Epackage Lab会員情報編集ページ',
};

// Force dynamic rendering for this authenticated page
export const dynamic = 'force-dynamic';
