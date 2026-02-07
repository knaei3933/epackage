/**
 * Fix user_role enum to use lowercase values
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRoleEnum() {
  console.log('Fixing user_role enum to lowercase...\n');

  // Execute the SQL to fix the enum
  const sql = `
    -- First, alter the enum type to use lowercase values
    ALTER TYPE user_role RENAME TO user_role_old;

    CREATE TYPE user_role AS ENUM ('admin', 'operator', 'sales', 'accounting', 'member', 'guest');

    -- Update the profiles table to use the new enum type
    ALTER TABLE profiles
      ALTER COLUMN role TYPE user_role USING role::text::user_role;

    -- Drop the old enum type
    DROP TYPE user_role_old;
  `;

  // Execute the SQL through PostgreSQL RPC
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_string: sql
  });

  if (error) {
    console.error('Error fixing enum:', error);
    console.log('\nTrying alternative approach...\n');

    // Alternative: Update each user individually
    const { data: users } = await supabase
      .from('profiles')
      .select('id, role');

    for (const user of users || []) {
      const newRole = user.role?.toLowerCase();
      if (newRole && newRole !== user.role) {
        console.log(`Updating user ${user.id}: ${user.role} -> ${newRole}`);
        await supabase
          .from('profiles')
          .update({ role: newRole as any })
          .eq('id', user.id);
      }
    }
  } else {
    console.log('✓ Enum fixed successfully');
  }
}

fixRoleEnum().then(() => {
  console.log('\nDone!');
  process.exit(0);
}).catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
