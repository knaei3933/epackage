import { createServiceClient } from '../src/lib/supabase';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';
import { getDefaultLayers } from '../src/lib/common/film-calculations';

async function testRecalculate() {
  const serviceClient = createServiceClient();

  console.log('Fetching quotation items...');
  const { data: items, error } = await serviceClient
    .from('quotation_items')
    .select('id, specifications, quantity')
    .eq('quotation_id', 'QT20260331-5931');

  console.log('Items found:', items?.length || 0);
  console.log('Error:', error);

  if (error || !items || items.length === 0) {
    console.log('No items found or error occurred');
    return;
  }

  const item = items[0];
  const specs = item.specifications || {};

  console.log('\n=== Specifications ===');
  console.log('Material ID:', specs.materialId);
  console.log('Thickness Selection:', specs.thicknessSelection);
  console.log('Width:', specs.width);
  console.log('Height:', specs.height);
  console.log('Quantity:', item.quantity);

  console.log('\n=== Film Layers (getDefaultLayers) ===');
  const filmLayers = getDefaultLayers(specs.materialId, specs.thicknessSelection);
  console.log(JSON.stringify(filmLayers, null, 2));

  console.log('\n=== Calculating Quote ===');
  const result = await unifiedPricingEngine.calculateQuote({
    bagTypeId: specs.bagTypeId || 'flat_3_side',
    materialId: specs.materialId,
    quantity: item.quantity,
    width: specs.width || 0,
    height: specs.height || 0,
    depth: specs.depth || 0,
    thicknessSelection: specs.thicknessSelection,
    printingColors: specs.printingColors || 1,
    printingType: specs.printingType || 'digital',
    doubleSided: specs.doubleSided || false,
    postProcessingOptions: specs.postProcessingOptions || [],
    filmLayers,
    useFilmCostCalculation: true,
    markupRate: 0.3,
    lossRate: 0.4,
  });

  console.log('\n=== Film Cost Details ===');
  if (result.filmCostDetails?.materialLayerDetails) {
    console.log(`Material Layers: ${result.filmCostDetails.materialLayerDetails.length}`);
    for (const layer of result.filmCostDetails.materialLayerDetails) {
      console.log(`  ${layer.materialId}: weight=${layer.weightKg}kg, cost=₩${layer.costKRW.toLocaleString()}`);
    }
  }
  console.log('Total Meters:', result.filmCostDetails?.totalMeters);
  console.log('Material Width (mm):', result.filmCostDetails?.materialWidthMM);
  console.log('Total Weight:', result.filmCostDetails?.totalWeight);
}

testRecalculate().catch(console.error);
