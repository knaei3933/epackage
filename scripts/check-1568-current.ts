import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkQT1568() {
  console.log('=== QT20260401-1568 現在の状態チェック ===\n');

  const { data: quote } = await supabase
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260401-1568')
    .single();

  if (!quote) {
    console.log('Quote not found');
    return;
  }

  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  if (items && items.length > 0) {
    const item = items[0];
    const specs = item.specifications as Record<string, unknown>;
    const breakdown = item.cost_breakdown as Record<string, unknown>;

    console.log('【specifications】');
    console.log('  bagTypeId:', specs.bagTypeId);
    console.log('  spoutSize:', specs.spoutSize, typeof specs.spoutSize);
    console.log('  spoutPosition:', specs.spoutPosition);
    console.log('');
    console.log('【cost_breakdown】');
    console.log('  pouchProcessingCost:', breakdown?.pouchProcessingCost, 'JPY');
    console.log('  期待値: 66000 JPY (₩550,000)');
    console.log('  一致:', breakdown?.pouchProcessingCost === 66000 ? '✓ YES' : '✗ NO');
  }
}

checkQT1568().catch(console.error);
