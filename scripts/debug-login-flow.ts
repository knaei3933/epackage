/**
 * Debug Login Flow Script
 *
 * Check if login works end-to-end
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function debugLogin() {
  console.log('\n=== Debug Login Flow ===\n');

  // Test 1: Member login
  console.log('1. Testing member login...');
  const memberResult = await supabase.auth.signInWithPassword({
    email: 'member@test.com',
    password: 'Member1234!',
  });

  if (memberResult.error) {
    console.error('❌ Member login failed:', memberResult.error.message);
    return;
  }

  console.log('✅ Member login successful!');
  console.log('   User ID:', memberResult.data.user?.id);
  console.log('   Email:', memberResult.data.user?.email);
  console.log('   Session:', memberResult.data.session ? 'Yes' : 'No');

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', memberResult.data.user!.id)
    .single();

  if (profile) {
    console.log('   Profile found:');
    console.log('   - Role:', (profile as any).role);
    console.log('   - Status:', (profile as any).status);
  } else {
    console.error('   ❌ Profile not found!');
  }

  // Test 2: Check session after login
  console.log('\n2. Checking session...');
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    console.log('✅ Session is active');
    console.log('   Access token exists:', session.access_token ? 'Yes' : 'No');
    console.log('   Expires in:', session.expires_in ? `${session.expires_in}s` : 'Unknown');
  } else {
    console.error('❌ No active session');
  }

  // Test 3: Admin login
  console.log('\n3. Testing admin login...');
  await supabase.auth.signOut();

  const adminResult = await supabase.auth.signInWithPassword({
    email: 'admin@epackage-lab.com',
    password: 'Admin1234!',
  });

  if (adminResult.error) {
    console.error('❌ Admin login failed:', adminResult.error.message);
    return;
  }

  console.log('✅ Admin login successful!');
  console.log('   User ID:', adminResult.data.user?.id);
  console.log('   Email:', adminResult.data.user?.email);

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', adminResult.data.user!.id)
    .single();

  if (adminProfile) {
    console.log('   Profile found:');
    console.log('   - Role:', (adminProfile as any).role);
    console.log('   - Status:', (adminProfile as any).status);
  }

  console.log('\n=== Summary ===');
  console.log('Both accounts can log in successfully.');
  console.log('Now test in the browser at http://localhost:3000/auth/signin\n');
}

debugLogin();
