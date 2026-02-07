require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'loaded' : 'missing');
console.log('Service Key:', supabaseKey ? 'loaded' : 'missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuotationItems() {
  const quotationId = '4d2ae72f-c784-479d-be40-fcd71a736186';
  
  console.log('Checking quotation:', quotationId);
  
  // Check quotation_items
  const { data: items, error } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quotationId);
  
  console.log('Quotation items:', items?.length || 0);
  if (items && items.length > 0) {
    console.log('Items:', JSON.stringify(items, null, 2));
  }
  console.log('Error:', error);
  
  // Check sku_quotes
  const { data: skuQuotes, error: skuError } = await supabase
    .from('sku_quotes')
    .select('*')
    .eq('quote_id', quotationId);
  
  console.log('SKU quotes:', skuQuotes?.length || 0);
  if (skuQuotes && skuQuotes.length > 0) {
    console.log('First SKU:', JSON.stringify(skuQuotes[0], null, 2));
  }
  console.log('SKU Error:', skuError);
}

checkQuotationItems().then(() => process.exit(0));
