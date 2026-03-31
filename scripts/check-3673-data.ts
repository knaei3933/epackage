import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  // quotationsテーブルからQT20260330-3673を探す
  const { data: quotes, error } = await client
    .from('quotations')
    .select('id, quotation_number')
    .ilike('quotation_number', '%3673%')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!quotes || quotes.length === 0) {
    console.log('No quotation found');
    return;
  }

  const quote = quotes[0];
  console.log('========================================');
  console.log('QT20260330-3673 Analysis:');
  console.log('========================================');
  console.log('Quote:', quote.quotation_number, 'ID:', quote.id);

  // quotation_itemsを取得
  const { data: items, error: itemsError } = await client
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  if (itemsError) {
    console.error('Error:', itemsError);
    return;
  }

  for (const item of items || []) {
    const specs = item.specifications as any;
    const fcd = specs.film_cost_details;

    console.log('\n--- Item:', item.id?.substring(0, 8), '---');
    console.log('Quantity:', item.quantity);
    console.log('Bag Type:', specs.bagTypeId);
    console.log('Size:', specs.width, 'x', specs.height, 'x', specs.depth, 'mm');
    console.log('Material:', specs.materialId);
    console.log('');

    if (fcd) {
      console.log('Film Cost Details:');
      console.log('- totalMeters:', fcd.totalMeters);
      console.log('- materialWidthMM:', fcd.materialWidthMM);
      console.log('- areaM2:', fcd.areaM2);
      console.log('');

      // 期待値の計算
      const expectedWeightPET = fcd.totalMeters * (fcd.materialWidthMM / 1000) * 0.000012 * 1.40 * 1000;
      console.log('Expected PET Weight (12μm):');
      console.log('  Formula: meters × width(m) × thickness(m) × density × 1000');
      console.log(`  ${fcd.totalMeters} × ${(fcd.materialWidthMM / 1000).toFixed(3)} × 0.000012 × 1.40 × 1000`);
      console.log('  =', expectedWeightPET.toFixed(4), 'kg');
      console.log('');

      console.log('Material Layers:');
      if (fcd.materialLayerDetails) {
        for (let i = 0; i < fcd.materialLayerDetails.length; i++) {
          const layer = fcd.materialLayerDetails[i];
          console.log(`  ${i + 1}. ${layer.nameJa} ${layer.thicknessMicron}μm`);
          console.log(`     - Actual Weight: ${layer.weightKg}kg`);
          console.log(`     - Cost: ₩${layer.costKRW?.toLocaleString()}`);
          console.log(`     - Area: ${layer.areaM2}m²`);
          console.log(`     - Meters: ${layer.meters}m`);

          if (layer.materialId === 'PET' && layer.thicknessMicron === 12) {
            const diff = layer.weightKg - expectedWeightPET;
            const diffPercent = (diff / expectedWeightPET) * 100;
            console.log(`     - Expected: ${expectedWeightPET.toFixed(4)}kg`);
            console.log(`     - Difference: ${diff.toFixed(4)}kg (${diffPercent.toFixed(2)}%)`);
          }
        }
      }
    }
  }
}

main().catch(console.error);
