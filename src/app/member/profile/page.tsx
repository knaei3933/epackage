/**
 * Member Profile Page
 *
 * 会員プロフィール表示ページ（サーバーコンポーネント）
 * - requireAuth()でサーバーサイド認証
 * - ユーザーデータをクライアントコンポーネントに渡す
 * - 日本語UI
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { ProfileClient } from './ProfileClient';

// =====================================================
// Server Component Content
// =====================================================

async function ProfileContent() {
  console.log('[ProfileContent] START: Rendering profile content');

  // Use requireAuth helper - works in both Dev Mode and Production
  let user;
  try {
    console.log('[ProfileContent] Calling requireAuth...');
    user = await requireAuth();
    console.log('[ProfileContent] requireAuth SUCCESS:', user.id);
  } catch (error) {
    console.error('[ProfileContent] requireAuth FAILED:', error);
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/profile');
    }
    throw error;
  }

  // Extract user metadata with fallbacks
  const userMetadata = user.user_metadata || {};
  const userEmail = user.email || '';
  const userId = user.id || '';
  const userLastName = userMetadata.kanji_last_name || '';
  const userFirstName = userMetadata.kanji_first_name || '';
  const userKanaLastName = userMetadata.kana_last_name || '';
  const userKanaFirstName = userMetadata.kana_first_name || '';

  // Company info
  const userCompanyName = userMetadata.company_name || '';
  const userPosition = userMetadata.position || '';
  const userDepartment = userMetadata.department || '';
  const userCompanyUrl = userMetadata.company_url || '';

  // Contact info
  const userCorporatePhone = userMetadata.corporate_phone || '';
  const userPersonalPhone = userMetadata.personal_phone || '';

  // Address info
  const userPostalCode = userMetadata.postal_code || '';
  const userPrefecture = userMetadata.prefecture || '';
  const userCity = userMetadata.city || '';
  const userStreet = userMetadata.street || '';

  // Product category
  const userProductCategory = userMetadata.product_category || '';

  // Business type
  const userBusinessType = userMetadata.business_type || '';
  const userRole = userMetadata.role || 'MEMBER';
  const userStatus = userMetadata.status || 'ACTIVE';

  // Dates
  const userCreatedAt = userMetadata.created_at || new Date().toISOString();
  const userLastLoginAt = userMetadata.last_login_at;

  // Fallback chain for userName: lastName + firstName -> email -> 'テスト'
  const fullName = `${userLastName} ${userFirstName}`.trim();
  const userName = fullName || userEmail || 'テスト';

  console.log('[ProfileContent] User data extracted:', {
    userId,
    userEmail,
    userName,
    userStatus,
  });

  return (
    <ProfileClient
      userId={userId}
      userEmail={userEmail}
      userName={userName}
      userLastName={userLastName}
      userFirstName={userFirstName}
      userKanaLastName={userKanaLastName}
      userKanaFirstName={userKanaFirstName}
      userCompanyName={userCompanyName}
      userPosition={userPosition}
      userDepartment={userDepartment}
      userCompanyUrl={userCompanyUrl}
      userCorporatePhone={userCorporatePhone}
      userPersonalPhone={userPersonalPhone}
      userPostalCode={userPostalCode}
      userPrefecture={userPrefecture}
      userCity={userCity}
      userStreet={userStreet}
      userProductCategory={userProductCategory}
      userBusinessType={userBusinessType}
      userRole={userRole}
      userStatus={userStatus}
      userCreatedAt={userCreatedAt}
      userLastLoginAt={userLastLoginAt}
    />
  );
}

// =====================================================
// Page Component (Server Component)
// =====================================================

export default async function ProfilePage() {
  return <ProfileContent />;
}

// =====================================================
// Server Component Metadata
// =====================================================

export const metadata = {
  title: 'マイページ | Epackage Lab',
  description: 'Epackage Lab会員プロフィールページ',
};

// Force dynamic rendering for this authenticated page
export const dynamic = 'force-dynamic';
