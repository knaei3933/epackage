/**
 * Member Account Creation Script
 *
 * 일반 회원 계정을 생성합니다
 * Usage: npx tsx scripts/create-member.ts <email> <password> <role>
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabaseUrlTyped = supabaseUrl as string;
const supabaseServiceRoleKeyTyped = supabaseServiceRoleKey as string;

// Get arguments
const email = process.argv[2];
const password = process.argv[3];
const role = process.argv[4] || 'MEMBER';

if (!email || !password) {
  console.error('❌ Missing required arguments');
  console.error('Usage: npx tsx scripts/create-member.ts <email> <password> [role]');
  console.error('');
  console.error('Example: npx tsx scripts/create-member.ts member@epackage-lab.com Member1234! MEMBER');
  console.error('Example: npx tsx scripts/create-member.ts admin2@epackage-lab.com Admin1234! ADMIN');
  process.exit(1);
}

// Password validation
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}$/;
if (!passwordRegex.test(password)) {
  console.error('❌ Password does not meet requirements:');
  console.error('  - At least 8 characters');
  console.error('  - At least 1 uppercase letter');
  console.error('  - At least 1 lowercase letter');
  console.error('  - At least 1 number');
  process.exit(1);
}

async function createMemberUser() {
  const supabase = createClient(supabaseUrlTyped, supabaseServiceRoleKeyTyped, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`\n🔐 Creating member user: ${email}`);
  console.log('─────────────────────────────────────────────\n');

  try {
    // Step 1: Check if user already exists
    console.log('1. Checking if user already exists...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      console.log('⚠️  User already exists, updating profile...');
      userId = existingUser.id;

      // Check and update profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: role as any,
            status: 'ACTIVE',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.error('❌ Failed to update profile:', updateError);
          process.exit(1);
        }

        console.log('✅ Existing profile updated');
        console.log('\n📧 Email:', email);
        console.log('🔑 Password:', '(unchanged)');
        console.log('👤 Role:', role);
        console.log('📊 Status: ACTIVE');
        return;
      }
    } else {
      // Step 2: Create auth user using admin API
      console.log('2. Creating Supabase auth user using admin API...');
      const { data: newUserData, error: newUserError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          email,
        },
      });

      if (newUserError) {
        console.error('❌ Auth error:', newUserError.message);
        process.exit(1);
      }

      if (!newUserData.user) {
        console.error('❌ Failed to create user');
        process.exit(1);
      }

      userId = newUserData.user.id;
      console.log('✅ Auth user created:', userId);
    }

    // Step 3: Create profile
    console.log('\n3. Creating profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        kanji_last_name: '山田',
        kanji_first_name: '太郎',
        kana_last_name: 'やまだ',
        kana_first_name: 'たろう',
        business_type: 'CORPORATION',
        product_category: 'OTHER',
        company_name: 'テスト株式会社',
        position: '担当者',
        role: role as any,
        status: 'ACTIVE',
      });

    if (profileError) {
      console.error('❌ Profile creation error:', profileError);
      // Rollback - delete auth user
      await supabase.auth.admin.deleteUser(userId);
      console.error('❌ Rolled back auth user creation');
      process.exit(1);
    }

    console.log('✅ Profile created with ACTIVE status');

    // Summary
    console.log('\n─────────────────────────────────────────────');
    console.log('✅ Account created successfully!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Name: 山田 太郎 (Yamada Taro)');
    console.log('🔐 Role:', role);
    console.log('📊 Status: ACTIVE');
    console.log('─────────────────────────────────────────────\n');
    console.log('You can now login at: http://localhost:3000/auth/signin\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createMemberUser();
