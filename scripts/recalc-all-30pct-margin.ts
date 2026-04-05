import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function recalcAllQuotes() {
  console.log('=== 모든 견적 30% 마진으로 재계산 ===\n');

  // Get all recent items (last 100)
  const { data: items, error } = await client
    .from('quotation_items')
    .select('id, quantity, specifications, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${items?.length || 0} items to recalculate\n`);

  let updated = 0;
  let failed = 0;

  for (const item of items || []) {
    const specs = item.specifications as any;

    // Skip if no filmLayers
    if (!specs.filmLayers || specs.filmLayers.length === 0) {
      console.log(`Skipping ${item.id?.substring(0, 8)}: no filmLayers`);
      continue;
    }

    try {
      const params = {
        bagTypeId: specs.bagTypeId,
        materialId: specs.materialId,
        quantity: item.quantity,
        width: specs.width,
        height: specs.height,
        depth: specs.depth,
        thicknessSelection: specs.thicknessSelection || 'standard',
        printingColors: specs.printingColors || 4,
        printingType: specs.printingType || 'digital',
        doubleSided: specs.doubleSided || false,
        postProcessingOptions: specs.postProcessingOptions || [],
        useFilmCostCalculation: true,
        markupRate: 0.3,  // 30% sales margin
        lossRate: specs.lossRate || 0.4,
        filmLayers: specs.filmLayers
      };

      const result = await unifiedPricingEngine.calculateQuote(params);

      // Update database
      const updatedSpecs = { ...specs, film_cost_details: result.filmCostDetails };
      const { error: updateError } = await client
        .from('quotation_items')
        .update({ specifications: updatedSpecs })
        .eq('id', item.id);

      if (!updateError) {
        updated++;
        console.log(`✅ OK ${item.id?.substring(0, 8)} - 제조사 마진: ${result.breakdown.manufacturingMargin ? Math.round(result.breakdown.manufacturingMargin) : 'N/A'}원`);
      } else {
        failed++;
        console.log(`❌ FAIL ${item.id?.substring(0, 8)}`);
      }

    } catch (err: any) {
      failed++;
      console.log(`❌ ERROR ${item.id?.substring(0, 8)}: ${err.message}`);
    }
  }

  console.log(`\n=== Complete: ${updated}/${items?.length} updated, ${failed} failed ===`);
}

recalcAllQuotes().catch(console.error);
