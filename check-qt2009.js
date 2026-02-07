require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const quotationNumber = 'QT20260206-2009';
  console.log('=== Checking quotation:', quotationNumber, '===');

  const { data: quotation } = await supabase
    .from('quotations')
    .select('id, created_at')
    .eq('quotation_number', quotationNumber)
    .single();

  if (!quotation) {
    console.log('Quotation not found');
    process.exit(1);
  }

  console.log('Quotation ID:', quotation.id);

  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quotation.id);

  console.log('Items count:', items ? items.length : 0);

  if (items && items.length > 0) {
    items.forEach((item, i) => {
      console.log('--- Item', i + 1, '---');
      console.log('Product:', item.product_name);
      console.log('Quantity:', item.quantity);
      console.log('Unit Price:', item.unit_price);
      console.log('Has specifications:', item.specifications ? 'Yes' : 'No');
    });
  } else {
    console.log('NO ITEMS FOUND - This explains the admin page issue!');
  }

  console.log('');
  console.log('--- Recent quotations comparison ---');
  const { data: recentQuotations } = await supabase
    .from('quotations')
    .select('id, quotation_number')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentQuotations) {
    for (const q of recentQuotations) {
      const { count } = await supabase
        .from('quotation_items')
        .select('*', { count: 'exact', head: true })
        .eq('quotation_id', q.id);
      console.log(q.quotation_number + ':', count || 0, 'items');
    }
  }

  process.exit(0);
}

check();
