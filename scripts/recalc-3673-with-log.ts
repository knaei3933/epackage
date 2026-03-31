import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { filmCalculator } from '../src/lib/film-cost-calculator';
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
  console.log('=== QT20260330-3673 Recalculation with Full Log ===\n');

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

    console.log('\n--- Processing Item:', item.id?.substring(0, 8), '---');
    console.log('Quantity:', item.quantity);
    console.log('Bag Type:', specs.bagTypeId);
    console.log('Size:', specs.width, 'x', specs.height, 'x', specs.depth, 'mm');
    console.log('Material:', specs.materialId);
    console.log('Current totalMeters:', specs.film_cost_details?.totalMeters);

    const materialId = specs.materialId || 'pet_al';
    const thicknessSelection = specs.thicknessSelection || 'standard';
    const filmLayers = getFilmLayers(materialId, thicknessSelection);

    console.log('\nFilm Layers:', filmLayers);
    console.log('Material Width (from specs):', specs.materialWidth || 'using calculation');

    // film-cost-calculatorを直接使用
    const materialWidth = specs.materialWidth || 590; // mm
    const totalMeters = specs.film_cost_details?.totalMeters || 1050;

    const result = filmCalculator.calculateCost({
      materialWidth,
      length: totalMeters,
      layers: filmLayers,
      printingColors: specs.printingColors || 4,
      printingType: specs.printingType || 'digital',
      lossRate: specs.lossRate || 0.4
    });

    console.log('\n=== Film Cost Result ===');
    console.log('totalMeters:', result.totalMeters);
    console.log('materialWidthMM:', result.materialWidthMM);
    console.log('areaM2:', result.areaM2);
    console.log('\nMaterial Layers:');
    for (const layer of result.materialLayerDetails) {
      console.log(`  ${layer.nameJa} ${layer.thicknessMicron}μm`);
      console.log(`    - weightKg: ${layer.weightKg}`);
      console.log(`    - density: ${layer.density}`);
      console.log(`    - widthM: ${layer.widthM}`);
      console.log(`    - meters: ${layer.meters}`);

      if (layer.materialId === 'PET' && layer.thicknessMicron === 12) {
        // 手計算で確認
        const expectedWeight = (layer.thicknessMicron / 1000000) * layer.widthM * layer.meters * layer.density * 1000;
        console.log(`    - Expected (calculated): ${expectedWeight.toFixed(4)}kg`);
        console.log(`    - Difference: ${(layer.weightKg - expectedWeight).toFixed(4)}kg`);
      }
    }
  }
}

main().catch(console.error);
