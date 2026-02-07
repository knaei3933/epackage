const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStatus() {
  const { data, error } = await supabase
    .from('quotations')
    .select('id, quotation_number, status')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== Recent Quotation Statuses ===');
  data.forEach(q => {
    console.log(`${q.quotation_number}: status = '${q.status}'`);
  });

  // Check unique statuses
  const { data: statusData } = await supabase
    .from('quotations')
    .select('status');

  const uniqueStatuses = [...new Set(statusData?.map(q => q.status) || [])];
  console.log('\n=== Unique Status Values ===');
  uniqueStatuses.forEach(s => console.log(`- ${s}`));
}

checkStatus();
