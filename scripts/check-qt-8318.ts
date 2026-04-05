import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkQuotation() {
  const quoteNum = 'QT20260403-8318';

  // Get quotation
  const { data: quote, error: quoteError } = await supabase
    .from('quotations')
    .select('id, quotation_number, subtotal, tax_amount, total_amount, status')
    .eq('quotation_number', quoteNum)
    .single();

  if (quoteError || !quote) {
    console.log('Quote error:', quoteError?.message || 'Not found');
    return;
  }

  console.log('Quotation:', quote.quotation_number);
  console.log('subtotal:', quote.subtotal);
  console.log('tax_amount:', quote.tax_amount);
  console.log('total_amount:', quote.total_amount);

  // Get items - try both table names
  let items = null;
  let itemsError = null;

  // Try quotation_items first
  const result1 = await supabase
    .from('quotation_items')
    .select('id, product_name, quantity, unit_price, total_price')
    .eq('quotation_id', quote.id);

  if (!result1.error && result1.data) {
    items = result1.data;
  } else {
    // Try quotation_item
    const result2 = await supabase
      .from('quotation_item')
      .select('id, product_name, quantity, unit_price, total_price')
      .eq('quotation_id', quote.id);

    if (result2.error) {
      itemsError = result2.error;
    } else {
      items = result2.data;
    }
  }

  if (itemsError) {
    console.log('Items error:', itemsError.message);
    return;
  }

  console.log('\n=== Items count:', items?.length || 0, '===');
  if (items) {
    items.forEach((item: any, idx: number) => {
      console.log(`\nSKU ${idx + 1}:`);
      console.log('  product_name:', item.product_name);
      console.log('  quantity:', item.quantity);
      console.log('  unit_price:', item.unit_price);
      console.log('  total_price:', item.total_price);
    });
  }
}

checkQuotation().catch(console.error);
