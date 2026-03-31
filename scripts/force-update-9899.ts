import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';
import { MATERIAL_THICKNESS_OPTIONS } from '../src/lib/pricing/core/constants';

config({ path: '.env.local' });

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function parseFilmSpecToLayers(spec: string) {
  const layers: any[] = [];
  const parts = spec.split('+').map(p => p.trim());
  for (const part of parts) {
    const match = part.match(/^([A-Z]+)\s+(\d+)\s*μ?$/);
    if (match) layers.push({ materialId: match[1], thickness: parseInt(match[2], 10) });
  }
  return layers;
}

function getFilmLayers(materialId: string, thicknessSelection?: string) {
  const options = MATERIAL_THICKNESS_OPTIONS[materialId];
  if (!options) return [{ materialId: 'PET', thickness: 12 }, { materialId: 'PE', thickness: 80 }];
  const selected = options.find(opt => opt.id === thicknessSelection);
  if (selected?.specification) return parseFilmSpecToLayers(selected.specification);
  const first = options[0];
  return first?.specification ? parseFilmSpecToLayers(first.specification) : [];
}

async function main() {
  console.log('=== Force Update QT20260330-9899 ===\n');

  // quotationsテーブルからQT20260330-9899を探す
  const { data: quotes, error } = await client
    .from('quotations')
    .select('id, quotation_number')
    .ilike('quotation_number', '%9899%')
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
  console.log('Found quote:', quote.quotation_number);

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

    console.log('\n--- Processing Item:', item.id, '---');
    console.log('Current totalMeters:', specs.film_cost_details?.totalMeters);
    console.log('Quantity:', item.quantity);

    const materialId = specs.materialId || 'pet_al';
    const thicknessSelection = specs.thicknessSelection || 'standard';
    const filmLayers = getFilmLayers(materialId, thicknessSelection);

    const params: any = {
      bagTypeId: specs.bagTypeId,
      materialId,
      quantity: item.quantity, // Use actual quantity from DB
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

    // スプウトパウチ用パラメータ
    if (specs.bagTypeId === 'spout_pouch') {
      params.spoutPosition = specs.spoutPosition;
      params.spoutSize = specs.spoutSize;
    }

    console.log('\nCalculating with params:');
    console.log('- quantity:', params.quantity);
    console.log('- bagTypeId:', params.bagTypeId);
    console.log('- dimensions:', params.width, 'x', params.height, 'x', params.depth);
    console.log('- filmLayers:', filmLayers.length, 'layers');

    const result = await unifiedPricingEngine.calculateQuote(params);
    const filmCostDetails = result.filmCostDetails;

    if (filmCostDetails && filmCostDetails.materialLayerDetails) {
      console.log('\n=== New Film Cost Details ===');
      console.log('- totalMeters:', filmCostDetails.totalMeters);
      console.log('- materialWidthMM:', filmCostDetails.materialWidthMM);
      console.log('- areaM2:', filmCostDetails.areaM2);
      console.log('\nMaterial Layers:');
      for (const layer of filmCostDetails.materialLayerDetails) {
        console.log(`  ${layer.nameJa} ${layer.thicknessMicron}μm`);
        console.log(`    - Cost: ₩${layer.costKRW?.toLocaleString()}`);
        console.log(`    - Meters: ${filmCostDetails.totalMeters}`);
      }

      const updatedSpecs = { ...specs, film_cost_details: filmCostDetails };

      console.log('\nUpdating database...');
      const { error: updateError } = await client
        .from('quotation_items')
        .update({ specifications: updatedSpecs })
        .eq('id', item.id);

      if (!updateError) {
        console.log('✅ Update successful!');
      } else {
        console.error('❌ Update failed:', updateError.message);
      }
    } else {
      console.error('❌ No film cost details returned');
    }
  }
}

main().catch(console.error);
