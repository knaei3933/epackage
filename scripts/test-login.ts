/**
 * Login Verification Script
 *
 * Test that the created accounts can successfully log in
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testLogin(email: string, password: string, role: string) {
  console.log(`\nTesting ${role} login...`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error(`❌ Login failed: ${error.message}`);
    return false;
  }

  if (!data.session) {
    console.error('❌ No session returned');
    return false;
  }

  console.log('✅ Login successful!');
  console.log(`   User ID: ${data.user.id}`);
  console.log(`   Email: ${data.user.email}`);
  console.log(`   Email Confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);

  // Get profile to verify role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', data.user.id)
    .single();

  if (profile) {
    console.log(`   Role: ${profile.role}`);
    console.log(`   Status: ${profile.status}`);
  }

  // Sign out
  await supabase.auth.signOut();

  return true;
}

async function main() {
  console.log('\n========================================');
  console.log('   Login Verification Test');
  console.log('========================================');

  // Test member account
  const memberSuccess = await testLogin(
    'member@test.com',
    'Member1234!',
    'MEMBER'
  );

  // Test admin account
  const adminSuccess = await testLogin(
    'admin@epackage-lab.com',
    'Admin1234!',
    'ADMIN'
  );

  console.log('\n========================================');
  console.log('   Summary');
  console.log('========================================');

  if (memberSuccess && adminSuccess) {
    console.log('\n✅ All accounts verified successfully!');
    console.log('\nYou can now log in to the application:');
    console.log('  🔵 Member: http://localhost:3000/auth/signin');
    console.log('  🔴 Admin:  http://localhost:3000/auth/signin');
  } else {
    console.log('\n❌ Some accounts failed verification');
    if (!memberSuccess) console.log('  - Member account failed');
    if (!adminSuccess) console.log('  - Admin account failed');
  }

  console.log('\n========================================\n');
}

main();
