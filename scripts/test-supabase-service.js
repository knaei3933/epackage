require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase Service Role Key...');
console.log('URL:', url);
console.log('Key exists:', !!key);
console.log('Key starts with:', key ? key.substring(0, 20) + '...' : 'N/A');

if (!url || !key) {
  console.error('ERROR: Missing credentials');
  process.exit(1);
}

const client = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test: Query inquiries table
console.log('\nTesting database query...');
client.from('inquiries').select('count').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('ERROR:', error.message);
      process.exit(1);
    }
    console.log('SUCCESS: Service Role Key working!');
    console.log('Test query result:', data);
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });
