/**
 * Admin Account Creation Script
 *
 * Creates an admin user with ADMIN role and ACTIVE status
 * Usage: npx tsx scripts/create-admin.ts <email> <password>
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Type assertions for TypeScript (process.exit doesn't narrow types)
const supabaseUrlTyped = supabaseUrl as string;
const supabaseServiceRoleKeyTyped = supabaseServiceRoleKey as string;

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('❌ Missing required arguments');
  console.error('Usage: npx tsx scripts/create-admin.ts <email> <password>');
  console.error('');
  console.error('Example: npx tsx scripts/create-admin.ts admin@example.com AdminPass123!');
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

async function createAdminUser() {
  // Use service role key for admin operations
  const supabase = createClient(supabaseUrlTyped, supabaseServiceRoleKeyTyped, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`\n🔐 Creating admin user: ${email}`);
  console.log('─────────────────────────────────────────────\n');

  try {
    // Step 1: Check if user already exists
    console.log('1. Checking if user already exists...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      console.log('⚠️  User already exists, updating profile to admin...');
      userId = existingUser.id;

      // Check if profile exists
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
            role: 'ADMIN',
            status: 'ACTIVE',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.error('❌ Failed to update profile:', updateError);
          process.exit(1);
        }

        console.log('✅ Existing profile updated to ADMIN role with ACTIVE status');
        console.log('\n📧 Email:', email);
        console.log('🔑 Password:', '(unchanged)');
        console.log('👤 Role: ADMIN');
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

    // Step 3: Create profile with admin role
    console.log('\n3. Creating admin profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        kanji_last_name: '管理',
        kanji_first_name: '者',
        kana_last_name: 'かんり',
        kana_first_name: 'しゃ',
        business_type: 'INDIVIDUAL',
        product_category: 'OTHER',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

    if (profileError) {
      console.error('❌ Profile creation error:', profileError);
      // Rollback - delete auth user
      await supabase.auth.admin.deleteUser(userId);
      console.error('❌ Rolled back auth user creation');
      process.exit(1);
    }

    console.log('✅ Profile created with ADMIN role and ACTIVE status');

    // Summary
    console.log('\n─────────────────────────────────────────────');
    console.log('✅ Admin account created successfully!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Name: 管理 者 (Kanri Sha)');
    console.log('🔐 Role: ADMIN');
    console.log('📊 Status: ACTIVE');
    console.log('─────────────────────────────────────────────\n');
    console.log('You can now login at: http://localhost:3000/signin\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdminUser();
