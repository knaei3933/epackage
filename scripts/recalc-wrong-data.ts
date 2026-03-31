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
  console.log('=== Wrong Data Recalculation ===\n');

  // 誤ったコスト表示を持つ最新の見積を取得
  const { data: items, error } = await client
    .from('quotation_items')
    .select('id, specifications, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Fetch error:', error.message);
    return;
  }

  // costKRWが小さすぎるもの（古いバグで保存されたもの）を特定
  const wrongItems = items?.filter(item => {
    const fcd = (item.specifications as any)?.film_cost_details;
    if (!fcd?.materialLayerDetails) return false;

    // costKRWが100未満のものは誤った計算
    return fcd.materialLayerDetails.some((layer: any) =>
      layer.costKRW && layer.costKRW < 1000
    );
  }) || [];

  console.log(`Found ${wrongItems.length} items with wrong cost calculations:\n`);

  let successCount = 0;
  for (const item of wrongItems) {
    try {
      const specs = item.specifications as any;
      const materialId = specs.materialId || 'pet_al';
      const thicknessSelection = specs.thicknessSelection || 'medium';
      const filmLayers = getFilmLayers(materialId, thicknessSelection);

      const params = {
        bagTypeId: specs.bagTypeId || 'standup_pouch',
        materialId,
        quantity: item.quantity || 1000,
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
        useFilmCostCalculation: true,  // 【重要】フィルム原価計算を有効化
        markupRate: specs.markupRate || 0.5,
        lossRate: specs.lossRate || 0.4,
      };

      const result = await unifiedPricingEngine.calculateQuote(params);
      const filmCostDetails = result.filmCostDetails;

      if (filmCostDetails) {
        const updatedSpecs = { ...specs, film_cost_details: filmCostDetails };
        const { error: updateError } = await client
          .from('quotation_items')
          .update({ specifications: updatedSpecs })
          .eq('id', item.id);

        if (!updateError) {
          successCount++;
          const firstLayer = filmCostDetails.materialLayerDetails?.[0];
          console.log(`✅ OK ${item.id.substring(0, 8)}`);
          console.log(`   Old cost: ₩${((specs.film_cost_details as any)?.materialLayerDetails?.[0]?.costKRW || 0).toLocaleString()}`);
          console.log(`   New cost: ₩${(firstLayer?.costKRW || 0).toLocaleString()}`);
          console.log(`   Meters: ${filmCostDetails.totalMeters}, Layers: ${filmCostDetails.materialLayerDetails?.length || 0}\n`);
        } else {
          console.error(`❌ FAIL ${item.id} - ${updateError.message}\n`);
        }
      } else {
        console.error(`❌ NO FCD ${item.id}\n`);
      }
    } catch (err: any) {
      console.error(`❌ ERROR ${item.id} - ${err.message}\n`);
    }
  }

  console.log(`\n=== Complete: ${successCount}/${wrongItems.length} updated ===`);
}

main().catch(console.error);
