import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // quotationsテーブルのサンプルを取得
  const { data: sample } = await client
    .from('quotations')
    .select('*')
    .limit(1);

  if (sample && sample.length > 0) {
    console.log('=== Quotations Table Columns ===');
    console.log(Object.keys(sample[0]).join('\n'));
  } else {
    console.log('No data in quotations table');
  }

  // quotation_itemsのサンプルも取得
  const { data: itemSample } = await client
    .from('quotation_items')
    .select('*')
    .limit(1);

  if (itemSample && itemSample.length > 0) {
    console.log('\n=== Quotation_Items Table Columns ===');
    console.log(Object.keys(itemSample[0]).join('\n'));
  }
}

main().catch(console.error);
