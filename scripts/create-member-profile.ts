/**
 * Create Member Profile Script
 *
 * Create profile for existing auth user
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createMemberProfile() {
  const email = 'member@test.com';
  const userId = '3b67b1c5-5f88-40d8-998a-436f0f81fac0';

  console.log('\n=== Creating Member Profile ===\n');
  console.log(`Email: ${email}`);
  console.log(`User ID: ${userId}\n`);

  // First, reset password
  console.log('1. Resetting password...');
  const { error: pwdError } = await supabase.auth.admin.updateUserById(
    userId,
    {
      password: 'Member1234!',
      email_confirm: true
    }
  );

  if (pwdError) {
    console.error('❌ Error resetting password:', pwdError.message);
  } else {
    console.log('✅ Password reset to: Member1234!');
  }

  // Create profile
  console.log('\n2. Creating profile...');
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email: email,
      kanji_last_name: '山田',
      kanji_first_name: '太郎',
      kana_last_name: 'やまだ',
      kana_first_name: 'たろう',
      corporate_phone: '03-1234-5678',
      personal_phone: '090-1234-5678',
      business_type: 'CORPORATION',
      company_name: 'テスト株式会社',
      position: '担当者',
      department: '営業部',
      product_category: 'OTHER',
      postal_code: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      street: '丸の内1-1-1',
      role: 'MEMBER',
      status: 'ACTIVE'
    });

  if (profileError) {
    console.error('❌ Error creating profile:', profileError.message);
    console.error('Details:', profileError);
    return;
  }

  console.log('✅ Profile created successfully!\n');

  // Verify
  console.log('3. Verifying...');
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, role, status');

  const { data: { users } } = await supabase.auth.admin.listUsers();

  console.log('\n=== Final State ===');
  console.log('\nProfiles:');
  profiles?.forEach((p: any) => {
    console.log(`  - ${p.email} (${p.role}, ${p.status})`);
  });

  console.log('\nAuth Users:');
  users?.forEach((u: any) => {
    const profile = profiles?.find((p: any) => p.id === u.id);
    const synced = profile?.email === u.email ? '✅' : '❌';
    console.log(`  ${synced} - ${u.email}`);
  });

  console.log('\n=== Test Account Credentials ===');
  console.log('\n🔵 Member Account:');
  console.log('   Email: member@test.com');
  console.log('   Password: Member1234!');
  console.log('   Dashboard: http://localhost:3000/member/dashboard');

  console.log('\n🔴 Admin Account:');
  console.log('   Email: admin@epackage-lab.com');
  console.log('   Password: Admin1234!');
  console.log('   Dashboard: http://localhost:3000/admin/dashboard');

  console.log('\n✅ Setup complete! You can now log in.\n');
}

createMemberProfile();
