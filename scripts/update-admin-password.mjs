/**
 * Reset Admin Password Script
 *
 * Uses Supabase Management API to update admin password
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ijlgpzjdfipzmjvawofp.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU1ODI3NywiZXhwIjoyMDgyMTM0Mjc3fQ.LWSHBw-dbVkMjLMaZk3fyadfY_VrOEP7eVUMXNsvt58';

const supabase = createClient(supabaseUrl, serviceKey);

async function updateAdminPassword() {
  try {
    // admin@example.com のユーザーIDを取得
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Failed to list users:', listError);
      return;
    }

    const adminUser = users.users.find(u => u.email === 'admin@epackage-lab.com');

    if (!adminUser) {
      console.error('Admin user not found (admin@epackage-lab.com)');
      return;
    }

    console.log('Found admin user:', adminUser.id);

    // パスワードを更新
    const { data, error } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { password: 'Admin123!' }
    );

    if (error) {
      console.error('Failed to update password:', error);
    } else {
      console.log('✅ Password updated successfully for admin@epackage-lab.com');
      console.log('   New password: Admin123!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

updateAdminPassword();
