import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOldQuotations() {
  // Search for quotations with number containing '1770' or similar pattern
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .or('quotation_number.ilike.%1770%,quotation_number.ilike.%QT-%')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== Quotations matching pattern ===\n');
  if (data.length === 0) {
    console.log('No quotations found matching the pattern');
  } else {
    data.forEach((q, i) => {
      console.log(`[${i+1}] ${q.quotation_number}`);
      console.log(`  Status: ${q.status}`);
      console.log(`  Created: ${q.created_at}`);
      console.log(`  Customer: ${q.customer_name || 'N/A'}`);
      console.log('');
    });
  }

  // Also get all quotation items to check specifications
  const { data: items, error: itemsError } = await supabase
    .from('quotation_items')
    .select('id, quotation_id, product_name, specifications, created_at')
    .order('created_at', { ascending: true })
    .limit(10);

  if (itemsError) {
    console.error('Items error:', itemsError);
    return;
  }

  console.log('\n=== Oldest Quotation Items ===\n');
  items.forEach((item, i) => {
    const specs = item.specifications as any;
    console.log(`[${i+1}] ${item.product_name}`);
    console.log(`  ID: ${item.id}`);
    console.log(`  quotation_id: ${item.quotation_id}`);
    console.log(`  Created: ${item.created_at}`);
    console.log(`  bagTypeId: ${specs?.bagTypeId}`);
    console.log(`  dimensions: ${specs?.dimensions}`);
    console.log(`  sideWidth: ${specs?.sideWidth ?? 'UNDEFINED'}`);
    console.log(`  sealWidth: ${specs?.sealWidth ?? 'UNDEFINED'}`);
    console.log('');
  });
}

checkOldQuotations().then(() => process.exit(0));
