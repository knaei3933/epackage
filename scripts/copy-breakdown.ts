import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function copyBreakdown() {
  console.log('=== Copying breakdown from QT20260331-3571 to QT20260330-9899 ===\n');

  // ソース（正しいデータ）
  const { data: sourceQuote } = await client
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260331-3571')
    .single();

  const { data: sourceItem } = await client
    .from('quotation_items')
    .select('specifications, cost_breakdown')
    .eq('quotation_id', sourceQuote.id)
    .single();

  const sourceSpecs = sourceItem.specifications as any;
  const sourceBreakdown = sourceItem.cost_breakdown;

  console.log('Source breakdown:');
  console.log('  Material Cost:', sourceBreakdown.materialCost);
  console.log('  Base Cost:', sourceBreakdown.baseCost);
  console.log('  Total Cost:', sourceBreakdown.totalCost);
  console.log('');

  // ターゲット（修正が必要）
  const { data: targetQuote } = await client
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260330-9899')
    .single();

  const { data: targetItem } = await client
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', targetQuote.id)
    .single();

  const targetSpecs = targetItem.specifications as any;

  console.log('Target current Material Cost:', targetItem.cost_breakdown.materialCost);
  console.log('');

  // specificationsを更新（breakdownとfilm_cost_detailsをコピー）
  const updatedSpecs = {
    ...targetSpecs,
    breakdown: sourceBreakdown,
    film_cost_details: sourceSpecs.film_cost_details,
    filmLayers: sourceSpecs.filmLayers
  };

  // cost_breakdownも更新
  const { error } = await client
    .from('quotation_items')
    .update({
      specifications: updatedSpecs,
      cost_breakdown: sourceBreakdown
      // unit_priceとtotal_priceは計算フィールドなので更新しない
    })
    .eq('id', targetItem.id);

  if (error) {
    console.error('Update failed:', error.message);
  } else {
    console.log('✓ Updated successfully!');
    console.log('Please refresh the admin page (F5) to see changes.');
  }
}

copyBreakdown().catch(console.error);
