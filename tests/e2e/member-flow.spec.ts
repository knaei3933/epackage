import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Member Flow E2E Test
 *
 * Tests the complete authentication flow:
 * 1. User registration
 * 2. Email verification flow (pending state)
 * 3. Admin approval (via database)
 * 4. Login with approved user
 * 5. Dashboard access
 * 6. Logout and re-login
 */

// Supabase client for database verification/approval
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Helper: Generate unique test user
const generateTestUser = () => {
  const timestamp = Date.now();
  return {
    email: `member-test-${timestamp}@testmail.dev`, // Use testmail.dev for testing
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!', // Use env var for security
    kanjiLastName: '山田', // Kanji characters only
    kanjiFirstName: '太郎', // Kanji characters only
    kanaLastName: 'やまだ', // Hiragana only
    kanaFirstName: 'たろう', // Hiragana only
    corporatePhone: '03-1234-5678',
    personalPhone: '090-1234-5678',
    businessType: 'CORPORATION',
    companyName: `テスト株式会社${timestamp}`,
    position: '担当者',
    postalCode: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    street: '1-2-3',
    productCategory: 'COSMETICS',
    acquisitionChannel: 'web_search',
  };
};

// Helper: Approve user in database
async function approveUser(email: string) {
  const supabase = getSupabaseClient();

  // Find user by email
  const { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (findError || !profile) {
    throw new Error(`User not found: ${email}`);
  }

  // Update status to ACTIVE
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
    .eq('id', profile.id);

  if (updateError) {
    throw new Error(`Failed to approve user: ${updateError.message}`);
  }

  console.log('User approved:', email);
  return profile;
}

// Helper: Cleanup test user
async function cleanupUser(email: string) {
  const supabase = getSupabaseClient();

  // Delete from profiles
  await supabase.from('profiles').delete().eq('email', email);

  // Delete from auth.users (need admin client)
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === email);
  if (user) {
    await supabase.auth.admin.deleteUser(user.id);
  }

  console.log('User cleaned up:', email);
}

