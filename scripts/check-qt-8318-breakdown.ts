import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkQuotation() {
  const quoteNum = 'QT20260403-8318';

  const { data: quote, error } = await supabase
    .from('quotations')
    .select('id')
    .eq('quotation_number', quoteNum)
    .single();

  if (error || !quote) {
    console.log('Error:', error?.message);
    return;
  }

  console.log('Quote ID:', quote.id);

  // Get all items without specifying breakdown column
  console.log('\n=== Getting quotation_items ===');
  const { data: items, error: err } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('Found items:', items?.length || 0);
    if (items && items.length > 0) {
      items.forEach((item: any, idx: number) => {
        console.log(`\n=== Item ${idx + 1} ===`);
        console.log('id:', item.id);
        console.log('product_name:', item.product_name);
        console.log('quantity:', item.quantity);
        console.log('unit_price:', item.unit_price);
        console.log('total_price:', item.total_price);
        console.log('specifications keys:', item.specifications ? Object.keys(item.specifications) : 'no specs');

        // Check if specifications has sku_quantities or similar
        if (item.specifications) {
          console.log('\nspecifications:', JSON.stringify(item.specifications, null, 2));
        }
      });
    }
  }

  // Also check what columns are in the table
  console.log('\n=== Checking table columns ===');
  const { data: columns, error: colErr } = await supabase
    .rpc('get_table_columns', { table_name: 'quotation_items' });

  if (colErr) {
    console.log('Cannot get columns - RPC function may not exist');
  } else {
    console.log('Columns:', columns);
  }
}

checkQuotation().catch(console.error);
