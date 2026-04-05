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
    .select('quotation_number, id, final_price, unit_price, status')
    .in('quotation_number', ['QT20260330-9899', 'QT20260331-3571']);

  console.log('=== Search Results ===');
  console.log('Found:', quotes?.length || 0);

  if (!quotes || quotes.length === 0) {
    console.log('No quotes found');
    return;
  }

  for (const q of quotes) {
    console.log('\n' + q.quotation_number + ':');
    console.log('  Status:', q.status);
    console.log('  Final Price:', q.final_price || 'not set');
    console.log('  Unit Price:', q.unit_price || 'not set');
  }
}

main().catch(console.error);
