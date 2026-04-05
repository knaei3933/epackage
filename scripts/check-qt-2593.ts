import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkQuotation() {
  const quoteNum = 'QT20260404-2593';

  // Get quotation
  const { data: quote, error } = await supabase
    .from('quotations')
    .select('*')
    .eq('quotation_number', quoteNum)
    .single();

  if (error || !quote) {
    console.log('Error:', error?.message);
    return;
  }

  console.log('Quote ID:', quote.id);
  console.log('Status:', quote.status);
  console.log('Total:', quote.total_amount);

  // Get items with breakdown
  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  if (items && items.length > 0) {
    console.log('\n=== Items ===');
    items.forEach((item: any, idx: number) => {
      console.log(`\nItem ${idx + 1}:`);
      console.log('  id:', item.id);
      console.log('  product_name:', item.product_name);
      console.log('  quantity:', item.quantity);
      console.log('  unit_price:', item.unit_price);

      if (item.specifications) {
        const specs = item.specifications;
        console.log('  has specifications:', !!specs);
        console.log('  specifications keys:', Object.keys(specs));

        if (specs.sku_quantities) {
          console.log('  ✓ sku_quantities:', specs.sku_quantities);
        } else {
          console.log('  ❌ NO sku_quantities in specifications!');
        }

        // Check film_cost_details for SKU info
        if (specs.film_cost_details?.sku_cost_details) {
          console.log('  ✓ film_cost_details.sku_cost_details exists');
          console.log('    SKU count:', specs.film_cost_details.sku_cost_details?.length || 0);
        }
      }
    });
  }
}

checkQuotation().catch(console.error);
