const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function checkProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name_ja, category, min_order_quantity, lead_time_days, sort_order')
    .order('sort_order');

  if (error) {
    console.log('Error:', error);
    return;
  }

  console.log('現在の製品一覧:\n');
  data.forEach(p => {
    console.log(`${p.name_ja} (${p.category || 'N/A'})`);
    console.log(`  MOQ: ${p.min_order_quantity}, Lead: ${p.lead_time_days}日, Sort: ${p.sort_order}`);
    console.log(`  ID: ${p.id}`);
    console.log('');
  });
}

checkProducts();
