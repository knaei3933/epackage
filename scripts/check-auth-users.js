require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

(async () => {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log('Error:', error.message);
      return;
    }

    console.log('=== All Users ===');
    users.forEach((u, i) => {
      const confirmed = u.email_confirmed_at ? 'Yes' : 'No';
      const created = new Date(u.created_at).toLocaleDateString('ja-JP');
      console.log(`${i + 1}. ${u.email} | Confirmed: ${confirmed} | Created: ${created}`);
    });
  } catch (e) {
    console.log('Exception:', e.message);
  }
})();
