/**
 * Check and fix admin user role
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'SET' : 'NOT SET');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminRole() {
  console.log('Checking admin user role...\n');

  // Check admin@epackage-lab.com
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, role, status')
    .or('email.eq.admin@epackage-lab.com,email.eq.admin@example.com');

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log('Found users:');
  for (const user of users || []) {
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Status: ${user.status}`);
    console.log(`  ID: ${user.id}`);
    console.log('');

    // Fix role if needed
    if (user.role !== 'admin') {
      console.log(`  → Fixing role to 'admin'...`);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);

      if (updateError) {
        console.error('  ✗ Error updating role:', updateError);
      } else {
        console.log('  ✓ Role updated successfully');
      }
    }

    // Fix status if needed
    if (user.status !== 'ACTIVE') {
      console.log(`  → Fixing status to 'ACTIVE'...`);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ status: 'ACTIVE' })
        .eq('id', user.id);

      if (updateError) {
        console.error('  ✗ Error updating status:', updateError);
      } else {
        console.log('  ✓ Status updated successfully');
      }
    }
  }

  // Also check auth.users for the email
  const { data: authUsers } = await supabase.auth.admin.listUsers();

  if (authUsers) {
    console.log('\nAuth users with admin email:');
    for (const authUser of authUsers.users) {
      if (authUser.email?.includes('admin')) {
        console.log(`  Email: ${authUser.email}`);
        console.log(`  ID: ${authUser.id}`);
        console.log(`  Email confirmed: ${authUser.email_confirmed_at}`);
        console.log('');
      }
    }
  }
}

checkAdminRole().then(() => {
  console.log('\nDone!');
  process.exit(0);
}).catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
