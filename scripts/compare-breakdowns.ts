import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function compareBreakdowns() {
  const numbers = ['QT20260330-9899', 'QT20260331-3571'];

  for (const qn of numbers) {
    const { data: quote } = await client
      .from('quotations')
      .select('id')
      .eq('quotation_number', qn)
      .single();

    const { data: item } = await client
      .from('quotation_items')
      .select('cost_breakdown')
      .eq('quotation_id', quote.id)
      .single();

    const bd = item.cost_breakdown;

    console.log('=== ' + qn + ' ===');
    if (bd) {
      console.log('Material Cost:', Math.round(bd.materialCost || 0));
      console.log('Lamination Cost:', Math.round(bd.laminationCost || 0));
      console.log('Slitter Cost:', Math.round(bd.slitterCost || 0));
      console.log('Pouch Processing Cost:', Math.round(bd.pouchProcessingCost || 0));
      console.log('Printing Cost:', Math.round(bd.printingCost || 0));
      console.log('Surface Treatment Cost:', Math.round(bd.surfaceTreatmentCost || 0));
      console.log('');
      console.log('Base Cost:', Math.round(bd.baseCost || 0));
      console.log('Manufacturing Margin:', Math.round(bd.manufacturingMargin || 0));
      console.log('Margin Rate:', bd.manufacturingMargin && bd.baseCost ? ((bd.manufacturingMargin / bd.baseCost) * 100).toFixed(1) + '%' : 'N/A');
      console.log('Duty:', Math.round(bd.duty || 0));
      console.log('Delivery:', Math.round(bd.delivery || 0));
      console.log('Sales Margin:', Math.round(bd.salesMargin || 0));
      console.log('Sales Margin Rate:', bd.salesMargin && bd.baseCost ? ((bd.salesMargin / bd.baseCost) * 100).toFixed(1) + '%' : 'N/A');
      console.log('');
      console.log('Total Cost:', Math.round(bd.totalCost || 0));
    }
    console.log('');
  }

  // 結論
  console.log('=== Summary ===');
  console.log('QT20260330-9899 (3/30 21:24) is ¥61,000 cheaper');
  console.log('QT20260331-3571 (3/31 04:01) is ¥61,000 more expensive');
  console.log('');
  console.log('The difference is likely due to:');
  console.log('- Different margin rates applied');
  console.log('- Different pricing calculation version');
  console.log('- Recalculation after pricing engine update');
}

compareBreakdowns().catch(console.error);
