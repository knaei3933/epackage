require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

(async () => {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log('Error:', error.message);
      return;
    }

    console.log('=== Unconfirmed Users ===');
    const unconfirmed = users.filter(u => !u.email_confirmed_at);

    if (unconfirmed.length === 0) {
      console.log('No unconfirmed users found');
    } else {
      unconfirmed.forEach((u, i) => {
        console.log(`${i + 1}. ${u.email}`);
        console.log('   ID:', u.id);
        console.log('   Created:', new Date(u.created_at).toLocaleString('ja-JP'));
        console.log('   Has Metadata:', Object.keys(u.user_metadata || {}).length > 0);
        if (u.user_metadata && Object.keys(u.user_metadata).length > 0) {
          console.log('   Metadata Keys:', Object.keys(u.user_metadata).join(', '));
        }
        console.log('');
      });
    }

    // test.feb.2026@gmail.com 상세 확인
    const testUser = users.find(u => u.email === 'test.feb.2026@gmail.com');
    if (testUser) {
      console.log('=== test.feb.2026@gmail.com Details ===');
      console.log('ID:', testUser.id);
      console.log('Email Confirmed At:', testUser.email_confirmed_at);
      console.log('User Metadata:', JSON.stringify(testUser.user_metadata, null, 2));
    }

  } catch (e) {
    console.log('Exception:', e.message);
  }
})();
