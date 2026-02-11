require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', url ? 'SET' : 'NOT SET');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', key ? 'SET' : 'NOT SET');
  process.exit(1);
}

const supabase = createClient(url, key);

(async () => {
  try {
    console.log('=== Fetching all users from Supabase Auth ===\n');

    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error('❌ Error fetching users:', userError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('No users found in Supabase Auth\n');
      return;
    }

    console.log(`Total users: ${users.length}\n`);

    // Display each user
    users.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`);
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Created At:', user.created_at);
      console.log('Last Sign In:', user.last_sign_in_at || 'Never');
      console.log('Email Confirmed:', user.email_confirmed_at ? '✅ Yes' : '❌ No');
      console.log('Phone:', user.phone || 'N/A');
      console.log('Metadata:', JSON.stringify(user.user_metadata, null, 2));
    });

    // Check profiles table
    console.log('\n\n=== Fetching profiles from database ===\n');

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');

    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError.message);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profiles found in database\n');
      return;
    }

    console.log(`Total profiles: ${profiles.length}\n`);

    profiles.forEach((profile, index) => {
      console.log(`\n--- Profile ${index + 1} ---`);
      console.log('ID:', profile.id);
      console.log('Email:', profile.email);
      console.log('Name:', `${profile.kanji_last_name || ''} ${profile.kanji_first_name || ''}`.trim() || 'N/A');
      console.log('Role:', profile.role);
      console.log('Status:', profile.status);
      console.log('User Type:', profile.user_type);
      console.log('Business Type:', profile.business_type);
      console.log('Company:', profile.company_name || 'N/A');
      console.log('Created At:', profile.created_at);
      console.log('Updated At:', profile.updated_at);
    });

    // Find matching users
    console.log('\n\n=== User-Profile Matching ===\n');

    const authUserIds = new Set(users.map(u => u.id));
    const profileUserIds = new Set(profiles.map(p => p.id));

    const usersWithoutProfiles = users.filter(u => !profileUserIds.has(u.id));
    const profilesWithoutUsers = profiles.filter(p => !authUserIds.has(p.id));

    if (usersWithoutProfiles.length > 0) {
      console.log(`\n⚠️  Auth users without profiles (${usersWithoutProfiles.length}):`);
      usersWithoutProfiles.forEach(u => {
        console.log(`  - ${u.email} (${u.id})`);
      });
    }

    if (profilesWithoutUsers.length > 0) {
      console.log(`\n⚠️  Profiles without auth users (${profilesWithoutUsers.length}):`);
      profilesWithoutUsers.forEach(p => {
        console.log(`  - ${p.email} (${p.id})`);
      });
    }

    if (usersWithoutProfiles.length === 0 && profilesWithoutUsers.length === 0) {
      console.log('\n✅ All auth users have matching profiles and vice versa');
    }

    console.log('\n=== Summary ===');
    console.log(`Total Auth Users: ${users.length}`);
    console.log(`Total Profiles: ${profiles.length}`);
    console.log(`Active Members: ${profiles.filter(p => p.status === 'ACTIVE').length}`);
    console.log(`Pending Members: ${profiles.filter(p => p.status === 'PENDING').length}`);
    console.log(`Admins: ${profiles.filter(p => p.role === 'ADMIN').length}`);

  } catch (e) {
    console.error('❌ Exception:', e.message);
    console.error(e.stack);
  }
})();
