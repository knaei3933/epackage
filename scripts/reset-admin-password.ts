/**
 * Reset Admin Password Script
 *
 * This script resets the admin password using the Supabase service role.
 * Usage: npx tsx scripts/reset-admin-password.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const adminEmail = 'admin@epackage-lab.com';
const newPassword = 'Admin1234';

async function resetPassword() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`🔑 Resetting password for ${adminEmail}...`);

  // Get the user first
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Error listing users:', listError);
    process.exit(1);
  }

  const adminUser = users.find(u => u.email === adminEmail);

  if (!adminUser) {
    console.error(`❌ User ${adminEmail} not found`);
    process.exit(1);
  }

  console.log(`✅ Found user: ${adminUser.id}`);

  // Update the user's password using the admin API
  const { error: updateError } = await supabase.auth.admin.updateUserById(adminUser.id, {
    password: newPassword,
  });

  if (updateError) {
    console.error('❌ Error updating password:', updateError);
    process.exit(1);
  }

  console.log(`✅ Password reset successfully!`);
  console.log(`📧 Email: ${adminEmail}`);
  console.log(`🔑 New Password: ${newPassword}`);
  console.log(`\nYou can now login with these credentials.`);
}

resetPassword().catch(console.error);
