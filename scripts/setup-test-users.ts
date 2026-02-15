/**
 * Setup Test Users for E2E Testing
 *
 * This script:
 * 1. Creates admin account if it doesn't exist (ACTIVE status)
 * 2. Creates test member account (ACTIVE status)
 * 3. Sets up proper profiles with all required fields
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Admin user credentials
const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'Admin1234!',
  kanjiLastName: '管理',
  kanjiFirstName: '者',
  kanaLastName: 'かんり',
  kanaFirstName: 'しや', // Using Hiragana as required by constraint
  corporatePhone: '03-1234-5678',
  personalPhone: '090-1234-5678',
  companyName: 'Epackage Lab',
  businessType: 'CORPORATION',
  role: 'ADMIN'
};

// Test member credentials
const TEST_MEMBER = {
  email: 'test-member@example.com',
  password: 'Test1234!',
  kanjiLastName: '山田',
  kanjiFirstName: '太郎',
  kanaLastName: 'やまだ', // Using Hiragana as required by constraint
  kanaFirstName: 'たろう', // Using Hiragana as required by constraint
  corporatePhone: '03-5678-9012',
  personalPhone: '080-6942-7235',
  companyName: 'テスト株式会社',
  businessType: 'CORPORATION',
  role: 'MEMBER'
};

async function createAdminUser() {
  console.log('Creating admin user...');

  // Check if admin exists
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const existingAdmin = users?.find(u => u.email === ADMIN_USER.email);

  let adminId: string;

  if (existingAdmin) {
    console.log(`✓ Admin user already exists: ${existingAdmin.id}`);
    adminId = existingAdmin.id;
  } else {
    // Create admin user
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email: ADMIN_USER.email,
      password: ADMIN_USER.password,
      email_confirm: true,
      user_metadata: {
        kanji_last_name: ADMIN_USER.kanjiLastName,
        kanji_first_name: ADMIN_USER.kanjiFirstName,
        kana_last_name: ADMIN_USER.kanaLastName,
        kana_first_name: ADMIN_USER.kanaFirstName,
      },
      app_metadata: {
        role: ADMIN_USER.role
      }
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return null;
    }

    console.log(`✓ Created admin user: ${user.id}`);
    adminId = user.id;
  }

  // Create/update profile record with ACTIVE status
  const profileData = {
    id: adminId,
    email: ADMIN_USER.email,
    kanji_last_name: ADMIN_USER.kanjiLastName,
    kanji_first_name: ADMIN_USER.kanjiFirstName,
    kana_last_name: ADMIN_USER.kanaLastName,
    kana_first_name: ADMIN_USER.kanaFirstName,
    corporate_phone: ADMIN_USER.corporatePhone,
    personal_phone: ADMIN_USER.personalPhone,
    business_type: ADMIN_USER.businessType,
    company_name: ADMIN_USER.companyName,
    position: '管理者',
    department: 'システム',
    product_category: 'OTHER',
    acquisition_channel: 'direct',
    postal_code: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    street: '1-1-1',
    role: ADMIN_USER.role as any,
    status: 'ACTIVE' as any,
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'id' });

  if (profileError) {
    console.error('Error creating admin profile:', profileError);
  } else {
    console.log('✓ Created/Updated admin profile with ACTIVE status');
  }

  return adminId;
}

async function createTestMember() {
  console.log('\nCreating test member...');

  // Check if test member exists
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const existingMember = users?.find(u => u.email === TEST_MEMBER.email);

  let memberId: string;

  if (existingMember) {
    console.log(`✓ Test member already exists: ${existingMember.id}`);
    memberId = existingMember.id;
  } else {
    // Create test member
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email: TEST_MEMBER.email,
      password: TEST_MEMBER.password,
      email_confirm: true,
      user_metadata: {
        kanji_last_name: TEST_MEMBER.kanjiLastName,
        kanji_first_name: TEST_MEMBER.kanjiFirstName,
        kana_last_name: TEST_MEMBER.kanaLastName,
        kana_first_name: TEST_MEMBER.kanaFirstName,
      },
      app_metadata: {
        role: TEST_MEMBER.role
      }
    });

    if (error) {
      console.error('Error creating test member:', error);
      return null;
    }

    console.log(`✓ Created test member: ${user.id}`);
    memberId = user.id;
  }

  // Create/update profile record with ACTIVE status
  const profileData = {
    id: memberId,
    email: TEST_MEMBER.email,
    kanji_last_name: TEST_MEMBER.kanjiLastName,
    kanji_first_name: TEST_MEMBER.kanjiFirstName,
    kana_last_name: TEST_MEMBER.kanaLastName,
    kana_first_name: TEST_MEMBER.kanaFirstName,
    corporate_phone: TEST_MEMBER.corporatePhone,
    personal_phone: TEST_MEMBER.personalPhone,
    business_type: TEST_MEMBER.businessType,
    company_name: TEST_MEMBER.companyName,
    position: '担当者',
    department: '営業',
    product_category: 'OTHER',
    acquisition_channel: 'web_search',
    postal_code: '123-4567',
    prefecture: '東京都',
    city: '渋谷区',
    street: '1-2-3',
    role: TEST_MEMBER.role as any,
    status: 'ACTIVE' as any,
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'id' });

  if (profileError) {
    console.error('Error creating member profile:', profileError);
  } else {
    console.log('✓ Created/Updated member profile with ACTIVE status');
  }

  return memberId;
}

async function main() {
  console.log('=== Test Users Setup ===\n');

  const adminId = await createAdminUser();
  if (!adminId) {
    console.error('Failed to create admin user');
    process.exit(1);
  }

  const memberId = await createTestMember();
  if (!memberId) {
    console.error('Failed to create test member');
    process.exit(1);
  }

  console.log('\n✓ Test users setup complete!');
  console.log('\nLogin credentials:');
  console.log('-------------------');
  console.log('ADMIN:');
  console.log(`  Email: ${ADMIN_USER.email}`);
  console.log(`  Password: ${ADMIN_USER.password}`);
  console.log('\nMEMBER:');
  console.log(`  Email: ${TEST_MEMBER.email}`);
  console.log(`  Password: ${TEST_MEMBER.password}`);
  console.log('\nBoth accounts are now ACTIVE and ready for testing.');
}

main().catch(console.error);
