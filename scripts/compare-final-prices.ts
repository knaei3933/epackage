import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function compareFinalPrices() {
  const quoteNumbers = ['QT20260330-9899', 'QT20260331-3571'];

  for (const qn of quoteNumbers) {
    const { data: quotes } = await client
      .from('quotations')
      .select('id, final_price, unit_price, status')
      .eq('quotation_number', qn)
      .single();

    if (!quotes) continue;

    const { data: items } = await client
      .from('quotation_items')
      .select('id, specifications, quantity')
      .eq('quotation_id', quotes.id)
      .single();

    if (!items) continue;

    const specs = items.specifications as any;

    console.log('===' + qn + '===');
    console.log('Status:', quotes.status);
    console.log('Quantity:', items.quantity || specs.quantity);
    console.log('Final Price: ¥' + (quotes.final_price || 0).toLocaleString());
    console.log('Unit Price: ¥' + (quotes.unit_price || 0).toLocaleString());

    if (specs.breakdown) {
      console.log('');
      console.log('Breakdown:');
      console.log('  Base Cost: ¥' + Math.round(specs.breakdown.baseCost || 0).toLocaleString());
      console.log('  Manufacturing Margin (30%): ¥' + Math.round(specs.breakdown.manufacturingMargin || 0).toLocaleString());
      console.log('  Duty: ¥' + Math.round(specs.breakdown.duty || 0).toLocaleString());
      console.log('  Delivery: ¥' + Math.round(specs.breakdown.delivery || 0).toLocaleString());
      console.log('  Sales Margin (30%): ¥' + Math.round(specs.breakdown.salesMargin || 0).toLocaleString());
      console.log('  Total Cost: ¥' + Math.round(specs.breakdown.totalCost || 0).toLocaleString());
    }
    console.log('');
  }
}

compareFinalPrices().catch(console.error);
