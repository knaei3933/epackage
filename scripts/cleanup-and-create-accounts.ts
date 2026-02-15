/**
 * Cleanup and Create Test Accounts Script
 *
 * Clean up orphaned entries and create working test accounts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanupAndCreateAccounts() {
  console.log('\n=== Cleanup and Create Test Accounts ===\n');

  // 1. Delete the duplicate profile with PENDING status
  console.log('1. Deleting duplicate profile (PENDING status)...');
  const { error: deleteError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', '3b67b1c5-5f88-40d8-998a-436f0f81fac0');

  if (deleteError) {
    console.error('Error deleting duplicate profile:', deleteError.message);
  } else {
    console.log('✅ Deleted duplicate profile');
  }

  // 2. Update the mismatched auth user's email to match the profile
  console.log('\n2. Updating auth user email for member account...');
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    '5619e371-5561-4459-90fc-45c34ace3e5f',
    {
      email: 'member@test.com',
      email_confirm: true
    }
  );

  if (updateError) {
    console.error('Error updating auth user email:', updateError.message);
    console.log('⚠️  Could not update email, will delete and recreate instead...');

    // Delete both the profile and auth user for the mismatched ID
    console.log('\n3. Deleting mismatched entries...');

    // Delete profile first (due to foreign key)
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', '5619e371-5561-4459-90fc-45c34ace3e5f');

    if (deleteProfileError) {
      console.error('Error deleting profile:', deleteProfileError.message);
    } else {
      console.log('✅ Deleted profile');
    }

    // Delete auth user
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
      '5619e371-5561-4459-90fc-45c34ace3e5f'
    );

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError.message);
    } else {
      console.log('✅ Deleted auth user');
    }

    // Now create fresh member account
    console.log('\n4. Creating fresh member account...');
    await createMemberAccount();
  } else {
    console.log('✅ Updated auth user email');

    // Update profile status to ACTIVE
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ status: 'ACTIVE' })
      .eq('id', '5619e371-5561-4459-90fc-45c34ace3e5f');

    if (updateProfileError) {
      console.error('Error updating profile status:', updateProfileError.message);
    } else {
      console.log('✅ Updated profile status to ACTIVE');
    }

    // Reset password
    console.log('\n5. Resetting member password...');
    const { error: pwdError } = await supabase.auth.admin.updateUserById(
      '5619e371-5561-4459-90fc-45c34ace3e5f',
      {
        password: 'Member1234!',
        email_confirm: true
      }
    );

    if (pwdError) {
      console.error('Error resetting password:', pwdError.message);
    } else {
      console.log('✅ Reset password to: Member1234!');
    }
  }

  // 6. Reset admin password
  console.log('\n6. Resetting admin password...');
  const { error: adminPwdError } = await supabase.auth.admin.updateUserById(
    '54fd7b31-b805-43cf-b92e-898ddd066875',
    {
      password: 'Admin1234!',
      email_confirm: true
    }
  );

  if (adminPwdError) {
    console.error('Error resetting admin password:', adminPwdError.message);
  } else {
    console.log('✅ Reset admin password to: Admin1234!');
  }

  // 7. Verify final state
  console.log('\n7. Verifying final state...');
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
    console.log(`  ${synced} - ${u.email} (ID: ${u.id})`);
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

  console.log('\n✅ Cleanup complete! You can now log in with these credentials.\n');
}

async function createMemberAccount() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'member@test.com',
    password: 'Member1234!',
    email_confirm: true,
    user_metadata: {
      email: 'member@test.com'
    }
  });

  if (error) {
    console.error('❌ Error creating auth user:', error.message);
    return;
  }

  const userId = data.user.id;
  console.log('✅ Created auth user:', userId);

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email: 'member@test.com',
      kanji_last_name: '山田',
      kanji_first_name: '太郎',
      kana_last_name: 'やまだ',
      kana_first_name: 'たろう',
      business_type: 'CORPORATION',
      product_category: 'OTHER',
      company_name: 'テスト株式会社',
      position: '担当者',
      role: 'MEMBER',
      status: 'ACTIVE'
    });

  if (profileError) {
    console.error('❌ Error creating profile:', profileError.message);
    // Rollback
    await supabase.auth.admin.deleteUser(userId);
    console.log('❌ Rolled back auth user creation');
    return;
  }

  console.log('✅ Created profile for member@test.com');
}

cleanupAndCreateAccounts();
