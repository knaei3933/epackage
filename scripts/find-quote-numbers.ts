import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // 最近のquotation_itemsからquotation_idを取得
  const { data: recent_items } = await client
    .from('quotation_items')
    .select('quotation_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('=== Recent Quotations ===');

  for (const item of recent_items || []) {
    // quotation_idからquotation_numberを取得
    const { data: quote } = await client
      .from('quotations')
      .select('quotation_number, final_price, unit_price, status, created_at')
      .eq('id', item.quotation_id)
      .single();

    if (quote) {
      console.log(quote.quotation_number + ': Status=' + quote.status + ', Final=' + (quote.final_price || 'N/A') + ', Created=' + quote.created_at);
    }
  }

  // quotation_numberで検索（LIKE）
  console.log('\n=== Search for 9899 ===');
  const { data: search } = await client
    .from('quotations')
    .select('quotation_number, final_price, unit_price, status')
    .like('quotation_number', '%9899%');

  for (const q of search || []) {
    console.log(q.quotation_number + ': Status=' + q.status + ', Final=' + (q.final_price || 'N/A'));
  }
}

main().catch(console.error);
