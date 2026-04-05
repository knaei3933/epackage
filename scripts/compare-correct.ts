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
    .select(`
      id,
      quotation_number,
      status,
      total_amount,
      subtotal_amount,
      subtotal,
      quotation_items (
        id,
        quantity,
        unit_price,
        total_price,
        specifications
      )
    `)
    .eq('quotation_number', quotationNumber)
    .single();

  if (quoteError) {
    console.log('=== ' + quotationNumber + ' ===');
    console.log('Error:', quoteError.message);
    return;
  }

  if (!quotes || !quotes.quotation_items || quotes.quotation_items.length === 0) {
    console.log('=== ' + quotationNumber + ' ===');
    console.log('No data found');
    return;
  }

  const item = quotes.quotation_items[0];
  const specs = item.specifications as any;

  console.log('=== ' + quotationNumber + ' ===');
  console.log('Status:', quotes.status || 'N/A');
  console.log('Quantity:', item.quantity);
  console.log('Total Amount:', quotes.total_amount ? '¥' + quotes.total_amount.toLocaleString() : 'N/A');
  console.log('Subtotal:', quotes.subtotal ? '¥' + quotes.subtotal.toLocaleString() : 'N/A');
  console.log('Item Unit Price:', item.unit_price ? '¥' + item.unit_price.toLocaleString() : 'N/A');
  console.log('Item Total Price:', item.total_price ? '¥' + item.total_price.toLocaleString() : 'N/A');

  if (specs.breakdown) {
    console.log('');
    console.log('Breakdown from specifications:');
    console.log('  Base Cost: ¥' + Math.round(specs.breakdown.baseCost || 0).toLocaleString());
    console.log('  Manufacturing Margin (30%): ¥' + Math.round(specs.breakdown.manufacturingMargin || 0).toLocaleString());
    console.log('  Total Cost: ¥' + Math.round(specs.breakdown.totalCost || 0).toLocaleString());
  }

  if (specs.film_cost_details) {
    console.log('');
    console.log('Film Cost Details:');
    console.log('  Total Meters:', specs.film_cost_details.totalMeters);
    console.log('  Total Weight:', specs.film_cost_details.totalWeight + 'kg');

    if (specs.film_cost_details.materialLayerDetails) {
      console.log('  Material Layers:');
      specs.film_cost_details.materialLayerDetails.forEach((l: any) => {
        console.log('    ' + l.materialId + ' ' + l.thicknessMicron + 'μm: ' + l.weightKg.toFixed(2) + 'kg = ₩' + l.costKRW.toLocaleString());
      });
    }
  }
  console.log('');
}

async function compareQuotes() {
  await checkQuote('QT20260330-9899');
  await checkQuote('QT20260331-3571');
}

compareQuotes().catch(console.error);
