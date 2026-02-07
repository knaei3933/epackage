import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkQuotationItems() {
  const { data, error } = await supabase
    .from('quotation_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== Quotation Items ===');
  if (data && data.length > 0) {
    data.forEach((item, i) => {
      console.log(`\n[${i+1}] Item ID: ${item.id}`);
      console.log('  Quotation ID:', item.quotation_id);
      console.log('  Product Name:', item.product_name);
      console.log('  Specifications:', JSON.stringify(item.specifications, null, 2));
    });
  }
}

checkQuotationItems().then(() => process.exit(0));
