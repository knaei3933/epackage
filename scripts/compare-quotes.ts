import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function compareQuotes() {
  const quoteNumbers = ['QT20260330-9899', 'QT20260331-3571'];

  for (const qn of quoteNumbers) {
    const { data: quotes } = await client
      .from('quotations')
      .select('id')
      .eq('quotation_number', qn)
      .single();

    if (!quotes) {
      console.log('Quote not found:', qn);
      continue;
    }

    const { data: items } = await client
      .from('quotation_items')
      .select('id, specifications')
      .eq('quotation_id', quotes.id)
      .single();

    if (!items) continue;

    const specs = items.specifications as any;
    const film = specs.film_cost_details;

    console.log('===' + qn + '===');
    console.log('Size:', specs.width + 'x' + specs.height + 'x' + specs.depth);
    console.log('Material:', specs.materialId);
    console.log('Quantity:', specs.quantity);
    console.log('Loss Rate:', specs.lossRate);
    console.log('Printing Colors:', specs.printingColors);
    console.log('Post Processing:', specs.postProcessingOptions?.join(', ') || 'none');
    console.log('');

    if (film) {
      console.log('Total Meters:', film.totalMeters);
      console.log('Area M2:', film.areaM2);
      console.log('');
      console.log('--- Material Layers ---');
      if (film.materialLayerDetails) {
        film.materialLayerDetails.forEach((l: any) => {
          console.log(l.materialId + ' ' + l.thicknessMicron + 'μm: ' + l.weightKg.toFixed(2) + 'kg x ₩' + l.unitPriceKRW + '/kg = ₩' + l.costKRW.toLocaleString());
        });
      }
      console.log('');
      console.log('--- Cost Summary ---');
      console.log('Total Cost KRW: ₩' + film.totalCostKRW?.toLocaleString());
      console.log('Total Weight: ' + film.totalWeight + 'kg');
    }

    if (specs.breakdown) {
      console.log('');
      console.log('--- Breakdown ---');
      console.log('Base Cost: ¥' + Math.round(specs.breakdown.baseCost).toLocaleString());
      console.log('Manufacturing Margin: ¥' + Math.round(specs.breakdown.manufacturingMargin).toLocaleString());
      console.log('Total Cost: ¥' + Math.round(specs.breakdown.totalCost).toLocaleString());
    }
    console.log('');
    console.log('---');
    console.log('');
  }
}

compareQuotes().catch(console.error);
