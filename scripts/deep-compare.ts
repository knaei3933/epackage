import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function deepCompare() {
  const numbers = ['QT20260330-9899', 'QT20260331-3571'];

  for (const qn of numbers) {
    const { data: quotes } = await client
      .from('quotation_items')
      .select('specifications')
      .eq('quotation_id', (
        await client
          .from('quotations')
          .select('id')
          .eq('quotation_number', qn)
          .single()
      ).data?.id)
      .single();

    const specs = quotes?.specifications as any;

    console.log('=== ' + qn + ' ===');
    console.log('Width:', specs.width);
    console.log('Height:', specs.height);
    console.log('Depth:', specs.depth);
    console.log('Material:', specs.materialId);
    console.log('Bag Type:', specs.bagTypeId);
    console.log('Loss Rate:', specs.lossRate);
    console.log('Markup Rate:', specs.markupRate);
    console.log('Printing Colors:', specs.printingColors);
    console.log('Post Processing:', JSON.stringify(specs.postProcessingOptions));
    console.log('');

    if (specs.breakdown) {
      console.log('Breakdown exists: YES');
      console.log('  Base Cost:', specs.breakdown.baseCost);
      console.log('  Manufacturing Margin:', specs.breakdown.manufacturingMargin);
      console.log('  Sales Margin:', specs.breakdown.salesMargin);
      console.log('  Duty:', specs.breakdown.duty);
      console.log('  Delivery:', specs.breakdown.delivery);
      console.log('  Total Cost:', specs.breakdown.totalCost);
    } else {
      console.log('Breakdown exists: NO');
    }
    console.log('');
  }
}

deepCompare().catch(console.error);
