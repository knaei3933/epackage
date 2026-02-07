import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkLatest() {
  const { data, error } = await supabase
    .from('quotation_items')
    .select('id, quotation_id, product_name, specifications, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== Latest Quotation Items ===\n');
  data.forEach((item, i) => {
    const specs = item.specifications as any;
    console.log(`[${i+1}] ${item.product_name}`);
    console.log(`  Created: ${item.created_at}`);
    console.log(`  bagTypeId: ${specs?.bagTypeId}`);
    console.log(`  width: ${specs?.width}`);
    console.log(`  pitch: ${specs?.pitch ?? 'UNDEFINED'}`);
    console.log(`  height: ${specs?.height}`);
    console.log(`  dimensions: ${specs?.dimensions}`);
    console.log(`  Has pitch field: ${specs?.hasOwnProperty('pitch')}`);
    console.log('');
  });

  // Also check quotations table
  const { data: quotes, error: quoteError } = await supabase
    .from('quotations')
    .select('id, quotation_number, notes, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (quoteError) {
    console.error('Quote error:', quoteError);
    return;
  }

  console.log('=== Latest Quotations (notes field) ===\n');
  quotes.forEach((q, i) => {
    console.log(`[${i+1}] ${q.quotation_number}`);
    console.log(`  Created: ${q.created_at}`);
    if (q.notes) {
      try {
        const notes = JSON.parse(q.notes);
        console.log(`  notes.pitch: ${notes?.pitch ?? 'UNDEFINED'}`);
      } catch (e) {
        console.log(`  notes: (not JSON)`);
      }
    }
    console.log('');
  });
}

checkLatest().then(() => process.exit(0));