test.describe('Member Flow E2E', () => {
  let testUser: ReturnType<typeof generateTestUser>;
  let userId: string;

  test.beforeEach(async () => {
    testUser = generateTestUser();
  });

  test.afterEach(async () => {
    // Cleanup test user
    try {
      await cleanupUser(testUser.email);
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  });

  test('Complete flow: Register → Approve → Login → Dashboard → Logout', async ({ page, context }) => {
    // =====================================================
    // Step 1: Navigate to registration page
    // =====================================================
    await page.goto('/auth/register');
    await expect(page.locator('text=会員登録')).toBeVisible();

    // =====================================================
    // Step 2: Fill registration form
    // =====================================================

    // Section 1: Authentication info
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="passwordConfirm"]', testUser.password);

    // Section 2: Name fields
    await page.fill('input[placeholder*="山田"]', testUser.kanjiLastName);
    await page.fill('input[placeholder*="やまだ"]', testUser.kanaLastName);
    await page.fill('input[placeholder*="太郎"]', testUser.kanjiFirstName);
    await page.fill('input[placeholder*="たろう"]', testUser.kanaFirstName);

    // Section 3: Contact info
    await page.fill('input[name="corporatePhone"]', testUser.corporatePhone);
    await page.fill('input[name="personalPhone"]', testUser.personalPhone);

    // Section 4: Business type (CORPORATION)
    await page.check('input[value="CORPORATION"]');

    // Wait for corporation fields to appear
    await expect(page.locator('text=会社情報')).toBeVisible({ timeout: 3000 });

    // Section 5: Company info
    await page.fill('input[name="companyName"]', testUser.companyName);
    await page.fill('input[name="position"]', testUser.position);
    await page.fill('input[name="department"]', '営業');

    // Section 6: Address
    await page.fill('input[name="postalCode"]', testUser.postalCode);
    await page.selectOption('select[name="prefecture"]', testUser.prefecture);
    await page.fill('input[name="city"]', testUser.city);
    await page.fill('input[name="street"]', testUser.street);

    // Section 7: Product category
    await page.selectOption('select[name="productCategory"]', testUser.productCategory);

    // Section 8: Acquisition channel
    await page.selectOption('select[name="acquisitionChannel"]', testUser.acquisitionChannel);

    // Section 9: Privacy consent
    await page.check('input[name="privacyConsent"]');

    // =====================================================
    // Step 3: Submit registration
    // =====================================================
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should redirect to pending page
    await expect(page.locator('text=メール認証後')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=管理者の承認をお待ちください')).toBeVisible();

    console.log('Registration successful, user in PENDING state');

    // =====================================================
    // Step 4: Verify database record
    // =====================================================
    const supabase = getSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testUser.email)
      .single();

    expect(profile).not.toBeNull();
    expect(profile?.status).toBe('PENDING');
    expect(profile?.email).toBe(testUser.email);
    userId = profile?.id;

    console.log('Database record verified:', userId);

    // =====================================================
    // Step 5: Approve user (simulating admin action)
    // =====================================================
    await approveUser(testUser.email);

    // Verify approval
    const { data: approvedProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testUser.email)
      .single();

    expect(approvedProfile?.status).toBe('ACTIVE');
    console.log('User approved successfully');

    // =====================================================
    // Step 6: Navigate to login page
    // =====================================================
    await page.goto('/auth/signin');
    await expect(page.locator('text=ログイン')).toBeVisible();

    // =====================================================
    // Step 7: Login with approved user
    // =====================================================
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);

    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();

    // =====================================================
    // Step 8: Verify dashboard access
    // =====================================================
    // Should redirect to dashboard
    await page.waitForURL('**/member/dashboard', { timeout: 10000 });
    await expect(page.locator('text=ダッシュボード')).toBeVisible({ timeout: 10000 });

    // Verify user info displayed
    await expect(page.locator(`text=${testUser.email}`)).toBeVisible({ timeout: 5000 });

    console.log('Login successful, dashboard accessible');

    // =====================================================
    // Step 9: Logout
    // =====================================================
    await page.goto('/auth/signout');

    // Should redirect to signin page
    await expect(page.locator('text=ログイン')).toBeVisible({ timeout: 5000 });

    console.log('Logout successful');

    // =====================================================
    // Step 10: Re-login
    // =====================================================
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard again
    await page.waitForURL('**/member/dashboard', { timeout: 10000 });
    await expect(page.locator('text=ダッシュボード')).toBeVisible({ timeout: 10000 });

    console.log('Re-login successful');
  });

  test('Registration form validation', async ({ page }) => {
    await page.goto('/auth/register');

    // Submit without filling any fields
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show validation errors
    await expect(page.locator('text=入力データの検証に失敗しました')).toBeVisible({ timeout: 5000 });
  });

  test('Login with wrong password', async ({ page }) => {
    // First, create and approve a user via API
    const supabase = getSupabaseClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
    });

    expect(authError).toBeNull();
    expect(authData.user).not.toBeNull();

    // Create profile
    await supabase.from('profiles').insert({
      id: authData.user!.id,
      email: testUser.email,
      kanji_last_name: testUser.kanjiLastName,
      kanji_first_name: testUser.kanjiFirstName,
      kana_last_name: testUser.kanaLastName,
      kana_first_name: testUser.kanaFirstName,
      corporate_phone: testUser.corporatePhone,
      personal_phone: testUser.personalPhone,
      business_type: testUser.businessType,
      company_name: testUser.companyName,
      position: testUser.position,
      postal_code: testUser.postalCode,
      prefecture: testUser.prefecture,
      city: testUser.city,
      street: testUser.street,
      product_category: testUser.productCategory,
      acquisition_channel: testUser.acquisitionChannel,
      role: 'MEMBER',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Now try to login with wrong password
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', 'WrongPassword123!');

    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();

    // Should show error
    await expect(page.locator('text=ログインに失敗しました')).toBeVisible({ timeout: 5000 });
  });

  test('Protected route redirects to login when not authenticated', async ({ page }) => {
    // Try to access dashboard without logging in
    await page.goto('/member/dashboard');

    // Should redirect to signin page
    await expect(page.locator('text=ログイン')).toBeVisible({ timeout: 5000 });
  });
});
