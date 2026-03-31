import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(supabaseUrl, supabaseKey);

const { unifiedPricingEngine } = await import('../src/lib/unified-pricing-engine.ts');
const { MATERIAL_THICKNESS_OPTIONS } = await import('../src/lib/pricing/core/constants.ts');

function parseFilmSpecToLayers(spec) {
  const layers = [];
  const parts = spec.split('+').map(p => p.trim());
  for (const part of parts) {
    const match = part.match(/^([A-Z]+)\s+(\d+)\s*μ?$/);
    if (match) layers.push({ materialId: match[1], thickness: parseInt(match[2], 10) });
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
  const quoteId = 'QT20260330-2818';
  
  const { data: items, error } = await client
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quoteId);

  if (error) {
    console.error('Fetch error:', error.message);
    return;
  }

  console.log('Found', items?.length || 0, 'items for', quoteId);

  for (const item of items || []) {
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
        console.log('Item', item.id.substring(0, 8));
        console.log('  totalMeters:', filmCostDetails.totalMeters);
        console.log('  layers:', filmCostDetails.materialLayerDetails?.length || 0);
        
        if (filmCostDetails.materialLayerDetails) {
          for (const layer of filmCostDetails.materialLayerDetails) {
            console.log(`    ${layer.nameJa}: ${layer.weightKg}kg x ₩${layer.unitPriceKRW}/kg`);
          }
        }

        const updatedSpecs = { ...specs, film_cost_details: filmCostDetails };
        const { error: updateError } = await client
          .from('quotation_items')
          .update({ specifications: updatedSpecs })
          .eq('id', item.id);

        if (!updateError) {
          console.log('  ✓ Updated successfully');
        } else {
          console.error('  ✗ Update failed:', updateError.message);
        }
      } else {
        console.error('NO FCD for item', item.id);
      }
    } catch (err) {
      console.error('ERROR', item.id, '-', err.message);
    }
  }

  console.log('Done. Please refresh the admin page.');
}

main().catch(console.error);
