/**
 * Sync test user profiles
 * Ensures auth.users and public.profiles are synchronized
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

async function syncProfiles() {
  console.log('=== Syncing Test User Profiles ===\n');

  const testUsers = [
    {
      email: 'member@test.com',
      role: 'MEMBER',
      status: 'ACTIVE',
      name_kanji: 'テスト',
      name_kana: 'テスト',
    },
    {
      email: 'admin@epackage-lab.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      name_kanji: '管理者',
      name_kana: 'カンリシャ',
    },
  ];

  for (const testUser of testUsers) {
    console.log(`Checking ${testUser.email}...`);

    // Get user from auth.users
    const { data: { users }, error: authError } = await serviceClient.auth.admin.listUsers();

    if (authError) {
      console.error('Error listing users:', authError);
      continue;
    }

    const authUser = users.find(u => u.email === testUser.email);

    if (!authUser) {
      console.log(`  ❌ Auth user not found for ${testUser.email}`);
      continue;
    }

    console.log(`  ✅ Auth user found: ${authUser.id}`);

    // Check if profile exists
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileError) {
      console.error('  Error checking profile:', profileError);
      continue;
    }

    if (profile) {
      console.log(`  ✅ Profile exists, updating...`);

      // Update profile to ensure it's active
      const { error: updateError } = await serviceClient
        .from('profiles')
        .update({
          status: testUser.status,
          role: testUser.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id);

      if (updateError) {
        console.error('  ❌ Error updating profile:', updateError);
      } else {
        console.log(`  ✅ Profile updated to ${testUser.status}/${testUser.role}`);
      }
    } else {
      console.log(`  ❌ Profile not found, creating...`);

      // Create profile
      const newProfile = {
        id: authUser.id,
        email: testUser.email,
        kanji_last_name: testUser.name_kanji,
        kanji_first_name: 'ユーザー',
        kana_last_name: testUser.name_kana,
        kana_first_name: 'ユーザー',
        business_type: 'INDIVIDUAL' as const,
        product_category: 'OTHER' as const,
        role: testUser.role as 'ADMIN' | 'MEMBER',
        status: testUser.status as 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED',
      };

      const { error: insertError } = await serviceClient
        .from('profiles')
        .insert(newProfile);

      if (insertError) {
        console.error('  ❌ Error creating profile:', insertError);
      } else {
        console.log(`  ✅ Profile created for ${testUser.email}`);
      }
    }
  }

  console.log('\n=== Sync Complete ===');
}

syncProfiles().catch(console.error);
