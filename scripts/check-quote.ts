import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkQuote(quotationNumber: string) {
  const { data: quotes, error: quoteError } = await client
    .from('quotations')
    .select('id')
    .eq('quotation_number', quotationNumber)
    .single();

  if (quoteError || !quotes) {
    console.log('Quote not found:', quotationNumber);
    return;
  }

  const { data: items, error: itemsError } = await client
    .from('quotation_items')
    .select('id, specifications')
    .eq('quotation_id', quotes.id)
    .single();

  if (itemsError || !items) {
    console.log('Items not found');
    return;
  }

  const specs = items.specifications as any;
  console.log('===' + quotationNumber + '===');
  console.log('Size:', specs.width, 'x', specs.height, 'x', specs.depth);
  console.log('Quantity:', specs.quantity);
  console.log('');

  // 親quotationも取得
  const { data: quote } = await client
    .from('quotations')
    .select('quotation_number, final_price, unit_price, status')
    .eq('id', quotes.id)
    .single();

  console.log('Status:', quote?.status || 'N/A');
  console.log('Final Price:', quote?.final_price || 'N/A');
  console.log('Unit Price:', quote?.unit_price || 'N/A');

  if (specs.breakdown) {
    console.log('Breakdown Total Cost:', Math.round(specs.breakdown.totalCost || 0));
    console.log('Breakdown Base Cost:', Math.round(specs.breakdown.baseCost || 0));
  }

  if (specs.film_cost_details) {
    console.log('Total Meters:', specs.film_cost_details.totalMeters);

    if (specs.film_cost_details.materialLayerDetails) {
      console.log('=== Material Layers ===');
      specs.film_cost_details.materialLayerDetails.forEach((l: any) => {
        console.log(l.materialId + ' ' + l.thicknessMicron + 'μm: ' + l.weightKg.toFixed(2) + 'kg');
      });
    }
  } else {
    console.log('No film_cost_details');
  }
}

async function compareQuotes() {
  await checkQuote('QT20260330-9899');
  console.log('');
  await checkQuote('QT20260331-3571');
}

compareQuotes().catch(console.error);
