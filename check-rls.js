require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Service Role Client (should bypass RLS)
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLS() {
  const quotationId = '8cef8e63-b37d-4dbc-a103-bc7630b59b5d';
  
  console.log('=== Checking quotation_items with Service Role ===');
  console.log('Quotation ID:', quotationId);

  // Try to fetch items using Service Role
  const { data: items, error } = await serviceClient
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quotationId);

  console.log('Items count:', items?.length || 0);
  console.log('Error:', error);

  if (items && items.length > 0) {
    console.log('First item:', items[0]);
  }

  // Check RLS status
  console.log('\n=== Checking RLS status for quotation_items ===');
  const { data: rlsStatus } = await serviceClient
    .rpc('check_rls_status', { table_name: 'quotation_items' });

  console.log('RLS Status:', rlsStatus);

  process.exit(0);
}

checkRLS().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
