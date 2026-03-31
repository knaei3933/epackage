import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

config({ path: '.env.local' });

async function main() {
  console.log('=== QT20260330-3673 SKU Calculation Debug ===\n');

  // QT20260330-3673のパラメータを再現
  const params = {
    bagTypeId: 'spout_pouch',
    materialId: 'pet_al',
    quantity: 5000,
    width: 130,
    height: 130,
    depth: 0,
    thickness: 80,
    thicknessSelection: 'standard',
    printingColors: 4,
    printingType: 'digital',
    doubleSided: false,
    postProcessingOptions: [],
    useFilmCostCalculation: true,
    markupRate: 0.5,
    lossRate: 0.4,
    filmLayers: [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 80 }
    ]
  };

  console.log('Input Parameters:');
  console.log('- quantity:', params.quantity);
  console.log('- dimensions:', params.width, 'x', params.height, 'x', params.depth);
  console.log('- filmLayers:', params.filmLayers);
  console.log('');

  const result = await unifiedPricingEngine.calculateQuote(params);

  console.log('\n=== Result ===');
  console.log('totalMeters:', result.filmCostDetails?.totalMeters);
  console.log('materialWidthMM:', result.filmCostDetails?.materialWidthMM);
  console.log('areaM2:', result.filmCostDetails?.areaM2);
  console.log('');

  if (result.filmCostDetails?.materialLayerDetails) {
    console.log('Material Layers:');
    for (const layer of result.filmCostDetails.materialLayerDetails) {
      console.log(`  ${layer.nameJa} ${layer.thicknessMicron}μm`);
      console.log(`    - weightKg: ${layer.weightKg}`);

      if (layer.materialId === 'PET' && layer.thicknessMicron === 12) {
        // 手計算
        const expected = (layer.thicknessMicron / 1000000) * layer.widthM * layer.meters * layer.density * 1000;
        console.log(`    - widthM: ${layer.widthM}`);
        console.log(`    - meters: ${layer.meters}`);
        console.log(`    - density: ${layer.density}`);
        console.log(`    - Expected: ${expected.toFixed(4)}kg`);
        console.log(`    - Difference: ${(layer.weightKg - expected).toFixed(4)}kg`);
      }
    }
  }

  console.log('\n=== Cost Breakdown ===');
  console.log('Film Cost:', result.breakdown?.filmCost);
  console.log('Total Price:', result.totalPrice);
}

main().catch(console.error);
