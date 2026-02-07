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

// 이전 대화에서 언급된 user ID
const targetId = '77ed6083-632e-4679-9afd-63ff15d83bce';

(async () => {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log('Error:', error.message);
      return;
    }

    // ID로 검색
    const userById = users.find(u => u.id === targetId);
    if (userById) {
      console.log('=== Found by ID ===');
      console.log('ID:', userById.id);
      console.log('Email:', userById.email);
      console.log('Email Confirmed:', userById.email_confirmed_at);
      console.log('Created At:', userById.created_at);
      console.log('=== User Metadata ===');
      console.log(JSON.stringify(userById.user_metadata, null, 2));
    } else {
      console.log('User with ID', targetId, 'not found');
    }

    // arwg22로 검색 (부분 일치)
    console.log('\n=== Searching for arwg22 ===');
    const userByArwg = users.find(u => u.email && u.email.includes('arwg22'));
    if (userByArwg) {
      console.log('Found:', userByArwg.email);
      console.log('ID:', userByArwg.id);
      console.log('Email Confirmed:', userByArwg.email_confirmed_at);
    } else {
      console.log('No user with arwg22 in email found');
    }

  } catch (e) {
    console.log('Exception:', e.message);
  }
})();
