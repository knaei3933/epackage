/**
 * Member Settings Page
 *
 * 会員設定ページメインコンポーネント（サーバーコンポーネント）
 * - requireAuth()でサーバーサイド認証
 * - ユーザーデータをクライアントコンポーネントに渡す
 * - 日本語UI
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { SettingsSignOutProvider } from './SettingsSignOutProvider';

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

async function SettingsContent() {
  console.log('[SettingsContent] START: Rendering settings content');

  // Use requireAuth helper - works in both Dev Mode and Production
  let user;
  try {
    console.log('[SettingsContent] Calling requireAuth...');
    user = await requireAuth();
    console.log('[SettingsContent] requireAuth SUCCESS:', user.id);
  } catch (error) {
    console.error('[SettingsContent] requireAuth FAILED:', error);
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/settings');
    }
    throw error;
  }

  // Extract user metadata with fallbacks (same pattern as dashboard)
  const userMetadata = user.user_metadata || {};
  const userEmail = user.email || '';
  const userId = user.id || '';
  const userLastName = userMetadata.kanji_last_name || '';
  const userFirstName = userMetadata.kanji_first_name || '';

  // Fallback chain for userName: lastName firstName -> email -> 'テスト'
  const fullName = `${userLastName} ${userFirstName}`.trim();
  const userName = fullName || userEmail || 'テスト';

  const userCreatedAt = formatDateToISO(user.created_at);
  const userStatus = userMetadata.status || 'ACTIVE';

  console.log('[SettingsContent] User data extracted:', {
    userId,
    userEmail,
    userName,
    userStatus,
  });

  return (
    <SettingsSignOutProvider
      userId={userId}
      userEmail={userEmail}
      userName={userName}
      userLastName={userLastName}
      userFirstName={userFirstName}
      userCreatedAt={userCreatedAt}
      userStatus={userStatus}
    />
  );
}

// =====================================================
// Page Component (Server Component)
// =====================================================

export default async function SettingsPage() {
  return <SettingsContent />;
}

// =====================================================
// Server Component Metadata
// =====================================================

export const metadata = {
  title: '設定 | Epackage Lab',
  description: 'Epackage Lab会員設定ページ',
};

// Force dynamic rendering for this authenticated page
export const dynamic = 'force-dynamic';
