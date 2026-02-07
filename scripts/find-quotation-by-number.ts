import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findQuotation() {
  const searchTerm = '1770336517117';

  // Search for quotations with the specific number
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== Searching for quotation containing:', searchTerm, '===\n');

  const found = data.filter(q => q.quotation_number.includes(searchTerm) || q.quotation_number.includes('1770'));

  if (found.length > 0) {
    console.log(`Found ${found.length} matching quotations:\n`);
    found.forEach((q) => {
      console.log(`Quotation Number: ${q.quotation_number}`);
      console.log(`Status: ${q.status}`);
      console.log(`Created: ${q.created_at}`);
      console.log(`Customer: ${q.customer_name || 'N/A'}`);
      console.log(`ID: ${q.id}`);
      console.log('');
    });
  } else {
    console.log('No exact match found. Showing all recent quotations with QT- prefix:\n');
    const qtPrefixQuotes = data.filter(q => q.quotation_number.startsWith('QT-'));
    qtPrefixQuotes.forEach((q, i) => {
      console.log(`[${i+1}] ${q.quotation_number}`);
      console.log(`  Status: ${q.status}`);
      console.log(`  Created: ${q.created_at}`);
      console.log(`  ID: ${q.id}`);
      console.log('');
    });
  }

  // Get quotation items for the found quotation or most recent ones
  const quotationId = found.length > 0 ? found[0].id : data[0]?.id;

  if (quotationId) {
    const { data: items, error: itemsError } = await supabase
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', quotationId);

    if (!itemsError && items) {
      console.log('\n=== Quotation Items ===\n');
      items.forEach((item, i) => {
        const specs = typeof item.specifications === 'string' ? JSON.parse(item.specifications) : item.specifications;
        console.log(`[${i+1}] ${item.product_name}`);
        console.log(`  Quantity: ${item.quantity}`);
        console.log(`  Unit Price: ${item.unit_price}`);
        console.log(`  Total Price: ${item.total_price}`);
        console.log(`  Specifications:`);
        console.log(JSON.stringify(specs, null, 2));
        console.log('');
      });
    }
  }
}

findQuotation().then(() => process.exit(0));
