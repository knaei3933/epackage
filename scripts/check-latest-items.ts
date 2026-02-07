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
    .limit(3);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== Latest Quotation Items ===');
  data.forEach((item, i) => {
    const specs = item.specifications as any;
    console.log(`\n[${i+1}] ${item.product_name}`);
    console.log('  Created:', item.created_at);
    console.log('  bagTypeId:', specs?.bagTypeId);
    console.log('  width:', specs?.width);
    console.log('  pitch:', specs?.pitch ?? 'UNDEFINED');
    console.log('  dimensions:', specs?.dimensions);
    console.log('  Has pitch:', specs?.hasOwnProperty('pitch'));
  });
}

checkLatest().then(() => process.exit(0));
