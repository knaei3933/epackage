import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

config({ path: '.env.local' });

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  console.log('=== Update QT20260331-0053 with Current Settings ===\n');

  // quotationsテーブルからQT20260331-0053を探す
  const { data: quotes, error } = await client
    .from('quotations')
    .select('id, quotation_number')
    .ilike('quotation_number', '%0053%')
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
  console.log('Quote:', quote.quotation_number);

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

    console.log('\n--- Item:', item.id?.substring(0, 8), '---');
    console.log('Quantity:', item.quantity);
    console.log('Bag Type:', specs.bagTypeId);
    console.log('Size:', specs.width, 'x', specs.height, 'x', specs.depth, 'mm');

    console.log('\nCurrent film_cost_details:');
    console.log('- PET density:', specs.film_cost_details?.materialLayerDetails?.[0]?.density);
    console.log('- PET weight:', specs.film_cost_details?.materialLayerDetails?.[0]?.weightKg);

    const params = {
      bagTypeId: specs.bagTypeId,
      materialId: specs.materialId || 'pet_al',
      quantity: item.quantity,
      width: specs.width || 130,
      height: specs.height || 180,
      depth: specs.depth || 30,
      thickness: specs.thickness || 80,
      thicknessSelection: specs.thicknessSelection || 'standard',
      printingColors: specs.printingColors || 4,
      printingType: specs.printingType || 'digital',
      doubleSided: specs.doubleSided || false,
      postProcessingOptions: specs.postProcessingOptions || [],
      useFilmCostCalculation: true,
      markupRate: specs.markupRate || 0.5,
      lossRate: specs.lossRate || 0.4,
      filmLayers: [
        { materialId: 'PET', thickness: 12 },
        { materialId: 'AL', thickness: 7 },
        { materialId: 'PET', thickness: 12 },
        { materialId: 'LLDPE', thickness: 110 }
      ]
    };

    console.log('\nRecalculating with current settings...');
    const result = await unifiedPricingEngine.calculateQuote(params);
    const filmCostDetails = result.filmCostDetails;

    if (filmCostDetails && filmCostDetails.materialLayerDetails) {
      console.log('\nNew film_cost_details:');
      console.log('- PET density:', filmCostDetails.materialLayerDetails[0]?.density);
      console.log('- PET weight:', filmCostDetails.materialLayerDetails[0]?.weightKg);
      console.log('- AL weight:', filmCostDetails.materialLayerDetails[1]?.weightKg);
      console.log('- LLDPE weight:', filmCostDetails.materialLayerDetails[3]?.weightKg);

      const updatedSpecs = { ...specs, film_cost_details: filmCostDetails };

      const { error: updateError } = await client
        .from('quotation_items')
        .update({ specifications: updatedSpecs })
        .eq('id', item.id);

      if (!updateError) {
        console.log('\n✅ Update successful!');
      } else {
        console.error('\n❌ Update failed:', updateError.message);
      }
    }
  }
}

main().catch(console.error);
