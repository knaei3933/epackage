/**
 * Setup Script for Authentication E2E Tests
 *
 * This script creates test users in the database for E2E testing.
 * Run this before executing the Phase 2 authentication tests.
 *
 * Usage:
 *   ts-node scripts/setup-auth-test-users.ts
 *
 * Environment Variables Required:
 *   - SUPABASE_SERVICE_ROLE_KEY (for admin operations)
 *   - NEXT_PUBLIC_SUPABASE_URL
 */

import { createClient } from '@supabase/supabase-js';

// =====================================================
// Configuration
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// =====================================================
// Test User Definitions
// =====================================================

const TEST_USERS = [
  {
    email: process.env.TEST_MEMBER_EMAIL || 'test-member@example.com',
    password: process.env.TEST_MEMBER_PASSWORD || 'Test1234!',
    role: 'MEMBER',
    metadata: {
      kanji_last_name: 'テスト',
      kanji_first_name: 'ユーザー',
      kana_last_name: 'てすと',
      kana_first_name: 'ゆーざー',
      postal_code: '123-4567',
      prefecture: '東京都',
      city: '渋谷区',
      street: '1-2-3'
    }
  },
  {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'Admin1234!',
    role: 'ADMIN',
    metadata: {
      kanji_last_name: '管理者',
      kanji_first_name: 'テスト',
      kana_last_name: 'かんりしゃ',
      kana_first_name: 'てすと',
      postal_code: '123-4567',
      prefecture: '東京都',
      city: '渋谷区',
      street: '1-2-3'
    }
  },
  {
    email: process.env.TEST_PENDING_EMAIL || 'pending@example.com',
    password: process.env.TEST_PENDING_PASSWORD || 'Pending1234!',
    role: 'PENDING',
    metadata: {
      kanji_last_name: '承認待ち',
      kanji_first_name: 'ユーザー',
      kana_last_name: 'しょうにんまち',
      kana_first_name: 'ゆーざー',
      postal_code: '123-4567',
      prefecture: '東京都',
      city: '渋谷区',
      street: '1-2-3'
    }
  }
];

// =====================================================
// Functions
// =====================================================

/**
 * Check if a user exists by email
 */
async function userExists(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error(`Error checking user ${email}:`, error.message);
    return false;
  }

  return !!data;
}

/**
 * Create a test user with Supabase Auth
 */
async function createTestUser(userData: typeof TEST_USERS[0]) {
  try {
    // Check if user already exists
    const exists = await userExists(userData.email);
    if (exists) {
      console.log(`✓ User already exists: ${userData.email} (${userData.role})`);
      return;
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        ...userData.metadata,
        role: userData.role
      }
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Failed to create user: No user data returned');
    }

    // Create profile entry
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: userData.email,
        kanji_last_name: userData.metadata.kanji_last_name,
        kanji_first_name: userData.metadata.kanji_first_name,
        kana_last_name: userData.metadata.kana_last_name,
        kana_first_name: userData.metadata.kana_first_name,
        postal_code: userData.metadata.postal_code,
        prefecture: userData.metadata.prefecture,
        city: userData.metadata.city,
        street: userData.metadata.street,
        role: userData.role,
        is_approved: userData.role !== 'PENDING' // Only non-PENDING users are approved
      });

    if (profileError) {
      throw profileError;
    }

    console.log(`✓ Created user: ${userData.email} (${userData.role})`);

  } catch (error: any) {
    console.error(`✗ Failed to create user ${userData.email}:`, error.message);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Setting up test users for E2E authentication tests');
  console.log('='.repeat(60));
  console.log();

  let successCount = 0;
  let failureCount = 0;

  for (const userData of TEST_USERS) {
    try {
      await createTestUser(userData);
      successCount++;
    } catch (error) {
      failureCount++;
    }
  }

  console.log();
  console.log('='.repeat(60));
  console.log('Setup Complete');
  console.log('='.repeat(60));
  console.log(`Success: ${successCount} | Failures: ${failureCount}`);
  console.log();
  console.log('You can now run the Phase 2 authentication E2E tests:');
  console.log('  npx playwright test tests/e2e/phase-2-auth/');
  console.log();
}

// =====================================================
// Execute
// =====================================================

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
