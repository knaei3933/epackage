import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: quotes } = await client
    .from('quotations')
    .select('quotation_number, final_price, unit_price, status')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('=== Recent Quotes ===');
  for (const q of quotes || []) {
    console.log(q.quotation_number + ': Status=' + q.status + ', Final=' + (q.final_price || 'N/A'));
  }
}

main().catch(console.error);
