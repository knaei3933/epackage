import { createClient } from '@supabase/supabase-js';
import { createServiceClient } from '../src/lib/supabase';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';
import { MATERIAL_THICKNESS_OPTIONS } from '../src/lib/pricing/core/constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const serviceClient = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : createServiceClient();

function parseFilmSpecToLayers(spec) {
  const layers = [];
  const parts = spec.split('+').map(p => p.trim());
  for (const part of parts) {
    const match = part.match(/^([A-Z]+)\s+(\d+)\s*μ?$/);
    if (match) {
      layers.push({ materialId: match[1], thickness: parseInt(match[2], 10) });
    }
  }
  return layers;
}

function getFilmLayers(materialId, thicknessSelection) {
  const options = MATERIAL_THICKNESS_OPTIONS[materialId];
  if (!options) return [{ materialId: 'PET', thickness: 12 }, { materialId: 'PE', thickness: 80 }];
  const selected = options.find(opt => opt.id === thicknessSelection);
  if (selected?.specification) return parseFilmSpecToLayers(selected.specification);
  const first = options[0];
  return first?.specification ? parseFilmSpecToLayers(first.specification) : [];
}

async function main() {
  console.log('=== Recalculate All Quotations ===');

  const { data: items, error } = await serviceClient
    .from('quotation_items')
    .select('id, specifications, quantity')
    .limit(50);

  if (error) {
    console.error('Failed to fetch items:', error);
    return;
  }

  const itemsWithoutFCD = items?.filter(item => !item.specifications?.film_cost_details) || [];
  console.log(`Found ${itemsWithoutFCD.length} items without film_cost_details`);

  if (itemsWithoutFCD.length === 0) {
    console.log('All items already have film_cost_details');
    return;
  }

  let successCount = 0;
  for (const item of itemsWithoutFCD) {
    try {
      const specs = item.specifications || {};
      const materialId = specs.materialId || 'pet_pe';
      const thicknessSelection = specs.thicknessSelection || 'medium';
      const filmLayers = getFilmLayers(materialId, thicknessSelection);

      const params = {
        bagTypeId: specs.bagTypeId || 'standup_pouch',
        materialId,
        quantity: item.quantity,
        width: specs.width || 0,
        height: specs.height || 0,
        depth: specs.depth || 0,
        thickness: specs.thickness || 80,
        thicknessSelection,
        printingColors: specs.printingColors || 4,
        printingType: specs.printingType || 'digital',
        doubleSided: specs.doubleSided || false,
        postProcessingOptions: specs.postProcessingOptions || [],
        filmLayers,
        useFilmCostCalculation: true,
        markupRate: specs.markupRate || 0.5,
        lossRate: specs.lossRate || 0.4,
      };

      const result = await unifiedPricingEngine.calculateQuote(params);
      const filmCostDetails = result.filmCostDetails;

      if (filmCostDetails) {
        const updatedSpecs = { ...specs, film_cost_details: filmCostDetails };
        const { error: updateError } = await serviceClient
          .from('quotation_items')
          .update({ specifications: updatedSpecs })
          .eq('id', item.id);

        if (!updateError) {
          successCount++;
          console.log(`OK ${item.id.substring(0, 8)}... - totalMeters: ${filmCostDetails.totalMeters}, layers: ${filmCostDetails.materialLayerDetails?.length || 0}`);
        } else {
          console.error(`FAIL ${item.id} - ${updateError.message}`);
        }
      } else {
        console.error(`NO FCD ${item.id}`);
      }
    } catch (err) {
      console.error(`ERROR ${item.id} - ${err.message}`);
    }
  }

  console.log(`\nDone: ${successCount}/${itemsWithoutFCD.length} updated`);
}

main().catch(console.error);
