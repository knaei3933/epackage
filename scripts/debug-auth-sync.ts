/**
 * Debug Auth Sync Script
 *
 * Query auth.users and profiles tables to identify ID synchronization issues
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debugAuthSync() {
  console.log('\n=== Auth Users vs Profiles ID Synchronization Debug ===\n');

  // 1. Get all profiles
  console.log('1. Fetching all profiles...');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, role, status');

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return;
  }

  console.log(`Found ${profiles.length} profiles:`);
  profiles.forEach(p => {
    console.log(`  - ${p.id}: ${p.email} (${p.role}, ${p.status})`);
  });

  // 2. Get all auth users using admin API
  console.log('\n2. Fetching all auth users...');
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('Error fetching auth users:', authError);
    return;
  }

  console.log(`Found ${users.length} auth users:`);
  users.forEach((u: any) => {
    console.log(`  - ${u.id}: ${u.email} (confirmed: ${u.email_confirmed_at ? 'yes' : 'no'})`);
  });

  // 3. Find mismatches
  console.log('\n3. Analyzing synchronization...');

  const profileIds = new Set(profiles.map(p => p.id));
  const authUserIds = new Set(users.map((u: any) => u.id));
  const profileEmails = new Set(profiles.map(p => p.email));
  const authEmails = new Set(users.map((u: any) => u.email));

  // Profiles without matching auth user
  const orphanedProfiles = profiles.filter(p => !authUserIds.has(p.id));
  if (orphanedProfiles.length > 0) {
    console.log('\n⚠️  Profiles WITHOUT matching auth.users:');
    orphanedProfiles.forEach(p => {
      console.log(`  - ${p.id}: ${p.email}`);
    });
  } else {
    console.log('\n✅ All profiles have matching auth.users');
  }

  // Auth users without matching profile
  const orphanedAuthUsers = users.filter((u: any) => !profileIds.has(u.id));
  if (orphanedAuthUsers.length > 0) {
    console.log('\n⚠️  Auth.users WITHOUT matching profiles:');
    orphanedAuthUsers.forEach((u: any) => {
      console.log(`  - ${u.id}: ${u.email}`);
    });
  } else {
    console.log('\n✅ All auth.users have matching profiles');
  }

  // Email mismatches (ID exists but different email)
  console.log('\n4. Checking email mismatches...');
  const emailMismatches: any[] = [];
  profiles.forEach(p => {
    const authUser = users.find((u: any) => u.id === p.id);
    if (authUser && authUser.email !== p.email) {
      emailMismatches.push({
        id: p.id,
        profileEmail: p.email,
        authEmail: authUser.email
      });
    }
  });

  if (emailMismatches.length > 0) {
    console.log('\n⚠️  ID matches but emails differ:');
    emailMismatches.forEach(m => {
      console.log(`  - ${m.id}: profile=${m.profileEmail}, auth=${m.authEmail}`);
    });
  } else {
    console.log('\n✅ All emails match for synchronized IDs');
  }

  // 5. Summary
  console.log('\n=== Summary ===');
  console.log(`Profiles: ${profiles.length}`);
  console.log(`Auth Users: ${users.length}`);
  console.log(`Orphaned Profiles: ${orphanedProfiles.length}`);
  console.log(`Orphaned Auth Users: ${orphanedAuthUsers.length}`);
  console.log(`Email Mismatches: ${emailMismatches.length}`);

  return {
    profiles,
    authUsers: users,
    orphanedProfiles,
    orphanedAuthUsers,
    emailMismatches
  };
}

debugAuthSync();
